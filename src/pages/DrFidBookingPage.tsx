import { useState, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from '../components/SEO';
import { 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  Check, 
  Send, 
  ArrowRight,
  Target,
  MessageSquare,
  Globe,
  Mic2,
  Presentation,
  Briefcase,
  Sparkles,
  Camera
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useContent } from '../context/ContentContext';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const bookingTypes = [
  { id: 'speaking', label: 'Speaking Engagement', icon: <Mic2 size={16} /> },
  { id: 'conference', label: 'Conference', icon: <Globe size={16} /> },
  { id: 'corporate', label: 'Corporate Training', icon: <Briefcase size={16} /> },
  { id: 'retreat', label: 'Wellness Retreat', icon: <Sparkles size={16} /> },
  { id: 'workshop', label: 'Workshop / Masterclass', icon: <Presentation size={16} /> },
  { id: 'panel', label: 'Panel Session', icon: <Users size={16} /> },
  { id: 'media', label: 'Media Interview', icon: <Camera size={16} /> },
  { id: 'other', label: 'Other', icon: <MessageSquare size={16} /> },
];

export default function DrFidBookingPage() {
  const { content } = useContent();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.date) newErrors.date = "Event date is required";
    if (!formData.eventTitle.trim()) newErrors.eventTitle = "Event title is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [formData, setFormData] = useState({
    // Personal
    fullName: '',
    organization: '',
    position: '',
    email: '',
    phone: '',
    
    // Details
    bookingType: 'speaking',
    eventTitle: '',
    eventTheme: '',
    preferredTopic: '',
    eventDescription: '',
    
    // Logistics
    location: '',
    venue: '',
    date: '',
    time: '',
    audienceSize: '',
    eventType: 'physical', // physical or virtual
    
    // Requirements
    duration: '',
    presentationNeeds: '',
    accommodation: '',
    travelSupport: '',
    
    // Additional
    specialRequests: '',
    notes: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstError = document.querySelector('[data-error="true"]');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        type: 'booking',
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, "submissions"), payload);
      
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert('Failed to submit booking request. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-brand-black min-h-screen text-white">
        <Navigation />
        <main className="pt-40 pb-24 px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-8"
          >
            <div className="w-24 h-24 bg-brand-gold/20 flex items-center justify-center rounded-full mx-auto border border-brand-gold/30">
              <Check className="text-brand-gold" size={48} />
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic">Request Received</h1>
            <p className="text-white/60 font-serif italic text-lg">
              Thank you for your interest in booking Dr. FID. Our team will review your request and contact you regarding availability, logistics, and confirmation.
            </p>
            <button 
              onClick={() => setIsSubmitted(false)}
              className="mt-8 border border-white/10 px-8 py-4 text-[10px] font-black uppercase tracking-[0.5em] hover:bg-white hover:text-brand-black transition-all"
            >
              Back to Form
            </button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Book Dr. FID" 
        description="Invite Dr. Damilola Awoyemi (Dr. FID) for speaking engagements, wellness conferences, corporate trainings, and more."
      />
      
      <div className="bg-brand-black min-h-screen text-white selection:bg-brand-red selection:text-white">
        <Navigation />
        
        <main className="pt-32 relative overflow-hidden">
          {/* Elegant Faded Hero Background Image */}
          <div className="absolute top-0 inset-x-0 h-[650px] overflow-hidden pointer-events-none z-0">
            <div 
              className="absolute inset-0 opacity-25 transition-opacity duration-1000"
              style={{ 
                backgroundImage: `url(${content.bookingBgUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1600"})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            {/* Cosmic Obsidian Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-brand-black/20 via-brand-black/70 to-brand-black" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(5,5,5,0.95)_100%)]" />
          </div>

          {/* Hero Header */}
          <section className="py-24 px-6 relative overflow-hidden text-center z-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-8 relative z-10"
            >
              <span className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] block">{content.bookingHeroSub || "Contact & Bookings"}</span>
              <h1 className="text-5xl md:text-8xl font-black uppercase tracking-[0.1em] text-white leading-none">
                {content.bookingHeroTitle?.includes(".") ? (
                  <>
                    {content.bookingHeroTitle.split(".")[0]} <br />
                    <span className="text-brand-red italic font-light lowercase font-serif">{content.bookingHeroTitle.split(".")[1]}.</span>
                  </>
                ) : (
                  content.bookingHeroTitle || "Invite Dr. FID."
                )}
              </h1>
              <p className="text-white/60 text-lg md:text-xl font-serif italic max-w-2xl mx-auto leading-relaxed whitespace-pre-wrap">
                {content.bookingHeroDesc || "Invite Dr. FID for speaking engagements, wellness conferences, corporate trainings, retreats, women’s wellness events, and transformational health conversations."}
              </p>
            </motion.div>
          </section>

          {/* About Section */}
          <section className="py-24 px-6 bg-white/5 border-y border-white/5">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-4 text-brand-gold">
                  <Target size={24} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Ambassador & Expert</span>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight leading-tight">
                  {content.bookingAboutHeading?.includes("&") ? (
                    <>
                      {content.bookingAboutHeading.split("&")[0]} & <br />
                      <span className="text-brand-red italic font-light lowercase font-serif">{content.bookingAboutHeading.split("&")[1]}</span>
                    </>
                  ) : (
                    content.bookingAboutHeading || "Holistic Wellness Expert & Women’s wellness advocate."
                  )}
                </h2>
                <p className="text-white/60 font-serif italic leading-relaxed text-lg whitespace-pre-wrap">
                  {content.bookingAboutDesc || "Ambassador Dr. Damilola Awoyemi (Dr. FID) is a Holistic Wellness Expert, SPA Business Consultant, women’s wellness advocate, and creator of transformational wellness systems focused on integrative healing, reproductive wellness, emotional wellbeing, and sustainable wellness entrepreneurship."}
                </p>
              </div>
              <div className="bg-brand-black border border-white/10 p-10 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-gold border-b border-white/10 pb-4">Available For</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(content.bookingAvailableList || "Speaking Engagements\nConferences & Summits\nCorporate Wellness Trainings\nWomen’s Wellness Programs\nRetreats & Wellness Experiences\nSPA & Wellness Business Trainings\nHealth Awareness Campaigns\nPanel Sessions & Interviews\nEducational Workshops").split("\n").map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 group">
                      <ArrowRight size={12} className="text-brand-red group-hover:translate-x-1 transition-transform" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-white/50">{item.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Booking Form */}
          <section className="py-32 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-20 text-center">
                <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-4">Booking Request Form</h2>
                <div className="h-px w-24 bg-brand-gold mx-auto" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-16">
                {/* 1. Personal Information */}
                <div className="space-y-10">
                  <div className="flex items-center gap-4 border-l-4 border-brand-gold pl-6">
                    <User className="text-brand-gold" size={24} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em]">01. Personal Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
                    <div className="space-y-2" data-error={errors.fullName ? "true" : "false"}>
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Full Name</label>
                      <input 
                        required
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`w-full bg-transparent border-b py-3 focus:border-brand-gold outline-none transition-colors text-white font-serif italic ${errors.fullName ? "border-brand-red" : "border-white/10"}`} 
                      />
                      {errors.fullName && <p className="text-[9px] text-brand-red font-bold uppercase tracking-widest mt-1">{errors.fullName}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Organization / Company</label>
                      <input 
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-white/10 py-3 focus:border-brand-gold outline-none transition-colors text-white font-serif italic" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Position / Role</label>
                      <input 
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-white/10 py-3 focus:border-brand-gold outline-none transition-colors text-white font-serif italic" 
                      />
                    </div>
                    <div className="space-y-2" data-error={errors.email ? "true" : "false"}>
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Email Address</label>
                      <input 
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full bg-transparent border-b py-3 focus:border-brand-gold outline-none transition-colors text-white font-serif italic ${errors.email ? "border-brand-red" : "border-white/10"}`} 
                      />
                      {errors.email && <p className="text-[9px] text-brand-red font-bold uppercase tracking-widest mt-1">{errors.email}</p>}
                    </div>
                    <div className="space-y-2" data-error={errors.phone ? "true" : "false"}>
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Phone Number</label>
                      <input 
                        required
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full bg-transparent border-b py-3 focus:border-brand-gold outline-none transition-colors text-white font-serif italic ${errors.phone ? "border-brand-red" : "border-white/10"}`} 
                      />
                      {errors.phone && <p className="text-[9px] text-brand-red font-bold uppercase tracking-widest mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* 2. Booking Details */}
                <div className="space-y-10">
                  <div className="flex items-center gap-4 border-l-4 border-brand-red pl-6">
                    <FileText className="text-brand-red" size={24} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em]">02. Booking Details</h3>
                  </div>
                  <div className="px-6 space-y-10">
                     <div className="space-y-6">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Type of Booking</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {bookingTypes.map(type => (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, bookingType: type.id }))}
                              className={`p-4 border transition-all flex flex-col items-center gap-3 text-center ${
                                formData.bookingType === type.id 
                                ? 'bg-brand-red border-brand-red text-white' 
                                : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                              }`}
                            >
                              {type.icon}
                              <span className="text-[9px] font-black uppercase tracking-widest">{type.label}</span>
                            </button>
                          ))}
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2" data-error={errors.eventTitle ? "true" : "false"}>
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Event Title</label>
                          <input 
                            name="eventTitle"
                            required
                            value={formData.eventTitle}
                            onChange={handleChange}
                            className={`w-full bg-transparent border-b py-3 focus:border-brand-gold outline-none transition-colors text-white font-serif italic ${errors.eventTitle ? "border-brand-red" : "border-white/10"}`} 
                          />
                          {errors.eventTitle && <p className="text-[9px] text-brand-red font-bold uppercase tracking-widest mt-1">{errors.eventTitle}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Event Theme / Topic</label>
                          <input 
                            name="eventTheme"
                            value={formData.eventTheme}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-white/10 py-3 focus:border-brand-gold outline-none transition-colors text-white font-serif italic" 
                          />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Preferred Speaking Topic</label>
                        <input 
                          name="preferredTopic"
                          value={formData.preferredTopic}
                          onChange={handleChange}
                          className="w-full bg-transparent border-b border-white/10 py-3 focus:border-brand-gold outline-none transition-colors text-white font-serif italic" 
                          placeholder="What specific topic would you like Dr. FID to cover?"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Event Description</label>
                        <textarea 
                          rows={4}
                          name="eventDescription"
                          value={formData.eventDescription}
                          onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 p-4 focus:border-brand-gold outline-none transition-colors text-white font-serif italic text-sm" 
                          placeholder="Briefly describe the event and its goals..."
                        />
                     </div>
                  </div>
                </div>

                {/* 3. Event Information */}
                <div className="space-y-10">
                  <div className="flex items-center gap-4 border-l-4 border-brand-gold pl-6">
                    <MapPin className="text-brand-gold" size={24} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em]">03. Event Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Event Location</label>
                      <input 
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-white/10 py-3 focus:border-brand-gold outline-none transition-colors text-white font-serif italic" 
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Venue Address</label>
                      <input 
                        name="venue"
                        value={formData.venue}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-white/10 py-3 focus:border-brand-gold outline-none transition-colors text-white font-serif italic" 
                      />
                    </div>
                    <div className="space-y-2" data-error={errors.date ? "true" : "false"}>
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Event Date</label>
                      <input 
                        type="date"
                        required
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className={`w-full bg-transparent border-b py-3 focus:border-brand-gold outline-none transition-colors text-white font-serif italic ${errors.date ? "border-brand-red" : "border-white/10"}`} 
                      />
                      {errors.date && <p className="text-[9px] text-brand-red font-bold uppercase tracking-widest mt-1">{errors.date}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Event Time</label>
                      <input 
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-white/10 py-3 focus:border-brand-gold outline-none transition-colors text-white font-serif italic" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Expected Audience Size</label>
                      <input 
                        name="audienceSize"
                        value={formData.audienceSize}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-white/10 py-3 focus:border-brand-gold outline-none transition-colors text-white font-serif italic" 
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Event Format</label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, eventType: 'physical' }))}
                          className={`flex-1 py-3 border text-[9px] font-black uppercase tracking-widest transition-all ${
                            formData.eventType === 'physical' ? 'bg-white text-brand-black border-white' : 'border-white/10 text-white/40 hover:border-white/30'
                          }`}
                        >
                          Physical
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, eventType: 'virtual' }))}
                          className={`flex-1 py-3 border text-[9px] font-black uppercase tracking-widest transition-all ${
                            formData.eventType === 'virtual' ? 'bg-white text-brand-black border-white' : 'border-white/10 text-white/40 hover:border-white/30'
                          }`}
                        >
                          Virtual
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Session Requirements */}
                <div className="space-y-10">
                  <div className="flex items-center gap-4 border-l-4 border-brand-red pl-6">
                    <Clock className="text-brand-red" size={24} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em]">04. Session Requirements</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Preferred Session Duration</label>
                      <input 
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-white/10 py-3 focus:border-brand-gold outline-none transition-colors text-white font-serif italic" 
                        placeholder="e.g. 45 mins + 15 mins Q&A"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Presentation Requirements</label>
                      <input 
                        name="presentationNeeds"
                        value={formData.presentationNeeds}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-white/10 py-3 focus:border-brand-gold outline-none transition-colors text-white font-serif italic" 
                        placeholder="Laptop, Projector, Mic type, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Accommodation Details</label>
                      <input 
                        name="accommodation"
                        value={formData.accommodation}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-white/10 py-3 focus:border-brand-gold outline-none transition-colors text-white font-serif italic" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Travel Support Details</label>
                      <input 
                        name="travelSupport"
                        value={formData.travelSupport}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-white/10 py-3 focus:border-brand-gold outline-none transition-colors text-white font-serif italic" 
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Additional Information */}
                <div className="space-y-10">
                  <div className="flex items-center gap-4 border-l-4 border-brand-gold pl-6">
                    <MessageSquare className="text-brand-gold" size={24} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em]">05. Additional Information</h3>
                  </div>
                  <div className="px-6 space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Special Requests / Additional Notes</label>
                      <textarea 
                        rows={4}
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 p-4 focus:border-brand-gold outline-none transition-colors text-white font-serif italic text-sm" 
                      />
                    </div>
                    
                    <div className="p-8 border border-white/5 bg-white/2 flex flex-col items-center justify-center space-y-4">
                       <Target className="text-white/20" size={32} />
                       <p className="text-[11px] font-black uppercase tracking-widest text-white/40 text-center uppercase">Upload Invitation Letter (Optional)</p>
                       <input 
                        type="file"
                        className="text-[9px] text-white/20 cursor-pointer block w-full max-w-xs mx-auto file:bg-white/5 file:border-white/10 file:text-white/40 file:px-4 file:py-2 file:mr-4 file:cursor-pointer hover:file:bg-brand-gold hover:file:text-brand-black transition-all"
                       />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-20 text-center space-y-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 max-w-sm mx-auto">
                    Kindly provide accurate event details. Our team will review your request and contact you.
                  </p>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto bg-brand-red text-white px-20 py-8 text-xs font-black uppercase tracking-[0.5em] hover:bg-white hover:text-brand-black transition-all relative group overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-4">
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Submit Booking Request
                          <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </span>
                    {isSubmitting && (
                      <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 bg-white/20"
                      />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
