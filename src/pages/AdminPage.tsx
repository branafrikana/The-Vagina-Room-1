import React, { useState, useEffect } from "react";
import { useContent, ContentData } from "../context/ContentContext";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  Lock, 
  Eye,
  EyeOff, 
  Trash2, 
  FileText, 
  User, 
  Mail, 
  MessageSquare, 
  Download, 
  Layout, 
  Users, 
  Sparkles, 
  Save, 
  LogOut, 
  Check, 
  X, 
  Calendar,
  Layers,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchWithApiBase } from '../lib/api';
import AdminContentRenderer from "../components/admin/AdminContentRenderer";
import NavigationMenuManager from "../components/admin/NavigationMenuManager";
import AdminSettingsTab from "../components/admin/AdminSettingsTab";
import AdminProductsPanel from "../components/admin/AdminProductsPanel";
import AdminOrdersPanel from "../components/admin/AdminOrdersPanel";
import AdminBusinessProfile from "../components/admin/AdminBusinessProfile";
import AdminCheckoutSettings from "../components/admin/AdminCheckoutSettings";
import { sendWhatsAppMessage, WHATSAPP_TEMPLATES } from "../lib/whatsapp";

import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";

interface ImageUploaderProps {
  fieldKey: keyof ContentData;
  label: string;
  onUploadSuccess?: (url: string) => void;
  currentValue?: string;
}

