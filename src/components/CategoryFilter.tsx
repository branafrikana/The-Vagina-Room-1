import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Filter } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  label?: string;
}

export default function CategoryFilter({ categories, activeCategory, onCategoryChange, label = "Filter by Category" }: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 hover:border-brand-gold/50 transition-all group"
      >
        <Filter size={14} className="text-brand-gold opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="text-left min-w-[160px]">
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 mb-1 leading-none">{label}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-white leading-none">{activeCategory}</p>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-brand-gold transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-full min-w-[240px] bg-brand-black border border-white/10 shadow-2xl z-50 overflow-hidden"
          >
            <div className="py-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onCategoryChange(cat);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/5 flex items-center justify-between group ${
                    activeCategory === cat ? 'text-brand-gold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {cat}
                  {activeCategory === cat && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="w-1 h-1 bg-brand-gold rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
