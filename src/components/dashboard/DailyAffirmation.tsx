import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Quote } from 'lucide-react';

const AFFIRMATIONS = [
  {
    text: "My anatomy is a sacred sanctuary of wisdom, power, and restorative healing.",
    focus: "Somatic Sovereignty"
  },
  {
    text: "I claim complete authority over my pelvic wellness, release shame, and step boldly into cellular peace.",
    focus: "Absolute Strength"
  },
  {
    text: "I honor my cycle, flow, and the unique clinical wisdom of my somatic biology at every stage of womanhood.",
    focus: "Biological Harmony"
  },
  {
    text: "Every breath I take anchors me in absolute grace, somatic safety, and complete physical wholeness.",
    focus: "Mindful Anchor"
  },
  {
    text: "Generations of resilience flow through me; I stand supported by clinical truths and global sisterhood.",
    focus: "Maternal Connection"
  },
  {
    text: "My voice is medicine, my structure is strength, and my wellness is a non-negotiable birthright.",
    focus: "Empowered Presence"
  },
  {
    text: "I offer myself gentle grace, celebrating my personal healing journey and honoring my biological evolution.",
    focus: "Gentle Growth"
  },
  {
    text: "My body's organic capability to heal, restore, and hold space is a powerful testament to somatic beauty.",
    focus: "Organic Vitality"
  }
];

export default function DailyAffirmation() {
  const [index, setIndex] = useState(0);

  // Auto-rotate based on the day of the year to provide a stable daily affirmation,
  // but allow manually scrolling using a touch of exploration.
  useEffect(() => {
    const day = new Date().getDate();
    setIndex(day % AFFIRMATIONS.length);
  }, []);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
  };

  const current = AFFIRMATIONS[index];

  return (
    <div id="daily-affirmation-card" className="p-6 sm:p-8 bg-gradient-to-br from-zinc-950 via-[#121111] to-zinc-950 border border-brand-gold/20 shadow-[0_10px_30px_rgba(212,175,55,0.03)] relative overflow-hidden text-left rounded-none">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/[0.02] blur-xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-brand-gold/[0.01] blur-lg rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-mono text-brand-gold uppercase tracking-[0.3em] bg-brand-gold/5 px-2.5 py-1 border border-brand-gold/10 inline-flex items-center gap-1">
              <Sparkles size={8} className="animate-pulse" /> Focus: {current.focus}
            </span>
            <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">
              Supportive Touch
            </span>
          </div>

          <div className="min-h-[50px] flex items-start gap-3">
            <Quote size={18} className="text-brand-gold/40 mt-1 shrink-0" />
            <AnimatePresence mode="wait">
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.3 }}
                className="text-white/90 font-serif text-sm sm:text-base italic leading-relaxed font-light"
              >
                {current.text}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={handleNext}
          type="button"
          className="group flex items-center gap-2 px-4 py-2.5 bg-white/[0.02] hover:bg-brand-gold/10 border border-white/5 hover:border-brand-gold/30 text-white/70 hover:text-white transition-all text-[9px] font-mono uppercase tracking-[0.2em] shrink-0"
        >
          <span>Seek Spirit</span>
          <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform text-brand-gold" />
        </button>
      </div>
    </div>
  );
}
