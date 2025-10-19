#!/bin/bash

# Script to run Django development server with proper dependencies

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Hospital Finder Django Server${NC}"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment not found. Creating one...${NC}"
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to create virtual environment${NC}"
        exit 1
    fi
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Upgrade pip
echo -e "${YELLOW}Upgrading pip...${NC}"
pip install --upgrade pip --quiet

# Install core dependencies
echo -e "${YELLOW}Installing core dependencies...${NC}"
pip install Django==4.2.25 \
    psycopg2-binary \
    python-decouple \
    requests \
    googlemaps \
    geopy \
    pandas \
    matplotlib \
    plotly \
    number-parser \
    django-pandas \
    rapidfuzz \
    xlwt --quiet

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies${NC}"
    exit 1
fi

# Build React JavaScript
echo -e "${YELLOW}Building React application...${NC}"
npm run start &
WEBPACK_PID=$!
echo -e "${GREEN}Webpack watching for changes (PID: $WEBPACK_PID)${NC}"

# Wait a moment for initial build
sleep 3

# Run Django checks
echo -e "${YELLOW}Running Django system checks...${NC}"
python manage.py check
if [ $? -ne 0 ]; then
    echo -e "${RED}Django system check failed${NC}"
    kill $WEBPACK_PID 2>/dev/null
    exit 1
fi

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    kill $WEBPACK_PID 2>/dev/null
    echo -e "${GREEN}Stopped webpack${NC}"
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start the server
echo -e "${GREEN}Starting development server...${NC}"
echo -e "${GREEN}Press Ctrl+C to stop${NC}"
python manage.py runserver

# Cleanup after server stops
cleanup
