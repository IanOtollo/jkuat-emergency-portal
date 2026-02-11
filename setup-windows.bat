@echo off
echo ========================================
echo JKUAT Incident System - Windows Setup
echo ========================================
echo.

echo [1/4] Installing Backend Dependencies...
cd backend
pip install django djangorestframework django-cors-headers pillow djangorestframework-simplejwt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Setting up Database...
python manage.py migrate
if %errorlevel% neq 0 (
    echo ERROR: Database migration failed
    pause
    exit /b 1
)

echo.
echo [3/4] Creating Sample Data...
python manage.py seed_data
if %errorlevel% neq 0 (
    echo ERROR: Failed to seed data
    pause
    exit /b 1
)

cd ..

echo.
echo [4/4] Installing Frontend Dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo.
echo 1. Open TWO command prompts/terminals
echo.
echo Terminal 1 - Backend:
echo    cd backend
echo    python manage.py runserver
echo.
echo Terminal 2 - Frontend:
echo    cd frontend
echo    npm run dev
echo.
echo Login: admin / admin123
echo Frontend: http://localhost:5173
echo.
pause
