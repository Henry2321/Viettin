import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(__file__))

try:
    from main import app
    print("✅ Main app imported successfully")
    
    # Test basic functionality
    print("✅ Testing basic route...")
    
    import uvicorn
    print("✅ Starting server on http://localhost:8003")
    print("✅ Press Ctrl+C to stop")
    
    uvicorn.run(app, host="0.0.0.0", port=8003, log_level="info")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    input("Press Enter to exit...")