import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FOCUS_AREAS } from '../constants';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import EditableText from './EditableText';

function FocusAreaCard({ area, index }: { area: typeof FOCUS_AREAS[0], index: number; key?: string | number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const initialItems = area.items.slice(0, 4);
  const remainingItems = area.items.slice(4);
  const hasMore = area.items.length > 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="relative group p-8 sm:p-16 bg-brand-black hover:bg-white/5 transition-all duration-700 h-full overflow-hidden flex flex-col"
    >
      <div className="absolute top-0 left-0 w-2 h-0 bg-brand-red group-hover:h-full transition-all duration-700" />
      <span className="text-brand-gold text-5xl font-serif font-light mb-12 block opacity-20 group-hover:opacity-100 transition-opacity">0{index + 1}</span>
      
      <h3 className="font-sans text-2xl sm:text-4xl font-black mb-8 text-white tracking-tighter uppercase">{area.title}</h3>
      
      <div className="flex-grow">
        <ul className="space-y-6">
          {initialItems.map((item) => (
            <li key={item} className="flex items-start text-sm font-black tracking-widest text-white/40 group-hover:text-white uppercase transition-colors">
              <span className="text-brand-red mr-4">+</span>
              {item}
            </li>
          ))}
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-6 space-y-6">
                  {remainingItems.map((item) => (
                    <li key={item} className="list-none flex items-start text-sm font-black tracking-widest text-white/40 group-hover:text-white uppercase transition-colors">
                      <span className="text-brand-red mr-4">+</span>
                      {item}
                    </li>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ul>
      </div>

      {hasMore && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-12 flex items-center text-[10px] font-black tracking-[0.3em] uppercase text-brand-gold hover:text-white transition-colors group/btn"
        >
          {isExpanded ? 'Show Less' : 'Read More'}
          {isExpanded ? (
            <ChevronUp size={14} className="ml-2 group-hover/btn:-translate-y-1 transition-transform" />
          ) : (
            <ChevronDown size={14} className="ml-2 group-hover/btn:translate-y-1 transition-transform" />
          )}
        </button>
      )}
    </motion.div>
  );
}

export default function FocusAreas() {
  const { content } = useContent();
  let areas = FOCUS_AREAS;
  if (content.focusAreasJson) {
    try {
      areas = JSON.parse(content.focusAreasJson);
    } catch (e) {
      areas = FOCUS_AREAS;
    }
  }

  return (
    <section id="focus-areas" className="py-40 bg-brand-black text-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-32">
          <p className="text-brand-red font-black tracking-[0.5em] uppercase text-xs mb-8">
            <EditableText field="focusAreasSub" />
          </p>
          <h2 className="font-sans text-5xl md:text-6xl font-black leading-[0.8] mb-12 tracking-tighter uppercase">
            <EditableText field="focusAreasTitle" fancyMode="inline" />
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/5">
          {areas.map((area, index) => (
            <FocusAreaCard key={area.title} area={area} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
