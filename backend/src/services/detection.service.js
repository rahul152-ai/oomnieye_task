const Notification = require("../models/Notification");

const HOLD_WINDOW_MS = 30 * 1000;
const NOTIFICATION_CLASSES = new Set([
  "person",
  "bird",
  "cat",
  "dog",
  "horse",
  "cow",
  "sheep",
  "goat",
  "zebra",
  "giraffe",
  "elephant",
  "bear",
  "tiger",
  "lion",
  "monkey",
]);

const DETECTION_LABELS = {
  person: "Person",
  bird: "Bird",
  cat: "Cat",
  dog: "Dog",
  horse: "Horse",
  cow: "Cow",
  sheep: "Sheep",
  goat: "Goat",
  zebra: "Zebra",
  giraffe: "Giraffe",
  elephant: "Elephant",
  bear: "Bear",
  tiger: "Tiger",
  lion: "Lion",
  monkey: "Monkey",
};

const activeNotifications = new Map();

const normalizeObjectType = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const getSeverity = (objectType) => {
  if (objectType === "person") return "HIGH";
  if (NOTIFICATION_CLASSES.has(objectType)) return "MEDIUM";
  return null;
};

const formatCameraLabel = (cameraName, cameraId) =>
  cameraName || cameraId || "Unknown camera";

const buildNotificationMessage = (objectType, cameraName, cameraId) => {
  const label = DETECTION_LABELS[objectType] || objectType;
  const cameraLabel = formatCameraLabel(cameraName, cameraId);

  return `${label} detected on ${cameraLabel}`;
};

const scheduleReset = (key) => {
  const entry = activeNotifications.get(key);

  if (!entry) {
    return;
  }

  clearTimeout(entry.timer);
  entry.timer = setTimeout(
    () => activeNotifications.delete(key),
    HOLD_WINDOW_MS,
  );
};

const createNotificationForDetection = async ({
  cameraId,
  cameraName,
  objectType,
  io,
}) => {
  const normalizedObjectType = normalizeObjectType(objectType);
  const severity = getSeverity(normalizedObjectType);

  if (!severity) {
    return null;
  }

  const key = `${cameraId}:${normalizedObjectType}`;
  const activeNotification = activeNotifications.get(key);

  if (activeNotification) {
    scheduleReset(key);
    return null;
  }

  const message = buildNotificationMessage(
    normalizedObjectType,
    cameraName,
    cameraId,
  );

  const notification = new Notification({
    cameraId,
    cameraName,
    objectType: normalizedObjectType,
    severity,
    message,
  });

  const savedNotification = await notification.save();

  if (io && typeof io.emit === "function") {
    io.emit("notification", savedNotification);
  }

  const timer = setTimeout(
    () => activeNotifications.delete(key),
    HOLD_WINDOW_MS,
  );

  activeNotifications.set(key, {
    timer,
    notificationId: savedNotification._id,
    cameraId,
    objectType: normalizedObjectType,
  });

  return savedNotification;
};

module.exports = {
  createNotificationForDetection,
};
