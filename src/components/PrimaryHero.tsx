import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import EditableText from './EditableText';
import { useContent } from '../context/ContentContext';

export default function PrimaryHero() {
  const { content } = useContent();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.15,
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
      filter: "blur(10px)" 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1.4,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <section className="relative min-h-screen bg-brand-black flex flex-col items-center justify-center pt-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={content.heroBgUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80"} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 transition-opacity duration-1000"
          referrerPolicy="no-referrer"
        />
        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-transparent to-brand-black opacity-80" />
        <div className="absolute inset-0 bg-brand-black/40" />
      </div>

      {/* Background Subtle Accent */}
      <div className="absolute inset-x-0 bottom-0 h-[50vh] bg-gradient-to-t from-brand-red/20 to-transparent pointer-events-none z-[1]" />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 text-center relative z-10 pt-20"
      >
        <div className="mb-6">
          <h1 className="font-sans text-5xl md:text-7xl lg:text-8xl font-black leading-[0.85] mb-10 tracking-tighter text-white uppercase flex flex-col items-center">
            <motion.span variants={itemVariants} className="block">
              <EditableText field="heroWelcome" />
            </motion.span>
            <motion.span
              variants={itemVariants}
              className="text-brand-red italic font-light mt-4 block"
            >
              <EditableText field="heroHeading" />
            </motion.span>
          </h1>
        </div>

        <div className="max-w-3xl mx-auto">
          <motion.p
            variants={itemVariants}
            className="text-2xl md:text-3xl font-serif italic text-brand-gold mb-20 tracking-wide block"
          >
            <EditableText field="heroSub" />
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-32 z-10"
          >
            <a href={content.heroBtnUrl || "https://join.thevaginaroom.com"} target="_blank" rel="noopener noreferrer">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-brand-red text-white px-10 py-5 font-black tracking-widest text-sm uppercase flex items-center hover:bg-brand-gold transition-colors"
              >
                <EditableText field="heroBtnText" />
              </motion.button>
            </a>
            <Link 
              to="/dr-fid-booking"
              className="text-white/60 hover:text-white flex items-center space-x-2 text-xs font-black tracking-[0.3em] uppercase transition-all"
            >
              <span>BOOK DR FID</span>
              <ArrowRight size={14} className="ml-2 hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </motion.div>


    </section>
  );
}
