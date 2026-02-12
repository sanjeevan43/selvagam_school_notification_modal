# 🔧 FIX: Deployment Error - Files Missing on Server

## ❌ Current Error
```
chmod: cannot access 'deploy.sh': No such file or directory
-bash: ./deploy.sh: No such file or directory
● selvegam-notification.service - Active: activating (auto-restart) (Result: exit-code)
```

**Root Cause:** The files exist on your Windows machine but are NOT on the Linux server.

---

## ✅ SOLUTION: Upload Files to Server

### Step 1: Upload Files from Windows to Linux Server

**Option A: Using PowerShell Script (EASIEST)**

1. Open PowerShell on Windows
2. Navigate to your project directory:
   ```powershell
   cd c:\HS\school_app\selvagam_school_notification_modal
   ```

3. Run the upload script:
   ```powershell
   .\upload-to-server.ps1
   ```

4. Enter your password when prompted (multiple times for each file)

---

**Option B: Manual SCP Upload**

Open PowerShell and run these commands one by one:

```powershell
cd c:\HS\school_app\selvagam_school_notification_modal

scp main.py sanjeevan@72.61.250.191:/var/www/projects/client_side/selvegam_school/selvegam_school_notification/

scp requirements.txt sanjeevan@72.61.250.191:/var/www/projects/client_side/selvegam_school/selvegam_school_notification/

scp firebase-credentials.json sanjeevan@72.61.250.191:/var/www/projects/client_side/selvegam_school/selvegam_school_notification/

scp selvegam-notification.service sanjeevan@72.61.250.191:/var/www/projects/client_side/selvegam_school/selvegam_school_notification/

scp deploy.sh sanjeevan@72.61.250.191:/var/www/projects/client_side/selvegam_school/selvegam_school_notification/

scp .env sanjeevan@72.61.250.191:/var/www/projects/client_side/selvegam_school/selvegam_school_notification/
```

---

**Option C: Using WinSCP (GUI Method)**

1. Download and install WinSCP: https://winscp.net/
2. Connect to your server:
   - Host: `72.61.250.191`
   - Username: `sanjeevan`
   - Password: (your password)
3. Navigate to: `/var/www/projects/client_side/selvegam_school/selvegam_school_notification/`
4. Drag and drop these files from your Windows folder:
   - `main.py`
   - `requirements.txt`
   - `firebase-credentials.json`
   - `selvegam-notification.service`
   - `deploy.sh`
   - `.env`

---

### Step 2: Deploy on Linux Server

After uploading files, SSH into your server:

```powershell
ssh sanjeevan@72.61.250.191
```

Then run these commands:

```bash
# Navigate to project directory
cd /var/www/projects/client_side/selvegam_school/selvegam_school_notification

# Verify files are uploaded
ls -la

# You should see:
# main.py
# requirements.txt
# firebase-credentials.json
# selvegam-notification.service
# deploy.sh
# .env

# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

---

### Step 3: Verify Deployment

```bash
# Check service status
sudo systemctl status selvegam-notification.service

# Should show: Active: active (running) ✅

# Test the API
curl http://localhost:8081/health

# Should return:
# {"status":"healthy","timestamp":"...","firebase":"initialized"}

# View live logs
sudo journalctl -u selvegam-notification.service -f
```

---

## 🧪 Test Notification

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
  "messageId": "projects/...",
  "messageType": "text"
}
```

---

## 🔧 Service Management

```bash
# Restart service
sudo systemctl restart selvegam-notification.service

# Stop service
sudo systemctl stop selvegam-notification.service

# Start service
sudo systemctl start selvegam-notification.service

# View logs
sudo journalctl -u selvegam-notification.service -f
```

---

## 🐛 Troubleshooting

### If files still missing after upload:

```bash
# Check if files exist
ls -la /var/www/projects/client_side/selvegam_school/selvegam_school_notification/

# Check file permissions
ls -l /var/www/projects/client_side/selvegam_school/selvegam_school_notification/main.py

# Should show: -rw-r--r-- 1 sanjeevan
```

### If service still fails:

```bash
# Check detailed logs
sudo journalctl -u selvegam-notification.service -n 100 --no-pager

# Manually test Python app
cd /var/www/projects/client_side/selvegam_school/selvegam_school_notification
source venv/bin/activate
python main.py
```

### If port 8081 is already in use:

```bash
# Check what's using port 8081
sudo lsof -i :8081

# Kill the process (if needed)
sudo kill -9 $(sudo lsof -t -i:8081)

# Restart service
sudo systemctl restart selvegam-notification.service
```

---

## 📋 Quick Command Summary

**On Windows (PowerShell):**
```powershell
cd c:\HS\school_app\selvagam_school_notification_modal
.\upload-to-server.ps1
```

**On Linux Server (SSH):**
```bash
cd /var/www/projects/client_side/selvegam_school/selvegam_school_notification
chmod +x deploy.sh
./deploy.sh
sudo systemctl status selvegam-notification.service
curl http://localhost:8081/health
```

---

## ✅ Success Indicators

You'll know it's working when you see:

1. ✅ Service status shows: `Active: active (running)`
2. ✅ Health check returns: `{"status":"healthy"}`
3. ✅ Port 8081 is listening: `sudo lsof -i :8081`
4. ✅ Logs show: `🚀 Starting server on 0.0.0.0:8081`

---

## 📞 Still Having Issues?

Check the logs for specific errors:
```bash
sudo journalctl -u selvegam-notification.service -f
```

Common issues:
- Missing firebase-credentials.json → Upload the file
- Python dependencies not installed → Run `./deploy.sh` again
- Port already in use → Kill the process using port 8081
- Permission denied → Check file ownership with `ls -la`

---

**Last Updated:** 2026-02-10
