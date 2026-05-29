import { useState, useEffect } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { 
  Heart, 
  Sparkles, 
  Flower2, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Compass, 
  HelpCircle, 
  Check, 
  ArrowUpRight, 
  HeartHandshake, 
  Eye, 
  Activity, 
  ShieldCheck 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useContent } from '../context/ContentContext';
import EditableText from '../components/EditableText';

// Define typed schema for fully robust rendering
interface FocusItem {
  name: string;
  desc: string;
}

interface FocusSection {
  id: string;
  title: string;
  tagline: string;
  description: string;
  color: string;
  items: FocusItem[];
}

export default function FocusAreasPage() {
  const { content, isAdmin, isEditMode } = useContent();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // Quiz assessment states
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [quizOutput, setQuizOutput] = useState<{
    headline: string;
    description: string;
    recs: string[];
    actionLabel: string;
    actionUrl: string;
  } | null>(null);

  const getSectionIcon = (title: string, size = 32) => {
    const lower = title.toLowerCase();
    if (lower.includes('vaginal') || lower.includes('reproductive')) {
      return <Flower2 className="text-brand-red" size={size} />;
    }
    if (lower.includes('sexual') || lower.includes('relationship') || lower.includes('intimacy')) {
      return <Heart className="text-brand-gold" size={size} />;
    }
    return <Sparkles className="text-brand-gold" size={size} />;
  };

  // High-fidelity rich default sections designed with deep contextual details
  const defaultSections: FocusSection[] = [
    {
      id: "reproductive",
      title: "Vaginal & Reproductive Wellness",
      tagline: "The core physiological foundations of health.",
      description: "Providing high-fidelity, evidence-based physical knowledge, supportive routines, and specialized clinical coaching for vaginal microbiome equilibrium and endocrine ease.",
      color: "brand-red",
      items: [
        { name: "Vaginal health & hygiene", desc: "Scientific practices to support your body's natural self-cleaning mechanisms safely." },
        { name: "Vulva and vagina wellness", desc: "Physiological guidance, moisturization, and tender everyday care rules." },
        { name: "Vaginal microbiome health", desc: "Restoring Lactobacillus dominance to optimize natural defense against dysbiosis." },
        { name: "Infection treatment & prevention", desc: "Holistic systems to handle and block recurrent yeast, BV, and vaginal discomfort." },
        { name: "STI testing & treatment", desc: "Confidential coaching, results decoding, and somatic recovery journeys." },
        { name: "Menstrual health support", desc: "Regulating cycles, understanding dysmenorrhea, and cycle-syncing." },
        { name: "Pelvic floor health", desc: "Nerve restoration, physical tone adjustments, and deep pelvic muscular ease." }
      ]
    },
    {
      id: "sexual",
      title: "Sexual Wellness & Intimacy Support",
      tagline: "Desire, expression, and absolute somatic healing.",
      description: "Developing respectful and transparent pathways to address female pleasure, intimacy blocks, libido shifts, and relationship synchronicity.",
      color: "brand-gold",
      items: [
        { name: "Sexual health education", desc: "Dismantling historical stigmas to explore your personal orgasmic potential." },
        { name: "Sexual intimacy coaching", desc: "Empractical workshops and strategies to foster transparency with partners." },
        { name: "Libido & desire enhancement", desc: "Resolving performance blocks and low desire from holistic endocrinal angles." },
        { name: "Sex therapy & counselling", desc: "Somatic counseling for couples seeking to unlock authentic biological attraction." },
        { name: "Relationship counselling", desc: "Repairing broken cycles, healing boundary violations, and rebuilding love." },
        { name: "Sexual trauma support", desc: "Somatic processing to safely store past wounds and step into pure sensual sovereignty." }
      ]
    },
    {
      id: "holistic",
      title: "Holistic Healing & Empowerment",
      tagline: "Claiming complete sovereign wisdom.",
      description: "Interweaving emotional restoration, alternative remedies, botanical properties, and physical liberation to help every woman lead from a space of supreme agency.",
      color: "white/20",
      items: [
        { name: "Body positivity & self-love", desc: "Nurturing genuine affinity with your physical form through mirror rituals." },
        { name: "Natural & alternative therapies", desc: "Weaving evidence-based acupuncture, light, thermal, and natural massage inputs." },
        { name: "Herbal wellness education", desc: "Utilizing safe, ancient leaf infusions and tonic formulas for internal balance." },
        { name: "Emotional wellness support", desc: "Nervous system down-regulation, community support, and emotional safety nets." },
        { name: "Confidence rebuilding", desc: "Speaking your sovereign needs and setting unbreakable energetic boundaries." },
        { name: "Women’s reproductive rights advocacy", desc: "Providing dynamic knowledge of systemic rights, healthcare access, and political agency." }
      ]
    }
  ];

  let sections: FocusSection[] = defaultSections;
  if (content.focusAreasJson) {
    try {
      const parsed = JSON.parse(content.focusAreasJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Map old format cleanly if missing detailed objects
        sections = parsed.map((sec: any, idx: number) => {
          const defaultSec = defaultSections[idx] || defaultSections[0];
          return {
            id: sec.id || `custom-${idx}`,
            title: sec.title || defaultSec.title,
            tagline: sec.tagline || defaultSec.tagline,
            description: sec.description || defaultSec.description,
            color: sec.color || defaultSec.color,
            items: Array.isArray(sec.items) ? (sec.items as any[]).map((item: any) => {
              if (typeof item === 'string') {
                // look for matching desc in default values
                const foundDefault = defaultSec.items.find((df: any) => df.name?.toLowerCase() === item.toLowerCase());
                return {
                  name: item,
                  desc: foundDefault ? foundDefault.desc : "Personalized care and educational pathways with expert consultation."
                };
              }
              return {
                name: item?.name || "Specialized Topic",
                desc: item?.desc || "Personalized care and educational pathways with expert consultation."
              };
            }) : defaultSec.items
          };
        });
      }
    } catch (e) {
      console.warn("Error parsing focusAreasJson", e);
    }
  }

  // Filter sections dynamically based on tabs
  const filteredSections = activeTab === 'all' 
    ? sections 
    : sections.filter(sec => sec.id === activeTab);

  // Self assessment quiz dynamic feedback engine
  const handleSelectGoal = (goal: string) => {
    setSelectedGoal(goal);
    if (goal === 'hygiene') {
      setQuizOutput({
        headline: "Nurturing Systemic Physical Equilibrium",
        description: "Your primary path points toward biological flora safety, vaginal microbiome balancing, and understanding cycle transitions. We suggest focusing on reproductive hygiene and our structured pelvic insights.",
        recs: ["Vaginal microbiome health coaching", "Infection block protocols", "Pelvic floor support tips"],
        actionLabel: "Book Bio-Wellness Consult with Dr. Fid",
        actionUrl: "/dr-fid-booking"
      });
    } else if (goal === 'intimacy') {
      setQuizOutput({
        headline: "Expanding Sensual Connection & Desire",
        description: "Your current focus is on relational depth, sexual frequency alignment, and building somatic sensation trust. Unlocking blockages here requires a non-judgmental space to explore desire and confidence.",
        recs: ["Sexual intimacy coaching sessions", "Desire enhancement systems", "Relationship transparency counseling"],
        actionLabel: "Explore Sexual Counselling",
        actionUrl: "/dr-fid-booking"
      });
    } else if (goal === 'healing') {
      setQuizOutput({
        headline: "Trauma Recovery & Somatic Awakening",
        description: "You are looking to down-regulate your nervous system, process relational or sensory trauma, and celebrate physical autonomy. This is a subtle, gentle path best paired with therapeutic somatic guidance.",
        recs: ["Somatic trauma integration support", "Confidence & self-love rituals", "Emotional security circles"],
        actionLabel: "Connect Confidentially with Dr. Fid",
        actionUrl: "/dr-fid-booking"
      });
    } else {
      setQuizOutput({
        headline: "Sovereign Health & Botanical Integration",
        description: "Your goal is holistic wellness education, herbal tonic implementation, and knowing your biological rights. This pathway blends physical, mental, and constitutional wellness gracefully.",
        recs: ["Herbal formula wellness insights", "Natural therapies exploration", "Reproductive advocacy resources"],
        actionLabel: "Join The Exclusive Community Lounge",
        actionUrl: "/join-community"
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Focus Areas - The Vagina Room</title>
        <meta name="description" content="Explore our core expertise: Vaginal & Reproductive Wellness, Sexual Wellness & Relationship Support, and Holistic Healing & Empowerment." />
      </Helmet>

      <div className="bg-[#050505] text-white min-h-screen selection:bg-brand-gold selection:text-brand-black relative">
        <Navigation />
        
        <main className="pt-28 pb-12">
          {/* Majestic Atmospheric Hero Banner */}
          <section className="py-24 px-6 md:px-12 relative overflow-hidden flex flex-col justify-center min-h-[70vh]">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-radial-gradient(circle_at_50%_40%,rgba(212,175,55,0.06)_0%,transparent_60%)] pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(226,52,17,0.04)_0%,transparent_50%)] pointer-events-none" />
              {/* Subtle visual grid overlays */}
              <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <div className="max-w-6xl mx-auto text-center relative z-10 w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                {/* Visual Label */}
                <span className="inline-flex items-center space-x-2 bg-brand-gold/5 border border-brand-gold/20 px-4 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-[0.3em] text-brand-gold mb-2">
                  <Activity size={10} className="text-brand-gold animate-pulse mr-1" />
                  <span>The Core Pillars of Sacred Health</span>
                </span>

                <p className="text-brand-gold font-sans font-black tracking-[0.4em] uppercase text-xs">
                  <EditableText field="focusAreasSub" className="inline-block" />
                </p>

                <h1 className="font-serif text-5xl sm:text-7xl md:text-9xl font-semibold tracking-tight text-white leading-none">
                  <EditableText field="focusAreasHeading" fancyMode="break" />
                </h1>

                <div className="h-0.5 w-20 bg-brand-gold/30 mx-auto mt-6" />

                <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto italic font-light tracking-wide leading-relaxed mt-6 font-serif">
                  <EditableText field="focusAreasTitle" multiline />
                </p>
              </motion.div>
            </div>

            {/* Downward scrolling atmospheric indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/20 font-mono text-[8px] uppercase tracking-[0.4em] flex flex-col items-center gap-2">
              <span>EXPLORE ALL EXPERTISE</span>
              <motion.div 
                animate={{ y: [0, 6, 0] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-[1px] h-6 bg-brand-gold/30" 
              />
            </div>
          </section>

          {/* Premium Selector System Tab Bar */}
          <section className="px-6 relative z-20 -mt-10">
            <div className="max-w-3xl mx-auto bg-[#0d0d0d]/95 p-2 rounded-full border border-white/10 flex flex-wrap gap-1 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-md">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 min-w-[120px] py-3 px-4 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-1.5 ${
                  activeTab === 'all' 
                    ? 'bg-brand-gold text-brand-black font-bold shadow-[0_4px_12px_rgba(212,175,55,0.2)]' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>All Core Areas</span>
              </button>
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveTab(sec.id)}
                  className={`flex-1 min-w-[170px] py-3 px-4 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-2 ${
                    activeTab === sec.id 
                      ? 'bg-white text-brand-black font-bold shadow-[0_4px_12px_rgba(255,255,255,0.15)]' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {getSectionIcon(sec.title, 12)}
                  <span className="truncate">{sec.title.split(' ')[0]} Wellness</span>
                </button>
              ))}
            </div>
          </section>

          {/* Main Focus Areas Redesigned Grid */}
          <section className="py-24 px-6 md:px-12 relative z-10">
            <div className="max-w-6xl mx-auto space-y-36">
              <AnimatePresence mode="wait">
                {filteredSections.map((section, idx) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start"
                  >
                    {/* Left Column: Core Theme Presentation */}
                    <div className="lg:col-span-5 lg:sticky lg:top-36 space-y-6">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                        {getSectionIcon(section.title, 28)}
                      </div>
                      
                      <div className="space-y-3">
                        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-brand-gold">
                          0{idx + 1} / SECTION PILLAR
                        </span>
                        <h2 className="text-3xl sm:text-5xl font-serif font-light text-white leading-tight uppercase">
                          {section.title}
                        </h2>
                      </div>

                      <p className="font-serif italic text-brand-gold/90 text-sm tracking-wide">
                        "{section.tagline}"
                      </p>

                      <p className="text-sm md:text-base text-white/50 leading-relaxed font-sans font-light">
                        {section.description}
                      </p>

                      <div className="pt-2 flex items-center space-x-3">
                        <span className="w-8 h-[1px] bg-brand-gold/40" />
                        <span className="font-mono text-[9px] text-white/40 tracking-[0.2em] uppercase">SYSTEMIC CARE PATH</span>
                      </div>
                    </div>

                    {/* Right Column: Interactive Topic Breakdown Bento Grid */}
                    <div className="lg:col-span-7">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {section.items && (section.items as any[]).map((item, i) => {
                          const name = typeof item === 'string' ? item : item.name;
                          const desc = typeof item === 'string' ? "Expert education and curated physical assistance methods." : item.desc;
                          const isCurrentlyHovered = hoveredItem === `${section.id}-${i}`;

                          return (
                            <motion.div
                              key={name}
                              initial={{ opacity: 0, x: 20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: Math.min(i * 0.04, 0.3) }}
                              onMouseEnter={() => setHoveredItem(`${section.id}-${i}`)}
                              onMouseLeave={() => setHoveredItem(null)}
                              className="relative bg-[#0d0d0d]/80 rounded-xl border border-white/5 hover:border-brand-gold/30 p-6 flex flex-col justify-between transition-all duration-500 overflow-hidden group cursor-def overflow-hidden select-none min-h-[140px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]"
                            >
                              {/* Background ambient lighting for hovered items */}
                              <div className="absolute -right-20 -bottom-20 w-44 h-44 rounded-full bg-brand-gold/5 blur-[45px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                              
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="bg-brand-gold/5 border border-brand-gold/20 p-1 rounded-md">
                                    <CheckCircle2 size={13} className="text-brand-gold" />
                                  </div>
                                  <span className="font-mono text-[8px] text-white/20 tracking-widest">{idx + 1}.{i + 1}</span>
                                </div>
                                
                                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white group-hover:text-brand-gold transition-colors duration-300">
                                  {name}
                                </h4>
                              </div>

                              <p className="mt-3 text-[11px] text-white/45 leading-relaxed font-sans font-light group-hover:text-white/70 transition-colors duration-300">
                                {desc}
                              </p>

                              {/* Corner Arrow Glow Accent */}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <ArrowUpRight size={12} className="text-brand-gold/50" />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Majestic Redesigned High-Premium CTA Section */}
          <section 
            className="py-36 text-white relative overflow-hidden bg-cover bg-center border-t border-brand-gold/10"
            style={content.focusAreasCtaBgUrl ? { backgroundImage: `url(${content.focusAreasCtaBgUrl})` } : { backgroundColor: '#050505' }}
          >
            {/* If no custom image background, we render a high-quality obsidian backplane gradient */}
            {!content.focusAreasCtaBgUrl && (
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-black via-[#110d0d] to-[#1e0707] z-0" />
            )}
            
            <div className="absolute inset-0 bg-brand-black/75 z-[1]" />
            <div className="absolute inset-0 opacity-[0.25] mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80')] bg-cover" />
            
            {/* Subtle center gold glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-brand-gold/5 blur-[120px] pointer-events-none z-[1]" />

            <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-10">
              <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-brand-gold block">SUPPORTIVE HEALING ATMOSPHERE</span>
              
              <h3 className="font-serif text-4xl md:text-7xl font-light mb-8 uppercase tracking-tight leading-none text-white">
                {content.focusAreasCtaHeading ? (
                  content.focusAreasCtaHeading.includes("Transformation.") ? (
                    <>Start Your <br /><span className="text-brand-gold italic font-light font-serif">Transformation.</span></>
                  ) : content.focusAreasCtaHeading
                ) : (
                  <>Start Your <br /><span className="text-brand-gold italic font-light font-serif">Transformation.</span></>
                )}
              </h3>

              <p className="text-sm md:text-base text-white/50 mb-12 max-w-2xl mx-auto uppercase tracking-[0.2em] font-light font-mono">
                {content.focusAreasCtaSub || "Healing is a collective journey. We are here to guide every milestone."}
              </p>

              <div>
                <Link 
                  to="/join-community" 
                  className="bg-brand-red hover:bg-brand-gold text-white hover:text-brand-black px-12 py-5 font-mono text-[10px] font-black tracking-[0.4em] uppercase transition-all duration-500 shadow-2xl inline-flex items-center group relative overflow-hidden"
                >
                  <span className="relative z-10">{content.focusAreasCtaBtnText || "Join The Community"}</span>
                  <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform relative z-10" size={14} />
                  {/* Hover white sheen */}
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/15 opacity-40 group-hover:animate-shine" />
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

// Inline mini helper components to prevent missing icon definitions & keep everything modular
function HelperActivityIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Activity {...props} />;
}
function HelperHeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Heart {...props} />;
}
function HelperShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return <ShieldCheck {...props} />;
}
function HelperSparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Sparkles {...props} />;
}
