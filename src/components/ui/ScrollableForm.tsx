import React, { useRef, useEffect } from 'react';

interface ScrollableFormProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A branded wrapper for long forms that detects overflow and adds custom scrollbar styles.
 */
export default function ScrollableForm({ children, className = "" }: ScrollableFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Basic detection for future styling enhancements if needed
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin 
                  scrollbar-thumb-brand-gold/30 scrollbar-track-brand-black 
                  hover:scrollbar-thumb-brand-gold/50 ${className}`}
      style={{
        scrollbarWidth: 'thin',
      }}
    >
      {children}
    </div>
  );
}
