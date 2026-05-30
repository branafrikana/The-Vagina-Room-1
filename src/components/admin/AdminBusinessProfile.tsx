import React from 'react';
import { useContent } from '../../context/ContentContext';
import { 
  Building2, 
  Phone, 
  MapPin, 
  Globe,
  ShieldCheck,
  Save
} from 'lucide-react';

export default function AdminBusinessProfile() {
  const { content, updateContentField, saveContentChanges } = useContent();

  const parseJSON = (jsonString: string, fallback: any) => {
    try {
      return JSON.parse(jsonString || '{}');
    } catch {
      return fallback;
    }
  };

  const updateJSONField = (configKey: string, field: string, value: any) => {
    const current = parseJSON((content as any)[configKey], {});
    const updated = { ...current, [field]: value };
    updateContentField(configKey as any, JSON.stringify(updated, null, 2));
  };

  const generalConfig = parseJSON(content.generalSettingsJson, {});

  const Section = ({ title, icon: Icon, children }: any) => (
    <div className="bg-white/5 border border-white/10 p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-white/5 pb-4">
        <Icon className="w-5 h-5 text-brand-gold" />
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );

  const InputField = ({ label, value, onChange, placeholder, type = "text" }: any) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">{label}</label>
      <input 
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold outline-none text-xs transition-colors"
      />
    </div>
  );

  return (
    <div className="space-y-8 pb-32">
       <div className="flex justify-between items-center bg-white/[0.02] border border-white/10 p-6">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-brand-gold">Business Profile & Core Details</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Manage global identity and communication parameters.</p>
          </div>
          <button 
            onClick={saveContentChanges}
            className="px-8 py-3 bg-brand-gold text-brand-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
          >
            <Save size={14} /> Commit Changes
          </button>
       </div>

       <div className="grid grid-cols-1 gap-8">
          {/* Identity & Basic Info */}
          <Section title="Brand Identity" icon={Building2}>
            <InputField 
              label="Official Site Name" 
              value={generalConfig.siteName} 
              onChange={(val: string) => updateJSONField("generalSettingsJson", "siteName", val)}
            />
            <InputField 
              label="Meta / Browser Title" 
              value={generalConfig.metaTitle} 
              onChange={(val: string) => updateJSONField("generalSettingsJson", "metaTitle", val)}
            />
          </Section>

          {/* Communication Coordinates */}
          <Section title="Communication Coordinates" icon={Phone}>
            <InputField 
              label="Support Email" 
              value={generalConfig.supportEmail} 
              onChange={(val: string) => updateJSONField("generalSettingsJson", "supportEmail", val)}
              type="email"
            />
            <InputField 
              label="Support Phone" 
              value={generalConfig.supportPhone} 
              onChange={(val: string) => updateJSONField("generalSettingsJson", "supportPhone", val)}
            />
            <InputField 
              label="WhatsApp Business Number" 
              value={generalConfig.whatsappPhone} 
              onChange={(val: string) => updateJSONField("generalSettingsJson", "whatsappPhone", val)}
            />
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">WhatsApp Widget Position</label>
              <select
                value={generalConfig.whatsappWidgetPosition || "RIGHT"}
                onChange={(e) => updateJSONField("generalSettingsJson", "whatsappWidgetPosition", e.target.value)}
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold outline-none text-xs transition-colors"
              >
                <option value="RIGHT">Right-Hand Side</option>
                <option value="LEFT">Left-Hand Side</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">WhatsApp Launcher Icon Icon</label>
              <select
                value={generalConfig.whatsappWidgetIconStyle || "MESSAGE"}
                onChange={(e) => updateJSONField("generalSettingsJson", "whatsappWidgetIconStyle", e.target.value)}
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold outline-none text-xs transition-colors"
              >
                <option value="MESSAGE">Message Chat bubble</option>
                <option value="WHATSAPP">WhatsApp Logo</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">WhatsApp Widget Toggle</label>
              <select
                value={generalConfig.whatsappWidgetEnabled !== false ? "TRUE" : "FALSE"}
                onChange={(e) => updateJSONField("generalSettingsJson", "whatsappWidgetEnabled", e.target.value === "TRUE")}
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold outline-none text-xs transition-colors"
              >
                <option value="TRUE">Enabled / Active</option>
                <option value="FALSE">Disabled</option>
              </select>
            </div>
            <InputField 
              label="Physical Office Address" 
              value={content.contactAddress} 
              onChange={(val: string) => updateContentField("contactAddress", val)}
            />
          </Section>

          {/* Social Links */}
          <Section title="Global Social Ecosystem" icon={Globe}>
            <InputField 
              label="Instagram URL" 
              value={content.socialLinkInstagram} 
              onChange={(val: string) => updateContentField("socialLinkInstagram", val)}
              placeholder="https://instagram.com/..."
            />
            <InputField 
              label="LinkedIn URL" 
              value={content.socialLinkLinkedin} 
              onChange={(val: string) => updateContentField("socialLinkLinkedin", val)}
            />
            <InputField 
              label="TikTok URL" 
              value={content.socialLinkTiktok} 
              onChange={(val: string) => updateContentField("socialLinkTiktok", val)}
            />
            <InputField 
              label="YouTube Channel" 
              value={content.socialLinkYoutube} 
              onChange={(val: string) => updateContentField("socialLinkYoutube", val)}
            />
            <InputField 
              label="Facebook Page" 
              value={content.socialLinkFacebook} 
              onChange={(val: string) => updateContentField("socialLinkFacebook", val)}
            />
          </Section>
       </div>

       <div className="bg-brand-gold/10 border border-brand-gold/20 p-8 flex flex-col items-center text-center space-y-4">
          <ShieldCheck className="text-brand-gold w-12 h-12" />
          <div>
            <h4 className="text-lg font-black uppercase tracking-tight text-white font-serif">Security Verification</h4>
            <p className="text-xs text-white/60 max-w-lg mx-auto">
              Changes to core business details are broadcasted across the entire platform in real-time. Ensure all coordinates are accurate to maintain seamless customer communication.
            </p>
          </div>
          <button 
            onClick={saveContentChanges}
            className="px-12 py-4 bg-brand-gold text-brand-black text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-2xl"
          >
            Authenticate & Perspective Changes
          </button>
       </div>
    </div>
  );
}
