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