import React, { useState } from "react";
import { useContent, ContentData } from "../../context/ContentContext";
import { Eye, EyeOff } from "lucide-react";

const HOME_SECTIONS = [
  { id: "primary_hero", label: "Primary Hero Banner" },
  { id: "about_the_room", label: "About the Room / Identity" },
  { id: "identity_grid", label: "Identity Grid & Overrides (Dynamic List)" },
  { id: "partners", label: "Partners & Sponsors" },
  { id: "about_section", label: "About / Holistic Healing model text" },
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
  { id: "about_hero", label: "Community Hero Intro Banner" },
  { id: "manifesto", label: "The Room Manifesto & Bio Box" },
  { id: "mission_vision", label: "Strategic Mission & Vision Goals" },
  { id: "who_we_serve", label: "Who We Serve Custom Grid" },
  { id: "differentiators", label: "What Makes Us Different" },
  { id: "core_values", label: "Our DNA & Core Values Matrix" },
  { id: "promise", label: "The Room Commitments & Star Promise" }
];

const TELEGRAM_SECTIONS = [
  { id: "telegram_hero", label: "Immersive Telegram Hero Banner with Text" },
  { id: "telegram_purpose_pain", label: "Purpose & Common Health Pain Points Grid" },
  { id: "telegram_bento", label: "Bento Grid (Core Mission & Healing)" },
  { id: "telegram_showcase", label: "Inside Community Showcase (Chat topics)" },
  { id: "telegram_benefits", label: "What You Get (Masterclass, Community, Retreats)" },
  { id: "telegram_who_should_join", label: "Who This Free Collective Is For" },
  { id: "telegram_founder", label: "Meet the Founder Messaging Section (Dr. FID)" },
  { id: "telegram_promise", label: "The Vagina Room Community Promises Outline" },
  { id: "telegram_community_sisterhood", label: "Sisterhood Support Banner and Image" },
  { id: "telegram_cta", label: "CTA Booking / Joining Next Step Base" }
];

const MEMBER_SIDEBAR_SECTIONS = [
  { id: "dashboard", label: "Dashboard Hub (Home)" },
  { id: "reflection", label: "Wellness Reflection (Mood journal)" },
  { id: "profile", label: "My Profile" },
  { id: "resources", label: "Resource Library" },
  { id: "programs", label: "Programs & Courses" },
  { id: "events", label: "Events Calendar" },
  { id: "community", label: "Community / Sisterhood Feeds" },
  { id: "inbox", label: "Private Inbox (DMs)" },
  { id: "shop", label: "Member Micro Shop" },
  { id: "id_card", label: "Digital Membership Card" },
  { id: "referral", label: "Refer & Earn Affiliate System" },
  { id: "support", label: "Helpdesk Support" },
  { id: "settings", label: "Dashboard Settings" }
];

