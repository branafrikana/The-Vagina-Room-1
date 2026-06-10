import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useContent } from "../context/ContentContext";
import { db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Clipboard, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  HeartHandshake
} from "lucide-react";
import SEO from "../components/SEO";
import { safeJsonParse } from "../lib/json";

export default function WelcomePage() {
  const { user, userData } = useAuth();
  const { content } = useContent();
  interface BrandingSettings {
    headerLogoType?: string;
    headerLogoUrl?: string;
    headerLogoHeight?: number;
  }
  const branding: BrandingSettings = safeJsonParse(content.brandingSettingsJson, {});
  const headerLogoType = branding.headerLogoType || "text";
  const headerLogoUrl = branding.headerLogoUrl;
  const headerLogoHeight = branding.headerLogoHeight || 44;
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Access Control Guard
  useEffect(() => {
    if (!userData) return;
    
    // Explicitly allow admins to view this page even if not a "member"
    if (userData.role === "admin" || userData.isAdmin === true) {
      return;
    }

    // Non-members (pending, awaiting, declined) can't access this
    if (
      (userData.paymentStatus === "pending" || userData.paymentStatus === "awaiting_approval" || !userData.isMember)
    ) {
      navigate("/member-dashboard");
    }
  }, [userData, navigate]);

  if (!userData) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleEnterDashboard = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          welcomeSeen: true
        });
      }
      navigate("/member-dashboard");
    } catch (err) {
      console.error("Failed to update welcomeSeen state:", err);
      // Fallback navigate to let user in anyway
      navigate("/member-dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  const referralCode = userData.referralCode || user?.uid?.substring(0, 8).toUpperCase() || "";
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyMembershipId = () => {
    navigator.clipboard.writeText(userData.membershipId || "TVR001");
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formatExpiration = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (_) {
      return dateStr;
    }
  };

  // Convert raw message text area newlines to paragraph tags
  const messageParagraphs = (content.welcomeMessage || "")
    .split("\n\n")
    .filter((p: string) => p.trim() !== "");

  // Convert instructions string to list items
  const instructionItems = (content.welcomeInstructions || "")
    .split("\n")
    .filter((line: string) => line.trim() !== "");

  const planName = userData.membershipType === "gold" ? "Inner Circle Gold" : "Inner Circle Diamond";

  return (
    <div id="welcome-onboarding-container" className="min-h-screen bg-brand-black text-white relative overflow-hidden flex flex-col justify-between">
      <SEO title="Welcome to The Vagina Room" description="Your journey towards holistic reproductive education begins here." />
      
      {/* Dynamic Cosmic Background accents - Anti-AI slop (strictly ambient minimal styling) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-brand-gold/[0.02] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-brand-gold/[0.015] rounded-full blur-[150px] pointer-events-none" />

      {/* Header area */}
      <header className="border-b border-white/5 py-6 px-8 flex justify-between items-center bg-brand-black/90 backdrop-blur-md z-10 relative">
        <div className="flex items-center gap-2">
           {headerLogoType === 'image' && headerLogoUrl && headerLogoUrl.trim() !== "" ? (
              <img 
                src={headerLogoUrl} 
                alt="The Vagina Room Logo" 
                style={{ height: `${headerLogoHeight}px` }}
                className="w-auto cursor-pointer object-contain"
                onClick={() => navigate("/")}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="font-serif text-lg tracking-widest font-black uppercase text-brand-gold hover:opacity-90 transition-opacity cursor-pointer" onClick={() => navigate("/")}>
                THE VAGINA ROOM
              </span>
            )}
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest bg-brand-gold/10 border border-brand-gold/20 px-3 py-1.5 rounded-full text-brand-gold">
          <ShieldCheck size={12} /> SECURE ONBOARDING
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12 md:py-20 z-10 relative grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Column: Dr. Fid Welcome Note */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 space-y-8"
        >
          <div>
            <span className="text-[10px] uppercase font-black tracking-[0.25em] text-brand-gold flex items-center gap-1.5 mb-3">
              <Sparkles size={12} /> Sactified Portal Activated
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white leading-tight font-light font-bold">
              {content.welcomeTitle || "Welcome to The Vagina Room!"}
            </h1>
            <p className="text-sm font-light text-white/50 italic mt-3 max-w-2xl">
              {content.welcomeSubtitle || "Your sacred journey into reproductive healing, wellness, and sisterhood begins now."}
            </p>
          </div>

          {/* Portrait Image + Message Wrapper */}
          <div className="bg-white/[0.01] border border-white/5 p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-6 md:items-start">
              {/* Doctor Portrait image */}
              <div className="w-32 h-32 md:w-36 md:h-36 shrink-0 border border-brand-gold/30 p-1 bg-brand-black rounded-lg overflow-hidden flex items-center justify-center shadow-xl">
                <img 
                  src={content.welcomeDrFidImgUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600"} 
                  alt="Dr. Fid Welcome Address" 
                  className="w-full h-full object-cover rounded-md"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Message Block */}
              <div className="space-y-4 font-light text-[13.5px] text-white/80 leading-relaxed text-justify">
                {messageParagraphs.map((para: string, idx: number) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Steps Checklist */}
          {instructionItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
                🚀 Immediate Actions Checklist
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instructionItems.map((step: string, idx: number) => (
                  <div key={idx} className="bg-zinc-950/60 p-4 border border-white/5 flex gap-3 text-left">
                    <CheckCircle2 size={16} className="text-brand-gold grow-0 shrink-0 mt-0.5" />
                    <p className="text-xs text-white/70 font-light leading-snug">
                      {step.replace(/^\d+\.\s*/, "")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Right Column: Premium Digital Membership Credentials ID Card Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-5 space-y-8 sticky top-28"
        >
          {/* Certificate Credential Widget */}
          <div className="bg-gradient-to-b from-zinc-900 to-black border border-brand-gold/30 p-8 shadow-2xl relative">
            {/* Elegant Corner brackets */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-brand-gold/40" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-brand-gold/40" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-brand-gold/40" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-brand-gold/40" />

            {/* Glowing gold seal icon in background */}
            <div className="absolute right-6 top-6 opacity-5 pointer-events-none">
              <Award size={130} className="text-brand-gold" />
            </div>

            <div className="text-center space-y-6 pb-6 border-b border-white/5">
              <Award className="text-brand-gold mx-auto" size={32} />
              <div className="space-y-1">
                <p className="text-[8.5px] uppercase font-black tracking-widest text-[#D4AF37]/80 font-mono">Verified Advocate Credential</p>
                <h2 className="text-2xl font-serif font-semibold text-white tracking-wide">
                  {userData.firstName} {userData.lastName}
                </h2>
                <p className="text-[10px] text-zinc-500 font-mono">Member ID: {userData.membershipId || "TVR001"}</p>
              </div>
            </div>

            {/* Grid Stats details */}
            <div className="py-6 space-y-4 font-mono text-xs border-b border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 uppercase tracking-wider text-[9px]">Membership Plan</span>
                <span className="text-white font-bold text-right uppercase tracking-[0.05em]">{planName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 uppercase tracking-wider text-[9px]">Status</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 uppercase tracking-widest text-[9px] font-black">
                  ACTIVE SYNCED
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 uppercase tracking-wider text-[9px]">Expiration Date</span>
                <span className="text-white font-bold text-right">{formatExpiration(userData.membershipExpiration)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 uppercase tracking-wider text-[9px]">Commission Scheme</span>
                <span className="text-brand-gold font-bold text-right">{userData.customCommissionPercentage || 20}% Commission / Refer</span>
              </div>
            </div>

            {/* Reference link block */}
            <div className="pt-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase font-black tracking-wider font-mono text-brand-gold flex items-center gap-1">
                  <Flame size={12} /> Your Advocate Link
                </span>
                <span className="text-[8px] text-zinc-400 uppercase font-mono">Copied link earns commission</span>
              </div>
              
              <div className="flex items-center gap-2 bg-brand-black border border-white/10 p-2 text-xs rounded">
                <span className="truncate flex-1 font-mono text-white/50">{referralLink}</span>
                <button 
                  onClick={copyReferralLink} 
                  className="p-1.5 hover:bg-white/5 text-brand-gold hover:text-white transition-all cursor-pointer"
                  title="Copy Advocate Link to Clipboard"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Clipboard size={14} />}
                </button>
              </div>
            </div>

            {/* Copy Membership ID block */}
            <div className="pt-4 flex justify-between items-center">
              <span className="text-[9px] font-mono text-zinc-500 uppercase">Save Membership Card ID</span>
              <button 
                onClick={copyMembershipId}
                className="text-[9px] font-mono text-brand-gold hover:underline flex items-center gap-1 bg-white/5 border border-white/5 py-1 px-2 uppercase hover:bg-white/10"
              >
                {copiedId ? <Check size={10} className="text-emerald-400" /> : <Clipboard size={10} />}
                {copiedId ? "Copied ID" : "Copy Membership ID"}
              </button>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="space-y-4">
            <button
              onClick={handleEnterDashboard}
              disabled={submitting}
              className="w-full py-4 text-xs font-black uppercase tracking-[0.25em] bg-brand-gold text-brand-black hover:bg-white border-none transition-all flex items-center justify-center gap-2 relative shadow-xl hover:shadow-brand-gold/10 group cursor-pointer"
            >
              {submitting ? (
                <>Saving State Configuration...</>
              ) : (
                <>
                  {content.welcomeActionBtnText || "Explore Your Members Dashboard"}
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-white/40 italic">
              *By clicking above, you confirm validation of your verified security nodes. Your credentials will remain accessible inside your member profile view at any time.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer area */}
      <footer className="border-t border-white/5 py-8 text-center text-[10px] text-white/40 font-mono">
        © {new Date().getFullYear()} THE VAGINA ROOM ECOSYSTEM. ALL WELLNESS RIGHTS PRESERVED. CONSTITUTES PRIVATE VERIFIED MEMBER ENCRYPTED SYSTEM.
      </footer>
    </div>
  );
}
