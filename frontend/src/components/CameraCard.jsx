export default function CameraCard({ videoUrl, title }) {
  return (
    <div className="bg-white rounded-xl shadow p-3">
      <h2 className="font-semibold mb-2">{title}</h2>

      <video
        src={videoUrl}
        controls
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-72 rounded-lg object-cover"
        style={{ maxHeight: 360 }}
      />
    </div>
  );
}