const ADMIN_SIDEBAR_SECTIONS = [
  { id: "dashboard", label: "📊 Dashboard Overview" },
  { id: "members", label: "👥 Members Manager" },
  { id: "approvals", label: "✅ Pending Approvals" },
  { id: "payouts", label: "💵 Payouts Manager" },
  { id: "partners", label: "🤝 Investors & Collaborators" },
  { id: "moderation", label: "🛡️ Community Moderator" },
  { id: "submissions", label: "📄 Form Submissions" },
  { id: "content", label: "📝 Site Content Editor" },
  { id: "reorder_sections", label: "↕️ Reorder Sections & Sidebars" },
  { id: "sales_trends", label: "📈 Sales Trends Charts" },
  { id: "discount_codes", label: "🎟️ Discount Codes" },
  { id: "navigation", label: "🗺️ Navigation Setup" },
  { id: "telegram_config", label: "🤖 Telegram Config" },
  { id: "automation", label: "⚡ Automated Marketing" },
  { id: "events", label: "📅 Events & Calendar" },
  { id: "resources", label: "📚 Resource Library" },
  { id: "community", label: "💬 Community Hub & Badges" },
  { id: "products", label: "📦 Products Catalog" },
  { id: "orders", label: "🛒 Order Manager" },
  { id: "business_details", label: "🏢 Business Profile & WhatsApp Sync" },
  { id: "checkout_settings", label: "💳 Checkout & Delivery Cost Zones" },
  { id: "payment_gateways", label: "💰 Payment Gateways" },
  { id: "media_sync", label: "☁️ Media & Cloud Sync (Cloudinary)" },
  { id: "page_manager", label: "📄 Page Manager (CMS pages)" },
  { id: "page_visibility", label: "👁️ Page Visibility Settings" },
  { id: "blog_manager", label: "✍️ Blog Manager (Gazette Press)" },
  { id: "media_manager", label: "🖼️ Media Manager" },
  { id: "general", label: "⚙️ General Backend Config" },
  { id: "branding", label: "🎨 Brand Colors & Typographies" },
  { id: "seo", label: "🌐 SEO Metadata Controls" },
  { id: "security", label: "🔒 Security & Keys" },
  { id: "social", label: "🌐 Footer Social Media links" },
  { id: "integrations", label: "🔌 API Providers & Sources" },
  { id: "permissions", label: "🔑 Admin Permissions Matrix" }
];

export default function AdminReorderPanel() {
  const { content, updateContentField } = useContent();
  const [selectedPage, setSelectedPage] = useState<"home" | "drfid" | "about" | "telegram" | "member_sidebar" | "admin_sidebar">("home");

  const fieldKey = selectedPage === "home" ? "homePageSectionsOrder" 
                 : selectedPage === "drfid" ? "drFidPageSectionsOrder" 
                 : selectedPage === "telegram" ? "telegramPageSectionsOrder"
                 : selectedPage === "about" ? "aboutPageSectionsOrder"
                 : selectedPage === "member_sidebar" ? "memberSidebarOrderJson"
                 : "adminSidebarOrderJson";

  const allPossibleSections = selectedPage === "home" ? HOME_SECTIONS 
                            : selectedPage === "drfid" ? DR_FID_SECTIONS 
                            : selectedPage === "telegram" ? TELEGRAM_SECTIONS
                            : selectedPage === "about" ? ABOUT_SECTIONS
                            : selectedPage === "member_sidebar" ? MEMBER_SIDEBAR_SECTIONS
                            : ADMIN_SIDEBAR_SECTIONS;

  const currentOrder: string[] = (() => {
    const val = content[fieldKey as keyof ContentData];
    const defaultIds = allPossibleSections.map(s => s.id);
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const blended = [...parsed];
          defaultIds.forEach(id => {
            if (!blended.includes(id)) {
              blended.push(id);
            }
          });
          return blended;
        }
      } catch(e) {}
    }
    return defaultIds;
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
      updated = [...currentOrder];
      updated.push(id);
    }
    
    updateContentField(fieldKey as any, JSON.stringify(updated));
  };

  const resetToDefaultLayout = () => {
    if (!window.confirm("Restating will restore the default sequence order. Proceed?")) return;
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
        <button
          onClick={() => setSelectedPage("telegram")}
          className={`px-4 py-2 text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer ${
            selectedPage === "telegram" ? "bg-brand-gold text-brand-black" : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          Telegram Page ({TELEGRAM_SECTIONS.length} segments)
        </button>
        <button
          onClick={() => setSelectedPage("member_sidebar")}
          className={`px-4 py-2 text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer ${
            selectedPage === "member_sidebar" ? "bg-brand-gold text-brand-black" : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          👤 Member Sidebar Menu ({MEMBER_SIDEBAR_SECTIONS.length} items)
        </button>
        <button
          onClick={() => setSelectedPage("admin_sidebar")}
          className={`px-4 py-2 text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer ${
            selectedPage === "admin_sidebar" ? "bg-brand-gold text-brand-black" : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          👑 Admin Sidebar Menu ({ADMIN_SIDEBAR_SECTIONS.length} items)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
