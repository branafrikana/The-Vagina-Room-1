import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause,
  Volume2, 
  VolumeX,
  FileText, 
  Sparkles, 
  Download, 
  ExternalLink, 
  Heart, 
  Search, 
  Video, 
  BookOpen, 
  Headphones, 
  Activity,
  Bookmark,
  Check,
  ChevronRight,
  Info,
  X,
  Clock,
  ArrowRight,
  Plus,
  HelpCircle,
  BookmarkCheck,
  Award,
  ListTodo,
  Book,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ResourceItem, defaultResources } from '../../lib/resources';

export default function ResourceLibrary() {
  // State for active category filters
  const [activeCategory, setActiveCategory] = useState<'all' | ResourceItem['category']>('all');
  const [activeType, setActiveType] = useState<'all' | ResourceItem['type']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive favorites & bookmarks locally persisted
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Continue Learning tracking
  const [recentlyViewedId, setRecentlyViewedId] = useState<string | null>(null);

  // Live Simulated Audio state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [audioPlaybackProgress, setAudioPlaybackProgress] = useState(0);

  // Video Streaming Modal Active state
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // Interactive PDF/Document download detail modal
  const [selectedDownloadItem, setSelectedDownloadItem] = useState<ResourceItem | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'connecting' | 'transferring' | 'completed'>('idle');
  const [downloadLog, setDownloadLog] = useState<string>('');

  // Search input referential focus
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [libraryItems, setLibraryItems] = useState<ResourceItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Sync favorites & recently viewed from localStorage on mount
  useEffect(() => {
    // Local storage
    try {
      const storedFav = localStorage.getItem('tvr_fav_resources');
      if (storedFav) {
        setFavorites(JSON.parse(storedFav));
      }
      const storedRecentlyViewed = localStorage.getItem('tvr_last_viewed');
      if (storedRecentlyViewed) {
        setRecentlyViewedId(storedRecentlyViewed);
      }
    } catch (e) {
      console.warn("Could not sync local resource state", e);
    }
    
    // Firestore sync
    const fetchResources = async () => {
      try {
        const q = query(collection(db, 'resource_library'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const fetchedItems = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ResourceItem[];
        setLibraryItems(fetchedItems.length > 0 ? fetchedItems : defaultResources);
      } catch (err) {
        console.error("Failed to load resources", err);
        setLibraryItems(defaultResources);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchResources();
  }, []);

  // Sync Favorites back to localStorage
  const handleToggleFavorite = (id: string, titleStr: string) => {
    try {
      let updated: string[];
      if (favorites.includes(id)) {
        updated = favorites.filter(favId => favId !== id);
      } else {
        updated = [...favorites, id];
        // Trigger soft user affirmation
        const notice = document.createElement('div');
        notice.innerText = `🌟 Saved "${titleStr}" to favorites vault.`;
        notice.className = "fixed bottom-12 right-12 z-[1000] bg-black border border-[#D4AF37] text-white font-mono text-[9px] uppercase tracking-widest px-4 py-2.5 rounded shadow-2xl";
        document.body.appendChild(notice);
        setTimeout(() => notice.remove(), 2500);
      }
      setFavorites(updated);
      localStorage.setItem('tvr_fav_resources', JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not write favorites to storage", e);
    }
  };

  // Tracking accessed items internally (Continue learning trigger)
  const trackRecentlyAccessed = (id: string) => {
    try {
      setRecentlyViewedId(id);
      localStorage.setItem('tvr_last_viewed', id);
    } catch (e) {
      console.warn("Could not log recently viewed item", e);
    }
  };

  // Simulated audio playback progress loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (playingAudioId) {
      interval = setInterval(() => {
        setAudioPlaybackProgress(prev => {
          if (prev >= 100) {
            return 0; // seamless continuous loop representation
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [playingAudioId]);

  // Handle Dynamic PDF Download Simulation
  const triggerSimulatedDownload = (item: ResourceItem) => {
    trackRecentlyAccessed(item.id);
    setSelectedDownloadItem(item);
    setDownloadProgress(0);
    setDownloadStatus('connecting');
    setDownloadLog(`[SOVEREIGN SYNC] Initiating cryptographic handshake request for resource item #${item.id}...`);

    setTimeout(() => {
      setDownloadStatus('transferring');
      setDownloadLog(`[SOVEREIGN SYNC] Connection verified. Downloading deep-aligned documentation: "${item.title}"...`);
      
      const interval = setInterval(() => {
        setDownloadProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setDownloadStatus('completed');
            setDownloadLog(`[SUCCESS] File packet integrated! ${item.fileSize} secure PDF saved to cache. Ready for printing.`);
            return 100;
          }
          return p + 10;
        });
      }, 200);
    }, 1200);
  };

  // Clear search query & active categories (Browse all hot-key)
  const resetAllFilters = () => {
    setActiveCategory('all');
    setActiveType('all');
    setSearchQuery('');
    setShowOnlyFavorites(false);
  };

  // Focus Search input field
  const triggerFocusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Filter the items list dynamically
  const filteredItems = libraryItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesType = activeType === 'all' || item.type === activeType;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Favorites filtering
    if (showOnlyFavorites) {
      return matchesCategory && matchesType && matchesSearch && favorites.includes(item.id);
    }
    return matchesCategory && matchesType && matchesSearch;
  });

  // Calculate matching items count
  const matchingVideosCount = libraryItems.filter(i => i.type === 'video').length;
  const matchingAudiosCount = libraryItems.filter(i => i.type === 'audio').length;
  const matchingPDFsCount = libraryItems.filter(i => i.type === 'pdf').length;
  const matchingDownloadsCount = libraryItems.filter(i => ['pdf', 'ebook', 'worksheet', 'checklist'].includes(i.type)).length;

  // Retrieve item object representing recently viewed
  const recentlyViewedItem = libraryItems.find(i => i.id === recentlyViewedId);

  return (
    <div className="space-y-8 font-sans text-white text-left relative pb-20">
      
      {/* 1. BRAND HERO WELCOME HEADER SECTION */}
      <div className="bg-gradient-to-br from-[#110f0f] to-[#070606] border border-white/5 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4AF37]/[0.02] blur-3xl rounded-full select-none" />
        
        <div className="relative z-10 space-y-4">
          <div>
            <span className="text-[9px] font-mono text-brand-gold uppercase tracking-[0.3em] font-extrabold block">
              🌸 SECURE MEMBER APOTHECARY VAULT
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-black uppercase text-white mt-1 tracking-tight leading-tight">
              📚 Resource Library
            </h2>
            <p className="text-xs text-white/50 max-w-2xl font-light font-sans mt-2 leading-relaxed">
              Your Curated Library of Trusted Women's Wellness Knowledge. A centralized, high-value knowledge vault designed to give members instant access to structured, reliable, and easy-to-understand wellness materials that support learning, healing, and daily decision-making.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5 text-[9px] font-mono tracking-wider uppercase text-white/40">
            <div className="bg-black/40 border border-white/5 p-3 rounded-none">
              <span className="block text-brand-gold font-extrabold text-[12px]">{matchingVideosCount} Videos</span>
              <span className="text-[7.5px] mt-0.5 block">Masterclasses & Webinars</span>
            </div>
            <div className="bg-black/40 border border-white/5 p-3 rounded-none">
              <span className="block text-brand-gold font-extrabold text-[12px]">{matchingAudiosCount} Audios</span>
              <span className="text-[7.5px] mt-0.5 block">Relaxation & Insights</span>
            </div>
            <div className="bg-black/40 border border-white/5 p-3 rounded-none">
              <span className="block text-brand-gold font-extrabold text-[12px]">{matchingDownloadsCount} Downloads</span>
              <span className="text-[7.5px] mt-0.5 block">Guides, Ebooks, Worksheets</span>
            </div>
            <div className="bg-black/40 border border-white/5 p-3 rounded-none">
              <span className="block text-brand-gold font-extrabold text-[12px]">Daily Tools</span>
              <span className="text-[7.5px] mt-0.5 block">Frameworks & Recipes</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INSTANT QUICK ACTIONS BAR Panel */}
      <div className="bg-[#110f0f] border border-white/5 p-4 rounded-none">
        <span className="text-[8.5px] font-mono text-white/35 uppercase tracking-widest block mb-2.5 font-bold">
          ⚡ QUICK ACTIONS STATION
        </span>
        <div className="flex flex-wrap gap-2.5">
          {/* Action 1: Browse All Resources */}
          <button
            onClick={resetAllFilters}
            className="px-3.5 py-2 hover:bg-white bg-white/5 border border-white/10 text-white hover:text-black font-mono text-[8px] uppercase tracking-widest font-black transition-all flex items-center gap-1.5"
          >
            <BookOpen size={10} />
            <span>Browse All Resources</span>
          </button>

          {/* Action 2: Download Materials Category */}
          <button
            onClick={() => {
              setActiveType('pdf');
              setActiveCategory('all');
              setShowOnlyFavorites(false);
            }}
            className="px-3.5 py-2 hover:bg-[#D4AF37] bg-white/5 border border-[#D4AF37]/30 text-[#D4AF37] hover:text-black font-mono text-[8px] uppercase tracking-widest font-black transition-all flex items-center gap-1.5"
          >
            <Download size={10} />
            <span>Download PDF Materials</span>
          </button>

          {/* Action 3: View Saved Favorites filter status */}
          <button
            onClick={() => {
              setShowOnlyFavorites(prev => !prev);
            }}
            className={`px-3.5 py-2 font-mono text-[8px] uppercase tracking-widest font-black transition-all flex items-center gap-1.5 border ${
              showOnlyFavorites 
                ? 'bg-[#D4AF37] border-[#D4AF37] text-black' 
                : 'bg-white/5 border-white/10 text-white hover:border-white/20'
            }`}
          >
            <Heart size={10} className={showOnlyFavorites ? 'fill-black' : 'text-brand-gold'} />
            <span>Saved Favorites ({favorites.length})</span>
          </button>

          {/* Action 4: Continue Learning search log scroll */}
          {recentlyViewedItem && (
            <button
              onClick={() => {
                if (recentlyViewedItem.type === 'video') {
                  setPlayingVideoId(recentlyViewedItem.id);
                } else if (recentlyViewedItem.type === 'audio') {
                  setPlayingAudioId(recentlyViewedItem.id);
                } else if (recentlyViewedItem.type === 'pdf') {
                  triggerSimulatedDownload(recentlyViewedItem);
                }
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-[#D4AF37]/10 to-transparent hover:to-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#D4AF37] hover:text-white font-mono text-[8px] uppercase tracking-widest font-black transition-all flex items-center gap-1.5"
            >
              <Clock size={10} className="animate-spin text-brand-gold" style={{ animationDuration: '6s' }} />
              <span>Resume: "{recentlyViewedItem.title.substring(0, 20)}..."</span>
            </button>
          )}

          {/* Action 5: Search Library focus */}
          <button
            onClick={triggerFocusSearchInput}
            className="px-3.5 py-2 hover:bg-white bg-white/5 border border-white/10 text-white hover:text-black font-mono text-[8px] uppercase tracking-widest font-black transition-all flex items-center gap-1.5"
          >
            <Search size={10} />
            <span>Search Library</span>
          </button>
        </div>
      </div>

      {/* 3. CONTINUE LEARNING HEADER BRIDGES (Conditional shelf) */}
      <AnimatePresence>
        {recentlyViewedItem && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 border-l-2 border-[#D4AF37] bg-[#110f0f] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left relative overflow-hidden"
          >
            {/* Ambient indicator */}
            <div className="absolute top-0 right-0 p-1 px-2 border-b border-l border-white/5 text-[7px] font-mono text-white/30 uppercase tracking-widest">
              Last accessed cache
            </div>

            <div className="space-y-1">
              <span className="text-[7.5px] font-mono text-brand-gold uppercase tracking-widest block font-bold flex items-center gap-1">
                <Clock size={10} /> CONTINUE LEARNING ROUTINE
              </span>
              <h4 className="text-xs font-serif font-black text-white uppercase tracking-wide">
                {recentlyViewedItem.title}
              </h4>
              <p className="text-[10.5px] text-white/50 font-light max-w-xl">
                {recentlyViewedItem.description}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  trackRecentlyAccessed(recentlyViewedItem.id);
                  if (recentlyViewedItem.type === 'video') {
                    setPlayingVideoId(recentlyViewedItem.id);
                  } else if (recentlyViewedItem.type === 'audio') {
                    setPlayingAudioId(recentlyViewedItem.id);
                  } else if (recentlyViewedItem.type === 'pdf') {
                    triggerSimulatedDownload(recentlyViewedItem);
                  }
                }}
                className="px-3.5 py-2 bg-[#D4AF37] hover:bg-white text-black font-mono text-[8px] uppercase tracking-widest font-black transition-all flex items-center gap-1"
              >
                <span>Pick up where you left off</span>
                <ChevronRight size={10} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. SEARCH AND CLASSIFICATION FILTERS BAR */}
      <div className="flex flex-col gap-4 bg-white/[0.01] p-4 border border-white/5">
        
        {/* Real-time category selector (Topics) */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[8px] font-mono text-white/35 uppercase tracking-widest font-bold mr-2">
            TOPICS:
          </span>
          {[
            { id: 'all', label: 'All Topics' },
            { id: 'Fertility', label: 'Fertility' },
            { id: 'Hormones', label: 'Hormones' },
            { id: 'Intimacy', label: 'Intimacy' },
            { id: 'Pregnancy', label: 'Pregnancy' },
            { id: 'Menopause', label: 'Menopause' },
            { id: 'Mental Wellness', label: 'Mental Wellness' }
          ].map(btn => {
            const isSel = activeCategory === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => {
                  setActiveCategory(btn.id as any);
                  setShowOnlyFavorites(false); // Reset favorites sidebar logic on category select
                }}
                className={`px-3 py-1.5 font-mono text-[8px] uppercase tracking-widest transition-all border flex items-center gap-1 ${
                  isSel
                    ? 'bg-[#D4AF37] border-[#D4AF37] text-black font-extrabold'
                    : 'bg-black/40 border-white/5 text-white/50 hover:text-white hover:border-white/20'
                }`}
              >
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Real-time type selector (Formats) */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[8px] font-mono text-white/35 uppercase tracking-widest font-bold mr-2">
            FORMATS:
          </span>
          {[
            { id: 'all', label: 'All Formats', icon: BookOpen },
            { id: 'video', label: 'Videos', icon: Video },
            { id: 'audio', label: 'Audios', icon: Headphones },
            { id: 'pdf', label: 'PDFs', icon: FileText },
            { id: 'ebook', label: 'Ebooks', icon: Book },
            { id: 'worksheet', label: 'Worksheets', icon: ClipboardList },
            { id: 'checklist', label: 'Checklists', icon: ListTodo }
          ].map(btn => {
            const Icon = btn.icon;
            const isSel = activeType === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => {
                  setActiveType(btn.id as any);
                  setShowOnlyFavorites(false);
                }}
                className={`px-3 py-1.5 font-mono text-[8px] uppercase tracking-widest transition-all border flex items-center gap-1 ${
                  isSel
                    ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 text-[#D4AF37]'
                    : 'bg-transparent border-transparent text-white/40 hover:text-white'
                }`}
              >
                <Icon size={9} />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Focused Keyword Input */}
        <div className="relative w-full shrink-0 mt-2">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search educational library..."
            className="w-full bg-black/80 border border-white/10 hover:border-white/20 focus:border-[#D4AF37] p-2 pl-8 text-sm font-mono text-white placeholder:text-white/20 uppercase tracking-wider outline-none rounded-none"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" size={12} />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Status Indicators for Favorites or Active Query */}
      {showOnlyFavorites && (
        <div className="p-3.5 bg-[#D4AF37]/5 border border-[#D4AF37]/20 flex items-center justify-between text-left">
          <p className="text-[10px] font-mono text-brand-gold uppercase tracking-widest flex items-center gap-2">
            <Heart size={11} className="fill-[#D4AF37]" /> LOCKOUT MODE: VIEWING SAVED FAVORITES ONLY ({filteredItems.length})
          </p>
          <button 
            onClick={() => setShowOnlyFavorites(false)}
            className="text-[9px] font-mono uppercase underline hover:text-white text-white/50"
          >
            Show entire directory
          </button>
        </div>
      )}

      {/* 5. DYNAMIC INTUITIVE DIRECTORY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.length === 0 ? (
            <div className="col-span-full py-16 text-center border border-dashed border-white/10 font-mono text-[#D4AF37] uppercase text-[9.5px] bg-[#110f0f]/30">
              No preparations matching the current filters were found. Try clearing fields.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isFav = favorites.includes(item.id);
              const isP = playingAudioId === item.id;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.25) }}
                  className="bg-[#110f0f] border border-white/5 hover:border-[#D4AF37]/30 rounded-none p-4.5 flex flex-col justify-between transition-all duration-300 group relative"
                >
                  
                  {/* Decorative badge indicating classification */}
                  <div className="absolute top-6 left-6 z-20 flex gap-1 font-mono text-[7px] uppercase tracking-wider font-extrabold select-none">
                    <span className="bg-black/85 text-[#D4AF37] border border-[#D4AF37]/25 px-2.5 py-0.5 whitespace-nowrap">
                      {item.category}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Visual Aspect Container Cover */}
                    <div className="aspect-[16/10] bg-zinc-950 rounded-none overflow-hidden relative border border-white/5">
                      <img 
                        src={item.thumbnail} 
                        alt={item.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-60 group-hover:scale-102 group-hover:opacity-85 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#070606] via-transparent to-transparent opacity-85" />

                      {/* Floating control trigger inside thumbnails */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="p-3 bg-[#111] hover:bg-[#D4AF37] border border-white/15 rounded-full text-[#D4AF37] hover:text-black transition-all group-hover:scale-105 shadow-xl opacity-90 pointer-events-auto cursor-pointer"
                          onClick={() => {
                            trackRecentlyAccessed(item.id);
                            if (item.type === 'video') {
                              setPlayingVideoId(item.id);
                            } else if (item.type === 'audio') {
                              setPlayingAudioId(playingAudioId === item.id ? null : item.id);
                            } else if (['pdf', 'ebook', 'worksheet', 'checklist', 'guide'].includes(item.type)) {
                              triggerSimulatedDownload(item);
                            }
                          }}
                        >
                          {item.type === 'video' && <Play size={15} fill="currentColor" className="ml-0.5 text-[#D4AF37] group-hover:text-black" />}
                          {item.type === 'audio' && (isP ? <Pause size={15} className="animate-spin text-emerald-400" style={{ animationDuration: '4s' }} /> : <Volume2 size={15} />)}
                          {['pdf', 'ebook', 'worksheet', 'checklist', 'guide'].includes(item.type) && <Download size={15} />}
                          {(item.type as string) === 'wellness' && <Activity size={15} />}
                        </span>
                      </div>

                      {/* Core saving tag details */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 z-30">
                        {/* Bookmark system toggle */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(item.id, item.title);
                          }}
                          className="p-1 px-1.5 bg-black/85 hover:bg-[#D4AF37] text-white hover:text-black text-[9px] font-mono border border-white/5 transition-colors"
                          title="Sovereign Favorite Toggle"
                        >
                          <Heart size={11} className={isFav ? "fill-brand-gold text-brand-gold animate-bounce" : "text-white/65"} />
                        </button>
                      </div>
                    </div>

                    {/* Meta descriptions layout */}
                    <div className="text-left space-y-1.5">
                      <h4 className="text-[13px] font-serif font-black uppercase text-white leading-tight leading-snug tracking-wide group-hover:text-brand-gold transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[10.5px] text-white/50 leading-relaxed font-sans font-light h-14 overflow-hidden line-clamp-3 select-none">
                        {item.description}
                      </p>
                    </div>

                    {/* Bullet Highlights Section */}
                    {item.highlights && item.highlights.length > 0 && (
                      <div className="p-2.5 bg-black/35 rounded-none border border-white/5 text-[9.5px] text-white/60 space-y-1 text-left">
                        <span className="text-[8px] font-mono text-brand-gold uppercase tracking-wider block font-extrabold">
                          📋 CORE BLUEPRINT INCLUDES:
                        </span>
                        {item.highlights.map((hlt, iIdx) => (
                          <div key={iIdx} className="flex items-start gap-1 font-sans leading-snug">
                            <Check size={8} className="text-[#D4AF37] shrink-0 mt-0.5" />
                            <span className="truncate">{hlt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Operational actions footer */}
                  <div className="pt-3 border-t border-white/5 mt-4 text-[10px] font-mono flex items-center justify-between">
                    <div>
                      <span className="text-white/30 text-[7.5px] uppercase tracking-widest block select-none">AUTHORIZED SOURCE</span>
                      <span className="text-white/70 font-sans font-bold block truncate max-w-[140px]">{item.author}</span>
                    </div>

                    <div>
                      {item.type === 'video' && (
                        <button
                          type="button"
                          onClick={() => {
                            trackRecentlyAccessed(item.id);
                            setPlayingVideoId(item.id);
                          }}
                          className="px-2.5 py-1.5 bg-[#D4AF37] text-black hover:bg-white text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                        >
                          <Play size={9} fill="currentColor" /> Watch webinar
                        </button>
                      )}

                      {item.type === 'audio' && (
                        <button
                          type="button"
                          onClick={() => {
                            trackRecentlyAccessed(item.id);
                            setPlayingAudioId(playingAudioId === item.id ? null : item.id);
                          }}
                          className={`px-2.5 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-1 ${
                            isP 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-white/5 hover:bg-white/10 text-white'
                          }`}
                        >
                          <Volume2 size={9} />
                          <span>{isP ? 'STREAMING ACTIVE' : 'STREAM FREQUENCY'}</span>
                        </button>
                      )}

                      {['pdf', 'ebook', 'worksheet', 'checklist', 'guide'].includes(item.type) && (
                        <button
                          type="button"
                          onClick={() => triggerSimulatedDownload(item)}
                          className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:border-[#D4AF37] text-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                        >
                          <Download size={9} />
                          <span>DOWNLOAD {item.type.toUpperCase()} ({item.fileSize || '1.2 MB'})</span>
                        </button>
                      )}

                      {(item.type as string) === 'wellness' && (
                        <button
                          type="button"
                          onClick={() => {
                            trackRecentlyAccessed(item.id);
                            // Simulated informational pop trigger
                            setSelectedDownloadItem(item);
                            setDownloadStatus('completed');
                            setDownloadProgress(100);
                            setDownloadLog(`[HEALTH DIRECTIVE] Wellness interactive table decrypted. Let's practice safe uterine hygiene.`);
                          }}
                          className="px-2.5 py-1.5 bg-white/5 border border-[#D4AF37]/35 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                        >
                          <Activity size={9} />
                          <span>OPEN INSIGHTS INDEX</span>
                        </button>
                      )}
                    </div>
                  </div>

                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* 6. ENCRYPTED MOOD CAPTIONS FOOTER NOTES */}
      <div className="py-6 border-t border-white/5 text-center space-y-1 select-none">
        <p className="text-[11px] font-serif text-white/35 italic">
          &quot;A curated space where knowledge becomes clarity, and clarity becomes transformation.&quot; 🌸
        </p>
        <p className="text-[7.5px] font-mono uppercase tracking-[0.25em] text-[#D4AF37]/30">
          THE VAGINA ROOM SYSTEM VAULT • PRIVILEGED ACCOUNT ACCESS LOGGED
        </p>
      </div>

      {/* 7. DETAILED MODERN RESOLUTION DOWNLOAD MODAL */}
      <AnimatePresence>
        {selectedDownloadItem && (
          <div className="fixed inset-0 bg-[#070606]/90 backdrop-blur-sm z-[9990] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#110f0f] border-2 border-[#D4AF37]/75 p-6 w-full max-w-lg rounded-none text-left space-y-5 shadow-2xl relative"
            >
              {/* Close corner */}
              <button
                onClick={() => setSelectedDownloadItem(null)}
                className="absolute top-4 right-4 w-7 h-7 bg-white/5 border border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37] text-white/50 flex items-center justify-center rounded-none transition-colors"
              >
                <X size={12} />
              </button>

              {/* Title heading */}
              <div className="space-y-1 pb-2 border-b border-white/5">
                <span className="text-[8px] font-mono text-[#D4AF37] uppercase tracking-widest block font-bold">
                  {selectedDownloadItem.category}
                </span>
                <h3 className="text-sm font-serif font-black uppercase tracking-wide text-white">
                  {selectedDownloadItem.title}
                </h3>
                <p className="text-[11px] text-white/50">
                  Author Signature: {selectedDownloadItem.author}
                </p>
              </div>

              {/* Guide Details Panel */}
              <div className="space-y-3.5 select-none text-[11px] leading-relaxed text-white/60 font-sans">
                <p>{selectedDownloadItem.description}</p>
                
                {/* Specific features checklists */}
                <div className="space-y-1.5 p-3.5 bg-black/40 border border-white/5 text-[10px]">
                  <span className="text-[8px] font-mono text-[#D4AF37] uppercase tracking-wider block font-black">
                    🔬 VERIFIED PROTOCOL CHECKLIST:
                  </span>
                  {selectedDownloadItem.highlights.map((hlt, idx) => (
                    <div key={idx} className="flex items-start gap-1">
                      <Award size={10} className="text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>{hlt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress bars rendering logic */}
              <div className="space-y-3 pt-2">
                
                {downloadStatus === 'connecting' && (
                  <div className="space-y-2 font-mono text-[9px]">
                    <div className="flex justify-between text-brand-gold font-bold">
                      <span className="animate-pulse">CONNECTING TO COMMUNITY DIGITAL ROUTERS...</span>
                      <span>0%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-none overflow-hidden relative">
                      <div className="bg-brand-gold h-full animate-pulse w-1/12" />
                    </div>
                  </div>
                )}

                {downloadStatus === 'transferring' && (
                  <div className="space-y-2 font-mono text-[9px]">
                    <div className="flex justify-between text-[#D4AF37] font-bold">
                      <span className="animate-pulse">TRANSFERRING DOCUMENT DATA STREAM...</span>
                      <span>{downloadProgress}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-none overflow-hidden relative">
                      <motion.div 
                        className="bg-brand-gold h-full"
                        style={{ width: `${downloadProgress}%` }}
                        transition={{ ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                )}

                {downloadStatus === 'completed' && (
                  <div className="space-y-2.5 font-mono text-[9.5px]">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Check size={14} strokeWidth={3} className="bg-emerald-500/20 p-0.5 rounded-full" />
                      <span>RESOURCE PACKET DECRYPTED & LOADED!</span>
                    </div>
                    <p className="text-[10px] text-white/50 leading-relaxed font-sans bg-black/40 p-3 border border-white/5 select-all">
                      Your download has successfully initialized. In offline simulation, you have full local sandbox rights to view and replicate these teachings. Check your browser caches or system downloads folders for files named: <strong className="text-white italic">{selectedDownloadItem.id}.pdf</strong>
                    </p>
                  </div>
                )}

                {/* Secure cryptographic output logs */}
                <span className="text-[7.5px] font-mono text-white/35 block uppercase tracking-wide leading-relaxed bg-[#070606] p-2 border border-white/5 select-all">
                  {downloadLog}
                </span>

                {/* Cancel or accept footer controls */}
                <div className="flex gap-2 justify-end pt-3 text-[9px] font-mono">
                  {downloadStatus !== 'completed' ? (
                    <button
                      onClick={() => setSelectedDownloadItem(null)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                    >
                      ABORT TRANSIT
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedDownloadItem(null)}
                      className="px-4 py-2 bg-[#D4AF37] hover:bg-white text-black font-black font-bold transition-all"
                    >
                      ACKNOWLEDGE & DISMISS
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. VIDEO STREAM POP-UP PORTAL MODAL */}
      <AnimatePresence>
        {playingVideoId && (
          <div className="fixed inset-0 bg-[#070606]/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#110f0f] border-2 border-[#D4AF37] p-5 w-full max-w-3xl rounded-none text-left space-y-4 shadow-2xl relative"
            >
              {/* Close top right */}
              <button
                onClick={() => setPlayingVideoId(null)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-none bg-[#D4AF37] hover:bg-white text-black font-bold font-mono text-xs flex items-center justify-center shadow-2xl transition"
              >
                ✕
              </button>

              {/* Embedded video player viewport */}
              <div className="aspect-video w-full bg-black rounded-none overflow-hidden border border-white/5 relative">
                <iframe
                  src="https://player.vimeo.com/video/83273182?autoplay=1"
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  title="Womb Somatics Stream Sequence"
                ></iframe>
              </div>

              {/* Details of video being played */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 text-xs">
                <div>
                  <h4 className="text-[13px] font-serif font-black uppercase tracking-wide text-white">
                    {libraryItems.find(i => i.id === playingVideoId)?.title}
                  </h4>
                  <p className="text-[9.5px] font-mono text-[#D4AF37] uppercase tracking-widest mt-0.5">
                    Live Stream Mode: Host Node #{playingVideoId} • Certified Resolution High Definition
                  </p>
                </div>
                <button
                  onClick={() => setPlayingVideoId(null)}
                  className="text-[9px] font-mono font-bold uppercase tracking-widest bg-white/5 border border-white/10 hover:border-[#D4AF37] text-white hover:text-[#D4AF37] px-3 py-1.5 transition-colors"
                >
                  Disconnect Stream
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. MINI AUDIO CONTROLLER DOCK HUD (Binds at bottom) */}
      <AnimatePresence>
        {playingAudioId && (
          <motion.div
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 70 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] sm:w-[480px] bg-[#110f0f] border-2 border-[#D4AF37] text-white p-4.5 shadow-2xl z-[9000] flex flex-col gap-3 rounded-none"
          >
            {/* Header info row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
                <div className="text-left">
                  <p className="text-[7.5px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold">
                    ACTIVE FREQUENCY STREAM LAYER
                  </p>
                  <p className="text-xs font-serif font-black text-white uppercase truncate max-w-[220px]">
                    {libraryItems.find(i => i.id === playingAudioId)?.title}
                  </p>
                </div>
              </div>

              {/* Functional floating controls */}
              <div className="flex items-center gap-2 font-mono text-[9px]">
                <button
                  type="button"
                  onClick={() => setIsAudioMuted(m => !m)}
                  className="p-1.5 bg-black border border-white/10 hover:border-[#D4AF37] text-[#D4AF37] transition"
                  title="Mute stream toggle"
                >
                  {isAudioMuted ? <VolumeX size={12} className="text-red-400" /> : <Volume2 size={12} />}
                </button>
                <button
                  onClick={() => setPlayingAudioId(null)}
                  className="bg-[#D4AF37] hover:bg-white text-black px-3 py-1.5 text-[8px] uppercase font-black tracking-widest transition-colors duration-200"
                >
                  DISCONNECT
                </button>
              </div>
            </div>

            {/* Custom interactive progress sliders */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[7.5px] font-mono text-white/35">
                <span>STAGE COORDINATES INDEX</span>
                <span>{audioPlaybackProgress}% COMPLETION</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-none relative overflow-hidden select-none cursor-pointer"
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  const clickPerc = Math.round(((e.clientX - r.left) / r.width) * 100);
                  setAudioPlaybackProgress(clickPerc);
                }}
              >
                <motion.div 
                  className="bg-[#D4AF37] h-full"
                  style={{ width: `${audioPlaybackProgress}%` }}
                />
              </div>

              {/* Realistic sound wave animations */}
              <div className="flex justify-center items-center gap-0.5 h-3 select-none pointer-events-none">
                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map((itemIndex) => {
                  const hVal = isAudioMuted ? 2 : Math.max(2, Math.round(Math.random() * 12));
                  return (
                    <motion.div
                      key={itemIndex}
                      animate={{ height: hVal }}
                      transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.35 + Math.random() * 0.2 }}
                      className="w-1 bg-[#D4AF37] self-end rounded-sm"
                      style={{ height: `${hVal}px` }}
                    />
                  );
                })}
              </div>
            </div>

            <p className="text-[7.5px] font-mono text-white/40 leading-relaxed text-center select-none tracking-wider uppercase">
              ✨ Traditional soundwaves emitted in raw uncompressed audio format.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
