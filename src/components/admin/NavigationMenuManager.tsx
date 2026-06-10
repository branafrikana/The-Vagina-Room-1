import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { 
  Settings, 
  Palette, 
  Globe, 
  Shield, 
  Layout, 
  Columns, 
  Plus, 
  Trash2, 
  Check, 
  Compass, 
  Eye, 
  Search, 
  Bell, 
  MessageSquare, 
  User, 
  ChevronUp,
  ChevronDown,
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  BookOpen,
  Activity,
  Calendar,
  Inbox,
  Home,
  Menu,
  Sparkles,
  Minus
} from 'lucide-react';

// Maps icon name string to Lucide JSX component
function renderDynamicIcon(iconName: string, size = 14) {
  const map: Record<string, React.ReactNode> = {
    Home: <Home size={size} />,
    Layout: <Layout size={size} />,
    MessageSquare: <MessageSquare size={size} />,
    Settings: <Settings size={size} />,
    Activity: <Activity size={size} />,
    FileText: <BookOpen size={size} />,
    BookOpen: <BookOpen size={size} />,
    Users: <User size={size} />,
    Calendar: <Calendar size={size} />,
    Shield: <Shield size={size} />,
    Inbox: <Inbox size={size} />,
    ExternalLink: <ExternalLink size={size} />
  };
  return map[iconName] || <Compass size={size} />;
}

const AVAILABLE_ICONS = [
  "Home", "Layout", "MessageSquare", "Settings", "Activity", "BookOpen", "Users", "Calendar", "Shield", "Inbox", "ExternalLink"
];

