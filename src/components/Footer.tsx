import { motion } from 'motion/react';
import { ArrowUp, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useContent } from '../context/ContentContext';
import EditableText from './EditableText';

export default function Footer() {
  const { content } = useContent();

  const branding = JSON.parse(content.brandingSettingsJson || '{}');

  return (
    <footer className="py-24 bg-brand-black border-t border-white/5 text-white relative">
      <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-8"
        >
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <h2 className="font-sans text-4xl font-black mb-8 tracking-tighter text-white uppercase leading-none">
              {branding.footerLogo1Type === 'image' && branding.footerLogo1Url ? (
                <img 
                  src={branding.footerLogo1Url} 
                  alt="The Vagina Room" 
                  style={{ height: `${branding.footerLogo1Height || 64}px` }}
                  className="max-h-24 md:max-h-none w-auto object-contain mb-8"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <>THE <span className="text-brand-gold italic font-light lowercase">VAGINA</span> ROOM</>
              )}
            </h2>

            <p className="text-xl text-brand-gold italic font-light leading-relaxed mb-12">
               {content.footerSlogan || "Where Women Heal, Learn & Thrive..."}
            </p>
            
            <div className="pt-8 border-t border-white/5 space-y-6">
              <h4 className="font-black mb-4 uppercase text-[10px] tracking-[0.5em] text-brand-red">Contact</h4>
              
              <div className="flex items-start space-x-4 group">
                <MapPin size={18} className="text-brand-gold mt-1 shrink-0" />
                <EditableText field="contactAddress" multiline className="text-white/60 text-sm font-light italic leading-relaxed block overflow-hidden">
                  {content.contactAddress || "84 Okpanam Rd, opp. Legislative Quarters, GRA Phase I, Asaba, Delta State, Nigeria."}
                </EditableText>
              </div>

              <div className="flex items-center space-x-4 group">
                <Mail size={18} className="text-brand-gold shrink-0" />
                <EditableText field="contactEmail" className="text-white/60 text-sm font-light italic hover:text-brand-gold transition-colors block">
                  {content.contactEmail || "info@thevaginaroom.com"}
                </EditableText>
              </div>

              <div className="flex items-center space-x-4 group">
                <Phone size={18} className="text-brand-gold shrink-0" />
                <EditableText field="contactPhone" className="text-white/60 text-sm font-light italic hover:text-brand-gold transition-colors block">
                  {content.contactPhone || "+234 802 729 4320"}
                </EditableText>
              </div>
            </div>
          </div>
          
          {/* Support Column */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-10 h-full flex flex-col justify-between">
              <div>
                <h4 className="font-black mb-6 uppercase text-[10px] tracking-[0.5em] text-brand-red decoration-brand-gold">
                  <EditableText field="footerSupportTitle" className="block">Support Our Mission</EditableText>
                </h4>
                <div className="text-white/60 text-sm mb-10 leading-relaxed italic font-light block">
                  <EditableText field="footerSupportDesc" multiline>
                    Help us reach more women with trusted education, emotional care, and holistic wellness guidance.
                  </EditableText>
                </div>
              </div>
              <Link 
                to="/support"
                className="w-full bg-brand-red text-white py-5 rounded-none text-[10px] font-black tracking-[0.5em] uppercase hover:bg-white hover:text-brand-black transition-all duration-500 flex items-center justify-center group"
              >
                <EditableText field="footerSupportBtnText">👉 SUPPORT NOW</EditableText>
              </Link>
            </div>
          </div>

          {/* Partner Column */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-10 h-full flex flex-col justify-between">
              <div>
                <h4 className="font-black mb-6 uppercase text-[10px] tracking-[0.5em] text-brand-red">
                  <EditableText field="footerPartnerTitle" className="block">Partner With Us</EditableText>
                </h4>
                <div className="text-white/60 text-sm mb-10 leading-relaxed italic font-light block">
                  <EditableText field="footerPartnerDesc" multiline>
                    Collaborate with us to expand our impact, build safer communities, and champion women's health.
                  </EditableText>
                </div>
              </div>
              <Link 
                to="/partner"
                className="w-full border border-brand-gold text-brand-gold py-5 rounded-none text-[10px] font-black tracking-[0.5em] uppercase hover:bg-brand-gold hover:text-brand-black transition-all duration-500 flex items-center justify-center group"
              >
                <EditableText field="footerPartnerBtnText">👉 PARTNER NOW</EditableText>
              </Link>
            </div>
          </div>

          {/* Quick Links Row */}
          <div className="lg:col-span-12 pt-16 border-t border-white/5">
            <h4 className="font-black mb-10 uppercase text-[10px] tracking-[0.5em] text-brand-red text-center">Quick Links</h4>
            
            {(() => {
              const rawLinks = (JSON.parse(content.footerMenuJson || '[]') as { name: string; href: string }[]);
              
              let disabledPageSet: Record<string, boolean> = {};
              if (content?.disabledPagesJson) {
                try {
                  disabledPageSet = JSON.parse(content.disabledPagesJson);
                } catch (e) {}
              }

              const links = rawLinks.filter(link => {
                const href = link.href;
                if (!href || href === "#") return true;
                return !disabledPageSet[href];
              });

              const midpoint = Math.ceil(links.length / 2);
              const firstHalf = links.slice(0, midpoint);
              const secondHalf = links.slice(midpoint);

              function formatHref(url: string) {
                if (!url) return "/";
                if (url.startsWith("/") || url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("tel:")) {
                  return url;
                }
                if (!/^https?:\/\//i.test(url) && !url.startsWith("//")) {
                  return `https://${url}`;
                }
                return url;
              }

              return (
                <div className="flex flex-col gap-6">
                  <ul className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest text-white/60">
                    {firstHalf.map((link, i) => {
                      const formatted = formatHref(link.href);
                      const isExt = formatted.startsWith("http") || formatted.startsWith("//");
                      return (
                        <li key={i}>
                          {isExt ? (
                            <a href={formatted} target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors italic">
                              {link.name}
                            </a>
                          ) : (
                            <Link to={formatted} className="hover:text-brand-gold transition-colors italic">
                              {link.name}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  <ul className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest text-white/60">
                    {secondHalf.map((link, i) => {
                      const formatted = formatHref(link.href);
                      const isExt = formatted.startsWith("http") || formatted.startsWith("//");
                      return (
                        <li key={i}>
                          {isExt ? (
                            <a href={formatted} target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors italic">
                              {link.name}
                            </a>
                          ) : (
                            <Link to={formatted} className="hover:text-brand-gold transition-colors italic">
                              {link.name}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })()}
          </div>
        </motion.div>

        {/* Core Values / Disclaimer Area */}
        <div className="pt-8 border-t border-white/5 space-y-12">
          <div className="flex flex-col items-center text-center">
            <h4 className="font-black mb-6 uppercase text-[10px] tracking-[0.5em] text-brand-red">
              <EditableText field="footerCoreValuesTitle" />
            </h4>
            <p className="text-[11px] md:text-sm font-black tracking-[0.3em] uppercase text-white/40 flex flex-wrap justify-center gap-x-6 gap-y-4">
              <EditableText field="footerCoreValuesList" />
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] leading-relaxed text-center text-white/20 uppercase tracking-[0.2em] font-medium">
              <span className="text-white/40 block mb-2 font-black tracking-[0.5em]">
                <EditableText field="footerDisclaimerTitle" />
              </span>
              <EditableText field="footerDisclaimerDesc" multiline />
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] font-black tracking-[0.5em] uppercase text-white/40 text-center md:text-left gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {branding.footerLogo2Type === 'image' && branding.footerLogo2Url && (
              <img 
                src={branding.footerLogo2Url} 
                alt="Emblem" 
                style={{ height: `${branding.footerLogo2Height || 32}px` }}
                className="max-h-12 md:max-h-none w-auto object-contain opacity-50 hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
              />
            )}
            <p>{content.footerCopyright ? content.footerCopyright.replace("2026", new Date().getFullYear().toString()) : `© ${new Date().getFullYear()} THE VAGINA ROOM. ALL RIGHTS RESERVED.`}</p>
          </div>
          <div className="flex items-center space-x-12">
            <div className="flex space-x-8">
              <Link to="/privacy-policy" className="hover:text-brand-gold transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-brand-gold transition-colors">Terms of Engagement</Link>
            </div>
            
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center space-x-2 text-brand-gold hover:text-white transition-colors cursor-pointer group border border-brand-gold/20 px-4 py-2 hover:border-white transition-all"
            >
              <span>TOP</span>
              <ArrowUp size={12} className="group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
