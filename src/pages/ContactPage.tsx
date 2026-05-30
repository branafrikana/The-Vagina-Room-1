import { motion } from 'motion/react';
import SEO from '../components/SEO';
import { Mail, Phone, MapPin, Send, MessageSquare, Heart, HandHelping, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import EditableText from '../components/EditableText';

export default function ContactPage() {
  const { submitFormSubmission, content } = useContent();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.message.trim()) newErrors.message = "Message is required";
    else if (formData.message.trim().length < 10) newErrors.message = "Message must be at least 10 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const contactDetails = [
    {
      icon: <MapPin className="text-brand-gold" size={24} />,
      title: "Visit Our Clinic",
      detail: content.contactAddress || "84 Okpanam Rd, opp. Legislative Quarters, GRA Phase I, Asaba, Delta State, Nigeria.",
      link: "#"
    },
    {
      icon: <Mail className="text-brand-gold" size={24} />,
      title: "Email Support",
      detail: content.contactEmail || "info@thevaginaroom.com",
      link: `mailto:${content.contactEmail || "info@thevaginaroom.com"}`
    },
    {
      icon: <Phone className="text-brand-gold" size={24} />,
      title: "Call Us",
      detail: content.contactPhone || "+234 802 729 4320",
      link: `tel:${content.contactPhone || "+2348027294320"}`
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const res = await submitFormSubmission("contact", formData);
      if (res.success) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          subject: 'General Inquiry',
          message: ''
        });
      } else {
        alert("The server refused the transmission. Please try again later.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred sending query.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO 
        title="Contact Us" 
        description="Get in touch with The Vagina Room. We are here to support you in your intimate and reproductive wellness journey."
      />
      <div className="bg-brand-black text-white min-h-screen">
        <Navigation />
        
        <main className="pt-32 relative">
          {/* Blurred Background Image */}
          <div 
            className="fixed inset-0 z-[-1] opacity-20 filter blur-3xl pointer-events-none"
            style={{ 
              backgroundImage: `url(${content.contactBgUrl || "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=1600"})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          
          {/* Hero Section */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,rgba(180,31,45,0.05)_0%,transparent_50%)] pointer-events-none" />
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <EditableText field="contactLabel" className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8 block" />
              <h1 className="font-sans text-4xl sm:text-6xl md:text-9xl font-black mb-12 tracking-tighter uppercase leading-none">
                <EditableText field="contactHeading" fancyMode="break" />
              </h1>
              <p className="text-xl text-white/40 max-w-2xl mx-auto italic font-light leading-relaxed block">
                <EditableText field="contactSub" multiline />
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Grid & Form */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
              {/* Left Side: Details */}
              <div className="lg:col-span-1 space-y-12 lg:col-span-5">
                <div className="space-y-8">
                  {contactDetails.map((item, i) => (
                    <motion.a
                      key={i}
                      href={item.link}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start space-x-8 p-10 bg-white/5 border border-white/5 hover:border-brand-gold/30 transition-all group block"
                    >
                      <div className="p-4 bg-white/5 rounded-none group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red mb-2">{item.title}</h4>
                        <p className="text-lg font-light italic text-white/70 group-hover:text-white transition-colors">
                          {item.detail}
                        </p>
                      </div>
                    </motion.a>
                  ))}
                </div>

                <div className="p-12 bg-brand-red/10 border border-brand-red/20 space-y-6">
                   <h4 className="flex items-center text-brand-red text-[10px] font-black uppercase tracking-[0.4em]">
                     <MessageSquare size={16} className="mr-4" fill="none" /> <EditableText field="contactConfidentialityTitle" />
                   </h4>
                   <p className="text-sm text-white/50 leading-relaxed font-light italic block">
                     <EditableText field="contactConfidentialityDesc" multiline />
                   </p>
                </div>
              </div>

              {/* Right Side: Form */}
              <div className="lg:col-span-7">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white/5 p-12 md:p-20 border border-white/10"
                >
                  <h3 className="text-3xl font-black uppercase tracking-tighter mb-12">Send a Message</h3>
                  
                  {submitted ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12 space-y-6"
                    >
                      <div className="w-16 h-16 bg-brand-gold/10 border border-brand-gold/30 rounded-full flex items-center justify-center mx-auto text-brand-gold animate-bounce">
                        <CheckCircle size={32} />
                      </div>
                      <h4 className="text-2xl font-black uppercase tracking-tight">Message Delivered</h4>
                      <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed">
                        Thank you for reaching out to **The Vagina Room**. Your message has been logged securely, and our team will get in touch shortly.
                      </p>
                      <button 
                        onClick={() => setSubmitted(false)}
                        className="text-xs uppercase font-black tracking-widest text-brand-gold hover:text-white underline cursor-pointer"
                      >
                        Send another query
                      </button>
                    </motion.div>
                  ) : (
                    <form className="space-y-8" onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Name</label>
                          <input 
                            type="text" 
                            required
                            value={formData.name}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, name: e.target.value }));
                              if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                            }}
                            className={`w-full bg-white/5 border-b px-0 py-4 text-white focus:border-brand-gold focus:outline-none transition-colors ${errors.name ? "border-brand-red" : "border-white/10"}`} 
                            placeholder="Full Name" 
                          />
                          {errors.name && <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest mt-2">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Email</label>
                          <input 
                            type="email" 
                            required
                            value={formData.email}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, email: e.target.value }));
                              if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                            }}
                            className={`w-full bg-white/5 border-b px-0 py-4 text-white focus:border-brand-gold focus:outline-none transition-colors ${errors.email ? "border-brand-red" : "border-white/10"}`} 
                            placeholder="Email Address" 
                          />
                          {errors.email && <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest mt-2">{errors.email}</p>}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Subject</label>
                        <select 
                          value={formData.subject}
                          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                          className="w-full bg-white/5 border-b border-white/10 px-0 py-4 text-white focus:border-brand-gold focus:outline-none transition-colors appearance-none cursor-pointer"
                        >
                          <option className="bg-brand-black" value="General Inquiry">General Inquiry</option>
                          <option className="bg-brand-black" value="Wellness Support">Wellness Support</option>
                          <option className="bg-brand-black" value="Partnership Request">Partnership Request</option>
                          <option className="bg-brand-black" value="Event Registration">Event Registration</option>
                          <option className="bg-brand-black" value="Feedback">Feedback</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Message</label>
                        <textarea 
                          required
                          value={formData.message}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, message: e.target.value }));
                            if (errors.message) setErrors(prev => ({ ...prev, message: "" }));
                          }}
                          className={`w-full bg-white/5 border-b px-0 py-4 text-white focus:border-brand-gold focus:outline-none transition-colors h-40 resize-none ${errors.message ? "border-brand-red" : "border-white/10"}`} 
                          placeholder="Your Message..."
                        />
                        {errors.message && <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest mt-2">{errors.message}</p>}
                      </div>

                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-brand-gold text-brand-black py-8 rounded-none text-xs font-black tracking-[0.5em] uppercase hover:bg-brand-red hover:text-white transition-all duration-500 shadow-2xl flex items-center justify-center group cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? "Delivering..." : "Submit Your Message"}
                        <Send className="ml-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={16} />
                      </button>
                    </form>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Opportunities */}
        <section className="py-40 px-6 border-t border-white/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
               <EditableText field="contactWaysToSupportLabel" className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8 block" />
               <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter">
                 <EditableText field="contactWaysToSupportTitle" fancyMode="inline" />
               </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 className="group relative bg-brand-red p-16 md:p-24 overflow-hidden"
               >
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                 <Heart size={48} className="text-white mb-10" />
                 <h3 className="text-4xl font-black uppercase tracking-tighter text-white mb-6">
                   <EditableText field="contactSupportMissionTitle" />
                 </h3>
                 <p className="text-white/80 text-xl font-light italic leading-relaxed mb-12">
                   <EditableText field="contactSupportMissionDesc" multiline />
                 </p>
                 <Link
                   to="/support"
                   className="bg-brand-black text-white px-12 py-5 rounded-none text-[10px] font-black tracking-[0.4em] uppercase hover:bg-white hover:text-brand-black transition-all flex items-center inline-block"
                 >
                   <EditableText field="contactSupportMissionBtnText" /> <ArrowRight size={14} className="ml-4" />
                 </Link>
               </motion.div>

               <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.1 }}
                 className="group relative border border-white/10 p-16 md:p-24 overflow-hidden hover:bg-white/5 transition-colors"
               >
                 <HandHelping size={48} className="text-brand-gold mb-10" />
                 <h3 className="text-4xl font-black uppercase tracking-tighter text-white mb-6">
                   <EditableText field="contactPartnerWithUsTitle" />
                 </h3>
                 <p className="text-white/40 text-xl font-light italic leading-relaxed mb-12">
                   <EditableText field="contactPartnerWithUsDesc" multiline />
                 </p>
                 <Link
                   to="/support#partner"
                   className="border border-brand-gold text-brand-gold px-12 py-5 rounded-none text-[10px] font-black tracking-[0.4em] uppercase hover:bg-brand-gold hover:text-brand-black transition-all flex items-center inline-block"
                 >
                   <EditableText field="contactPartnerWithUsBtnText" /> <ArrowRight size={14} className="ml-4" />
                 </Link>
               </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </>
  );
}
