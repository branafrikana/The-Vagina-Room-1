import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { ImageUploader } from '../../pages/AdminPage';
import { Eye, EyeOff } from 'lucide-react';

interface AdminSettingsTabProps {
  activeTab: "general" | "branding" | "seo" | "security" | "social" | "integrations";
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
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block tracking-widest">Slogan / Tagline</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={config.slogan || ""}
                onChange={(e) => updateJSONField("generalSettingsJson", "slogan", e.target.value)}
                className="flex-grow bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                placeholder="e.g. Empowering Wellness & Intimacy"
              />
              <button
                onClick={() => updateJSONField("generalSettingsJson", "showHeaderSlogan", !config.showHeaderSlogan)}
                className={`px-4 text-[9px] font-black uppercase tracking-widest border transition-all ${
                  config.showHeaderSlogan 
                    ? "bg-brand-gold border-brand-gold text-brand-black" 
                    : "bg-transparent border-white/10 text-white/40 hover:text-white"
                }`}
              >
                {config.showHeaderSlogan ? "Header: ON" : "Header: OFF"}
              </button>
            </div>
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

        {/* WhatsApp Floating Widget Options */}
        <div className="border border-white/5 bg-white/[0.01] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-3 mb-2">
            <div>
              <h4 className="text-xs font-black text-brand-gold uppercase tracking-[0.2em]">WhatsApp Floating Chat</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Interactive helpdesk button served globally to clients</p>
            </div>
            <button
              type="button"
              onClick={() => updateJSONField("generalSettingsJson", "whatsappWidgetEnabled", config.whatsappWidgetEnabled !== false ? false : true)}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                config.whatsappWidgetEnabled !== false 
                  ? "bg-green-600/20 border-green-500 text-green-400" 
                  : "bg-transparent border-white/10 text-white/40 hover:text-white"
              }`}
            >
              {config.whatsappWidgetEnabled !== false ? "Widget: ACTIVE" : "Widget: DISABLED"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Widget Screen Position</label>
              <select
                value={config.whatsappWidgetPosition || "RIGHT"}
                onChange={(e) => updateJSONField("generalSettingsJson", "whatsappWidgetPosition", e.target.value)}
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
              >
                <option value="RIGHT">Right-Hand Side (Recommended)</option>
                <option value="LEFT">Left-Hand Side</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Launcher Button Icon</label>
              <select
                value={config.whatsappWidgetIconStyle || "MESSAGE"}
                onChange={(e) => updateJSONField("generalSettingsJson", "whatsappWidgetIconStyle", e.target.value)}
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
              >
                <option value="MESSAGE">Support Message Bubble</option>
                <option value="WHATSAPP">Official WhatsApp Icon</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Linked WhatsApp Line</label>
              <input 
                type="text" 
                value={config.whatsappPhone || ""}
                onChange={(e) => updateJSONField("generalSettingsJson", "whatsappPhone", e.target.value)}
                placeholder="e.g. +234 813 546 4432"
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Chat Window Welcome Memo</label>
              <textarea 
                value={config.whatsappWidgetGreeting || "Hi! Welcome to The Vagina Room. How can we guide your wellness journey today?"}
                onChange={(e) => updateJSONField("generalSettingsJson", "whatsappWidgetGreeting", e.target.value)}
                rows={2}
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Text Entry Box Placeholder</label>
              <textarea 
                value={config.whatsappWidgetPlaceholder || "Ask about private clinical consultation, events, community, or products..."}
                onChange={(e) => updateJSONField("generalSettingsJson", "whatsappWidgetPlaceholder", e.target.value)}
                rows={2}
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
              />
            </div>
          </div>

          <div className="border-t border-white/5 pt-4">
            <ImageUploader 
              fieldKey={"whatsappWidgetLogo" as any} 
              label="WhatsApp Widget Header Avatar Logo" 
              currentValue={config.whatsappWidgetLogo} 
              onUploadSuccess={(url: string) => updateJSONField("generalSettingsJson", "whatsappWidgetLogo", url)}
            />
            <p className="text-[9px] text-white/30 uppercase tracking-wider mt-1">If empty, defaults automatically to your site header navigation logo or the brand symbol</p>
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
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold">PWA Master Control</p>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                { (parseJSON(content.pwaSettingsJson, {}).pwaEnabled !== false) ? 'SYSTEM ACTIVE' : 'SYSTEM OFFLINE' }
              </span>
              <button 
                onClick={() => updateJSONField("pwaSettingsJson", "pwaEnabled", parseJSON(content.pwaSettingsJson, {}).pwaEnabled === false)}
                className={`w-10 h-5 relative rounded-full transition-colors ${parseJSON(content.pwaSettingsJson, {}).pwaEnabled !== false ? 'bg-emerald-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${parseJSON(content.pwaSettingsJson, {}).pwaEnabled !== false ? 'right-1' : 'left-1'}`} />
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
                 <div className="space-y-4">
                   <ImageUploader 
                     fieldKey="headerLogoUrl" 
                     label="Header Navigation Logo (Top Left)" 
                      currentValue={config.headerLogoUrl} 
                     onUploadSuccess={(url: string) => updateJSONField("brandingSettingsJson", "headerLogoUrl", url)}
                   />
                   <div className="space-y-2 border-t border-white/5 pt-2">
                     <div className="flex justify-between items-center">
                       <label className="text-[9px] font-bold uppercase tracking-wider text-white/40">Logo Height</label>
                       <span className="text-white/60 font-mono text-[10px]">{config.headerLogoHeight || 44}px</span>
                     </div>
                     <input 
                       type="range" min="16" max="150" step="1"
                       value={config.headerLogoHeight || 44}
                       onChange={(e) => updateJSONField("brandingSettingsJson", "headerLogoHeight", parseInt(e.target.value))}
                       className="w-full accent-brand-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                     />
                   </div>
                 </div>
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
                 <div className="space-y-4">
                   <ImageUploader 
                      fieldKey="footerLogo1Url" 
                      label="Footer Primary Logo (Main Footer)" 
                       currentValue={config.footerLogo1Url} 
                      onUploadSuccess={(url: string) => updateJSONField("brandingSettingsJson", "footerLogo1Url", url)}
                   />
                   <div className="space-y-2 border-t border-white/5 pt-2">
                     <div className="flex justify-between items-center">
                       <label className="text-[9px] font-bold uppercase tracking-wider text-white/40">Logo Height</label>
                       <span className="text-white/60 font-mono text-[10px]">{config.footerLogo1Height || 64}px</span>
                     </div>
                     <input 
                       type="range" min="24" max="250" step="2"
                       value={config.footerLogo1Height || 64}
                       onChange={(e) => updateJSONField("brandingSettingsJson", "footerLogo1Height", parseInt(e.target.value))}
                       className="w-full accent-brand-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                     />
                   </div>
                 </div>
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
                 <div className="space-y-4">
                   <ImageUploader 
                      fieldKey="footerLogo2Url" 
                      label="Footer Secondary/Accent Logo" 
                       currentValue={config.footerLogo2Url} 
                      onUploadSuccess={(url: string) => updateJSONField("brandingSettingsJson", "footerLogo2Url", url)}
                   />
                   <div className="space-y-2 border-t border-white/5 pt-2">
                     <div className="flex justify-between items-center">
                       <label className="text-[9px] font-bold uppercase tracking-wider text-white/40">Logo Height</label>
                       <span className="text-white/60 font-mono text-[10px]">{config.footerLogo2Height || 32}px</span>
                     </div>
                     <input 
                       type="range" min="12" max="120" step="1"
                       value={config.footerLogo2Height || 32}
                       onChange={(e) => updateJSONField("brandingSettingsJson", "footerLogo2Height", parseInt(e.target.value))}
                       className="w-full accent-brand-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                     />
                   </div>
                 </div>
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
                 <div className="space-y-4">
                   <ImageUploader 
                     fieldKey="socialLogoUrl" 
                     label="Social Section Logo Image" 
                     currentValue={config.socialLogoUrl} 
                     onUploadSuccess={(url: string) => updateJSONField("brandingSettingsJson", "socialLogoUrl", url)}
                   />
                   <div className="space-y-2 border-t border-white/5 pt-2">
                     <div className="flex justify-between items-center">
                       <label className="text-[9px] font-bold uppercase tracking-wider text-white/40">Logo Height</label>
                       <span className="text-white/60 font-mono text-[10px]">{config.socialLogoHeight || 80}px</span>
                     </div>
                     <input 
                       type="range" min="30" max="300" step="2"
                       value={config.socialLogoHeight || 80}
                       onChange={(e) => updateJSONField("brandingSettingsJson", "socialLogoHeight", parseInt(e.target.value))}
                       className="w-full accent-brand-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                     />
                   </div>
                 </div>
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
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Site Slogan (SEO Tagline)</label>
          <input 
            type="text" 
            value={config.slogan || ""}
            onChange={(e) => updateJSONField("seoSettingsJson", "slogan", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
            placeholder="Official Brand Slogan"
          />
        </div>
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

  if (activeTab === "social") {
    return (
      <div className="space-y-6">
        <div className="bg-white/5 p-6 border border-white/10 space-y-6 mb-8">
           <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold">Section Titles</p>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Main Heading Title</label>
                <input type="text" value={content.socialSectionTitle || ""} onChange={(e) => updateContentField("socialSectionTitle", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" placeholder="e.g. JOIN THE SANCTUARY" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Sub-Title / Slogan</label>
                <input type="text" value={content.socialSubTitle || ""} onChange={(e) => updateContentField("socialSubTitle", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" placeholder="e.g. STAY IN TOUCH WITH ME" />
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">X (Twitter) Link</label>
            <input type="text" value={content.socialLinkX || ""} onChange={(e) => updateContentField("socialLinkX", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Instagram Link</label>
            <input type="text" value={content.socialLinkInstagram || ""} onChange={(e) => updateContentField("socialLinkInstagram", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">TikTok Link</label>
            <input type="text" value={content.socialLinkTiktok || ""} onChange={(e) => updateContentField("socialLinkTiktok", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Facebook Link</label>
            <input type="text" value={content.socialLinkFacebook || ""} onChange={(e) => updateContentField("socialLinkFacebook", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">YouTube Link</label>
            <input type="text" value={content.socialLinkYoutube || ""} onChange={(e) => updateContentField("socialLinkYoutube", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">LinkedIn Link</label>
            <input type="text" value={content.socialLinkLinkedin || ""} onChange={(e) => updateContentField("socialLinkLinkedin", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "integrations") {
    const mediaConfig = parseJSON(content.mediaSettingsJson, {});
    const paymentConfig = parseJSON(content.paymentSettingsJson, {});
    const smtpConfig = parseJSON(content.smtpSettingsJson, {});
    
    const [systemStatus, setSystemStatus] = useState<any>(null);
    const [statusLoading, setStatusLoading] = useState(false);

    const refreshStatus = React.useCallback(async () => {
      setStatusLoading(true);
      try {
        const res = await fetch(`/api/admin/system-status?password=${content.adminPassword}`);
        const data = await res.json();
        setSystemStatus(data);
      } catch (err) {
        console.error("Failed to fetch system status", err);
      } finally {
        setStatusLoading(false);
      }
    }, [content.adminPassword]);

    React.useEffect(() => {
      refreshStatus();
    }, [refreshStatus]);

    const StatusIndicator = ({ isActive }: { isActive: boolean }) => (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-brand-red"}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-brand-red"}`} />
        {isActive ? "Configured & Active" : "Not Configured / Inactive"}
      </span>
    );

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center bg-white/5 p-4 border border-white/10 rounded-sm">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-white">API Integrations</p>
            <p className="text-[10px] text-white/50 mt-1">Configure external services. Save standard dashboard to apply changes.</p>
          </div>
          <button 
            onClick={refreshStatus}
            disabled={statusLoading}
            className="px-4 py-2 bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {statusLoading ? "Testing..." : "Test Connections"}
          </button>
        </div>

        {/* Cloudinary */}
        <div className="bg-brand-black border border-white/10 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-brand-gold">Cloudinary (Media Storage)</p>
              <p className="text-[10px] text-white/40 mt-1">Replaces local /uploads with persistent cloud storage.</p>
            </div>
            <StatusIndicator isActive={systemStatus?.cloudinary === true} />
          </div>
          <div className="grid grid-cols-1 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 block">Cloud Name</label>
              <input type="text" value={mediaConfig.cloudinaryCloudName || ""} onChange={(e) => updateJSONField("mediaSettingsJson", "cloudinaryCloudName", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 block">API Key</label>
              <input type="text" value={mediaConfig.cloudinaryApiKey || ""} onChange={(e) => updateJSONField("mediaSettingsJson", "cloudinaryApiKey", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 block">API Secret</label>
              <input type="password" value={mediaConfig.cloudinaryApiSecret || ""} onChange={(e) => updateJSONField("mediaSettingsJson", "cloudinaryApiSecret", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
          </div>
        </div>

        {/* Firebase */}
        <div className="bg-brand-black border border-white/10 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#FFCA28]">Firebase (Database)</p>
              <p className="text-[10px] text-white/40 mt-1">Saves configuration to firebase-applet-config.json</p>
            </div>
            <StatusIndicator isActive={systemStatus?.firestore === true} />
          </div>
          <div className="pt-2 space-y-4">
            <p className="text-[10px] text-white/50 leading-relaxed italic">
              Paste your Firebase Service Account JSON or client configuration JSON here. This will be saved to the local configuration file and used by the server on subsequent restarts. Note that the FIREBASE_CONFIG environment variable takes precedence on deployment platforms like Render.
            </p>
            <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 block">Firebase Config JSON String</label>
               <textarea 
                  value={content.firebaseConfigRaw || ""} 
                  onChange={(e) => updateContentField("firebaseConfigRaw", e.target.value)} 
                  placeholder='{"projectId": "...", "apiKey": "..."}'
                  className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs font-mono min-h-[120px]" 
               />
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="bg-brand-black border border-white/10 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9]">Payment Gateways</p>
              <p className="text-[10px] text-white/40 mt-1">Keys for online checkout payments.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Paystack */}
            <div className="space-y-4 p-4 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Paystack</p>
                <StatusIndicator isActive={systemStatus?.paystack === true} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 block">Secret Key</label>
                <input type="password" value={paymentConfig.paystackSecretKey || ""} onChange={(e) => updateJSONField("paymentSettingsJson", "paystackSecretKey", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
              </div>
            </div>

            {/* Flutterwave */}
            <div className="space-y-4 p-4 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Flutterwave</p>
                <StatusIndicator isActive={systemStatus?.flutterwave === true} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 block">Secret Key</label>
                <input type="password" value={paymentConfig.flutterwaveSecretKey || ""} onChange={(e) => updateJSONField("paymentSettingsJson", "flutterwaveSecretKey", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
              </div>
            </div>
          </div>
        </div>

        {/* SMTP Details */}
        <div className="bg-brand-black border border-white/10 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white">SMTP (Email Delivery)</p>
              <p className="text-[10px] text-white/40 mt-1">Used for system alerts, booking confirmations, and orders.</p>
            </div>
            <StatusIndicator isActive={systemStatus?.smtp === true} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">SMTP Host</label>
              <input type="text" value={smtpConfig.host || ""} onChange={(e) => updateJSONField("smtpSettingsJson", "host", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">SMTP Port</label>
              <input type="text" value={smtpConfig.port || ""} onChange={(e) => updateJSONField("smtpSettingsJson", "port", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">SMTP User</label>
              <input type="text" value={smtpConfig.user || ""} onChange={(e) => updateJSONField("smtpSettingsJson", "user", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">SMTP Pass</label>
              <input type="password" value={smtpConfig.pass || ""} onChange={(e) => updateJSONField("smtpSettingsJson", "pass", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">SMTP From Address</label>
              <input type="email" value={smtpConfig.from || ""} onChange={(e) => updateJSONField("smtpSettingsJson", "from", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
          </div>
        </div>

      </div>
    );
  }

  return null;
}
