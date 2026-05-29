import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import EditableText from './EditableText';

export default function WhyWeExist() {
  const { content } = useContent();

  const fallbackStruggles = [
    "Silence surrounding intimate health",
    "Shame and stigma",
    "Misinformation and fear",
    "Recurrent infections or discomfort",
    "Hormonal and reproductive challenges",
    "Lack of trusted expert guidance"
  ];

  const struggles = content.whyWeExistStruggles
    ? content.whyWeExistStruggles.split("\n").map(s => s.trim()).filter(Boolean)
    : fallbackStruggles;

  return (
    <section className="py-40 bg-brand-black text-white relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(196,30,58,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Header Content */}
          <div className="lg:col-span-5">
            <p className="text-brand-red font-black tracking-[0.5em] uppercase text-[10px] mb-8">
              <EditableText field="whyWeExistCatalyst" />
            </p>
            <h2 className="font-sans text-5xl md:text-6xl font-black mb-12 text-white leading-[0.9] tracking-tighter uppercase">
              <EditableText field="whyWeExistTitle" fancyMode="inline" />
            </h2>
            <div className="w-24 h-2 bg-brand-red mb-12" />
            <p className="text-xl text-white/60 leading-relaxed font-light italic max-w-md block">
              <EditableText field="whyWeExistDesc" multiline />
            </p>
          </div>
          
          {/* Struggles Grid */}
          <div className="lg:col-span-7">
            <div className="mb-12">
              <p className="text-white/40 uppercase tracking-widest text-xs font-black mb-10 border-b border-white/10 pb-4">
                <EditableText field="whyWeExistStruggleTitle" />
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {struggles.map((struggle, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start group"
                  >
                    <AlertCircle className="text-brand-red mr-4 shrink-0 mt-1 opacity-50 group-hover:opacity-100 transition-opacity" size={20} />
                    <p className="text-lg text-white/80 font-medium group-hover:text-white transition-colors">{struggle}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Closing Statement */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-20 p-12 bg-white/5 border border-white/10 relative group"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-brand-gold" />
              <p className="text-2xl md:text-3xl font-serif italic text-brand-cream leading-tight block">
                <EditableText field="whyWeExistQuote" multiline />
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
