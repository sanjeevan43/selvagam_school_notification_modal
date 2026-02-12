@echo off
REM Quick Upload Script for Windows
REM This uploads all necessary files to the Linux server

echo ========================================
echo   Selvagam School Notification Upload
echo ========================================
echo.

set SERVER=sanjeevan@72.61.250.191
set DEST=/var/www/projects/client_side/selvegam_school/selvegam_school_notification/

echo Uploading files to %SERVER%...
echo.

echo [1/6] Uploading main.py...
scp main.py %SERVER%:%DEST%

echo [2/6] Uploading requirements.txt...
scp requirements.txt %SERVER%:%DEST%

echo [3/6] Uploading firebase-credentials.json...
scp firebase-credentials.json %SERVER%:%DEST%

echo [4/6] Uploading selvegam-notification.service...
scp selvegam-notification.service %SERVER%:%DEST%

echo [5/6] Uploading deploy.sh...
scp deploy.sh %SERVER%:%DEST%

echo [6/6] Uploading .env...
scp .env %SERVER%:%DEST%

echo.
echo ========================================
echo   Upload Complete!
echo ========================================
echo.
echo Next steps:
echo 1. SSH into your server: ssh %SERVER%
echo 2. Navigate to directory: cd %DEST%
echo 3. Make script executable: chmod +x deploy.sh
echo 4. Run deployment: ./deploy.sh
echo 5. Check status: sudo systemctl status selvegam-notification.service
echo.
pause
