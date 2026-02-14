import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import admin from 'firebase-admin'
import { readFileSync } from 'fs'

const app = express()
const PORT = 3001
const ADMIN_KEY = 'selvagam-admin-key-2024'

// Load Firebase credentials
let serviceAccount;
try {
    const credsPath = './firebase-credentials.json';
    serviceAccount = JSON.parse(readFileSync(credsPath, 'utf8'));

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id
        });
    }
    console.log('✅ Loaded credentials from firebase-credentials.json for project:', serviceAccount.project_id);
} catch (error) {
    console.warn('⚠️ firebase-credentials.json not found, trying Application Default Credentials...');
    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
        }
        console.log('✅ Initialized with Application Default Credentials');
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

        console.log('📨 Received:', { title, body, topic, messageType })

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

        console.log('🚀 Sending message:', message)
        const response = await admin.messaging().send(message)
        console.log('✅ Sent successfully:', response)
        res.json({ success: true, messageId: response, messageType: messageType })

    } catch (error) {
        console.error('FCM Error:', error)
        res.status(500).json({ detail: `Failed to send notification: ${error.message}` })
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
        console.error('FCM Error:', error)
        res.status(500).json({ detail: `Failed to send notification: ${error.message}` })
    }
})

app.listen(PORT, () => {
    console.log(`FCM API running on http://localhost:${PORT}`)
})
