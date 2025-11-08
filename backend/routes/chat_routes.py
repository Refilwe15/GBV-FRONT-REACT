from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models import ChatMessage
from schemas import ChatMessageCreate, ChatMessageOut
from typing import List

router = APIRouter(prefix="/chat", tags=["Community Chat"])

@router.post("/", response_model=ChatMessageOut)
async def send_message(message: ChatMessageCreate, db: AsyncSession = Depends(get_db)):
    chat = ChatMessage(user_email=message.user_email, content=message.content)
    db.add(chat)
    await db.commit()
    await db.refresh(chat)
    return chat

@router.get("/", response_model=List[ChatMessageOut])
async def get_messages(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ChatMessage).order_by(ChatMessage.created_at.asc()))
    messages = result.scalars().all()
    return messages
