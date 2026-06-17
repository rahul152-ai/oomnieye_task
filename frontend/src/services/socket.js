import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL || "/", { autoConnect: false });

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const onNotification = (callback) => {
  socket.on("notification", callback);
  return () => socket.off("notification", callback);
};
