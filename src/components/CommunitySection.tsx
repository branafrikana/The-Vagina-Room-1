import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import EditableText from './EditableText';

export default function CommunitySection() {
  const { content } = useContent();

  const fallbackExperiences = [
    "Educational wellness sessions",
    "Women’s health awareness discussions",
    "Safe and supportive conversations",
    "Expert-led guidance and insights",
    "Confidential peer community interaction",
    "Practical reproductive and intimate health education",
    "Emotional wellness and confidence support",
    "Restorative wellness and holistic self-care"
  ];

  const experiences = content.communityExperiences
    ? content.communityExperiences.split("\n").map(s => s.trim()).filter(Boolean)
    : fallbackExperiences;

  return (
    <section className="py-40 bg-brand-black text-white relative overflow-hidden border-t border-brand-gold/10">
      <div className="absolute inset-0 bg-brand-gold/[0.015] pointer-events-none" />
      {/* Decorative vertical lines */}
      <div className="absolute inset-0 flex justify-between px-6 pointer-events-none opacity-5">
        <div className="w-px h-full bg-white" />
        <div className="w-px h-full bg-white hidden md:block" />
        <div className="w-px h-full bg-white hidden md:block" />
        <div className="w-px h-full bg-white" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          
          {/* Visual Side */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="w-full lg:w-1/2 relative aspect-square lg:aspect-auto lg:h-[700px] group"
          >
            <img 
               src={content.communityImageUrl || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1200"} 
               alt="Community Gathering" 
               className="w-full h-full object-cover transition-all duration-1000 border border-white/10"
               referrerPolicy="no-referrer"
            />
            {/* Overlay Stats or Badge inspired by the request */}
            <div className="absolute -bottom-10 -right-10 bg-brand-gold p-12 hidden md:block border border-black/10">
               <p className="text-brand-black font-black text-6xl tracking-tighter uppercase mb-2">JOIN</p>
               <p className="text-brand-black/60 text-xs font-black tracking-widest uppercase">THE COMMUNITY</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8">
                <EditableText field="communitySub" />
              </p>
              <h2 className="font-sans text-5xl md:text-7xl font-black mb-12 text-white leading-[0.8] tracking-tighter uppercase">
                <EditableText field="communityTitle" fancyMode="inline" />
              </h2>
              
              <p className="text-xl text-white/80 leading-relaxed font-light mb-16 max-w-xl block">
                <EditableText field="communityDesc" multiline />
              </p>
            </motion.div>

            <div className="space-y-12">
              <p className="text-xl text-white/80 leading-relaxed font-light mb-8">
                <EditableText field="communityExperiencesTitle" fancyMode="inline" />
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                {experiences.map((experience, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 group"
                  >
                    <div className="w-1.5 h-1.5 bg-brand-gold rounded-full group-hover:scale-150 transition-transform" />
                    <p className="text-sm font-medium text-white/70 group-hover:text-white transition-colors uppercase tracking-tight">{experience}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="pt-12 border-t border-white/5 space-y-8"
              >
                <p className="text-2xl font-serif italic text-brand-gold leading-tight block">
                  <EditableText field="communityQuote" multiline />
                </p>
                <div>
                  <a 
                    href={content.communityBtnUrl || "https://join.thevaginaroom.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-brand-red text-white px-10 py-5 rounded-none text-xs font-black tracking-[0.4em] uppercase hover:bg-white hover:text-brand-black transition-all duration-500 shadow-2xl group"
                  >
                    <EditableText field="communityBtnText" />
                    <ArrowRight className="ml-4 group-hover:translate-x-1.5 transition-transform" size={14} />
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
