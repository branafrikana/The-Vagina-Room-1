import React, { useState, useEffect } from "react";
import { useContent } from "../context/ContentContext";
import ScreenLoader from "../components/ScreenLoader";
import { 
  Instagram, 
  Youtube, 
  Send, 
  Linkedin, 
  ExternalLink, 
  Share2, 
  Check, 
  FileText, 
  Heart, 
  Sparkles, 
  BookOpen, 
  Calendar, 
  ShoppingBag,
  Globe,
  Facebook,
  Twitter,
  MessageCircle,
  Music,
  Camera,
  Bookmark,
  MessageSquare,
  Image,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import TikTokIcon from "../components/TikTokIcon";
import XIcon from "../components/XIcon";
import { motion, AnimatePresence } from "motion/react";
import { Helmet } from "react-helmet-async";

// Render footer text logo elegantly style matching brand text logo perfectly and uniformly
const renderFooterLogoText = (text: string) => {
  if (!text) text = "The Vagina Room Global";
  return (
    <span className="text-white font-black tracking-widest text-[9.5px] uppercase font-sans">
      {text}
    </span>
  );
};


// Safe JSON Parse Helper
function safeJsonParse(jsonStr: string, fallback: any) {
  if (!jsonStr) return fallback;
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Error parsing JSON config", e);
    return fallback;
  }
}

// Icon Finder
const getIconComponent = (iconName: string) => {
  const normalized = iconName?.toLowerCase() || "";
  switch (normalized) {
    case "instagram": return <Instagram className="w-5 h-5" />;
    case "youtube": return <Youtube className="w-5 h-5" />;
    case "telegram":
    case "send": 
      return <Send className="w-5 h-5" />;
    case "linkedin": return <Linkedin className="w-5 h-5" />;
    case "facebook": return <Facebook className="w-5 h-5" />;
    case "twitter":
    case "x": 
    case "xicon":
      return <XIcon className="w-5 h-5" />;
    case "tiktok": return <TikTokIcon className="w-5 h-5" />;
    case "music": 
      return <Music className="w-5 h-5 text-brand-gold" />;
    case "whatsapp": return <MessageCircle className="w-5 h-5" />;
    case "threads": return <MessageSquare className="w-5 h-5" />;
    case "snapchat": return <Camera className="w-5 h-5" />;
    case "pinterest": return <Bookmark className="w-5 h-5" />;
    case "globe":
    case "website":
      return <Globe className="w-5 h-5" />;
    case "heart": return <Heart className="w-5 h-5" />;
    case "sparkles": return <Sparkles className="w-5 h-5" />;
    case "bookopen":
    case "book-open": 
      return <BookOpen className="w-5 h-5" />;
    case "calendar": return <Calendar className="w-5 h-5" />;
    case "shoppingbag":
    case "shopping-bag": 
      return <ShoppingBag className="w-5 h-5" />;
    default: return <ExternalLink className="w-5 h-5" />;
  }
};

interface CarouselProps {
  images: any[];
}

