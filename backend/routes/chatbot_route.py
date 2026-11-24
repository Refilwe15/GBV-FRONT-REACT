from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import random
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

router = APIRouter(prefix="/support-chatbot", tags=["Support Chatbot"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL_NAME = "llama-3.1-8b-instant"

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
    "That sounds really difficult — I'm here to listen and support you.",
    "You don't deserve what's happening. You deserve to feel safe.",
    "I can tell this isn't easy to talk about. You're doing the right thing.",
]

CRISIS_KEYWORDS = [
    "abuse",
    "abused",
    "hit",
    "hurt",
    "violence",
    "violent",
    "rape",
    "assault",
    "danger",
    "afraid",
    "scared",
    "help me",
    "emergency",
    "gbv",
    "beaten",
    "threat",
    "suicide",
    "kill",
]


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


def _local_supportive_reply(user_message: str) -> str:
    text = (user_message or "").strip().lower()
    if not text:
        return "I'm here with you. Tell me what's on your mind whenever you're ready."

    crisis = any(k in text for k in CRISIS_KEYWORDS)
    encouragement = random.choice(ENCOURAGEMENTS)

    if crisis:
        helplines = "\n".join(
            [
                f"• {SUPPORT_RESOURCES['GBV Helpline']} (GBV Helpline)",
                f"• {SUPPORT_RESOURCES['Police Emergency']} (Police)",
                f"• {SUPPORT_RESOURCES['Lifeline SA']} (Lifeline)",
            ]
        )
        return (
            f"{encouragement}\n\n"
            f"If you are in immediate danger, please get to a safe place and contact help:\n"
            f"{helplines}\n\n"
            f"You can also keep talking to me here — I'm listening."
        )

    if any(w in text for w in ["hello", "hi", "hey", "sawubona"]):
        return (
            "Hi — I'm glad you're here. I'm a support assistant for people dealing with "
            "gender-based violence and related distress. What's going on today?"
        )

    if "thank" in text:
        return "You're welcome. You've taken a brave step by reaching out. I'm still here if you need me."

    return (
        f"{encouragement}\n\n"
        f"I hear you. Can you tell me a bit more about what you're experiencing, "
        f"or what kind of support would help right now?"
    )


def generate_supportive_reply(user_message: str):
    if not GROQ_API_KEY:
        return _local_supportive_reply(user_message)

    try:
        import requests

        system_prompt = f"""
        You are a warm, emotionally intelligent support assistant trained to help people
        who may be experiencing abuse, trauma, or distress.
        You are based in South Africa and understand the local context.

        Guidelines:
        - Respond like a kind human being, not a robot.
        - Be natural, empathetic, and conversational.
        - If the message clearly mentions danger, violence, or abuse,
          include one or two local helplines below at the END of your message.
        - If the message is casual or non-emergency, respond normally — don't mention helplines.

        South African Helplines:
        {', '.join([f"{k}: {v}" for k, v in SUPPORT_RESOURCES.items()])}
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

        response = requests.post(GROQ_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print("Support Chatbot Error:", e)
        return _local_supportive_reply(user_message)


@router.post("/", response_model=ChatResponse)
@router.post("", response_model=ChatResponse)
async def chat_with_support_bot(request: ChatRequest):
    try:
        reply = generate_supportive_reply(request.message)
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
