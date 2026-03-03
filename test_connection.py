import requests
import time

def test_backend_connection():
    backend_url = "http://localhost:8003"
    
    print("🔍 Testing backend connection...")
    print(f"Backend URL: {backend_url}")
    
    try:
        # Test basic health check
        response = requests.get(f"{backend_url}/", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Backend is running!")
            print(f"   Message: {data.get('message', 'N/A')}")
            print(f"   Status: {data.get('status', 'N/A')}")
            print(f"   Gemini Available: {data.get('gemini_available', 'N/A')}")
            return True
        else:
            print(f"❌ Backend returned status code: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend - server may not be running")
        return False
    except requests.exceptions.Timeout:
        print("❌ Connection timeout - server is slow to respond")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("VIETTIN.AI - BACKEND CONNECTION TEST")
    print("=" * 50)
    
    # Test connection
    is_connected = test_backend_connection()
    
    if is_connected:
        print("\n✅ Backend is ready!")
        print("🌐 You can now start the frontend with: npm run dev")
    else:
        print("\n❌ Backend is not accessible")
        print("🔧 Please start the backend first with: python main.py")
    
    print("\n" + "=" * 50)
    input("Press Enter to exit...")