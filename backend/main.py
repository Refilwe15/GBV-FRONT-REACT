from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base, get_db
from fastapi.responses import JSONResponse
from routes import user_routes, auth_routes, incident_routes, chat_routes, chatbot_route
import uvicorn
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
import os
from pathlib import Path
from dotenv import load_dotenv
import models  # noqa: F401 — register ORM tables before create_all
from models import VoiceNote

# Load backend/.env regardless of cwd
load_dotenv(Path(__file__).resolve().parent / ".env")
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
SOS_LOG_DIR = "sos_alerts"
os.makedirs(SOS_LOG_DIR, exist_ok=True)

TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_SMS_FROM = os.getenv("TWILIO_SMS_FROM", "+16203028561")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


app.include_router(user_routes.router)
app.include_router(auth_routes.router)
app.include_router(incident_routes.router)
app.include_router(chat_routes.router)
app.include_router(chatbot_route.router)

if os.path.isdir(UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


class Location(BaseModel):
    latitude: float
    longitude: float
    phone: str
    message: str


def _normalize_phone(phone: str) -> str:
    """Ensure E.164 style number (no whatsapp: prefix)."""
    phone = (phone or "").strip().replace(" ", "")
    if phone.startswith("whatsapp:"):
        phone = phone.replace("whatsapp:", "", 1)
    if not phone.startswith("+") and phone.isdigit():
        phone = f"+{phone}"
    return phone


def _try_send_sms(phone: str, body: str):
    """Best-effort Twilio SMS send. Returns (ok, detail)."""
    if not TWILIO_SID or not TWILIO_TOKEN:
        return False, "Twilio credentials not configured"
    if not TWILIO_SMS_FROM:
        return False, "TWILIO_SMS_FROM not configured"

    try:
        from twilio.rest import Client

        client = Client(TWILIO_SID, TWILIO_TOKEN)
        to = _normalize_phone(phone)
        msg = client.messages.create(
            from_=TWILIO_SMS_FROM,
            body=body,
            to=to,
        )
        return True, msg.sid
    except Exception as e:
        print("SMS send failed:", e)
        return False, str(e)


def _log_sos(payload: dict):
    import json
    from datetime import datetime

    stamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S_%f")
    path = os.path.join(SOS_LOG_DIR, f"sos_{stamp}.json")
    with open(path, "w") as f:
        json.dump(payload, f, indent=2)
    return path


@app.post("/contact")
async def sos_alert(location: Location):
    latitude = location.latitude
    longitude = location.longitude
    location_url = f"https://www.google.com/maps?q={latitude},{longitude}"
    body = f"{location.message}: {location_url}"

    log_path = _log_sos(
        {
            "phone": location.phone,
            "message": location.message,
            "latitude": latitude,
            "longitude": longitude,
            "maps_url": location_url,
        }
    )

    sent, detail = _try_send_sms(location.phone, body)

    return {
        "ok": True,
        "sms_sent": sent,
        "detail": detail if not sent else "SOS alert recorded and SMS sent",
        "message_sid": detail if sent else None,
        "log": log_path,
        "maps_url": location_url,
    }


@app.post("/upload-voice")
async def upload_voice(
    file: UploadFile = File(...),
    phone: str = Form(...),
    latitude: str = Form(None),
    longitude: str = Form(None),
    message: str = Form(None),
    db: AsyncSession = Depends(get_db),
):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename or "sos_recording.webm")
        with open(file_path, "wb") as f:
            f.write(await file.read())

        stress_level = "Unknown"
        energy = 0.0
        pitch = 0.0

        try:
            import librosa
            import numpy as np

            y, sr = librosa.load(file_path)
            energy = float(np.mean(librosa.feature.rms(y=y)))
            pitch = float(np.mean(librosa.yin(y, fmin=50, fmax=300, sr=sr)))

            if energy > 0.03 and pitch > 200:
                stress_level = "High Stress"
            elif energy > 0.02:
                stress_level = "Moderate Stress"
            else:
                stress_level = "Low/No Stress"
        except Exception as audio_err:
            print("Audio analysis skipped:", audio_err)
            stress_level = "Analysis unavailable"

        file_url = f"/uploads/{os.path.basename(file_path)}"
        voice_note = VoiceNote(
            file_name=os.path.basename(file_path),
            file_url=file_url,
            stress_level=stress_level,
            energy=energy,
            pitch=pitch,
        )
        db.add(voice_note)
        await db.commit()
        await db.refresh(voice_note)

        maps_bit = ""
        if latitude and longitude:
            maps_bit = f"\nLocation: https://www.google.com/maps?q={latitude},{longitude}"

        body = (
            f"🚨 Voice SOS!\nLevel: {stress_level}\n"
            f"Energy: {energy:.4f}\nPitch: {pitch:.2f} Hz"
            f"{maps_bit}"
        )
        if message:
            body = f"{message}\n{body}"

        sent, detail = _try_send_sms(phone, body)
        _log_sos(
            {
                "type": "voice",
                "phone": phone,
                "stress_level": stress_level,
                "file_url": file_url,
                "latitude": latitude,
                "longitude": longitude,
                "message": message,
                "sms_sent": sent,
                "detail": detail,
            }
        )

        return JSONResponse(
            {
                "message": "Voice uploaded successfully!",
                "stress_level": stress_level,
                "file_url": file_url,
                "sms_sent": sent,
                "ok": True,
            }
        )

    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
