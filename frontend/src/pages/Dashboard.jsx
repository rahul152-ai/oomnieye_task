import { useEffect, useState } from "react";
import CameraCard from "../components/CameraCard";
import NotificationPanel from "../components/NotificationPanel";
import { getCameras } from "../services/cameraService";
import { getNotifications } from "../services/notificationService";
import { connectSocket, onNotification } from "../services/socket";
const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [cameras, setCameras] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchCameras = async () => {
      const data = await getCameras();
      setCameras(data);
    };

    const fetchNotifications = async () => {
      const data = await getNotifications();
      setNotifications(data.slice(0, 50));
    };

    fetchCameras();
    fetchNotifications();
  }, []);

  useEffect(() => {
    const socket = connectSocket();

    const unsubscribe = onNotification((notification) => {
      setNotifications((current) => [notification, ...current].slice(0, 50));
    });

    return () => {
      unsubscribe();
      if (socket && socket.disconnect) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4">
        {cameras.map((camera) => (
          <CameraCard
            key={camera.id}
            title={camera.cameraId}
            videoUrl={`${API_URL}${camera.streamUrl}`}
          />
        ))}
      </div>

      <div className="mt-6">
        <NotificationPanel notifications={notifications} />
      </div>
    </div>
  );
}
