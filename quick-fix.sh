#!/bin/bash

# 🚨 QUICK FIX FOR YOUR SERVER ISSUE
# Run these commands on your Linux server to fix the systemd service

echo "🔧 Fixing Selvagam Notification Service..."

# Stop the failing service
sudo systemctl stop selvegam-notification.service

# Navigate to project directory
cd /var/www/projects/client_side/selvegam_school/selvegam_school_notification

# Upload the following files from your Windows machine to this directory:
# - main.py
# - requirements.txt
# - firebase-credentials.json
# - selvegam-notification.service
# - deploy.sh

echo "📋 Files needed in current directory:"
echo "  ✓ main.py"
echo "  ✓ requirements.txt"
echo "  ✓ firebase-credentials.json"
echo "  ✓ selvegam-notification.service"
echo "  ✓ deploy.sh"
echo ""

# Check if files exist
if [ -f "main.py" ]; then
    echo "✅ main.py found"
else
    echo "❌ main.py NOT found - Please upload it!"
fi

if [ -f "requirements.txt" ]; then
    echo "✅ requirements.txt found"
else
    echo "❌ requirements.txt NOT found - Please upload it!"
fi

if [ -f "firebase-credentials.json" ]; then
    echo "✅ firebase-credentials.json found"
else
    echo "❌ firebase-credentials.json NOT found - Please upload it!"
fi

echo ""
echo "📦 After uploading all files, run:"
echo "  chmod +x deploy.sh"
echo "  ./deploy.sh"
