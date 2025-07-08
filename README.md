# 📊 Tenders Dashboard - Complete Project

A comprehensive Tenders Dashboard built with React, FastAPI, and MongoDB featuring an advanced GANTT chart, live countdown panel, interactive charts, and professional PDF export capabilities.

## 🎯 Features

### 🎯 Live Countdown Panel (NEW!)
- **Real-time Countdown**: Live timer showing hours, minutes, seconds remaining
- **Color-coded Urgency**: 🔴 Red (&lt;1h), 🟠 Orange (&lt;4h), 🟢 Green (safe)
- **Smart Notifications**: Optional popup alerts when tenders expire
- **Next Tender Detection**: Automatically finds closest upcoming deadline
- **Reminder Toggle**: 🔔 Enable/disable notification system

### ⏰ Time Management (UPDATED!)
- **Time-only Field**: Due time accepts only hours:minutes (no date)
- **Today-based Logic**: Time is automatically applied to current date
- **Clean Display**: Shows "2:30 PM" format throughout dashboard
- **GANTT Integration**: Due times displayed next to customer names

### 📈 GANTT Chart
- **Horizontal Scrolling**: Smooth scrolling timeline with fixed left column
- **Auto-scroll to Today**: Automatically centers on current date when loaded
- **Interactive Timeline**: Hover effects with date tooltips
- **Status Visualization**: Color-coded progress bars with status indicators
- **Flag Indicators**: Green/red flags for Won/Lost status
- **Zoom Controls**: Zoom in/out functionality with percentage display
- **"Go to Today" Button**: Quick navigation to current date

### 🎨 Dashboard Features
- **Dark Theme**: Professional dark UI throughout the application
- **Interactive Charts**: Sales Funnel, Customer Pie Chart, Priority Bar Chart
- **Real-time Filtering**: Filter by Status, Priority, and Customer
- **CRUD Operations**: Create, Read, Update, Delete tenders
- **PDF Export**: Professional PDF reports with exact UI replication
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### 🔧 Technical Stack
- **Frontend**: React 18, Tailwind CSS, Recharts, jsPDF, html2canvas
- **Backend**: FastAPI, Python 3.9+, Pydantic
- **Database**: MongoDB with UUID-based IDs
- **Authentication**: Single-user (no authentication required)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- Python 3.9+
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. **Extract the project:**
   ```bash
   tar -xzf tenders-dashboard-project.tar.gz
   cd tenders-dashboard-project
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   # or
   yarn install
   ```

