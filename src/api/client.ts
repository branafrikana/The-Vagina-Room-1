import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "";

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export default apiClient;
