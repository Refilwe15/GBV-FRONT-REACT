from pydantic import BaseModel, EmailStr
from typing import Optional



class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    
class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    type: str
   

    class Config:
        orm_mode = True


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    type: str | None = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user_type: Optional[str] = None
    email: Optional[str] = None




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
    status:str

    class Config:
        orm_mode = True



class IncidentOutt(BaseModel):
    id: int
    location: str
    description: str
    anonymous: bool
    reporter_email: Optional[str] = None
    attachment: Optional[str]
    created_at: datetime
    predicted_category: Optional[str] = None
    confidence: Optional[float] = None
    status:str

    class Config:
        orm_mode = True



class ChatMessageCreate(BaseModel):
    user_email: EmailStr
    content: str

class ChatMessageOut(BaseModel):
    id: int
    user_email: EmailStr
    content: str
    created_at: datetime

    class Config:
        orm_mode = True



