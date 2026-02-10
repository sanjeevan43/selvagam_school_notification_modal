# PowerShell Script to Upload Files to Linux Server
# Run this from Windows PowerShell

# CONFIGURATION - UPDATE THESE VALUES
$SERVER_IP = "72.61.250.191"  # Replace with your server IP or hostname
$SERVER_USER = "sanjeevan"
$SERVER_PATH = "/var/www/projects/client_side/selvegam_school/selvegam_school_notification/"

# Files to upload
$FILES = @(
    "main.py",
    "requirements.txt",
    "firebase-credentials.json",
    "selvegam-notification.service",
    "deploy.sh",
    "deploy.sh",
    "README_PYTHON.md",
    ".env"
)

Write-Host "🚀 Uploading files to Linux server..." -ForegroundColor Green
Write-Host ""

# Check if files exist
$allFilesExist = $true
foreach ($file in $FILES) {
    if (Test-Path $file) {
        Write-Host "✅ Found: $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing: $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "⚠️  Some files are missing. Please ensure all files exist in the current directory." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📤 Uploading to: ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}" -ForegroundColor Cyan
Write-Host ""

# Upload each file
foreach ($file in $FILES) {
    Write-Host "Uploading $file..." -ForegroundColor Yellow
    scp $file "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Uploaded: $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to upload: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Upload complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps on your Linux server:" -ForegroundColor Cyan
Write-Host "  1. SSH into your server:"
Write-Host "     ssh $SERVER_USER@$SERVER_IP"
Write-Host ""
Write-Host "  2. Navigate to project directory:"
Write-Host "     cd $SERVER_PATH"
Write-Host ""
Write-Host "  3. Make deploy script executable:"
Write-Host "     chmod +x deploy.sh"
Write-Host ""
Write-Host "  4. Run deployment:"
Write-Host "     ./deploy.sh"
Write-Host ""
Write-Host "  5. Check service status:"
Write-Host "     sudo systemctl status selvegam-notification.service"
Write-Host ""