function InlineImageUploader({ 
  value, 
  onChange, 
  label,
  placeholder = "Image URL"
}: { 
  value: string; 
  onChange: (url: string) => void; 
  label: string;
  placeholder?: string;
}) {
  const { uploadImage } = useContent();
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setStatus("error");
      setErrorText("File size exceeds 10MB limit.");
      return;
    }

    setStatus("uploading");
    setErrorText("");

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await uploadImage(base64Data, file.name);
        if (res.success && res.url) {
          onChange(res.url);
          setStatus("success");
          setTimeout(() => setStatus("idle"), 3000);
        } else {
          setStatus("error");
          setErrorText(res.error || "Upload rejected.");
        }
      } catch (err) {
        setStatus("error");
        setErrorText("Unexpected upload error.");
      }
    };
    reader.onerror = () => {
      setStatus("error");
      setErrorText("Could not read file data.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">{label}</label>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/5 p-4 border border-white/10">
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-2.5 text-white text-xs focus:border-brand-gold focus:outline-none font-mono"
            placeholder={placeholder}
          />
          <div className="flex items-center gap-2">
            <label className="cursor-pointer bg-brand-red hover:bg-white text-white hover:text-brand-black px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] transition-colors inline-block text-center rounded-none select-none">
              {status === 'uploading' ? 'Uploading...' : 'Upload Image'}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>
            {status === 'success' && <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider">✓ Success</span>}
            {status === 'error' && <span className="text-[9px] text-brand-red font-bold uppercase tracking-wider">{errorText || 'Error'}</span>}
          </div>
        </div>
        <div className="flex-shrink-0 self-center">
          {value ? (
            <img 
              src={value} 
              alt="Preview" 
              className="w-16 h-16 object-cover border border-white/10"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-white/20 text-xs">
              None
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NavigationMenuManager() {
  const { content, updateContentField } = useContent();

  const [activeSubTab, setActiveSubTab] = useState<"header" | "sidebar" | "footer">("header");

  // Local helper parsing state or fallback
  const getParsedValue = (key: string, defaultValue: any) => {
    try {
      const fieldVal = (content as any)[key];
      if (!fieldVal) return defaultValue;
      return JSON.parse(fieldVal);
    } catch (e) {
      return defaultValue;
    }
  };

  const setParsedValue = (key: string, value: any) => {
    updateContentField(key as any, JSON.stringify(value, null, 2));
  };

  // Parsed Local States
  const general = getParsedValue("generalSettingsJson", {
    siteName: "The Vagina Room",
    metaTitle: "The Vagina Room - Holistic Wellness & Intimate Reproductive Education",
    supportEmail: "info@thevaginaroom.com",
    supportPhone: "+234 813 546 4432",
    timezone: "UTC+1 (Lagos)"
  });

  const branding = getParsedValue("brandingSettingsJson", {
    primaryColor: "#C41E3A",
    secondaryColor: "#D4AF37",
    fontFamily: "Inter",
    buttonRoundness: "md",
    logoUrlAlt: ""
  });

  const seo = getParsedValue("seoSettingsJson", {
    metaDescription: "A safe haven and global supportive community providing trusted clinical education, restorative therapy, and guidance.",
    metaKeywords: "women's health, reproductive health, vaginal health, Dr. FID, intimate wellness",
    ogImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80",
    authorName: "Dr. FID"
  });

  const security = getParsedValue("securitySettingsJson", {
    sessionTimeout: "60 mins",
    twoFactorAuth: "Optional",
    restrictIframe: "No",
    allowedOrigins: "*"
  });

  const header = getParsedValue("topHeaderSettingsJson", {
    logoText: "The Vagina Room",
    logoImageUrl: "",
    enableSearchBar: true,
    enableNotificationsIcon: true,
    enableMessagesIcon: true,
    enableAdminProfileDropdown: true
  });

  const headerMenu = getParsedValue("headerMenuJson", []);
  const footerMenu = getParsedValue("footerMenuJson", []);

  const sidebar = getParsedValue("leftSidebarSettingsJson", {
    isCollapsible: true,
    defaultCollapsed: false,
    sections: [
      {
        label: "Main Operations",
        items: [
          { label: "Client Enquiries", path: "/admin?tab=submissions", icon: "Inbox", badge: "Active" },
          { label: "Live Page Designer", path: "/admin?tab=content", icon: "Layout", badge: "" }
        ]
      },
      {
        label: "Content Management",
        items: [
          { label: "Community Content", path: "/admin?tab=content&sub=home", icon: "Home", badge: "" },
          { label: "Reproductive Focus Areas", path: "/admin?tab=content&sub=focus_areas", icon: "BookOpen", badge: "" },
          { label: "Testimonials Slider", path: "/admin?tab=content&sub=testimonials", icon: "MessageSquare", badge: "" }
        ]
      }
    ],
    quickAccessLinks: [
      { label: "View Live Site", path: "/", icon: "ExternalLink" },
      { label: "System Settings", path: "/admin?tab=settings", icon: "Settings" }
    ]
  });

  // Helpers to update localized blocks
  const updateGeneral = (field: string, val: any) => {
    const updated = { ...general, [field]: val };
    setParsedValue("generalSettingsJson", updated);
  };

  const updateBranding = (field: string, val: any) => {
    const updated = { ...branding, [field]: val };
    setParsedValue("brandingSettingsJson", updated);
  };

  const updateSeo = (field: string, val: any) => {
    const updated = { ...seo, [field]: val };
    setParsedValue("seoSettingsJson", updated);
  };

  const updateSecurity = (field: string, val: any) => {
    const updated = { ...security, [field]: val };
    setParsedValue("securitySettingsJson", updated);
  };

  const updateHeader = (field: string, val: any) => {
    const updated = { ...header, [field]: val };
    setParsedValue("topHeaderSettingsJson", updated);
  };

  const updateSidebar = (updatedSidebar: any) => {
    setParsedValue("leftSidebarSettingsJson", updatedSidebar);
  };

  // Section item modifiers
  const handleAddSection = () => {
    const updated = { 
      ...sidebar, 
      sections: [...sidebar.sections, { label: "New Section", items: [] }] 
    };
    updateSidebar(updated);
  };

  const handleRemoveSection = (secIndex: number) => {
    const filtered = sidebar.sections.filter((_: any, idx: number) => idx !== secIndex);
    updateSidebar({ ...sidebar, sections: filtered });
  };

  const handleUpdateSectionLabel = (secIndex: number, newLabel: string) => {
    const updatedSections = [...sidebar.sections];
    updatedSections[secIndex].label = newLabel;
    updateSidebar({ ...sidebar, sections: updatedSections });
  };

  // Subsection menu item modifiers
  const handleAddSectionItem = (secIndex: number) => {
    const updatedSections = [...sidebar.sections];
    updatedSections[secIndex].items = [
      ...updatedSections[secIndex].items, 
      { label: "New Menu Link", path: "/", icon: "Compass", badge: "" }
    ];
    updateSidebar({ ...sidebar, sections: updatedSections });
  };

  const handleRemoveSectionItem = (secIndex: number, itemIndex: number) => {
    const updatedSections = [...sidebar.sections];
    updatedSections[secIndex].items = updatedSections[secIndex].items.filter((_: any, idx: number) => idx !== itemIndex);
    updateSidebar({ ...sidebar, sections: updatedSections });
  };

  const handleUpdateSectionItem = (secIndex: number, itemIndex: number, field: string, val: any) => {
    const updatedSections = [...sidebar.sections];
    updatedSections[secIndex].items[itemIndex] = {
      ...updatedSections[secIndex].items[itemIndex],
      [field]: val
    };
    updateSidebar({ ...sidebar, sections: updatedSections });
  };

  // Quick Access Link Modifiers
  const handleAddQuickLink = () => {
    const updated = {
      ...sidebar,
      quickAccessLinks: [...(sidebar.quickAccessLinks || []), { label: "Quick Link", path: "/", icon: "ExternalLink" }]
    };
    updateSidebar(updated);
  };

  const handleRemoveQuickLink = (idx: number) => {
    const filtered = sidebar.quickAccessLinks.filter((_: any, i: number) => i !== idx);
    updateSidebar({ ...sidebar, quickAccessLinks: filtered });
  };

  const handleUpdateQuickLink = (idx: number, field: string, val: any) => {
    const updatedLinks = [...sidebar.quickAccessLinks];
    updatedLinks[idx] = { ...updatedLinks[idx], [field]: val };
    updateSidebar({ ...sidebar, quickAccessLinks: updatedLinks });
  };

  // Header Menu Modifiers
  const handleAddHeaderItem = () => {
    const updated = [...headerMenu, { name: "New Link", href: "/", submenu: [] }];
    setParsedValue("headerMenuJson", updated);
  };

  const handleRemoveHeaderItem = (idx: number) => {
    const updated = headerMenu.filter((_: any, i: number) => i !== idx);
    setParsedValue("headerMenuJson", updated);
  };

  const handleUpdateHeaderItem = (idx: number, field: string, val: any) => {
    const updated = [...headerMenu];
    updated[idx] = { ...updated[idx], [field]: val };
    setParsedValue("headerMenuJson", updated);
  };

  const handleAddHeaderSubItem = (parentIdx: number) => {
    const updated = [...headerMenu];
    const sub = updated[parentIdx].submenu || [];
    updated[parentIdx] = { 
      ...updated[parentIdx], 
      submenu: [...sub, { name: "New Sub-link", href: "/" }] 
    };
    setParsedValue("headerMenuJson", updated);
  };

  const handleRemoveHeaderSubItem = (parentIdx: number, subIdx: number) => {
    const updated = [...headerMenu];
    const sub = updated[parentIdx].submenu.filter((_: any, i: number) => i !== subIdx);
    updated[parentIdx] = { ...updated[parentIdx], submenu: sub };
    setParsedValue("headerMenuJson", updated);
  };

  const handleUpdateHeaderSubItem = (parentIdx: number, subIdx: number, field: string, val: any) => {
    const updated = [...headerMenu];
    const sub = [...updated[parentIdx].submenu];
    sub[subIdx] = { ...sub[subIdx], [field]: val };
    updated[parentIdx] = { ...updated[parentIdx], submenu: sub };
    setParsedValue("headerMenuJson", updated);
  };

  const handleMoveHeaderItem = (idx: number, direction: 'up' | 'down') => {
    const updated = [...headerMenu];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    [updated[idx], updated[targetIdx]] = [updated[targetIdx], updated[idx]];
    setParsedValue("headerMenuJson", updated);
  };

  const handleMoveHeaderSubItem = (parentIdx: number, subIdx: number, direction: 'up' | 'down') => {
    const updatedSub = [...headerMenu[parentIdx].submenu];
    const targetIdx = direction === 'up' ? subIdx - 1 : subIdx + 1;
    if (targetIdx < 0 || targetIdx >= updatedSub.length) return;
    [updatedSub[subIdx], updatedSub[targetIdx]] = [updatedSub[targetIdx], updatedSub[subIdx]];
    const updatedHeader = [...headerMenu];
    updatedHeader[parentIdx] = { ...updatedHeader[parentIdx], submenu: updatedSub };
    setParsedValue("headerMenuJson", updatedHeader);
  };

  // Footer Menu Modifiers
  const handleAddFooterItem = () => {
    const updated = [...footerMenu, { name: "New Footer Link", href: "/" }];
    setParsedValue("footerMenuJson", updated);
  };

  const handleRemoveFooterItem = (idx: number) => {
    const updated = footerMenu.filter((_: any, i: number) => i !== idx);
    setParsedValue("footerMenuJson", updated);
  };

  const handleUpdateFooterItem = (idx: number, field: string, val: any) => {
    const updated = [...footerMenu];
    updated[idx] = { ...updated[idx], [field]: val };
    setParsedValue("footerMenuJson", updated);
  };

  const handleMoveFooterItem = (idx: number, direction: 'up' | 'down') => {
    const updated = [...footerMenu];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    [updated[idx], updated[targetIdx]] = [updated[targetIdx], updated[idx]];
    setParsedValue("footerMenuJson", updated);
  };

  const [showAdvancedHeader, setShowAdvancedHeader] = useState(false);
  const [showAdvancedFooter, setShowAdvancedFooter] = useState(false);

  return (
    <div className="space-y-10">
      
      {/* Configuration Hub Sub-Selection Tab Bar */}
      <div className="flex flex-wrap gap-2.5 border-b border-white/5 pb-4">
        <button
          onClick={() => setActiveSubTab("header")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === "header" ? "bg-brand-gold text-brand-black" : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          <Layout size={12} /> Header
        </button>
        <button
          onClick={() => setActiveSubTab("sidebar")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === "sidebar" ? "bg-brand-gold text-brand-black" : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          <Columns size={12} /> Left Sidebar Menu
        </button>
        <button
          onClick={() => setActiveSubTab("footer")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === "footer" ? "bg-brand-gold text-brand-black" : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          <Layout size={12} /> Footer
        </button>
      </div>

      {/* Grid Layout separating inputs from mock preview */}
      <div className="grid grid-cols-1 gap-10">

        {/* Form Inputs Panel */}
        <div className="xl:col-span-7 space-y-8">

          {/* SubTab Panel 5: Top Header */}
          {activeSubTab === "header" && (
            <div className="space-y-10">
              <div className="border-b border-white/5 pb-3">
                <h4 className="text-sm font-black uppercase tracking-widest text-brand-gold">Global Top Header Configuration</h4>
                <p className="text-[10px] text-white/40 mt-1">Update top-level brand logos, interactive tool search boxes, and alert drop boxes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Top Header Logo Text</label>
                  <input
                    type="text"
                    value={header.logoText || ""}
                    onChange={(e) => updateHeader("logoText", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold focus:outline-none"
                    placeholder="e.g. The Vagina Room"
                  />
                </div>

                <div className="space-y-2">
                  <InlineImageUploader
                    label="Top Header Brand Symbol Logo Image"
                    value={header.logoImageUrl || ""}
                    onChange={(url) => updateHeader("logoImageUrl", url)}
                    placeholder="Absolute URL link"
                  />
                </div>
              </div>

              {/* Visual Header Menu Editor */}
              <div className="space-y-6 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                   <div>
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-white/70">Visual Menu Manager</h5>
                      <p className="text-[9px] text-white/30 uppercase mt-1">Manage primary navigation links and their dropdown submenus.</p>
                   </div>
                   <button
                    onClick={handleAddHeaderItem}
                    className="px-4 py-1.5 bg-brand-gold/10 hover:bg-brand-gold hover:text-brand-black border border-brand-gold/30 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer text-brand-gold"
                  >
                    + Add Primary Link
                  </button>
                </div>

                <div className="space-y-4">
                  {headerMenu.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white/5 border border-white/10 p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase tracking-widest text-white/30">Display Name</label>
                            <input 
                               type="text"
                               value={item.name || ""}
                               onChange={(e) => handleUpdateHeaderItem(idx, "name", e.target.value)}
                               className="w-full bg-brand-black border border-white/10 p-2 text-white text-xs focus:border-brand-gold"
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase tracking-widest text-white/30">Link Target / Path</label>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={item.href || ""}
                                onChange={(e) => handleUpdateHeaderItem(idx, "href", e.target.value)}
                                className="flex-1 bg-brand-black border border-white/10 p-2 text-white text-xs font-mono focus:border-brand-gold"
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleMoveHeaderItem(idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-2 text-white/30 hover:text-brand-gold bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                                >
                                  <ChevronUp size={14} />
                                </button>
                                <button
                                  onClick={() => handleMoveHeaderItem(idx, 'down')}
                                  disabled={idx === headerMenu.length - 1}
                                  className="p-2 text-white/30 hover:text-brand-gold bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                                >
                                  <ChevronDown size={14} />
                                </button>
                                <button
                                  onClick={() => handleRemoveHeaderItem(idx)}
                                  className="p-2 text-white/30 hover:text-brand-red bg-white/5 hover:bg-brand-red/10 border border-white/10 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                         </div>
                      </div>

                      {/* Submenu editor for this item */}
                      <div className="pl-6 border-l-2 border-white/5 space-y-3">
                         <div className="flex justify-between items-center">
                            <h6 className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Submenu Links</h6>
                            <button 
                              onClick={() => handleAddHeaderSubItem(idx)}
                              className="text-[8px] font-black uppercase tracking-widest text-brand-gold hover:text-white transition-colors"
                            >
                              + Add Sub-link
                            </button>
                         </div>
                         <div className="space-y-2">
                           {item.submenu?.map((sub: any, subIdx: number) => (
                             <div key={subIdx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-brand-black/40 p-2 border border-white/5">
                                <div className="md:col-span-1 text-[9px] font-mono text-white/20">#{subIdx+1}</div>
                                <input 
                                  value={sub.name || ""}
                                  onChange={(e) => handleUpdateHeaderSubItem(idx, subIdx, "name", e.target.value)}
                                  className="md:col-span-4 bg-transparent border-b border-white/10 p-1 text-[11px] text-white"
                                  placeholder="Sub Label"
                                />
                                <input 
                                  value={sub.href || ""}
                                  onChange={(e) => handleUpdateHeaderSubItem(idx, subIdx, "href", e.target.value)}
                                  className="md:col-span-4 bg-transparent border-b border-white/10 p-1 text-[11px] text-white/50 font-mono"
                                  placeholder="/path"
                                />
                                <div className="md:col-span-3 flex justify-end gap-1">
                                  <button
                                    onClick={() => handleMoveHeaderSubItem(idx, subIdx, 'up')}
                                    disabled={subIdx === 0}
                                    className="text-white/20 hover:text-brand-gold transition-colors disabled:opacity-0"
                                  >
                                    <ChevronUp size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleMoveHeaderSubItem(idx, subIdx, 'down')}
                                    disabled={subIdx === item.submenu.length - 1}
                                    className="text-white/20 hover:text-brand-gold transition-colors disabled:opacity-0"
                                  >
                                    <ChevronDown size={12} />
                                  </button>
                                  <button 
                                    onClick={() => handleRemoveHeaderSubItem(idx, subIdx)}
                                    className="text-white/20 hover:text-brand-red transition-colors"
                                  >
                                    <Minus size={12} />
                                  </button>
                                </div>
                             </div>
                           ))}
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <button 
                  onClick={() => setShowAdvancedHeader(!showAdvancedHeader)}
                  className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  {showAdvancedHeader ? "Hide" : "Show"} Advanced JSON Data Manager
                </button>
                {showAdvancedHeader && (
                  <div className="mt-4 space-y-4 animate-fadeIn">
                    <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Header Menu Schema (JSON)</label>
                    <textarea
                      value={JSON.stringify(headerMenu, null, 2)}
                      onChange={(e) => {
                        try {
                          setParsedValue("headerMenuJson", JSON.parse(e.target.value));
                        } catch (err) { }
                      }}
                      className="w-full h-80 bg-brand-black border border-white/10 p-3 text-white text-xs font-mono focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/5 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Visible UI Toggle Controls</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-3.5 bg-brand-black border border-white/10 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!header.enableSearchBar}
                        onChange={(e) => updateHeader("enableSearchBar", e.target.checked)}
                        className="rounded border-white/20 bg-brand-black text-brand-gold focus:ring-0 w-4 h-4 cursor-pointer accent-brand-gold"
                      />
                      <div>
                        <span className="text-xs uppercase font-black text-white block">Enable Unified Search Bar</span>
                        <span className="text-[9px] text-white/40 block">Enable search query overlays in system navigation.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 bg-brand-black border border-white/10 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!header.enableNotificationsIcon}
                        onChange={(e) => updateHeader("enableNotificationsIcon", e.target.checked)}
                        className="rounded border-white/20 bg-brand-black text-brand-gold focus:ring-0 w-4 h-4 cursor-pointer accent-brand-gold"
                      />
                      <div>
                        <span className="text-xs uppercase font-black text-white block">Enable Alerts Notifications Bell</span>
                        <span className="text-[9px] text-white/40 block">Show red warning bell for upcoming events and submissions.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 bg-brand-black border border-white/10 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!header.enableMessagesIcon}
                        onChange={(e) => updateHeader("enableMessagesIcon", e.target.checked)}
                        className="rounded border-white/20 bg-brand-black text-brand-gold focus:ring-0 w-4 h-4 cursor-pointer accent-brand-gold"
                      />
                      <div>
                        <span className="text-xs uppercase font-black text-white block">Enable Member Chat Messages Node</span>
                        <span className="text-[9px] text-white/40 block">Show conversation envelope for private community messages.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 bg-brand-black border border-white/10 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!header.enableAdminProfileDropdown}
                        onChange={(e) => updateHeader("enableAdminProfileDropdown", e.target.checked)}
                        className="rounded border-white/20 bg-brand-black text-brand-gold focus:ring-0 w-4 h-4 cursor-pointer accent-brand-gold"
                      />
                      <div>
                        <span className="text-xs uppercase font-black text-white block">Enable Profile Dropdown Panel</span>
                        <span className="text-[9px] text-white/40 block">Visible admin status menu with exit options.</span>
                      </div>
                    </label>
                  </div>
                </div>
            </div>
          )}

          {/* SubTab Panel 6: Left Sidebar Menu Navigation */}
          {activeSubTab === "sidebar" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="border-b border-white/5 pb-3">
                <h4 className="text-sm font-black uppercase tracking-widest text-brand-gold">Left Sidebar Collapsible Navigation Menu</h4>
                <p className="text-[10px] text-white/40 mt-1">Add, remove or organize interactive side panels, category blocks, links and indicators.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 bg-brand-black border border-white/10 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!sidebar.isCollapsible}
                    onChange={(e) => updateSidebar({ ...sidebar, isCollapsible: e.target.checked })}
                    className="rounded border-white/20 bg-brand-black text-brand-gold focus:ring-0 w-4 h-4 cursor-pointer accent-brand-gold"
                  />
                  <div>
                    <span className="text-xs uppercase font-black text-white block">Sidebar is Collapsible</span>
                    <span className="text-[9px] text-white/40 block">Allows users to contract the drawer sidebar menu.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-brand-black border border-white/10 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!sidebar.defaultCollapsed}
                    onChange={(e) => updateSidebar({ ...sidebar, defaultCollapsed: e.target.checked })}
                    className="rounded border-white/20 bg-brand-black text-brand-gold focus:ring-0 w-4 h-4 cursor-pointer accent-brand-gold"
                  />
                  <div>
                    <span className="text-xs uppercase font-black text-white block">Default Contracted</span>
                    <span className="text-[9px] text-white/40 block">Loads contracted with icon-only badges.</span>
                  </div>
                </label>
              </div>

              {/* Sidebar Sections Array List Editor */}
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white/[0.02] border-b border-white/5 pb-2.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">Category Sections ({sidebar.sections?.length || 0})</span>
                  <button
                    onClick={handleAddSection}
                    className="px-3 py-1 bg-brand-gold/10 hover:bg-brand-gold hover:text-brand-black border border-brand-gold/30 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 cursor-pointer text-brand-gold"
                  >
                    <Plus size={11} /> Append Category
                  </button>
                </div>

                <div className="space-y-6">
                  {sidebar.sections?.map((sec: any, secIdx: number) => (
                    <div key={secIdx} className="bg-white/5 border border-white/10 p-4 space-y-4 relative">
                      
                      {/* Section Title */}
                      <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                        <div className="flex-grow flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold text-white/30">SEC #{secIdx+1}</span>
                          <input
                            type="text"
                            value={sec.label || ""}
                            onChange={(e) => handleUpdateSectionLabel(secIdx, e.target.value)}
                            className="bg-brand-black border border-white/10 text-xs font-black uppercase tracking-wider text-brand-gold px-2 py-1 max-w-xs focus:border-brand-gold focus:outline-none"
                            placeholder="Section Title Label"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newSections = [...sidebar.sections];
                              if (secIdx > 0) {
                                [newSections[secIdx - 1], newSections[secIdx]] = [newSections[secIdx], newSections[secIdx - 1]];
                                updateSidebar({ ...sidebar, sections: newSections });
                              }
                            }}
                            disabled={secIdx === 0}
                            className="text-white/30 hover:text-brand-gold disabled:opacity-20"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => {
                              const newSections = [...sidebar.sections];
                              if (secIdx < newSections.length - 1) {
                                [newSections[secIdx + 1], newSections[secIdx]] = [newSections[secIdx], newSections[secIdx + 1]];
                                updateSidebar({ ...sidebar, sections: newSections });
                              }
                            }}
                            disabled={secIdx === sidebar.sections.length - 1}
                            className="text-white/30 hover:text-brand-gold disabled:opacity-20"
                          >
                            <ChevronDown size={14} />
                          </button>
                          <button
                            onClick={() => handleAddSectionItem(secIdx)}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[9px] font-mono border border-white/10 text-white/70 hover:text-white cursor-pointer"
                          >
                            + ADD LINK
                          </button>
                          <button
                            onClick={() => handleRemoveSection(secIdx)}
                            className="p-1 text-white/30 hover:text-brand-red hover:bg-brand-red/10 border border-transparent hover:border-brand-red/20 transition-all cursor-pointer"
                            title="Delete entire section"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Items of Section */}
                      {sec.items?.length === 0 ? (
                        <p className="text-[9px] font-mono text-white/30 italic py-2">No menu links under this category. Append one using the button above.</p>
                      ) : (
                        <div className="space-y-3 pl-2 border-l border-white/5">
                          {sec.items?.map((item: any, itemIdx: number) => (
                            <div key={itemIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end bg-brand-black border border-white/5 p-2.5 relative">
                              
                              <div className="sm:col-span-3 space-y-1">
                                <label className="text-[8px] uppercase tracking-wider font-bold text-white/20">Item Label</label>
                                <input
                                  type="text"
                                  value={item.label || ""}
                                  onChange={(e) => handleUpdateSectionItem(secIdx, itemIdx, "label", e.target.value)}
                                  className="w-full bg-stone-900 border border-white/10 p-1.5 text-white text-[11px] focus:outline-none focus:border-brand-gold"
                                  placeholder="e.g. Dashboard"
                                />
                              </div>

                              <div className="sm:col-span-3 space-y-1">
                                <label className="text-[8px] uppercase tracking-wider font-bold text-white/20">Route / Link Path</label>
                                <input
                                  type="text"
                                  value={item.path || ""}
                                  onChange={(e) => handleUpdateSectionItem(secIdx, itemIdx, "path", e.target.value)}
                                  className="w-full bg-stone-900 border border-white/10 p-1.5 text-white text-[11px] font-mono focus:outline-none"
                                />
                              </div>

                              <div className="sm:col-span-2 space-y-1">
                                <label className="text-[8px] uppercase tracking-wider font-bold text-white/20">Sidebar Icon</label>
                                <select
                                  value={item.icon || "Compass"}
                                  onChange={(e) => handleUpdateSectionItem(secIdx, itemIdx, "icon", e.target.value)}
                                  className="w-full bg-stone-900 border border-white/10 p-1.5 text-white text-[10px] focus:outline-none"
                                >
                                  {AVAILABLE_ICONS.map((ico) => (
                                    <option key={ico} value={ico}>{ico}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="sm:col-span-2 space-y-1">
                                <label className="text-[8px] uppercase tracking-wider font-bold text-white/20">Pill Badge</label>
                                <input
                                  type="text"
                                  value={item.badge || ""}
                                  onChange={(e) => handleUpdateSectionItem(secIdx, itemIdx, "badge", e.target.value)}
                                  className="w-full bg-stone-900 border border-white/10 p-1.5 text-white text-[11px] focus:outline-none"
                                  placeholder="e.g. New"
                                />
                              </div>

                              <div className="sm:col-span-2 text-right pb-1">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSectionItem(secIdx, itemIdx)}
                                  className="text-stone-500 hover:text-brand-red p-1 cursor-pointer hover:bg-brand-red/5 border border-transparent hover:border-brand-red/10"
                                >
                                  <Trash2 size={11} /> Remove
                                </button>
                              </div>

                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Access Sidebar Section */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">⚡ QUICK ACCESS NAVIGATION FOOTER ({sidebar.quickAccessLinks?.length || 0})</span>
                  <button
                    onClick={handleAddQuickLink}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-[9px] font-mono flex items-center gap-1 cursor-pointer"
                  >
                    + ADD QUICK LINK
                  </button>
                </div>

                <div className="space-y-3">
                  {sidebar.quickAccessLinks?.map((q: any, qIdx: number) => (
                    <div key={qIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end bg-white/[0.03] border border-white/10 p-3">
                      
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[8px] uppercase tracking-wider text-white/20 font-bold block">Quick Label</label>
                        <input
                          type="text"
                          value={q.label || ""}
                          onChange={(e) => handleUpdateQuickLink(qIdx, "label", e.target.value)}
                          className="w-full bg-brand-black border border-white/10 p-1.5 text-white text-[11px]"
                        />
                      </div>

                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[8px] uppercase tracking-wider text-white/20 font-bold block">Callback Path / Link</label>
                        <input
                          type="text"
                          value={q.path || ""}
                          onChange={(e) => handleUpdateQuickLink(qIdx, "path", e.target.value)}
                          className="w-full bg-brand-black border border-white/10 p-1.5 text-white text-[11px] font-mono"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[8px] uppercase tracking-wider text-white/20 font-bold block">Icon Symbol</label>
                        <select
                          value={q.icon || "ExternalLink"}
                          onChange={(e) => handleUpdateQuickLink(qIdx, "icon", e.target.value)}
                          className="w-full bg-brand-black border border-white/10 p-1.5 text-white text-[10px]"
                        >
                          {AVAILABLE_ICONS.map((ico) => (
                            <option key={ico} value={ico}>{ico}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-1 text-right pb-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveQuickLink(qIdx)}
                          className="text-white/30 hover:text-brand-red p-1 cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeSubTab === "footer" && (
            <div className="space-y-10">
              <div className="border-b border-white/5 pb-3">
                <h4 className="text-sm font-black uppercase tracking-widest text-brand-gold">Global Footer Menu Configuration</h4>
                <p className="text-[10px] text-white/40 mt-1">Configure site-wide footer navigation menu links.</p>
              </div>

              {/* Visual Footer Menu Editor */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <div>
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-white/70">Visual Manager</h5>
                      <p className="text-[9px] text-white/30 uppercase mt-1">Manage links displayed in the footer columns.</p>
                   </div>
                   <button
                    onClick={handleAddFooterItem}
                    className="px-4 py-1.5 bg-brand-gold/10 hover:bg-brand-gold hover:text-brand-black border border-brand-gold/30 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer text-brand-gold"
                  >
                    + Add Footer Link
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {footerMenu.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white/5 border border-white/10 p-4 space-y-4">
                         <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase tracking-widest text-white/30">Display Name</label>
                            <input 
                               type="text"
                               value={item.name || ""}
                               onChange={(e) => handleUpdateFooterItem(idx, "name", e.target.value)}
                               className="w-full bg-brand-black border border-white/10 p-2 text-white text-xs focus:border-brand-gold"
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase tracking-widest text-white/30">Target Link</label>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={item.href || ""}
                                onChange={(e) => handleUpdateFooterItem(idx, "href", e.target.value)}
                                className="flex-1 bg-brand-black border border-white/10 p-2 text-white text-xs font-mono focus:border-brand-gold"
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleMoveFooterItem(idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-2 text-white/30 hover:text-brand-gold bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-20"
                                >
                                  <ChevronUp size={14} />
                                </button>
                                <button
                                  onClick={() => handleMoveFooterItem(idx, 'down')}
                                  disabled={idx === footerMenu.length - 1}
                                  className="p-2 text-white/30 hover:text-brand-gold bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-20"
                                >
                                  <ChevronDown size={14} />
                                </button>
                                <button
                                  onClick={() => handleRemoveFooterItem(idx)}
                                  className="p-2 text-white/30 hover:text-brand-red bg-white/5 hover:bg-brand-red/10 border border-white/10 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                         </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <button 
                  onClick={() => setShowAdvancedFooter(!showAdvancedFooter)}
                  className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  {showAdvancedFooter ? "Hide" : "Show"} Advanced JSON Data Manager
                </button>
                {showAdvancedFooter && (
                  <div className="mt-4 animate-fadeIn">
                    <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block mb-2">Footer Menu Schema (JSON)</label>
                    <textarea
                      value={JSON.stringify(footerMenu, null, 2)}
                      onChange={(e) => {
                        try {
                          setParsedValue("footerMenuJson", JSON.parse(e.target.value));
                        } catch (err) { }
                      }}
                      className="w-full h-80 bg-brand-black border border-white/10 p-3 text-white text-xs font-mono focus:border-brand-gold focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
