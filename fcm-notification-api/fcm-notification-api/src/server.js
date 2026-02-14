import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import admin from 'firebase-admin'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()
const PORT = 8082
const ADMIN_KEY = 'selvagam-admin-key-2024'

// 1. Resolve Credentials Path Absolute
const possiblePaths = [
    join(__dirname, '..', 'firebase-credentials.json'),
    join(__dirname, 'firebase-credentials.json'),
    join(process.cwd(), 'firebase-credentials.json'),
    './firebase-credentials.json'
];

let credsPath = possiblePaths.find(p => existsSync(p));

// 2. Initialize Firebase
async function initFirebase() {
    try {
        if (!credsPath) {
            console.error('❌ CRITICAL: firebase-credentials.json NOT FOUND in paths:', possiblePaths);
            return;
        }

        const serviceAccount = JSON.parse(readFileSync(credsPath, 'utf8'));
        console.log('📁 Using Credentials File:', credsPath);

        // Force set Project ID for all Google SDKs
        if (serviceAccount.project_id) {
            process.env.GOOGLE_CLOUD_PROJECT = serviceAccount.project_id;
            process.env.GOOGLE_APPLICATION_CREDENTIALS = credsPath;
            console.log('🆔 Set Project ID:', serviceAccount.project_id);
        }

        if (admin.apps.length > 0) {
            console.log('🔄 Re-initializing Firebase...');
            await admin.app().delete();
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id
        });

        console.log('✅ Firebase Admin initialized for:', admin.app().options.projectId);
    } catch (error) {
        console.error('❌ Firebase Error during init:', error.message);
    }
}

await initFirebase();

app.use(cors())
app.use(bodyParser.json())

// Diagnostic Route
app.get('/api/debug-status', (req, res) => {
    res.json({
        status: 'online',
        projectId: admin.app()?.options?.projectId || 'MISSING',
        credsFound: !!credsPath,
        credsPath: credsPath,
        envProject: process.env.GOOGLE_CLOUD_PROJECT
    });
});

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

        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body required' })
        }

        // Verify initialization before sending
        if (!admin.app()?.options?.projectId) {
            console.log('⚠️ Project ID missing at runtime, re-initializing...');
            await initFirebase();
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

        console.log('🚀 Sending to Topic:', topic);
        const response = await admin.messaging().send(message)
        res.json({ success: true, messageId: response })

    } catch (error) {
        console.error('❌ FCM Send Error:', error.message)
        res.status(500).json({
            error: 'Notification Failed',
            detail: error.message,
            projectId: admin.app()?.options?.projectId
        })
    }
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 FCM API running on http://0.0.0.0:${PORT}`)
})
