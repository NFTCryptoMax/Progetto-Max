#!/bin/bash

# Tenders Dashboard Build Script
# This script builds the complete Electron application

set -e

echo "🚀 Building Tenders Dashboard Electron App..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python is not installed. Please install Python 3.9+ first.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Installing Frontend dependencies...${NC}"
cd frontend
npm install

echo -e "${YELLOW}🏗️  Building Frontend...${NC}"
npm run build
cd ..

echo -e "${YELLOW}📦 Installing Electron dependencies...${NC}"
cd electron
npm install

echo -e "${YELLOW}🔧 Building Electron Application...${NC}"
npm run dist

echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo -e "${GREEN}📁 Check the electron/dist directory for your executable files.${NC}"

# List the generated files
echo -e "${YELLOW}Generated files:${NC}"
ls -la dist/