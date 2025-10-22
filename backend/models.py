from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
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





class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, nullable=False)
    description = Column(String, nullable=False)
    anonymous = Column(Boolean, default=False)
    reporter_email = Column(String, nullable=True)
    attachment = Column(String, nullable=True)  # store file path
    created_at = Column(DateTime(timezone=True), server_default=func.now())
