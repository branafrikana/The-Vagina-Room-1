import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useContent } from '../context/ContentContext';
import EditableText from './EditableText';

interface LogoItem {
  name: string;
  imageUrl: string;
  type: string;
  link?: string;
  headline?: string;
  impactYear?: string;
}

export default function PartnersSlider() {
  const { content } = useContent();
  const logoSize = parseInt(content.partnersLogoSize || '200');
  const [stepSize, setStepSize] = useState(logoSize + 32); 

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const currentSize = isMobile ? Math.min(logoSize, window.innerWidth - 64) : logoSize;
      const gap = isMobile ? 16 : 32;
      setStepSize(currentSize + gap);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [logoSize]);

  // Parse partners logos
  let logos: LogoItem[] = [];
  try {
    logos = JSON.parse(content.partnersLogosJson || '[]');
  } catch (e) {
    logos = [];
  }

  // Seamless looping marquee logos array
  const marqueeLogos = logos.length > 0
    ? [...logos, ...logos, ...logos, ...logos]
    : [];

  if (logos.length === 0) return null;

  return (
    <section id="press-partners" className="py-20 md:py-28 border-t border-b border-white/5 bg-brand-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center mb-12">
        <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.6em] text-white/30">
          <EditableText field="partnersHeading" />
        </h2>
      </div>
      
      <div className="relative py-4 select-none overflow-hidden">
        {/* Blending edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-brand-black via-brand-black/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-brand-black via-brand-black/90 to-transparent z-10 pointer-events-none" />

        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-4 md:gap-8 shrink-0 items-center px-4 md:px-8"
            animate={{
              x: [0, -stepSize * logos.length],
            }}
            transition={{
              repeat: Infinity,
              repeatType: 'loop',
              duration: Math.max(15, logos.length * 6),
              ease: 'linear',
            }}
          >
            {marqueeLogos.map((logo, idx) => (
              <div
                key={`${logo.name}-${idx}`}
                className="aspect-square p-2 md:p-4 flex items-center justify-center bg-white/[0.02] border border-white/5 hover:border-brand-gold/30 rounded-none transition-all duration-700 hover:scale-[1.02] group overflow-hidden shrink-0"
                style={{ 
                  width: window.innerWidth < 768 ? Math.min(logoSize, window.innerWidth - 64) : logoSize 
                }}
              >
                {logo.imageUrl ? (
                  <img
                    src={logo.imageUrl}
                    alt={logo.name}
                    className="w-full h-full object-contain pointer-events-none grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 brightness-110"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-sans font-medium text-sm md:text-lg text-white/70 uppercase tracking-widest group-hover:text-brand-gold transition-colors duration-500 text-center px-4">
                    {logo.name}
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
