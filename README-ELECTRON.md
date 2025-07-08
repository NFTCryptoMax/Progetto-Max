# Tenders Dashboard - Electron Build

A complete standalone Windows executable for the Tenders Dashboard application.

## 🎯 Features

- **Standalone Executable**: No external dependencies required
- **Complete Dashboard**: Full-featured tenders management with GANTT chart
- **Live Countdown**: Real-time deadline tracking
- **Professional UI**: Dark theme with optimized color scheme
- **Portable**: Run from anywhere without installation

## 📦 What's Included

```
tenders-dashboard-electron/
├── frontend/                 # Built React application
│   └── build/               # Production build files
├── backend/                 # FastAPI backend (for reference)
├── electron/                # Electron wrapper
│   ├── main.js             # Main Electron process
│   ├── preload.js          # Security preload script
│   ├── package.json        # Electron dependencies
│   └── assets/             # Application icons
├── .github/workflows/       # GitHub Actions for automated builds
├── build.sh                # Linux/macOS build script
├── build.bat               # Windows build script
└── README-ELECTRON.md      # This file
```

## 🚀 Building the Executable

### Option 1: Local Build

**Prerequisites:**
- Node.js 18+ 
- Python 3.9+
- Git

**Windows:**
```cmd
build.bat
```

**Linux/macOS:**
```bash
./build.sh
```

### Option 2: GitHub Actions (Recommended)

1. **Push to GitHub**: Upload this project to a GitHub repository
2. **Create Release**: Push a tag (e.g., `v1.0.0`) to trigger the build
3. **Download**: Get the executable from the GitHub Releases page

**Create a tag:**
```bash
git tag v1.0.0
git push origin v1.0.0
```

## 📁 Build Output

After building, you'll find these files in `electron/dist/`:

- `Tenders Dashboard Setup 1.0.0.exe` - Windows installer
- `TendersDashboard-1.0.0-portable.exe` - Portable executable
- `Tenders Dashboard-1.0.0.zip` - Zip package

## 🔧 Development Setup

### Frontend Development
```bash
cd frontend
npm install
npm start  # Runs on http://localhost:3000
```

### Backend Development  
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Electron Development
```bash
cd electron
npm install
npm start  # Launches Electron app
```

## 📝 Configuration

### Electron App Settings

Edit `electron/package.json` to modify:
- App name and description
- Version number
- Build targets
- Icon paths

### GitHub Actions

The workflow in `.github/workflows/build-exe.yml` automatically:
1. Builds the frontend
2. Packages the Electron app
3. Creates Windows executables
4. Uploads artifacts
5. Creates GitHub releases

## 🎨 Application Features

### Status System
- **Offer** (Blue) - Initial status
- **Round 1-4** (Solid Gray) - Bidding rounds
- **BAFO** (Purple) - Best and Final Offer
- **Contract Signed** (Yellow + 🟡) - Contract phase
- **Won** (Green + 🟢) - Successful tender
- **Lost** (Red + 🔴) - Unsuccessful tender

### Project Details Layout
```
BID Name - Item                    🟡
Customer - Due: Jun 18, 2025, 2:30 PM
```

### Live Features
- Real-time countdown panel
- Color-coded urgency (🔴🟠🟢)
- Auto-scroll to current day
- Time-only due fields

## 🔒 Security

The Electron app includes:
- Context isolation enabled
- Node integration disabled
- Preload script for secure API exposure
- External link handling
- Certificate error handling

## 📋 Troubleshooting

### Build Issues

**Frontend build fails:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Electron build fails:**
```bash
cd electron
rm -rf node_modules package-lock.json
npm install
npm run dist
```

### Runtime Issues

**App won't start:**
- Check if all dependencies are included
- Verify file paths in main.js
- Check console for error messages

**Performance issues:**
- Ensure frontend build is optimized
- Check if source maps are excluded
- Verify large assets are optimized

## 🎯 Production Deployment

### For Distribution

1. **Code Signing**: Add certificate for trusted execution
2. **Auto Updates**: Implement electron-updater
3. **Crash Reporting**: Add crash analytics
4. **Performance**: Optimize bundle size

### Build Optimization

The current build:
- Excludes source maps from production
- Includes only necessary files
- Optimizes bundle size
- Includes portable and installer versions

## 📈 Next Steps

1. **Add Icons**: Replace placeholder icons in `electron/assets/`
2. **Code Signing**: Set up certificates for Windows
3. **Auto Updates**: Implement update mechanism
4. **Testing**: Add automated testing for Electron app
5. **Distribution**: Set up distribution channels

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test locally with `build.bat` or `build.sh`
5. Create a pull request

## 📄 License

MIT License - See LICENSE file for details

---

**Ready to build your standalone Tenders Dashboard executable!** 🚀