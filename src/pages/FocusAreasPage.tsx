import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { Heart, Sparkles, Shield, Flower2, Zap, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useContent } from '../context/ContentContext';
import EditableText from '../components/EditableText';

export default function FocusAreasPage() {
  const { content } = useContent();

  const getSectionIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('vaginal') || lower.includes('reproductive')) return <Flower2 className="text-brand-red" size={40} />;
    if (lower.includes('sexual') || lower.includes('relationship')) return <Heart className="text-brand-gold" size={40} />;
    return <Zap className="text-brand-red" size={40} />;
  };

  const defaultSections = [
    {
      title: "Vaginal & Reproductive Wellness",
      description: "We provide education, support, and wellness solutions around the core of women's physical health.",
      items: [
        "Vaginal health & hygiene",
        "Vulva and vagina wellness",
        "Vaginal microbiome health",
        "Infection treatment & prevention",
        "STI testing & treatment",
        "Menstrual health support",
        "Pelvic floor health",
        "Sexual pain management",
        "Hormonal balance & therapy",
        "Pregnancy & postpartum care",
        "Menopause support",
        "Fertility support & guidance",
        "Contraception & family planning"
      ],
      color: "bg-brand-red"
    },
    {
      title: "Sexual Wellness & Relationship Support",
      description: "We create safe and respectful spaces for women and couples to learn, heal, and grow.",
      items: [
        "Sexual health education",
        "Sexual intimacy coaching",
        "Libido & desire enhancement",
        "Sex therapy & counselling",
        "Relationship counselling",
        "Sexual trauma support",
        "Sexual education for different life stages",
        "Gender identity & sexual orientation support"
      ],
      color: "bg-brand-gold"
    },
    {
      title: "Holistic Healing & Empowerment",
      description: "Embracing emotional, mental, natural, and lifestyle-centered wellness approaches.",
      items: [
        "Body positivity & self-love",
        "Natural & alternative therapies",
        "Herbal wellness education",
        "Emotional wellness support",
        "Confidence rebuilding",
        "Women’s reproductive rights advocacy"
      ],
      color: "bg-white/10"
    }
  ];

  let sections = defaultSections;
  if (content.focusAreasJson) {
    try {
      const parsed = JSON.parse(content.focusAreasJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        sections = parsed;
      }
    } catch (e) {
      console.warn("Error parsing focusAreasJson", e);
    }
  }

  return (
    <>
      <Helmet>
        <title>Focus Areas - The Room</title>
        <meta name="description" content="Explore our core expertise: Vaginal & Reproductive Wellness, Sexual Wellness & Relationship Support, and Holistic Healing & Empowerment." />
      </Helmet>
      <div className="bg-brand-black text-white min-h-screen">
        <Navigation />
        
        <main className="pt-32">
        {/* Header */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,rgba(180,31,45,0.05)_0%,transparent_50%)] pointer-events-none" />
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8"><EditableText field="focusAreasSub" className="inline-block" /></p>
              <h1 className="font-sans text-4xl sm:text-6xl md:text-9xl font-black mb-12 tracking-tighter uppercase leading-none">
                <EditableText field="focusAreasHeading" fancyMode="break" />
              </h1>
              <p className="text-xl text-white/40 max-w-2xl mx-auto italic font-light leading-relaxed">
                <EditableText field="focusAreasTitle" multiline />
              </p>
            </motion.div>
          </div>
        </section>

        {/* Sections */}
        <section className="pb-40 px-6">
          <div className="max-w-7xl mx-auto space-y-32">
            {sections.map((section, idx) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start"
              >
                <div className="lg:col-span-5 sticky top-32">
                  <div className="mb-8">{getSectionIcon(section.title)}</div>
                  <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black uppercase tracking-tighter mb-8 leading-tight">
                    {section.title}
                  </h2>
                  <p className="text-xl text-white/60 font-light italic leading-relaxed mb-12">
                    {section.description}
                  </p>
                  <div className={`h-1 w-24 ${idx % 2 === 0 ? 'bg-brand-red' : 'bg-brand-gold'}`} />
                </div>

                <div className="lg:col-span-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.items && section.items.map((item, i) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white/5 backdrop-blur-sm p-6 border border-white/5 hover:border-brand-red/30 transition-all group"
                      >
                        <div className="flex items-center space-x-4">
                          <CheckCircle2 size={16} className="text-brand-red opacity-20 group-hover:opacity-100 transition-opacity" />
                          <span className="text-sm font-black tracking-widest uppercase text-white/40 group-hover:text-white transition-colors">
                            {item}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section 
          className="py-40 text-white relative overflow-hidden bg-cover bg-center"
          style={content.focusAreasCtaBgUrl ? { backgroundImage: `url(${content.focusAreasCtaBgUrl})` } : { backgroundColor: '#B41F2D' }}
        >
          {content.focusAreasCtaBgUrl && <div className="absolute inset-0 bg-brand-red/80 mix-blend-multiply" />}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <h3 className="font-sans text-5xl md:text-8xl font-black mb-12 uppercase tracking-tighter leading-none">
              {content.focusAreasCtaHeading ? (
                content.focusAreasCtaHeading.includes("Transformation.") ? (
                  <>Start Your <br /><span className="text-brand-black italic font-light lowercase">Transformation.</span></>
                ) : content.focusAreasCtaHeading
              ) : (
                <>Start Your <br /><span className="text-brand-black italic font-light lowercase">Transformation.</span></>
              )}
            </h3>
            <p className="text-xl text-white/80 mb-16 max-w-2xl mx-auto uppercase tracking-[0.3em] font-light">
              {content.focusAreasCtaSub || "Healing is a journey. We are here to guide every step."}
            </p>
            <a href={content.focusAreasCtaUrl || "https://join.thevaginaroom.com"} target="_blank" rel="noopener noreferrer" className="bg-brand-black text-white px-16 py-6 rounded-none text-xs font-black tracking-[0.5em] uppercase hover:bg-white hover:text-brand-black transition-all duration-500 shadow-2xl inline-flex items-center group">
              {content.focusAreasCtaBtnText || "Join The Community"}
              <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform" size={20} />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </>
  );
}
