import { motion } from 'motion/react';
import { Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import EditableText from './EditableText';

export default function Promise() {
  const { content } = useContent();

  const fallbackPromises = [
    "Access to accurate intimate health education",
    "A safe space to be heard and supported",
    "Confidence in her body",
    "Freedom from shame and stigma",
    "Holistic wellness and healing",
    "The power to make informed decisions"
  ];

  const promises = content.promiseList
    ? content.promiseList.split("\n").map(s => s.trim()).filter(Boolean)
    : fallbackPromises;

  return (
    <section className="bg-brand-black text-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
         <img 
           src={content.heroBgUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1600"} 
           alt="" 
           className="w-full h-full object-cover grayscale" 
           referrerPolicy="no-referrer"
         />
      </div>
      <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-red/5 -skew-x-12 translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 py-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          {/* Left Column: Heading & Quote */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="lg:col-span-5 sticky top-24"
          >
            <p className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8">
              <EditableText field="promiseSub" />
            </p>
            <h2 className="font-sans text-5xl md:text-7xl font-black mb-12 text-white leading-[0.8] tracking-tighter uppercase">
              <EditableText field="promiseTitle" fancyMode="inline" />
            </h2>
            <div className="relative pl-8 border-l-2 border-brand-red py-4">
              <p className="text-2xl text-white/80 italic font-serif leading-relaxed block">
                <EditableText field="promiseQuote" multiline />
              </p>
            </div>
            
            <div className="mt-16 flex items-center space-x-6 group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-brand-red group-hover:bg-brand-red group-hover:text-white transition-all duration-500">
                <Heart size={24} strokeWidth={1.5} />
              </div>
              <p className="text-xs font-black tracking-[0.3em] uppercase text-white/40 group-hover:text-white transition-colors">
                <EditableText field="promiseRightLabel" />
              </p>
            </div>
          </motion.div>

          {/* Right Column: Promises Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, index) => {
              const titleField = `promiseCard${index + 1}Title`;
              const descField = `promiseCard${index + 1}Desc`;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm p-10 border border-white/5 hover:border-brand-red/30 transition-all group"
                >
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="mt-2 w-1.5 h-1.5 rounded-full bg-brand-red flex-shrink-0 group-hover:scale-150 transition-transform" />
                      <p className="text-lg text-white/90 font-light italic leading-relaxed tracking-tight group-hover:text-white transition-colors">
                        <EditableText field={titleField} multiline />
                      </p>
                    </div>
                    <p className="text-xs text-white/40 italic font-light leading-relaxed pl-6">
                      <EditableText field={descField} multiline />
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Immersive Banner */}
        <motion.div 
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 1 }}
           className="mt-40 p-12 md:p-24 bg-brand-red text-white relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(180,31,45,0.3)]"
        >
          {/* Texture Overlay */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-left">
              <h3 className="font-sans text-5xl md:text-8xl font-black mb-8 uppercase tracking-tighter leading-none group-hover:scale-[1.01] transition-transform origin-left">
                <EditableText field="promiseBannerHeading" />
              </h3>
              <p className="text-xl text-white/80 leading-relaxed font-light uppercase tracking-widest max-w-md block">
                <EditableText field="promiseBannerDesc" multiline />
              </p>
            </div>
            
            <Link 
              to="/join-community" 
              className="bg-brand-black text-white px-12 py-6 rounded-none text-[10px] font-black tracking-[0.4em] uppercase hover:bg-white hover:text-brand-black hover:scale-105 active:scale-95 transition-all duration-500 shadow-2xl flex items-center justify-center whitespace-nowrap"
            >
              <EditableText field="promiseBannerBtnText" />
              <ArrowRight className="ml-4" size={18} />
            </Link>
          </div>
          
          {/* Decorative geometric element */}
          <div className="absolute bottom-[-10%] right-[-5%] w-64 h-64 border-[1px] border-white/10 rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
        </motion.div>
      </div>
    </section>
  );
}
