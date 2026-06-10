import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from '../components/SEO';
import { Mail, Linkedin, Twitter, ArrowRight, Heart, Shield, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import CategoryFilter from '../components/CategoryFilter';
import { useContent } from '../context/ContentContext';
import EditableText from '../components/EditableText';

export default function TeamPage() {
  const { content } = useContent();

  const defaultTeam = [
    {
      name: "Amb. Dr. Damilola Awoyemi",
      role: "Founder & CEO (Dr. FID)",
      category: "Executive",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800",
      bio: "Visionary leader and holistic wellness expert dedicated to women's intimate health.",
      link: "/dr-fid"
    },
    {
      name: "Wellness Consultant",
      role: "Lead Holistic Practitioner",
      category: "Medical",
      image: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=800",
      bio: "Expert in restorative therapies and integrated healthcare solutions.",
    },
    {
      name: "Clinical Support",
      role: "Reproductive Health Educator",
      category: "Board",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=800",
      bio: "Empowering women with accurate education and compassionate support.",
    },
    {
      name: "Community Lead",
      role: "Advocacy & Support Manager",
      category: "Operations",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
      bio: "Building a safe space for connection, healing, and shared experiences.",
    }
  ];

  let team = defaultTeam;
  if (content.teamMembersJson) {
    try {
      const parsed = JSON.parse(content.teamMembersJson);
      if (Array.isArray(parsed)) {
        team = parsed;
      }
    } catch (e) {
      console.warn("Error parsing teamMembersJson", e);
    }
  }

  const categories = ["All"];
  try {
    const dynamicCats = JSON.parse(content.teamCategoriesJson || '[]');
    if (Array.isArray(dynamicCats)) {
      categories.push(...dynamicCats);
    }
  } catch (e) {
    const derivedCats = Array.from(new Set(team.map(m => m.category).filter(Boolean)));
    categories.push(...derivedCats);
  }

  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTeam = activeCategory === "All" 
    ? team 
    : team.filter(m => m.category === activeCategory);

  return (
    <>
      <SEO 
        title="Meet The Team" 
        description="Meet the compassionate team behind The Vagina Room, dedicated to supporting women's wellness, clinical education, and restorative therapy."
      />
      <div className="bg-brand-black text-white min-h-screen">
        <Navigation />
        
        <main className="pt-32">
        {/* Hero Section */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,rgba(212,175,55,0.05)_0%,transparent_50%)] pointer-events-none" />
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-brand-red font-black tracking-[0.5em] uppercase text-[10px] mb-8"><EditableText field="teamTitle" className="inline-block" /></p>
              <h1 className="font-sans text-4xl sm:text-6xl md:text-9xl font-black mb-12 tracking-tighter uppercase leading-none">
                Our <br /><span className="text-brand-gold italic font-light lowercase">Team.</span>
              </h1>
              <p className="text-xl text-white/40 max-w-2xl mx-auto italic font-light leading-relaxed">
                <EditableText field="teamDesc" multiline />
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-12 px-6 sticky top-[100px] z-30 bg-brand-black/95 backdrop-blur-xl border-y border-white/5">
          <div className="max-w-7xl mx-auto flex justify-center">
            <CategoryFilter 
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              label="Staff Role Tiers"
            />
          </div>
        </section>

        {/* Team Grid */}
        <section className="py-32 px-6 min-h-[400px]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
              <AnimatePresence mode='popLayout'>
                {filteredTeam.map((member, i) => (
                  <motion.div
                    key={member.name}
                    layout
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="group relative"
                  >
                    <div className="flex flex-col md:flex-row gap-8 bg-white/5 border border-white/5 p-8 hover:border-brand-gold/20 transition-all duration-500 h-full">
                      <div className="md:w-2/5 aspect-square relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-brand-red/10 group-hover:opacity-0 transition-opacity" />
                        {member.category && (
                          <div className="absolute top-0 left-0 bg-brand-gold text-brand-black text-[8px] font-black uppercase tracking-widest px-2 py-1">
                            {member.category}
                          </div>
                        )}
                      </div>
                      
                      <div className="md:w-3/5 flex flex-col justify-between">
                        <div>
                          <p className="text-brand-gold font-black tracking-widest uppercase text-[10px] mb-2">{member.role}</p>
                          <h3 className="text-3xl font-black uppercase tracking-tighter mb-6">{member.name}</h3>
                          <p className="text-sm text-white/50 leading-relaxed italic font-light mb-8">
                            "{member.bio}"
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-4">
                            <a href="#" className="p-2 bg-white/5 hover:bg-brand-red transition-colors rounded-none"><Mail size={14} /></a>
                            <a href="#" className="p-2 bg-white/5 hover:bg-brand-red transition-colors rounded-none"><Linkedin size={14} /></a>
                          </div>
                          {member.link && (
                            <a 
                              href={member.link}
                              className="text-[10px] font-black tracking-widest uppercase text-brand-gold hover:text-white transition-colors flex items-center group/link"
                            >
                              View Profile
                              <ArrowRight size={14} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-40 px-6 bg-brand-red text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-12 leading-none">
                  Driven by <br /><span className="text-brand-black italic font-light lowercase">Compassion.</span>
                </h2>
                <p className="text-xl font-light italic leading-relaxed opacity-80">
                  Our team doesn't just provide services—we provide a safe harbor. We are trained to listen first, understand deeply, and heal with empathy.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { title: "Expert Care", icon: <Star className="text-brand-black" /> },
                  { title: "Privacy First", icon: <Shield className="text-brand-black" /> },
                  { title: "Deep Empathy", icon: <Heart className="text-brand-black" /> },
                  { title: "Holistic View", icon: <ArrowRight className="text-brand-black" /> }
                ].map((item, i) => (
                  <div key={i} className="p-10 border border-black/10 bg-white/5 backdrop-blur-sm">
                    <div className="mb-6">{item.icon}</div>
                    <h4 className="font-black uppercase tracking-widest text-[10px]">{item.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Career CTA */}
        <section className="py-40 px-6 bg-brand-black text-center">
          <div className="max-w-7xl mx-auto">
            <p className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8">Join the Mission</p>
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-12">
              Want to <span className="text-brand-red italic font-light lowercase">impact</span> lives?
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto mb-16 italic font-light">
              We are always looking for passionate health professionals and wellness advocates who share our vision of an empowered womanhood.
            </p>
            <Link to="/partner" className="border border-brand-gold text-brand-gold px-16 py-6 rounded-none text-xs font-black tracking-[0.5em] uppercase hover:bg-brand-gold hover:text-brand-black transition-all duration-500 inline-flex items-center group">
              Work With Us
              <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform" size={16} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </>
  );
}
