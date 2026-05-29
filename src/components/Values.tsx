import { motion } from 'motion/react';
import { CORE_VALUES, DIFFERENTIATORS } from '../constants';
import { useContent } from '../context/ContentContext';
import EditableText from './EditableText';

export default function Values() {
  const { content } = useContent();

  let coreValues = CORE_VALUES;
  if (content.coreValuesJson) {
    try {
      coreValues = JSON.parse(content.coreValuesJson);
    } catch (e) {
      coreValues = CORE_VALUES;
    }
  }

  let differentiators = DIFFERENTIATORS;
  if (content.differentiatorsJson) {
    try {
      differentiators = JSON.parse(content.differentiatorsJson);
    } catch (e) {
      differentiators = DIFFERENTIATORS;
    }
  }

  return (
    <section id="values" className="py-40 bg-brand-black text-white relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Core Values */}
        <div className="mb-40">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-32 gap-12">
            <div className="max-w-3xl">
              <p className="text-brand-red font-black tracking-[0.5em] uppercase text-[10px] mb-8">
                <EditableText field="valuesSub" />
              </p>
              <h2 className="font-sans text-5xl md:text-6xl font-black leading-[0.85] tracking-tighter uppercase mb-2">
                <EditableText field="valuesTitle" fancyMode="inline" />
              </h2>
            </div>
            <p className="text-xl text-white/40 max-w-sm italic font-light leading-relaxed block">
              <EditableText field="valuesDesc" multiline />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/5">
            {coreValues.map((value, index) => (
              <motion.div
                key={value.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-16 bg-brand-black hover:bg-white/5 transition-all duration-700 relative border-white/5 border"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="inline-flex w-16 h-16 bg-white/5 border border-white/10 text-brand-red items-center justify-center mb-12 group-hover:bg-brand-red group-hover:text-white transition-all transform group-hover:rotate-[360deg] duration-700">
                  {"icon" in value && value.icon ? <value.icon size={28} strokeWidth={1} /> : <span className="text-xl font-serif italic">+</span>}
                </div>
                <h3 className="font-sans text-3xl font-black mb-6 text-brand-cream uppercase tracking-tight">{value.name}</h3>
                <p className="text-white/40 text-lg leading-relaxed font-light italic">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Differentiators */}
        <div className="relative group p-12 md:p-24 bg-brand-red text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-black/5 -skew-x-12 translate-x-1/2 pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start relative z-10">
            <div className="lg:col-span-5 sticky top-24">
              <p className="text-brand-black font-black tracking-[0.5em] uppercase text-[10px] mb-8">
                <EditableText field="differentiatorsSub" />
              </p>
              <h2 className="font-sans text-5xl md:text-7xl font-black mb-10 text-white leading-[0.8] tracking-tighter uppercase">
                <EditableText field="differentiatorsTitle" fancyMode="inline" fancyColor="text-white" />
              </h2>
              <p className="text-white/80 text-xl leading-relaxed font-light mb-12 max-w-sm italic block">
                <EditableText field="differentiatorsDesc" multiline />
              </p>
              <div className="w-24 h-px bg-brand-black" />
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
              {differentiators.map((diff, index) => (
                <motion.div
                  key={diff.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm p-10 border border-white/10 hover:border-brand-black/30 transition-all group"
                >
                  <div className="mb-8 text-brand-black group-hover:scale-110 transition-transform origin-left">
                    {"icon" in diff && diff.icon ? <diff.icon size={32} strokeWidth={1.5} /> : <span className="text-3xl font-serif italic">+</span>}
                  </div>
                  <h3 className="font-sans text-xl font-black mb-4 text-white uppercase tracking-tight">{diff.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed font-light italic">
                    {diff.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
