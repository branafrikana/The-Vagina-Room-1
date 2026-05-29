import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FOCUS_AREAS } from '../constants';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import EditableText from './EditableText';

function FocusAreaCard({ index }: { index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { content } = useContent();
  
  const titleField = `focusArea${index + 1}Title`;
  const itemsField = `focusArea${index + 1}Items`;
  
  const itemsText = (content as any)[itemsField] || "";
  const items = itemsText.split("\n").map((s: string) => s.trim()).filter(Boolean);

  const initialItems = items.slice(0, 4);
  const remainingItems = items.slice(4);
  const hasMore = items.length > 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="relative group p-8 sm:p-16 bg-transparent border-r border-white/5 last:border-0 hover:bg-white/5 transition-all duration-700 h-full overflow-hidden flex flex-col"
    >
      <span className="text-brand-gold text-5xl font-sans font-black mb-12 block opacity-40 group-hover:opacity-100 transition-opacity">0{index + 1}</span>
      
      <h3 className="font-sans text-2xl font-black mb-8 text-white tracking-widest uppercase">
        <EditableText field={titleField} />
      </h3>
      
      <div className="flex-grow">
        <EditableText field={itemsField} multiline className="space-y-4 block" as="ul">
          {initialItems.map((item: string) => (
            <li key={item} className="flex items-start text-sm font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
              <span className="text-brand-gold mr-4">+</span>
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
                <div className="pt-6 space-y-4">
                  {remainingItems.map((item: string) => (
                    <li key={item} className="list-none flex items-start text-sm font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
                      <span className="text-brand-gold mr-4">+</span>
                      {item}
                    </li>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </EditableText>
      </div>

      {hasMore && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-12 flex items-center text-[10px] font-black tracking-[0.5em] uppercase text-brand-gold hover:text-white transition-colors group/btn"
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
  return (
    <section id="focus-areas" className="py-40 bg-[#050505] text-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24 px-6 text-center">
          <p className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8">
            <EditableText field="focusAreasSub" />
          </p>
          <h2 className="font-sans text-5xl md:text-7xl font-black leading-none mb-12 tracking-tighter uppercase text-white">
            <EditableText field="focusAreasTitle" fancyMode="inline" />
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-y border-white/5">
          <FocusAreaCard index={0} />
          <FocusAreaCard index={1} />
          <FocusAreaCard index={2} />
        </div>
      </div>
    </section>
  );
}
