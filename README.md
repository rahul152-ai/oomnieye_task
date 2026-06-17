# Security Camera Stream Detector

**Interview Project** — A real-time security camera detection dashboard with YOLO-based object recognition, Socket.IO notifications, and automatic alert deduplication.

## Project Overview

This project demonstrates full-stack development with real-time detection and notification system. It streams security camera feeds, detects objects (person, birds, animals), and sends real-time alerts to a web dashboard with severity levels:

- **HIGH severity**: Person detected
- **MEDIUM severity**: Birds, animals, pets detected

### Key Features

- Real-time camera stream processing using YOLO v8
- Automatic alert deduplication (30-second hold window per camera + object type)
- Socket.IO real-time notifications to dashboard
- Multi-camera support
- Persistent notification history in MongoDB
- Responsive React/Vite frontend

## Tech Stack

| Component         | Technology                     |
| ----------------- | ------------------------------ |
| Backend API       | Node.js + Express              |
| Real-time Events  | Socket.IO                      |
| Database          | MongoDB                        |
| Frontend          | React 19 + Vite + Tailwind CSS |
| Detection Service | Python + YOLO v8 + OpenCV      |
| Environment       | Node 18+, Python 3.10+         |

## Project Structure

```
.
├── backend/              # Node.js Express API server
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/       # Database config
│   │   ├── models/       # Mongoose schemas
│   │   ├── controllers/  # Route handlers
│   │   ├── routes/       # API routes
│   │   └── services/     # Business logic (notification deduping)
│   ├── package.json
│   └── .env
├── frontend/             # React Vite dashboard
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/        # Dashboard page
│   │   ├── components/   # CameraCard, NotificationPanel
│   │   └── services/     # API, Socket.IO client
│   ├── package.json
│   └── .env.local
├── detection-service/    # Python detection worker
│   ├── detector.py       # Main YOLO detection loop
│   ├── requirements.txt
│   └── .venv/            # Virtual environment
├── .gitignore
└── README.md
```

## System Requirements

- **Operating System**: Windows 10+, macOS, or Linux
- **RAM**: Minimum 8GB (16GB recommended for smooth detection)
- **Storage**: ~5GB for dependencies (Node modules, Python packages, YOLO model)
- **Network**: Local network for camera streams (RTSP, HTTP, file paths)

### Software Prerequisites

