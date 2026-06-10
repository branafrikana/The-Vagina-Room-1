import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from '../components/SEO';
import { HandHelping, Users, Globe, Send, Sparkles, ArrowRight, ShieldCheck, Upload, Trash2, FileText, CheckCircle } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useContent } from '../context/ContentContext';
import EditableText from '../components/EditableText';

export default function PartnerPage() {
  const { submitFormSubmission, content } = useContent();
  const [formData, setFormData] = useState({
    organizationName: '',
    contactPerson: '',
    email: '',
    partnershipType: 'Professional/Healthcare',
    proposal: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const partners = [
    {
      title: "Healthcare Professionals",
      icon: <HandHelping className="text-brand-red" size={32} />,
      desc: "Join our referral network or contribute your expertise to our education masterclasses and workshops."
    },
    {
      title: "Corporate Sponsors",
      icon: <Users className="text-brand-gold" size={32} />,
      desc: "Align your brand with women's empowerment through event sponsorship, project funding, and corporate social responsibility."
    },
    {
      title: "Community Organizations",
      icon: <Globe className="text-brand-red" size={32} />,
      desc: "Collaborate on regional health drives, rural outreach initiatives, and advocacy campaigns to maximize impact."
    }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        fileName: file ? file.name : null,
        fileSize: file ? file.size : null
      };

      const res = await submitFormSubmission("partnership", payload);
      
      if (res.success) {
        setSubmitted(true);
        setFormData({
          organizationName: '',
          contactPerson: '',
          email: '',
          partnershipType: 'Professional/Healthcare',
          proposal: ''
        });
        setFile(null);
      } else {
        alert("There was an issue processing your submission. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending partnership request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <>
      <SEO 
        title="Partner With Us" 
        description="Join forces with The Vagina Room. Discover corporate sponsorship, healthcare practitioner, and community advocacy partnership opportunities."
      />
      <div className="bg-brand-black text-white min-h-screen">
        <Navigation />
        
        <main className="pt-32">
        {/* Partner Hero */}
        <section className="py-24 px-6 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,rgba(180,31,45,0.08)_0%,transparent_50%)] pointer-events-none" />
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-brand-gold font-black tracking-[0.5em] uppercase text-[10px] mb-8"><EditableText field="partnerTitle" className="inline-block" /></p>
              <h1 className="font-sans text-4xl sm:text-6xl md:text-9xl font-black mb-12 tracking-tighter uppercase leading-none">
                Partner <br />With <span className="text-brand-red italic font-light lowercase">Us.</span>
              </h1>
              <p className="text-xl text-white/40 max-w-2xl mx-auto italic font-light leading-relaxed">
                <EditableText field="partnerDesc" multiline />
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits/Categories */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {partners.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-12 bg-white/5 border border-white/5 hover:border-brand-gold/30 transition-all group"
                >
                  <div className="mb-8">{card.icon}</div>
                  <h4 className="text-2xl font-black uppercase tracking-tighter mb-6">{card.title}</h4>
                  <p className="text-sm text-white/50 leading-relaxed font-light italic mb-10">
                    {card.desc}
                  </p>
                  <div className="h-[1px] w-12 bg-white/10 group-hover:w-full transition-all duration-700" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-40 px-6 bg-brand-gold text-brand-black overflow-hidden relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-12">
                  Building <br />The <span className="text-brand-red italic font-light lowercase">Future.</span>
                </h2>
                <div className="space-y-8">
                  <p className="text-xl font-light italic leading-relaxed opacity-80">
                    Your partnership isn't just a collaboration; it's an investment in the dignity and health of women across Nigeria and beyond.
                  </p>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-3xl font-black mb-1">5k+</p>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Women Reached</p>
                    </div>
                    <div>
                      <p className="text-3xl font-black mb-1">30+</p>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Certified Pros</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                 <div className="aspect-square border border-brand-black/10 p-12 flex flex-col justify-center">
                    <ShieldCheck size={48} className="mb-8" />
                    <h3 className="text-3xl font-black uppercase tracking-tighter mb-6 italic">Professional Excellence</h3>
                    <p className="text-brand-black/60 italic font-light">"We prioritize standardized treatment protocols and clinical-grade care in every partnership we foster."</p>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Inquiry Form */}
        <section id="partner-form" className="py-40 px-6 bg-brand-black">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 p-12 md:p-20 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-brand-gold/5 font-serif text-[10rem] leading-none pointer-events-none uppercase italic">Partner</div>
              <div className="relative z-10">
                <div className="text-center mb-16">
                  <Sparkles className="mx-auto mb-6 text-brand-gold" size={32} />
                  <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">Start A Conversation</h3>
                  <p className="text-sm text-white/40 italic font-light">Join hands with us to transform womanhood.</p>
                </div>
                
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-16 space-y-8"
                    >
                      <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto border border-brand-gold/20">
                        <CheckCircle className="text-brand-gold" size={40} />
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-2xl font-black uppercase tracking-tighter text-brand-gold">Inquiry Submitted</h4>
                        <p className="text-white/60 italic font-light max-w-md mx-auto leading-relaxed">
                          Thank you for your interest in partnering with The Vagina Room. Our team will review your proposal and get in touch with you shortly.
                        </p>
                      </div>
                      <button 
                        onClick={() => setSubmitted(false)}
                        className="px-8 py-4 border border-white/20 hover:border-brand-gold text-white hover:text-brand-gold transition-all uppercase text-[10px] font-black tracking-widest"
                      >
                        Submit Another Inquiry
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form 
                      key="form"
                      className="space-y-8" 
                      onSubmit={handleSubmit}
                    >
                      {/* Grid 1: Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                            Organization Name <span className="text-brand-red">*</span>
                          </label>
                          <input 
                            type="text" 
                            required
                            value={formData.organizationName}
                            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                            className="w-full bg-transparent border-b border-white/10 py-4 text-white focus:border-brand-gold focus:outline-none transition-colors" 
                            placeholder="Name" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                            Contact Person <span className="text-brand-red">*</span>
                          </label>
                          <input 
                            type="text" 
                            required
                            value={formData.contactPerson}
                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                            className="w-full bg-transparent border-b border-white/10 py-4 text-white focus:border-brand-gold focus:outline-none transition-colors" 
                            placeholder="Full Name" 
                          />
                        </div>
                      </div>
                      
                      {/* Grid 2: Communications & Type */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                            Email Address <span className="text-brand-red">*</span>
                          </label>
                          <input 
                            type="email" 
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-transparent border-b border-white/10 py-4 text-white focus:border-brand-gold focus:outline-none transition-colors" 
                            placeholder="email@example.com" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                            Type of Partnership <span className="text-brand-red">*</span>
                          </label>
                          <div className="relative">
                            <select 
                              required
                              value={formData.partnershipType}
                              onChange={(e) => setFormData({ ...formData, partnershipType: e.target.value })}
                              className="w-full bg-transparent border-b border-white/10 py-4 text-white focus:border-brand-gold focus:outline-none transition-colors appearance-none cursor-pointer"
                            >
                              <option value="Professional/Healthcare" className="bg-brand-black">Professional/Healthcare</option>
                              <option value="Corporate Sponsorship" className="bg-brand-black">Corporate Sponsorship</option>
                              <option value="Affiliate Partnership" className="bg-brand-black">Affiliate Partnership</option>
                              <option value="Community/NGO" className="bg-brand-black">Community/NGO</option>
                              <option value="Media Partnership" className="bg-brand-black">Media Partnership</option>
                            </select>
                            <div className="absolute right-0 bottom-4 pointer-events-none text-white/40">↓</div>
                          </div>
                        </div>
                      </div>

                      {/* Textarea */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                          How can we work together? <span className="text-brand-red">*</span>
                        </label>
                        <textarea 
                          required
                          value={formData.proposal}
                          onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
                          className="w-full bg-transparent border-b border-white/10 py-4 text-white focus:border-brand-gold focus:outline-none transition-colors h-32 resize-none" 
                          placeholder="Briefly outline your proposal..."
                        />
                      </div>

                      {/* Optional Document Upload Field */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                            Partnership Proposal / Deck <span className="text-white/20 italic font-light">(Optional)</span>
                          </label>
                          {file && (
                            <button 
                              type="button" 
                              onClick={handleRemoveFile} 
                              className="text-[10px] font-black uppercase tracking-widest text-brand-red hover:text-white transition-colors flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Remove File
                            </button>
                          )}
                        </div>

                        {/* Drop Zone */}
                        <div 
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          onClick={triggerFileSelect}
                          className={`border-2 border-dashed rounded-none p-8 text-center cursor-pointer transition-all duration-300 relative ${
                            dragActive 
                              ? 'border-brand-gold bg-brand-gold/5' 
                              : file 
                                ? 'border-brand-red/40 bg-brand-red/5' 
                                : 'border-white/10 hover:border-brand-gold/30 hover:bg-white/[0.02]'
                          }`}
                        >
                          <input 
                            ref={fileInputRef}
                            type="file" 
                            onChange={handleFileChange}
                            className="hidden" 
                            accept=".pdf,.doc,.docx,.ppt,.pptx"
                          />

                          {file ? (
                            <div className="space-y-2 pointer-events-none">
                              <FileText className="mx-auto text-brand-gold" size={32} />
                              <p className="text-sm font-black text-white">{file.name}</p>
                              <p className="text-xs text-white/40 italic font-light">{formatFileSize(file.size)}</p>
                            </div>
                          ) : (
                            <div className="space-y-2 pointer-events-none">
                              <Upload className="mx-auto text-white/30" size={32} />
                              <p className="text-sm font-light text-white/60">
                                Drag and drop your proposal deck here, or <span className="text-brand-gold font-bold underline">browse files</span>
                              </p>
                              <p className="text-[10px] text-white/30 uppercase tracking-widest font-light">
                                PDF, DOCX, or PPTX up to 10MB
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-brand-red text-white py-8 rounded-none text-xs font-black tracking-[0.5em] uppercase hover:bg-white hover:text-brand-black transition-all duration-500 shadow-2xl flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <span>Submitting...</span>
                        ) : (
                          <>
                            Submit Partnership Inquiry
                            <Send className="ml-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={16} />
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* Support Link CTA */}
        <section className="py-32 bg-white text-brand-black">
           <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
             <div className="text-center md:text-left">
               <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 italic">Individual Impact</h3>
               <p className="text-brand-black/60 italic font-light max-w-sm">Not an organization? You can still support our mission through direct contributions.</p>
             </div>
             <a href="/support" className="px-16 py-6 border border-brand-red text-brand-red font-black uppercase tracking-widest text-[10px] hover:bg-brand-red hover:text-white transition-all flex items-center">
               Support Our Mission <ArrowRight size={14} className="ml-4" />
             </a>
           </div>
        </section>
      </main>

      <Footer />
    </div>
    </>
  );
}
