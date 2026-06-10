import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { AdminTelegramCommunityTab } from './AdminOtherTabs';
import { ImageUploader } from './ImageUploader';

export default function AdminTelegramConfigPanel() {
  const { content, updateContentField, saveContentChanges } = useContent();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMsg, setSaveMsg] = useState("");

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      const result = await saveContentChanges();
      if (result.success) {
        setSaveStatus("success");
        setSaveMsg("Telegram Landing Page configuration successfully committed to database!");
        setTimeout(() => setSaveStatus("idle"), 4000);
      } else {
        setSaveStatus("error");
        setSaveMsg(result.message || "Failed to commit changes.");
        setTimeout(() => setSaveStatus("idle"), 5000);
      }
    } catch (e: any) {
      setSaveStatus("error");
      setSaveMsg(e.message || "An unexpected error occurred during database save.");
      setTimeout(() => setSaveStatus("idle"), 5000);
    }
  };

  return (
    <div className="space-y-12">
      {/* Top Header & Commit Action Bar */}
      <div className="bg-zinc-900 border border-brand-gold/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold">📢 Sisterhood Telegram Community</h3>
          <p className="text-xs text-white/50 mt-1 font-light">Modify landing page copy, media layouts, image assets, and configure post-submission behavior.</p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === "success" && (
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 border border-emerald-500/20 animate-fade-in">
              ✓ Saved to Cloud
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-[10px] font-mono font-bold text-brand-red bg-brand-red/10 px-3 py-1 border border-brand-red/20 animate-fade-in">
              ✕ {saveMsg}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className="px-6 py-3 bg-brand-gold hover:bg-white text-brand-black font-black tracking-widest text-[10px] uppercase transition-all duration-300 shadow active:scale-95 disabled:opacity-50 cursor-pointer border-none flex items-center gap-2"
          >
            {saveStatus === "saving" ? "Committing..." : "Save Configuration"}
          </button>
        </div>
      </div>

      {saveStatus === "success" && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded animate-fade-in">
          💡 {saveMsg}
        </div>
      )}
      {saveStatus === "error" && (
        <div className="p-4 bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs rounded animate-fade-in">
          ⚠️ Error: {saveMsg}
        </div>
      )}

      <AdminTelegramCommunityTab />
      
      <div className="border-t border-white/5 pt-10">
        <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2 mt-8">🖼️ Telegram Landing Page Images</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <ImageUploader fieldKey="telegramHeroBgUrl" label="Hero Banner Image" />
          <ImageUploader fieldKey="telegramCommunityImgUrl" label="Community Session Image" />
          <ImageUploader fieldKey="telegramFounderImageUrl" label="Founder Image" />
        </div>
      </div>

      <div className="border-t border-white/5 pt-10">
        <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2 mt-8">🎉 Thank You Page & Telegram CTA</h3>

        <div className="border border-white/5 p-4 rounded-none bg-white/[0.02] space-y-6">
          <p className="text-xs text-white/50 font-light">Configure the custom separate Thank You page that displays to community members after they submit the contact form.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Thank You Page Heading</label>
              <input 
                type="text" 
                value={content.contactThankYouHeading || ""}
                onChange={(e) => updateContentField("contactThankYouHeading", e.target.value)}
                placeholder="e.g. THANK YOU FOR REACHING OUT"
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Telegram CTA Button Text</label>
              <input 
                type="text" 
                value={content.contactThankYouCtaText || ""}
                onChange={(e) => updateContentField("contactThankYouCtaText", e.target.value)}
                placeholder="e.g. Join Our Free Telegram Community"
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Telegram Group Invite Link</label>
            <input 
              type="text" 
              value={content.contactThankYouTelegramLink || ""}
              onChange={(e) => updateContentField("contactThankYouTelegramLink", e.target.value)}
              placeholder="e.g. https://t.me/yourgroup"
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs font-mono" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Thank You Description Message</label>
            <textarea 
              value={content.contactThankYouMessage || ""}
              onChange={(e) => updateContentField("contactThankYouMessage", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-20 text-xs font-mono leading-relaxed" 
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 pt-10">
        <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2 mt-8">🎨 Telegram Landing Page Header Logo</h3>
        <div className="border border-white/5 p-4 rounded-none bg-white/[0.02] space-y-6 mt-4">
          {/* Hero Banner Section Logo */}
          <h4 className="text-xs font-black uppercase tracking-wider text-brand-gold">Hero Banner Section Logo</h4>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={content.telegramHeroLogoType === 'image'}
                onChange={() => updateContentField("telegramHeroLogoType", "image")}
                className="accent-brand-gold"
              />
              <span className="text-xs text-white">Image Logo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={content.telegramHeroLogoType !== 'image'}
                onChange={() => updateContentField("telegramHeroLogoType", "text")}
                className="accent-brand-gold"
              />
              <span className="text-xs text-white">Text Logo</span>
            </label>
          </div>

          {content.telegramHeroLogoType === 'image' ? (
            <ImageUploader fieldKey="telegramHeroLogoUrl" label="Hero Banner Image Logo" />
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Text Logo Content</label>
              <input 
                type="text" 
                value={content.telegramHeroHeaderTextLogo || "The Vagina Room"}
                onChange={(e) => updateContentField("telegramHeroHeaderTextLogo", e.target.value)}
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
              />
            </div>
          )}

          <div className="space-y-2 border-t border-white/5 pt-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30">Hero Section Logo Height (px)</label>
              <span className="text-white/60 font-mono text-[10px]">{content.telegramHeroLogoHeight || 150}px</span>
            </div>
            <input 
              type="range" min="50" max="400" step="1"
              value={content.telegramHeroLogoHeight || 150}
              onChange={(e) => updateContentField("telegramHeroLogoHeight", e.target.value)}
              className="w-full accent-brand-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="border border-white/5 p-4 rounded-none bg-white/[0.02] space-y-6 mt-10">
          {/* Header Logo Section */}
          <h4 className="text-xs font-black uppercase tracking-wider text-brand-gold">Header Logo</h4>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={content.telegramHeaderLogoType === 'image'}
                onChange={() => updateContentField("telegramHeaderLogoType", "image")}
                className="accent-brand-gold"
              />
              <span className="text-xs text-white">Image Logo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={content.telegramHeaderLogoType !== 'image'}
                onChange={() => updateContentField("telegramHeaderLogoType", "text")}
                className="accent-brand-gold"
              />
              <span className="text-xs text-white">Text Logo</span>
            </label>
          </div>

          {content.telegramHeaderLogoType === 'image' ? (
            <ImageUploader fieldKey="telegramHeaderLogoUrl" label="Header Image Logo" />
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Text Logo Content</label>
              <input 
                type="text" 
                value={content.telegramHeaderTextLogo || "The Vagina Room"}
                onChange={(e) => updateContentField("telegramHeaderTextLogo", e.target.value)}
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
              />
            </div>
          )}
          <div className="space-y-2 border-t border-white/5 pt-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30">Header Logo Height (px)</label>
              <span className="text-white/60 font-mono text-[10px]">{content.telegramHeaderLogoHeight || 44}px</span>
            </div>
            <input 
              type="range" min="16" max="100" step="1"
              value={content.telegramHeaderLogoHeight || 44}
              onChange={(e) => updateContentField("telegramHeaderLogoHeight", e.target.value)}
              className="w-full accent-brand-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Action Row */}
      <div className="border-t border-white/5 pt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className="px-8 py-4 bg-brand-gold hover:bg-white text-brand-black font-black tracking-widest text-xs uppercase transition-all duration-300 shadow active:scale-95 disabled:opacity-50 cursor-pointer border-none flex items-center gap-2"
        >
          {saveStatus === "saving" ? "Saving..." : "Save Telegram Configuration"}
        </button>
      </div>
    </div>
  );
}
