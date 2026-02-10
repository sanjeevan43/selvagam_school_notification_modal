# 🔔 Selvagam School Notification API (Python FastAPI)

A FastAPI-based notification service using Firebase Cloud Messaging (FCM) for sending notifications to school drivers, parents, and other users.

## 📋 Prerequisites

- Python 3.8+
- Firebase project with FCM enabled
- Firebase service account credentials JSON file

## 🚀 Quick Deployment on Linux Server

### Step 1: Upload Files to Server

Upload these files to `/var/www/projects/client_side/selvegam_school/selvegam_school_notification/`:

```
main.py
requirements.txt
selvegam-notification.service
deploy.sh
firebase-credentials.json  (your Firebase credentials)
```

### Step 2: Run Deployment Script

```bash
cd /var/www/projects/client_side/selvegam_school/selvegam_school_notification

# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

The script will:
- ✅ Create Python virtual environment
- ✅ Install all dependencies
- ✅ Set up systemd service
- ✅ Start the API server
- ✅ Enable auto-start on boot

### Step 3: Verify Deployment

```bash
# Check service status
sudo systemctl status selvegam-notification.service

# View live logs
sudo journalctl -u selvegam-notification.service -f

# Test health endpoint
curl http://localhost:8081/health
```

## 📡 API Endpoints

### Base URL
```
http://your-server:8081
```

### 1. Health Check
```bash
GET /health

Response:
{
  "status": "healthy",
  "timestamp": "2026-02-07T13:00:00",
  "firebase": "initialized"
}
```

### 2. Send Notification to Topic (Broadcast)
```bash
POST /api/send-notification
Headers:
  Content-Type: application/json
  X-ADMIN-KEY: selvagam-admin-key-2024

Body:
{
  "title": "Important Notice",
  "body": "School will be closed tomorrow",
  "topic": "parents",
  "messageType": "text"
}

Response:
{
  "success": true,
  "messageId": "projects/...",
  "messageType": "text"
}
```

**Available Topics:**
- `drivers` - All drivers
- `parents` - All parents
- `all_users` - Everyone

### 3. Send Notification to Specific Device
```bash
POST /api/send-notification-device
Headers:
  Content-Type: application/json
  X-ADMIN-KEY: selvagam-admin-key-2024

Body:
{
  "title": "Personal Message",
  "body": "Your child's bus is arriving soon",
  "token": "device_fcm_token_here"
}

Response:
{
  "success": true,
  "messageId": "projects/..."
}
```

## 🧪 Testing Examples

### Using cURL
```bash
# Test notification to parents topic
curl -X POST http://localhost:8081/api/send-notification \
  -H "Content-Type: application/json" \
  -H "X-ADMIN-KEY: selvagam-admin-key-2024" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test message",
    "topic": "parents"
  }'
```

### Using Python
```python
import requests

url = "http://your-server:8081/api/send-notification"
headers = {
    "Content-Type": "application/json",
    "X-ADMIN-KEY": "selvagam-admin-key-2024"
}
data = {
    "title": "Test Notification",
    "body": "This is a test message",
    "topic": "drivers"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

## 🔧 Service Management

```bash
# Start service
sudo systemctl start selvegam-notification.service

# Stop service
sudo systemctl stop selvegam-notification.service

# Restart service
sudo systemctl restart selvegam-notification.service

# Check status
sudo systemctl status selvegam-notification.service

# View logs (live)
sudo journalctl -u selvegam-notification.service -f

# View last 100 lines of logs
sudo journalctl -u selvegam-notification.service -n 100

# Disable auto-start on boot
sudo systemctl disable selvegam-notification.service

# Enable auto-start on boot
sudo systemctl enable selvegam-notification.service
```

## 🔐 Security

### Change Admin Key
Edit `main.py` and change the `ADMIN_KEY` variable:
```python
ADMIN_KEY = "your-new-secure-key-here"
```

Then restart the service:
```bash
sudo systemctl restart selvegam-notification.service
```

### Firewall Configuration
If using UFW firewall:
```bash
# Allow port 8081
sudo ufw allow 8081/tcp

# Check status
sudo ufw status
```

## 📱 Mobile App Integration (Flutter/Dart)

```dart
import 'package:firebase_messaging/firebase_messaging.dart';

// Subscribe to topics
await FirebaseMessaging.instance.subscribeToTopic("drivers");
await FirebaseMessaging.instance.subscribeToTopic("parents");

// Handle foreground notifications
FirebaseMessaging.onMessage.listen((RemoteMessage message) {
  print('Title: ${message.notification?.title}');
  print('Body: ${message.notification?.body}');
  
  // Show local notification or update UI
});

// Handle background notifications
FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  print('Background message: ${message.messageId}');
}
```

## 🐛 Troubleshooting

### Service won't start
```bash
# Check detailed logs
sudo journalctl -u selvegam-notification.service -n 100 --no-pager

# Common issues:
# 1. Missing main.py - Upload the file
# 2. Missing firebase-credentials.json - Upload Firebase credentials
# 3. Port already in use - Check: sudo lsof -i :8081
# 4. Permission issues - Check file ownership
```

### Check if port is in use
```bash
sudo lsof -i :8081
```

### Kill process on port 8081
```bash
sudo kill -9 $(sudo lsof -t -i:8081)
```

### Reinstall dependencies
```bash
cd /var/www/projects/client_side/selvegam_school/selvegam_school_notification
source venv/bin/activate
pip install --upgrade -r requirements.txt
sudo systemctl restart selvegam-notification.service
```

## 📊 API Documentation

Once the service is running, visit:
```
http://your-server:8081/docs
```

This provides interactive Swagger UI documentation for testing all endpoints.

## 🌐 Nginx Reverse Proxy (Optional)

To access the API via domain name with SSL:

```nginx
server {
    listen 80;
    server_name notifications.yourschool.com;

    location / {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then set up SSL with Let's Encrypt:
```bash
sudo certbot --nginx -d notifications.yourschool.com
```

## 📞 Support

For issues or questions, check the logs:
```bash
sudo journalctl -u selvegam-notification.service -f
```
