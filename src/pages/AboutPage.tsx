import { motion } from 'motion/react';
import SEO from '../components/SEO';
import { Heart, Shield, GraduationCap, HandHelping, Users, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Breadcrumbs from '../components/Breadcrumbs';
import { useContent } from '../context/ContentContext';
import EditableText from '../components/EditableText';

export default function AboutPage() {
  const { content } = useContent();

  const getDifferentiatorIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('safe') || lower.includes('shield') || lower.includes('judgment')) return <Shield className="text-brand-red" size={32} />;
    if (lower.includes('education') || lower.includes('graduation') || lower.includes('learn')) return <GraduationCap className="text-brand-gold" size={32} />;
    if (lower.includes('holistic') || lower.includes('hand') || lower.includes('help')) return <HandHelping className="text-brand-red" size={32} />;
    return <Users className="text-brand-gold" size={32} />;
  };

  // Dynamically load lists from JSON context schema, with robust fallbacks
  let whoWeServe = [
    "Teen girls", "Young women", "Married women", "Expectant mothers",
    "Postpartum mothers", "Women struggling with fertility challenges",
    "Women navigating hormonal changes", "Couples seeking relationship and intimacy support",
    "Women seeking healing from trauma or reproductive health challenges"
  ];
  if (content.whoWeServeJson) {
    try {
      const parsed = JSON.parse(content.whoWeServeJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        whoWeServe = parsed.map((item: any) => typeof item === 'string' ? item : item.title || item.name);
      }
    } catch (e) {
      console.warn("Error parsing whoWeServeJson", e);
    }
  } else if (content.whoWeServeAudienceList) {
    whoWeServe = content.whoWeServeAudienceList.split("\n").filter(Boolean);
  }

  let differentiators = [
    {
      title: "Safe & Judgment-Free",
      desc: "We foster a confidential and compassionate environment where women can ask questions freely without fear, shame, or stigma."
    },
    {
      title: "Education-Driven",
      desc: "We simplify complex reproductive and sexual health conversations into relatable, practical, and empowering knowledge."
    },
    {
      title: "Holistic Wellness Approach",
      desc: "We combine medical education, emotional support, lifestyle wellness, counselling, and natural wellness perspectives to support the whole woman."
    },
    {
      title: "Community & Support",
      desc: "We are building a supportive ecosystem where women can connect, learn, heal, and grow together."
    }
  ];
  if (content.differentiatorsJson) {
    try {
      const parsed = JSON.parse(content.differentiatorsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        differentiators = parsed;
      }
    } catch (e) {
      console.warn("Error parsing differentiatorsJson", e);
    }
  }

  let coreValues = [
    { name: "Confidentiality", desc: "We protect every story with strict privacy and trust." },
    { name: "Compassion", desc: "We deliver care with empathy and understanding." },
    { name: "Education", desc: "We simplify knowledge for informed health decisions." },
    { name: "Empowerment", desc: "We equip people to take charge of their wellbeing." },
    { name: "Wellness", desc: "We restore balance through holistic, effective care." },
    { name: "Advocacy", desc: "We promote awareness and break health stigmas." }
  ];
  if (content.coreValuesJson) {
    try {
      const parsed = JSON.parse(content.coreValuesJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        coreValues = parsed;
      }
    } catch (e) {
      console.warn("Error parsing coreValuesJson", e);
    }
  }

  let sectionIds = ["about_hero", "manifesto", "mission_vision", "who_we_serve", "differentiators", "core_values", "promise"];
  
  if (content.aboutPageSectionsOrder) {
    try {
      const parsed = JSON.parse(content.aboutPageSectionsOrder);
      if (Array.isArray(parsed) && parsed.length > 0) {
        sectionIds = parsed;
      }
    } catch (e) {
      console.warn("Error parsing aboutPageSectionsOrder", e);
    }
  }

  const renderSection = (id: string) => {
    switch (id) {
      case 'about_hero':
        return (
          <section key="about_hero" className="py-24 px-6 border-b border-white/5 relative overflow-hidden font-sans text-white">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-red/5 -skew-x-12 translate-x-1/4 pointer-events-none" />
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="md:w-1/2"
              >
                <EditableText field="aboutTitle" className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8 block" />
                <h1 className="font-sans text-5xl md:text-8xl font-black mb-12 leading-[1.0] tracking-tighter uppercase text-white">
                  <EditableText field="aboutHeading" fancyMode="inline" />
                </h1>
                <EditableText field="aboutParagraph1" as="p" multiline className="text-xl text-white/60 leading-relaxed font-light italic block" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="md:w-1/2 aspect-square overflow-hidden border border-white/10"
              >
                <img 
                  src={content.aboutImageUrl || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1200"} 
                  alt="Empowered Woman" 
                  className="w-full h-full object-cover transition-all duration-1000" 
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>
          </section>
        );

      case 'manifesto':
         return (
          <section key="manifesto" className="py-32 px-6 bg-brand-black text-white">
            <div className="max-w-4xl mx-auto space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative p-12 bg-white/5 border-l-4 border-brand-red backdrop-blur-sm"
              >
                <EditableText field="aboutUsBoxText" as="p" multiline className="text-base md:text-lg font-serif italic leading-relaxed text-white/90 block" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="space-y-8 text-lg text-white/60 leading-relaxed font-light italic"
              >
                <p className="block">
                  <EditableText field="whyWeExistDesc" multiline />
                </p>
                <p className="block">
                  <EditableText field="aboutUsParagraph1" multiline />
                </p>
              </motion.div>
            </div>
          </section>
         );

      case 'mission_vision':
         return (
          <section key="mission_vision" className="py-32 px-6 bg-brand-black relative text-white">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-brand-red p-16 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -rotate-12 translate-x-1/2 -translate-y-1/2" />
                <h3 className="font-sans text-3xl font-black mb-8 text-white uppercase tracking-tighter">
                  <EditableText field="aboutUsMissionTitle" />
                </h3>
                <p className="text-white text-xl leading-relaxed font-medium block">
                  <EditableText field="aboutUsMissionDesc" multiline />
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 p-16 relative overflow-hidden group"
              >
                <h3 className="font-sans text-3xl font-black mb-8 text-brand-gold uppercase tracking-tighter">
                  <EditableText field="aboutUsVisionTitle" />
                </h3>
                <p className="text-white/60 text-xl leading-relaxed font-light block">
                  <EditableText field="aboutUsVisionDesc" multiline />
                </p>
              </motion.div>
            </div>
          </section>
         );

      case 'who_we_serve':
         return (
          <section key="who_we_serve" className="py-32 px-6 border-t border-white/5 text-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-24 font-sans">
                <p className="text-brand-red font-black tracking-[0.5em] uppercase text-[10px] mb-8">Target Audience</p>
                <h2 className="font-sans text-5xl md:text-7xl font-black text-white leading-none tracking-tighter uppercase">
                  Who We <br /><span className="text-brand-gold italic font-light lowercase">Serve.</span>
                </h2>
              </div>

              <EditableText field="whoWeServeAudienceList" multiline className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans block" as="div">
                {whoWeServe.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white/5 border border-white/5 p-8 flex items-center space-x-6 group hover:bg-brand-red/10 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-red flex-shrink-0 group-hover:scale-150 transition-transform" />
                    <p className="text-sm font-black tracking-widest uppercase text-white/60 group-hover:text-white transition-colors">
                      {item}
                    </p>
                  </motion.div>
                ))}
              </EditableText>
            </div>
          </section>
         );

      case 'differentiators':
         return (
          <section key="differentiators" className="py-32 px-6 bg-brand-black text-white">
            <div className="max-w-7xl mx-auto">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                  <div className="lg:col-span-4 font-sans">
                     <p className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8">The Vagina Room Edge</p>
                     <h2 className="font-sans text-5xl md:text-7xl font-black text-white leading-[0.85] tracking-tighter uppercase mb-12">
                        What <br />Makes Us <br /><span className="text-brand-red italic font-light lowercase">Different.</span>
                     </h2>
                  </div>
                  <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
                     {differentiators.map((d, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-white/5 p-12 border border-white/10 group hover:border-brand-red/30 transition-all font-sans"
                        >
                           <div className="mb-8 p-4 bg-white/5 inline-block rounded-full group-hover:scale-110 transition-transform">{getDifferentiatorIcon(d.title)}</div>
                           <h4 className="text-xl font-black uppercase tracking-tighter mb-4 text-white">{d.title}</h4>
                           <p className="text-white/40 leading-relaxed font-light text-sm italic">{d.desc}</p>
                        </motion.div>
                     ))}
                  </div>
               </div>
            </div>
          </section>
         );

      case 'core_values':
         return (
          <section key="core_values" className="py-32 px-6 border-t border-white/5 relative overflow-hidden font-sans text-white bg-brand-black">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-red/50 to-transparent" />
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-24">
                <p className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8">Our DNA</p>
                <h2 className="font-sans text-5xl md:text-7xl font-black text-white leading-none tracking-tighter uppercase">
                  Core <br /><span className="text-brand-red italic font-light lowercase">Values.</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-center text-white font-sans">
                {coreValues.map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="space-y-6"
                  >
                    <h4 className="text-2xl font-black text-brand-gold italic uppercase tracking-tighter">{v.name}</h4>
                    <p className="text-white/40 font-light text-sm italic tracking-wide max-w-xs mx-auto">
                      {v.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
         );

      case 'promise':
         return (
          <section key="promise" className="py-40 px-6 bg-brand-red text-white">
            <div className="max-w-7xl mx-auto text-center relative overflow-hidden group">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-black font-black tracking-[0.5em] uppercase text-[10px] mb-12">Our Commitment</p>
                <h2 className="font-sans text-6xl md:text-[9rem] font-black mb-16 tracking-tighter leading-none uppercase text-white">
                  The <br /><span className="text-brand-black italic font-light lowercase">Promise.</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto mb-20 font-sans">
                  {[
                    "Access to accurate intimate health education",
                    "A safe space to be heard and supported",
                    "Confidence in her body",
                    "Freedom from shame and stigma",
                    "Holistic wellness and healing",
                    "The power to make informed decisions"
                  ].map((p, i) => (
                    <div key={i} className="flex items-start space-x-6 border-b border-black/10 pb-6">
                      <Star size={16} fill="black" stroke="none" className="mt-1 flex-shrink-0" />
                      <p className="text-lg font-black tracking-tighter uppercase leading-tight italic">{p}</p>
                    </div>
                  ))}
                </div>

                <Link to="/join-community" className="bg-brand-black text-white px-20 py-8 rounded-none text-xs font-black tracking-[0.5em] uppercase hover:bg-white hover:text-brand-black transition-all duration-500 shadow-2xl inline-flex items-center group">
                  Join the Community
                  <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform" size={20} />
                </Link>
              </motion.div>
            </div>
          </section>
         );

      default:
        return null;
    }
  };

  return (
    <>
      <SEO 
        title="About Us" 
        description="Discover the mission, vision, and core values of The Vagina Room. We are a sanctuary for women's health, breaking stigmas and empowering through education."
      />
      <div className="bg-brand-black text-white min-h-screen">
        <Navigation />
        
        <main className="pt-32">
          <div className="max-w-7xl mx-auto px-6 pt-8">
            <Breadcrumbs items={[{ label: 'About Us' }]} />
          </div>
          {sectionIds.map(id => renderSection(id))}
        </main>

        <Footer />
      </div>
    </>
  );
}
