import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import EditableText from './EditableText';
import { useContent } from '../context/ContentContext';

export default function AboutTheRoom() {
  const { content } = useContent();

  return (
    <section id="about-room" className="bg-brand-black min-h-[80vh] flex flex-col lg:flex-row overflow-hidden relative">
      {/* Left Column: Image Area */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="w-full lg:w-2/5 aspect-square lg:aspect-auto relative bg-[#222]"
      >
        <img 
          src={content.drFidImageUrl} 
          alt="Visionary Profile" 
          className="w-full h-full object-cover transition-all duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-black/40 to-transparent" />
      </motion.div>

      {/* Right Column: Content Area */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2 }}
        className="w-full lg:w-3/5 p-12 lg:p-24 flex flex-col justify-center relative"
      >
        {/* The requested gradient background inspired by the image but in brand colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-red/20 via-brand-black to-brand-gold/10 opacity-50 z-0" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-8">
            <h2 className="font-sans text-5xl md:text-7xl font-black text-white leading-none tracking-tighter uppercase">
              <EditableText field="drFidHeading" fancyMode="inline" />
            </h2>
          </div>

          <div className="space-y-8 max-w-2xl">
            <div className="text-xl md:text-2xl text-white/90 leading-relaxed font-medium block">
              <EditableText field="drFidBio1" multiline />
            </div>

            <div className="text-lg text-white/60 leading-relaxed font-light block">
              <EditableText field="drFidBio2" multiline />
            </div>

            <div className="text-lg text-white/60 leading-relaxed font-light block">
              <EditableText field="drFidBio3" multiline />
            </div>

            <div className="pt-8">
              <div className="text-brand-gold font-serif text-lg md:text-xl italic font-bold mb-8 block">
                <EditableText field="drFidQuote" multiline />
              </div>
              
              <Link to="/dr-fid" className="inline-block text-white border-b-2 border-brand-red pb-2 text-xs font-black tracking-[0.4em] uppercase hover:text-brand-gold hover:border-brand-gold transition-all duration-500">
                Learn more About Me
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
