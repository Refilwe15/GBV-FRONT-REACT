from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import requests
import random
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/support-chatbot", tags=["Support Chatbot"])

# === CONFIG ===
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL_NAME = "llama-3.1-8b-instant"

# === RESOURCES & RESPONSES ===
SUPPORT_RESOURCES = {
    "GBV Helpline": "0800 428 428",
    "Police Emergency": "10111",
    "Childline SA": "0800 055 555",
    "Stop Gender Violence": "0800 150 150",
    "Lifeline SA": "0861 322 322",
    "SMS (hearing impaired)": "Send 'help' to 31531",
}

ENCOURAGEMENTS = [
    "You're showing strength just by reaching out.",
    "That sounds really difficult — I’m here to listen and support you.",
    "You don’t deserve what’s happening. You deserve to feel safe.",
    "I can tell this isn’t easy to talk about. You’re doing the right thing.",
]


# === SCHEMAS ===
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


# === CHAT FUNCTION ===
def generate_supportive_reply(user_message: str):
    """
    Sends user's message to Groq and generates a warm, human-like supportive response.
    """
    try:
        system_prompt = f"""
        You are a warm, emotionally intelligent support assistant trained to help people 
        who may be experiencing abuse, trauma, or distress. 
        You are based in South Africa and understand the local context.

        Guidelines:
        - Respond like a kind human being, not a robot.
        - Be natural, empathetic, and conversational.
        - If the message clearly mentions danger, violence, or abuse, 
          include one or two local helplines below at the END of your message.
        - If the message is casual or non-emergency (e.g., “what is an apple?”), 
          just respond like a normal person — don’t mention helplines.

        South African Helplines:
        {', '.join([f"{k}: {v}" for k, v in SUPPORT_RESOURCES.items()])}

        Example of good tone:
        - “That sounds really painful, but I’m proud you spoke up.”
        - “It’s okay to ask questions — I’m here for you.”
        """

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": MODEL_NAME,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "temperature": 0.8,
        }

        response = requests.post(GROQ_URL, headers=headers, json=payload)
        response.raise_for_status()

        data = response.json()
        message = data["choices"][0]["message"]["content"].strip()

        return message

    except Exception as e:
        print("Support Chatbot Error:", e)
        fallback = random.choice(ENCOURAGEMENTS)
        return f"{fallback}\nIf you ever need urgent help, you can call {SUPPORT_RESOURCES['GBV Helpline']}."


# === ROUTE ===
@router.post("/", response_model=ChatResponse)
async def chat_with_support_bot(request: ChatRequest):
    """
    Support chatbot that provides comforting and helpful replies.
    """
    try:
        reply = generate_supportive_reply(request.message)
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
