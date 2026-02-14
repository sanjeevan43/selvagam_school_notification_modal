const express = require('express');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');

const app = express();
const PORT = 8082;
const PROJECT_ID = 'school-bus-tracking-fbf78';

// Enable CORS for all origins (development only)
app.use(cors());
app.use(express.json());

console.log('🔧 Server starting...');
console.log('🌐 CORS enabled for all origins');

// Initialize Google Auth
const possiblePaths = ['./firebase-credentials.json', './src/firebase-credentials.json'];
let credentialsPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    credentialsPath = p;
    break;
  }
}

if (!credentialsPath) {
  console.error('❌ CRITICAL ERROR: firebase-credentials.json not found!');
  console.error('👉 Path: ' + process.cwd() + '/firebase-credentials.json');
}

const auth = new GoogleAuth({
  projectId: PROJECT_ID,
  keyFile: credentialsPath || undefined,
  scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
});

// Get OAuth access token
async function getAccessToken() {
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
}

// Send notification using FCM HTTP v1 API
app.post('/api/send-notification-device', async (req, res) => {
  try {
    const { title, body, token, recipientType, messageType } = req.body;

    console.log('📱 Sending notification:', {
      title,
      body,
      recipientType,
      messageType,
      token: token?.substring(0, 20) + '...'
    });

    // Get OAuth access token
    const accessToken = await getAccessToken();

    // FCM HTTP v1 API payload
    const message = {
      message: {
        token: token,
        notification: {
          title: title,
          body: body
        },
        data: {
          type: 'admin_notification',
          messageType: messageType || 'text',
          recipientType: recipientType || 'parent',
          timestamp: Date.now().toString(),
          source: 'admin_panel',
          message: body // Backup content
        },
        android: {
          priority: 'high'
        }
      }
    };

    // Send to FCM HTTP v1 endpoint
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`FCM API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('✅ Notification sent successfully:', result.name);

    res.json({
      success: true,
      messageId: result.name,
      message: 'Notification sent to mobile device'
    });

  } catch (error) {
    console.error('❌ Error sending notification:', error.message);
    res.status(500).json({
      detail: `Failed to send notification: ${error.message}`
    });
  }
});

// Test endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'FCM HTTP v1 API Server Running',
    project: PROJECT_ID,
    status: 'Ready to send notifications'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 FCM HTTP v1 Server running on http://localhost:${PORT}`);
  console.log(`📱 Project: ${PROJECT_ID}`);
  console.log('✅ Ready to send notifications to mobile devices');
  console.log('🌐 CORS enabled - accepting requests from all origins');
  console.log('🔍 Visit http://localhost:3001 to test server');
});

// Keep server alive
setInterval(() => {
  console.log('💓 Server heartbeat - Ready for notifications');
}, 60000);