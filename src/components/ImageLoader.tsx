import React, { useState, useEffect, useRef } from 'react';

export function ImageLoader({ 
  src, 
  fallbackSrc, 
  alt, 
  className = '', 
  style, 
  priority = false,
  ...props 
}: React.ComponentPropsWithoutRef<'img'> & { fallbackSrc?: string; priority?: boolean }) {
  const [isInView, setIsInView] = useState(priority);
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // A transparent 1x1 pixel as a default fallback to avoid broken browser image icons
  const defaultFallback = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px 0px', // Preload images before they cross the viewport threshold
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [priority]);

  const getLowResSrc = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    
    // Unsplash Integration
    if (url.includes('images.unsplash.com')) {
      if (url.includes('w=')) {
        return url.replace(/w=\d+/, 'w=40&q=15&blur=20');
      }
      return `${url}&w=40&q=15&blur=20`;
    }
    
    // Cloudinary Integration
    if (url.includes('res.cloudinary.com')) {
      if (url.includes('/upload/')) {
        return url.replace('/upload/', '/upload/w_40,c_scale,e_blur:200/');
      }
    }
    
    return undefined;
  };

  const activeSrc = error ? (fallbackSrc || defaultFallback) : src;
  const lowResSrc = getLowResSrc(activeSrc);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {/* 1. Base loading pulse state */}
      {!highResLoaded && (
        <div className="absolute inset-0 bg-white/[0.04] animate-pulse" />
      )}

      {/* 2. Low Resolution Blurry Placeholder (loaded instantly) */}
      {lowResSrc && (
        <img
          src={lowResSrc}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover filter blur-[20px] scale-110 transition-opacity duration-1000 ease-out pointer-events-none ${
            highResLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          referrerPolicy="no-referrer"
        />
      )}

      {/* 3. High Resolution Image Layer */}
      {isInView && (
        <img
          {...props}
          src={activeSrc}
          alt={alt}
          onLoad={() => setHighResLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full transition-all duration-1000 ease-out ${
            highResLoaded 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-105'
          }`}
        />
      )}

      {/* Extra cinematic overlay during loading */}
      {!highResLoaded && (
        <div className="absolute inset-0 bg-brand-black/20 mix-blend-multiply pointer-events-none" />
      )}
    </div>
  );
}

