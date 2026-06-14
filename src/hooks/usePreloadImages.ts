import { useEffect, useState } from 'react';

export const usePreloadImages = (imageUrls: string[]) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (imageUrls.length === 0) {
      setLoaded(true);
      return;
    }

    let loadedCount = 0;
    const total = imageUrls.length;

    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount === total) {
        setLoaded(true);
      }
    };

    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = checkLoaded;
      img.onerror = checkLoaded; // Still complete the count even if it fails
    });
  }, [imageUrls]);

  return loaded;
};
