// ... (imports)
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from '../components/SEO';
import { Calendar, MapPin, Clock, ArrowRight, Ticket, Star, Users, Sparkles, X, Send } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import CategoryFilter from '../components/CategoryFilter';
import { useContent } from '../context/ContentContext';
import EditableText from '../components/EditableText';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function EventsPage() {
  const { content } = useContent();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [rsvpForm, setRsvpForm] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "submissions"), {
        formType: "event_rsvp",
        eventId: selectedEvent.id || selectedEvent.title,
        eventTitle: selectedEvent.title,
        ...rsvpForm,
        createdAt: new Date().toISOString()
      });
      setRsvpSuccess(true);
      setTimeout(() => {
        setSelectedEvent(null);
        setRsvpSuccess(false);
        setRsvpForm({ name: '', email: '', phone: '' });
      }, 3000);
    } catch (err) {
      console.error("RSVP Error:", err);
      alert("Failed to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultEvents = [
    {
      title: "The Intimate Wellness Masterclass",
      date: "June 15, 2026",
      time: "10:00 AM - 2:00 PM",
      location: "Fid Spa Clinic, Asaba",
      type: "Workshop",
      category: "Workshop",
      price: "Registration Required",
      image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800",
      description: "An intensive education session focusing on hormonal balance, vaginal health, and empowering your body's natural healing systems.",
      status: "Upcoming"
    },
    {
      title: "Healing & Wholeness Retreat",
      date: "July 22, 2026",
      time: "Full Day Experience",
      location: "Private Community, Delta State",
      type: "Retreat",
      category: "Retreat",
      price: "Exclusive Invite",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
      description: "A day of restorative therapy, emotional healing, and sisterhood connection designed to reset your mental and physical wellbeing.",
      status: "Limited Slots"
    },
    {
      title: "Community Outreach: Rural Health",
      date: "August 05, 2026",
      time: "8:00 AM - 4:00 PM",
      location: "Local Community Center",
      type: "Outreach",
      category: "Outreach",
      price: "Free Admission",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
      description: "Providing basic screenings and intimate health education to underserved communities.",
      status: "Registration Open"
    }
  ];

  let events = defaultEvents;
  if (content.eventsListJson) {
    try {
      const parsed = JSON.parse(content.eventsListJson);
      if (Array.isArray(parsed)) {
        events = parsed;
      }
    } catch (e) {
      console.warn("Error parsing eventsListJson", e);
    }
  }

  const categories = ["All"];
  try {
    const dynamicCats = JSON.parse(content.eventsCategoriesJson || '[]');
    if (Array.isArray(dynamicCats)) {
      categories.push(...dynamicCats);
    }
  } catch (e) {
    const derivedCats = Array.from(new Set(events.map(e => e.type || e.category).filter(Boolean)));
    categories.push(...derivedCats);
  }

  const [activeCategory, setActiveCategory] = useState("All");

  const filteredEvents = activeCategory === "All" 
    ? events 
    : events.filter(e => (e.type || e.category) === activeCategory);

  return (
    <>
      <SEO 
        title="Upcoming Events" 
        description="Join our upcoming events, intensive masterclasses, and workshops designed to empower your reproductive and intimate wellness."
      />
      <div className="bg-brand-black text-white min-h-screen">
        <Navigation />
        
        <main className="pt-32">
        {/* Hero Section */}
        <section className="py-24 px-6 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08)_0%,transparent_50%)] pointer-events-none" />
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-brand-red font-black tracking-[0.5em] uppercase text-[10px] mb-8"><EditableText field="eventsTitle" className="inline-block" /></p>
              <h1 className="font-sans text-4xl sm:text-6xl md:text-9xl font-black mb-12 tracking-tighter uppercase leading-none">
                Our <br /><span className="text-brand-gold italic font-light lowercase">Events.</span>
              </h1>
              <p className="text-xl text-white/40 max-w-2xl mx-auto italic font-light leading-relaxed">
                <EditableText field="eventsDesc" multiline />
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
              label="Event Type Categories"
            />
          </div>
        </section>

        {/* Calendar Grid */}
        <section className="py-32 px-6 min-h-[400px]">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-12">
              {filteredEvents.length === 0 && (
                <div className="py-24 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                  <p className="text-[11px] font-black uppercase tracking-widest text-white/30">There are no upcoming scheduled gatherings at this time</p>
                </div>
              )}
              <AnimatePresence mode='popLayout'>
                {filteredEvents.map((event, i) => (
                  <motion.div
                    key={event.title}
                    layout
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.4 }}
                    className="group relative bg-white/5 border border-white/5 p-8 md:p-12 hover:border-brand-gold/30 transition-all duration-700 overflow-hidden"
                  >
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 p-12 text-brand-gold/5 font-serif text-[10rem] leading-none pointer-events-none uppercase italic translate-x-12 -translate-y-8">
                      {event.type}
                    </div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                      <div className="lg:col-span-4 aspect-[4/3] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000 border border-white/10">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[2000ms]" />
                      </div>
                      
                      <div className="lg:col-span-8 flex flex-col justify-between h-full">
                        <div className="space-y-6">
                          <div className="flex flex-wrap gap-4 mb-4">
                             <span className="bg-brand-red px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                               {event.status}
                             </span>
                             <span className="bg-white/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white/80">
                               {event.price}
                             </span>
                          </div>
                          
                          <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter group-hover:text-brand-gold transition-colors leading-none">{event.title}</h3>
                          
                          <div className="flex flex-wrap items-center gap-x-12 gap-y-4 text-[10px] font-black tracking-widest uppercase text-white/50">
                            <div className="flex items-center"><Calendar size={14} className="mr-3 text-brand-gold" /> {event.date}</div>
                            <div className="flex items-center"><Clock size={14} className="mr-3 text-brand-gold" /> {event.time}</div>
                            <div className="flex items-center"><MapPin size={14} className="mr-3 text-brand-gold" /> {event.location}</div>
                          </div>
                          
                          <p className="text-white/60 font-light italic leading-relaxed max-w-2xl">
                            {event.description}
                          </p>
                        </div>
                        
                        <div className="mt-12 flex items-center justify-between">
                          <button 
                            onClick={() => setSelectedEvent(event)}
                            className="flex items-center text-xs font-black tracking-[0.4em] uppercase text-brand-gold hover:text-white transition-colors group/btn cursor-pointer"
                          >
                            Register Now
                            <ArrowRight className="ml-4 group-hover/btn:translate-x-2 transition-transform" size={16} />
                          </button>
                          <div className="w-12 h-[1px] bg-white/10" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* RSVP Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-brand-black border border-brand-gold/30 p-8 md:p-12 max-w-lg w-full relative"
              >
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-6 right-6 text-white/50 hover:text-white"
                >
                  <X size={24} />
                </button>

                {rsvpSuccess ? (
                  <div className="text-center py-12 space-y-6">
                    <Sparkles className="mx-auto text-brand-gold" size={48} />
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Registered</h3>
                    <p className="text-white/60 font-light italic">Your registration for {selectedEvent.title} has been received.</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">Register</h3>
                    <p className="text-white/50 text-sm font-light italic mb-8 border-b border-white/10 pb-4">{selectedEvent.title}</p>
                    
                    <form onSubmit={handleRsvpSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Full Name</label>
                        <input 
                          required
                          value={rsvpForm.name}
                          onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                          className="w-full bg-white/5 border-b py-3 text-white focus:border-brand-gold outline-none transition-colors border-white/10 italic" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Email Address</label>
                        <input 
                          required
                          type="email"
                          value={rsvpForm.email}
                          onChange={(e) => setRsvpForm({ ...rsvpForm, email: e.target.value })}
                          className="w-full bg-white/5 border-b py-3 text-white focus:border-brand-gold outline-none transition-colors border-white/10 italic" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Phone Number (Optional)</label>
                        <input 
                          value={rsvpForm.phone}
                          onChange={(e) => setRsvpForm({ ...rsvpForm, phone: e.target.value })}
                          className="w-full bg-white/5 border-b py-3 text-white focus:border-brand-gold outline-none transition-colors border-white/10 italic" 
                        />
                      </div>
                      
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-brand-gold text-brand-black py-5 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-3 cursor-pointer"
                      >
                        {isSubmitting ? "Processing..." : "Confirm Registration"}
                        <Send size={14} />
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global CTA Section */}
        <section className="py-40 px-6 bg-brand-gold text-brand-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)]" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <Sparkles className="mx-auto mb-8 text-brand-red animate-pulse" size={48} />
            <h2 className="font-sans text-5xl md:text-8xl font-black mb-12 uppercase tracking-tighter leading-tight italic">
              Experience the <br /><span className="text-brand-red font-light italic lowercase">Transformation.</span>
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-70">
              Join a movement where every conversation matters and every woman belongs.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </>
  );
}
