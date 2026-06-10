import { motion } from 'motion/react';
import { Play, ArrowRight, Sparkles } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import EditableText from './EditableText';
import { ImageLoader } from './ImageLoader';

export default function Hero() {
  const { content } = useContent();

  const subtexts = content.kyvSubtexts 
    ? content.kyvSubtexts.split("\n").map(s => s.trim()).filter(Boolean)
    : ["BREAKING SILENCE. RESTORING KNOWLEDGE.", "RESTORING DIGNITY, RESTORING HEALING."];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const playButtonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 1,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.5
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-brand-black text-brand-cream">
      {/* Cinematic Background Texture */}
      <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black/40 via-transparent to-brand-black z-10" />
      
      {/* Background Image/Portrait Placeholder Style */}
      <div className="absolute top-0 right-0 w-full lg:w-3/4 h-full z-0 opacity-40 lg:opacity-60">
        <ImageLoader 
          src={content.kyvImageUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1600"} 
          alt="The Community Visual"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-brand-black/20" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl mx-auto px-6 w-full relative z-20"
      >
        <div className="flex flex-col h-full justify-between py-24">
          <motion.div
            variants={playButtonVariants}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-2/3"
          >
            <a href={content.kyvYoutubeUrl || "https://www.youtube.com"} target="_blank" rel="noopener noreferrer">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center cursor-pointer hover:bg-brand-red hover:border-brand-red transition-all group">
                <Play fill="white" size={32} className="text-white ml-2 transition-transform group-hover:scale-110" />
              </div>
            </a>
          </motion.div>

          <div className="mt-auto">
            <div className="mb-8">
              <motion.p 
                variants={itemVariants}
                className="text-sm font-black tracking-[0.5em] text-brand-gold uppercase mb-4"
              >
                <EditableText field="kyvLabel" />
              </motion.p>
              <motion.h1 
                variants={itemVariants}
                className="font-sans text-5xl md:text-7xl lg:text-8xl font-black leading-[0.8] mb-6 tracking-tighter text-white uppercase"
              >
                <EditableText field="kyvHeading" fancyMode="inline" />
              </motion.h1>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
              <motion.div
                variants={itemVariants}
              >
                <EditableText field="kyvSubtexts" multiline className="space-y-4 mb-8 block" as="div">
                  {subtexts.map((line, i) => (
                    <p key={i} className="text-sm font-black tracking-[0.4em] uppercase text-white last:mb-2 leading-relaxed">{line}</p>
                  ))}
                </EditableText>
                                <div className="flex flex-col sm:flex-row gap-6">
                   <a 
                     href={content.kyvYoutubeUrl || "https://www.youtube.com"}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="bg-brand-red text-white px-10 py-5 rounded-none text-xs font-black tracking-widest uppercase hover:bg-white hover:text-brand-black transition-all duration-300 shadow-2xl flex items-center justify-center group"
                   >
                     <EditableText field="kyvBtnText" />
                     <ArrowRight className="ml-3 group-hover:translate-x-1.5 transition-transform" size={16} />
                  </a>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex flex-col items-start"
              >
                <div className="flex items-center space-x-4 mb-2">
                  <div className="w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-brand-gold">
                    <Sparkles size={20} />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[10px] font-black tracking-widest text-brand-gold uppercase">
                      <EditableText field="kyvBadgeTitle" />
                    </p>
                    <a 
                      href={content.kyvYoutubeUrl || "https://www.youtube.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-2xl font-serif font-bold italic text-white underline decoration-brand-red decoration-2 underline-offset-4 hover:text-brand-gold transition-colors"
                    >
                      <EditableText field="kyvBadgeAction" />
                    </a>
                  </div>
                </div>
                <a 
                  href={content.kyvYoutubeUrl || "https://www.youtube.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center mt-2 group cursor-pointer"
                >
                  <div className="bg-[#FF0000] px-4 py-2 flex items-center space-x-2 transition-colors hover:bg-brand-red">
                    <YoutubeIcon />
                    <span className="text-[10px] font-extrabold text-white">
                      <EditableText field="kyvBadgeBar" />
                    </span>
                  </div>
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function YoutubeIcon() {
  return (
    <div className="w-6 h-4 bg-white rounded-sm flex items-center justify-center">
      <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[5px] border-l-[#FF0000] border-b-[3px] border-b-transparent" />
    </div>
  );
}
