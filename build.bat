@echo off
setlocal enabledelayedexpansion

echo 🚀 Building Tenders Dashboard Electron App...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    python3 --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Python is not installed. Please install Python 3.9+ first.
        pause
        exit /b 1
    )
)

echo 📦 Installing Frontend dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo 🏗️ Building Frontend...
call npm run build
if errorlevel 1 (
    echo ❌ Failed to build frontend
    pause
    exit /b 1
)
cd ..

echo 📦 Installing Electron dependencies...
cd electron
call npm install
if errorlevel 1 (
    echo ❌ Failed to install electron dependencies
    pause
    exit /b 1
)

echo 🔧 Building Electron Application...
call npm run dist
if errorlevel 1 (
    echo ❌ Failed to build electron application
    pause
    exit /b 1
)

echo ✅ Build completed successfully!
echo 📁 Check the electron\dist directory for your executable files.

REM List the generated files
echo Generated files:
dir dist\

pause