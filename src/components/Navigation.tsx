import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronDown, Download, Search, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SearchOverlay from './SearchOverlay';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../lib/firebase';
import { safeJsonParse } from '../lib/json';

function formatHref(url: string) {
  if (!url) return "/";
  if (url.startsWith("/") || url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("tel:")) {
    return url;
  }
  if (!/^https?:\/\//i.test(url) && !url.startsWith("//")) {
    return `https://${url}`;
  }
  return url;
}

export default function Navigation() {
  const { content, isAdmin } = useContent();
  const { user, userData, isSystemAdmin, hasActiveMembership, realUserData } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showWhoDropdown, setShowWhoDropdown] = useState(false);
  const [activeMobileSubmenuIdx, setActiveMobileSubmenuIdx] = useState<number | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  const showAdminBar = isAdmin && location.pathname !== '/admin';

  // Monitor unread messages
  useEffect(() => {
    if (!user || typeof user.uid !== 'string') {
      setUnreadCount(0);
      return;
    }

    try {
      const q = query(
        collection(db, 'direct_messages'),
        where('recipientId', '==', user.uid),
        where('read', '==', false)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setUnreadCount(snapshot.size);
      }, (err) => {
        console.warn("Direct Messages Listener failed:", err);
        setUnreadCount(0);
      });

      return unsubscribe;
    } catch (e) {
      console.error("Error setting up unread count query:", e);
      return () => {};
    }
  }, [user?.uid]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(prev => {
        const scrolled = window.scrollY > 20;
        return scrolled !== prev ? scrolled : prev;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track PWA install prompt eligibility
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User responded to PWA installer prompt with: ${outcome}`);
    setDeferredPrompt(null);
  };

  // Close menus on navigation
  useEffect(() => {
    setIsOpen(false);
    setShowWhoDropdown(false);
    setActiveMobileSubmenuIdx(null);
  }, [location]);

  const rawNavLinks = safeJsonParse(content.headerMenuJson, []) as {
    name: string;
    href: string;
    submenu?: { name: string; href: string }[];
  }[];

  let disabledPageSet: Record<string, boolean> = {};
  if (content?.disabledPagesJson) {
    try {
      disabledPageSet = JSON.parse(content.disabledPagesJson);
    } catch (e) {}
  }

  const isLinkActive = (href: string) => {
    if (href === "#") return true;
    return !disabledPageSet[href];
  };

  const navLinks = rawNavLinks
    .filter(link => isLinkActive(link.href))
    .map(link => {
      if (link.submenu) {
        return {
          ...link,
          submenu: link.submenu.filter(sub => isLinkActive(sub.href))
        };
      }
      return link;
    })
    .filter(link => link.href !== "#" || (link.submenu && link.submenu.length > 0));

  const branding = safeJsonParse(content.brandingSettingsJson, {} as any);
  const generalSettings = safeJsonParse(content.generalSettingsJson, {} as any);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <nav 
      className={`fixed left-0 right-0 z-50 transition-all duration-700 ${
        showAdminBar ? (isScrolled ? 'top-12' : 'top-14 md:top-12') : 'top-0'
      } ${
        isScrolled ? 'bg-brand-black/95 backdrop-blur-xl py-6 border-b border-white/5' : 'bg-transparent py-10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex flex-col">
          <Link to="/" onClick={handleLogoClick} className="font-sans text-3xl font-black tracking-tighter text-white uppercase group">
            {branding.headerLogoType === 'image' && branding.headerLogoUrl ? (
              <img 
                src={branding.headerLogoUrl} 
                alt="The Vagina Room" 
                style={{ height: `${branding.headerLogoHeight || 44}px` }}
                className="max-h-16 md:max-h-none w-auto object-contain transition-transform group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            ) : (
              <>The <span className="text-brand-gold italic font-light lowercase transition-transform group-hover:scale-110 inline-block">Vagina</span> Room</>
            )}
          </Link>
          {generalSettings.slogan && generalSettings.showHeaderSlogan && (
            <p className="text-[7px] md:text-[8px] uppercase tracking-[0.3em] text-brand-gold/70 font-mono mt-1 hidden sm:block">
              {generalSettings.slogan}
            </p>
          )}
        </div>

        {/* Unified Header Navigation Actions */}
        <div className={`flex items-center space-x-2 transition-all duration-300 ${isOpen ? 'fixed right-6 top-8' : 'relative'} z-[10001]`}>
          <button 
            className={`p-2 text-white transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search"
          >
            <Search size={22} className={isScrolled ? 'text-brand-gold' : 'text-white'} />
          </button>
          
          <button 
            className="p-2 text-white transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={28} className="text-brand-gold" /> : (
              <div className="relative">
                <Menu size={24} className={isScrolled ? 'text-brand-gold' : 'text-white'} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-red rounded-full flex items-center justify-center text-[7px] font-bold text-white border border-brand-black">
                    {unreadCount}
                  </span>
                )}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9998]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed right-0 top-0 bottom-0 w-[90%] sm:w-[85%] max-w-[450px] bg-brand-black border-l border-white/10 px-6 md:px-12 pb-10 z-[10000] flex flex-col overflow-y-auto pt-32`}
            >
              {/* Internal Sidebar Close (Redundancy for better UX on mobile) */}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-8 left-6 text-brand-gold/40 hover:text-brand-gold transition-colors flex items-center gap-2 text-[10px] uppercase font-black tracking-widest sm:hidden"
              >
                <X size={16} /> Close Menu
              </button>
              <div className="flex flex-col flex-grow">
                {navLinks.map((link, idx) => {
                  const hasSubmenu = Array.isArray(link.submenu) && link.submenu.length > 0;
                  const formattedHref = formatHref(link.href);
                  const isExternal = formattedHref.startsWith('http') || formattedHref.startsWith('//');
                  const isSubmenuOpen = activeMobileSubmenuIdx === idx;
                  return (
                    <div key={link.name} className="flex flex-col space-y-6 mb-8 flex-shrink-0">
                      {hasSubmenu ? (
                        <button 
                          onClick={() => setActiveMobileSubmenuIdx(isSubmenuOpen ? null : idx)}
                          className="text-3xl font-sans font-black tracking-tighter text-white hover:text-brand-gold transition-colors flex items-center justify-between w-full text-left"
                        >
                          <span>{link.name}</span>
                          <ChevronDown size={28} className={`transition-transform duration-300 text-brand-gold ${isSubmenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                      ) : (
                        isExternal ? (
                          <a 
                            href={formattedHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsOpen(false)}
                            className="text-3xl font-sans font-black tracking-tighter text-white hover:text-brand-gold transition-colors"
                          >
                            {link.name}
                          </a>
                        ) : (
                          <Link 
                            to={formattedHref}
                            onClick={() => setIsOpen(false)}
                            className="text-3xl font-sans font-black tracking-tighter text-white hover:text-brand-gold transition-colors"
                          >
                            {link.name}
                          </Link>
                        )
                      )}

                      {hasSubmenu && link.submenu && (
                        <AnimatePresence>
                          {isSubmenuOpen && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="flex flex-col space-y-6 pl-4 border-l border-white/10 overflow-hidden"
                            >
                              {link.submenu.map((sub, sIdx) => {
                                const subFormatted = formatHref(sub.href);
                                const subExternal = subFormatted.startsWith('http') || subFormatted.startsWith('//');
                                return subExternal ? (
                                  <a
                                    key={sIdx}
                                    href={subFormatted}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setIsOpen(false)}
                                    className="text-2xl font-serif text-brand-gold hover:text-white transition-colors first:pt-2"
                                  >
                                    {sub.name}
                                  </a>
                                ) : (
                                  <Link
                                    key={sIdx}
                                    to={subFormatted}
                                    onClick={() => setIsOpen(false)}
                                    className="text-2xl font-serif text-brand-gold hover:text-white transition-colors first:pt-2"
                                  >
                                    {sub.name}
                                  </Link>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  );
                })}

              {/* Dynamic authentication quicklinks based on current security session state */}
              <div className="border-t border-white/5 pt-6 mt-4 space-y-6 flex-shrink-0">
                {user ? (
                  <>
                    <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-white/50">Session Authorized: {user.email}</p>
                    
                    {userData?.role === 'partner' && (
                      <Link
                        to="/partner-dashboard"
                        onClick={() => setIsOpen(false)}
                        className="text-2xl font-sans font-black tracking-tighter text-brand-gold hover:text-white transition-colors block"
                      >
                        Partner Dashboard
                      </Link>
                    )}

                    {(hasActiveMembership || userData?.role === 'admin' || userData?.isAdmin === true || realUserData?.role === 'admin' || realUserData?.isAdmin === true) && (
                      <Link
                        to="/member-dashboard"
                        onClick={() => setIsOpen(false)}
                        className="text-2xl font-sans font-black tracking-tighter text-brand-gold hover:text-white transition-colors block"
                      >
                        Member Dashboard
                      </Link>
                    )}

                    {isSystemAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="text-2xl font-sans font-black tracking-tighter text-brand-gold hover:text-white transition-colors block"
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={async () => {
                        await auth.signOut();
                        setIsOpen(false);
                        window.location.href = '/';
                      }}
                      className="text-sm font-black uppercase tracking-widest text-white/60 hover:text-brand-red transition-colors flex items-center gap-2 mt-4 text-left cursor-pointer border border-white/5 bg-white/[0.01] px-4 py-2"
                    >
                      <LogOut size={12} /> Sign Out Action
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="text-2xl font-sans font-black tracking-tighter text-brand-gold hover:text-white transition-colors block"
                    >
                      Member Portal / Join
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-sans font-black tracking-widest text-white/60 hover:text-white transition-colors block uppercase"
                    >
                      Member Login
                    </Link>
                  </div>
                )}
              </div>
              </div>
              
              <div className="pt-8 border-t border-white/5 flex-shrink-0 space-y-4">
                <Link 
                  to="/support"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-brand-red text-white py-6 rounded-none text-[10px] font-black tracking-[0.5em] uppercase hover:bg-white hover:text-brand-black transition-all duration-500 text-center block"
                >
                  Make A Donation
                </Link>

                {deferredPrompt && (
                  <button
                    onClick={() => {
                      handleInstallClick();
                      setIsOpen(false);
                    }}
                    className="w-full border border-brand-gold text-brand-gold py-6 rounded-none text-[10px] font-black tracking-[0.5em] uppercase hover:bg-white hover:text-brand-black hover:border-white transition-all duration-500 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download size={14} /> Install Web App
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
}
