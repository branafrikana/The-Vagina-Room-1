import { motion } from 'motion/react';
import SEO from '../components/SEO';
import { Heart, Globe, Users, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useContent } from '../context/ContentContext';
import EditableText from '../components/EditableText';

export default function SupportPage() {
  const { content } = useContent();

  const getImpactIcon = (label: string) => {
    const lower = label.toLowerCase();
    if (lower.includes('outreach') || lower.includes('world') || lower.includes('global')) return <Globe size={24} />;
    if (lower.includes('clinic') || lower.includes('care') || lower.includes('shield') || lower.includes('hygiene') || lower.includes('protect')) return <ShieldCheck size={24} />;
    if (lower.includes('masterclass') || lower.includes('education') || lower.includes('star')) return <Star size={24} />;
    return <Users size={24} />;
  };

  let impactStats = [
    { label: "Community Outreach", desc: "Reaching underserved rural areas with health education." },
    { label: "Clinic Support", desc: "Subsidizing restorative care for women in need." },
    { label: "Education Mastery", desc: "Funding masterclasses and digital health resources." },
    { label: "Safe Space Expansion", desc: "Growing our local and digital support communities." }
  ];

  if (content.supportImpactStatsJson) {
    try {
      const parsed = JSON.parse(content.supportImpactStatsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        impactStats = parsed;
      }
    } catch (e) {
      console.warn("Error parsing supportImpactStatsJson", e);
    }
  }

  return (
    <>
      <SEO 
        title="Support The Vision" 
        description="Support us in expanding the reach of women's wellness resources and community initiatives."
      />
      <div className="bg-brand-black text-white min-h-screen">
        <Navigation />
        
        <main className="pt-32">
        {/* Support Hero */}
        <section className="py-24 px-6 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,rgba(196,30,58,0.08)_0%,transparent_50%)] pointer-events-none" />
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <EditableText field="supportInvestLabel" className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8 block" />
              <h1 className="font-sans text-4xl sm:text-6xl md:text-9xl font-black mb-12 tracking-tighter uppercase leading-none">
                <EditableText field="supportHeading" fancyMode="inline" />
              </h1>
              <p className="text-xl text-white/40 max-w-2xl mx-auto italic font-light leading-relaxed block">
                <EditableText field="supportSub" multiline />
              </p>
            </motion.div>
          </div>
        </section>

        {/* Donation Section */}
        <section id="donate" className="py-32 px-6 border-y border-white/5 relative">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-brand-red font-black tracking-[0.5em] uppercase text-[10px] mb-8">Support The Mission</p>
              <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black uppercase tracking-tighter mb-12 leading-tight">
                <EditableText field="supportFuelHeading" fancyMode="break" />
              </h2>
              <div className="space-y-8 mb-16">
                <p className="text-lg text-white/60 font-light italic leading-relaxed block">
                  <EditableText field="supportFuelDesc" multiline />
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {impactStats.map((stat, i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <div className="text-brand-red mt-1">{getImpactIcon(stat.label)}</div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/80">{stat.label}</h4>
                        <p className="text-white/40 text-[11px] italic font-light">{stat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-12 md:p-16 border border-white/10 relative">
               <div className="absolute top-0 right-0 p-8 text-brand-gold/5 font-serif text-[10rem] leading-none pointer-events-none uppercase italic">Donate</div>
               <div className="relative z-10 text-center space-y-10 py-8">
                 <Heart className="mx-auto text-brand-red" size={48} fill="currentColor" />
                 <div className="space-y-4">
                   <h3 className="text-3xl font-black uppercase tracking-tighter">Support Our Work</h3>
                   <p className="text-white/60 text-sm italic font-light max-w-sm mx-auto leading-relaxed">
                     Your support directly funds health drives, educational resources, and safe community spaces for women.
                   </p>
                 </div>
                 
                 <div>
                   <a 
                     href={content.supportPaystackUrl || "https://paystack.com/pay/thevaginaroom"} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="w-full bg-brand-red text-white py-6 rounded-none text-xs font-black tracking-[0.5em] uppercase hover:bg-white hover:text-brand-black transition-all duration-500 shadow-2xl flex items-center justify-center group"
                   >
                     Make A Donation
                     <ArrowRight className="ml-4 group-hover:translate-x-1.5 transition-transform" size={14} />
                   </a>
                 </div>
                 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">You will be redirected to our secure external donation partner.</p>
               </div>
            </div>
          </div>
        </section>

        {/* Closing Promise Section */}
        <section className="py-40 px-6 bg-brand-red text-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto text-center relative z-10">
             <h2 className="font-sans text-5xl md:text-[8rem] font-black mb-16 tracking-tighter leading-none uppercase">
               <EditableText field="supportClosingHeading" fancyMode="darkBreak" />
             </h2>
             <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-70 mb-16">
               <EditableText field="supportClosingDesc" multiline />
             </p>
             <div className="w-24 h-[1px] bg-brand-black mx-auto" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </>
  );
}
