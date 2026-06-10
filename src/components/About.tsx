import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import EditableText from './EditableText';

export default function About() {
  return (
    <section id="about" className="py-40 bg-brand-black text-white relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="lg:col-span-8"
          >
            <p className="text-brand-gold font-black tracking-[0.4em] uppercase text-xs mb-10">
              <EditableText field="homeAboutUsSub" />
            </p>
            <h2 className="font-sans text-5xl md:text-7xl font-black mb-12 text-white leading-[0.85] tracking-tighter uppercase">
              <EditableText field="homeAboutUsTitle" />
            </h2>
            
            <div className="relative p-12 bg-white/5 border-l-4 border-brand-red backdrop-blur-sm group mb-12">
               <h4 className="text-xl md:text-3xl font-serif italic leading-tight text-brand-cream/90">
                  <EditableText field="homeAboutUsBoxText" multiline />
               </h4>
            </div>

            <div className="space-y-8 text-white/50 text-xl leading-relaxed font-light max-w-3xl mb-12 block">
               <EditableText field="homeAboutUsParagraph1" multiline />
            </div>
            
            <Link to="/about" className="inline-block mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-brand-gold text-brand-black font-black uppercase tracking-[0.2em] text-sm hover:bg-white transition-colors"
              >
                Learn More
              </motion.button>
            </Link>
          </motion.div>

          <div className="lg:col-span-4 grid grid-cols-1 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-brand-red p-12 rounded-none"
            >
              <h3 className="font-sans text-2xl font-black mb-4 text-white uppercase tracking-tighter">
                <EditableText field="homeAboutUsMissionTitle" />
              </h3>
              <p className="text-white/80 text-lg leading-relaxed font-medium">
                <EditableText field="homeAboutUsMissionDesc" multiline />
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/5 border border-white/10 p-12 rounded-none"
            >
              <h3 className="font-sans text-2xl font-black mb-4 text-brand-gold uppercase tracking-tighter">
                <EditableText field="homeAboutUsVisionTitle" />
              </h3>
              <p className="text-white/40 text-lg leading-relaxed font-light">
                <EditableText field="homeAboutUsVisionDesc" multiline />
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