- **Node.js**: 18.x or higher [Download](https://nodejs.org/)
- **Python**: 3.10+ [Download](https://www.python.org/)
- **Git**: [Download](https://git-scm.com/)
- **MongoDB**: Local or cloud instance (MongoDB Atlas free tier recommended)

### Verify Prerequisites

```bash
# Check Node.js
node --version
npm --version

# Check Python
python --version

# Check Git
git --version
```

## Complete Setup Guide

### Step 1: Clone and Navigate to Project

```bash
git clone <your-repo-url>
cd test
```

### Step 2: Backend Setup

#### 2.1 Install Dependencies

```bash
cd backend
npm install
```

#### 2.2 Create Environment Variables

Create `.env` file in `backend/` directory:

```env
# API Server
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/camera-detector
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/camera-detector

# Socket.IO (optional, auto-enabled)
SOCKET_IO_CORS_ORIGIN=http://localhost:5173

# Detection Service
DETECTION_BACKEND_URL=http://localhost:5000
DETECTION_CAMERA_LIST_URL=http://localhost:5000/api/cameras
```

#### 2.3 Verify Backend Starts

```bash
npm run dev
```

Expected output:

```
Server running on 5000
```

**Stop the server** (Ctrl+C) — we'll start it later with all services.

### Step 3: Frontend Setup

Open **new terminal** in project root:

```bash
cd frontend
npm install
```

#### 3.1 Create Frontend Environment

Create `.env.local` in `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000
```

#### 3.2 Verify Frontend Starts

```bash
npm run dev
```

Expected output:

```
  VITE v8.0.12  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in browser — you should see the dashboard (empty until cameras are added).

**Stop the frontend** (Ctrl+C).

### Step 4: Detection Service Setup

Open **new terminal** in project root:

```bash
cd detection-service
```

#### 4.1 Create Python Virtual Environment

**Windows (PowerShell)**:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell execution policy blocks this:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

**macOS/Linux (Bash)**:

```bash
python -m venv .venv
source .venv/bin/activate
```

#### 4.2 Install Python Dependencies

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Expected packages installed:

- `ultralytics` (YOLO v8)
- `opencv-python` (video processing)
- `requests` (API calls)
- Dependencies: torch, torchvision, numpy, etc.

This step downloads ~500MB of packages, may take 5-10 minutes.

#### 4.3 Verify Detection Service

```bash
python detector.py
```

Expected output:

```
Starting detection on 1 camera(s)
Target classes: ['animal', 'bird', 'cat', 'dog', 'horse', 'person', ...]
Detected person on Front Gate (cam1) confidence=0.95
```

**Stop the detector** (Ctrl+C) — it will exit since there are no cameras yet.

### Step 5: Database Setup (MongoDB)

#### Option A: Local MongoDB

```bash
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Windows - download and install MongoDB Community
# https://www.mongodb.com/try/download/community
```

#### Option B: MongoDB Atlas (Cloud) — Recommended for beginners

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a cluster
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/camera-detector`
5. Update `backend/.env` with this URI

### Step 6: Configure Camera Sources

#### 6.1 Add Cameras via Backend

First, start all services (see Step 7). Then POST to backend:

```bash
curl -X POST http://localhost:5000/api/cameras \
  -H "Content-Type: application/json" \
  -d '{
    "cameraId": "cam1",
    "name": "Front Gate",
    "streamUrl": "rtsp://your-camera-stream",
    "status": "ONLINE"
  }'
```

Or add them directly to MongoDB:

```javascript
db.cameras.insertMany([
  {
    cameraId: "cam1",
    name: "Front Gate",
    streamUrl: "rtsp://192.168.1.100:554/stream",
    status: "ONLINE",
  },
  {
    cameraId: "cam2",
    name: "Back Yard",
    streamUrl: "rtsp://192.168.1.101:554/stream",
    status: "ONLINE",
  },
]);
```

#### 6.2 Camera Stream Sources

Supported formats:

- **RTSP**: `rtsp://camera-ip:554/stream`
- **HTTP**: `http://camera-ip/video`
- **Local file**: `videos/sample.mp4` (served via backend `/videos/`)
- **Webcam**: `0` (device index)

### Step 7: Run All Services Together

Open **3 terminals** in project root:

**Terminal 1 - Backend**:

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:

```bash
cd frontend
npm run dev
```

**Terminal 3 - Detection Service**:

```bash
cd detection-service

# Windows
.\.venv\Scripts\Activate.ps1
# macOS/Linux
source .venv/bin/activate

python detector.py
```

### Step 8: Verify Full Stack

1. Open `http://localhost:5173` in browser
2. Dashboard should display camera feeds
3. Detection service logs show detection progress
4. When objects detected, notifications appear in dashboard

### Step 9: Test with Sample Video

To test without live cameras:

1. Place a video file in `backend/videos/test.mp4`
2. Add camera with `streamUrl: "/videos/test.mp4"`
3. Start detection service
4. Notifications should appear as objects are detected

## Environment Variables Reference

### Backend (`.env`)

| Variable      | Example                            | Description         |
| ------------- | ---------------------------------- | ------------------- |
| `PORT`        | `5000`                             | API server port     |
| `MONGODB_URI` | `mongodb://localhost:27017/camera` | Database connection |
| `NODE_ENV`    | `development`                      | Environment mode    |

### Frontend (`.env.local`)

| Variable       | Example                 | Description          |
| -------------- | ----------------------- | -------------------- |
| `VITE_API_URL` | `http://localhost:5000` | Backend API base URL |

### Detection Service (PowerShell env variables)

```powershell
$env:DETECTION_BACKEND_URL='http://localhost:5000'
$env:DETECTION_CAMERA_LIST_URL='http://localhost:5000/api/cameras'
$env:HOLD_WINDOW_SECONDS='30'
$env:FRAME_SKIP='2'
$env:MIN_CONFIDENCE='0.35'
$env:DETECTION_TARGET_CLASSES='person,bird,cat,dog,horse,cow,sheep'
```

## Troubleshooting

### Backend won't start

```bash
# Port 5000 already in use?
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Fix: Kill process or change PORT in .env
```

### MongoDB connection error

```
MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: Start MongoDB service or update `MONGODB_URI` to cloud instance.

### Python virtual environment not activating

```bash
# Windows - execution policy
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# macOS/Linux - use bash not zsh
bash
source .venv/bin/activate
```

### Detection service can't fetch cameras

```
Unable to fetch camera list: HTTPConnectionError
```

**Solution**: Verify backend is running and `DETECTION_BACKEND_URL` is correct.

### No video frames displayed in dashboard

1. Verify camera `streamUrl` is accessible
2. Check backend logs for `/videos` serving errors
3. Try local file path first: `/videos/test.mp4`

## API Endpoints

### Cameras

- `GET /api/cameras` — List all cameras
- `POST /api/cameras` — Add new camera (for future implementation)

### Notifications

- `GET /api/notifications` — Get last 50 notifications
- `POST /api/notifications` — Create notification (internal use)

### Real-time Events (Socket.IO)

```javascript
// Listen for new notifications
socket.on("notification", (data) => {
  console.log(data); // { cameraId, cameraName, objectType, severity, message, createdAt }
});
```

## Project Workflow

```
YOLO Detector (Python)
    ↓
POST /api/notifications
    ↓
Backend Dedupe Check (30-sec hold)
    ↓ (if new)
Save to MongoDB
    ↓
Broadcast via Socket.IO
    ↓
Frontend Receives (real-time)
    ↓
Display in Dashboard
```

## Key Implementation Details

### Notification Deduplication

Located in `backend/src/services/detection.service.js`:

- Maintains `activeNotifications` Map keyed by `{cameraId}:{objectType}`
- Suppresses duplicate detections for 30 seconds
- Resets timer when same object detected again
- Prevents alert spam (e.g., 900 alerts for person visible 30 sec)

### Socket.IO Integration

`frontend/src/services/socket.js`:

```javascript
export const connectSocket = () => { ... }
export const onNotification = (callback) => { ... }
```

Called in `Dashboard.jsx` to listen for real-time alerts.

### YOLO Detection Loop

`detection-service/detector.py`:

- Fetches camera list from backend API
- Opens multiple `cv2.VideoCapture` streams
- Runs YOLO inference on each frame
- Respects `FRAME_SKIP` and `MIN_CONFIDENCE` thresholds
- Posts detections to backend only if they pass dedup check

## Next Steps / Enhancements

- [ ] Add authentication (JWT)
- [ ] Store detection metadata (bounding boxes, confidence scores)
- [ ] Add timezone support for timestamps
- [ ] Implement notification filters in UI
- [ ] Add Docker containerization
- [ ] Deploy to cloud (AWS/GCP/Heroku)
- [ ] Add email/SMS alert integration
- [ ] Performance: Add detection caching/model optimization

## Interview Context

This project was developed as an assessment of:

- Full-stack JavaScript/TypeScript capabilities
- Python backend integration
- Real-time communication (Socket.IO)
- Database design (MongoDB schema)
- System design (multi-process architecture)
- Frontend state management and UX
- Deployment and DevOps considerations

## Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Verify all environment variables are set
3. Check browser console for frontend errors
4. Check terminal logs for backend/detection errors
5. Ensure all three services are running on correct ports

## License

MIT
