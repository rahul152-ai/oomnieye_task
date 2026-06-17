const formatTimestamp = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString();
};

export default function NotificationPanel({ notifications }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-bold mb-4">Notifications</h2>

      <div className="space-y-2">
        {notifications.map((item) => (
          <div
            key={item.id || item._id}
            className={`p-3 rounded ${
              item.severity === "HIGH" ? "bg-red-100" : "bg-yellow-100"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold">
                  {item.severity === "HIGH" ? "🔴" : "🟡"} {item.message}
                </div>
                <div className="text-sm text-slate-600">
                  Camera: {item.cameraId}
                </div>
              </div>
              <div className="text-xs text-slate-500 text-right">
                {formatTimestamp(item.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
