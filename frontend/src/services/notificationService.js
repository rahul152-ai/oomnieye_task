import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const getNotifications = async () => {
  const response = await axios.get(`${API_URL}/api/notifications`);
  return response.data;
};