4. **Configure Environment Variables:**
   
   **Backend (.env):**
   ```env
   MONGO_URL=mongodb://localhost:27017/sales_dashboard
   # or for MongoDB Atlas:
   # MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
   ```
   
   **Frontend (.env):**
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8001
   WDS_SOCKET_PORT=443
   ```

5. **Start the Development Servers:**
   
   **Backend (Terminal 1):**
   ```bash
   cd backend
   uvicorn server:app --reload --host 0.0.0.0 --port 8001
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm start
   # or
   yarn start
   ```

6. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001/api
   - API Documentation: http://localhost:8001/docs

## 📁 Project Structure

```
tenders-dashboard-project/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   ├── src/
│   │   ├── App.js          # Main application component with Live Countdown Panel
│   │   ├── App.css         # Tailwind CSS and custom styles
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Global styles
│   ├── package.json        # Frontend dependencies
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── .env               # Frontend environment variables
├── backend/                 # FastAPI backend application
│   ├── server.py           # Main FastAPI application (Tenders API)
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Backend environment variables
├── scripts/                # Development scripts
├── tests/                  # Test files
└── README.md              # This file
```

## 🔧 API Endpoints

### Tenders (Updated from Offers)
- `GET /api/tenders` - Get all tenders (with optional filtering)
- `POST /api/tenders` - Create a new tender
- `GET /api/tenders/{id}` - Get tender by ID
- `PUT /api/tenders/{id}` - Update tender
- `DELETE /api/tenders/{id}` - Delete tender

### Filters
- `GET /api/tenders/filters/customers` - Get unique customers
- `GET /api/tenders/filters/sales-reps` - Get unique sales representatives

### Health Check
- `GET /api` - API health check

## 📊 Data Model

### Tender Schema (Updated)
```json
{
  "id": "uuid",
  "item": "string",
  "customer": "string",
  "tender_name": "string",
  "status": "Round 1|Round 2|Round 3|Round 4|BAFO|Won|Lost",
  "start_date": "YYYY-MM-DD",
  "expiry_date": "YYYY-MM-DD",
  "due_date": "YYYY-MM-DDTHH:MM:SS",
  "deal_value": "number",
  "priority": "High|Medium|Low",
  "assigned_sales_rep": "string"
}
```

## 🎨 Features Detail

### Live Countdown Panel (NEW!)
- **Position**: Fixed top-right corner panel
- **Real-time Updates**: Updates every second
- **Color Coding**: Red/Orange/Green based on urgency
- **Notifications**: Optional popup alerts for expired tenders
- **Smart Detection**: Automatically shows next upcoming deadline

### Time Management (UPDATED!)
- **Input**: Time-only field (HH:MM format)
- **Display**: "2:30 PM" format throughout dashboard
- **Logic**: Time combined with current date for storage
- **GANTT**: Due times shown next to customer names

### GANTT Chart
- **Fixed Left Column**: Project details stay frozen while timeline scrolls
- **Horizontal Scrolling**: Smooth scrolling with visible scrollbar
- **Auto-scroll**: Automatically centers on today's date
- **Status Colors**: Different colors for each status (Round 1-4, BAFO, Won, Lost)
- **Interactive Elements**: Hover effects, date tooltips, zoom controls

### Charts
- **Sales Funnel**: Area chart showing pipeline progression
- **Customer Pie Chart**: Deal value distribution by customer
- **Priority Bar Chart**: Tenders and values by priority level

### PDF Export
- **High Resolution**: 3x scale for crisp graphics
- **Landscape Orientation**: Better layout for wide content
- **Professional Formatting**: Headers, footers, page numbers
- **Complete Capture**: GANTT, charts, and tables included

## 🔧 Development

### Adding New Features
1. Backend: Add new endpoints in `backend/server.py`
2. Frontend: Create new components in `frontend/src/`
3. Database: MongoDB schema is flexible - just add new fields to the Tender model

### Customization
- **Colors**: Modify status colors in `getBarColor()` function
- **Charts**: Customize chart configurations in respective components
- **Styling**: Update Tailwind classes or custom CSS in `App.css`
- **Countdown**: Adjust timer intervals and notification logic in `LiveCountdownPanel`

## 📝 Environment Variables

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=443
```

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017/sales_dashboard
```

## 🚀 Production Deployment

### Frontend Build
```bash
cd frontend
npm run build
# Serve the build folder with a web server
```

### Backend Production
```bash
cd backend
pip install gunicorn
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

## 🐛 Troubleshooting

### Common Issues
1. **Frontend not loading**: Check if backend is running and accessible
2. **MongoDB connection**: Verify MongoDB is running and connection string is correct
3. **CORS errors**: Ensure backend CORS is configured for your frontend URL
4. **Port conflicts**: Change ports in environment variables if needed
5. **Time field issues**: Ensure time format is HH:MM

### Debug Mode
- Backend: Set `reload=True` in uvicorn command
- Frontend: `npm start` enables hot reload automatically

## 📞 Support

This is a complete, self-contained project. All dependencies and configurations are included. 

### Key Dependencies
- **Frontend**: React, Tailwind CSS, Recharts, jsPDF, html2canvas, Axios
- **Backend**: FastAPI, Uvicorn, Motor (async MongoDB), Pydantic
- **Database**: MongoDB

## 🎉 Enjoy Your Tenders Dashboard!

You now have a complete, professional Tenders Dashboard with live countdown functionality, time-only due fields, and all the advanced features we implemented together!