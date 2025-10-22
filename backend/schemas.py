from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

    class Config:
        from_attributes = True  # replaces orm_mode in Pydantic v2

# ✅ Token schema
class Token(BaseModel):
    access_token: str
    token_type: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

    class Config:
        from_attributes = True




from datetime import datetime

class IncidentCreate(BaseModel):
    location: str
    description: str
    anonymous: bool = False
    reporter_email: Optional[str] = None

class IncidentOut(BaseModel):
    id: int
    location: str
    description: str
    anonymous: bool
    reporter_email: Optional[str]
    attachment: Optional[str]
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True


