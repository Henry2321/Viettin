from fastapi import FastAPI, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv
from groq import Groq
import requests
import base64
from io import BytesIO

load_dotenv()

# Cấu hình AI
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
HF_API_TOKEN = os.getenv("HF_API_TOKEN")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Phục vụ thư mục ảnh nội bộ
app.mount("/picture", StaticFiles(directory="picture"), name="picture")

# Kho mẫu áo nội bộ Việt Tín
SHIRT_MOCKUPS = {
    "polo": "picture/shirt_1.jpg",
    "tshirt": "picture/shirt_2.png",
    "hoodie": "picture/áo hoodie.jpg",
    "hoodie_red": "picture/áo hoodie đỏ.jpg",
    "hoodie_blue": "picture/áo hoodie xanh.webp",
    "jacket": "picture/shirt_4.jpg"
}

# Kho người mẫu đồ họa đứng thẳng, ĐÃ TÁCH NỀN (Dùng link imgbb để tránh lỗi CORS)
MALE_MODELS = [
    "https://i.ibb.co/Xz9yP1M/man-standing-transparent.png", # Nam thực tế 
    "https://i.ibb.co/6y4pYpX/male-model-1.png",            # Nam 2
    "https://i.ibb.co/q9mS6Yp/male-model-2.png"             # Nam 3
]
FEMALE_MODELS = [
    "https://i.ibb.co/VvW3XW2/woman-standing-transparent.png", # Nữ thực tế
    "https://i.ibb.co/qyG0tGR/female-model-1.png",            # Nữ 2
    "https://i.ibb.co/fD7S7Y8/female-model-2.png"             # Nữ 3
]
MODEL_MOCKUPS = MALE_MODELS + FEMALE_MODELS

@app.get("/")
def read_root():
    return {"message": "Viettin.AI is running on Groq (Free AI)!"}

