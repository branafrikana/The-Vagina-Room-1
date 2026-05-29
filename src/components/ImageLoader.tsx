import React, { useState } from 'react';

export function ImageLoader({ src, fallbackSrc, alt, ...props }: React.ComponentPropsWithoutRef<'img'> & { fallbackSrc?: string }) {
  const [error, setError] = useState(false);
  
  // A transparent 1x1 pixel as a default fallback to avoid broken browser image icons
  const defaultFallback = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

  return (
    <img
      {...props}
      loading="lazy"
      src={error ? (fallbackSrc || defaultFallback) : src}
      alt={alt}
      onError={() => {
        if (!error) {
          setError(true);
        }
      }}
    />
  );
}
