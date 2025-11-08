from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models import Incident
from schemas import IncidentCreate, IncidentOut
import shutil
import os
from uuid import uuid4
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.future import select
from sqlalchemy.orm import Session
from database import get_db

from typing import List


router = APIRouter(prefix="/incidents", tags=["Incidents"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=IncidentOut)
async def report_incident(
    location: str = Form(...),
    description: str = Form(...),
    anonymous: bool = Form(False),
    reporter_email: str = Form(None),
    attachment: UploadFile = File(None),
    db: AsyncSession = Depends(get_db)
):
    file_path = None
    if attachment:
        filename = f"{uuid4().hex}_{attachment.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(attachment.file, buffer)

    incident = Incident(
        location=location,
        description=description,
        anonymous=anonymous,
        reporter_email=None if anonymous else reporter_email,
        attachment=file_path
    )

    db.add(incident)
    await db.commit()
    await db.refresh(incident)
    return incident


# NEW: GET endpoint to fetch reports for a specific user
@router.get("/", response_model=List[IncidentOut])
async def get_user_reports(
    reporter_email: str = Query(...),
    db: Session = Depends(get_db)
):
    result = await db.execute(select(Incident).where(Incident.reporter_email == reporter_email))
    incidents = result.scalars().all()
    return incidents


@router.get("/all-incidents", response_model=List[IncidentOut])
async def get_reports(
  
    db: Session = Depends(get_db)
):
    result = await db.execute(select(Incident))
    incidents = result.scalars().all()
    return incidents



from schemas import IncidentOutt
import os
import requests
from dotenv import load_dotenv

load_dotenv()



GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL_NAME = "llama-3.1-8b-instant"

CATEGORIES = ["sexual abuse", "physical abuse", "emotional abuse", "child abuse"]


def classify_with_groq(description: str):
    """
    Send text to Groq model and classify it into a GBV category
    """
    try:
        prompt = f"""
        Classify the following incident description into ONE of these categories:
        {', '.join(CATEGORIES)}.

        Description: "{description}"

        Respond ONLY with a JSON object in this format:
        {{"category": "<one_of_categories>", "confidence": <0-1 float>}}
        """

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": MODEL_NAME,
            "messages": [
                {
                    "role": "system",
                    "content": "You are an AI model that classifies GBV incidents accurately.",
                },
                {"role": "user", "content": prompt},
            ],
        }

        response = requests.post(GROQ_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()

        message = data["choices"][0]["message"]["content"].strip()

        # Attempt to parse the model response
        import json
        result = json.loads(message)
        category = result.get("category", "unknown").lower()
        confidence = float(result.get("confidence", 0.0))

        # Ensure category matches our list
        if category not in CATEGORIES:
            category = "unknown"

        return category, confidence

    except Exception as e:
        print(f"Groq classification error: {e}")
        return "unknown", 0.0


@router.get("/classified-incidents", response_model=List[IncidentOutt])
async def get_classified_incidents(db: Session = Depends(get_db)):
    """
    Fetch all incidents and classify each one using the Groq API (Llama 3.1).
    """
    result = await db.execute(select(Incident))
    incidents = result.scalars().all()
    if not incidents:
        raise HTTPException(status_code=404, detail="No incidents found")

    classified_incidents = []

    for incident in incidents:
        desc = incident.description or ""
        category, confidence = classify_with_groq(desc)

        classified_incidents.append({
            "id": incident.id,
            "location": incident.location,
            "description": incident.description,
            "anonymous": incident.anonymous,
            "reporter_email": incident.reporter_email,
            "attachment": incident.attachment,
            "created_at": incident.created_at,
            "status":incident.status,
            "predicted_category": category,
            "confidence": round(confidence, 2),
        })

    return classified_incidents


from fastapi import Path
from sqlalchemy import update

@router.put("/{incident_id}/status", response_model=IncidentOut)
async def update_incident_status(
    incident_id: int = Path(..., description="ID of the incident to update"),
    status: str = Form(..., description="New status of the incident"),
    db: AsyncSession = Depends(get_db)
):
    """
    Update the status of an incident (e.g., pending, resolved, in-progress).
    """
    # Fetch the incident
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Update status
    incident.status = status
    db.add(incident)
    await db.commit()
    await db.refresh(incident)
    return incident
