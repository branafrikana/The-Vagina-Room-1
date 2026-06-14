import { motion } from 'motion/react';
import { 
  Instagram, 
  Linkedin, 
  Youtube, 
  MessageCircle, 
  Facebook,
  Send
} from 'lucide-react';
import XIcon from './XIcon';

import { useContent } from '../context/ContentContext';
import EditableText from './EditableText';

export default function SocialGrid() {
  const { content } = useContent();
  const branding = JSON.parse(content.brandingSettingsJson || '{}');

  const socials = [
    { icon: Linkedin, color: 'bg-[#0077b5]', name: 'LinkedIn', link: content.socialLinkLinkedin || '#' }, 
    { icon: Instagram, color: 'bg-[#E1306C]', name: 'Instagram', link: content.socialLinkInstagram || '#' },
    { icon: TikTokIcon, color: 'bg-[#000000]', name: 'TikTok', link: content.socialLinkTiktok || '#' },
    { icon: Facebook, color: 'bg-[#1877F2]', name: 'Facebook', link: content.socialLinkFacebook || '#' },
    { icon: Youtube, color: 'bg-[#FF0000]', name: 'YouTube', link: content.socialLinkYoutube || '#' },
    { icon: XIcon, color: 'bg-[#000000]', name: 'X', link: content.socialLinkX || '#' }
  ];

  const renderLogo = () => {
    if (branding.socialLogoType === 'image' && branding.socialLogoUrl) {
      return (
        <img 
          src={branding.socialLogoUrl} 
          alt="The Vagina Room" 
          style={{ height: `${branding.socialLogoHeight || 80}px` }}
          className="max-h-32 md:max-h-none w-auto mx-auto object-contain"
          referrerPolicy="no-referrer"
        />
      );
    }
    return (
      <div className="flex flex-col items-center">
        <div className="font-sans text-4xl md:text-6xl font-black tracking-tighter text-white uppercase group cursor-default">
          The <span className="text-brand-gold italic font-light lowercase inline-block">Vagina</span> Room
        </div>
      </div>
    );
  };

  return (
    <section className="bg-brand-black text-white pt-16 pb-32">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-8 inline-block"
        >
          {renderLogo()}
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-black text-2xl md:text-4xl tracking-[0.2em] mb-20 uppercase"
        >
          <EditableText field="socialSectionTitle" />
        </motion.h2>
        
        <div className="grid grid-cols-2 md:grid-cols-6 h-[200px] md:h-[300px]">
          {socials.map((social, index) => (
            <motion.a
              key={index}
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`${social.color} flex items-center justify-center cursor-pointer transition-all duration-500 relative group overflow-hidden border-r border-white/5 last:border-0`}
            >
              <div className="relative z-10 transition-transform duration-500 group-hover:scale-125">
                <social.icon size={56} className="text-white" />
              </div>
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all text-[10px] font-black tracking-widest uppercase">
                {social.name}
              </div>
            </motion.a>
          ))}
        </div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-white font-sans mt-16 text-xl font-bold tracking-widest uppercase"
        >
          <EditableText field="socialSubTitle" />
        </motion.p>
      </div>
    </section>
  );
}

function TikTokIcon({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
    </svg>
  );
}
