import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "";

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export const uploadImage = (file: File) => {
  return new Promise<{ data: { url: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve({ data: { url: reader.result as string } });
    reader.onerror = error => reject(error);
  });
};

export default apiClient;
