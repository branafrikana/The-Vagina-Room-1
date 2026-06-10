import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import EditableText from './EditableText';
import { useContent } from '../context/ContentContext';

export default function PrimaryHero() {
  const { content, isAdmin, isEditMode } = useContent();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      }
    }
  };

  const wordAnimation = {
    hidden: { 
      opacity: 0, 
      y: 75,
      rotate: 3,
      scale: 0.96,
      filter: "blur(6px)" 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      rotate: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 18,
        stiffness: 85,
      }
    }
  };

  const welcomeText = content.heroWelcome || "WELCOME TO";
  const headingText = content.heroHeading || "The Vagina Room";
  const subText = content.heroSub || "Where Women Heal, Learn & Thrive...";

  const welcomeWords = welcomeText.split(" ");
  const headingWords = headingText.split(" ");

  const renderCleanWelcome = () => {
    if (isAdmin && isEditMode) {
      return <EditableText field="heroWelcome" />;
    }
    return (
      <span className="inline-flex flex-wrap justify-center gap-x-3.5 overflow-hidden">
        {welcomeWords.map((word, idx) => (
          <span key={idx} className="inline-block overflow-hidden py-1">
            <motion.span
              variants={wordAnimation}
              className="inline-block"
            >
              {word}
            </motion.span>
          </span>
        ))}
      </span>
    );
  };

  const renderCleanHeading = () => {
    if (isAdmin && isEditMode) {
      return <EditableText field="heroHeading" />;
    }
    return (
      <span className="inline-flex flex-wrap justify-center gap-x-4 overflow-hidden">
        {headingWords.map((word, idx) => (
          <span key={idx} className="inline-block overflow-hidden py-1">
            <motion.span
              variants={{
                hidden: { 
                  opacity: 0, 
                  y: 85,
                  rotate: -2,
                  scale: 0.94,
                  filter: "blur(8px)" 
                },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  rotate: 0,
                  scale: 1,
                  filter: "blur(0px)",
                  transition: {
                    type: "spring",
                    damping: 15,
                    stiffness: 75,
                    delay: 0.22 + idx * 0.08
                  }
                }
              }}
              className="inline-block"
            >
              {word}
            </motion.span>
          </span>
        ))}
      </span>
    );
  };

  const renderCleanSub = () => {
    if (isAdmin && isEditMode) {
      return <EditableText field="heroSub" />;
    }
    const words = subText.split(" ");
    return (
      <span className="inline-flex flex-wrap justify-center gap-x-2 text-center max-w-2xl">
        {words.map((word, idx) => (
          <motion.span
            key={idx}
            variants={{
              hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
              visible: { 
                opacity: 1, 
                y: 0, 
                filter: "blur(0px)",
                transition: {
                  duration: 1.1,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.55 + idx * 0.04
                }
              }
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
        ))}
      </span>
    );
  };

  return (
    <section className="relative min-h-screen bg-brand-black flex flex-col items-center justify-center pt-32 overflow-hidden perspective-1000">
      {/* Background Image with Cinematic Infinite Ease Zoom Out */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img 
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.35 }}
          transition={{ duration: 4.2, ease: [0.16, 1, 0.3, 1] }}
          src={content.heroBgUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80"} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {/* Soft atmospheric vignettes */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-transparent to-brand-black opacity-85 pointer-events-none" />
        <div className="absolute inset-0 bg-brand-black/45 pointer-events-none" />
      </div>

      {/* Floating Organic Cosmic Particles & ambient lights */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0.05, 
              x: `${Math.random() * 80 + 10}%`, 
              y: `${Math.random() * 80 + 10}%`,
              scale: Math.random() * 0.4 + 0.6
            }}
            animate={{
              y: ["0%", "-15%", "0%"],
              x: ["0%", "8%", "0%"],
              opacity: [0.05, 0.25, 0.05],
            }}
            transition={{
              duration: 18 + i * 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute w-56 h-56 bg-brand-red/10 rounded-full blur-[110px]"
          />
        ))}
      </div>

      {/* Background Subtle Accent Gradients */}
      <div className="absolute inset-x-0 bottom-0 h-[45vh] bg-gradient-to-t from-brand-red/15 to-transparent pointer-events-none z-[1]" />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 text-center relative z-10 pt-16 flex flex-col items-center justify-center"
      >
        <div className="mb-8">
          <h1 className="font-sans text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] mb-8 tracking-tighter text-white uppercase flex flex-col items-center">
            {renderCleanWelcome()}
            <span className="text-brand-red italic font-light mt-5 block">
              {renderCleanHeading()}
            </span>
          </h1>
        </div>

        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <div className="text-2xl md:text-3xl font-serif italic text-brand-gold mb-16 tracking-wide block">
            {renderCleanSub()}
          </div>

          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 25, filter: "blur(4px)" },
              visible: { 
                opacity: 1, 
                y: 0, 
                filter: "blur(0px)",
                transition: {
                  duration: 1.2,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 1.3
                }
              }
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-24 z-10"
          >
            <Link to="/join-community">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-brand-red text-white px-10 py-5 font-black tracking-widest text-sm uppercase flex items-center hover:bg-brand-gold hover:text-brand-black transition-all duration-300 shadow-xl shadow-black/40"
              >
                {isAdmin && isEditMode ? <EditableText field="heroBtnText" /> : (content.heroBtnText || "👉 Join The Community")}
              </motion.button>
            </Link>
            <Link 
              to="/login"
              className="text-white/80 hover:text-white flex items-center space-x-2 text-xs font-black tracking-[0.3em] uppercase transition-all"
            >
              <span>MEMBERS DASHBOARD</span>
              <ArrowRight size={14} className="ml-2 hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
