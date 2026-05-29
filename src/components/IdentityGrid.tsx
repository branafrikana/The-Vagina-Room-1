import { motion } from 'motion/react';
import { useContent } from '../context/ContentContext';
import EditableText from './EditableText';
import { ImageLoader } from './ImageLoader';

export default function IdentityGrid() {
  const { content } = useContent();
  const fallbackIdentities = [
    { label: content.identityLabel1 || 'Holistic Wellness', image: content.identityImg1 || 'https://images.unsplash.com/photo-1576089234411-497c62ca621e?auto=format&fit=crop&q=80&w=800' },
    { label: content.identityLabel2 || 'Integrative Therapy', image: content.identityImg2 || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800' },
    { label: content.identityLabel3 || 'SPA Business Expert', image: content.identityImg3 || 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=800' },
    { label: content.identityLabel4 || 'Women’s Health', image: content.identityImg4 || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800' }
  ];

  let identities = fallbackIdentities;
  if (content.identitiesJson) {
    try {
      identities = JSON.parse(content.identitiesJson);
      if (!Array.isArray(identities) || identities.length === 0) {
        identities = fallbackIdentities;
      }
    } catch {
      identities = fallbackIdentities;
    }
  }

  const colsClass = identities.length === 1 ? 'lg:grid-cols-1' :
                    identities.length === 2 ? 'lg:grid-cols-2' :
                    identities.length === 3 ? 'lg:grid-cols-3' :
                    identities.length === 5 ? 'lg:grid-cols-5' :
                    identities.length >= 6 ? 'lg:grid-cols-6' : 'lg:grid-cols-4';

  return (
    <section className="bg-brand-black">
      {/* Label Bar (Top) */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className={`bg-brand-gold/20 border-y border-white/5 grid grid-cols-2 ${colsClass} overflow-x-auto lg:overflow-visible`}
      >
        {identities.map((item, index) => (
          <div key={index} className="py-8 px-4 text-center border-r border-white/5 last:border-0 min-w-[150px] lg:min-w-0">
             <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white whitespace-nowrap">
               {item.label}
             </span>
          </div>
        ))}
      </motion.div>

      {/* Image Grid */}
      <div className={`grid grid-cols-2 ${colsClass} h-[400px] lg:h-[500px]`}>
        {identities.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative group overflow-hidden border-r border-white/5 last:border-0 grayscale hover:grayscale-0 transition-all duration-1000 cursor-crosshair"
          >
            <ImageLoader 
              src={item.image} 
              alt={item.label} 
              className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-125"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-brand-black/20 group-hover:bg-transparent transition-colors" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <div className="w-16 h-16 border border-white/40 flex items-center justify-center text-white backdrop-blur-sm">
                  <span className="text-2xl font-serif italic">+</span>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Brand Bar (Bottom) - Inspired by 'PRESS ROOM' etc */}
      <div className="bg-brand-gold/10 border-b border-white/5 overflow-hidden">
        <div className="flex items-center space-x-20 py-8 px-12 animate-[scroll_40s_linear_infinite] whitespace-nowrap">
          {Array(10).fill(content.tickerText || "TRUSTED EDUCATION • EXPERT GUIDANCE • EMOTIONAL SUPPORT • HOLISTIC WELLNESS • THE VAGINA ROOM GLOBAL • ").map((text, i) => (
            <span key={i} className="text-sm font-black tracking-[0.5em] text-white/20 uppercase whitespace-nowrap">{text}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
