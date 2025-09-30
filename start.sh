#!/bin/bash

# Script to run the hospital finder app

echo "Starting Hospital Finder App..."

# Check if virtual environment exists
if [ ! -d "env" ]; then
    echo "Error: Virtual environment not found!"
    echo "Please run setup first:"
    echo "  python3 -m venv env"
    echo "  source env/bin/activate"
    echo "  pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
source env/bin/activate

# Export Node options for legacy OpenSSL support
export NODE_OPTIONS=--openssl-legacy-provider

# Function to cleanup background processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $DJANGO_PID $NPM_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start Django server in background
echo "Starting Django server..."
python manage.py runserver &
DJANGO_PID=$!

# Start npm/webpack in background
echo "Starting webpack dev server..."
npm start &
NPM_PID=$!

# Wait for both processes
echo "Servers started!"
echo "Django PID: $DJANGO_PID"
echo "NPM PID: $NPM_PID"
echo "Press Ctrl+C to stop all servers"

wait