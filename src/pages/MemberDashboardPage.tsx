import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ScreenLoader from '../components/ScreenLoader';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { useNotifications } from '../context/NotificationContext';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import CommunityHub from '../components/CommunityHub';
import InnerCircleContent from '../components/InnerCircleContent';
import ReferAndEarn from '../components/dashboard/ReferAndEarn';
import ProfileManager from '../components/dashboard/ProfileManager';
import ResourceLibrary from '../components/dashboard/ResourceLibrary';
import SupportSystem from '../components/dashboard/SupportSystem';
import MemberIdentity from '../components/dashboard/MemberIdentity';
import MemberEvents from '../components/dashboard/MemberEvents';
import MemberPrograms from '../components/dashboard/MemberPrograms';
import MemberSettings from '../components/dashboard/MemberSettings';
import MemberSpotlight from '../components/dashboard/MemberSpotlight';
import DigitalWellnessTools from '../components/dashboard/DigitalWellnessTools';
import Inbox from '../components/dashboard/Inbox';
import ChatWindow from '../components/dashboard/ChatWindow';
import DailyAffirmation from '../components/dashboard/DailyAffirmation';
import DashboardHome from '../components/dashboard/DashboardHome';
import WellnessJourney from '../components/dashboard/WellnessJourney';
import FertilityCenter from '../components/dashboard/FertilityCenter';
import WomensWellnessCenter from '../components/dashboard/WomensWellnessCenter';
import ConsultationHub from '../components/dashboard/ConsultationHub';
import WellnessMarketplace from '../components/dashboard/WellnessMarketplace';
import MemberRewards from '../components/dashboard/MemberRewards';
import AIAssistant from '../components/dashboard/AIAssistant';
import PersonalInsightsEngine from '../components/dashboard/PersonalInsightsEngine';
import LiveClassQA from '../components/dashboard/LiveClassQA';
import DashboardGlobalHeader from '../components/dashboard/DashboardGlobalHeader';
import DashboardGlobalFooter from '../components/dashboard/DashboardGlobalFooter';
import DashboardMobileStickyFooter from '../components/dashboard/DashboardMobileStickyFooter';
import { Heart } from 'lucide-react';

import { 
  Home,
  User,
  BookOpen,
  GraduationCap,
  Calendar,
  MessageSquare,
  ShoppingBag,
  CreditCard,
  HeartHandshake,
  LifeBuoy,
  Settings,
  Sparkles, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Menu, 
  X, 
  LogOut,
  CalendarCheck,
  ShieldCheck,
  ExternalLink,
  Compass,
  Award,
  Trophy,
  ArrowRight,
  Loader2,
  RefreshCw,
  DollarSign,
  BarChart,
  Wind,
  VideoOff,
  Activity
} from 'lucide-react';
import { defaultPrograms } from '../lib/programs';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import SomaticBreathingPage from './SomaticBreathingPage';

type TabType = 'dashboard' | 'journey' | 'fertility' | 'womens_wellness' | 'live_class' | 'profile' | 'resources' | 'programs' | 'events' | 'community' | 'inbox' | 'shop' | 'id_card' | 'referral' | 'support' | 'settings' | 'reflection' | 'breathing' | 'analytics' | 'bookmarks' | 'consultation' | 'wellness_tools' | 'rewards' | 'ai_assistant';

