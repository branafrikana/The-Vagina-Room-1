import { motion } from 'motion/react';
import { useContent } from '../context/ContentContext';
import EditableText from './EditableText';

export default function WhoWeServe() {
  const { content } = useContent();

  const fallbackAudience = [
    { title: "Teen girls", description: "Foundation for a lifelong journey of self-discovery." },
    { title: "Young women", description: "Clear guidance for the years of transition." },
    { title: "Married women", description: "Restoring intimacy and relational harmony." },
    { title: "Expectant mothers", description: "Nurturing wholeness through the miracle of life." },
    { title: "Postpartum mothers", description: "Support through the transformation of motherhood." },
    { title: "Women with fertility challenges", description: "Compassionate guidance through seasons of waiting." },
    { title: "Women navigating hormone changes", description: "Balance and grace for the seasons of shift." },
    { title: "Couples seeking intimacy support", description: "Rebuilding bridges of connection and intimacy." },
    { title: "Women seeking healing from trauma", description: "Safe passage toward reclamation and peace." }
  ];

  let audiences = fallbackAudience;
  if (content.whoWeServeJson) {
    try {
      audiences = JSON.parse(content.whoWeServeJson);
      if (!Array.isArray(audiences) || audiences.length === 0) {
        audiences = fallbackAudience;
      }
    } catch {
      audiences = fallbackAudience;
    }
  }

  return (
    <section id="who-we-serve" className="py-40 bg-brand-black text-white relative border-y border-brand-gold/10">
      <div className="absolute inset-0 bg-brand-gold/[0.02] pointer-events-none" />
      <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <p className="text-brand-gold font-black tracking-[0.4em] uppercase text-xs mb-8">
            <EditableText field="whoWeServeSub" />
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <h2 className="font-sans text-6xl md:text-8xl font-black text-white leading-[0.8] tracking-tighter uppercase max-w-4xl">
              <EditableText field="whoWeServeTitle" fancyMode="inline" />
            </h2>
            <div className="max-w-sm border-l-2 border-brand-red pl-8 py-2 block">
              <p className="text-lg text-white/50 italic font-light leading-relaxed">
                <EditableText field="whoWeServeDesc" multiline />
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {audiences.map((group, index) => {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-12 bg-white/[0.02] border border-white/5 hover:border-brand-gold/30 transition-all duration-700 min-h-[320px] flex flex-col justify-between relative overflow-hidden"
              >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-8 text-brand-gold/5 font-serif text-9xl leading-none font-light group-hover:text-brand-gold/10 transition-colors pointer-events-none">
                  {index + 1}
                </div>

                <div className="relative z-10">
                  <span className="text-[10px] font-black tracking-[0.5em] uppercase text-brand-red mb-6 block">Phase 0{index + 1}</span>
                  <h3 className="font-sans text-3xl font-black mb-6 text-white uppercase tracking-tighter leading-tight group-hover:text-brand-gold transition-colors">
                    {group.title}
                  </h3>
                </div>

                <div className="relative z-10">
                  <div className="w-8 h-px bg-brand-gold/50 mb-6 group-hover:w-16 transition-all duration-700" />
                  <p className="text-base text-white/40 leading-relaxed font-light italic group-hover:text-white/80 transition-colors">
                    {group.description || "A community for every woman."}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
