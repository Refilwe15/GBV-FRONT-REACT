from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base,get_db
from fastapi.responses import JSONResponse
from routes import user_routes, auth_routes,incident_routes,chat_routes,chatbot_route
import uvicorn
from twilio.rest import Client
from pydantic import BaseModel
import librosa
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
import os
import shutil
from pydub import AudioSegment
from models import VoiceNote


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Twilio settings
TWILIO_SID = "ACb96c08ad37433c682164c7e2b651e96a"
TWILIO_TOKEN = "1d6860dec2f9a69af5f46c24824257c9"
FROM_WHATSAPP = "whatsapp:+14155238886"  # Twilio Sandbox Number
TO_WHATSAPP = "whatsapp:+27763951934"     # Recipient number

client = Client(TWILIO_SID, TWILIO_TOKEN)
app = FastAPI()

# ✅ CORS for React Native / Expo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your mobile IP later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create DB tables on startup
@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Include the router
app.include_router(user_routes.router)



app.include_router(user_routes.router)
app.include_router(auth_routes.router)
app.include_router(incident_routes.router)
app.include_router(chat_routes.router)
app.include_router(chatbot_route.router)




class Location(BaseModel):
    latitude: float
    longitude: float
    phone:str
    
@app.post("/contact")
async def sos_alert(location: Location):
    print(location.phone)
    latitude = location.latitude
    longitude = location.longitude
    location_url = f"https://www.google.com/maps?q={latitude},{longitude}"
    account_sid = TWILIO_SID
    auth_token = TWILIO_TOKEN

    if not account_sid or not auth_token:
        return {"error": "Twilio credentials not set"}

    client = Client(account_sid, auth_token)

    message = client.messages.create(
        from_='whatsapp:+14155238886',
        body=f'hi refilwe you have an emergency alert  Location: {location_url}',
        to='whatsapp:'+location.phone
        
    )

    return {"message_sid": message.sid}





# ====== ROUTES ======
@app.post("/upload-voice")
async def upload_voice(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    try:
        # 1️⃣ Save file locally
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # 2️⃣ Analyze stress level
        y, sr = librosa.load(file_path)
        energy = float(np.mean(librosa.feature.rms(y=y)))
        pitch = float(np.mean(librosa.yin(y, fmin=50, fmax=300, sr=sr)))

        if energy > 0.03 and pitch > 200:
            stress_level = "High Stress"
        elif energy > 0.02:
            stress_level = "Moderate Stress"
        else:
            stress_level = "Low/No Stress"

        # 3️⃣ Store metadata in DB
        file_url = f"http://localhost:8000/uploads/{file.filename}"  # for your app to fetch later
        voice_note = VoiceNote(
            file_name=file.filename,
            file_url=file_url,
            stress_level=stress_level,
            energy=energy,
            pitch=pitch,
        )
        db.add(voice_note)
        await db.commit()
        await db.refresh(voice_note)

        # 4️⃣ Send WhatsApp text via Twilio (no media)
        message = client.messages.create(
            from_=FROM_WHATSAPP,
            to=TO_WHATSAPP,
            body=f"🚨 Stress detected!\nLevel: {stress_level}\nEnergy: {energy:.4f}\nPitch: {pitch:.2f} Hz"
        )
        print(f"✅ WhatsApp sent: {message.sid}")

        return JSONResponse({
            "message": "Voice uploaded and analyzed successfully!",
            "stress_level": stress_level,
            "file_url": file_url,
        })

    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)