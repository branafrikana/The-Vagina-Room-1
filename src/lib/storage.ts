import { fetchWithApiBase } from './api';

export async function uploadImage(file: File): Promise<string> {
  console.log('Starting local base64 mock upload for:', file.name);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
