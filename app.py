import sys
import os

os.environ["PYTHONIOENCODING"] = "utf-8"
os.environ["PYTHONUTF8"] = "1"

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Viettin.AI is running!",
        "status": "healthy",
        "timestamp": time.time()
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "api_key_configured": bool(os.getenv("GEMINI_API_KEY"))
    }

@app.post("/generate-shirt")
async def generate_shirt(
    shirt_type: str = Form(...),
    color: str = Form(...),
    background_type: str = Form(None)
):
    # Placeholder response
    return {
        "success": False,
        "error": "Generate shirt feature đang được phát triển"
    }

@app.post("/generate-model")
async def generate_model(gender: str = Form("male")):
    # Placeholder response
    return {
        "success": False,
        "error": "Generate model feature đang được phát triển"
    }

@app.post("/ai-tryon")
async def ai_tryon(
    shirt_image: UploadFile = File(...),
    person_image: UploadFile = File(...),
    logo_image: UploadFile = File(None),
    background_image: UploadFile = File(None)
):
    return {
        "success": False,
        "error": "AI Try-on feature đang được phát triển. Vui lòng chờ update."
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)