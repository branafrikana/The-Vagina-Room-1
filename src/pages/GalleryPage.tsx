import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from '../components/SEO';
import { LayoutGrid, Filter, Camera, Play, Maximize2, Share2, Sparkles, ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import CategoryFilter from '../components/CategoryFilter';
import { useContent } from '../context/ContentContext';
import EditableText from '../components/EditableText';

export default function GalleryPage() {
  const { content } = useContent();

  const defaultImages = [
    {
      id: 1,
      title: "Intimate Wellness Workshop",
      category: "Workshops",
      image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800",
      description: "Empowering women through shared knowledge and safe conversations."
    },
    {
      id: 2,
      title: "Rural Health Outreach",
      category: "Outreach",
      image: "https://images.unsplash.com/photo-1516533075015-a3838414c3cb?auto=format&fit=crop&q=80&w=800",
      description: "Direct impact in underserved communities, providing essential education."
    },
    {
      id: 3,
      title: "Sisterhood Circle",
      category: "Community",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
      description: "A secure space for emotional healing and connection."
    },
    {
      id: 4,
      title: "Fid Spa Clinical Session",
      category: "Clinic",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800",
      description: "Professional restorative care and manual therapy expertise."
    },
    {
      id: 5,
      title: "Wellness Retreat",
      category: "Community",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
      description: "Returning to nature to find inner balance and peace."
    },
    {
      id: 6,
      title: "Health Education Seminar",
      category: "Workshops",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
      description: "Advanced seminars on reproductive and sexual wellness."
    },
    {
      id: 7,
      title: "Advocacy Movement",
      category: "Community",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1200",
      description: "Breaking stigmas through bold advocacy and public education."
    },
    {
      id: 8,
      title: "Mobile Clinic Preparation",
      category: "Outreach",
      image: "https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?auto=format&fit=crop&q=80&w=800",
      description: "Organizing resources for regional wellness drives."
    }
  ];

  let images = defaultImages;
  if (content.galleryImagesListJson) {
    try {
      const parsed = JSON.parse(content.galleryImagesListJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        images = parsed;
      }
    } catch (e) {
      console.warn("Error parsing galleryImagesListJson", e);
    }
  }

  const categories = ["All"];
  try {
    const dynamicCats = JSON.parse(content.galleryCategoriesJson || '[]');
    if (Array.isArray(dynamicCats)) {
      categories.push(...dynamicCats);
    }
  } catch (e) {
    // Fallback to deriving from images
    const derivedCats = Array.from(new Set(images.map(img => img.category).filter(Boolean)));
    categories.push(...derivedCats);
  }

  const [activeCategory, setActiveCategory] = useState("All");

  const filteredImages = activeCategory === "All" 
    ? images 
    : images.filter(img => img.category === activeCategory);

  return (
    <>
      <SEO 
        title="Sanctuary Gallery" 
        description="Explore visual highlights, therapeutic spaces, and community moments from our past intimate health events and outreach drives."
      />
      <div className="bg-brand-black text-white min-h-screen">
        <Navigation />
        
        <main className="pt-32">
        {/* Header */}
        <section className="py-24 px-6 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,rgba(212,175,55,0.05)_0%,transparent_50%)] pointer-events-none" />
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8"><EditableText field="galleryTitle" className="inline-block" /></p>
              <h1 className="font-sans text-4xl sm:text-6xl md:text-9xl font-black mb-12 tracking-tighter uppercase leading-none">
                Our <br /><span className="text-brand-red italic font-light lowercase">Gallery.</span>
              </h1>
              <p className="text-xl text-white/40 max-w-2xl mx-auto italic font-light leading-relaxed">
                <EditableText field="galleryDesc" multiline />
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
              label="Visual Archive Categories"
            />
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-32 px-6 min-h-[600px]">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence mode='popLayout'>
                {filteredImages.map((img) => (
                  <motion.div
                    key={img.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="group relative aspect-[4/5] bg-white/5 border border-white/5 overflow-hidden"
                  >
                    <img 
                      src={img.image} 
                      alt={img.title} 
                      className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-110 transition-all duration-1000"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                      <div className="space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <span className="bg-brand-red px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white">
                          {img.category}
                        </span>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
                          {img.title}
                        </h3>
                        <p className="text-white/60 text-xs italic font-light leading-relaxed">
                          {img.description}
                        </p>
                        <div className="flex space-x-4 pt-4">
                           <button className="p-2 border border-white/20 hover:bg-white hover:text-brand-black transition-colors rounded-none">
                             <Maximize2 size={14} />
                           </button>
                           <button className="p-2 border border-white/20 hover:bg-white hover:text-brand-black transition-colors rounded-none">
                             <Share2 size={14} />
                           </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* Interactive CTA */}
        <section className="py-40 px-6 bg-brand-red text-white">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Sparkles className="mx-auto mb-12 text-brand-black w-16 h-16" />
              <h2 className="font-sans text-5xl md:text-8xl font-black mb-12 uppercase tracking-tighter leading-none italic">
                Be Part of Our <br /><span className="text-brand-black font-light italic lowercase">Memory.</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-16 opacity-70">
                Witness the power of collective healing and shared experience through our lens.
              </p>
              <Link to="/support" className="bg-brand-black text-white px-20 py-8 rounded-none text-xs font-black tracking-[0.5em] uppercase hover:bg-white hover:text-brand-black transition-all duration-500 shadow-2xl inline-flex items-center group">
                Support Our Mission
                <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform" size={20} />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </>
  );
}
