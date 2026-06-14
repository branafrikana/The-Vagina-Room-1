import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import EditableText from './EditableText';
import CategoryFilter from './CategoryFilter';

export interface TestimonialItem {
  id: number;
  quote: string;
  author: string;
  role: string;
  category?: string;
  avatar?: string;
  rating?: number;
}

const DEFAULT_REVIEW_LIST: TestimonialItem[] = [
  {
    id: 1,
    quote: "The Vagina Room gave me my dignity back. I used to feel so much shame about my reproductive health questions, but here I found answers and sisterhood.",
    author: "Chiamaka O.",
    role: "Community Member",
    category: "Community",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    rating: 5
  },
  {
    id: 2,
    quote: "Dr. FID's holistic wellness approach and vaginal health sessions literally saved my marriage. Learning to love and understand my body changed everything.",
    author: "Ngozi E.",
    role: "Workshop Participant",
    category: "Education",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    rating: 5
  },
  {
    id: 3,
    quote: "A completely safe, non-judgmental, and confidential space. Every young woman needs to be a part of this movement.",
    author: "Fatima Y.",
    role: "Regular Attendee",
    category: "Safe Space",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
    rating: 5
  }
];

export default function Testimonials() {
  const { content } = useContent();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isHovered, setIsHovered] = useState(false);

  // Parse testimonials JSON from content context, defaulting to default review list
  let testimonials: TestimonialItem[] = DEFAULT_REVIEW_LIST;
  if (content.testimonialsJson) {
    try {
      const parsed = JSON.parse(content.testimonialsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        testimonials = parsed;
      }
    } catch (e) {
      console.warn("Error parsing testimonialsJson inside slider component", e);
    }
  }

  const categories = ["All"];
  try {
    const dynamicCats = JSON.parse(content.testimonialCategoriesJson || '[]');
    if (Array.isArray(dynamicCats)) {
      categories.push(...dynamicCats);
    }
  } catch (e) {
    const derivedCats = Array.from(new Set(testimonials.map(t => t.category).filter(Boolean)));
    categories.push(...derivedCats);
  }

  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTestimonials = activeCategory === "All" 
    ? testimonials 
    : testimonials.filter(t => t.category === activeCategory);

  // Reset index when category changes
  useEffect(() => {
    setActiveIndex(0);
  }, [activeCategory]);

  // Handle slide rotation timer
  useEffect(() => {
    if (isHovered || filteredTestimonials.length <= 1) return;
    
    const interval = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % filteredTestimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isHovered, filteredTestimonials.length]);

  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length);
  };

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % filteredTestimonials.length);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  // If there are no testimonials, skip rendering
  if (testimonials.length === 0) return null;

  const current = filteredTestimonials[activeIndex];

  // Slide sliding animation variants
  const slideVariants: any = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 }
      }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 }
      }
    })
  };

  return (
    <section 
      id="testimonials-section" 
      className="py-32 bg-brand-black text-white relative overflow-hidden bg-[radial-gradient(circle_at_bottom_left,rgba(196,30,58,0.03)_0%,transparent_50%)]"
    >
      {/* Decorative quotes background watermark */}
      <div className="absolute right-12 bottom-12 text-white/[0.02] select-none pointer-events-none hidden md:block">
        <Quote size={240} strokeWidth={1} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Headline Column */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 lg:sticky lg:top-32"
          >
            <p className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8">
              <EditableText field="testimonialsSub" />
            </p>
            <h2 className="font-sans text-5xl md:text-7xl font-black mb-8 text-white leading-[0.9] tracking-tighter uppercase">
              <EditableText field="testimonialsTitle" fancyMode="inline" />
            </h2>
            <p className="text-lg text-white/50 font-light max-w-sm mb-12">
              <EditableText field="testimonialsDesc" multiline />
            </p>

            {/* Filters */}
            <div className="mb-12">
              <CategoryFilter 
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                label="Filter Collective Stories"
              />
            </div>

            {/* Slider Navigation controls for desktop */}
            {filteredTestimonials.length > 1 && (
              <div className="flex gap-4 hidden lg:flex">
                <button
                  onClick={handlePrev}
                  className="w-12 h-12 flex items-center justify-center border border-white/10 hover:border-brand-gold hover:text-brand-gold text-white/70 transition-all cursor-pointer bg-white/5 hover:bg-white/10"
                  aria-label="Previous review"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNext}
                  className="w-12 h-12 flex items-center justify-center border border-white/10 hover:border-brand-gold hover:text-brand-gold text-white/70 transition-all cursor-pointer bg-white/5 hover:bg-white/10"
                  aria-label="Next review"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </motion.div>

          {/* Cards Active Cycling Column */}
          <EditableText field="testimonialsJson" multiline className="lg:col-span-7 block" as="div">
            {filteredTestimonials.length > 0 ? (
              <motion.div 
                className="bg-white/5 p-10 md:p-14 border border-white/10 relative min-h-[440px] flex flex-col justify-between touch-pan-y cursor-grab active:cursor-grabbing"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                drag={filteredTestimonials.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_event, info) => {
                  const swipeThreshold = 50;
                  if (info.offset.x < -swipeThreshold) {
                    handleNext();
                  } else if (info.offset.x > swipeThreshold) {
                    handlePrev();
                  }
                }}
              >
                {/* Top rating or quotes mark */}
                <div className="flex justify-between items-start mb-8">
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1">
                      {[...Array(current?.rating || 5)].map((_, i) => (
                        <Star key={i} size={16} className="fill-brand-gold text-brand-gold stroke-none" />
                      ))}
                    </div>
                    {current?.category && (
                      <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[8px]">{current.category}</span>
                    )}
                  </div>
                  <Quote size={40} className="text-brand-red/30" />
                </div>

                {/* Animating transition block */}
                <div className="relative flex-grow overflow-hidden flex items-center select-none mb-10">
                  <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                      key={`${activeCategory}-${activeIndex}`}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="w-full"
                    >
                      <p className="text-xl md:text-2xl font-serif italic text-white/90 leading-relaxed font-light mb-4">
                        "{current?.quote}"
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Review Author Information & Indicators bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-white/5 pt-8">
                  <div className="flex items-center gap-4">
                    {current?.avatar && (
                      <img 
                        src={current.avatar} 
                        alt={current.author} 
                        className="w-12 h-12 rounded-full object-cover border border-brand-gold/30 grayscale"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div>
                      <h4 className="font-bold uppercase tracking-wider text-sm text-white">{current?.author}</h4>
                      <p className="font-mono text-xs text-brand-gold">{current?.role}</p>
                    </div>
                  </div>

                  {/* Dots indicators & mobile next/prev indicators wrapper */}
                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    {/* Dots index marker */}
                    {filteredTestimonials.length > 1 && (
                      <div className="flex gap-2">
                        {filteredTestimonials.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => handleDotClick(i)}
                            className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                              i === activeIndex 
                                ? 'w-6 bg-brand-gold' 
                                : 'w-1.5 bg-white/20 hover:bg-white/40'
                            }`}
                            aria-label={`Go to slide ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Tablet/Mobile fallback controls */}
                    {filteredTestimonials.length > 1 && (
                      <div className="flex gap-2 lg:hidden">
                        <button
                          onClick={handlePrev}
                          className="w-9 h-9 flex items-center justify-center border border-white/10 hover:border-brand-gold text-white/70 hover:bg-white/5 cursor-pointer"
                          aria-label="Previous review"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={handleNext}
                          className="w-9 h-9 flex items-center justify-center border border-white/10 hover:border-brand-gold text-white/70 hover:bg-white/5 cursor-pointer"
                          aria-label="Next review"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="bg-white/5 p-14 border border-dashed border-white/10 flex flex-col items-center justify-center text-center min-h-[440px]">
                <p className="text-white/20 font-mono text-xs uppercase tracking-widest">No testimonials found in this category.</p>
              </div>
            )}
          </EditableText>

        </div>
      </div>
    </section>
  );
}
