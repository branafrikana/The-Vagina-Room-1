import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/firebase";
import { collection, query, getDocs, limit } from "firebase/firestore";
import { fetchWithApiBase } from "../../lib/api";
import { 
  Search, 
  Users, 
  FileText, 
  Inbox, 
  Settings, 
  X, 
  ArrowRight, 
  Sparkles, 
  Loader2,
  CornerDownLeft,
  CalendarCheck
} from "lucide-react";

interface SearchResult {
  id: string;
  category: "members" | "blogs" | "submissions" | "config";
  title: string;
  subtitle: string;
  payload: any;
}

interface AdminGlobalSearchProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  content: any;
  onSearchSelect?: (category: string, item: any) => void;
}

// Map key English labels for CMS configurations
const SEARCHABLE_CONFIG_FIELDS: { key: string; label: string; tab: string }[] = [
  { key: "welcomeTitle", label: "Paid Member Onboarding Title", tab: "dr-fid" },
  { key: "welcomeMessage", label: "Paid Member Welcome Note", tab: "dr-fid" },
  { key: "generalSettingsJson", label: "General Workspace Settings JSON", tab: "general" },
  { key: "smtpSettingsJson", label: "Nodemailer SMTP Mail Configurations", tab: "integrations" },
  { key: "drFidHeading", label: "Dr. FID Biography Headline", tab: "dr-fid" },
  { key: "drFidCertifications", label: "Dr. FID Educational Badges List", tab: "dr-fid" },
  { key: "productsListJson", label: "Active Products Core List", tab: "products" },
  { key: "telegramConfigsJson", label: "Telegram Onboarding Setup Settings", tab: "telegram_config" }
];

