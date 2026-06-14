import React, { useState } from "react";
import { useContent } from "../../context/ContentContext";
import { Eye, EyeOff, Save, CheckCircle2, ShieldAlert, ArrowLeft, Search, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StaticPageItem {
  path: string;
  name: string;
  category: "Core" | "Dr FID" | "Store" | "Community" | "Info & Legal";
  desc: string;
}

const STATIC_PAGES: StaticPageItem[] = [
  { path: "/", name: "Home Page", category: "Core", desc: "The primary entry portal of The Vagina Room sanctuary." },
  { path: "/about", name: "About Us Page", category: "Core", desc: "Our detailed mission, vision, and foundational pillars." },
  { path: "/focus-areas", name: "Focus Areas", category: "Core", desc: "Biological & therapeutic modalities (clinical naturo-gynecology)." },
  { path: "/dr-fid", name: "Meet Dr. FID", category: "Dr FID", desc: "Biography and administrative healthcare expertise of Dr. FID." },
  { path: "/dr-fid-booking", name: "Book Dr. FID Session", category: "Dr FID", desc: "Client scheduler for private holistic consultations & corporate panels." },
  { path: "/team", name: "Meet Our Team", category: "Core", desc: "Our collective of holistic wellness mentors and experts." },
  { path: "/projects", name: "Projects Page", category: "Community", desc: "Our ongoing programs, health awareness initiatives, and global impact." },
  { path: "/events", name: "Events Page", category: "Community", desc: "Interactive physical & digital retreat calendar." },
  { path: "/gallery", name: "Gallery Page", category: "Community", desc: "Visual catalog representing actual sanctuary operations and retreats." },
  { path: "/products", name: "Products Page (Shop)", category: "Store", desc: "Phyto-medicinal intimate care formulations & therapeutic tools." },
  { path: "/checkout", name: "Checkout & Cart Gate", category: "Store", desc: "Transaction billing fields, delivery options, and payment gateway." },
  { path: "/affiliate-program", name: "Affiliate Program", category: "Community", desc: "Collaborator program where partners earn commission for sharing products." },
  { path: "/telegram", name: "Telegram Free Community", category: "Community", desc: "Free sisterhood landing portal channeling users to Telegram circles." },
  { path: "/blogs", name: "Blogs & Gazette", category: "Community", desc: "Clinical and therapeutic articles (Know Your Vagina Gazette)." },
  { path: "/support", name: "Support Our Mission", category: "Core", desc: "Financial contributions and sponsorship intake form options." },
  { path: "/partner", name: "Partner With Us", category: "Core", desc: "Corporate collaboration, sponsor alignments, and clinical training inquiry." },
  { path: "/contact", name: "Contact Us", category: "Core", desc: "Direct feedback, client support channels, and address maps." },
  { path: "/privacy-policy", name: "Privacy Policy", category: "Info & Legal", desc: "Our privacy assurances, safety standards, and cookies declaration." },
  { path: "/terms-of-service", name: "Terms of Engagement", category: "Info & Legal", desc: "Holistic care user agreements, terms of service and legal framework." }
];

export default function PageVisibilityPanel() {
  const { content, updateContentField, saveContentChanges } = useContent();
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [previewMode, setPreviewMode] = useState(false);

  // Parse disabledPages from generalSettings
  const getDisabledMap = (): Record<string, boolean> => {
    try {
      if (content.disabledPagesJson) {
        return JSON.parse(content.disabledPagesJson);
      }
    } catch (e) {}
    return {};
  };

  const [disabledMap, setDisabledMap] = useState<Record<string, boolean>>(getDisabledMap());

  const handleToggle = async (path: string) => {
    // 1. Calculate next state
    const nextDisabledMap = { ...disabledMap };
    if (nextDisabledMap[path]) {
      delete nextDisabledMap[path]; // Page is enabled again
    } else {
      nextDisabledMap[path] = true; // Page is disabled
    }
    
    // 2. Update local state for immediate UI feedback
    setDisabledMap(nextDisabledMap);

    // 3. Persist immediately
    setSaving(true);
    setSaveStatus("idle");
    try {
      const jsonStr = JSON.stringify(nextDisabledMap);
      updateContentField("disabledPagesJson", jsonStr);
      const res = await saveContentChanges({ disabledPagesJson: jsonStr });
      
      if (res.success) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      console.error("Failed to persist toggle", err);
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const jsonStr = JSON.stringify(disabledMap);
      updateContentField("disabledPagesJson", jsonStr);
      
      const res = await saveContentChanges({ disabledPagesJson: jsonStr });
      if (res.success) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
      setSaving(false);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setSaving(false);
    }
  };

  const filteredPages = STATIC_PAGES.filter((page) => {
    const matchesSearch = page.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          page.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || page.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Core", "Dr FID", "Store", "Community", "Info & Legal"];

  const disabledCount = Object.keys(disabledMap).length;

  if (previewMode) {
    return (
      <div className="bg-neutral-950 p-6 rounded-xl border border-white/10 min-h-[500px]">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-brand-gold animate-pulse" />
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Guest Offline Screen Mockup</h3>
          </div>
          <button
            onClick={() => setPreviewMode(false)}
            className="h-9 px-4 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/70 hover:bg-white/5 flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Console</span>
          </button>
        </div>

        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-6 text-center max-w-md mx-auto">
          Below is a pixel-perfect preview of what guests and search engine bots see when navigating to any deactivated page.
        </p>

        {/* Scaled-down mock of Offline Page */}
        <div className="border border-white/10 rounded-xl overflow-hidden shadow-2xl bg-brand-black p-10 text-center relative max-w-lg mx-auto">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-gold/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10">
            <span className="text-xl">🌸</span>
            <h1 className="text-[9px] font-black uppercase tracking-[0.3em] mt-1 text-brand-gold">
              The Vagina Room
            </h1>

            <div className="w-12 h-12 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mx-auto mt-8 mb-4 text-brand-gold">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-serif text-white tracking-tight mb-2">
              Sacred Re-centering
            </h2>

            <p className="text-[10px] text-white/50 tracking-wider mb-6 max-w-sm mx-auto uppercase">
              This sanctuary space is currently undergoing re-preservation or spiritual alignment by Dr. FID and the custodians. Please explore other open rooms or check back soon.
            </p>

            <div className="flex gap-2 max-w-[240px] mx-auto">
              <div className="flex-1 h-9 bg-white/5 border border-white/10 text-white rounded text-[9px] font-bold uppercase tracking-widest flex items-center justify-center">
                Go Home
              </div>
              <div className="flex-1 h-9 bg-brand-gold text-brand-black rounded text-[9px] font-bold uppercase tracking-widest flex items-center justify-center">
                Contact Us
              </div>
            </div>

            <p className="text-[7px] font-mono uppercase text-white/30 tracking-[0.15em] mt-12">
              The Vagina Room Community • RESTORING WELLNESS & DIGNITY
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action desk */}
      <div className="bg-neutral-900 border border-white/5 p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-serif text-white">Page Security & Site Activations</h2>
          <p className="text-[11px] text-white/50 mt-1">
            Toggle public availability for any page instantly. Deactivated pages return an offline card & block search crawlers.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setPreviewMode(true)}
            className="flex-1 md:flex-none h-11 px-5 border border-white/10 text-white hover:bg-white/5 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
          >
            Preview Offline Page
          </button>
          
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex-1 md:flex-none h-11 px-6 bg-brand-gold hover:bg-brand-red text-brand-black hover:text-white disabled:bg-neutral-800 disabled:text-white/30 font-black uppercase tracking-widest text-xs rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-brand-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Saving Changes..." : "Save Activations"}</span>
          </button>
        </div>
      </div>

      {/* Save Notification Toast/Banner */}
      <AnimatePresence>
        {saveStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2 font-mono uppercase"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Success! The page activation status has been synchronized with the live server. Code 200.</span>
          </motion.div>
        )}
        {saveStatus === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-brand-red/10 border border-brand-red/20 rounded-xl text-brand-red text-xs flex items-center gap-2 font-mono uppercase"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Error! Could not write to generalSettings configuration. Verify your credentials.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page counts and filter toolbar */}
      <div className="bg-neutral-900 border border-white/5 p-5 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Internal counts */}
          <div className="flex items-center gap-4 text-xs font-mono uppercase text-white/50 w-full sm:w-auto">
            <div>
              Total Pages: <span className="text-white font-bold">{STATIC_PAGES.length}</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div>
              Deactivated: <span className="text-brand-red font-bold">{disabledCount}</span>
            </div>
          </div>

          {/* Search bar & filters */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search pages by name/slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg h-10 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-brand-gold placeholder:text-white/20"
              />
            </div>
          </div>
        </div>

        {/* Category list pill indicators */}
        <div className="flex gap-2 pb-2 overflow-x-auto flex-wrap scrollbar-none border-t border-white/5 pt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`h-8 px-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                categoryFilter === cat
                  ? "bg-brand-gold text-brand-black"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Real Grid container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPages.map((page) => {
          const isDisabled = !!disabledMap[page.path];

          return (
            <div
              key={page.path}
              className={`p-5 rounded-xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-48 ${
                isDisabled
                  ? "bg-neutral-950/40 border-brand-red/30 hover:border-brand-red/50 shadow-[inset_0_0_20px_rgba(239,68,68,0.02)]"
                  : "bg-neutral-900 border-white/5 hover:border-brand-gold/30"
              }`}
            >
              {/* Top Row: category badge & status indicator */}
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 text-[8px] font-mono font-bold tracking-wider uppercase bg-white/5 border border-white/10 text-white/50 rounded">
                  {page.category}
                </span>

                <span
                  className={`px-2 py-0.5 text-[8px] font-bold tracking-wider uppercase rounded-full ${
                    isDisabled
                      ? "bg-brand-red/10 text-brand-red"
                      : "bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {isDisabled ? "● Deactivated / Offline" : "● Active & Public"}
                </span>
              </div>

              {/* Middle Row: titles and indicators */}
              <div className="my-3">
                <h3 className="text-xs font-bold text-white tracking-wide">{page.name}</h3>
                <p className="text-[10px] font-mono text-white/40 font-semibold truncate mt-1">{page.path}</p>
                <p className="text-[9px] text-white/30 line-clamp-2 mt-1 description">
                  {page.desc}
                </p>
              </div>

              {/* Bottom Row: toggle operations and search engine crawl tag */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                {/* Robot index index feedback */}
                <span className="flex items-center gap-1.5 text-[8px] font-mono text-white/40 uppercase">
                  <span className={`w-1.5 h-1.5 rounded-full ${isDisabled ? "bg-brand-red" : "bg-emerald-500"}`} />
                  <span>{isDisabled ? "SEO: Noindex Bot Lock" : "SEO: Indexable / Crawl"}</span>
                </span>

                {/* Main Toggle Button */}
                <button
                  type="button"
                  onClick={() => handleToggle(page.path)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isDisabled ? "bg-white/10" : "bg-brand-gold"
                  }`}
                  role="switch"
                  aria-checked={!isDisabled}
                  title={isDisabled ? "Click to Activate" : "Click to Deactivate"}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isDisabled ? "translate-x-0" : "translate-x-5"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
