import { motion } from 'motion/react';
import SEO from '../components/SEO';
import { Award, BookOpen, Heart, Shield, Star, Briefcase, Users, ArrowRight, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useContent } from '../context/ContentContext';
import EditableText from '../components/EditableText';

export default function DrFidPage() {
  const { content } = useContent();

  let certifications = [
    "The Open International University for Complementary Medicines, USA",
    "Azteca University (Spinal Manipulation Certification)",
    "Western Ville University, USA (Naturopathy and Herbal Therapeutics)",
    "MAHC Natural Medicine Academy, USA",
    "Bachelor of Public Health, University of Ibadan"
  ];
  if (content.drFidCertifications) {
    certifications = content.drFidCertifications.split("\n").map(s => s.trim()).filter(Boolean);
  }

  let expertiseList = [
    { title: "Integrative Naturopathy" },
    { title: "Spinal Manipulation" },
    { title: "Herbal Therapeutics" },
    { title: "Holistic Body Restoration" },
    { title: "Chiropractic Care" },
    { title: "Naturopathy" }
  ];
  if (content.drFidExpertiseJson) {
    try {
      const parsed = JSON.parse(content.drFidExpertiseJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        expertiseList = parsed;
      }
    } catch (e) {
      console.warn("Error parsing drFidExpertiseJson", e);
    }
  }

  const getExpertiseIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('naturopathy')) return <Briefcase size={20} />;
    if (lower.includes('spinal') || lower.includes('manipulation') || lower.includes('hygiene') || lower.includes('protect')) return <Shield size={20} />;
    if (lower.includes('herbal') || lower.includes('therapeutics')) return <Star size={20} />;
    if (lower.includes('body') || lower.includes('restoration') || lower.includes('healing')) return <Heart size={20} />;
    if (lower.includes('chiropractic') || lower.includes('care')) return <Award size={20} />;
    return <BookOpen size={20} />;
  };

  let sectionIds = ["profile_hero", "career_expertise", "education_certifications", "ancp_framework", "vagina_room_context", "personal_life", "closing_cta"];
  
  if (content.drFidPageSectionsOrder) {
    try {
      const parsed = JSON.parse(content.drFidPageSectionsOrder);
      if (Array.isArray(parsed)) {
        sectionIds = parsed;
      }
    } catch (e) {
      console.warn("Error parsing drFidPageSectionsOrder", e);
    }
  }

  const renderSection = (id: string) => {
    switch (id) {
      case 'profile_hero':
        return (
          <section key="profile_hero" className="py-24 px-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,rgba(180,31,45,0.08)_0%,transparent_50%)] pointer-events-none" />
            <div className="max-w-7xl mx-auto font-sans">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-5"
                >
                  <div className="aspect-[4/5] relative group">
                    <div className="absolute inset-0 border border-brand-gold translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-700" />
                    <img 
                      src={content.drFidPageImageUrl || content.drFidImageUrl || "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800"} 
                      alt="Dr. Damilola Awoyemi (Dr. FID)" 
                      className="w-full h-full object-cover grayscale relative z-10 brightness-90 group-hover:grayscale-0 transition-all duration-1000"
                    />
                    <div className="absolute bottom-8 left-8 z-20">
                       <p className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-2">Founder & CEO</p>
                       <h2 className="text-2xl font-black uppercase text-white tracking-widest italic animate-pulse">Dr. FID</h2>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-7"
                >
                  <EditableText field="drFidHeading" className="text-brand-red font-black tracking-[0.5em] uppercase text-[10px] mb-8 block" />
                  <h1 className="font-sans text-5xl md:text-7xl font-black mb-8 leading-[0.9] tracking-tighter uppercase text-white">
                    Dr. Damilola Awoyemi
                  </h1>
                  <div className="text-xl text-white/80 leading-relaxed font-light italic mb-12 border-l-4 border-brand-red pl-8 block">
                    <EditableText field="drFidBio1" multiline />
                  </div>
                  <div className="flex flex-wrap gap-6">
                    {expertiseList.map((exp, i) => (
                      <div key={i} className="flex items-center space-x-3 bg-white/5 px-4 py-2 border border-white/10 rounded-full">
                        <span className="text-brand-gold">{getExpertiseIcon(exp.title)}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{exp.title}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        );

      case 'career_expertise':
        return (
          <section key="career_expertise" className="py-32 px-6 border-t border-white/5 bg-brand-black relative">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-12 text-lg text-white/60 leading-relaxed font-light">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="block"
                >
                  <EditableText field="drFidBio2" multiline />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="block"
                >
                  <EditableText field="drFidBio3" multiline />
                </motion.div>
              </div>
            </div>
          </section>
        );

      case 'education_certifications':
        return (
          <section key="education_certifications" className="py-32 px-6 border-t border-white/5 bg-brand-black/50">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div>
                  <p className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8">Academic Excellence</p>
                  <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12 text-white font-sans">
                    Professional <br /><span className="text-brand-red italic font-light lowercase">Certifications.</span>
                  </h2>
                  <div className="space-y-6">
                    {certifications.map((cert, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start space-x-6 p-6 bg-white/5 border border-white/5 group hover:border-brand-gold/30 transition-all text-white"
                      >
                        <Award className="text-brand-gold shrink-0 mt-1" size={24} />
                        <p className="text-sm font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">{cert}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-brand-red p-12 md:p-20 relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <Quote className="text-white/20 mb-8" size={64} fill="currentColor" />
                  <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-8 italic">
                    <EditableText field="drFidQuote" multiline />
                  </h3>
                  <div className="h-1 w-24 bg-brand-black" />
                </div>
              </div>
            </div>
          </section>
        );

      case 'ancp_framework':
        return (
          <section key="ancp_framework" className="py-40 px-6 bg-brand-black">
            <div className="max-w-7xl mx-auto font-sans">
              <div className="text-center mb-24">
                <p className="text-brand-red font-black tracking-[0.5em] uppercase text-[10px] mb-8">Innovation in Wellness</p>
                <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white">
                  The <span className="text-brand-gold">ANCP</span> <br />
                  <span className="text-brand-red italic font-light lowercase">Spa Framework.</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 border border-white/10 p-12 relative group"
                >
                  <div className="absolute top-0 right-0 p-8 text-brand-gold/5 font-serif text-[12rem] leading-none font-light">Framework</div>
                  <div className="relative z-10 text-white">
                    <p className="text-lg text-white/60 font-light italic leading-relaxed mb-8 block">
                      <EditableText field="drFidAncpParagraph1" multiline />
                    </p>
                    <p className="text-sm text-white/40 font-light italic border-l border-brand-red pl-6 block">
                      <EditableText field="drFidAncpParagraph2" multiline />
                    </p>
                  </div>
                </motion.div>
                
                <div className="space-y-10">
                  <p className="text-lg text-white/60 font-light italic leading-relaxed block text-white/80">
                    <EditableText field="drFidAncpParagraph3" multiline />
                  </p>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="bg-white/5 p-8 border border-white/5 text-white">
                      <h4 className="text-4xl font-black text-brand-gold mb-2 block">
                        <EditableText field="drFidAncpTrainedCount" />
                      </h4>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Professionals Trained</p>
                    </div>
                    <div className="bg-white/5 p-8 border border-white/5 text-white">
                      <h4 className="text-4xl font-black text-brand-red mb-2 block">
                        <EditableText field="drFidAncpProtocolsLabel" />
                      </h4>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Treatment Protocols</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'vagina_room_context':
        return (
          <section key="vagina_room_context" className="py-32 px-6 border-t border-white/5 bg-brand-black">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-16 text-white font-sans">
              <div className="md:w-1/3">
                 <div className="w-48 h-48 rounded-full bg-brand-red/10 border border-brand-red/20 flex items-center justify-center p-8 relative">
                   <div className="absolute inset-2 border border-brand-gold/20 rounded-full animate-spin-slow pointer-events-none" />
                   <h4 className="text-center font-sans text-lg font-black tracking-tighter uppercase text-white">
                     The <span className="text-brand-gold italic font-light lowercase">Vagina</span> Room
                   </h4>
                 </div>
              </div>
              <div className="md:w-2/3">
                <p className="text-brand-red font-black tracking-[0.5em] uppercase text-[10px] mb-8">Empowerment Platform</p>
                <h3 className="text-4xl font-black uppercase tracking-tighter mb-8 text-white">The Movement</h3>
                <p className="text-lg text-white/60 font-light italic leading-relaxed">
                  Beyond clinical excellence, Dr. FID is the founder of <strong>The Vagina Room</strong>, a transformational women’s wellness and therapy community dedicated to intimate health education, emotional healing, reproductive wellness, and empowerment.
                </p>
              </div>
            </div>
          </section>
        );

      case 'personal_life':
        return (
          <section key="personal_life" className="py-40 px-6 border-t border-white/5 bg-brand-black overflow-hidden relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)] pointer-events-none" />
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 font-sans">
              <div className="lg:col-span-8 text-white">
                <p className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8">Personal Life</p>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12 block text-white">
                  <EditableText field="drFidPersonalLifeTitle" />
                </h3>
                <div className="space-y-8 text-white/60 text-lg font-light italic leading-relaxed">
                  <p className="block animate-slide-in">
                    <EditableText field="drFidPersonalLifeParagraph1" multiline />
                  </p>
                  <p className="block">
                    <EditableText field="drFidPersonalLifeParagraph2" multiline />
                  </p>
                </div>
              </div>
              
              <div className="lg:col-span-4 flex flex-col justify-end">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-brand-gold p-12 text-brand-black"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b border-black/10 pb-4">Philosophy</p>
                  <h4 className="text-2xl font-black uppercase tracking-tighter italic leading-tight block">
                    <EditableText field="drFidPersonalLifePhilosophy" multiline />
                  </h4>
                </motion.div>
              </div>
            </div>
          </section>
        );

      case 'closing_cta':
        return (
          <section key="closing_cta" className="py-40 bg-white text-brand-black">
            <div className="max-w-7xl mx-auto px-6 text-center font-sans">
              <h2 className="font-sans text-5xl md:text-[8rem] font-black mb-16 tracking-tighter leading-none uppercase">
                Inspire. <br /><span className="text-brand-red italic font-light lowercase">Mentor.</span> <br />Transform.
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-16 max-w-xl mx-auto">
                Continuing to inspire wellness professionals, entrepreneurs, and women across communities through education and transformative healing systems.
              </p>
              <Link to="/dr-fid-booking" className="bg-brand-red text-white px-20 py-8 rounded-none text-xs font-black tracking-[0.5em] uppercase hover:bg-brand-black transition-all duration-500 shadow-2xl inline-flex items-center group">
                Connect with Dr. FID
                <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform animate-pulse" size={20} />
              </Link>
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
        title="Meet Dr. FID" 
        description="Ambassador Dr. Damilola Awoyemi (Dr. FID) is a seasoned SPA Business Consultant, Holistic Wellness Expert, and women’s health advocate."
      />
      <div className="bg-brand-black text-white min-h-screen">
        <Navigation />
        
        <main className="pt-32">
          {sectionIds.map(id => renderSection(id))}
        </main>

        <Footer />
      </div>
    </>
  );
}
