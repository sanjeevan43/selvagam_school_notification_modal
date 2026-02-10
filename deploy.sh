#!/bin/bash

# Selvagam School Notification API - Deployment Script
# This script sets up and deploys the FastAPI notification service

set -e  # Exit on error

echo "🚀 Deploying Selvagam School Notification API..."

# Configuration
PROJECT_DIR="/var/www/projects/client_side/selvegam_school/selvegam_school_notification"
VENV_DIR="$PROJECT_DIR/venv"
SERVICE_NAME="selvegam-notification.service"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📁 Working directory: $PROJECT_DIR${NC}"

# Step 1: Check if directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Error: Directory $PROJECT_DIR does not exist${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# Step 2: Create virtual environment if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
    echo -e "${YELLOW}🔨 Creating virtual environment...${NC}"
    python3 -m venv venv
else
    echo -e "${GREEN}✅ Virtual environment already exists${NC}"
fi

# Step 3: Activate virtual environment and install dependencies
echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Step 4: Check if main.py exists
if [ ! -f "$PROJECT_DIR/main.py" ]; then
    echo -e "${RED}❌ Error: main.py not found in $PROJECT_DIR${NC}"
    echo -e "${YELLOW}Please upload main.py to the project directory${NC}"
    exit 1
fi

# Step 5: Check if firebase-credentials.json exists
if [ ! -f "$PROJECT_DIR/firebase-credentials.json" ]; then
    echo -e "${YELLOW}⚠️  Warning: firebase-credentials.json not found${NC}"
    echo -e "${YELLOW}Please upload firebase-credentials.json to the project directory${NC}"
fi

# Step 5b: Check if .env exists
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
    echo -e "${YELLOW}Please upload .env to the project directory for configuration${NC}"
fi

# Step 6: Copy systemd service file
if [ -f "$PROJECT_DIR/selvegam-notification.service" ]; then
    echo -e "${YELLOW}📋 Installing systemd service...${NC}"
    sudo cp "$PROJECT_DIR/selvegam-notification.service" "/etc/systemd/system/$SERVICE_NAME"
    sudo systemctl daemon-reload
    echo -e "${GREEN}✅ Service file installed${NC}"
else
    echo -e "${RED}❌ Error: selvegam-notification.service not found${NC}"
    exit 1
fi

# Step 7: Enable and start the service
echo -e "${YELLOW}🔄 Enabling and starting service...${NC}"
sudo systemctl enable "$SERVICE_NAME"
sudo systemctl restart "$SERVICE_NAME"

# Step 8: Wait a moment for service to start
sleep 2

# Step 9: Check service status
echo -e "${YELLOW}📊 Checking service status...${NC}"
sudo systemctl status "$SERVICE_NAME" --no-pager

# Step 10: Check if port is listening
echo -e "${YELLOW}🔍 Checking if API is listening on port 8081...${NC}"
if sudo lsof -i :8081 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API is listening on port 8081${NC}"
else
    echo -e "${RED}⚠️  Warning: Port 8081 is not listening yet${NC}"
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Useful commands:${NC}"
echo "  View logs:        sudo journalctl -u $SERVICE_NAME -f"
echo "  Restart service:  sudo systemctl restart $SERVICE_NAME"
echo "  Stop service:     sudo systemctl stop $SERVICE_NAME"
echo "  Service status:   sudo systemctl status $SERVICE_NAME"
echo ""
echo -e "${YELLOW}🧪 Test the API:${NC}"
echo "  curl http://localhost:8081/health"
echo ""
