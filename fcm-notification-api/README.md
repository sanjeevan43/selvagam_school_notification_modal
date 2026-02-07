# 🔥 FCM Notification API Setup

## ⚠️ CRITICAL: Firebase Credentials Required

**BEFORE STARTING:** You need Firebase service account credentials.

### Get Firebase Credentials:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Copy these values to `src/server.js`:
   - `private_key_id`
   - `private_key` (keep the quotes and \n characters)
   - `client_email`
   - `client_id`

## 🚀 Quick Start

```bash
# Start the server
npm start

# Expected output:
# FCM API running on http://localhost:3001
```

## 🧪 Test API

```bash
curl -X POST http://localhost:3001/api/send-notification \
  -H "Content-Type: application/json" \
  -H "X-ADMIN-KEY: selvagam-admin-key-2024" \
  -d '{"title": "Test", "body": "API Working", "topic": "drivers"}'
```

## 📱 Mobile App Setup

```dart
// Subscribe to topics
FirebaseMessaging.instance.subscribeToTopic("drivers");
FirebaseMessaging.instance.subscribeToTopic("parents");

// Handle notifications
FirebaseMessaging.onMessage.listen((message) {
  print('Title: ${message.notification?.title}');
  print('Body: ${message.notification?.body}');
});
```

## ✅ Deployment Checklist

- [ ] Replace Firebase credentials in `src/server.js`
- [ ] Test both API endpoints
- [ ] Mobile app subscribed to topics
- [ ] Admin portal connected to API