# 🔑 Hướng dẫn lấy Gemini API Key (MIỄN PHÍ)

## Bước 1: Truy cập Google AI Studio
👉 https://aistudio.google.com/apikey

## Bước 2: Đăng nhập bằng tài khoản Google

## Bước 3: Nhấn "Create API Key"
- Chọn project (hoặc tạo mới)
- Copy API key

## Bước 4: Dán vào file `.env`
```env
GEMINI_API_KEY=AIzaSy...your_key_here
```

## Bước 5: Khởi động lại backend
```bash
python main.py
```

## ✅ Ưu điểm Gemini:
- ✓ MIỄN PHÍ (1500 requests/ngày)
- ✓ Vision API mạnh (phân tích ảnh)
- ✓ Không cần nạp tiền

## ❌ Hạn chế:
- ✗ KHÔNG có image generation (không tạo ảnh được)
- ✗ Chỉ dùng để phân tích áo

## 🔄 Luồng hoạt động hiện tại:
1. **Gemini Vision** → Phân tích áo (miễn phí)
2. **Groq Vision** → Fallback nếu Gemini lỗi
3. **OpenAI Vision** → Fallback cuối cùng
4. **Tạo ảnh**: Vẫn cần OpenAI DALL-E (trả phí) hoặc HuggingFace
