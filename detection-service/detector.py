import os
import time
import cv2
import requests
from urllib.parse import urljoin
from ultralytics import YOLO

API_URL = os.environ.get("DETECTION_BACKEND_URL", "http://localhost:5000")
CAMERA_LIST_URL = os.environ.get("DETECTION_CAMERA_LIST_URL", f"{API_URL}/api/cameras")
STREAM_URL = os.environ.get("DETECTION_STREAM_URL")
HOLD_WINDOW_SECONDS = int(os.environ.get("HOLD_WINDOW_SECONDS", "30"))
REQUEST_TIMEOUT_SECONDS = int(os.environ.get("REQUEST_TIMEOUT_SECONDS", "3"))
FRAME_SKIP = int(os.environ.get("FRAME_SKIP", "2"))
MIN_CONFIDENCE = float(os.environ.get("MIN_CONFIDENCE", "0.35"))
TARGET_CLASSES = set(
    cls.strip().lower()
    for cls in os.environ.get(
        "DETECTION_TARGET_CLASSES",
        "person,bird,cat,dog,horse,cow,sheep",
    ).split(",")
    if cls.strip()
)

model = YOLO("yolov8n.pt")
last_sent = {}


def resolve_stream_url(stream_url):
    if not stream_url:
        return None
    if stream_url.startswith("http"):
        return stream_url
    if stream_url.startswith("/"):
        return urljoin(API_URL, stream_url)
    return stream_url


def fetch_camera_list():
    try:
        response = requests.get(CAMERA_LIST_URL, timeout=REQUEST_TIMEOUT_SECONDS)
        response.raise_for_status()
        cameras = response.json()
        if not isinstance(cameras, list):
            raise ValueError("Camera list response must be an array")
        return cameras
    except requests.RequestException as exc:
        raise RuntimeError(f"Unable to fetch camera list: {exc}") from exc


def open_camera_captures(cameras):
    captures = []
    for camera in cameras:
        stream_url = resolve_stream_url(camera.get("streamUrl") or camera.get("url"))
        if not stream_url:
            print(f"Skipping camera without stream URL: {camera}")
            continue

        capture = cv2.VideoCapture(stream_url)
        if not capture.isOpened():
            print(f"Unable to open stream for {camera.get('cameraId', camera.get('id', 'unknown'))}: {stream_url}")
            continue

        captures.append(
            {
                "cameraId": camera.get("cameraId") or camera.get("id") or "unknown",
                "cameraName": camera.get("name") or camera.get("cameraId") or camera.get("id") or "Unknown camera",
                "streamUrl": stream_url,
                "capture": capture,
                "frameIndex": 0,
            }
        )

    return captures


def should_send(label, camera_id):
    now = time.time()
    key = f"{camera_id}:{label}"
    since_last = now - last_sent.get(key, 0)

    if since_last < HOLD_WINDOW_SECONDS:
        return False

    last_sent[key] = now
    return True


def post_detection(camera_id, camera_name, label):
    payload = {
        "cameraId": camera_id,
        "cameraName": camera_name,
        "objectType": label,
    }

    try:
        response = requests.post(
            f"{API_URL}/api/notifications",
            json=payload,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        print(f"Failed to send notification for {camera_id}: {exc}")


def run_detection():
    if STREAM_URL:
        cameras = [
            {
                "cameraId": os.environ.get("DETECTION_CAMERA_ID", "cam1"),
                "name": os.environ.get("DETECTION_CAMERA_NAME", "Camera 1"),
                "streamUrl": STREAM_URL,
            }
        ]
    else:
        cameras = fetch_camera_list()

    captures = open_camera_captures(cameras)
    if not captures:
        raise RuntimeError("No camera stream could be opened.")

    print(f"Starting detection on {len(captures)} camera(s)")
    print(f"Target classes: {sorted(TARGET_CLASSES)}")

    try:
        while True:
            for camera in captures:
                success, frame = camera["capture"].read()
                if not success:
                    continue

                camera["frameIndex"] += 1
                if FRAME_SKIP > 1 and camera["frameIndex"] % FRAME_SKIP != 0:
                    continue

                results = model(frame)
                for result in results:
                    for box in result.boxes:
                        confidence = float(box.conf[0])
                        if confidence < MIN_CONFIDENCE:
                            continue

                        class_id = int(box.cls[0])
                        label = model.names[class_id].lower()

                        if label in TARGET_CLASSES and should_send(label, camera["cameraId"]):
                            print(
                                f"Detected {label} on {camera['cameraName']} ({camera['cameraId']}) confidence={confidence:.2f}"
                            )
                            post_detection(camera["cameraId"], camera["cameraName"], label)
    finally:
        for camera in captures:
            camera["capture"].release()


if __name__ == "__main__":
    run_detection()
