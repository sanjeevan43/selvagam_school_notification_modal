# 🚨 SOLUTION: Fix Selvagam Notification Service Error

## ❌ Current Problem
Your systemd service is failing with:
```
can't open file '/var/www/projects/client_side/selvegam_school/selvegam_school_notification/main.py': 
[Errno 2] No such file or directory
```

**Root Cause:** The `main.py` file doesn't exist on your Linux server.

---

## ✅ Solution: Upload Python FastAPI Application

I've created a complete Python FastAPI notification system for you. Here's what to do:

### Step 1: Upload Files to Your Linux Server

Transfer these files from your Windows machine to your Linux server at:
`/var/www/projects/client_side/selvegam_school/selvegam_school_notification/`

**Files to upload:**
```
📁 c:\HS\school_app\selvagam_school_notification_modal\
├── main.py                          ← FastAPI application
├── requirements.txt                 ← Python dependencies
├── firebase-credentials.json        ← Firebase credentials
├── selvegam-notification.service    ← Systemd service file
├── deploy.sh                        ← Automated deployment script
└── README_PYTHON.md                 ← Complete documentation
```

### Step 2: Upload Methods

**Option A: Using SCP (from Windows PowerShell)**
```powershell
# Navigate to the project directory
cd c:\HS\school_app\selvagam_school_notification_modal

# Upload files (replace 'your-server-ip' with actual IP)
scp main.py sanjeevan@your-server-ip:/var/www/projects/client_side/selvegam_school/selvegam_school_notification/
scp requirements.txt sanjeevan@your-server-ip:/var/www/projects/client_side/selvegam_school/selvegam_school_notification/
scp firebase-credentials.json sanjeevan@your-server-ip:/var/www/projects/client_side/selvegam_school/selvegam_school_notification/
scp selvegam-notification.service sanjeevan@your-server-ip:/var/www/projects/client_side/selvegam_school/selvegam_school_notification/
scp deploy.sh sanjeevan@your-server-ip:/var/www/projects/client_side/selvegam_school/selvegam_school_notification/
```

**Option B: Using WinSCP or FileZilla**
1. Connect to your server using WinSCP or FileZilla
2. Navigate to `/var/www/projects/client_side/selvegam_school/selvegam_school_notification/`
3. Upload all the files listed above

**Option C: Using Git**
```bash
# On your Windows machine, commit and push
cd c:\HS\school_app\selvagam_school_notification_modal
git add main.py requirements.txt firebase-credentials.json selvagam-notification.service deploy.sh
git commit -m "Add Python FastAPI notification service"
git push

# On your Linux server, pull the changes
cd /var/www/projects/client_side/selvegam_school/selvegam_school_notification
git pull
```

### Step 3: Run Deployment on Linux Server

Once files are uploaded, SSH into your server and run:

```bash
# Navigate to project directory
cd /var/www/projects/client_side/selvegam_school/selvegam_school_notification

# Make deployment script executable
chmod +x deploy.sh

# Run automated deployment
./deploy.sh
```

The deployment script will:
- ✅ Create Python virtual environment
- ✅ Install all dependencies from requirements.txt
- ✅ Set up systemd service
- ✅ Start the API on port 8081
- ✅ Enable auto-start on boot

### Step 4: Verify It's Working

```bash
# Check service status
sudo systemctl status selvegam-notification.service

# Should show: Active: active (running)

# Test the API
curl http://localhost:8081/health

# Should return:
# {"status":"healthy","timestamp":"...","firebase":"initialized"}

# View live logs
sudo journalctl -u selvegam-notification.service -f
```

---

## 🧪 Test the API

Once deployed, test sending a notification:

```bash
curl -X POST http://localhost:8081/api/send-notification \
  -H "Content-Type: application/json" \
  -H "X-ADMIN-KEY: selvagam-admin-key-2024" \
  -d '{
    "title": "Test Notification",
    "body": "API is working!",
    "topic": "drivers"
  }'
```

Expected response:
```json
{
  "success": true,
  "messageId": "projects/school-bus-tracking-fbf78/messages/...",
  "messageType": "text"
}
```

---

## 📊 API Endpoints Summary

### Base URL: `http://your-server:8081`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/health` | GET | Health check |
| `/api/send-notification` | POST | Send to topic (drivers/parents/all_users) |
| `/api/send-notification-device` | POST | Send to specific device token |
| `/docs` | GET | Interactive API documentation |

**Authentication:** All POST endpoints require header:
```
X-ADMIN-KEY: selvagam-admin-key-2024
```

---

## 🔧 Service Management Commands

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

# View last 50 lines
sudo journalctl -u selvegam-notification.service -n 50
```

---

## 🐛 Troubleshooting

### If service still fails after deployment:

1. **Check if main.py exists:**
   ```bash
   ls -la /var/www/projects/client_side/selvegam_school/selvegam_school_notification/main.py
   ```

2. **Check Python virtual environment:**
   ```bash
   ls -la /var/www/projects/client_side/selvegam_school/selvegam_school_notification/venv/bin/python
   ```

3. **Manually test the app:**
   ```bash
   cd /var/www/projects/client_side/selvegam_school/selvegam_school_notification
   source venv/bin/activate
   python main.py
   ```

4. **Check detailed logs:**
   ```bash
   sudo journalctl -u selvegam-notification.service -n 100 --no-pager
   ```

---

## 📁 Project Structure

After deployment, your directory should look like:

```
/var/www/projects/client_side/selvegam_school/selvegam_school_notification/
├── main.py                          ← FastAPI application
├── requirements.txt                 ← Python dependencies
├── firebase-credentials.json        ← Firebase service account
├── selvegam-notification.service    ← Systemd service
├── deploy.sh                        ← Deployment script
├── venv/                            ← Python virtual environment
│   ├── bin/
│   │   ├── python
│   │   ├── pip
│   │   └── uvicorn
│   └── lib/
└── README_PYTHON.md                 ← Documentation
```

---

## 🎯 Next Steps

1. ✅ Upload the files to your server
2. ✅ Run `./deploy.sh`
3. ✅ Test the API with curl
4. ✅ Integrate with your mobile app
5. ✅ Set up Nginx reverse proxy (optional)
6. ✅ Configure SSL certificate (optional)

---

## 📞 Need Help?

If you encounter any issues:
1. Check the service logs: `sudo journalctl -u selvegam-notification.service -f`
2. Verify all files are uploaded correctly
3. Ensure Firebase credentials are valid
4. Check if port 8081 is available: `sudo lsof -i :8081`

---

## 🔐 Security Notes

- Change the `ADMIN_KEY` in `main.py` for production
- Keep `firebase-credentials.json` secure (don't commit to public repos)
- Consider setting up firewall rules for port 8081
- Use Nginx reverse proxy with SSL for production

---

**Created:** 2026-02-07  
**Version:** 1.0.0  
**Author:** Antigravity AI Assistant
