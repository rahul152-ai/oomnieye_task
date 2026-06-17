# Security Camera Stream Detector

This repository contains a security camera dashboard with real-time detection notifications.

## Project Structure

- `backend/` - Express API and Socket.IO server
- `frontend/` - React/Vite dashboard UI
- `detection-service/` - Python YOLO detection service

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+ with virtual environment support
- Git

## Setup

### 1. Clone repository

```bash
git clone <repo-url>
cd test
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` if needed. Example:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/camera
```

Start backend:

```bash
npm run dev
```

### 3. Frontend setup

Open a new terminal and run:

```bash
cd frontend
npm install
npm run dev
```

By default, Vite will start the frontend on `http://localhost:5173`.

### 4. Detection service setup

Open another terminal and run:

```bash
cd detection-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

If the venv activation script is blocked, run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### 5. Configure camera sources

The detection service uses environment variables for camera streams.

For a single stream example:

```powershell
$env:DETECTION_BACKEND_URL='http://localhost:5000'
$env:DETECTION_STREAM_URL='rtsp://your-camera-stream'
$env:DETECTION_CAMERA_ID='cam1'
$env:DETECTION_CAMERA_NAME='Front Gate'
.\.venv\Scripts\python.exe detector.py
```

For multiple cameras, configure the backend `GET /api/cameras` endpoint to return a list of cameras with `cameraId`, `name`, and `streamUrl`.

### 6. Start the detector

Run from `detection-service`:

```powershell
.\.venv\Scripts\python.exe detector.py
```

### 7. Dashboard usage

- The dashboard fetches camera list from backend and renders live camera streams
- Notifications appear in real time via Socket.IO
- `person` detections are HIGH severity, animals/birds are MEDIUM
- Duplicate alerts for the same camera and object type are suppressed for 30 seconds

## Notes

- Keep the detection service running to receive live alerts
