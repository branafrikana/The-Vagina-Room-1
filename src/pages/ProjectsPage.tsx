import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from '../components/SEO';
import { LayoutGrid, Calendar, MapPin, ArrowRight, ExternalLink, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import CategoryFilter from '../components/CategoryFilter';
import { useContent } from '../context/ContentContext';
import EditableText from '../components/EditableText';

export default function ProjectsPage() {
  const { content } = useContent();

  const defaultProjects = [
    {
      title: "The Intimate Wellness Workshop",
      category: "Education",
      status: "Ongoing",
      location: "Asaba, Delta State",
      date: "Monthly",
      image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800",
      description: "A series of masterclasses taught by experts covering vaginal hygiene, hormonal balance, and sexual wellness.",
      impact: "500+ Women Educated"
    },
    {
      title: "Project Healing Hands",
      category: "Support",
      status: "Active",
      location: "Fid Spa Clinic",
      date: "Quarterly",
      image: "https://images.unsplash.com/photo-1516533075015-a3838414c3cb?auto=format&fit=crop&q=80&w=800",
      description: "Restorative therapy sessions and emotional counselling for women recovering from reproductive health challenges and trauma.",
      impact: "120+ Sessions Completed"
    },
    {
      title: "Rural Outreach Initiative",
      category: "Advocacy",
      status: "Upcoming",
      location: "Delta State Villages",
      date: "Sept 2026",
      image: "https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?auto=format&fit=crop&q=80&w=800",
      description: "Taking intimate health education and basic screenings to women in underserved rural communities who lack access to modern wellness facilities.",
      impact: "Target: 1000 Women"
    },
    {
      title: "The Digital Community",
      category: "Digital",
      status: "In Development",
      location: "Global / Online",
      date: "Oct 2026",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
      description: "A confidential AI-powered (Gemini) platform for women to ask sensitive health questions and receive immediate, trusted guidance.",
      impact: "Alpha Testing Phase"
    }
  ];

  let projects = defaultProjects;
  if (content.projectsListJson) {
    try {
      const parsed = JSON.parse(content.projectsListJson);
      if (Array.isArray(parsed)) {
        projects = parsed;
      }
    } catch (e) {
      console.warn("Error parsing projectsListJson", e);
    }
  }
  
  const categories = ["All"];
  try {
    const dynamicCats = JSON.parse(content.projectsCategoriesJson || '[]');
    if (Array.isArray(dynamicCats)) {
      categories.push(...dynamicCats);
    }
  } catch (e) {
    const derivedCats = Array.from(new Set(projects.map(p => p.category).filter(Boolean)));
    categories.push(...derivedCats);
  }

  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects = activeCategory === "All" 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <>
      <SEO 
        title="Our Projects" 
        description="Discover our ongoing and upcoming advocacy, clinical outreach, and education projects making a real difference in women's reproductive health."
      />
      <div className="bg-brand-black text-white min-h-screen">
        <Navigation />
        
        <main className="pt-32">
        {/* Hero Section */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(180,31,45,0.05)_0%,transparent_50%)] pointer-events-none" />
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8"><EditableText field="projectsTitle" className="inline-block" /></p>
              <h1 className="font-sans text-4xl sm:text-6xl md:text-9xl font-black mb-12 tracking-tighter uppercase leading-none">
                <EditableText field="projectsHeading" />
              </h1>
              <p className="text-xl text-white/40 max-w-2xl mx-auto italic font-light leading-relaxed">
                <EditableText field="projectsDesc" multiline />
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
              label="Project Scope Categories"
            />
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-32 px-6 min-h-[400px]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {filteredProjects.length === 0 && (
                <div className="col-span-1 md:col-span-2 py-24 text-center border border-dashed border-white/10 bg-white/[0.01]">
                  <p className="text-[11px] font-black uppercase tracking-widest text-white/30">There are no active projects listed at this time</p>
                </div>
              )}
              <AnimatePresence mode='popLayout'>
                {filteredProjects.map((project, i) => (
                  <motion.div
                    key={project.title}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="group"
                  >
                    <div className="relative aspect-video overflow-hidden mb-8 border border-white/5 grayscale group-hover:grayscale-0 transition-all duration-1000">
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[2000ms]" />
                      <div className="absolute top-6 left-6 flex space-x-2">
                         <span className="bg-brand-red px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                           {project.category}
                         </span>
                         <span className="bg-white/10 backdrop-blur-md px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white/80">
                           {project.status}
                         </span>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <h3 className="text-3xl font-black uppercase tracking-tighter group-hover:text-brand-gold transition-colors">{project.title}</h3>
                        <div className="p-3 border border-white/10 rounded-full group-hover:border-brand-red transition-colors">
                          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-[10px] font-black tracking-widest uppercase text-white/40">
                        <div className="flex items-center">
                          <MapPin size={12} className="mr-2 text-brand-gold" />
                          {project.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar size={12} className="mr-2 text-brand-gold" />
                          {project.date}
                        </div>
                      </div>
                      
                      <p className="text-white/60 font-light italic leading-relaxed">
                        {project.description}
                      </p>
                      
                      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                         <div className="flex items-center">
                           <Sparkles size={16} className="text-brand-gold mr-3" />
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold">Impact: {project.impact}</span>
                         </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-40 px-6 bg-brand-gold text-brand-black overflow-hidden relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(196,30,58,0.05)_0%,transparent_70%)] pointer-events-none" />
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
              <div className="md:w-1/2 text-center md:text-left">
                <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-8">
                  <EditableText field="projectsCtaHeading" />
                </h2>
                <p className="text-xl font-light italic leading-relaxed opacity-80 max-w-sm">
                  <EditableText field="projectsCtaDesc" multiline />
                </p>
              </div>
              <div className="md:w-1/2 flex flex-col items-center md:items-end space-y-8">
                 <Link to="/support" className="bg-brand-black text-white px-16 py-6 rounded-none text-xs font-black tracking-[0.5em] uppercase hover:bg-white hover:text-brand-black transition-all duration-500 shadow-2xl inline-flex items-center group">
                   Support A Project
                   <Heart className="ml-4 group-hover:scale-110 transition-transform" size={16} />
                 </Link>
                 <Link to="/contact" className="text-[10px] font-black tracking-[0.4em] uppercase border-b border-black/20 pb-2 hover:border-black transition-all">Request Impact Report (PDF)</Link>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
    </>
  );
}
