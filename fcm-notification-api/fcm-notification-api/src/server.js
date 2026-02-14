import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import admin from 'firebase-admin'
import { readFileSync } from 'fs'

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()
const PORT = 8082
const ADMIN_KEY = 'selvagam-admin-key-2024'

// Load Firebase credentials
let serviceAccount;
try {
    // Try multiple possible paths for the credentials file
    const possiblePaths = [
        join(__dirname, '..', 'firebase-credentials.json'),
        join(__dirname, 'firebase-credentials.json'),
        './firebase-credentials.json'
    ];

    let credsPath = null;
    for (const p of possiblePaths) {
        try {
            if (readFileSync(p, 'utf8')) {
                credsPath = p;
                break;
            }
        } catch (e) { }
    }

    if (!credsPath) {
        throw new Error('firebase-credentials.json not found in any expected location');
    }

    serviceAccount = JSON.parse(readFileSync(credsPath, 'utf8'));
    console.log('📁 Using credentials from:', credsPath);

    // Explicitly set Project ID for underlying Google Cloud libraries
    if (serviceAccount.project_id) {
        process.env.GOOGLE_CLOUD_PROJECT = serviceAccount.project_id;
        process.env.GOOGLE_APPLICATION_CREDENTIALS = credsPath;
    }

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id
        });
        console.log('✅ Firebase Admin initialized for project:', serviceAccount.project_id);
    }
} catch (error) {
    console.warn('⚠️ Firebase initialization warning:', error.message);
    try {
        if (!admin.apps.length) {
            admin.initializeApp();
            console.log('✅ Initialized with Application Default Credentials');
        }
    } catch (err) {
        console.error('❌ Failed to initialize Firebase:', err.message);
    }
}

app.use(cors())
app.use(bodyParser.json())

const authenticateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-admin-key']
    if (!apiKey || apiKey !== ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' })
    }
    next()
}

// Send to topic (broadcast)
app.post('/api/send-notification', authenticateApiKey, async (req, res) => {
    try {
        const { title, body, topic = 'all_users', messageType = 'text' } = req.body

        console.log('📨 Sending Broadcast Notification:', { title, body, topic, messageType })

        // Debug check for project ID
        const currentApp = admin.app();
        console.log('🔍 Using Firebase Project:', currentApp.options.projectId || 'MISSING!');

        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body required' })
        }

        const message = {
            notification: { title, body },
            data: {
                messageType: messageType,
                recipientType: topic,
                timestamp: Date.now().toString()
            },
            topic: topic
        }

        console.log('🚀 FCM Payload:', JSON.stringify(message, null, 2))
        const response = await admin.messaging().send(message)
        console.log('✅ Send Success:', response)
        res.json({ success: true, messageId: response, messageType: messageType })

    } catch (error) {
        console.error('❌ FCM Send Error:', error)
        res.status(500).json({
            error: 'FCM Send Failed',
            detail: error.message,
            projectId: admin.app().options.projectId
        })
    }
})

// Send to specific device
app.post('/api/send-notification-device', authenticateApiKey, async (req, res) => {
    try {
        const { title, body, token } = req.body

        if (!title || !body || !token) {
            return res.status(400).json({ error: 'Title, body, and token required' })
        }

        const message = {
            notification: { title, body },
            token: token
        }

        const response = await admin.messaging().send(message)
        res.json({ success: true, messageId: response })

    } catch (error) {
        console.error('❌ FCM Device Send Error:', error)
        res.status(500).json({
            error: 'FCM Send Failed',
            detail: error.message,
            projectId: admin.app()?.options?.projectId
        })
    }
})

app.listen(PORT, () => {
    console.log(`FCM API running on http://localhost:${PORT}`)
})
