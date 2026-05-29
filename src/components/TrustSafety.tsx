import { motion } from 'motion/react';
import { ShieldCheck, Lock, Heart, MessageSquare, Sparkles } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import EditableText from './EditableText';

export default function TrustSafety() {
  const { content } = useContent();

  const fallbackPriorities = [
    "Privacy",
    "Respect",
    "Emotional safety",
    "Non-judgmental learning",
    "Compassionate guidance",
    "Restoration"
  ];

  const prioritiesList = content.tsList
    ? content.tsList.split("\n").map(s => s.trim()).filter(Boolean)
    : fallbackPriorities;

  const iconMap: Record<string, any> = {
    "privacy": Lock,
    "respect": Heart,
    "emotional safety": ShieldCheck,
    "non-judgmental learning": MessageSquare,
    "compassionate guidance": Heart,
    "restoration": Sparkles
  };

  return (
    <section className="py-32 bg-brand-black text-white relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(196,30,58,0.03)_0%,transparent_50%)]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >
            <p className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8">
              <EditableText field="tsSub" />
            </p>
            <h2 className="font-sans text-4xl md:text-6xl font-black mb-8 text-white leading-[0.9] tracking-tighter uppercase">
              <EditableText field="tsTitle" fancyMode="inline" />
            </h2>
            <p className="text-lg text-white/50 font-light max-w-sm block">
              <EditableText field="tsDesc" multiline />
            </p>
          </motion.div>

          {/* Priorities */}
          <div className="lg:col-span-7">
            <div className="bg-white/5 p-12 border border-white/10">
              <p className="text-xs font-black tracking-[0.3em] uppercase text-white/30 mb-12 border-b border-white/5 pb-4">
                We prioritize:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-8">
                {[...Array(6)].map((_, index) => {
                  const titleField = `tsPillar${index + 1}Title`;
                  const descField = `tsPillar${index + 1}Desc`;
                  const IconComponent = [Lock, Heart, ShieldCheck, MessageSquare, Heart, Sparkles][index] || ShieldCheck;

                  return (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col group"
                    >
                      <div className="flex items-center space-x-6 mb-4">
                        <div className="w-12 h-12 flex items-center justify-center border border-white/10 group-hover:border-brand-gold transition-colors">
                          <IconComponent size={20} className="text-brand-gold" />
                        </div>
                        <span className="text-xl font-bold tracking-tight uppercase group-hover:text-brand-gold transition-colors">
                           <EditableText field={titleField} />
                        </span>
                      </div>
                      <p className="text-xs text-white/40 italic font-light leading-relaxed pl-[4.5rem]">
                        <EditableText field={descField} multiline />
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8"
              >
                <p className="text-xl md:text-2xl font-serif italic text-white/90 block">
                  <EditableText field="tsQuote" multiline />
                </p>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
