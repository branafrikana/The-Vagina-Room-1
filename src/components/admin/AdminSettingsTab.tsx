import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { ImageUploader } from '../../pages/AdminPage';
import { Eye, EyeOff } from 'lucide-react';

interface AdminSettingsTabProps {
  activeTab: "general" | "branding" | "seo" | "security";
}

export default function AdminSettingsTab({ activeTab }: AdminSettingsTabProps) {
  const { content, updateContentField } = useContent();
  const [showPassword, setShowPassword] = useState(false);

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

  if (activeTab === "general") {
    const config = parseJSON(content.generalSettingsJson, {});
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Site Name</label>
            <input 
              type="text" 
              value={config.siteName || ""}
              onChange={(e) => updateJSONField("generalSettingsJson", "siteName", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Support Email</label>
            <input 
              type="email" 
              value={config.supportEmail || ""}
              onChange={(e) => updateJSONField("generalSettingsJson", "supportEmail", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Support Phone</label>
            <input 
              type="text" 
              value={config.supportPhone || ""}
              onChange={(e) => updateJSONField("generalSettingsJson", "supportPhone", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">WhatsApp Phone</label>
            <input 
              type="text" 
              value={config.whatsappPhone || ""}
              onChange={(e) => updateJSONField("generalSettingsJson", "whatsappPhone", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">WhatsApp Method</label>
            <select
               value={config.whatsappMethod || "REDIRECT"}
               onChange={(e) => updateJSONField("generalSettingsJson", "whatsappMethod", e.target.value)}
               className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
            >
                <option value="REDIRECT">Redirect (wa.me)</option>
                <option value="API">Direct API (Requires Setup)</option>
            </select>
          </div>
          {config.whatsappMethod === "API" && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">WhatsApp API Key</label>
                <input 
                  type="password"
                  value={config.whatsappApiKey || ""}
                  onChange={(e) => updateJSONField("generalSettingsJson", "whatsappApiKey", e.target.value)}
                  className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">WhatsApp Business ID</label>
                <input 
                  type="text"
                  value={config.whatsappBusinessId || ""}
                  onChange={(e) => updateJSONField("generalSettingsJson", "whatsappBusinessId", e.target.value)}
                  className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Timezone</label>
            <select 
              value={config.timezone || "UTC+1 (Lagos)"}
              onChange={(e) => updateJSONField("generalSettingsJson", "timezone", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
            >
              <option value="UTC+1 (Lagos)">UTC+1 (Lagos)</option>
              <option value="GMT">GMT</option>
              <option value="EST">EST</option>
              <option value="PST">PST</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Meta Title (Browser Tab)</label>
          <input 
            type="text" 
            value={config.metaTitle || ""}
            onChange={(e) => updateJSONField("generalSettingsJson", "metaTitle", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Admin Email</label>
          <input 
            type="email" 
            value={content.adminEmail || "admin@thevaginaroom.com"}
            onChange={(e) => updateContentField("adminEmail", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Admin Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              value={content.adminPassword || "admin123"}
              onChange={(e) => updateContentField("adminPassword", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs pr-10" 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold mb-4">SMTP Configuration</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">SMTP Host</label>
              <input type="text" value={parseJSON(content.smtpSettingsJson, {}).host || ""} onChange={(e) => updateJSONField("smtpSettingsJson", "host", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">SMTP Port</label>
              <input type="text" value={parseJSON(content.smtpSettingsJson, {}).port || ""} onChange={(e) => updateJSONField("smtpSettingsJson", "port", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">SMTP User</label>
              <input type="text" value={parseJSON(content.smtpSettingsJson, {}).user || ""} onChange={(e) => updateJSONField("smtpSettingsJson", "user", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">SMTP Pass</label>
              <input type="password" value={parseJSON(content.smtpSettingsJson, {}).pass || ""} onChange={(e) => updateJSONField("smtpSettingsJson", "pass", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">SMTP From Address</label>
              <input type="email" value={parseJSON(content.smtpSettingsJson, {}).from || ""} onChange={(e) => updateJSONField("smtpSettingsJson", "from", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold">PWA Settings (manifest.json)</p>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Prompt Popup</span>
              <button 
                onClick={() => updateJSONField("pwaSettingsJson", "showPopup", !parseJSON(content.pwaSettingsJson, {}).showPopup)}
                className={`w-10 h-5 relative rounded-full transition-colors ${parseJSON(content.pwaSettingsJson, {}).showPopup ? 'bg-emerald-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${parseJSON(content.pwaSettingsJson, {}).showPopup ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">App Name</label>
              <input type="text" value={parseJSON(content.pwaSettingsJson, {}).name || ""} onChange={(e) => updateJSONField("pwaSettingsJson", "name", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Short Name</label>
              <input type="text" value={parseJSON(content.pwaSettingsJson, {}).short_name || ""} onChange={(e) => updateJSONField("pwaSettingsJson", "short_name", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Description</label>
              <textarea value={parseJSON(content.pwaSettingsJson, {}).description || ""} onChange={(e) => updateJSONField("pwaSettingsJson", "description", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs h-20" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Theme Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={parseJSON(content.pwaSettingsJson, {}).theme_color || "#C41E3A"} 
                  onChange={(e) => updateJSONField("pwaSettingsJson", "theme_color", e.target.value)} 
                  className="w-10 h-10 bg-transparent border-none cursor-pointer flex-shrink-0" 
                />
                <input 
                  type="text" 
                  value={parseJSON(content.pwaSettingsJson, {}).theme_color || ""} 
                  onChange={(e) => updateJSONField("pwaSettingsJson", "theme_color", e.target.value)} 
                  className="flex-grow bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs uppercase font-mono" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Background Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={parseJSON(content.pwaSettingsJson, {}).background_color || "#0a0a0a"} 
                  onChange={(e) => updateJSONField("pwaSettingsJson", "background_color", e.target.value)} 
                  className="w-10 h-10 bg-transparent border-none cursor-pointer flex-shrink-0" 
                />
                <input 
                  type="text" 
                  value={parseJSON(content.pwaSettingsJson, {}).background_color || ""} 
                  onChange={(e) => updateJSONField("pwaSettingsJson", "background_color", e.target.value)} 
                  className="flex-grow bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs uppercase font-mono" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Display Mode</label>
              <select value={parseJSON(content.pwaSettingsJson, {}).display || "standalone"} onChange={(e) => updateJSONField("pwaSettingsJson", "display", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs">
                 <option value="fullscreen">Fullscreen</option>
                 <option value="standalone">Standalone</option>
                 <option value="minimal-ui">Minimal UI</option>
                 <option value="browser">Browser</option>
              </select>
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block column">PWA Icon Image</label>
              <ImageUploader 
                fieldKey="pwaSettingsJson"
                label="Upload Icon Image (Ideally square, e.g. 512x512 PNG)"
                onUploadSuccess={(url) => updateJSONField("pwaSettingsJson", "iconUrl", url)}
                currentValue={parseJSON(content.pwaSettingsJson, {}).iconUrl || ""}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "branding") {
    const config = parseJSON(content.brandingSettingsJson, {});
    
    const ColorControl = ({ label, modeKey, colorKey, gradStartKey, gradEndKey, gradAngleKey, defaultColor, defaultStart, defaultEnd }: any) => (
      <div className="space-y-4 p-4 bg-white/5 border border-white/5 rounded-sm">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold">{label}</p>
          <div className="flex gap-2 p-1 bg-black/40 rounded">
            {['flat', 'gradient'].map((m) => (
              <button
                key={m}
                onClick={() => updateJSONField("brandingSettingsJson", modeKey, m)}
                className={`px-3 py-1 text-[9px] uppercase font-bold transition-all ${
                  (config[modeKey] || 'flat') === m 
                    ? "bg-brand-gold text-brand-black" 
                    : "text-white/40 hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {(config[modeKey] || 'flat') === 'flat' ? (
          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-wider text-white/30 block">Flat Color</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={config[colorKey] || defaultColor}
                onChange={(e) => updateJSONField("brandingSettingsJson", colorKey, e.target.value)}
                className="w-10 h-10 bg-transparent border-none cursor-pointer" 
              />
              <input 
                type="text" 
                value={config[colorKey] || defaultColor}
                onChange={(e) => updateJSONField("brandingSettingsJson", colorKey, e.target.value)}
                className="flex-grow bg-brand-black border border-white/10 p-2 text-white focus:border-brand-gold focus:outline-none text-[10px] uppercase font-mono" 
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/30 block">Start</label>
                <div className="flex gap-1">
                  <input 
                    type="color" 
                    value={config[gradStartKey] || defaultStart}
                    onChange={(e) => updateJSONField("brandingSettingsJson", gradStartKey, e.target.value)}
                    className="w-8 h-8 bg-transparent border-none cursor-pointer" 
                  />
                  <input 
                    type="text" 
                    value={config[gradStartKey] || defaultStart}
                    onChange={(e) => updateJSONField("brandingSettingsJson", gradStartKey, e.target.value)}
                    className="flex-grow bg-brand-black border border-white/10 p-1 text-white focus:border-brand-gold focus:outline-none text-[9px] uppercase font-mono" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/30 block">End</label>
                <div className="flex gap-1">
                  <input 
                    type="color" 
                    value={config[gradEndKey] || defaultEnd}
                    onChange={(e) => updateJSONField("brandingSettingsJson", gradEndKey, e.target.value)}
                    className="w-8 h-8 bg-transparent border-none cursor-pointer" 
                  />
                  <input 
                    type="text" 
                    value={config[gradEndKey] || defaultEnd}
                    onChange={(e) => updateJSONField("brandingSettingsJson", gradEndKey, e.target.value)}
                    className="flex-grow bg-brand-black border border-white/10 p-1 text-white focus:border-brand-gold focus:outline-none text-[9px] uppercase font-mono" 
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-white/30 block">Angle: {config[gradAngleKey] || 135}°</label>
              <input 
                type="range" min="0" max="360"
                value={config[gradAngleKey] || 135}
                onChange={(e) => updateJSONField("brandingSettingsJson", gradAngleKey, parseInt(e.target.value))}
                className="w-full accent-brand-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-white/5">
              <div className="text-[8px] text-white/20 uppercase">Preview</div>
              <div className="h-4 flex-grow rounded-[2px]" style={{ background: `linear-gradient(${config[gradAngleKey] || 135}deg, ${config[gradStartKey] || defaultStart}, ${config[gradEndKey] || defaultEnd})` }} />
            </div>
          </div>
        )}
      </div>
    );

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ColorControl 
            label="Primary Identity (Red)" 
            modeKey="primaryMode"
            colorKey="primaryColor"
            gradStartKey="primaryGradStart"
            gradEndKey="primaryGradEnd"
            gradAngleKey="primaryGradAngle"
            defaultColor="#C41E3A"
            defaultStart="#C41E3A"
            defaultEnd="#8B0000"
          />
          <ColorControl 
            label="Secondary Accent (Gold)" 
            modeKey="secondaryMode"
            colorKey="secondaryColor"
            gradStartKey="secondaryGradStart"
            gradEndKey="secondaryGradEnd"
            gradAngleKey="secondaryGradAngle"
            defaultColor="#D4AF37"
            defaultStart="#D4AF37"
            defaultEnd="#B8860B"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Main Font Family</label>
            <select 
              value={config.fontFamily || "Inter"}
              onChange={(e) => updateJSONField("brandingSettingsJson", "fontFamily", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
            >
              <option value="Inter">Inter (Clean Sans)</option>
              <option value="Space Grotesk">Space Grotesk (Modern)</option>
              <option value="Playfair Display">Playfair Display (Serif)</option>
              <option value="JetBrains Mono">JetBrains Mono (Technical)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Interface Roundness</label>
            <select 
              value={config.buttonRoundness || "md"}
              onChange={(e) => updateJSONField("brandingSettingsJson", "buttonRoundness", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
            >
              <option value="none">Square (Sharp)</option>
              <option value="sm">Small Radius</option>
              <option value="md">Medium (Modern)</option>
              <option value="lg">Large Round</option>
              <option value="full">Circle (Pill)</option>
            </select>
          </div>
        </div>

        <div className="bg-white/5 p-4 border border-white/5 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold">Global Typography Scaling</p>
            <span className="text-white/60 font-mono text-[10px]">{config.baseFontSize || 16}px</span>
          </div>
          <div className="space-y-2 pt-2">
            <label className="text-[9px] font-bold uppercase tracking-wider text-white/30 block">Default Base Size (Site-wide)</label>
            <input 
              type="range" min="12" max="24" step="1"
              value={config.baseFontSize || 16}
              onChange={(e) => updateJSONField("brandingSettingsJson", "baseFontSize", parseInt(e.target.value))}
              className="w-full accent-brand-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[8px] text-white/20 uppercase">
              <span>Compact (12px)</span>
              <span>Large (24px)</span>
            </div>
            <p className="text-[9px] text-brand-gold/50 italic leading-relaxed pt-2">
              Note: This sets the root font size. You can still adjust individual text blocks using the interactive editor.
            </p>
          </div>
        </div>
        <div className="space-y-4">
           <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold border-b border-white/5 pb-2">Logo Management</p>
           
           <div className="space-y-8">
             {/* Header Logo */}
             <div className="bg-white/5 p-4 border border-white/5 space-y-4">
               <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Header Logo</p>
                 <div className="flex gap-2 p-1 bg-black/40 rounded">
                   {['text', 'image'].map((m) => (
                     <button
                       key={m}
                       onClick={() => updateJSONField("brandingSettingsJson", "headerLogoType", m)}
                       className={`px-3 py-1 text-[9px] uppercase font-bold transition-all ${
                         (config.headerLogoType || 'text') === m 
                           ? "bg-brand-gold text-brand-black" 
                           : "text-white/40 hover:text-white"
                       }`}
                     >
                       {m}
                     </button>
                   ))}
                 </div>
               </div>
               
               {(config.headerLogoType || 'text') === 'image' && (
                 <ImageUploader 
                   fieldKey="headerLogoUrl" 
                   label="Header Navigation Logo (Top Left)" 
                    currentValue={config.headerLogoUrl} 
                   onUploadSuccess={(url: string) => updateJSONField("brandingSettingsJson", "headerLogoUrl", url)}
                 />
               )}
               {/* Note: I'll need to update ImageUploader to support custom callbacks or just use the fieldKey directly if it matches the content state field */}
             </div>

             {/* Footer Logo 1 */}
             <div className="bg-white/5 p-4 border border-white/5 space-y-4">
               <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Footer Logo 1 (Main)</p>
                 <div className="flex gap-2 p-1 bg-black/40 rounded">
                   {['text', 'image'].map((m) => (
                     <button
                       key={m}
                       onClick={() => updateJSONField("brandingSettingsJson", "footerLogo1Type", m)}
                       className={`px-3 py-1 text-[9px] uppercase font-bold transition-all ${
                         (config.footerLogo1Type || 'text') === m 
                           ? "bg-brand-gold text-brand-black" 
                           : "text-white/40 hover:text-white"
                       }`}
                     >
                       {m}
                     </button>
                   ))}
                 </div>
               </div>
               
               {(config.footerLogo1Type || 'text') === 'image' && (
                 <ImageUploader 
                    fieldKey="footerLogo1Url" 
                    label="Footer Primary Logo (Main Footer)" 
                     currentValue={config.footerLogo1Url} 
                    onUploadSuccess={(url: string) => updateJSONField("brandingSettingsJson", "footerLogo1Url", url)}
                 />
               )}
             </div>

             {/* Footer Logo 2 */}
             <div className="bg-white/5 p-4 border border-white/5 space-y-4">
               <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Footer Logo 2 (Accents)</p>
                 <div className="flex gap-2 p-1 bg-black/40 rounded">
                   {['text', 'image'].map((m) => (
                     <button
                       key={m}
                       onClick={() => updateJSONField("brandingSettingsJson", "footerLogo2Type", m)}
                       className={`px-3 py-1 text-[9px] uppercase font-bold transition-all ${
                         (config.footerLogo2Type || 'text') === m 
                           ? "bg-brand-gold text-brand-black" 
                           : "text-white/40 hover:text-white"
                       }`}
                     >
                       {m}
                     </button>
                   ))}
                 </div>
               </div>
               
               {(config.footerLogo2Type || 'text') === 'image' && (
                 <ImageUploader 
                    fieldKey="footerLogo2Url" 
                    label="Footer Secondary/Accent Logo" 
                     currentValue={config.footerLogo2Url} 
                    onUploadSuccess={(url: string) => updateJSONField("brandingSettingsJson", "footerLogo2Url", url)}
                 />
               )}
             </div>

             {/* Social Grid Logo */}
             <div className="bg-white/5 p-4 border border-white/5 space-y-4">
               <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Social Section Logo (Above "Stay In Touch")</p>
                 <div className="flex gap-2 p-1 bg-black/40 rounded">
                   {['text', 'image'].map((m) => (
                     <button
                       key={m}
                       onClick={() => updateJSONField("brandingSettingsJson", "socialLogoType", m)}
                       className={`px-3 py-1 text-[9px] uppercase font-bold transition-all ${
                         (config.socialLogoType || 'text') === m 
                           ? "bg-brand-gold text-brand-black" 
                           : "text-white/40 hover:text-white"
                       }`}
                     >
                       {m}
                     </button>
                   ))}
                 </div>
               </div>
               
               {(config.socialLogoType || 'text') === 'image' && (
                 <ImageUploader 
                   fieldKey="socialLogoUrl" 
                   label="Social Section Logo Image" 
                   currentValue={config.socialLogoUrl} 
                   onUploadSuccess={(url: string) => updateJSONField("brandingSettingsJson", "socialLogoUrl", url)}
                 />
               )}
             </div>

             {/* Favicon */}
             <div className="bg-white/5 p-4 border border-white/5 space-y-4">
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Favicon (Browser Tab Icon)</p>
                 <p className="text-[9px] text-white/30 italic mb-2">Usually 32x32px or 16x16px. Displayed in the browser tab.</p>
               </div>
               
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-white/50 block">Favicon URL / Path</label>
                 <input 
                   type="text" 
                   value={content.faviconUrl || ""}
                   onChange={(e) => updateContentField("faviconUrl", e.target.value)}
                   className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                   placeholder="e.g., /favicon.ico or https://..."
                 />
               </div>

               <ImageUploader 
                 fieldKey="faviconUrl" 
                 label="Upload Browser Favicon" 
                 currentValue={content.faviconUrl || ""} 
                 onUploadSuccess={(url: string) => updateContentField("faviconUrl", url)}
               />
             </div>

             <ImageUploader 
                fieldKey="logoUrlAlt" 
                label="Alternative Emblem / Branding Asset" 
                currentValue={config.logoUrlAlt}
                onUploadSuccess={(url: string) => updateJSONField("brandingSettingsJson", "logoUrlAlt", url)}
             />
           </div>
        </div>
      </div>
    );
  }

  if (activeTab === "seo") {
    const config = parseJSON(content.seoSettingsJson, {});
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Meta Description</label>
          <textarea 
            value={config.metaDescription || ""}
            onChange={(e) => updateJSONField("seoSettingsJson", "metaDescription", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs h-24" 
            placeholder="Search engine summary..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Meta Keywords (Comma separated)</label>
          <input 
            type="text" 
            value={config.metaKeywords || ""}
            onChange={(e) => updateJSONField("seoSettingsJson", "metaKeywords", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Author Name</label>
            <input 
              type="text" 
              value={config.authorName || "Dr. FID"}
              onChange={(e) => updateJSONField("seoSettingsJson", "authorName", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
            />
          </div>
        </div>
        <div className="space-y-4">
           <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold border-b border-white/5 pb-2">Social Sharing Card</p>
           <ImageUploader 
              fieldKey="ogImage" 
              label="OG Graph Preview Image" 
              currentValue={config.ogImage}
              onUploadSuccess={(url: string) => updateJSONField("seoSettingsJson", "ogImage", url)}
           />
           <p className="text-[9px] text-white/30 italic">Recommended size: 1200x630px for optimal social sharing previews.</p>
        </div>
      </div>
    );
  }

  if (activeTab === "security") {
    const config = parseJSON(content.securitySettingsJson, {});
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Session Timeout</label>
            <select 
              value={config.sessionTimeout || "60 mins"}
              onChange={(e) => updateJSONField("securitySettingsJson", "sessionTimeout", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
            >
              <option value="15 mins">15 mins</option>
              <option value="30 mins">30 mins</option>
              <option value="60 mins">60 mins</option>
              <option value="4 hours">4 hours</option>
              <option value="Never">Never (Insecure)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Two-Factor Auth Status</label>
            <select 
              value={config.twoFactorAuth || "Optional"}
              onChange={(e) => updateJSONField("securitySettingsJson", "twoFactorAuth", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
            >
              <option value="Required">Required (Secure)</option>
              <option value="Optional">Optional</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Restrict Iframe Embedding</label>
            <select 
              value={config.restrictIframe || "No"}
              onChange={(e) => updateJSONField("securitySettingsJson", "restrictIframe", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
            >
              <option value="Yes">Yes (SAMEORIGIN)</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Allowed API Origins (CORS)</label>
          <input 
            type="text" 
            value={config.allowedOrigins || "*"}
            onChange={(e) => updateJSONField("securitySettingsJson", "allowedOrigins", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs font-mono" 
          />
          <p className="text-[9px] text-white/20">Use * for all, or specific domains separated by commas.</p>
        </div>
        
        <div className="mt-8 p-4 bg-brand-red/10 border border-brand-red/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-red mb-2">Notice</p>
          <p className="text-[10px] text-brand-red/80 leading-relaxed italic">Changes to security parameters may affect administrative access. Ensure you have backup procedures in place before tightening origin restrictions.</p>
        </div>
      </div>
    );
  }

  return null;
}
