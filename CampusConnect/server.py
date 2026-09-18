import os
from fastapi import FastAPI, Request, Form
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from dotenv import load_dotenv

# Load environment variables (like GROQ_API_KEY) from .env file
load_dotenv()

app = FastAPI(title="CampusConnect AI Backend")

# Enable CORS so the browser frontend (HTML/JS) can call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Replace with actual frontend domain
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)

# Initialize Groq client
# Ensure you have your GROQ_API_KEY exported in your environment or in a .env file!
api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY environment variable not set")
client = Groq(api_key=api_key)

SYSTEM_PROMPT = """You are CampusConnect, the official AI Voice Assistant for Raghu Engineering College (REC). Keep answers short (1-2 sentences max) because they are spoken over phone/voice. If information is not in knowledge base, say: 'I apologize, I do not have that detail. Please contact the administration.' Do not use markdown (*, #) or links.

Knowledge Base:
- College: Raghu Engineering College (REC), Visakhapatnam, established 1997 under Raghu Educational Society.
- Location: Dakamarri, Bheemunipatnam Mandal, Visakhapatnam, Andhra Pradesh (~35 km from city).
- Accreditations: JNTUK affiliated, AICTE approved, NAAC A+ grade, NBA accredited.
- Administration: Chairman Sri L.V. Subba Rao, Principal Dr. Ch. Srinivasu, Vice Principal Dr. A. Vijay Kumar, Controller of Exams Dr. E.V.V. Ramana Murthy.
- Programs: B.Tech in CSE, CSE-AIML, CSE-Data Science, CSE-Cyber Security, CSE-IoT, ECE, EEE, Mechanical, Civil; M.Tech and MBA.
- Hostels: Boys hostel (~700 beds), Girls hostel (~450 beds), AC and non-AC rooms, Wi-Fi, mess.
- Food: Two canteens on campus, open 9 AM to 9 PM, Indian and Chinese food.
- Facilities: Central Library, Computer Labs, Specialized Labs, Sports Complex, Gym, Medical Centre, ATM.
- Placements: Top recruiters TCS, Infosys, Wipro, Cognizant, Accenture, Microsoft, Amazon.
- Admissions: AP EAMCET (Code: RGTS), 70% Convener quota, 30% Management quota."""


def get_ai_response(user_input: str) -> str:
    """Helper function to call Groq API"""
    if not user_input:
        return "Hello! I am the CampusConnect AI for Raghu Engineering College. How can I help you today?"
    
    try:
        completion = client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_input}
            ],
            temperature=0.5,
            max_tokens=150,
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return "I am currently experiencing technical difficulties connecting to my brain. Please try again later."


@app.post("/voice")
async def voice_endpoint(SpeechResult: str = Form(default="")):
    """
    ENDPOINT 1: For Twilio Phone Calls
    Twilio sends the user's voice transcript via a POST form field called 'SpeechResult'.
    We must return TwiML (XML) back to Twilio.
    """
    print(f"[Twilio Phone Call] User asked: {SpeechResult}")
    
    # 1. Ask Groq for the answer
    ai_answer = get_ai_response(SpeechResult)
    print(f"[Twilio Phone Call] AI Answer: {ai_answer}")
    
    # 2. Return XML so Twilio speaks the answer and waits for next response
    xml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="Polly.Aditi">{ai_answer}</Say>
    <Gather input="speech" timeout="3" speechTimeout="auto" action="/voice" method="POST" />
</Response>"""
    
    return Response(content=xml_response, media_type="text/xml")


@app.post("/chat")
async def chat_endpoint(request: Request):
    """
    ENDPOINT 2: For the Website (frontend/app.js)
    The website sends URL-encoded form data (from your existing fetch request).
    We extract 'SpeechResult' and return JSON.
    """
    # Parse the incoming form data from app.js
    form_data = await request.form()
    user_input = form_data.get("SpeechResult", "")
    
    print(f"[Website Chat] User asked: {user_input}")
    
    # 1. Ask Groq for the answer
    ai_answer = get_ai_response(user_input)
    print(f"[Website Chat] AI Answer: {ai_answer}")
    
    # 2. Return JSON to the frontend
    return JSONResponse(content={"answer": ai_answer})


@app.get("/")
def read_root():
    return {"message": "CampusConnect Backend is running! Access /voice for Twilio or /chat for frontend."}
