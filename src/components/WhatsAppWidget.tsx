import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X } from 'lucide-react';
import { useContent } from '../context/ContentContext';

// Custom SVG path representation for the exact WhatsApp bubble logo
const WhatsAppIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg 
    viewBox="0 0 448 512" 
    className={`${className} fill-current`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.3 5.7 23.7 9.1 31.9 11.7 13.9 4.4 26.5 3.8 36.6 2.3 11.2-1.7 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
  </svg>
);

export default function WhatsAppWidget() {
  const { content, loading } = useContent();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  if (loading) return null;

  // Sane default handling
  let config: any = {};
  try {
    config = JSON.parse(content.generalSettingsJson || '{}');
  } catch (e) {
    config = {};
  }

  // Parse branding settings
  let branding: any = {};
  try {
    branding = JSON.parse(content.brandingSettingsJson || '{}');
  } catch (e) {
    branding = {};
  }

  // Check if enabled (defaulting to true)
  const isEnabled = config.whatsappWidgetEnabled !== false;
  if (!isEnabled) return null;

  const phone = config.whatsappPhone || "+234 813 546 4432";
  const position = config.whatsappWidgetPosition || "RIGHT";
  const greeting = config.whatsappWidgetGreeting || "Hi! Welcome to The Vagina Room. How can we guide your wellness journey today?";
  const placeholder = config.whatsappWidgetPlaceholder || "Ask about private clinical consultation, events, community, or products...";
  const iconStyle = config.whatsappWidgetIconStyle || "MESSAGE"; // MESSAGE or WHATSAPP

  // Determine avatar icon image (uploaded logo -> site header logo -> fallback brand icon)
  const logoUrl = config.whatsappWidgetLogo || branding.headerLogoUrl || "/icon-512.png";

  // Format phone number for WhatsApp URL (only digits, strip anything except numbers)
  const cleanPhone = phone.replace(/[^\d]/g, '');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    const encodedMsg = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
    
    // Open in a new tab safely
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    
    setMessage('');
    setIsOpen(false);
  };

  const widgetLeft = position === "LEFT";

  return (
    <div 
      id="whatsapp-floating-widget"
      className={`fixed ${widgetLeft ? 'left-6 md:left-8' : 'right-6 md:right-8'} bottom-6 md:bottom-8 z-50 font-sans`}
      style={{ isolation: 'isolate' }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="whatsapp-chat-popup"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`absolute bottom-16 ${widgetLeft ? 'left-0' : 'right-0'} w-80 sm:w-96 bg-brand-black border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-none z-[99]`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-black to-neutral-900 border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-brand-black rounded-full z-10 animate-pulse"></span>
                  <div className="w-10 h-10 bg-brand-gold/10 flex items-center justify-center border border-brand-gold/30 rounded-full overflow-hidden">
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt="The Vagina Room Logo" 
                        className="w-full h-full object-contain p-0.5 scale-105"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-brand-gold font-bold text-xs uppercase tracking-tight">TVR</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-brand-gold">The Vagina Room</h4>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold">Typically replies instantly</p>
                </div>
              </div>
              <button 
                id="close-whatsapp-widget"
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white transition-colors cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-4 space-y-4 max-h-[220px] overflow-y-auto bg-brand-black/95">
              {/* Admin message bubble */}
              <div className="flex items-start space-x-2">
                <div className="bg-white/5 border border-white/10 p-3 max-w-[95%]">
                  {/* Highly readable text colored off-white to make sure it's 100% visible on dark theme backgrounds */}
                  <p className="text-xs leading-relaxed font-sans font-medium animate-fade-in" style={{ color: '#f5f5f5' }}>{greeting}</p>
                  <span className="text-[9px] text-brand-gold/70 uppercase tracking-widest font-black block mt-2">Liaison Coordinator</span>
                </div>
              </div>
            </div>

            {/* Input Action Box */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-neutral-950 flex gap-2">
              <input
                id="whatsapp-chat-textbox"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={placeholder}
                className="flex-grow bg-brand-black border border-white/5 p-2.5 text-xs text-white focus:border-brand-gold focus:outline-none transition-all placeholder:text-white/25"
                autoFocus
              />
              <button
                id="whatsapp-chat-send"
                type="submit"
                disabled={!message.trim()}
                className="p-2.5 bg-brand-gold text-brand-black hover:bg-white disabled:opacity-20 disabled:hover:bg-brand-gold transition-all cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Button */}
      <motion.button
        id="whatsapp-floating-launcher"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-14 h-14 flex items-center justify-center transition-all relative cursor-pointer ${
          iconStyle === "WHATSAPP" 
            ? "bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-[0_10px_30px_rgba(37,211,102,0.4)] border border-emerald-400/30" 
            : "bg-gradient-to-br from-brand-gold to-[#B38B13] text-brand-black shadow-[0_10px_30px_rgba(212,175,55,0.3)] border border-brand-gold/40"
        }`}
        aria-label="Chat with admin on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-10">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500"></span>
        </span>
        {iconStyle === "WHATSAPP" ? (
          <div className="flex items-center justify-center w-full h-full p-3.5">
            <WhatsAppIcon className="w-full h-full text-white" />
          </div>
        ) : (
          <MessageSquare size={24} className="fill-brand-black" />
        )}
      </motion.button>
    </div>
  );
}