export function ImageUploader({ fieldKey, label, onUploadSuccess, currentValue }: ImageUploaderProps) {
  const { content, updateContentField, uploadImage } = useContent();
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setStatus("error");
      setErrorText("File size exceeds 10MB limit.");
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setLocalPreview(base64Data);
      
      setStatus("uploading");
      setErrorText("");

      try {
        const res = await uploadImage(base64Data, file.name);
        if (res.success && res.url) {
          if (onUploadSuccess) {
            onUploadSuccess(res.url);
          } else {
            updateContentField(fieldKey, res.url);
          }
          setStatus("success");
          // Keep local preview until re-render, or reset it
          setTimeout(() => setStatus("idle"), 3000);
        } else {
          setStatus("error");
          setErrorText(res.error || "Upload rejected.");
          setLocalPreview(null);
        }
      } catch (err) {
        setStatus("error");
        setErrorText("Unexpected upload error.");
        setLocalPreview(null);
      }
    };
    reader.onerror = () => {
      setStatus("error");
      setErrorText("Could not read file data.");
    };
    reader.readAsDataURL(file);
  };

  const currentUrl = localPreview || (currentValue !== undefined ? currentValue : content[fieldKey]);

  // Clean, truncated name presentation to avoid displaying massive base64 or long CDN URLs
  const cleanUrlText = currentUrl
    ? currentUrl.startsWith("data:")
      ? "Local Image (Uploading...)"
      : currentUrl.length > 40
        ? currentUrl.substring(currentUrl.lastIndexOf('/') + 1) || (currentUrl.slice(0, 37) + "...")
        : currentUrl
    : "No image selected";

  return (
    <div className="bg-white/5 border border-white/10 p-4 space-y-3 rounded-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-gold block">{label}</span>
          <span className="text-[11px] font-mono text-white/60 block mt-1 truncate select-all leading-normal" title={currentUrl || ""}>
            {cleanUrlText}
          </span>
        </div>
        <div className="flex-shrink-0">
          {currentUrl ? (
            <div className="w-16 h-16 bg-neutral-900/60 rounded border border-white/10 flex items-center justify-center p-1 overflow-hidden group relative">
              <img 
                src={currentUrl} 
                alt="Preview" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-white/5 rounded border border-dashed border-white/10 flex items-center justify-center text-white/20 text-[10px] font-mono">
              NONE
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center justify-center h-9 px-4 bg-brand-gold text-brand-black text-[10px] uppercase font-black tracking-wider hover:bg-brand-red hover:text-white transition-colors cursor-pointer select-none rounded">
          {status === "uploading" ? (
            <span className="flex items-center gap-1">Uploading...</span>
          ) : (
            <span className="flex items-center gap-1.5">Choose File & Upload</span>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="hidden" 
            disabled={status === "uploading"}
          />
        </label>
        
        {status === "success" && (
          <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">✓ Assets secured</span>
        )}
        {status === "error" && (
          <span className="text-[10px] font-mono text-brand-red font-bold flex items-center gap-1">✕ {errorText}</span>
        )}
      </div>
    </div>
  );
}

function AdminReorderPanel() {
  const { content, updateContentField } = useContent();
  const [selectedPage, setSelectedPage] = useState<"home" | "drfid" | "about">("home");

  const HOME_SECTIONS = [
    { id: "primary_hero", label: "Primary Hero Banner" },
    { id: "about_the_room", label: "About the Room / Identity" },
    { id: "identity_grid", label: "Identity Grid & Overrides (Dynamic List)" },
    { id: "partners", label: "Partners & Sponsors" },
    { id: "about_sanctuary", label: "About / Holistic Healing model text" },
    { id: "why_we_exist", label: "Why We Exist" },
    { id: "focus_areas", label: "Integrated Focus Areas" },
    { id: "who_we_serve", label: "Who We Serve Audience Grid" },
    { id: "know_your_vagina", label: "Hero (Clinical Anatomy banner)" },
    { id: "values", label: "Core Values / Principles" },
    { id: "community", label: "Community & Support Hub" },
    { id: "trust_safety", label: "Trust & Safety Manifesto" },
    { id: "testimonials", label: "Client Testimonials Slider" },
    { id: "promise", label: "The Room Promise Pledge" },
    { id: "faq", label: "Frequently Asked Questions" },
    { id: "products", label: "Featured Products Grid" },
    { id: "social_grid", label: "Curated Instagram Social Grid" }
  ];

  const DR_FID_SECTIONS = [
    { id: "profile_hero", label: "Profile Hero Banner" },
    { id: "career_expertise", label: "Naturopathy Career & Expertise" },
    { id: "education_certifications", label: "Academic Certifications & Quote" },
    { id: "ancp_framework", label: "ANCP Spa Treatment Framework" },
    { id: "vagina_room_context", label: "The Vagina Room Movement Platform" },
    { id: "personal_life", label: "Personal Life, Hobbies & Philosophy" },
    { id: "closing_cta", label: "Closing CTA & Booking Connect" }
  ];

  const ABOUT_SECTIONS = [
    { id: "about_hero", label: "Sanctuary Hero Intro Banner" },
    { id: "manifesto", label: "The Room Manifesto & Bio Box" },
    { id: "mission_vision", label: "Strategic Mission & Vision Goals" },
    { id: "who_we_serve", label: "Who We Serve Custom Grid" },
    { id: "differentiators", label: "What Makes Us Different" },
    { id: "core_values", label: "Our DNA & Core Values Matrix" },
    { id: "promise", label: "The Room Commitments & Star Promise" }
  ];

  const fieldKey = selectedPage === "home" ? "homePageSectionsOrder" 
                 : selectedPage === "drfid" ? "drFidPageSectionsOrder" 
                 : "aboutPageSectionsOrder";

  const allPossibleSections = selectedPage === "home" ? HOME_SECTIONS 
                            : selectedPage === "drfid" ? DR_FID_SECTIONS 
                            : ABOUT_SECTIONS;

  const currentOrder: string[] = (() => {
    const val = content[fieldKey as keyof ContentData];
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch(e) {}
    }
    return allPossibleSections.map(s => s.id);
  })();

  const moveElement = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= currentOrder.length) return;

    const updated = [...currentOrder];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;

    updateContentField(fieldKey as any, JSON.stringify(updated));
  };

  const toggleVisibility = (id: string) => {
    const isVisible = currentOrder.includes(id);
    let updated: string[];
    
    if (isVisible) {
      updated = currentOrder.filter(item => item !== id);
    } else {
      // Add back at its "original" relative position if possible, or just at the end
      const originalIdx = allPossibleSections.findIndex(s => s.id === id);
      updated = [...currentOrder];
      // Try to insert it back at a logical place
      updated.push(id);
    }
    
    updateContentField(fieldKey as any, JSON.stringify(updated));
  };

  const resetToDefaultLayout = () => {
    if (!window.confirm("Reseting will enable all sections and restore their default order. Proceed?")) return;
    const defaultIds = allPossibleSections.map(s => s.id);
    updateContentField(fieldKey as any, JSON.stringify(defaultIds));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        <button
          onClick={() => setSelectedPage("home")}
          className={`px-4 py-2 text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer ${
            selectedPage === "home" ? "bg-brand-gold text-brand-black" : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          Home Page ({HOME_SECTIONS.length} segments)
        </button>
        <button
          onClick={() => setSelectedPage("drfid")}
          className={`px-4 py-2 text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer ${
            selectedPage === "drfid" ? "bg-brand-gold text-brand-black" : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          Dr. FID Biography ({DR_FID_SECTIONS.length} segments)
        </button>
        <button
          onClick={() => setSelectedPage("about")}
          className={`px-4 py-2 text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer ${
            selectedPage === "about" ? "bg-brand-gold text-brand-black" : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          About Us Page ({ABOUT_SECTIONS.length} segments)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active / Ordered Sections */}
        <div className="space-y-3 bg-black/40 p-6 border border-white/5 rounded">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Active Layout Sequence</p>
            <button 
              onClick={resetToDefaultLayout}
              className="text-[9px] font-black uppercase tracking-widest text-brand-red hover:text-white border border-brand-red/30 hover:border-brand-red px-2.5 py-1 transition-colors cursor-pointer"
            >
              Reset to Defaults
            </button>
          </div>

          {currentOrder.length === 0 && (
            <div className="py-12 border border-dashed border-white/10 text-center text-[10px] uppercase font-black text-white/20">
              No active segments. Enable them from the pool.
            </div>
          )}

          {currentOrder.map((id, idx) => {
            const section = allPossibleSections.find(s => s.id === id) || { id, label: id };
            return (
              <div 
                key={id} 
                className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-mono font-bold text-brand-gold bg-white/5 px-2.5 py-1 rounded">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-white select-none">
                      {section.label}
                    </span>
                    <span className="text-[9px] font-mono text-white/40 block mt-0.5 select-all">
                      {id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleVisibility(id)}
                    className="p-1.5 bg-white/5 hover:bg-brand-red hover:text-white text-white/40 transition-colors cursor-pointer"
                    title="Disable Segment"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => moveElement(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 bg-white/5 hover:bg-white/10 hover:text-brand-gold text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveElement(idx, 'down')}
                    disabled={idx === currentOrder.length - 1}
                    className="p-1.5 bg-white/5 hover:bg-white/10 hover:text-brand-gold text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    ▼
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hidden Pool */}
        <div className="space-y-3 bg-black/20 p-6 border border-white/5 rounded">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 text-center">Available Sections Pool</p>
          
          <div className="grid grid-cols-1 gap-2">
            {allPossibleSections.map(section => {
              const isActive = currentOrder.includes(section.id);
              if (isActive) return null;
              
              return (
                <div 
                  key={section.id}
                  className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 opacity-50 hover:opacity-100 transition-opacity"
                >
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/80">{section.label}</p>
                    <p className="text-[8px] font-mono text-white/20">{section.id}</p>
                  </div>
                  <button
                    onClick={() => toggleVisibility(section.id)}
                    className="flex items-center gap-1.5 bg-brand-gold/10 hover:bg-brand-gold text-brand-gold hover:text-brand-black px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer border border-brand-gold/20"
                  >
                    <EyeOff size={11} /> Enable
                  </button>
                </div>
              );
            })}
            
            {allPossibleSections.every(s => currentOrder.includes(s.id)) && (
              <div className="py-12 text-center text-[9px] uppercase font-black text-white/10 tracking-widest italic">
                All available sections are currently active.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { 
    content, 
    isAdmin, 
    loginAsAdmin, 
    logoutAdmin, 
    updateContentField, 
    saveContentChanges,
    adminPasswordToken
  } = useContent();

  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "submissions" | "content" | "navigation" | "general" | "branding" | "seo" | "security" | "social" | "reorder_sections" | "products" | "orders" | "business_details" | "checkout_settings">("dashboard");
  const [activeContentTab, setActiveContentTab] = useState<"home" | "about_us" | "about_dr_fid" | "dr_fid_booking" | "focus_areas" | "team_partner" | "projects_events" | "gallery" | "contact" | "testimonials" | "support" | "policy_terms" | "footer">("home");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [submissionFilter, setSubmissionFilter] = useState<"all" | "partnership" | "contact" | "booking_dr_fid">("all");
  
  const filteredSubmissions = submissions.filter((sub) => {
    if (submissionFilter === "all") return true;
    return sub.formType === submissionFilter;
  });

  const totalPartnershipSubmissions = submissions.filter(s => s.formType === "partnership").length;
  const totalContactSubmissions = submissions.filter(s => s.formType === "contact").length;
  const totalBookingSubmissions = submissions.filter(s => s.formType === "booking_dr_fid").length;
  
  // Save feedbacks
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveMsg, setSaveMsg] = useState("");

  const loadSubmissions = async () => {
    if (!isAdmin || !adminPasswordToken) return;
    setSubmissionsLoading(true);
    try {
      const res = await fetchWithApiBase(`/api/submissions?password=${encodeURIComponent(adminPasswordToken)}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error("Failed to load submission data", err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!isAdmin || !adminPasswordToken) return;
    setOrdersLoading(true);
    try {
      const res = await fetchWithApiBase(`/api/orders?password=${encodeURIComponent(adminPasswordToken)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to load orders via API:", err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadSubmissions();
      loadOrders();
    }
  }, [isAdmin, adminPasswordToken]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const success = await loginAsAdmin(passwordInput);
    if (!success) {
      setLoginError("Incorrect administrative authorization key. Please try again.");
    }
  };

  const handleDeleteSubmission = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this submission?")) return;

    try {
      const res = await fetchWithApiBase(`/api/submissions/${id}?password=${encodeURIComponent(adminPasswordToken)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        if (selectedSub?.id === id) setSelectedSub(null);
      }
    } catch (err) {
      console.error("Failed to delete submission", err);
    }
  };

  const handleSaveAllContent = async () => {
    setSaveStatus("saving");
    const result = await saveContentChanges();
    if (result.success) {
      setSaveStatus("success");
      setSaveMsg(result.message);
      setTimeout(() => setSaveStatus("idle"), 3500);
    } else {
      setSaveStatus("error");
      setSaveMsg(result.message);
      setTimeout(() => setSaveStatus("idle"), 5000);
    }
  };

  const handleExportDataAsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(content, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tvr_content_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Unauthenticated Login Panel view
  if (!isAdmin) {
    return (
      <>
        <Helmet>
          <title>Admin Login - The Room</title>
          <meta name="description" content="Administration panel login for The Room." />
        </Helmet>
        <div className="flex flex-col min-h-screen bg-brand-black">
          <AdminHeader />
          <main className="flex-grow flex items-center justify-center p-6 md:p-12 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-red/10 via-brand-black to-brand-gold/5 pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white/[0.02] backdrop-blur-md border border-white/10 p-8 shadow-2xl relative z-10"
          >
            <div className="w-12 h-12 bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center mb-6">
              <Lock className="text-brand-gold" size={20} />
            </div>
            
            <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
              ADMIN CONTROL PORTAL
            </h1>
            <p className="text-xs text-white/40 tracking-wider uppercase mb-8">
              AUTHORIZED PERSONNEL ONLY
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  className="w-full bg-transparent border-b border-white/10 py-3 text-white tracking-widest focus:border-brand-gold focus:outline-none transition-colors text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block">
                  Authorization Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-transparent border-b border-white/10 py-3 pr-10 text-white tracking-widest focus:border-brand-gold focus:outline-none transition-colors text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white/20 hover:text-brand-gold transition-colors focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-xs text-brand-red font-medium leading-relaxed">
                  {loginError}
                </p>
              )}

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="w-full bg-brand-gold hover:bg-white text-brand-black transition-all duration-500 py-4 font-black uppercase tracking-[0.4em] text-xs cursor-pointer"
                >
                  Unlock Dashboard
                </button>
              </div>
              <p className="text-center text-[10px] text-white/30 pt-2">
                Forgot password?{" "}
                <button 
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-brand-gold hover:underline cursor-pointer"
                >
                  Reset Password
                </button>
              </p>
            </form>

            <AnimatePresence>
              {showForgotModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/95 backdrop-blur-lg"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-full max-w-md bg-white/[0.03] border border-brand-gold/30 p-8 shadow-2xl relative"
                  >
                    <button
                      onClick={() => setShowForgotModal(false)}
                      className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors cursor-pointer"
                      type="button"
                    >
                      <X size={18} />
                    </button>

                    <div className="w-12 h-12 bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mb-6">
                      <Sparkles className="text-brand-gold" size={20} />
                    </div>

                    <h3 className="text-xl font-black uppercase tracking-tight text-white mb-4">
                      Password Reset Guidelines
                    </h3>

                    <div className="space-y-4 text-xs text-white/70 leading-relaxed mb-8">
                      <p>
                        Since the administrative dashboard controls live-page designs and confidential client responses, password credentials are secured at the environment level.
                      </p>
                      <div className="p-4 bg-white/5 border-l-2 border-brand-gold space-y-2 font-mono text-[11px] text-brand-gold/90">
                        <p className="font-sans font-bold text-white mb-1">RESET CHECKLIST:</p>
                        <p>1. Open <span className="text-white">.env</span> (or check <span className="text-white">.env.example</span>) in your project workspace.</p>
                        <p>2. Locate the variable: <span className="text-white">ADMIN_PASSWORD</span>.</p>
                        <p>3. Set or update its value to your desired credential.</p>
                        <p>4. If not specified, the system defaults to <span className="text-white">admin123</span>.</p>
                      </div>
                      <p>
                        Please update your workspace credentials console or contact your technical administrator to securely process a credential refresh.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowForgotModal(false)}
                      className="w-full bg-brand-gold hover:bg-white text-brand-black font-black uppercase tracking-widest text-xs py-4 transition-all duration-500 cursor-pointer"
                      type="button"
                    >
                      Got It, Thank You
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <Link to="/" className="text-white/40 hover:text-white text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-2">
                <ArrowLeft size={12} /> Back To Main Website
              </Link>
            </div>
          </motion.div>
        </main>
        <AdminFooter />
      </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - The Room</title>
        <meta name="description" content="Administration panel for The Room." />
      </Helmet>
      <div className="flex flex-col min-h-screen bg-brand-black text-white selection:bg-brand-gold selection:text-brand-black">
        <AdminHeader />

      {/* Persistent Global Save Bar */}
      <div className="sticky top-[80px] z-[999] bg-brand-red border-b border-brand-red/30 py-3 px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10.5px] font-black uppercase tracking-[0.25em] text-white">
            ADMINISTRATIVE MANAGEMENT ACTIVE
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-xs text-white/80 hidden sm:inline">Remember to save changes to persist them to the disk</span>
          <button
            onClick={handleSaveAllContent}
            disabled={saveStatus === "saving"}
            className="bg-white hover:bg-brand-black hover:text-white text-brand-red px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saveStatus === "saving" ? (
              "Storing..."
            ) : (
              <>
                <Save size={12} /> Save Site Changes
              </>
            )}
          </button>
        </div>
      </div>

      <main className="flex-grow py-12 px-6 max-w-7xl mx-auto w-full">
        {/* Save Feedbacks Banner */}
        <AnimatePresence>
          {saveStatus !== "idle" && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`p-4 mb-8 text-xs font-mono uppercase tracking-wider flex items-center justify-between border ${
                saveStatus === "success" 
                  ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/30" 
                  : saveStatus === "error" 
                  ? "bg-red-950/20 text-red-400 border-red-500/30" 
                  : "bg-white/5 text-white/60 border-white/10"
              }`}
            >
              <span className="flex items-center gap-2">
                {saveStatus === "success" ? <Check size={14} /> : <X size={14} />}
                {saveMsg || "Saving modified fields to the server database..."}
              </span>
              <button onClick={() => setSaveStatus("idle")} className="text-white/40 hover:text-white">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8 mb-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
              SYSTEM CMS <span className="text-brand-gold italic font-light lowercase font-serif">dashboard</span>
            </h1>
            <p className="text-xs text-white/40 tracking-wider mt-1 uppercase font-mono">
              Live Content Editing and Request Inboxes
            </p>
          </div>
          <div className="flex flex-wrap gap-4.5">
            <button
              onClick={handleExportDataAsJson}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[9.5px] font-black uppercase tracking-widest text-white/80 transition-colors flex items-center gap-2 cursor-pointer"
              title="Download content copy as backup file"
            >
              <Download size={12} /> Backup Schema JSON
            </button>
            <button
              onClick={logoutAdmin}
              className="px-4 py-2 border border-brand-red text-brand-red hover:bg-brand-red hover:text-white text-[9.5px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={12} /> Exit Admin Node
            </button>
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-3 mb-4">
              Dashboard Modules
            </p>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-brand-gold text-brand-black"
                  : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-xs">📊</span> Dashboard
              </span>
            </button>

            <button
              onClick={() => setActiveTab("submissions")}
              className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "submissions"
                  ? "bg-brand-gold text-brand-black"
                  : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText size={14} /> Form Submissions
              </span>
              <span className={`text-[10px] font-mono rounded px-2.5 py-0.5 ${activeTab === "submissions" ? "bg-black/10 text-brand-black" : "bg-white/10 text-white"}`}>
                {submissions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("content")}
              className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "content"
                  ? "bg-brand-gold text-brand-black"
                  : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
              }`}
            >
              <span className="flex items-center gap-2">
                <Layout size={14} /> Site Content Editor
              </span>
            </button>

            <button
              onClick={() => setActiveTab("reorder_sections")}
              className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "reorder_sections"
                  ? "bg-brand-gold text-brand-black"
                  : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-xs">↕️</span> Reorder Sections
              </span>
            </button>

            <button
              onClick={() => setActiveTab("navigation")}
              className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "navigation"
                  ? "bg-brand-gold text-brand-black"
                  : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-xs">🗺️</span> Navigation Setup
              </span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "products"
                  ? "bg-brand-gold text-brand-black"
                  : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-xs">📦</span> Products Catalog
              </span>
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "orders"
                  ? "bg-brand-gold text-brand-black"
                  : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-xs">🛒</span> Order Manager
              </span>
            </button>

            <button
              onClick={() => setActiveTab("business_details")}
              className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "business_details"
                  ? "bg-brand-gold text-brand-black"
                  : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-xs">🏢</span> Business Profile
              </span>
            </button>

            <button
              onClick={() => setActiveTab("checkout_settings")}
              className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "checkout_settings"
                  ? "bg-brand-gold text-brand-black"
                  : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-xs">💳</span> Checkout & Delivery
              </span>
            </button>

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-3 mt-6 mb-2">
              Configuration
            </p>
            
            <button
              onClick={() => setActiveTab("general")}
              className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "general"
                  ? "bg-brand-gold text-brand-black"
                  : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-xs">⚙️</span> General
              </span>
            </button>
            <button
              onClick={() => setActiveTab("branding")}
              className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "branding"
                  ? "bg-brand-gold text-brand-black"
                  : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-xs">🎨</span> Branding
              </span>
            </button>
            <button
              onClick={() => setActiveTab("seo")}
              className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "seo"
                  ? "bg-brand-gold text-brand-black"
                  : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-xs">🌐</span> SEO Search
              </span>
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "security"
                  ? "bg-brand-gold text-brand-black"
                  : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-xs">🛡️</span> Security
              </span>
            </button>
            <button
              onClick={() => setActiveTab("social")}
              className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "social"
                  ? "bg-brand-gold text-brand-black"
                  : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-xs">🌐</span> Social Media Links
              </span>
            </button>
          </div>

          {/* Module Panel Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              
              {/* Tab 5: Dashboard Overview */}
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-8"
                >
                  <h3 className="text-xl font-black uppercase tracking-widest text-brand-gold mb-6">Dashboard Overview</h3>
                  <p className="text-sm text-white/60">System status and key metrics overview.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                     <div className="bg-white/5 p-6 border border-white/10">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Total Inbound</p>
                        <p className="text-4xl font-black mt-2">{submissions.length}</p>
                     </div>
                     <div className="bg-white/5 p-6 border border-white/10">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Dr. FID Bookings</p>
                        <p className="text-4xl font-black mt-2 text-emerald-400">{totalBookingSubmissions}</p>
                     </div>
                     <div className="bg-white/5 p-6 border border-white/10">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Partnerships</p>
                        <p className="text-4xl font-black mt-2 text-brand-red">{totalPartnershipSubmissions}</p>
                     </div>
                     <div className="bg-white/5 p-6 border border-white/10">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Contact Queries</p>
                        <p className="text-4xl font-black mt-2 text-brand-gold">{totalContactSubmissions}</p>
                     </div>
                  </div>
                </motion.div>
              )}
              
              {/* Tab 1: Form Submissions Table */}
              {activeTab === "submissions" && (
                <motion.div
                  key="submissions-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-none">
                    <div className="flex justify-between items-center mb-0">
                      <h3 className="text-lg font-black uppercase tracking-wider text-brand-gold">
                        Partner Inbound & Contact Inquiries
                      </h3>
                      <button 
                        onClick={loadSubmissions}
                        className="text-[9px] font-black uppercase tracking-widest text-white/50 hover:text-white border border-white/10 px-3 py-1.5 transition-colors cursor-pointer"
                      >
                        Refresh
                      </button>
                    </div>
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6 mt-6">
                      <div className="bg-white/[0.03] p-4 border border-white/5 text-center">
                        <p className="text-[10px] uppercase text-white/40 mb-1">Partnerships</p>
                        <p className="text-2xl font-black text-brand-red">{totalPartnershipSubmissions}</p>
                      </div>
                      <div className="bg-white/[0.03] p-4 border border-white/5 text-center">
                        <p className="text-[10px] uppercase text-white/40 mb-1">Bookings</p>
                        <p className="text-2xl font-black text-emerald-400">{totalBookingSubmissions}</p>
                      </div>
                      <div className="bg-white/[0.03] p-4 border border-white/5 text-center">
                        <p className="text-[10px] uppercase text-white/40 mb-1">Contacts</p>
                        <p className="text-2xl font-black text-brand-gold">{totalContactSubmissions}</p>
                      </div>
                    </div>

                      {/* Sub-tab form filter */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8 border-b border-white/5 pb-6">
                        <div className="flex flex-wrap gap-2 flex-grow">
                          <button
                            onClick={() => setSubmissionFilter("all")}
                            className={`px-4 py-2 text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer ${
                              submissionFilter === "all"
                                ? "bg-brand-gold text-brand-black"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                            }`}
                          >
                            All ({submissions.length})
                          </button>
                      <button
                        onClick={() => setSubmissionFilter("booking_dr_fid")}
                        className={`px-4 py-2 text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer ${
                          submissionFilter === "booking_dr_fid"
                            ? "bg-brand-gold text-brand-black"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        Bookings ({totalBookingSubmissions})
                      </button>
                      <button
                        onClick={() => setSubmissionFilter("partnership")}
                        className={`px-4 py-2 text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer ${
                          submissionFilter === "partnership"
                            ? "bg-brand-red text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        Partnerships ({totalPartnershipSubmissions})
                      </button>
                      <button
                        onClick={() => setSubmissionFilter("contact")}
                        className={`px-4 py-2 text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer ${
                          submissionFilter === "contact"
                            ? "bg-brand-gold text-brand-black"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        Queries ({totalContactSubmissions})
                      </button>
                        </div>
                    </div>


                    {submissionsLoading ? (
                      <p className="text-xs text-white/40 italic p-6">Loading submissions from storage files...</p>
                    ) : filteredSubmissions.length === 0 ? (
                      <div className="p-12 text-center border-2 border-dashed border-white/5 text-white/30 text-xs">
                        {submissionFilter === "all" 
                          ? "No submissions captured yet. Test form fields on Partner or Contact pages."
                          : `No submissions found for the selected filter: "${submissionFilter}".`}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-white/10 uppercase font-black text-white/40 tracking-wider">
                              <th className="py-3 px-4">Timestamp</th>
                              <th className="py-3 px-4">Form</th>
                              <th className="py-3 px-4">Sender / Org</th>
                              <th className="py-3 px-4">Contact Info</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredSubmissions.map((sub) => {
                              const date = new Date(sub.timestamp).toLocaleString();
                              const typeLabel = sub.formType === "partnership" ? "Partnership" 
                                              : sub.formType === "booking_dr_fid" ? "Booking"
                                              : "General Contact";
                              const name = sub.data.fullName || sub.data.contactPerson || sub.data.name || "Anonymous";
                              const company = sub.data.organization || sub.data.organizationName || "";
                              const email = sub.data.email || "";

                              return (
                                <tr 
                                  key={sub.id} 
                                  onClick={() => setSelectedSub(sub)}
                                  className={`border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors ${selectedSub?.id === sub.id ? "bg-white/[0.03]" : ""}`}
                                >
                                  <td className="py-4 px-4 font-mono text-white/60">{date}</td>
                                  <td className="py-4 px-4">
                                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                                      sub.formType === "partnership" ? "bg-brand-red/20 text-brand-red" 
                                      : sub.formType === "booking_dr_fid" ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-brand-gold/20 text-brand-gold"
                                    }`}>
                                      {typeLabel}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 font-bold text-white">
                                    {name} {company && <span className="text-[10px] block font-light text-white/50">{company}</span>}
                                  </td>
                                  <td className="py-4 px-4 font-mono text-white/70">{email}</td>
                                  <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={(e) => handleDeleteSubmission(sub.id, e)}
                                      className="p-1.5 hover:bg-brand-red/20 text-white/50 hover:text-brand-red border border-white/5 hover:border-brand-red/30 transition-all cursor-pointer inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"
                                    >
                                      <Trash2 size={11} /> Delete
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Submission Detail Card View */}
                  {selectedSub && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/[0.03] border border-white/10 p-6 shadow-2xl space-y-6 rounded-none relative"
                    >
                      <button 
                        onClick={() => setSelectedSub(null)}
                        className="absolute top-4 right-4 text-white/40 hover:text-white"
                      >
                        <X size={16} />
                      </button>

                      <div className="border-b border-white/5 pb-4">
                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-brand-gold/20 text-brand-gold rounded font-mono inline-block mb-2">
                          SUBMISSION RECORD #{selectedSub.id} ({selectedSub.formType === "booking_dr_fid" ? "DR. FID BOOKING" : selectedSub.formType.toUpperCase()})
                        </span>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xl font-black uppercase tracking-tight text-white mb-0.5">
                              {selectedSub.data.organization || selectedSub.data.organizationName || selectedSub.data.fullName || selectedSub.data.name || "Sender Record Details"}
                            </h4>
                            <p className="text-[10px] text-white/40 font-mono">
                              Captured at {new Date(selectedSub.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {selectedSub.formType === "booking_dr_fid" && (
                            <div className="text-right">
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">Status</span>
                              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">Received</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-white/80">
                        <div className="space-y-4">
                          <p className="flex items-center gap-2"><User size={13} className="text-brand-gold/80" /> <strong>Contact Name:</strong> {selectedSub.data.fullName || selectedSub.data.contactPerson || selectedSub.data.name || "N/A"}</p>
                          <p className="flex items-center gap-2"><Mail size={13} className="text-brand-gold/80" /> <strong>Email:</strong> {selectedSub.data.email || "N/A"}</p>
                          {selectedSub.data.phone && (
                            <p className="flex items-center gap-2"><span className="text-brand-gold/80">📞</span> <strong>Phone:</strong> {selectedSub.data.phone}</p>
                          )}
                        </div>
                        <div className="space-y-4">
                          {(selectedSub.data.organization || selectedSub.data.organizationName) && (
                            <p className="flex items-center gap-2"><Users size={13} className="text-brand-gold/80" /> <strong>Organization:</strong> {selectedSub.data.organization || selectedSub.data.organizationName}</p>
                          )}
                          {selectedSub.data.partnershipType && (
                            <p className="flex items-center gap-2"><Layers size={13} className="text-brand-gold/80" /> <strong>Partnership Type:</strong> {selectedSub.data.partnershipType}</p>
                          )}
                          {selectedSub.data.organizationType && (
                            <p className="flex items-center gap-2"><Users size={13} className="text-brand-gold/80" /> <strong>Org Type:</strong> {selectedSub.data.organizationType}</p>
                          )}
                          {selectedSub.formType === "booking_dr_fid" && (
                            <>
                              <p className="flex items-center gap-2"><Calendar size={13} className="text-brand-gold/80" /> <strong>Event Type:</strong> {selectedSub.data.eventType} ({selectedSub.data.bookingType})</p>
                              <p className="flex items-center gap-2"><span className="text-brand-gold/80">🕒</span> <strong>Duration:</strong> {selectedSub.data.duration}</p>
                            </>
                          )}
                        </div>
                      </div>

                      {selectedSub.formType === "booking_dr_fid" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-y border-white/5 py-6 my-6">
                           <div className="space-y-4">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Event Logistics</h5>
                              <p className="text-xs"><strong>Title:</strong> {selectedSub.data.eventTitle}</p>
                              <p className="text-xs"><strong>Date & Time:</strong> {selectedSub.data.date} @ {selectedSub.data.time}</p>
                              <p className="text-xs"><strong>Location:</strong> {selectedSub.data.location} ({selectedSub.data.venue})</p>
                              <p className="text-xs"><strong>Audience Size:</strong> {selectedSub.data.audienceSize}</p>
                           </div>
                           <div className="space-y-4">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Engagment Info</h5>
                              <p className="text-xs"><strong>Theme:</strong> {selectedSub.data.eventTheme}</p>
                              <p className="text-xs"><strong>Preferred Topic:</strong> {selectedSub.data.preferredTopic}</p>
                              <p className="text-xs"><strong>Transport/Accom:</strong> {selectedSub.data.travelSupport} / {selectedSub.data.accommodation}</p>
                              <p className="text-xs"><strong>Presentation Needs:</strong> {selectedSub.data.presentationNeeds}</p>
                           </div>
                        </div>
                      )}

                      {/* Proposal Message/Pitch */}
                      {(selectedSub.data.proposal || selectedSub.data.message || selectedSub.data.eventDescription || selectedSub.data.notes) && (
                        <div className="bg-white/[0.02] border border-white/5 p-4 space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-wider text-white/30 flex items-center gap-1.5 border-b border-white/5 pb-2">
                            <MessageSquare size={11} /> Detailed Notes / Description
                          </p>
                          <p className="text-xs leading-relaxed text-white/80 select-all whitespace-pre-wrap">
                            {selectedSub.data.eventDescription || selectedSub.data.proposal || selectedSub.data.message || selectedSub.data.notes}
                          </p>
                        </div>
                      )}

                      {/* Uploaded File Reference */}
                      {selectedSub.data.fileName && (
                        <div className="bg-zinc-950/40 border border-brand-gold/20 p-4 flex items-center justify-between">
                          <span className="flex items-center gap-2 text-xs">
                            <FileText className="text-brand-gold" size={16} />
                            <div>
                              <p className="font-bold text-white mb-0.5">{selectedSub.data.fileName}</p>
                              <p className="text-[10px] text-white/40">File Size: {selectedSub.data.fileSize ? `${(selectedSub.data.fileSize / 1024 / 1024).toFixed(2)} MB` : "Unknown"}</p>
                            </div>
                          </span>
                          <span className="text-[10px] uppercase font-black tracking-wider text-brand-gold bg-brand-gold/5 border border-brand-gold/20 px-2.5 py-1">
                            Uploaded via UI
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Tab: Orders Manager */}
              {activeTab === "orders" && (
                <motion.div
                  key="orders-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black uppercase tracking-wider text-brand-gold">
                      Master Order Manager
                    </h3>
                  </div>

                  <AdminOrdersPanel orders={orders} onRefresh={loadOrders} />
                </motion.div>
              )}
              
              {/* Tab: Business Details Profile */}
               {activeTab === "business_details" && (
                <motion.div
                  key="business-details-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6"
                >
                  <AdminBusinessProfile />
                </motion.div>
              )}

              {/* Tab: Checkout Settings */}
               {activeTab === "checkout_settings" && (
                <motion.div
                  key="checkout-settings-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6"
                >
                  <AdminCheckoutSettings />
                </motion.div>
              )}

              {/* Tab 2: Categorized Content Section Editor */}
              {activeTab === "content" && (
                <motion.div
                  key="content-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <div className="bg-white/[0.02] border border-white/5 p-6">
                    <p className="text-xs text-white/60 mb-6 leading-relaxed">
                      💡 <strong>Visual Designer Hint:</strong> You can edit typography and bios directly "Inline" globally on any section of the live Home, About, and Team pages! Simply navigate to those pages using the site navigation menu while logged in as admin to edit visually, or manage them in bulk below.
                    </p>

                      <div className="flex flex-wrap gap-2 mb-8 border-b border-white/5 pb-2">
                        {["home", "about_us", "about_dr_fid", "dr_fid_booking", "join_community", "focus_areas", "testimonials", "team_partner", "projects_events", "gallery", "contact", "support", "policy_terms", "footer"].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveContentTab(tab as any)}
                            className={`px-4 py-2 text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer ${
                              activeContentTab === tab
                                ? "bg-brand-gold text-brand-black"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                            }`}
                          >
                            {tab === "home" ? "Home" 
                             : tab === "about_us" ? "About Us Page" 
                             : tab === "about_dr_fid" ? "About Dr. FID" 
                             : tab === "dr_fid_booking" ? "Dr. FID Booking"
                             : tab === "join_community" ? "Join Community"
                             : tab === "support" ? "Support/Donate"
                             : tab === "policy_terms" ? "Policy & Terms"
                             : tab === "footer" ? "Footer Editor"
                             : tab.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    <div className="space-y-12">
                      <AdminContentRenderer activeContentTab={activeContentTab} handleSaveAllContent={handleSaveAllContent} saveStatus={saveStatus} />
                    </div>

                    {/* SAVE ACTION DOCK IN TAB */}
                    <div className="border-t border-white/10 mt-12 pt-12 text-right">
                      <button
                        type="button"
                        onClick={handleSaveAllContent}
                        disabled={saveStatus === "saving"}
                        className="px-12 py-5 bg-brand-gold hover:bg-white text-brand-black px-10 font-black tracking-widest text-xs uppercase transition-all duration-500 shadow-2xl inline-flex items-center gap-3 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-95 transform transition-transform"
                      >
                        {saveStatus === "saving" ? "Persisting Changes..." : "Commit Site Changes"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Config Settings */}
              {["general", "branding", "seo", "security", "social"].includes(activeTab) && (
                <motion.div
                  key="settings-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6 space-y-8 rounded-none"
                >
                  <div className="flex justify-between items-start md:items-center gap-4 flex-col md:flex-row pb-4 border-b border-white/5">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
                        ⚙️ {activeTab.toUpperCase()} Portal Settings
                      </h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Configure {activeTab} parameters.</p>
                    </div>
                    <div>
                      <button
                        onClick={handleSaveAllContent}
                        disabled={saveStatus === "saving"}
                        className="px-6 py-2.5 bg-brand-gold hover:bg-white text-brand-black font-black tracking-widest text-[9px] uppercase transition-all duration-300 shadow active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        {saveStatus === "saving" ? "Saving..." : "Save Setup"}
                      </button>
                    </div>
                  </div>
                  <AdminSettingsTab activeTab={activeTab as any} />
                </motion.div>
              )}


              {/* Tab 4: Navigation Preview */}
              {activeTab === "navigation" && (
                <motion.div
                  key="navigation-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6 space-y-8 rounded-none"
                >
                  <div className="flex justify-between items-start md:items-center gap-4 flex-col md:flex-row pb-4 border-b border-white/5">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
                        🗺️ Navigation Schema Manager
                      </h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Real-time mapping and schema configuration.</p>
                    </div>
                    <div>
                      <button
                        onClick={handleSaveAllContent}
                        disabled={saveStatus === "saving"}
                        className="px-6 py-2.5 bg-brand-gold hover:bg-white text-brand-black font-black tracking-widest text-[9px] uppercase transition-all duration-300 shadow active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        {saveStatus === "saving" ? "Saving..." : "Save Navigation"}
                      </button>
                    </div>
                  </div>

                  <NavigationMenuManager />
                </motion.div>
              )}

              {/* Tab 5: Reorder Sections Panel */}
              {activeTab === "reorder_sections" && (
                <motion.div
                  key="reorder-sections-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6 space-y-8 rounded-none animate-fade-in"
                >
                  <div className="flex justify-between items-start md:items-center gap-4 flex-col md:flex-row pb-4 border-b border-white/5">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
                        ↕️ Section Ordering Manager
                      </h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Adjust segment layout and sequence lists.</p>
                    </div>
                    <div>
                      <button
                        onClick={handleSaveAllContent}
                        disabled={saveStatus === "saving"}
                        className="px-6 py-2.5 bg-brand-gold hover:bg-white text-brand-black font-black tracking-widest text-[9px] uppercase transition-all duration-300 shadow active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        {saveStatus === "saving" ? "Saving..." : "Commit Sequence Changes"}
                      </button>
                    </div>
                  </div>

                  <AdminReorderPanel />
                </motion.div>
              )}

              {/* Tab 6: Products Catalog Editor */}
              {activeTab === "products" && (
                <motion.div
                  key="products-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6 space-y-8 rounded-none animate-fade-in"
                >
                  <div className="flex justify-between items-start md:items-center gap-4 flex-col md:flex-row pb-4 border-b border-white/5">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
                        📦 Products Catalog & External Source Manager
                      </h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Configure external API integrations and edit curated formulary listings.</p>
                    </div>
                    <div>
                      <button
                        onClick={handleSaveAllContent}
                        disabled={saveStatus === "saving"}
                        className="px-6 py-2.5 bg-brand-gold hover:bg-white text-brand-black font-black tracking-widest text-[9px] uppercase transition-all duration-300 shadow active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        {saveStatus === "saving" ? "Saving..." : "Commit Catalog Changes"}
                      </button>
                    </div>
                  </div>

                  <AdminProductsPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      <AdminFooter />
    </div>
    </>
  );
}
