import sys
import os

os.environ["PYTHONIOENCODING"] = "utf-8"
os.environ["PYTHONUTF8"] = "1"

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

from fastapi import FastAPI, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os
import time
import io
import base64
import requests
from dotenv import load_dotenv
try:
    from google import genai
except ImportError:
    print("Warning: google.genai not installed. Please install: pip install google-genai")
    genai = None

# =========================================
# LOAD ENV
# =========================================

_HERE = os.path.dirname(__file__)
load_dotenv(dotenv_path=os.path.join(_HERE, ".env"), override=True)
load_dotenv(override=True)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
HF_API_TOKEN = os.getenv("HF_API_TOKEN")

gemini_client = None
if genai and GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        print("[INFO] Gemini client initialized successfully")
    except Exception as e:
        print(f"[WARNING] Failed to initialize Gemini client: {e}")
else:
    print("[WARNING] Gemini API key not found or genai not installed")

# =========================================
# FASTAPI INIT
# =========================================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000", 
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://viettin-ai.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.mount("/picture", StaticFiles(directory="picture"), name="picture")

# =========================================
# GEMINI TRYON FUNCTION
# =========================================

def gemini_tryon(
    shirt_bytes: bytes,
    person_bytes: bytes,
    shirt_mime: str,
    person_mime: str,
    logo_bytes: bytes | None = None,
    logo_mime: str | None = None,
    background_bytes: bytes | None = None,
    background_mime: str | None = None
):

    prompt = (
        "You are performing a professional virtual try-on with 4 input images.\n\n"
        "Image 1: SHIRT reference image.\n"
        "Image 2: PERSON image (base to edit).\n"
    )

    image_count = 3
    if logo_bytes:
        prompt += f"Image {image_count}: LOGO image.\n"
        image_count += 1
    
    if background_bytes:
        prompt += f"Image {image_count}: BACKGROUND scene.\n"

    prompt += (
        "\nTask - Combine all 4 images intelligently:\n"
        "1. Replace person's shirt with the exact shirt from Image 1\n"
        "2. Maintain realistic fabric texture, lighting and fit\n"
    )

    if logo_bytes:
        prompt += "3. Add logo onto the shirt's LEFT CHEST area\n"
    
    if background_bytes:
        prompt += "4. Place the person into the background scene naturally\n"
        prompt += "5. Match lighting and perspective between person and background\n"
        prompt += "6. Ensure seamless integration - no cut-out edges\n"
    else:
        prompt += "4. Keep transparent background (PNG format)\n"

    prompt += "\nOutput: Single composite image combining all elements realistically."

    parts = [
        {"text": prompt},
        {
            "inline_data": {
                "mime_type": shirt_mime,
                "data": shirt_bytes
            }
        },
        {
            "inline_data": {
                "mime_type": person_mime,
                "data": person_bytes
            }
        },
    ]

    if logo_bytes:
        parts.append({
            "inline_data": {
                "mime_type": logo_mime or "image/png",
                "data": logo_bytes
            }
        })
    
    if background_bytes:
        parts.append({
            "inline_data": {
                "mime_type": background_mime or "image/png",
                "data": background_bytes
            }
        })

    print("[DEBUG] Images sent - Logo:", logo_bytes is not None, "Background:", background_bytes is not None)

    response = gemini_client.models.generate_content(
        model="gemini-2.5-flash-image",
        contents=[{"role": "user", "parts": parts}],
    )

    if response and response.candidates:
        for part in response.candidates[0].content.parts:
            if hasattr(part, "inline_data") and part.inline_data:
                img_bytes = part.inline_data.data
                return base64.b64encode(img_bytes).decode("utf-8")

    print("[WARNING] No image returned from Gemini")
    return None


# =========================================
# ROUTES
# =========================================

@app.get("/")
def root():
    return {
        "message": "Viettin.AI is running!",
        "status": "healthy",
        "gemini_available": gemini_client is not None,
        "timestamp": time.time()
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "gemini_client": gemini_client is not None,
        "api_key_configured": bool(GEMINI_API_KEY)
    }


@app.post("/ai-tryon")
async def ai_tryon(
    shirt_image: UploadFile = File(...),
    person_image: UploadFile = File(...),
    logo_image: UploadFile = File(None),
    background_image: UploadFile = File(None)
):
    if not gemini_client:
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "error": "Gemini AI service not available. Please check API key configuration."
            }
        )
    
    try:
        shirt_bytes = await shirt_image.read()
        person_bytes = await person_image.read()
        logo_bytes = await logo_image.read() if logo_image else None
        background_bytes = await background_image.read() if background_image else None

        shirt_mime = shirt_image.content_type or "image/png"
        person_mime = person_image.content_type or "image/png"
        logo_mime = logo_image.content_type if logo_image else "image/png"
        background_mime = background_image.content_type if background_image else "image/png"

        print("[INFO] Calling Gemini...")

        result_b64 = gemini_tryon(
            shirt_bytes,
            person_bytes,
            shirt_mime,
            person_mime,
            logo_bytes,
            logo_mime,
            background_bytes,
            background_mime
        )

        if result_b64:
            return {
                "success": True,
                "mode": "gemini",
                "image_url": f"data:image/png;base64,{result_b64}"
            }

        return {
            "success": False,
            "error": "Gemini did not return image"
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )


# =========================================
# RUN SERVER
# =========================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)