import React, { useState, useEffect } from "react";
import { useContent } from "../../context/ContentContext";
import { ImageUploader } from "./ImageUploader";
import { 
  Instagram, 
  Youtube, 
  Send, 
  Linkedin, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Facebook,
  Twitter,
  Globe,
  MessageCircle,
  Music,
  Camera,
  Bookmark,
  MessageSquare,
  Image
} from "lucide-react";
import TikTokIcon from "../TikTokIcon";
import XIcon from "../XIcon";
import { motion, AnimatePresence } from "motion/react";

// Render footer text logo elegantly for live mockup style matching brand text logo perfectly and uniformly
const renderFooterLogoText = (text: string) => {
  if (!text) text = "The Vagina Room Global";
  return (
    <span className="text-white font-black tracking-widest text-[9.5px] uppercase font-sans">
      {text}
    </span>
  );
};


interface SocialItem {
  platform: string;
  url: string;
  icon: string;
}

interface LinkItem {
  id: string;
  type: string;
  label: string;
  url: string;
  description: string;
  isHighlighted: boolean;
  iconUrl?: string;
}

interface ImageItem {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  clickUrl: string;
  ctaText?: string;
  customLabel?: string;
}

interface TopBannerItem {
  id: string;
  imageUrl: string;
  clickUrl: string;
}

interface LinkTreeConfig {
  profilePicture: string;
  fullName: string;
  bio: string;
  socials: SocialItem[];
  links: LinkItem[];
  images: ImageItem[];
  topBannerEnabled?: boolean;
  topBannerUrl?: string;
  topBannerClickUrl?: string;
  topBanners?: TopBannerItem[];
  footerLine1?: string;
  footerLine2?: string;
  welcomeCtaEnabled?: boolean;
  welcomeCtaText?: string;
  welcomeCtaUrl?: string;
  showcaseLayout?: "carousel" | "list" | "single";
}

