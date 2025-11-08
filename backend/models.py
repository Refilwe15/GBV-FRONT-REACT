from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey,Float
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
from sqlalchemy.sql import func


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    type = Column(String,default="user")





class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, nullable=False)
    description = Column(String, nullable=False)
    anonymous = Column(Boolean, default=False)
    reporter_email = Column(String, nullable=True)
    attachment = Column(String, nullable=True)  
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String,default="pending")


class VoiceNote(Base):
    __tablename__ = "voice_notes"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    stress_level = Column(String, nullable=False)
    energy = Column(Float, nullable=False)
    pitch = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())



class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, nullable=False)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)