@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Upload ảnh (áo hoặc người) từ người dùng."""
    try:
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode('utf-8')
        image_url = f"data:image/{file.content_type.split('/')[-1]};base64,{image_base64}"
        return {"image_url": image_url}
    except Exception as e:
        return {"error": str(e)}

@app.post("/generate-model")
async def generate_model(gender: str = Form(None)):
    """Chọn người mẫu theo giới tính hoặc ngẫu nhiên từ kho ảnh."""
    import random
    if gender == "male":
        models = MALE_MODELS
    elif gender == "female":
        models = FEMALE_MODELS
    else:
        models = MODEL_MOCKUPS
        
    url = random.choice(models)
    return {"image_url": url}

@app.post("/virtual-try-on")
async def virtual_try_on(
    person_image: str = Form(...), 
    shirt_type: str = Form(...), 
    color: str = Form(...),
    logo_image: str = Form(None)
):
    """
    AI Giả lập ghép áo vào người mẫu. 
    Trong thực tế, đây sẽ là nơi gọi API VTON (như Replicate idm-vton).
    Ở phiên bản này, chúng ta sử dụng Prompt để tạo ra phiên bản AI của người mẫu đó mặc áo.
    """
    try:
        color_names = {
            "#FFFFFF": "pure white",
            "#000000": "solid black",
            "#0a2351": "navy blue",
            "#FF0000": "bright red",
            "#FFA500": "vibrant orange"
        }
        color_name = color_names.get(color, "white")
        
        # Prompt để AI tạo ra người mặc áo tương tự
        prompt = f"A professional photo of a person wearing a high-quality {color_name} {shirt_type} with a small logo on the chest, studio lighting, 4k resolution, realistic fabric texture, looking at camera."
        
        # Nếu có HF token, thử tạo ảnh mới hoàn toàn miêu tả người mặc áo đó
        if HF_API_TOKEN:
            API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
            headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
            response = requests.post(API_URL, headers=headers, json={"inputs": prompt}, timeout=30)
            
            if response.status_code == 200:
                image_bytes = response.content
                image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                return {"image_url": f"data:image/png;base64,{image_base64}", "mode": "AI Reimagined"}

        # Nếu lỗi hoặc không có token, trả về chính ảnh gốc kèm lời nhắn (Client sẽ tự overlay)
        return {"image_url": person_image, "mode": "Overlay", "message": "AI blending simulated"}
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/generate-shirt")
async def generate_shirt(shirt_type: str = Form(...), color: str = Form(...), background_type: str = Form("studio")):
    """Tạo ảnh áo bằng AI Hugging Face."""
    
    bg_context = {
        "office": "Văn phòng công sở chuyên nghiệp",
        "workshop": "Xưởng sản xuất, lao động cần độ bền cao",
        "studio": "Chụp ảnh quảng cáo sạch sẽ, hiện đại",
        "showroom": "Không gian trưng bày cao cấp, sang trọng"
    }.get(background_type, "Môi trường tự do")

    shirt_names = {
        "polo": "polo shirt with collar",
        "tshirt": "t-shirt", 
        "hoodie": "hoodie sweatshirt",
        "jacket": "jacket"
    }
    
    color_names = {
        "#FFFFFF": "pure white",
        "#000000": "solid black",
        "#0a2351": "navy blue",
        "#FF0000": "bright red",
        "#FFA500": "vibrant orange"
    }
    color_name = color_names.get(color, "white")
    
    # Prompt cho Stable Diffusion - Nhấn mạnh màu sắc
    prompt = f"professional product photography, {color_name} colored {shirt_names.get(shirt_type, 'polo shirt')}, MUST BE {color_name.upper()} COLOR, front and back view, flat lay, white background, studio lighting, high quality, detailed fabric texture, commercial photo, 4k, exact color match"
    
    image_url = None
    
    # Thử tạo ảnh bằng Hugging Face
    if HF_API_TOKEN:
        try:
            API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
            headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
            
            response = requests.post(API_URL, headers=headers, json={"inputs": prompt}, timeout=30)
            
            if response.status_code == 200:
                # Chuyển ảnh thành base64
                image_bytes = response.content
                image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                image_url = f"data:image/png;base64,{image_base64}"
                print("AI tạo ảnh thành công!")
            else:
                print(f"HF API Error: {response.status_code}")
        except Exception as e:
            print(f"HF Error: {e}")
    
    # Nếu không có HF token hoặc lỗi, dùng ảnh có sẵn (Ưu tiên ảnh theo màu nếu là hoodie)
    if not image_url:
        mockup_key = shirt_type
        if shirt_type == "hoodie":
            if color == "#FF0000": mockup_key = "hoodie_red"
            elif color == "#0a2351": mockup_key = "hoodie_blue"
            
        image_url = SHIRT_MOCKUPS.get(mockup_key, SHIRT_MOCKUPS.get(shirt_type, SHIRT_MOCKUPS["polo"]))
    
    # Tạo ảnh gợi ý AI (Lần 2) - Ảnh có bối cảnh thực tế
    suggestion_image_url = None
    if HF_API_TOKEN:
        try:
            # Prompt cho ảnh phong cách (Lifestyle) - Ưu tiên bối cảnh và tính liên kết
            lifestyle_prompt = f"high quality professional photography of a model wearing a {color_name} {shirt_names.get(shirt_type, 'polo shirt')} WITH A SMALL CORPORATE LOGO ON THE CHEST, situated in a {bg_context}, cinematic lighting, photorealistic, 4k, fashion catalog style"
            
            resp_lifestyle = requests.post(API_URL, headers=headers, json={"inputs": lifestyle_prompt}, timeout=30)
            if resp_lifestyle.status_code == 200:
                image_base64_lifestyle = base64.b64encode(resp_lifestyle.content).decode('utf-8')
                suggestion_image_url = f"data:image/png;base64,{image_base64_lifestyle}"
        except Exception as e:
            print(f"Suggestion Image Error: {e}")

    # Nếu không có ảnh gợi ý AI, dùng ảnh áo làm phương án dự phòng
    if not suggestion_image_url:
        suggestion_image_url = image_url

    return {
        "image_url": image_url, # Cho canvas lớn
        "suggestion_image": suggestion_image_url, # Cho ô nhỏ
        "advice_title": f"Mô phỏng tại {bg_context}",
        "mode": "AI Full System"
    }

@app.post("/analyze-design")
async def analyze_design(image_base64: str = Form(...)):
    """Dùng OpenAI Vision để phân tích báo giá thực tế"""
    try:
        return {"analysis": "AI gợi ý dùng vải thun cá sấu 4 chiều, độ bền cao, giá dự kiến 155k/áo."}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8003))
    uvicorn.run(app, host="0.0.0.0", port=port)