export default function MemberDashboardPage() {
  const { user, userData, isImpersonating, isSystemAdmin, hasActiveMembership, loading, realUserData } = useAuth();
  const { content, uploadImage } = useContent();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [completedLessonsMap, setCompletedLessonsMap] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deviceRestrictionStatus, setDeviceRestrictionStatus] = useState<'checking' | 'authorized' | 'mismatch'>('checking');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [activeChat, setActiveChat] = useState<any>(null);
  const { showToast } = useNotifications();
  const [lastPaymentStatus, setLastPaymentStatus] = useState<string | null>(null);
  const [lastIsMember, setLastIsMember] = useState<boolean | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Platform': true, 
    'Health & Healing': true, 
    'Academy': false, 
    'Community & Growth': false, 
    'Account': false,
    'Other': false
  });

  // SIDEBAR SECTIONS AND ORDER LOGIC (Move up so hooks can use it)

  const enabledFeatures: Record<string, boolean> = (() => {
    let features: Record<string, boolean> = {
      profile: true,
      journey: true,
      fertility: true,
      womens_wellness: true,
      resources: true,
      programs: true,
      events: true,
      community: true,
      shop: true,
      id_card: true,
      referral: true,
      support: true,
      breathing: true,
      live_class: true,
      analytics: true,
      bookmarks: true,
      consultation: true,
      wellness_tools: true,
      rewards: true,
      ai_assistant: true
    };
    try {
      if (content.memberDashboardFeaturesJson) {
        features = { ...features, ...JSON.parse(content.memberDashboardFeaturesJson) };
      }
    } catch (err) {}
    return features;
  })();

  const sidebarOrder: string[] = (() => {
    try {
      if (content.memberSidebarOrderJson) {
        const parsed = JSON.parse(content.memberSidebarOrderJson);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return ["dashboard", "journey", "fertility", "womens_wellness", "live_class", "ai_assistant", "wellness_tools", "analytics", "consultation", "profile", "resources", "bookmarks", "programs", "events", "community", "inbox", "shop", "rewards", "id_card", "referral", "support", "settings"];
  })();

  useEffect(() => {
    console.log("MemberDashboardPage debug:", { user, userData, loading });
  }, [user, userData, loading]);

  // Redirect to welcome onboarding portal if paymentStatus is approved and they haven't seen it yet
  useEffect(() => {
    if (
      userData &&
      !isSystemAdmin &&
      userData.paymentStatus === 'approved' &&
      userData.isMember &&
      userData.welcomeSeen !== true &&
      activeTab === 'dashboard'
    ) {
      navigate("/welcome", { replace: true });
    }
  }, [userData, isSystemAdmin, activeTab, navigate]);

  useEffect(() => {
    if (!userData) return;

    // Monitor payment status changes
    if (lastPaymentStatus && lastPaymentStatus !== userData.paymentStatus) {
      if (userData.paymentStatus === 'approved') {
        showToast("Welcome to the Inner Circle! Your membership has been approved.", "success");
      } else if (userData.paymentStatus === 'declined') {
        showToast("Your membership application was declined. Please contact support.", "error");
      }
    }
    setLastPaymentStatus(userData.paymentStatus);

    // Monitor membership status changes
    if (lastIsMember === false && userData.isMember === true) {
      showToast("Access Granted: You are now a verified Community Member.", "success");
    }
    setLastIsMember(userData.isMember);
  }, [userData, lastPaymentStatus, lastIsMember, showToast]);

  // Guard active tab redirection
  useEffect(() => {
    if (activeTab !== 'dashboard' && activeTab !== 'settings') {
      if (enabledFeatures[activeTab as keyof typeof enabledFeatures] === false) {
        setActiveTab('dashboard');
      }
    }
  }, [activeTab, enabledFeatures]);

  useEffect(() => {
    if (!userData && !isSystemAdmin) return;

    if (isImpersonating || isSystemAdmin) {
      setDeviceRestrictionStatus('authorized');
    } else {
      let deviceId = localStorage.getItem('tvr_deviceId');
      if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('tvr_deviceId', deviceId);
      }

      if (!userData.authorizedDeviceId) {
        // Auto-authorize if none set
        updateDoc(doc(db, "users", user.uid), { authorizedDeviceId: deviceId })
          .then(() => setDeviceRestrictionStatus('authorized'));
      } else if (userData.authorizedDeviceId === deviceId) {
        setDeviceRestrictionStatus('authorized');
      } else {
        setDeviceRestrictionStatus('mismatch');
      }
    }

    try {
      const stored = localStorage.getItem('tvr_lesson_progress');
      if (stored) {
        setCompletedLessonsMap(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not read progress state", e);
    }
  }, [userData, user]);

  // 1. Initial Loading States
  const isActuallyLoading = loading || (deviceRestrictionStatus === 'checking');

  // Determine the primary view to render based on priority guards
  let viewToRender: React.ReactNode = null;

  if (loading) {
    viewToRender = <ScreenLoader labelOverride="Verifying Member Credentials" />;
  } else if (!user) {
    viewToRender = <Navigate to="/register" replace />;
  } else if (!userData && !isSystemAdmin) {
    viewToRender = (
      <div className="min-h-screen flex flex-col items-center justify-center text-brand-gold bg-brand-black font-semibold tracking-widest font-mono uppercase text-xs">
        <p className="mb-4">Error: Member Credentials Not Found</p>
        <button onClick={() => auth.signOut()} className="bg-brand-gold text-brand-black px-4 py-2 text-[10px]">Sign Out & Retry</button>
      </div>
    );
  } else if (deviceRestrictionStatus === 'mismatch') {
    viewToRender = (
      <div className="min-h-screen pt-20 px-6 bg-brand-black text-white flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-black mb-6 text-brand-gold font-sans uppercase">Access Restricted</h1>
        <p className="mb-8 text-neutral-400 max-w-md text-sm font-light">This account is currently authorized on another device browser. Please deauthorize it via your active device settings first.</p>
        <button onClick={() => {
          if (confirm("Are you sure you want to remove your current device authorisation? This will log you out from your current session to allow authorisation of another device.")) {
            updateDoc(doc(db, "users", user.uid), { authorizedDeviceId: null })
              .then(() => {
                localStorage.removeItem('tvr_deviceId');
                window.location.reload();
              });
          }
        }} className="bg-brand-gold text-brand-black hover:bg-white px-6 py-3 font-black uppercase text-xs tracking-widest transition-colors font-sans decoration-none">
          Reset Authorized Device
        </button>
      </div>
    );
  } else if (deviceRestrictionStatus === 'checking') {
    viewToRender = (
      <div className="min-h-screen flex items-center justify-center text-brand-gold bg-brand-black font-semibold tracking-widest font-mono uppercase text-xs">
        <RefreshCw className="animate-spin mr-2" size={14} />
        Verifying cryptographic device sequence...
      </div>
    );
  } else if (!isSystemAdmin && !hasActiveMembership) {
    if (userData?.paymentStatus === 'approved' && userData?.welcomeSeen !== true) {
      // Allow through to let the welcome redirect handle it
      viewToRender = null; 
    } else {
      viewToRender = <Navigate to="/payment-review" replace />;
    }
  } else if (!hasActiveMembership && !isSystemAdmin) {
    viewToRender = (
      <div className="min-h-screen pt-28 px-6 bg-brand-black text-white text-center flex flex-col items-center justify-center">
        <h1 className="text-3xl font-black mb-6 text-brand-gold font-sans uppercase">Access Restricted</h1>
        <p className="text-neutral-400">Your membership is not yet active. Please contact support to approve your account authorization details.</p>
      </div>
    );
  }

  // If a guard view was selected, return it immediately after all hooks
  if (viewToRender) return viewToRender;

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await uploadImage(base64, `proof_${user.uid}_${Date.now()}`);
        
        if (res.success && res.url) {
          await updateDoc(doc(db, "users", user.uid), {
            proofOfPaymentUrl: res.url,
            paymentStatus: 'awaiting_approval'
          });
          setUploadSuccess(true);
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Upload error:", err);
      setUploading(false);
    }
  };

  let config: any = {};
  try {
    config = JSON.parse(content?.generalSettingsJson || '{}');
  } catch (e) {
    console.error("Error parsing settings:", e);
  }

  const totalLessons = defaultPrograms.reduce((acc, p) => acc + p.lessons.length, 0);
  const totalCompleted = defaultPrograms.reduce((acc, p) => acc + p.lessons.filter(l => !!completedLessonsMap[l.id]).length, 0);
  const progress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  const baseSidebarNavItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: Home,
      desc: 'Overview of membership activity',
      meta: 'Welcome Panel, Status, Actions, Happenings'
    },
    {
      id: 'journey',
      name: 'My Journey',
      icon: Compass,
      desc: 'Personalized wellness roadmap',
      meta: 'Tracker, Wellness Guide, Map'
    },
    {
      id: 'fertility',
      name: 'Fertility Center',
      icon: Heart,
      desc: 'Awareness & education hub',
      meta: 'Cycle Tracker, Ovulation, Dashboard'
    },
    {
      id: 'womens_wellness',
      name: 'Women\'s Wellness',
      icon: Activity,
      desc: 'Health, hormones & lifestyle',
      meta: 'Trackers, Journal, Reports, Habits'
    },
    {
      id: 'live_class',
      name: 'Live Class',
      icon: ExternalLink,
      desc: 'Attend live broadcast',
      meta: 'Virtual Room, Live Event, Broadcast'
    },
    {
      id: 'ai_assistant',
      name: 'Ask Dr. FID AI',
      icon: Sparkles,
      desc: 'Your AI Wellness Guide',
      meta: 'Health questions, Recommendations, Guidance'
    },
    {
      id: 'wellness_tools',
      name: 'Digital Wellness Tools',
      icon: Heart,
      desc: 'Everyday Healing & Mind-Body Reset Hub',
      meta: 'Breathing, Mood Tracker, Meditation, Journals'
    },
    {
      id: 'analytics',
      name: 'Personal Insights',
      icon: BarChart,
      desc: 'Wellness Analytics & Data',
      meta: 'Patterns, Charts, Reports'
    },
    {
      id: 'consultation',
      name: 'Expert Booking',
      icon: CalendarCheck,
      desc: '1-on-1 private advisory',
      meta: 'Dr Fid sessions, Clinic scheduling'
    },
    {
      id: 'profile',
      name: 'My Profile',
      icon: User,
      desc: 'Manage personal account information',
      meta: 'Personal Info, Membership, Security'
    },
    {
      id: 'resources',
      name: 'Resource Library',
      icon: BookOpen,
      desc: 'Exclusive member wellness vault',
      meta: 'Videos, Audio, Guides, Checklists'
    },
    {
      id: 'bookmarks',
      name: 'Saved Collections',
      icon: BookOpen,
      desc: 'Your bookmarked materials',
      meta: 'Saved articles, Meditations'
    },
    {
      id: 'programs',
      name: 'Learning Center (Academy)',
      icon: GraduationCap,
      desc: 'Education & Wellness Mastery',
      meta: 'Schools, Courses, Assessments, Certificates'
    },
    {
      id: 'events',
      name: 'Events Center',
      icon: Calendar,
      desc: 'Live Experiences & Gatherings',
      meta: 'Calendar, RSVP, Replays, Webinars'
    },
    {
      id: 'community',
      name: 'Community/Sisterhood',
      icon: MessageSquare,
      desc: 'Connect with other members',
      meta: 'Private Feed, Discussion, Audio lounge'
    },
    {
      id: 'inbox',
      name: 'Private Inbox',
      icon: MessageSquare,
      desc: 'Member-to-member messaging',
      meta: 'Direct communiques, encrypted threads'
    },
    {
      id: 'shop',
      name: 'Member Shop',
      icon: ShoppingBag,
      desc: 'Curated Wellness Marketplace',
      meta: 'Supplements, Herbs, Kits, Digital'
    },
    {
      id: 'rewards',
      name: 'Rewards & Progress',
      icon: Trophy,
      desc: 'Badges, points and unlocks',
      meta: 'Wellness achievements, Gamification'
    },
    {
      id: 'id_card',
      name: 'Member Identity',
      icon: CreditCard,
      desc: 'Proof of Access & Status',
      meta: 'Verification passcodes, QA, Security'
    },
    {
      id: 'referral',
      name: 'Refer & Earn',
      icon: HeartHandshake,
      desc: 'Ambassador Growth & Community Hub',
      meta: 'Referral links, Earnings, Promo tools'
    },
    {
      id: 'support',
      name: 'Support',
      icon: LifeBuoy,
      desc: 'Get help when needed',
      meta: 'Support desk tickets, expand FAQs, WhatsApp'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      desc: 'Account management',
      meta: 'Alert configurations, Device authorize key'
    }
  ];

  const sidebarNavItems = [...baseSidebarNavItems]
    .filter(item => {
      if (item.id === 'dashboard' || item.id === 'settings') return true;
      if (item.id === 'live_class') return !!config?.isLiveClassActive;
      return enabledFeatures[item.id as keyof typeof enabledFeatures] !== false;
    })
    .sort((a, b) => {
      const idxA = sidebarOrder.indexOf(a.id);
      const idxB = sidebarOrder.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

  const currentNav = sidebarNavItems.find(item => item.id === activeTab) || sidebarNavItems[0];

  const formatExpirationDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return '15 Dec 2026'; // realistic beautiful design default
    try {
      const date = new Date(dateStr);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
      return '15 Dec 2026';
    }
  };

  const getMembershipDisplayLabel = () => {
    if (userData?.role === 'admin' || userData?.isAdmin === true) return '🛡️ System Administrator';
    if (userData?.isFreeMemberForLife) return '💎 Lifetime Member';
    const tier = userData?.membershipType || 'gold';
    const t = tier.toLowerCase();
    if (t === 'gold' || t === 'quarterly') return '🌟 Gold Plan Member';
    if (t === 'diamond' || t === 'yearly') return '🌟 Diamond Plan Member';
    return `🌟 ${tier.charAt(0).toUpperCase() + tier.slice(1)} Member`;
  };

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white pt-[110px] pb-8 px-4 sm:px-6 lg:px-8 font-sans flex flex-col lg:flex-row gap-8 relative">
      
      {/* MOBILE BAR */}
      <div className="lg:hidden w-full bg-[#111111]/90 backdrop-blur-md border border-white/10 rounded-2xl py-4 px-6 flex items-center justify-between sticky top-[90px] z-[999] shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="text-sm">🌸</span>
          <span className="text-xs font-black uppercase text-brand-gold tracking-widest">{currentNav.name}</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          type="button"
          className="text-white hover:text-brand-gold p-2 bg-white/5 rounded-full transition-colors"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* FULL-RESTRUCTURE SIDEBAR NAVIGATION */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ opacity: 0, x: -20, width: 280 }}
            animate={{ opacity: 1, x: 0, width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 280 : '100%' }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className={`
              bg-[#111111] border border-white/5 shrink-0 flex flex-col justify-start
              fixed top-[150px] bottom-24 left-4 right-4 lg:static lg:sticky lg:top-[110px] lg:bottom-[unset] z-[1000] lg:z-10 rounded-2xl shadow-2xl overflow-hidden
              lg:h-[calc(100vh-140px)]
            `}
          >
            {/* Header */}
            <div className="px-6 py-6 border-b border-white/[0.05] shrink-0 bg-gradient-to-b from-[#181818] to-[#111111] flex items-center justify-between shadow-sm relative z-20">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20 shadow-inner">
                  <span className="text-xl">🌸</span>
                </div>
                <div>
                  <h1 className="text-xs font-black text-brand-gold uppercase tracking-[0.15em] leading-none mb-1">The Vagina Room</h1>
                  <span className="text-[9px] uppercase text-white/50 tracking-[0.2em] font-bold block">Member Portal</span>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-white/50 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Area for EVERYTHING ELSE */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 custom-scrollbar relative z-10 bg-[#111111]">
              
              {/* Account Quick Status Widget (Moved from Footer to Top of Scroll) */}
              <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl space-y-3 font-sans mb-6">
                 <div className="flex justify-between items-center text-[8px]">
                   <div className="text-left">
                     <p className="text-[7.5px] text-white/40 uppercase tracking-[0.2em] mb-1">Passcode ID</p>
                     <p className="text-[9px] font-black text-white uppercase tracking-wider text-brand-gold">
                       {userData?.membershipId || 'TVR-001'}
                     </p>
                   </div>
                   <div className="text-right">
                     <p className="text-[7.5px] text-white/40 uppercase tracking-[0.2em] mb-1">Valid Until</p>
                     <p className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">
                       {formatExpirationDate(userData?.membershipExpiration)}
                     </p>
                   </div>
                 </div>
              </div>

              {/* Navigation Items List */}
              {(() => {
                const sectionMapping: Record<string, string> = {
                  dashboard: 'Platform',
                  ai_assistant: 'Platform',
                  id_card: 'Platform',
                  
                  journey: 'Health & Healing',
                  womens_wellness: 'Health & Healing',
                  fertility: 'Health & Healing',
                  analytics: 'Health & Healing',
                  wellness_tools: 'Health & Healing',
                  consultation: 'Health & Healing',
                  
                  programs: 'Academy',
                  resources: 'Academy',
                  bookmarks: 'Academy',
                  events: 'Academy',
                  live_class: 'Academy',
                  
                  community: 'Community & Growth',
                  inbox: 'Community & Growth',
                  shop: 'Community & Growth',
                  referral: 'Community & Growth',
                  rewards: 'Community & Growth',
                  
                  support: 'Account',
                  settings: 'Account',
                  profile: 'Account'
                };

                const groupedItems = sidebarNavItems.reduce((acc, item) => {
                  const section = sectionMapping[item.id] || 'Other';
                  if (!acc[section]) acc[section] = [];
                  acc[section].push(item);
                  return acc;
                }, {} as Record<string, typeof sidebarNavItems>);

                const sectionOrder = ['Platform', 'Health & Healing', 'Academy', 'Community & Growth', 'Account', 'Other'];

                return sectionOrder.map(section => {
                  const items = groupedItems[section];
                  if (!items || items.length === 0) return null;

                  const isExpanded = expandedSections[section];

                  return (
                    <div key={section} className="space-y-1.5 shrink-0">
                      <button 
                         onClick={() => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))}
                         className="w-full flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.2em] text-[#D4AF37]/60 font-bold px-3 mb-1 hover:text-[#D4AF37] transition-colors"
                      >
                        <span>{section}</span>
                        <span className="text-[12px]">{isExpanded ? '−' : '+'}</span>
                      </button>
                      <AnimatePresence>
                         {isExpanded && (
                            <motion.div 
                               initial={{ height: 0, opacity: 0 }}
                               animate={{ height: 'auto', opacity: 1 }}
                               exit={{ height: 0, opacity: 0 }}
                               className="overflow-hidden space-y-0.5"
                            >
                              {items.map(item => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                  <button
                                    key={item.id}
                                    onClick={() => {
                                      setActiveTab(item.id as TabType);
                                      if (window.innerWidth < 1024) {
                                        setSidebarOpen(false);
                                      }
                                    }}
                                    type="button"
                                    className={`w-full text-left px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em] transition-all rounded-xl flex items-center justify-between cursor-pointer group relative overflow-hidden ${
                                      isActive
                                        ? "bg-gradient-to-r from-brand-gold to-[#e8c96b] text-brand-black shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                                        : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                                    }`}
                                  >
                                    {isActive && (
                                      <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
                                    )}
                                    <span className="flex items-center gap-3 relative z-10">
                                      <Icon size={14} className={`transition-transform duration-300 ${isActive ? "text-brand-black" : "text-brand-gold opacity-80 group-hover:scale-110 group-hover:opacity-100"}`} /> 
                                      {item.name}
                                    </span>
                                  </button>
                                );
                              })}
                            </motion.div>
                         )}
                      </AnimatePresence>
                    </div>
                  );
                });
              })()}

              {/* End of Menu Actions */}
              <div className="pt-4 mt-6 border-t border-white/[0.05] shrink-0">
                <button
                  onClick={() => auth.signOut()}
                  type="button"
                  className="w-full py-3 bg-[#1a1a1a] hover:bg-brand-red text-white/70 hover:text-white rounded-xl text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-white/5 hover:border-brand-red font-black"
                >
                  <LogOut size={12} /> Terminate Session
                </button>
              </div>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* CENTRAL AREA VIEWPORT CONTAINER */}
      <main className="flex-1 bg-[#111111] rounded-3xl border border-white/5 p-6 sm:p-10 shadow-2xl overflow-y-auto relative hidden-scrollbar" style={{ minHeight: 'calc(100vh - 140px)', maxHeight: 'calc(100vh - 140px)' }}>
        
        {/* GLOBAL HEADER */}
        <DashboardGlobalHeader 
           sidebarOpen={sidebarOpen} 
           setSidebarOpen={setSidebarOpen} 
           setActiveTab={(tab: any) => setActiveTab(tab)} 
           userData={userData} 
           user={user} 
        />

        {/* Dynamic Nav Title (Page specific context below header) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 mb-6 gap-4">
          <div className="text-left flex items-center gap-4">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-white font-sans flex items-center gap-2">
                <currentNav.icon size={16} className="text-brand-gold" />
                {currentNav.name}
              </h2>
              <p className="text-[9px] text-white/40 italic font-mono font-light mt-0.5">{currentNav.meta}</p>
            </div>
          </div>
          <span className="hidden sm:inline-block font-mono text-[8px] text-white/35 bg-white/5 border border-white/10 px-2.5 py-1 rounded">
            UID: {userData?.membershipId || user.uid}
          </span>
        </div>

        {/* VIEW ROUTER FOR INNER CONTENT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-8"
          >
            {/* TAB: DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <DashboardHome setActiveTab={setActiveTab} enabledFeatures={enabledFeatures} />
            )}

            {/* TAB: MY JOURNEY */}
            {activeTab === 'journey' && (
              <WellnessJourney setActiveTab={setActiveTab} />
            )}

            {/* TAB: FERTILITY CENTER */}
            {activeTab === 'fertility' && (
              <FertilityCenter />
            )}

            {/* TAB: WOMEN'S WELLNESS CENTER */}
            {activeTab === 'womens_wellness' && (
              <WomensWellnessCenter />
            )}

            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <ProfileManager />
                </div>
                <div className="bg-white/[0.01] border border-white/10 p-6 rounded space-y-5 h-fit text-left">
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand-gold mb-3 flex items-center gap-1">
                    <ShieldCheck size={13} /> Encrypted Workspace
                  </h3>
                  <p className="text-[11px] text-white/50 font-light leading-relaxed">
                    The health, cycle types, and partner information provided are compiled into customized therapeutic suggestions. All clinical detail is secure.
                  </p>
                  <p className="text-[10px] text-brand-gold/60 font-mono">
                    Strict adherence to HIPAA & GDPR somatic database standards.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: RESOURCE LIBRARY */}
            {activeTab === 'resources' && (
              <ResourceLibrary />
            )}

            {/* TAB: PROGRAMS & COURSES */}
            {activeTab === 'programs' && (
              <MemberPrograms />
            )}

            {/* TAB: EVENTS */}
            {activeTab === 'events' && (
              <MemberEvents />
            )}

            {/* TAB: COMMUNITY LOUNGE */}
            {activeTab === 'community' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <CommunityHub />
                </div>
                <div>
                  <div className="bg-white/[0.01] border border-white/10 p-6 rounded space-y-4 text-left">
                    <h4 className="text-xs font-black uppercase tracking-wide text-brand-gold border-b border-white/5 pb-2">
                      Announcements
                    </h4>
                    <p className="text-[11px] text-white/50 font-sans leading-relaxed">
                      Our live stream server has been certified and upgraded to complete 4K audio/video stream integrations. Join us next Wednesday.
                    </p>
                    <span className="text-[8px] font-mono text-white/30 uppercase block">Dispatched: Today 11:30 AM</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PRIVATE INBOX */}
            {activeTab === 'inbox' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Inbox onSelectChat={(chat) => setActiveChat({ id: chat.recipientId, name: chat.recipientName })} />
                </div>
                <div className="space-y-6">
                  <div className="bg-white/[0.01] border border-white/10 p-6 rounded space-y-4 text-left">
                    <h4 className="text-xs font-black uppercase tracking-wide text-brand-gold border-b border-white/5 pb-2">
                      Messaging Protocol
                    </h4>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                      To begin a new dialogue, visit the <button onClick={() => setActiveTab('community')} className="text-brand-gold hover:underline">Community Directory</button> and click "Direct Message" on a sister's profile. Existing threads will appear in your inbox automatically.
                    </p>
                    <p className="text-[10px] text-white/30 italic">
                      Note: Communications are filtered for community compliance. Treat every sister with restorative grace.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EXCLUSIVE SHOP */}
            {activeTab === 'shop' && (
              <WellnessMarketplace />
            )}

            {/* TAB: REWARDS */}
            {activeTab === 'rewards' && (
              <MemberRewards />
            )}

            {/* TAB: ID CARD */}
            {activeTab === 'id_card' && (
              <MemberIdentity />
            )}

            {/* TAB: REFER & EARN (AFFILIATE) */}
            {activeTab === 'referral' && (
              <ReferAndEarn />
            )}

            {/* TAB: SUPPORT */}
            {activeTab === 'support' && (
              <SupportSystem />
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <MemberSettings />
            )}

            {/* TAB: WELLNESS REFLECTION */}
            {/* TAB: DIGITAL WELLNESS TOOLS */}
            {activeTab === 'wellness_tools' && (
              <DigitalWellnessTools />
            )}

            {/* TAB: ANALYTICS (NEW) */}
            {/* TAB: ANALYTICS (INSIGHTS) */}
            {activeTab === 'analytics' && (
              <PersonalInsightsEngine />
            )}

            {/* TAB: CONSULTATION (NEW) */}
            {activeTab === 'consultation' && (
              <ConsultationHub />
            )}

            {/* TAB: LIVE CLASS (NEW) */}
            {activeTab === 'live_class' && (
              <div className="space-y-6">
                <div className="bg-[#050505] p-6 sm:p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />
                  
                  {config?.isLiveClassActive ? (
                    <div className="relative z-10 flex flex-col space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.05] pb-6">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-mono text-brand-gold flex items-center gap-2 font-black tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE NOW
                          </span>
                          <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">{config?.liveClassTitle || 'Live Wellness Class'}</h3>
                          <p className="text-sm text-white/50 font-light max-w-2xl">
                            {config?.liveClassDescription || 'Join our private broadcast. Please ensure your audio is muted during instruction.'}
                          </p>
                        </div>
                      </div>
                      
                      {config?.liveClassEmbedUrl ? (
                        <>
                          <div className="relative w-full rounded-2xl overflow-hidden bg-black border border-white/10 aspect-video shadow-2xl flex items-center justify-center">
                             <iframe 
                               src={config.liveClassEmbedUrl}
                               className="absolute inset-0 w-full h-full border-0"
                               allow="camera; microphone; fullscreen; display-capture"
                               title="Live Class Broadcast"
                             />
                          </div>
                          
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col sm:flex-row items-center gap-4 justify-between">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20 text-brand-gold">
                                 <ExternalLink size={16} />
                               </div>
                               <div>
                                 <p className="text-xs font-black uppercase tracking-widest text-white">External Window</p>
                                 <p className="text-[10px] text-white/40">Having trouble loading the embed?</p>
                               </div>
                             </div>
                             <a href={config.liveClassEmbedUrl} target="_blank" rel="noreferrer" className="w-full sm:w-auto text-center px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] uppercase font-black tracking-widest transition-colors font-sans">
                               Open Directly
                             </a>
                          </div>
                        </>
                      ) : (
                        <div className="relative w-full rounded-2xl overflow-hidden bg-black/50 border border-white/10 aspect-video shadow-2xl flex flex-col items-center justify-center space-y-4">
                           <VideoOff className="text-white/20" size={32} />
                           <p className="text-xs text-white/40 uppercase tracking-widest font-mono">Stream Starting Soon</p>
                        </div>
                      )}
                      
                      {/* Q&A Module */}
                      {config?.isLiveClassQAActive && (
                        <div className="mt-8">
                           <LiveClassQA isAdmin={false} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4 py-16">
                      <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center border border-white/5 mb-2">
                          <VideoOff className="text-white/30" size={28} />
                      </div>
                      <h3 className="text-xl font-black uppercase text-white/50 tracking-widest">No Active Broadcast</h3>
                      <p className="text-sm text-white/30 max-w-md mx-auto font-light leading-relaxed">
                        There is currently no live class scheduled or active. Members will be notified via our private community channels when the next gateway opens.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: AI ASSISTANT */}
            {activeTab === 'ai_assistant' && (
              <AIAssistant />
            )}

            {/* TAB: BOOKMARKS (NEW) */}
            {activeTab === 'bookmarks' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-zinc-950 to-black p-8 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
                  <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4 py-8">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 mb-2">
                        <BookOpen className="text-blue-400" size={28} />
                    </div>
                    <h3 className="text-xl font-black uppercase text-white tracking-widest">Saved Collections</h3>
                    <p className="text-sm text-white/50 max-w-md mx-auto font-light leading-relaxed">
                      Your personally curated library of saved articles, meditations, and protocols.
                    </p>
                    <div className="pt-4 w-full max-w-2xl text-left border border-white/5 bg-white/[0.02] p-6 rounded-2xl mx-auto flex items-center justify-center h-32">
                        <span className="text-xs text-white/30 uppercase tracking-widest font-black">No items bookmarked yet</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DashboardGlobalFooter setActiveTab={(tab: any) => setActiveTab(tab)} />
            <div className="h-20 lg:hidden" /> {/* Padding for mobile sticky footer */}

          </motion.div>
        </AnimatePresence>
      </main>

      <DashboardMobileStickyFooter activeTab={activeTab} setActiveTab={(tab: any) => setActiveTab(tab)} />

      {/* Global Chat Window Overlay */}
      <AnimatePresence>
        {activeChat && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-brand-black/90 backdrop-blur-sm">
             <ChatWindow 
              recipient={activeChat} 
              onClose={() => setActiveChat(null)} 
             />
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