export default function AdminLinkTreePanel() {
  const { content, updateContentField, saveContentChanges } = useContent();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showcaseLayout, setShowcaseLayout] = useState<"carousel" | "list" | "single">("list");

  // Local State representing fields
  const [profilePicture, setProfilePicture] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [socials, setSocials] = useState<SocialItem[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [topBannerEnabled, setTopBannerEnabled] = useState(false);
  const [topBanners, setTopBanners] = useState<TopBannerItem[]>([]);
  const [footerLine1, setFooterLine1] = useState("");
  const [footerLine2, setFooterLine2] = useState("");
  const [welcomeCtaEnabled, setWelcomeCtaEnabled] = useState(true);
  const [welcomeCtaText, setWelcomeCtaText] = useState("Register Now");
  const [welcomeCtaUrl, setWelcomeCtaUrl] = useState("/join-community");

  // Hydrate local state from current Firestore Content Config
  useEffect(() => {
    if (content?.linkTreeConfigJson) {
      try {
        const parsed: LinkTreeConfig = JSON.parse(content.linkTreeConfigJson);
        setProfilePicture(parsed.profilePicture || "");
        setFullName(parsed.fullName || "");
        setBio(parsed.bio || "");
        setSocials(parsed.socials || []);
        setLinks(parsed.links || []);
        setImages(parsed.images || []);
        setTopBannerEnabled(parsed.topBannerEnabled ?? false);
        
        let initialBanners = parsed.topBanners || [];
        if (initialBanners.length === 0 && (parsed.topBannerUrl || parsed.topBannerClickUrl)) {
          initialBanners.push({
            id: "tb-migrated",
            imageUrl: parsed.topBannerUrl || "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=1200",
            clickUrl: parsed.topBannerClickUrl || ""
          });
        }
        setTopBanners(initialBanners);

        setFooterLine1(parsed.footerLine1 || "The Vagina Room Global");
        setFooterLine2(parsed.footerLine2 || "Refined Intimacy & Somatic Wholeness");
        setWelcomeCtaEnabled(parsed.welcomeCtaEnabled !== false);
        setWelcomeCtaText(parsed.welcomeCtaText || "Register Now");
        setWelcomeCtaUrl(parsed.welcomeCtaUrl || "/join-community");
        setShowcaseLayout(parsed.showcaseLayout || "list");
      } catch (e) {
        console.error("Failed to parse linkTreeConfigJson", e);
      }
    }
  }, [content?.linkTreeConfigJson]);

  // Helper inside panel to generate unique IDs
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Socials action
  const handleUpdateSocial = (index: number, field: keyof SocialItem, value: string) => {
    const updated = [...socials];
    updated[index] = { ...updated[index], [field]: value };
    setSocials(updated);
  };

  const handleAddSocial = (platform: string, icon: string) => {
    if (socials.some(s => s.platform.toLowerCase() === platform.toLowerCase())) return;
    setSocials([...socials, { platform, url: "", icon }]);
  };

  const handleRemoveSocial = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index));
  };

  // Links action
  const handleAddLink = () => {
    const newLnk: LinkItem = {
      id: "l_" + generateId(),
      type: "cta",
      label: "New CTA Button Link",
      url: "/join-community",
      description: "",
      isHighlighted: false
    };
    setLinks([...links, newLnk]);
  };

  const handleUpdateLink = (index: number, field: keyof LinkItem, value: any) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleMoveLink = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === links.length - 1) return;
    const updated = [...links];
    const item = updated[index];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    updated[index] = updated[targetIdx];
    updated[targetIdx] = item;
    setLinks(updated);
  };

  // Images Card action
  const handleAddImage = () => {
    const newImg: ImageItem = {
      id: "img_" + generateId(),
      imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800",
      title: "New Featured Showcase",
      description: "Brief summary about this featured event or highlight.",
      clickUrl: "/about"
    };
    setImages([...images, newImg]);
  };

  const handleUpdateImage = (index: number, field: keyof ImageItem, value: string) => {
    const updated = [...images];
    updated[index] = { ...updated[index], [field]: value };
    setImages(updated);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleMoveImage = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === images.length - 1) return;
    const updated = [...images];
    const item = updated[index];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    updated[index] = updated[targetIdx];
    updated[targetIdx] = item;
    setImages(updated);
  };

  const handleAddTopBanner = () => {
    const newBanner: TopBannerItem = {
      id: "tb-" + generateId(),
      imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=1200",
      clickUrl: ""
    };
    setTopBanners([...topBanners, newBanner]);
  };

  const handleUpdateTopBanner = (index: number, field: keyof TopBannerItem, val: string) => {
    const updated = [...topBanners];
    updated[index] = { ...updated[index], [field]: val };
    setTopBanners(updated);
  };

  const handleRemoveTopBanner = (index: number) => {
    setTopBanners(topBanners.filter((_, i) => i !== index));
  };

  const handleMoveTopBanner = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === topBanners.length - 1) return;
    const updated = [...topBanners];
    const item = updated[index];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    updated[index] = updated[targetIdx];
    updated[targetIdx] = item;
    setTopBanners(updated);
  };

  // Save Link Tree config back to Firebase
  const handleSaveConfig = async () => {
    setSaveStatus("saving");
    setErrorMessage("");

    const configToSave: LinkTreeConfig = {
      profilePicture,
      fullName,
      bio,
      socials,
      links,
      images,
      topBannerEnabled,
      topBannerUrl: topBanners[0]?.imageUrl || "",
      topBannerClickUrl: topBanners[0]?.clickUrl || "",
      topBanners,
      footerLine1,
      footerLine2,
      welcomeCtaEnabled,
      welcomeCtaText,
      welcomeCtaUrl,
      showcaseLayout
    };

    const jsonString = JSON.stringify(configToSave, null, 2);

    try {
      updateContentField("linkTreeConfigJson", jsonString);
      const res = await saveContentChanges({ linkTreeConfigJson: jsonString });
      if (res.success) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setErrorMessage(res.message || "Could not save database changes.");
      }
    } catch (err: any) {
      setSaveStatus("error");
      setErrorMessage(err?.message || "Unexpected save error.");
    }
  };

  return (
    <div className="space-y-8 bg-white/[0.02] border border-white/5 p-6 rounded-none">
      {/* Panel description & info header */}
      <div className="flex justify-between items-start md:items-center gap-4 flex-col md:flex-row pb-6 border-b border-white/5">
        <div>
          <h3 className="text-lg font-black uppercase tracking-wider text-brand-gold flex items-center gap-2">
            <span>🔗</span> public link tree portal ("/connect")
          </h3>
          <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">
            Build and optimize her professional links with no default wrap headers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/connect"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
          >
            Preview Site <ExternalLink size={11} className="text-brand-gold" />
          </a>
          <button
            onClick={handleSaveConfig}
            disabled={saveStatus === "saving"}
            className="px-5 py-2.5 bg-brand-gold hover:bg-white text-brand-black font-black tracking-widest text-[9.5px] uppercase transition-all duration-300 shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save size={13} />
            {saveStatus === "saving" ? "Saving Profile..." : "Commit Builder State"}
          </button>
        </div>
      </div>

      {/* Save Alerts */}
      <AnimatePresence>
        {saveStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 uppercase tracking-wider font-mono font-bold"
          >
            <CheckCircle2 size={16} /> Link Tree configurations have been synchronized globally!
          </motion.div>
        )}
        {saveStatus === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs uppercase tracking-wider font-mono font-bold"
          >
            ⚠️ {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left/Middle Column - Interactive Configuration Form */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* PROFILE IDENTITY MODULE */}
          <div className="border border-white/5 bg-black/20 p-5 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-gold flex items-center gap-1">
              <Sparkles size={13} /> 1. Bio & profile branding
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-3">
                <label className="text-[10px] uppercase font-black tracking-wider text-white/50 block">Profile Picture</label>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded flex flex-col items-center">
                  {profilePicture ? (
                    <div className="w-20 h-20 rounded-full overflow-hidden border border-brand-gold/40 mb-3 shadow">
                      <img src={profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-dashed border-white/10 mb-3 flex items-center justify-center text-[10px] text-white/30 text-center">No Image</div>
                  )}
                  <ImageUploader 
                    fieldKey="linkTreeConfigJson" 
                    label="Change Photo" 
                    currentValue={profilePicture}
                    onUploadSuccess={(url) => setProfilePicture(url)}
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-white/50 block">Full Display Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                    placeholder="e.g. Dr. FID Awoyemi"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-white/50 block">Short Bio summary</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full bg-brand-black border border-white/10 p-3 text-xs text-white focus:border-brand-gold focus:outline-none resize-none"
                    placeholder="Describe her focus areas, credentials or callings..."
                  />
                </div>

                {/* Highlighted Customizable CTA Button */}
                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center bg-black/40 p-3 border border-white/5">
                    <div>
                      <p className="text-[10px] font-black uppercase text-white">Enable Core Hub CTA Button</p>
                      <p className="text-[8px] text-white/30 uppercase tracking-tighter">Add a prominent, high-conversion action button (e.g., Register Now) near the top of the hub</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWelcomeCtaEnabled(!welcomeCtaEnabled)}
                      className={`w-10 h-5 relative rounded-full transition-colors ${welcomeCtaEnabled ? 'bg-brand-gold' : 'bg-white/10'}`}
                      id="toggle_welcome_cta_btn"
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${welcomeCtaEnabled ? 'right-1' : 'left-0.5'}`} />
                    </button>
                  </div>

                  {welcomeCtaEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/50 block">CTA Button Text</label>
                        <input
                          type="text"
                          value={welcomeCtaText}
                          onChange={(e) => setWelcomeCtaText(e.target.value)}
                          className="w-full bg-brand-black border border-white/10 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                          placeholder="e.g. Register Now"
                          id="welcome_cta_text_input"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-white/50 block">CTA Redirect URL / Path</label>
                        <input
                          type="text"
                          value={welcomeCtaUrl}
                          onChange={(e) => setWelcomeCtaUrl(e.target.value)}
                          className="w-full bg-brand-black border border-white/10 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                          placeholder="e.g. /join-community"
                          id="welcome_cta_url_input"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PROMOTIONAL LANDSCAPE BANNER MODULE */}
          <div className="border border-white/5 bg-black/20 p-5 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-white/5 font-sans">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-gold flex items-center gap-1.5">
                  🖼️ 1b. Featured Landscape Banners (Above CTA Buttons) ({topBanners.length})
                </h4>
                <p className="text-[8px] text-white/30 uppercase tracking-wider mt-0.5">Add, reorder, and configure multiple promo/story banners</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={topBannerEnabled}
                    onChange={(e) => setTopBannerEnabled(e.target.checked)}
                    className="rounded bg-brand-black border-white/10 text-brand-gold focus:ring-brand-gold/40"
                  />
                  <span className="text-[10px] uppercase font-black tracking-wider text-white/70">Enable Banners</span>
                </label>
                {topBannerEnabled && (
                  <button
                    type="button"
                    onClick={handleAddTopBanner}
                    className="px-2.5 py-1 bg-brand-gold hover:bg-white text-brand-black font-black text-[9px] uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus size={10} /> Add Banner
                  </button>
                )}
              </div>
            </div>

            {topBannerEnabled && (
              <div className="space-y-5">
                {topBanners.length === 0 ? (
                  <p className="text-[11px] text-white/40 italic py-2 font-mono">No promotional banners loaded. Click "Add Banner" to upload promo images.</p>
                ) : (
                  topBanners.map((tb, idx) => (
                    <div key={tb.id} className="bg-brand-black/40 border border-white/5 p-4 space-y-3 font-sans">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono font-bold text-white/30 uppercase bg-white/5 px-2 py-0.5 rounded">
                          Banner Image #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button; button"
                            onClick={() => handleMoveTopBanner(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 px-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-white/60 transition-colors"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveTopBanner(idx, "down")}
                            disabled={idx === topBanners.length - 1}
                            className="p-1 px-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-white/60 transition-colors"
                          >
                            <ChevronDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveTopBanner(idx)}
                            className="text-white/40 hover:text-brand-red p-1 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1 space-y-2">
                          <label className="text-[9px] uppercase font-bold text-white/40 block">Landscape Asset</label>
                          <div className="p-2 border border-white/10 bg-black/50 rounded flex flex-col items-center">
                            <div className="w-full aspect-[21/9] rounded overflow-hidden mb-2 bg-white/5 border border-white/5">
                              <img src={tb.imageUrl} alt={`Banner ${idx}`} className="w-full h-full object-cover" />
                            </div>
                            <ImageUploader 
                              fieldKey="linkTreeConfigJson" 
                              label="Change Image"
                              currentValue={tb.imageUrl}
                              onUploadSuccess={(url) => handleUpdateTopBanner(idx, "imageUrl", url)}
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2 space-y-3 justify-center flex flex-col">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-white/40 tracking-wider block">Click Redirect Route / URL</label>
                            <input
                              type="text"
                              value={tb.clickUrl}
                              onChange={(e) => handleUpdateTopBanner(idx, "clickUrl", e.target.value)}
                              className="w-full bg-brand-black border border-white/10 p-2.5 text-xs text-white focus:border-brand-gold focus:outline-none"
                              placeholder="e.g. /join-community or https://..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* SOCIAL ACCOUNTS DIRECTORY */}
          <div className="border border-white/5 bg-black/20 p-5 space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-gold flex items-center gap-1">
                🌐 2. Social Media Shortcuts
              </h4>
              <div className="flex flex-wrap gap-2">
                {["Instagram", "Youtube", "Telegram", "LinkedIn", "TikTok", "Facebook", "Twitter", "WhatsApp", "Threads", "Snapchat", "Pinterest", "Website"].map((platform) => {
                  const hasIcon = socials.some(s => s.platform.toLowerCase() === platform.toLowerCase());
                  
                  let iconName = platform;
                  if (platform === "Telegram") iconName = "Send";
                  if (platform === "TikTok") iconName = "Tiktok";
                  if (platform === "Twitter" || platform === "X") iconName = "XIcon";
                  if (platform === "WhatsApp") iconName = "MessageCircle";
                  if (platform === "Threads") iconName = "MessageSquare";
                  if (platform === "Snapchat") iconName = "Camera";
                  if (platform === "Pinterest") iconName = "Bookmark";
                  if (platform === "Website") iconName = "Globe";

                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => handleAddSocial(platform, iconName)}
                      disabled={hasIcon}
                      className="px-2 py-1 bg-white/5 hover:bg-brand-gold/10 hover:text-brand-gold transition-colors text-[9px] uppercase tracking-wider rounded border border-white/5 disabled:opacity-40"
                    >
                      + {platform}
                    </button>
                  );
                })}
              </div>
            </div>

            {socials.length === 0 ? (
              <p className="text-[11px] text-white/40 italic py-2">No social shortcuts included yet. Click on prompt shortcuts above to add links.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {socials.map((soc, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-brand-black p-3 border border-white/5 font-sans">
                    <span className="text-brand-gold p-1 bg-white/5 rounded">
                      {soc.platform.toLowerCase() === "instagram" && <Instagram size={14} />}
                      {soc.platform.toLowerCase() === "youtube" && <Youtube size={14} />}
                      {soc.platform.toLowerCase() === "telegram" && <Send size={14} />}
                      {soc.platform.toLowerCase() === "linkedin" && <Linkedin size={14} />}
                      {soc.platform.toLowerCase() === "facebook" && <Facebook size={14} />}
                      {(soc.platform.toLowerCase() === "twitter" || soc.platform.toLowerCase() === "x") && <XIcon size={14} />}
                      {soc.platform.toLowerCase() === "tiktok" && <TikTokIcon size={14} />}
                      {soc.platform.toLowerCase() === "whatsapp" && <MessageCircle size={14} />}
                      {soc.platform.toLowerCase() === "threads" && <MessageSquare size={14} />}
                      {soc.platform.toLowerCase() === "snapchat" && <Camera size={14} />}
                      {soc.platform.toLowerCase() === "pinterest" && <Bookmark size={14} />}
                      {(soc.platform.toLowerCase() === "website" || soc.platform.toLowerCase() === "globe") && <Globe size={14} />}
                    </span>
                    <div className="flex-1 space-y-1">
                      <span className="text-[8.5px] uppercase font-black text-white/40 block leading-none">{soc.platform}</span>
                      <input
                        type="text"
                        value={soc.url}
                        onChange={(e) => handleUpdateSocial(idx, "url", e.target.value)}
                        className="w-full bg-transparent border-0 text-[11px] text-white focus:outline-none p-0 focus:ring-0 placeholder:text-white/20"
                        placeholder={soc.platform.toLowerCase() === "website" ? "https://yourwebsite.com" : `https://${soc.platform.toLowerCase()}.com/...`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSocial(idx)}
                      className="text-white/40 hover:text-brand-red p-1 transition-colors"
                      title="Delete profile handle"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CUSTOM CTA LINKS INTERACTIVE FLOW */}
          <div className="border border-white/5 bg-black/20 p-5 space-y-5">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-gold flex items-center gap-1.5">
                  🔗 3. Custom Call-To-Action buttons ({links.length})
                </h4>
                <p className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">Custom link buttons representing high priorities.</p>
              </div>
              <button
                type="button"
                onClick={handleAddLink}
                className="px-3 py-1.5 bg-brand-gold hover:bg-white text-brand-black font-black text-[9px] uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus size={11} /> Add New Link
              </button>
            </div>

            {links.length === 0 ? (
              <div className="text-center py-8 text-white/30 border border-dashed border-white/5">
                <p className="text-xs italic mb-2">No links created yet.</p>
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase font-black tracking-widest border border-white/10"
                >
                  Create First Link
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {links.map((lnk, idx) => (
                  <div 
                    key={lnk.id} 
                    className={`bg-brand-black/40 border p-4 space-y-3 transition-colors ${
                      lnk.isHighlighted ? "border-brand-gold/30 bg-brand-gold/[0.02]" : "border-white/5"
                    }`}
                  >
                    {/* Header bar within item */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold text-white/30 uppercase bg-white/5 px-2 py-0.5 rounded">
                          Link #{idx + 1}
                        </span>
                        
                        {/* Highlight Toggle Switch */}
                        <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={lnk.isHighlighted}
                            onChange={(e) => handleUpdateLink(idx, "isHighlighted", e.target.checked)}
                            className="rounded bg-black border-white/10 text-brand-gold focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                          />
                          <span className="text-[9px] uppercase font-black tracking-wider text-brand-gold/80">Highlight Widget</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMoveLink(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 px-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-white/60 transition-colors"
                          title="Move rank up"
                        >
                          <ChevronUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveLink(idx, "down")}
                          disabled={idx === links.length - 1}
                          className="p-1 px-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-white/60 transition-colors"
                          title="Move rank down"
                        >
                          <ChevronDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(idx)}
                          className="p-1 text-white/40 hover:text-brand-red hover:bg-brand-red/10 rounded transition-colors"
                          title="Delete row"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Editor Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
                      {/* Left side upload of image icon */}
                      <div className="space-y-1 md:col-span-1 border border-white/5 bg-black/30 p-3 rounded flex flex-col items-center justify-center">
                        <label className="text-[9px] uppercase font-bold text-white/50 block text-center mb-1">Image Icon (Left side)</label>
                        {lnk.iconUrl ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-brand-gold/20 mb-2 relative group bg-white/5 flex items-center justify-center flex-shrink-0">
                            <img src={lnk.iconUrl} alt="icon" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleUpdateLink(idx, "iconUrl", "")}
                              className="absolute inset-0 bg-black/85 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-brand-red uppercase font-black tracking-widest cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg border border-dashed border-white/10 mb-2 flex items-center justify-center text-[8px] text-white/20 uppercase tracking-widest text-center select-none flex-shrink-0">
                            No Icon
                          </div>
                        )}
                        <ImageUploader 
                          fieldKey="linkTreeConfigJson"
                          label={lnk.iconUrl ? "Replace" : "Upload Icon"}
                          currentValue={lnk.iconUrl || ""}
                          onUploadSuccess={(url) => handleUpdateLink(idx, "iconUrl", url)}
                        />
                      </div>

                      {/* Right side fields */}
                      <div className="md:col-span-2 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-white/50 block">Button Plain Text Label</label>
                            <input
                              type="text"
                              value={lnk.label}
                              onChange={(e) => handleUpdateLink(idx, "label", e.target.value)}
                              className="w-full bg-brand-black border border-white/5 p-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                              placeholder="e.g. Join the Community"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-white/50 block">Click Redirect Route (URL)</label>
                            <input
                              type="text"
                              value={lnk.url}
                              onChange={(e) => handleUpdateLink(idx, "url", e.target.value)}
                              className="w-full bg-brand-black border border-white/5 p-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                              placeholder="e.g. /join-community or https://..."
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-white/50 block">Short Helper Subtext (Optional description below name)</label>
                          <input
                            type="text"
                            value={lnk.description}
                            onChange={(e) => handleUpdateLink(idx, "description", e.target.value)}
                            className="w-full bg-brand-black border border-white/5 p-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                            placeholder="Brief sentence to summarize benefits..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FEATURED CARDS SHOWCASE (IMAGES & STORY) */}
          <div className="border border-white/5 bg-black/20 p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-3 gap-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-gold flex items-center gap-1.5">
                  🖼️ 4. Featured Showcases with media cards ({images.length})
                </h4>
                <p className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">Customize her visual showcase stories, layout behavior, and call-to-actions.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1.5 border border-white/5">
                  <span className="text-[9px] text-white/40 font-bold uppercase whitespace-nowrap">Layout Style:</span>
                  <select
                    value={showcaseLayout}
                    onChange={(e) => setShowcaseLayout(e.target.value as any)}
                    className="bg-brand-black border border-white/10 text-[10px] text-brand-gold font-bold p-1 px-2 uppercase outline-none focus:border-brand-gold"
                  >
                    <option value="list">Stacked List</option>
                    <option value="carousel">Carousel / Slider</option>
                    <option value="single">Single Featured Card</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-3 py-1.5 bg-brand-gold hover:bg-white text-brand-black font-black text-[9px] uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus size={11} /> Add Featured Banner
                </button>
              </div>
            </div>

            {images.length === 0 ? (
              <p className="text-[11px] text-white/40 italic py-2">No showcase banners loaded. Banners are excellent for sharing her spa retreats, about, or blog stories.</p>
            ) : (
              <div className="space-y-5">
                {images.map((img, idx) => (
                  <div key={img.id} className="bg-brand-black/40 border border-white/5 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono font-bold text-white/30 uppercase bg-white/5 px-2 py-0.5 rounded">
                        Media Card #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 px-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-white/60 transition-colors"
                        >
                          <ChevronUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, "down")}
                          disabled={idx === images.length - 1}
                          className="p-1 px-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-white/60 transition-colors"
                        >
                          <ChevronDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="text-white/40 hover:text-brand-red p-1 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Left: Upload image specific for this card */}
                      <div className="md:col-span-1 space-y-2">
                        <label className="text-[9px] uppercase font-bold text-white/50 block">Banner Thumbnail</label>
                        <div className="p-2 border border-white/10 bg-black/50 rounded flex flex-col items-center">
                          <div className="w-full aspect-[21/9] rounded overflow-hidden mb-2 bg-white/5">
                            <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                          </div>
                          <ImageUploader 
                            fieldKey="linkTreeConfigJson"
                            label="Replace Banner"
                            currentValue={img.imageUrl}
                            onUploadSuccess={(url) => handleUpdateImage(idx, "imageUrl", url)}
                          />
                        </div>
                      </div>

                      {/* Right: metadata fields */}
                      <div className="md:col-span-2 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-white/50 block">Banner Headline</label>
                            <input
                              type="text"
                              value={img.title}
                              onChange={(e) => handleUpdateImage(idx, "title", e.target.value)}
                              className="w-full bg-brand-black border border-white/5 p-2 text-xs text-white focus:outline-none"
                              placeholder="e.g. My Healing Foundation"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-white/50 block">Listing Label</label>
                            <input
                              type="text"
                              value={img.customLabel || "EXPLORE STORY"}
                              onChange={(e) => handleUpdateImage(idx, "customLabel", e.target.value)}
                              className="w-full bg-brand-black border border-white/5 p-2 text-xs text-white focus:outline-none"
                              placeholder="e.g. EXPLORE STORY"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-white/50 block">CTA Button Text</label>
                            <input
                              type="text"
                              value={img.ctaText || ""}
                              onChange={(e) => handleUpdateImage(idx, "ctaText", e.target.value)}
                              className="w-full bg-brand-black border border-white/5 p-2 text-xs text-white focus:outline-none"
                              placeholder="e.g. Register Now"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-white/50 block">Redirect URL (Redirect on Card / CTA Click)</label>
                          <input
                            type="text"
                            value={img.clickUrl}
                            onChange={(e) => handleUpdateImage(idx, "clickUrl", e.target.value)}
                            className="w-full bg-brand-black border border-white/5 p-2 text-xs text-white focus:outline-none"
                            placeholder="e.g. /about or /dr-fid"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-white/50 block">Description (Expands/fades in on card hover)</label>
                          <textarea
                            value={img.description}
                            onChange={(e) => handleUpdateImage(idx, "description", e.target.value)}
                            rows={2}
                            className="w-full bg-brand-black border border-white/5 p-2 text-xs text-white focus:outline-none resize-none"
                            placeholder="Provide deep details or a message for context..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LINK TREE FOOTER BRANDING CUSTOMIZER */}
          <div className="border border-white/5 bg-black/20 p-5 space-y-5">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-gold flex items-center gap-1.5">
                🌸 5. Custom Link Tree Footer Branding
              </h4>
              <p className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">Customize the display signatures rendered at the very bottom of your Link Tree page.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-wider text-white/50 block">Footer Text (Line 1)</label>
                <input
                  type="text"
                  value={footerLine1}
                  onChange={(e) => setFooterLine1(e.target.value)}
                  className="w-full bg-brand-black border border-white/10 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                  placeholder="e.g. The Vagina Room Global"
                />
                <p className="text-[8.5px] text-white/30 uppercase tracking-widest leading-normal">
                  Typically used for company name or licensing text.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-wider text-white/50 block">Footer Text (Line 2 / Subtext)</label>
                <input
                  type="text"
                  value={footerLine2}
                  onChange={(e) => setFooterLine2(e.target.value)}
                  className="w-full bg-brand-black border border-white/10 p-3 text-xs text-white focus:border-brand-gold focus:outline-none"
                  placeholder="e.g. Refined Intimacy & Somatic Wholeness"
                />
                <p className="text-[8.5px] text-white/30 uppercase tracking-widest leading-normal">
                  Slogan or professional focus summary line displayed in brand gold.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Live Mockup Preview Area */}
        <div className="xl:col-span-1">
          <div className="sticky top-40 bg-black/60 border border-white/5 p-4 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-w-[340px] mx-auto min-h-[600px]">
            {/* Phone device bezel top speaker bar */}
            <div className="w-24 h-4 bg-[#111] rounded-full mx-auto mb-6 flex items-center justify-center border border-white/5 select-none">
              <span className="w-6 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Simulated iframe scroll wrapper */}
            <div className="flex-1 overflow-y-auto max-h-[520px] scrollbar-none space-y-4 px-2 relative z-10 flex flex-col items-center text-center">
              
              {/* Profile pic */}
              <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-brand-gold via-white/10 to-brand-gold/30 shadow overflow-hidden mt-2">
                <img src={profilePicture || "https://placehold.co/150"} alt="preview avatar" className="w-full h-full object-cover rounded-full" />
              </div>

              {/* Title & Bio */}
              <div>
                <h5 className="text-[14px] font-serif font-bold text-white">{fullName || "Unnamed Profile"}</h5>
                <p className="text-[9.5px] text-white/40 mt-1.5 leading-normal max-w-[240px] block line-clamp-3">
                  {bio || "Your short bio paragraph summary is represented here..."}
                </p>
              </div>

              {/* Social row */}
              <div className="flex flex-wrap justify-center items-center gap-2 py-1 max-w-[280px]">
                {socials.map((s, i) => (
                  <span key={i} className="text-white/40 text-[10px] p-1.5 bg-white/5 rounded-full block" title={s.platform}>
                    {s.platform.toLowerCase() === "instagram" && <Instagram size={11} />}
                    {s.platform.toLowerCase() === "youtube" && <Youtube size={11} />}
                    {s.platform.toLowerCase() === "telegram" && <Send size={11} />}
                    {s.platform.toLowerCase() === "linkedin" && <Linkedin size={11} />}
                    {s.platform.toLowerCase() === "facebook" && <Facebook size={11} />}
                    {(s.platform.toLowerCase() === "twitter" || s.platform.toLowerCase() === "x") && <XIcon size={11} />}
                    {s.platform.toLowerCase() === "tiktok" && <TikTokIcon size={11} />}
                    {s.platform.toLowerCase() === "whatsapp" && <MessageCircle size={11} />}
                    {s.platform.toLowerCase() === "threads" && <MessageSquare size={11} />}
                    {s.platform.toLowerCase() === "snapchat" && <Camera size={11} />}
                    {s.platform.toLowerCase() === "pinterest" && <Bookmark size={11} />}
                    {(s.platform.toLowerCase() === "website" || s.platform.toLowerCase() === "globe") && <Globe size={11} />}
                  </span>
                ))}
              </div>

              {/* Real-time Custom CTA button in phone mockup preview - REMOVED TO MIRROR FRONTEND */}

              {/* Top landscape banner preview in phone mockup */}
              {topBannerEnabled && topBanners.length > 0 && (
                <div className="w-full mt-2 space-y-2 animate-fadeIn">
                  {topBanners.map((tb, idx) => (
                    <div key={tb.id || idx} className="rounded-lg overflow-hidden border border-white/5 shadow relative bg-brand-black/50">
                      <img src={tb.imageUrl} alt={`Banner Preview ${idx}`} className="w-full h-auto object-contain" />
                    </div>
                  ))}
                </div>
              )}

              {/* CTA links */}
              <div className="w-full space-y-2 pt-2">
                {links.map((lnk, idx) => (
                  <div 
                    key={lnk.id || idx} 
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 relative overflow-hidden select-none ${
                      lnk.isHighlighted 
                        ? "bg-brand-gold/10 border-brand-gold/20" 
                        : "bg-white/[0.01] border-white/5"
                    }`}
                  >
                    {lnk.iconUrl && (
                      <img src={lnk.iconUrl} alt="icon" className="w-7 h-7 rounded object-cover flex-shrink-0 border border-white/10" referrerPolicy="no-referrer" />
                    )}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between items-center relative z-10 gap-2">
                        <span className={`text-[10px] font-serif font-black tracking-tight truncate ${lnk.isHighlighted ? 'text-brand-gold' : 'text-white/80'}`}>
                          {lnk.label || "Untitled Link"}
                        </span>
                        <ExternalLink size={8} className="text-white/30 flex-shrink-0" />
                      </div>
                      {lnk.description && (
                        <span className="text-[8px] text-white/40 block mt-1 leading-normal font-sans line-clamp-1 truncate">
                          {lnk.description}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Image banner previews */}
              {images.length > 0 && (
                <div className="w-full text-left pt-4">
                  <span className="text-[8px] font-mono tracking-widest uppercase text-white/30 block mb-2 text-center">Preview Showcases</span>
                  <div className="space-y-3">
                    {images.map((img, i) => (
                      <div key={img.id || i} className="rounded-lg overflow-hidden border border-white/5 bg-brand-black flex flex-col text-left">
                        <div className="w-full bg-black/40 flex items-center justify-center">
                          <img src={img.imageUrl} alt={img.title} className="w-full h-auto object-contain max-h-[160px]" />
                        </div>
                        <div className="p-2 bg-black/60 border-t border-white/5">
                          <span className="text-[6px] font-mono text-brand-gold uppercase tracking-wider block">Featured story</span>
                          <span className="text-[9px] font-serif font-bold text-white block truncate">{img.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* simulated signature */}
              <div className="pt-6 pb-2 opacity-50 select-none flex flex-col items-center gap-1">
                {(() => {
                  let branding: any = {};
                  try {
                    branding = JSON.parse(content?.brandingSettingsJson || "{}");
                  } catch (e) {}
                  const siteLogoUrl = branding.headerLogoUrl;
                  if (siteLogoUrl && siteLogoUrl.trim() !== "") {
                    return (
                      <img 
                        src={siteLogoUrl} 
                        alt="The Vagina Room Logo" 
                        className="h-7 w-auto object-contain mb-0.5" 
                        referrerPolicy="no-referrer"
                      />
                    );
                  }
                  return (
                    <div className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase">
                      THE VAGINA ROOM
                    </div>
                  );
                })()}
                <div className="text-[8.5px] font-sans tracking-[0.2em] text-white uppercase block font-bold">
                  {renderFooterLogoText(footerLine1 || "The Vagina Room Global")}
                </div>
                {footerLine2 && (
                  <span className="text-[6.5px] font-mono tracking-[0.15em] text-brand-gold uppercase block mt-0.5">
                    {footerLine2}
                  </span>
                )}
              </div>

            </div>

            {/* Glowing neon aura lines on bezel for cool tech-aesthetic */}
            <div className="absolute inset-0 border border-white/5 rounded-3xl pointer-events-none" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/20 rounded-full select-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
