#!/usr/bin/env bash
# exit on error
set -o errexit

# Clean previous builds
echo "Cleaning old builds..."
rm -rf frontend/dist
rm -rf backend/staticfiles

# Install Frontend Dependencies and Build
echo "Building Frontend..."
cd frontend
# Set memory limit for Node/Vite to avoid OOM
export NODE_OPTIONS="--max-old-space-size=512"
npm install --legacy-peer-deps --no-audit --no-fund
npm run build
cd ..

# Install Backend Dependencies
echo "Installing Backend Dependencies..."
cd backend
if command -v python3 &> /dev/null; then
    PYTHON_SYSTEM_CMD=python3
else
    PYTHON_SYSTEM_CMD=python
fi

echo "Creating virtual environment..."
$PYTHON_SYSTEM_CMD -m venv venv
PYTHON_CMD="./venv/bin/python"
PIP_CMD="./venv/bin/pip"

echo "Using $PYTHON_CMD and $PIP_CMD"
$PIP_CMD install --upgrade pip
$PIP_CMD install -r requirements.txt

# Create Static Files
echo "Preparing Backend..."
# We are already in the backend directory from the previous step
$PYTHON_CMD manage.py collectstatic --no-input
# We run migrations in the start command, but we can verify here if needed
cd ..
