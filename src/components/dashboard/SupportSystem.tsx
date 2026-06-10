import React, { useState } from 'react';
import { 
  Send, 
  HelpCircle, 
  MessageSquare, 
  Check, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useContent } from '../../context/ContentContext';

interface FAQItem {
  q: string;
  a: string;
}

export default function SupportSystem() {
  const { content } = useContent();
  const [message, setMessage] = useState('');
  const [ticketSubject, setTicketSubject] = useState('technical');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const config = JSON.parse(content.generalSettingsJson || '{}');
  const whatsappNum = (config.whatsappPhone || '').replace(/\D/g, '');

  const faqs: FAQItem[] = [
    {
      q: 'How does the 15% Member Discount apply in the shop?',
      a: 'The 15% discount is active permanently for all active cardholding advocates. In your Member Shop, all showcased luxury formulations, organic steaming assemblies, and pelvic restoration oils are dynamically loaded with your member rate, saving 15% automatically compared to our public catalog.'
    },
    {
      q: 'How do I refer a new member and track commissions?',
      a: 'Under your "Refer & Earn" navigation, you will find your custom cryptographic advocate link. Copy this link and share it. When new members apply and activate using your key, our multi-level ledger automatically logs the referrer event. Commissions are updated live and paid out on the first of every month.'
    },
    {
      q: 'What is the Device Authorization Key restriction?',
      a: 'To guarantee total data solitude for our members, each laboratory account is restricted and authorized to a single physical terminal (phone or browser index). If you need to access your details from another terminal, visit Settings and click "Deauthorize Current Terminal" before log-in on your new desktop.'
    },
    {
      q: 'How do I join live stream circles?',
      a: 'For any RSVP-confirmed gathering listed under "Curated Events", an invite link to the encrypted virtual community room will dynamically appear on the event dashboard 1 hour before commencement.'
    }
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSuccess(true);
      setMessage('');
      setTimeout(() => setSuccess(false), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Ticket Form */}
        <div className="bg-white/[0.01] border border-white/10 p-6 sm:p-8 rounded space-y-6">
          <div>
            <span className="text-[8px] font-mono tracking-widest text-brand-gold uppercase block">Verified Ticket Portal</span>
            <h3 className="text-sm font-black uppercase text-white mt-1">Submit Help Desk Query</h3>
            <p className="text-[10px] text-white/40 mt-1 font-sans">Our specialized lab hosts typically reply within 2 hours.</p>
          </div>

          <form onSubmit={handleTicketSubmit} className="space-y-4">
            <div>
              <label className="text-[8px] font-mono text-white/50 uppercase tracking-widest block mb-1.5">Query category</label>
              <select
                value={ticketSubject}
                onChange={e => setTicketSubject(e.target.value)}
                className="w-full bg-brand-black border border-white/10 p-3 text-xs text-white uppercase tracking-wider font-mono outline-none rounded"
              >
                <option value="technical">Technical / Devices</option>
                <option value="billing">Billing / Membership Fee</option>
                <option value="referrals">Referral Program & Commissions</option>
                <option value="clinical">Clinical Consultation Protocol</option>
              </select>
            </div>

            <div>
              <label className="text-[8px] font-mono text-white/50 uppercase tracking-widest block mb-1.5">How can we assist you?</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full bg-brand-black border border-white/10 p-3.5 text-white text-xs h-32 outline-none rounded focus:border-brand-gold/40 transition-colors"
                placeholder="Describe your issue detailed..."
              />
            </div>

            <button 
              type="submit" 
              disabled={sending}
              className="w-full bg-brand-gold text-brand-black py-3 font-black uppercase text-[10px] tracking-widest hover:bg-white disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {sending ? 'COMMUNICATING LEDGER...' : (
                <>
                  <Send size={11} /> Dispatch Secure Ticket
                </>
              )}
            </button>

            {success && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="p-3 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold font-mono text-[9px] uppercase tracking-wider font-bold flex items-center gap-2"
              >
                <Check size={11} className="stroke-[3]" /> Ticket successfully queued. Reference token sent to user email.
              </motion.div>
            )}
          </form>
        </div>

        {/* Live Support Links & FAQ */}
        <div className="space-y-6">
          
          {/* Quick WhatsApp Support */}
          {whatsappNum && (
            <div className="p-6 bg-gradient-to-r from-zinc-950 to-neutral-900 border border-brand-gold/20 hover:border-brand-gold/40 transition-all rounded space-y-3">
              <span className="text-brand-gold font-mono text-[8px] uppercase tracking-widest flex items-center gap-1.5 font-bold">
                <Sparkles size={11} className="animate-spin-slow" /> ACTIVE TELEPHONY INSTANT ACCESS
              </span>
              <h4 className="text-sm font-black uppercase font-sans tracking-tight text-white">
                Connect live with laboratory host via WhatsApp
              </h4>
              <p className="text-[10px] text-white/50 font-sans leading-relaxed">
                Connect instantly with our human health clinicians for instant checkout support, shipping tracking, or urgent somatic questions.
              </p>
              
              <a
                href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent("Hello Room Advisor, I have a support query from my advocate portal.")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded text-[10px] font-black uppercase tracking-wider transition-colors font-sans mt-2"
              >
                <PhoneCall size={12} /> Launch Instant WhatsApp Chat
              </a>
            </div>
          )}

          {/* Quick FAQ Expandables block */}
          <div className="bg-white/[0.01] border border-white/10 p-6 rounded space-y-4 text-left">
            <h4 className="text-xs font-black uppercase tracking-wide text-white border-b border-white/5 pb-2">
              Frequently Asked Questions
            </h4>

            <div className="space-y-2.5">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      type="button"
                      className="w-full text-left font-sans text-[11px] font-black uppercase tracking-tight text-white hover:text-brand-gold flex items-center justify-between gap-2 py-1.5 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp size={12} className="text-brand-gold" /> : <ChevronDown size={12} className="text-white/40" />}
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-[10px] text-white/50 leading-relaxed font-light font-sans pt-1">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
