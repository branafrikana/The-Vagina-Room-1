import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Quote, Sparkles, User, Calendar } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

const DEFAULT_SPOTLIGHTS = [
  {
    author: "Amara O.",
    journey: "Healing after years of silent struggle with PCOS.",
    text: "Joining The Vagina Room was the turning point in my reproductive health journey. Dr. FID's guidance helped me understand my body in ways I never thought possible. Today, I feel empowered and restored.",
    date: "June 2026"
  },
  {
    author: "Zainab A.",
    journey: "Reclaiming confidence through intimate wellness education.",
    text: "I used to be so afraid to ask questions. This community provided a safe sanctuary where I could learn without shame. The knowledge I've gained here is priceless.",
    date: "May 2026"
  },
  {
    author: "Chisom E.",
    journey: "A journey of restoration after postpartum complications.",
    text: "The support system here is incredible. Beyond the clinical education, the emotional support from other sisters made all the difference in my recovery.",
    date: "April 2026"
  }
];

export default function MemberSpotlight() {
  const { content } = useContent();

  const spotlight = useMemo(() => {
    let testimonials = [];
    try {
      if (content.testimonialsJson) {
        testimonials = JSON.parse(content.testimonialsJson);
      }
    } catch (e) {
      console.error("Failed to parse testimonialsJson", e);
    }

    const pool = testimonials.length > 0 ? testimonials : DEFAULT_SPOTLIGHTS;
    
    // Select based on week of the year
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekIndex = Math.floor(dayOfYear / 7) % pool.length;
    
    return pool[weekIndex];
  }, [content.testimonialsJson]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 bg-zinc-950 border border-brand-gold/20 rounded-xl overflow-hidden group"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full filter blur-3xl -mr-16 -mt-16 group-hover:bg-brand-gold/10 transition-colors" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-gold/5 rounded-full filter blur-2xl -ml-12 -mb-12" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-gold/10 rounded-lg">
              <Sparkles size={16} className="text-brand-gold animate-pulse" />
            </div>
            <div>
              <h4 className="text-[10px] font-mono text-brand-gold uppercase tracking-[0.3em]">Weekly Member Spotlight</h4>
              <p className="text-[9px] text-white/40 font-light italic">Celebrating our collective healing journeys</p>
            </div>
          </div>
          <div className="p-3 bg-white/5 rounded-full border border-white/5">
            <Quote size={20} className="text-white/20" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-serif italic pr-8">
              "{spotlight.text || spotlight.content}"
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
                <User size={18} />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-white uppercase tracking-wider">{spotlight.author || spotlight.authorName}</p>
                <p className="text-[10px] text-brand-gold/70 font-mono italic">{spotlight.journey || spotlight.role || "Verified Member"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-white/30 text-[9px] font-mono uppercase tracking-widest">
              <Calendar size={12} />
              <span>Spotlight Week: {spotlight.date || "Active Journal"}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
