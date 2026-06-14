import React from "react";
import { useContent } from "../context/ContentContext";

interface LoaderConfig {
  headerLogoType?: "text" | "image";
  headerLogoUrl?: string;
  headerLogoHeight?: number;
  loaderLogoType?: "default" | "text" | "image";
  loaderLogoUrl?: string;
  loaderLogoHeight?: number;
  loaderSubtext?: string;
  loaderLabel?: string;
  loaderShowText?: boolean;
  loaderSpinSpeed?: "slow" | "normal" | "fast";
}

export default function ScreenLoader({ labelOverride }: { labelOverride?: string }) {
  const { content } = useContent();

  let general: any = {};
  try { general = JSON.parse(content?.generalSettingsJson || "{}"); } catch (e) {}

  let branding: LoaderConfig = {};
  try {
    branding = JSON.parse(content?.brandingSettingsJson || "{}");
  } catch (e) {
    branding = {};
  }

  // Fallbacks
  const logoType = branding.loaderLogoType || "default"; // 'default' | 'text' | 'image'
  const logoUrl = branding.loaderLogoUrl || branding.headerLogoUrl || "";
  const logoHeight = branding.loaderLogoHeight || branding.headerLogoHeight || 54;
  const showText = branding.loaderShowText !== false; // defaults to true
  // Explicitly prioritize branding.loaderSubtext over other fallbacks
  const subtext = (branding.loaderSubtext && branding.loaderSubtext.trim() !== "") 
    ? branding.loaderSubtext 
    : (general.slogan || "Restoring Wellness & Dignity");
  const labelText = labelOverride || branding.loaderLabel || "";

  // Spin speed
  let spinClass = "animate-spin";
  if (branding.loaderSpinSpeed === "slow") spinClass = "animate-[spin_4s_linear_infinite]";
  if (branding.loaderSpinSpeed === "fast") spinClass = "animate-[spin_1s_linear_infinite]";

  const isImageLogo = logoType === "image" || (logoType === "default" && branding.headerLogoType === "image");

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative select-none">
      {/* Background radial glowing gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-gold/5 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      
      <div className="flex flex-col items-center gap-6 relative z-10 p-6 text-center select-none">
        {/* Top small tiny label if configured */}
        {labelText && (
          <p className="text-[9px] font-mono tracking-[0.25em] text-white/40 uppercase mb-1">
            {labelText}
          </p>
        )}

        {/* Logo/Brand representation */}
        {isImageLogo && logoUrl ? (
          <img 
            src={logoUrl} 
            alt="The Vagina Room Logo" 
            style={{ height: `${logoHeight}px` }}
            className="max-h-24 w-auto object-contain animate-pulse"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase font-sans animate-pulse">
            THE <span className="text-brand-gold italic font-extralight lowercase font-serif px-1 inline-block normal-case tracking-normal text-4xl">vagina</span> ROOM
          </div>
        )}

        {/* Subtext and Loader spinner */}
        {showText && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-[8.5px] font-mono tracking-[0.3em] text-brand-gold/80 uppercase">
              {subtext}
            </p>
            <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-brand-gold to-transparent animate-pulse mt-2" />
          </div>
        )}
        
        <div className={`w-6 h-6 border-2 border-white/5 border-t-brand-gold rounded-full ${spinClass} mt-4`} />
      </div>
    </div>
  );
}
