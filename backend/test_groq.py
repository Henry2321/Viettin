# -*- coding: utf-8 -*-
import os
import sys
from dotenv import load_dotenv
from groq import Groq

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv()

print("=== KIEM TRA GROQ API (FREE) ===\n")

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    print("X KHONG TIM THAY GROQ_API_KEY trong .env")
    print("\nHay them vao file .env:")
    print("GROQ_API_KEY=gsk_xxxxx")
    print("\nLay key MIEN PHI tai: https://console.groq.com/keys")
    exit(1)
else:
    print(f"OK Tim thay API Key: {api_key[:10]}...{api_key[-5:]}")

try:
    print("\nDang test ket noi Groq...")
    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": "Chao ban, hay tra loi ngan: Ban la ai?"}],
        max_tokens=50
    )
    
    print("OK KET NOI THANH CONG!")
    print(f"\nPhan hoi:\n{response.choices[0].message.content}\n")
    print("Groq hoan toan MIEN PHI va rat nhanh!")
    
except Exception as e:
    print(f"X LOI: {e}")
