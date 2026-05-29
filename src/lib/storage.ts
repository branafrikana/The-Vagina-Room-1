import { fetchWithApiBase } from './api';

export async function uploadImage(file: File): Promise<string> {
  console.log('Starting upload for:', file.name);
  
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const res = await fetchWithApiBase('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      throw new Error(`Upload failed: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('Upload successful, URL:', data.url);
    return data.url;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}