export default function AdminGlobalSearch({ 
  activeTab, 
  setActiveTab, 
  content,
  onSearchSelect 
}: AdminGlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  // Raw fetched datasets for quick client searching
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [dbBlogs, setDbBlogs] = useState<any[]>([]);
  const [dbSubmissions, setDbSubmissions] = useState<any[]>([]);
  
  const fetchedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Trigger keyboard listener for Cmd+K or Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Autofocus input on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setResults([]);
      setActiveItemIndex(0);
      setTimeout(() => inputRef.current?.focus(), 150);
      
      // Warm up datasets once when search is activated
      if (!fetchedRef.current) {
        warmUpDatasets();
      }
    }
  }, [isOpen]);

  const warmUpDatasets = async () => {
    setLoading(true);
    try {
      const password = content?.adminPassword || localStorage.getItem('tvr_admin_password') || '';
      
      // 1. Fetch Users
      const usersSnap = await getDocs(query(collection(db, "users"), limit(100)));
      const fetchedUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbUsers(fetchedUsers);

      // 2. Fetch Blogs
      const blogsSnap = await getDocs(query(collection(db, "blogs"), limit(50)));
      const fetchedBlogs = blogsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbBlogs(fetchedBlogs);

      // 3. Fetch Submissions
      const subsSnap = await getDocs(query(collection(db, "submissions"), limit(50)));
      const fetchedSubs = subsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDbSubmissions(fetchedSubs);
      
      fetchedRef.current = true;
    } catch (err) {
      console.error("Failed to load search index datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  // Perform search matching
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    const matched: SearchResult[] = [];

    // Search Users: Match Name, Email, Membership ID, Phone
    dbUsers.forEach(user => {
      const name = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
      const email = (user.email || "").toLowerCase();
      const memId = (user.membershipId || "").toLowerCase();
      const phone = (user.phone || "").toLowerCase();
      
      if (name.includes(q) || email.includes(q) || memId.includes(q) || phone.includes(q)) {
        matched.push({
          id: user.id,
          category: "members",
          title: `${user.firstName || "Member"} ${user.lastName || ""}`,
          subtitle: `Member ID: ${user.membershipId || "N/A"} • ${user.email} • Status: ${(user.paymentStatus || "pending").toUpperCase()}`,
          payload: user
        });
      }
    });

    // Search Blogs: Match Title, Author, Slug, Content
    dbBlogs.forEach(blog => {
      const title = (blog.title || "").toLowerCase();
      const author = (blog.author || "").toLowerCase();
      const tags = (blog.tags || []).join(" ").toLowerCase();
      
      if (title.includes(q) || author.includes(q) || tags.includes(q)) {
        matched.push({
          id: blog.id,
          category: "blogs",
          title: blog.title || "Untitled Article",
          subtitle: `Blog Post • Written by: ${blog.author || "Admin"} • Status: ${blog.status || "draft"}`,
          payload: blog
        });
      }
    });

    // Search Submissions: Match FormType, custom fields, email
    dbSubmissions.forEach(sub => {
      const formType = (sub.formType || "").toLowerCase();
      const sData = JSON.stringify(sub.data || {}).toLowerCase();
      
      if (formType.includes(q) || sData.includes(q)) {
        const desc = sub.data?.email || sub.data?.phone || "Details logged in database";
        matched.push({
          id: sub.id,
          category: "submissions",
          title: `Inbox: ${(sub.formType || "Feedback").toUpperCase()}`,
          subtitle: `Submission • From: ${desc} • Received: ${new Date(sub.timestamp).toLocaleDateString()}`,
          payload: sub
        });
      }
    });

    // Search CMS Configurations
    SEARCHABLE_CONFIG_FIELDS.forEach(field => {
      const title = field.label.toLowerCase();
      const value = String(content[field.key] || "").toLowerCase();
      
      if (title.includes(q) || value.includes(q)) {
        matched.push({
          id: field.key,
          category: "config",
          title: field.label,
          subtitle: `CMS Field Key: ${field.key} • Target Tab: ${field.tab.toUpperCase()}`,
          payload: { tab: field.tab, key: field.key }
        });
      }
    });

    setResults(matched.slice(0, 8)); // Max 8 high relevancy results
    setActiveItemIndex(0);
  }, [searchQuery, dbUsers, dbBlogs, dbSubmissions, content]);

  const handleSelectResult = (result: SearchResult) => {
    setActiveTab(result.category);
    
    // Custom redirect maps
    if (result.category === "config" && result.payload?.tab) {
      // Maps configuration click directly to the correct tab in Admin panel!
      if (result.payload.tab === "dr-fid") {
        setActiveTab("content"); // Biography tab resides under general content keys
      } else {
        setActiveTab(result.payload.tab);
      }
    } else if (result.category === "members") {
      setActiveTab("members");
    } else if (result.category === "blogs") {
      setActiveTab("blog_manager");
    } else if (result.category === "submissions") {
      setActiveTab("submissions");
    }

    if (onSearchSelect) {
      onSearchSelect(result.category, result.payload);
    }
    
    setIsOpen(false);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  // Keyboard Navigation inside search list
  const handleKeyDownNav = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveItemIndex(prev => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveItemIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelectResult(results[activeItemIndex]);
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case "members": return <Users className="text-emerald-400" size={16} />;
      case "blogs": return <FileText className="text-blue-400" size={16} />;
      case "submissions": return <Inbox className="text-purple-400" size={16} />;
      case "config": return <Settings className="text-brand-gold" size={16} />;
      default: return <Sparkles className="text-[#D4AF37]" size={16} />;
    }
  };

  return (
    <>
      {/* Small interactive Search trigger bar */}
      <div className="w-full max-w-md relative">
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full bg-white/[0.02] border border-white/5 py-2.5 pl-4 pr-11 text-left text-xs text-white/40 flex items-center justify-between hover:bg-white/[0.05] focus:outline-none focus:border-brand-gold group transition-all"
        >
          <span className="flex items-center gap-2">
            <Search size={14} className="text-white/40 group-hover:text-brand-gold transition-colors" />
            Quickly search users, blogs, submissions...
          </span>
          <span className="font-mono text-[9px] bg-white/5 px-2 py-0.5 border border-white/5 text-white/30 uppercase tracking-widest hidden md:inline-block">
            Ctrl + K
          </span>
        </button>
      </div>

      {/* Full-width Modal overlay */}
      <AnimatePresence>
        {isOpen && (
          <div 
            onClick={handleOverlayClick}
            className="fixed inset-0 bg-brand-black/95 backdrop-blur-md z-[9999] flex items-start justify-center pt-24 px-4"
          >
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              ref={containerRef}
              className="bg-zinc-900 border border-white/10 w-full max-w-2xl overflow-hidden shadow-2xl"
              onKeyDown={handleKeyDownNav}
            >
              {/* Search input field header */}
              <div className="relative border-b border-white/10 p-4 flex items-center gap-3">
                <Search size={18} className="text-[#D4AF37]" />
                <input 
                  ref={inputRef}
                  type="text"
                  placeholder="Type to search verified nodes and config keys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-sm text-white focus:ring-0 placeholder-white/20 font-light"
                />
                
                {loading && (
                  <Loader2 className="animate-spin text-brand-gold shrink-0" size={16} />
                )}

                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-white transition-all cursor-pointer"
                  title="Close search modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Real-time Result panel */}
              <div className="max-h-[350px] overflow-y-auto divide-y divide-white/5 scrollbar-thin">
                {results.length > 0 ? (
                  results.map((item, idx) => (
                    <div 
                      key={item.id}
                      onClick={() => handleSelectResult(item)}
                      onMouseEnter={() => setActiveItemIndex(idx)}
                      className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                        idx === activeItemIndex ? "bg-white/[0.03]" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="shrink-0 p-1.5 bg-zinc-800 rounded border border-white/5">
                          {getIcon(item.category)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-white font-serif tracking-wide truncate">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-zinc-400 mt-1 truncate max-w-md">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        <span className="text-[8px] font-mono tracking-widest uppercase bg-zinc-800 border border-white/5 px-2 py-0.5 text-zinc-500">
                          {item.category}
                        </span>
                        {idx === activeItemIndex && (
                          <motion.span 
                            initial={{ x: -3 }}
                            animate={{ x: 0 }}
                            className="text-brand-gold text-[10px] font-mono flex items-center gap-1 text-xs"
                          >
                            <CornerDownLeft size={10} /> Enter
                          </motion.span>
                        )}
                      </div>
                    </div>
                  ))
                ) : searchQuery.trim() ? (
                  <div className="p-12 text-center text-zinc-500 text-xs font-light">
                    🔍 No matched records detected for &ldquo;<span className="text-white italic">{searchQuery}</span>&rdquo;.
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-500 text-[11px] font-mono uppercase tracking-widest leading-relaxed">
                    🌟 Type to indexing systems and configs...
                    <div className="text-[9px] text-zinc-600 mt-2 lowercase normal-case italic">
                      Use Arrow Keys (<kbd className="bg-zinc-800 px-1 border border-white/5">↑</kbd> <kbd className="bg-zinc-800 px-1 border border-white/5">↓</kbd>) and Enter to navigate instant nodes.
                    </div>
                  </div>
                )}
              </div>

              {/* Status footer bar */}
              <div className="bg-zinc-950 border-t border-white/5 py-2 px-4 flex justify-between items-center text-[9px] text-zinc-500 font-mono">
                <span>INDEXED: {dbUsers.length} MEMBERS • {dbBlogs.length} ARTICLES • {dbSubmissions.length} INBOXES</span>
                <span>ESC to cancel</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
