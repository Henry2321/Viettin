# 🔧 HƯỚNG DẪN KHẮC PHỤC LỖI BACKEND

## ❌ Lỗi hiện tại: "Backend server không chạy hoặc không thể truy cập"

### 🚀 GIẢI PHÁP 1: Chạy Local (Khuyến nghị)

1. **Khởi động Backend:**
   ```bash
   # Cách 1: Double-click file
   start-backend.bat
   
   # Cách 2: Command line
   cd backend
   python main.py
   ```

2. **Khởi động Frontend:**
   ```bash
   # Cách 1: Double-click file  
   start-frontend.bat
   
   # Cách 2: Command line
   cd frontend
   npm run dev
   ```

3. **Truy cập:** http://localhost:5173

### 🌐 GIẢI PHÁP 2: Deploy Backend lên Vercel

1. **Tạo tài khoản Vercel:** https://vercel.com
2. **Deploy backend:**
   ```bash
   cd backend
   vercel --prod
   ```
3. **Cập nhật API URL trong frontend**

### ⚡ GIẢI PHÁP NHANH

**Chạy lệnh này trong Command Prompt:**
```bash
cd "C:\Users\NGUYEN MINH TRI\OneDrive\Desktop\Viettin"
start-backend.bat
```

**Sau đó mở tab mới và chạy:**
```bash
start-frontend.bat
```

### 🔍 Kiểm tra Backend có chạy:
- Mở: http://localhost:8003
- Nếu thấy `{"message": "Viettin.AI is running!"}` = OK ✅

### 📞 Nếu vẫn lỗi:
1. Kiểm tra Python đã cài: `python --version`
2. Cài dependencies: `pip install -r requirements.txt`
3. Kiểm tra port 8003 có bị chiếm: `netstat -an | findstr 8003`