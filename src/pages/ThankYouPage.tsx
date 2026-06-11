import { motion } from 'motion/react';
import SEO from '../components/SEO';
import { CheckCircle2, ArrowRight, MessageCircle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import React, { useEffect } from 'react';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';

export default function ThankYouPage() {
  const { content } = useContent();
  const { userData } = useAuth();

  // Access Control Guard
  useEffect(() => {
    // Admins can always view this page
    if (userData?.role === "admin" || userData?.isAdmin === true) {
      return;
    }
  }, [userData]);
  
  const bgUrl = content.contactBgUrl || "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=1600";
  const headingText = content.contactThankYouHeading || "THANK YOU FOR REACHING OUT";
  const bodyText = content.contactThankYouMessage || "Your message has been logged securely, and our team will get in touch shortly.";
  const ctaBtnText = content.contactThankYouCtaText || "Join Our Free Telegram Community";
  const telegramLandingUrl = content.contactThankYouTelegramLandingUrl || "/telegram";
  const isInternal = telegramLandingUrl.startsWith("/");

  return (
    <>
      <SEO 
        title="Thank You" 
        description="Thank you for contacting The Vagina Room. Join our community for continued support."
      />
      <div className="bg-brand-black text-white min-h-screen flex flex-col justify-between">
        <Navigation />
        
        <main className="flex-grow pt-32 pb-24 relative overflow-hidden flex items-center justify-center">
          {/* Blurred background scene */}
          <div 
            className="fixed inset-0 z-[-1] opacity-20 filter blur-3xl pointer-events-none"
            style={{ 
              backgroundImage: `url(${bgUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(180,31,45,0.08)_0%,transparent_60%)] pointer-events-none" />

          <div className="w-full max-w-4xl mx-auto px-6 text-center z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white/5 border border-white/10 p-12 sm:p-20 relative backdrop-blur-md"
            >
              {/* Outer decorative line accent */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
              
              <div className="mb-8 relative inline-block">
                <motion.div 
                  initial={{ rotate: -15, scale: 0.8, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 100 }}
                  className="w-20 h-20 bg-brand-gold/10 border border-brand-gold/30 rounded-full flex items-center justify-center mx-auto text-brand-gold mb-2"
                >
                  <CheckCircle2 size={42} className="stroke-[1.5]" />
                </motion.div>
                <div className="absolute -inset-1 rounded-full border border-brand-gold/20 animate-ping opacity-25 pointer-events-none" />
              </div>

              <span className="text-[10px] font-black tracking-[0.5em] text-brand-gold uppercase block mb-4">
                SUBMISSION RECEIVED
              </span>

              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-black mb-8 tracking-tighter uppercase leading-tight max-w-2xl mx-auto">
                {headingText}
              </h1>

              <div className="w-16 h-[1px] bg-white/20 mx-auto mb-8" />

              <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto leading-relaxed mb-12 font-light">
                {bodyText}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                {isInternal ? (
                  <Link to={telegramLandingUrl} className="w-full sm:w-auto">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto bg-brand-gold text-brand-black px-10 py-5 rounded-none text-xs font-black tracking-[0.3em] uppercase hover:bg-brand-red hover:text-white transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-black"
                    >
                      <MessageCircle size={16} className="mr-3" />
                      {ctaBtnText}
                      <ArrowRight size={14} className="ml-3" />
                    </motion.div>
                  </Link>
                ) : (
                  <motion.a
                    href={telegramLandingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto bg-brand-gold text-brand-black px-10 py-5 rounded-none text-xs font-black tracking-[0.3em] uppercase hover:bg-brand-red hover:text-white transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-black"
                  >
                    <MessageCircle size={16} className="mr-3" />
                    {ctaBtnText}
                    <ArrowRight size={14} className="ml-3" />
                  </motion.a>
                )}

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto"
                >
                  <Link
                    to="/"
                    className="w-full sm:w-auto border border-white/25 bg-white/5 hover:bg-white hover:text-brand-black px-10 py-5 rounded-none text-xs font-black tracking-[0.3em] uppercase transition-all duration-300 flex items-center justify-center"
                  >
                    <Home size={14} className="mr-3" />
                    Back to Safety
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
