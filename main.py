from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Literal
import firebase_admin
from firebase_admin import credentials, messaging
from dotenv import load_dotenv
import os
from datetime import datetime

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Selvagam School Notification API",
    description="FastAPI application for sending Firebase Cloud Messaging notifications",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Admin API key for authentication
ADMIN_KEY = "selvagam-admin-key-2024"

# Initialize Firebase Admin SDK
try:
    # Try to load from firebase-credentials.json
    cred_path = os.path.join(os.path.dirname(__file__), "firebase-credentials.json")
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("✅ Firebase initialized with firebase-credentials.json")
    else:
        # Fallback to application default credentials
        firebase_admin.initialize_app()
        print("✅ Firebase initialized with application default credentials")
except Exception as e:
    print(f"⚠️ Firebase initialization warning: {e}")

# Pydantic models
class NotificationRequest(BaseModel):
    title: str
    body: str
    topic: str = "all_users"
    messageType: Optional[str] = "text"

class DeviceNotificationRequest(BaseModel):
    title: str
    body: str
    token: str

class NotificationResponse(BaseModel):
    success: bool
    messageId: Optional[str] = None
    messageType: Optional[str] = None
    error: Optional[str] = None

# Authentication dependency
async def verify_admin_key(x_admin_key: str = Header(None)):
    if not x_admin_key or x_admin_key != ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid or missing API key")
    return x_admin_key

@app.get("/")
async def root():
    return {
        "message": "Selvagam School Notification API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "send_notification": "/api/send-notification",
            "send_device_notification": "/api/send-notification-device",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "firebase": "initialized" if firebase_admin._apps else "not initialized"
    }

@app.post("/api/send-notification", response_model=NotificationResponse)
async def send_notification(
    request: NotificationRequest,
    admin_key: str = Depends(verify_admin_key)
):
    """
    Send notification to a topic (broadcast to all subscribed devices)
    
    Topics: drivers, parents, all_users
    """
    try:
        print(f"📨 Received: {request.dict()}")
        
        # Create FCM message
        message = messaging.Message(
            notification=messaging.Notification(
                title=request.title,
                body=request.body
            ),
            data={
                "messageType": request.messageType,
                "recipientType": request.topic,
                "timestamp": str(int(datetime.utcnow().timestamp() * 1000))
            },
            topic=request.topic
        )
        
        # Send message
        print(f"🚀 Sending message to topic: {request.topic}")
        response = messaging.send(message)
        print(f"✅ Sent successfully: {response}")
        
        return NotificationResponse(
            success=True,
            messageId=response,
            messageType=request.messageType
        )
        
    except Exception as e:
        print(f"❌ FCM Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send notification: {str(e)}"
        )

@app.post("/api/send-notification-device", response_model=NotificationResponse)
async def send_notification_device(
    request: DeviceNotificationRequest,
    admin_key: str = Depends(verify_admin_key)
):
    """
    Send notification to a specific device using FCM token
    """
    try:
        print(f"📨 Received device notification: {request.title}")
        
        # Create FCM message
        message = messaging.Message(
            notification=messaging.Notification(
                title=request.title,
                body=request.body
            ),
            token=request.token
        )
        
        # Send message
        print(f"🚀 Sending message to device")
        response = messaging.send(message)
        print(f"✅ Sent successfully: {response}")
        
        return NotificationResponse(
            success=True,
            messageId=response
        )
        
    except Exception as e:
        print(f"❌ FCM Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send notification: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8081"))
    reload = os.getenv("DEBUG", "False").lower() == "true"
    
    print(f"🚀 Starting server on {host}:{port} (Debug: {reload})")
    uvicorn.run("main:app", host=host, port=port, reload=reload)