function ShowcaseCarousel({ images }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000); // 5 seconds auto-scroll
    return () => clearInterval(interval);
  }, [images.length]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const img = images[activeIndex];
  if (!img) return null;

  const imgExternal = img.clickUrl?.startsWith("http");

  return (
    <div className="relative border border-white/5 bg-brand-black rounded-2xl overflow-hidden flex flex-col shadow-xl">
      {/* Slider view container */}
      <div className="relative w-full bg-black/40 flex items-center justify-center p-1 overflow-hidden min-h-[180px]">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            src={img.imageUrl}
            alt={img.title}
            referrerPolicy="no-referrer"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="w-full h-auto object-contain max-h-[500px]"
          />
        </AnimatePresence>

        {/* Left Arrow Button */}
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            type="button"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand-black/80 hover:bg-white text-white hover:text-brand-black flex items-center justify-center border border-white/10 transition-all z-20 cursor-pointer shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right Arrow Button */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand-black/80 hover:bg-white text-white hover:text-brand-black flex items-center justify-center border border-white/10 transition-all z-20 cursor-pointer shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Meta story display area */}
      <div className="p-5 bg-black/60 border-t border-white/5 text-left">
        <div className="flex justify-between items-start gap-4">
          <div className="w-full">
            <span className="text-[8px] font-mono uppercase text-brand-gold tracking-[0.25em] mb-1 opacity-70 block">
              SHOWCASE STORY {activeIndex + 1} OF {images.length}
            </span>
            <h5 className="text-sm font-serif tracking-tight text-white transition-colors">
              {img.title}
            </h5>
            {img.description && (
              <p className="text-[11px] text-white/50 tracking-wide mt-1.5 font-sans leading-relaxed">
                {img.description}
              </p>
            )}
            {img.ctaText && (
              <div className="mt-4 flex justify-start">
                <a
                  href={img.clickUrl || "#"}
                  target={imgExternal ? "_blank" : "_self"}
                  rel={imgExternal ? "noreferrer" : ""}
                  className="inline-flex items-center gap-2 p-3 px-5 bg-brand-gold text-brand-black hover:bg-white text-[10px] font-black tracking-widest uppercase transition-all duration-300 cursor-pointer"
                >
                  <span>{img.ctaText}</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Dots indicators */}
        {images.length > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-5">
            {images.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setActiveIndex(dotIdx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  dotIdx === activeIndex ? "bg-brand-gold w-3" : "bg-white/15"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConnectPage() {
  const { content, loading } = useContent();
  const [copied, setCopied] = useState(false);
  const [hasFollowedLinkedIn, setHasFollowedLinkedIn] = useState(false);

  if (loading) {
    return <ScreenLoader />;
  }

  // Parse Link Tree config
  const rawConfig = safeJsonParse(content?.linkTreeConfigJson, {});
  const config = {
    profilePicture: rawConfig.profilePicture || "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400",
    fullName: rawConfig.fullName || "Amb. Dr. Damilola Awoyemi (Dr. FID)",
    bio: rawConfig.bio || "Holistic Wellness Expert • SPA Business Consultant • Women's Reproductive Health Advocate & Visionary Entrepreneur",
    socials: rawConfig.socials || [
      { platform: "Instagram", url: "https://instagram.com/thevaginaroom", icon: "Instagram" },
      { platform: "Youtube", url: "https://youtube.com", icon: "Youtube" },
      { platform: "Telegram", url: "https://t.me/thevaginaroom", icon: "Send" },
      { platform: "LinkedIn", url: "https://linkedin.com", icon: "Linkedin" }
    ],
    links: rawConfig.links || [
      { id: "l1", type: "cta", label: "🌸 Join The Inner Circle (NGN 25,000 / $50)", url: "/join-community", description: "Weekly masterclasses with Dr. FID, medical board resources & global sisterhood circle.", isHighlighted: true },
      { id: "l2", type: "cta", label: "📅 Book A Confidential Session styled by Dr. FID", url: "/dr-fid-booking", description: "Consult directly for intimate, spinal manipulation, spa wellness, and chiropractic support.", isHighlighted: false },
      { id: "l3", type: "cta", label: "🌿 Our Curated Phyto-Medicinal Selections", url: "/products", description: "Explore scientific botanical formulations engineered for female anatomy restore.", isHighlighted: false },
      { id: "l4", type: "cta", label: "💬 Free Telegram General Discussion Safe-Space", url: "/telegram", description: "Dismantling silent stigmas with 1,000+ sisters who talk freely without taboos.", isHighlighted: false }
    ],
    images: rawConfig.images || [
      { id: "img1", imageUrl: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=800", title: "About Our Shared Mission", description: "Where biology meets compassion to end intimate shame, providing restorative care standardizations worldwide.", clickUrl: "/about" },
      { id: "img2", imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800", title: "Our Clinical Spa Groundwork", description: "Undergoing active certified chiropractic manipulation & holistic clinical retreats with Dr. FID.", clickUrl: "/dr-fid" }
    ],
    showcaseLayout: rawConfig.showcaseLayout || "list",
    topBannerEnabled: rawConfig.topBannerEnabled,
    topBanners: rawConfig.topBanners,
    topBannerUrl: rawConfig.topBannerUrl,
    topBannerClickUrl: rawConfig.topBannerClickUrl,
    footerLine1: rawConfig.footerLine1,
    footerLine2: rawConfig.footerLine2
  };

  let disabledPageSet: Record<string, boolean> = {};
  if (content?.disabledPagesJson) {
    try {
      disabledPageSet = JSON.parse(content.disabledPagesJson);
    } catch (e) {}
  }

  const activeLinks = config.links?.filter((lnk: any) => {
    const url = lnk.url;
    if (!url || url === "#") return true;
    const normalizedUrl = url.endsWith('/') && url.length > 1 ? url.slice(0, -1) : url;
    return !disabledPageSet[normalizedUrl];
  }) || [];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white py-14 px-4 sm:px-6 relative overflow-hidden font-sans selection:bg-brand-gold/20 selection:text-brand-gold">
      <Helmet>
        <title>Connect | {config?.fullName || "The Vagina Room"}</title>
        <meta name="description" content={config?.bio || "Connect with Dr. FID and the community"} />
      </Helmet>

      {/* Atmospheric Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-gold/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[400px] h-[400px] bg-brand-red/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating Share Button */}
      <div className="max-w-xl mx-auto flex justify-end mb-6 relative z-10">
        <button
          onClick={handleShare}
          className="relative group p-3 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition-all flex items-center justify-center cursor-pointer text-white/70 hover:text-white"
          title="Copy Link tree Address"
          id="share_link_tree_btn"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Share2 className="w-4 h-4 text-brand-gold" />
          )}
          
          <AnimatePresence>
            {copied && (
              <motion.span
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute right-0 top-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono tracking-wider px-3 py-1 rounded shadow-lg uppercase whitespace-nowrap"
              >
                Copied Link!
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Profile Card Body */}
      <div className="max-w-xl mx-auto text-center relative z-10 flex flex-col items-center">
        {/* Rounded Profile Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-28 h-28 sm:w-32 sm:h-32 mb-5 rounded-full p-1 bg-gradient-to-tr from-brand-gold via-white/20 to-brand-gold/40 shadow-xl overflow-hidden"
        >
          <img
            src={config.profilePicture}
            alt={config.fullName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full"
          />
        </motion.div>

        {/* Full Name */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-2xl sm:text-3xl font-serif text-white tracking-tight leading-snug"
        >
          {config.fullName}
        </motion.h1>

        {/* Bio text */}
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[12.5px] text-white/60 tracking-wide mt-3 max-w-md leading-relaxed font-sans"
        >
          {config.bio}
        </motion.p>

        {/* Dynamic High-Conversion Customizable CTA Button - REMOVED */}
        {/* {config.welcomeCtaEnabled !== false && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="w-full max-w-sm px-4 mt-5"
          >
            <a
              href={config.welcomeCtaUrl || "/join-community"}
              className="group relative flex items-center justify-center p-4 bg-brand-gold text-brand-black hover:bg-white text-xs font-black tracking-[0.25em] uppercase transition-all duration-300 shadow-xl overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />
              <div className="flex items-center gap-2 relative z-10 text-brand-black">
                <Sparkles className="w-4.5 h-4.5 text-brand-black" />
                <span>{config.welcomeCtaText || "Register Now"}</span>
              </div>
            </a>
          </motion.div>
        )} */}

        {/* Social Link Handles */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center items-center gap-5 mt-6 mb-10"
        >
          {config.socials?.map((soc: any, idx: number) => {
            const isLinkedIn = soc.platform?.toLowerCase() === "linkedin" || soc.icon?.toLowerCase() === "linkedin";
            return (
              <a
                key={idx}
                href={soc.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  if (isLinkedIn) {
                    localStorage.setItem("tvr_followed_linkedin", "true");
                    setHasFollowedLinkedIn(true);
                  }
                }}
                className="text-white/40 hover:text-brand-gold hover:scale-110 transition-all duration-300"
                title={soc.platform}
              >
                {getIconComponent(soc.icon || soc.platform)}
              </a>
            );
          })}
        </motion.div>

        {/* Top Landscape Promo Banner(s) */}
        {config.topBannerEnabled && (
          <div className="w-full flex flex-col gap-4 mb-8">
            {((config.topBanners && config.topBanners.length > 0)
              ? config.topBanners
              : config.topBannerUrl
              ? [{ id: "tb-legacy", imageUrl: config.topBannerUrl, clickUrl: config.topBannerClickUrl || "" }]
              : []
            ).map((tb: any, i: number) => {
              if (!tb.imageUrl) return null;
              return (
                <motion.div
                  key={tb.id || i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="w-full"
                >
                  {tb.clickUrl ? (
                    <a
                      href={tb.clickUrl}
                      target={tb.clickUrl.startsWith("http") || tb.clickUrl.startsWith("//") ? "_blank" : "_self"}
                      rel={tb.clickUrl.startsWith("http") || tb.clickUrl.startsWith("//") ? "noreferrer" : ""}
                      className="block hover:opacity-90 transition-opacity rounded-xl overflow-hidden border border-white/10 shadow-lg relative group cursor-pointer bg-brand-black"
                    >
                      <img
                        src={tb.imageUrl}
                        alt="Promotional Banner"
                        className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-102"
                        referrerPolicy="no-referrer"
                      />
                    </a>
                  ) : (
                    <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg bg-brand-black">
                      <img
                        src={tb.imageUrl}
                        alt="Promotional Banner"
                        className="w-full h-auto object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Links Stack */}
        <div className="w-full space-y-4 mb-12">
          {activeLinks.map((lnk: any, idx: number) => {
            const isExternal = lnk.url.startsWith("http") || lnk.url.startsWith("//");
            return (
              <motion.a
                key={lnk.id || idx}
                href={lnk.url}
                target={isExternal ? "_blank" : "_self"}
                rel={isExternal ? "noreferrer" : ""}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className={`group block w-full text-left p-4 rounded-xl border text-white transition-all duration-300 relative overflow-hidden backdrop-blur-sm cursor-pointer ${
                  lnk.isHighlighted 
                    ? "bg-brand-gold/10 border-brand-gold/30 hover:border-brand-gold/80 hover:bg-brand-gold/20 shadow-lg shadow-brand-gold/5" 
                    : "bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.05]"
                }`}
              >
                {/* Highlights glow animation */}
                {lnk.isHighlighted && (
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/10 to-transparent animate-pulse pointer-events-none" />
                )}

                <div className="flex items-center gap-4 relative z-10 w-full">
                  {lnk.iconUrl && (
                    <div className="w-11 h-11 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-white/5 flex items-center justify-center">
                      <img src={lnk.iconUrl} alt="link icon" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className={`text-sm sm:text-base font-serif tracking-tight leading-tight flex items-center gap-2 ${lnk.isHighlighted ? "text-brand-gold group-hover:text-white" : "text-white/90 group-hover:text-brand-gold"}`}>
                        {lnk.label}
                        {isExternal && <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0" />}
                      </h3>
                      {lnk.description && (
                        <p className="text-xs text-white/50 group-hover:text-white/70 tracking-wide mt-1.5 leading-normal font-sans">
                          {lnk.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Subtle right-hand decorative badge */}
                    {lnk.isHighlighted && (
                      <span className="hidden sm:inline-block text-[8.5px] font-mono uppercase tracking-[0.2em] bg-brand-gold/25 text-brand-gold px-2.5 py-1 rounded-full border border-brand-gold/30 font-bold whitespace-nowrap animate-pulse flex-shrink-0">
                        FEATURED
                      </span>
                    )}
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* Featured Custom Image Cards of Core Team/FND */}
        {config.images && config.images.length > 0 && (
          <div className="w-full text-left mb-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-5 text-center font-mono">
              Featured Showcases
            </h4>

            {config.showcaseLayout === "carousel" ? (
              <ShowcaseCarousel images={config.images} />
            ) : (
              <div className={`grid grid-cols-1 gap-5 ${config.showcaseLayout === "single" ? "max-w-md mx-auto" : ""}`}>
                {(config.showcaseLayout === "single" ? [config.images[0]] : config.images).map((img: any, idx: number) => {
                  const imgExternal = img.clickUrl?.startsWith("http");
                  return (
                    <motion.div
                      key={img.id || idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="group block relative rounded-2xl overflow-hidden border border-white/5 bg-brand-black transition-all duration-300 shadow-lg flex flex-col"
                    >
                      <a 
                        href={img.clickUrl || "#"}
                        target={imgExternal ? "_blank" : "_self"}
                        rel={imgExternal ? "noreferrer" : ""}
                        className="block w-full"
                      >
                        <div className="w-full bg-black/40 flex items-center justify-center">
                          <img
                            src={img.imageUrl}
                            alt={img.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-auto object-contain max-h-[500px]"
                          />
                        </div>
                      </a>

                      <div className="p-5 border-t border-white/5 bg-black/60">
                        <span className="text-[8px] font-mono uppercase text-brand-gold tracking-[0.25em] mb-1 opacity-70 group-hover:opacity-100 transition-all block">
                          {img.customLabel || "EXPLORE STORY"}
                        </span>
                        
                        <a 
                          href={img.clickUrl || "#"}
                          target={imgExternal ? "_blank" : "_self"}
                          rel={imgExternal ? "noreferrer" : ""}
                          className="block"
                        >
                          <h5 className="text-sm font-serif tracking-tight text-white group-hover:text-brand-gold transition-colors">
                            {img.title}
                          </h5>
                          {img.description && (
                            <p className="text-[11px] text-white/50 tracking-wide mt-1.5 font-sans leading-relaxed">
                              {img.description}
                            </p>
                          )}
                        </a>
                        
                        {img.ctaText && (
                          <div className="mt-4">
                            <a
                              href={img.clickUrl || "#"}
                              target={imgExternal ? "_blank" : "_self"}
                              rel={imgExternal ? "noreferrer" : ""}
                              className="inline-flex items-center gap-2 p-3 px-5 bg-brand-gold text-brand-black hover:bg-white text-[10px] font-black tracking-widest uppercase transition-all duration-300"
                            >
                              {img.ctaText}
                              <Sparkles className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Minimal Signature Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-14"
        >
          <div className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            {(() => {
              const branding = safeJsonParse(content?.brandingSettingsJson, {});
              const siteLogoUrl = branding.headerLogoUrl;
              if (siteLogoUrl && siteLogoUrl.trim() !== "") {
                return (
                  <img 
                    src={siteLogoUrl} 
                    alt="The Vagina Room Logo" 
                    className="h-10 w-auto object-contain mb-1" 
                    referrerPolicy="no-referrer"
                  />
                );
              }
              return (
                <div className="text-sm font-black tracking-widest text-[#D4AF37] uppercase mb-1">
                  THE VAGINA ROOM
                </div>
              );
            })()}
            <div className="text-[10px] font-sans tracking-[0.3em] text-white uppercase text-center font-bold">
              {renderFooterLogoText(config.footerLine1 || "The Vagina Room Global")}
            </div>
            <p className="text-[7.5px] font-mono tracking-[0.25em] text-[#D4AF37] uppercase text-center mt-0.5">
              {config.footerLine2 || "Refined Intimacy & Somatic Wholeness"}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
