import { fetchWithApiBase } from './api';

export async function uploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64 })
        });
        if (!res.ok) {
           throw new Error("Failed to upload image.");
        }
        const data = await res.json();
        resolve(data.url);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = error => reject(error);
  });
}
