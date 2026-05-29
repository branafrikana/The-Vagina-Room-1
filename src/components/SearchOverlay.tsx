import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ChevronRight, FileText, HelpCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { STATIC_FAQS } from './FAQ';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAGES = [
  { title: 'Home', path: '/', description: 'Welcome to The Vagina Room. Where Women Heal, Learn & Thrive' },
  { title: 'About Us', path: '/about', description: 'Our Mission, Vision & Core Values. A Sanctuary for Every Woman\'s Health Journey' },
  { title: 'Focus Areas', path: '/focus-areas', description: 'Vaginal & Reproductive Wellness, Sexual Wellness & Relationship Support, Holistic Healing & Empowerment' },
  { title: 'Meet Dr. FID', path: '/dr-fid', description: 'Holistic Wellness Expert, women’s wellness advocate and visionary entrepreneur' },
  { title: 'Events', path: '/events', description: 'Upcoming events, masterclasses, and workshops designed for women\'s wellness' },
  { title: 'Projects', path: '/projects', description: 'Discover our ongoing and upcoming projects dedicated to making a difference' },
  { title: 'Gallery', path: '/gallery', description: 'Explore photos and videos from our past events and community gatherings' },
  { title: 'Team', path: '/team', description: 'Meet the compassionate team behind The Room' },
  { title: 'Contact Us', path: '/contact', description: 'Get in touch for support and inquiries' },
  { title: 'Partner With Us', path: '/partner', description: 'Join hands to expand our reach and impact globally' },
  { title: 'Support Our Mission', path: '/support', description: 'Support us in expanding the reach of women\'s wellness resources' },
];

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { content } = useContent();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  let faqs = STATIC_FAQS;
  if (content.faqDataJson) {
    try {
      faqs = JSON.parse(content.faqDataJson);
    } catch (e) {
      faqs = STATIC_FAQS;
    }
  }

  const q = query.toLowerCase().trim();

  const matchedPages = q 
    ? PAGES.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    : [];
    
  const matchedFaqs = q
    ? faqs.filter((f: any) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q))
    : [];

  const hasResults = matchedPages.length > 0 || matchedFaqs.length > 0;

  const handleNavigate = (path: string, hash?: string) => {
    onClose();
    navigate(path);
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center pt-24 pb-6 px-4 bg-brand-black/95 backdrop-blur-xl"
        >
          {/* Close Background Area */}
          <div className="absolute inset-0 z-0" onClick={onClose} />

          {/* Search Content */}
          <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute -top-16 right-0 text-white/50 hover:text-white transition-colors p-2"
            >
              <X size={28} />
            </button>

            {/* Title */}
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-brand-gold font-black tracking-[0.3em] uppercase text-xs mb-8"
            >
              Search
            </motion.h2>

            {/* Input */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full relative"
            >
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gold" size={24} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search resources, FAQs, and pages..."
                className="w-full bg-white/5 border border-white/10 text-white text-xl md:text-3xl font-light py-6 pl-16 pr-8 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold rounded-none placeholder:text-white/20 transition-all"
              />
            </motion.div>

            {/* Results */}
            <div className="w-full mt-8 overflow-y-auto max-h-[60vh] scrollbar-hide pr-2">
              <AnimatePresence>
                {q && !hasResults && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <p className="text-white/40 text-lg font-light">No results found for "{query}"</p>
                  </motion.div>
                )}

                {matchedPages.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <h3 className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Pages & Resources</h3>
                    <div className="space-y-2">
                      {matchedPages.map((page, i) => (
                        <button
                          key={i}
                          onClick={() => handleNavigate(page.path)}
                          className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 text-left group"
                        >
                          <div className="flex items-center space-x-4">
                            <FileText className="text-white/20 group-hover:text-brand-gold transition-colors" size={20} />
                            <div>
                              <p className="text-white font-medium text-lg">{page.title}</p>
                              <p className="text-white/40 text-sm mt-1">{page.description}</p>
                            </div>
                          </div>
                          <ChevronRight className="text-white/20 group-hover:text-brand-gold transition-transform transform group-hover:translate-x-1" size={20} />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {matchedFaqs.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Frequently Asked Questions</h3>
                    <div className="space-y-2">
                      {matchedFaqs.map((faq: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => handleNavigate('/', 'faq-section')}
                          className="w-full flex items-start justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 text-left group"
                        >
                          <div className="flex items-start space-x-4">
                            <HelpCircle className="text-white/20 group-hover:text-brand-gold transition-colors mt-1 shrink-0" size={20} />
                            <div>
                              <p className="text-white font-medium text-lg leading-snug">{faq.question}</p>
                              <p className="text-white/40 text-sm mt-2 line-clamp-2 leading-relaxed">{faq.answer}</p>
                            </div>
                          </div>
                          <ChevronRight className="text-white/20 group-hover:text-brand-gold transition-transform transform group-hover:translate-x-1 shrink-0 mt-1" size={20} />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
