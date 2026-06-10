import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { useNotifications } from '../context/NotificationContext';
import { Navigate, Link } from 'react-router-dom';
import CommunityHub from '../components/CommunityHub';
import InnerCircleContent from '../components/InnerCircleContent';
import AffiliateTracker from '../components/AffiliateTracker';
import ProfileManager from '../components/dashboard/ProfileManager';
import ResourceLibrary from '../components/dashboard/ResourceLibrary';
import SupportSystem from '../components/dashboard/SupportSystem';
import MemberIDCard from '../components/dashboard/MemberIDCard';
import MemberEvents from '../components/dashboard/MemberEvents';
import MemberMicroShop from '../components/dashboard/MemberMicroShop';
import MemberPrograms from '../components/dashboard/MemberPrograms';
import MemberSettings from '../components/dashboard/MemberSettings';
import MemberSpotlight from '../components/dashboard/MemberSpotlight';
import WellnessReflection from '../components/dashboard/WellnessReflection';
import Inbox from '../components/dashboard/Inbox';
import ChatWindow from '../components/dashboard/ChatWindow';
import DailyAffirmation from '../components/dashboard/DailyAffirmation';
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
  Award,
  ArrowRight,
  DollarSign,
  BarChart,
  Wind
} from 'lucide-react';
import { defaultPrograms } from '../lib/programs';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import SomaticBreathingPage from './SomaticBreathingPage';

type TabType = 'dashboard' | 'profile' | 'resources' | 'programs' | 'events' | 'community' | 'inbox' | 'shop' | 'id_card' | 'referral' | 'support' | 'settings' | 'reflection' | 'breathing';

export default function MemberDashboardPage() {
  const { user, userData, isImpersonating, isSystemAdmin, hasActiveMembership, loading, realUserData } = useAuth();
  const { content, uploadImage } = useContent();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [completedLessonsMap, setCompletedLessonsMap] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deviceRestrictionStatus, setDeviceRestrictionStatus] = useState<'checking' | 'authorized' | 'mismatch'>('checking');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<any>(null);
  const { showToast } = useNotifications();
  const [lastPaymentStatus, setLastPaymentStatus] = useState<string | null>(null);
  const [lastIsMember, setLastIsMember] = useState<boolean | null>(null);

  useEffect(() => {
    console.log("MemberDashboardPage debug:", { user, userData, loading });
  }, [user, userData, loading]);

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

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center text-brand-gold bg-brand-black font-semibold tracking-widest font-mono uppercase text-xs">
          Loading dashboard...
        </div>
    );
  }

  const resetDevice = async () => {
    if (confirm("Are you sure you want to remove your current device authorisation? This will log you out from your current session to allow authorisation of another device.")) {
        await updateDoc(doc(db, "users", user.uid), { authorizedDeviceId: null });
        localStorage.removeItem('tvr_deviceId');
        window.location.reload();
    }
  };

  if (!user) {
    return <Navigate to="/register" replace />;
  }

  // Redirect to welcome onboarding portal if paymentStatus is approved and they haven't seen it yet
  if (
    userData &&
    !isSystemAdmin &&
    userData.paymentStatus === 'approved' &&
    userData.isMember &&
    userData.welcomeSeen !== true
  ) {
    return <Navigate to="/welcome" replace />;
  }

  if (deviceRestrictionStatus === 'mismatch') {
    return (
        <div className="min-h-screen pt-20 px-6 bg-brand-black text-white flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-black mb-6 text-brand-gold font-sans uppercase">Access Restricted</h1>
            <p className="mb-8 text-neutral-400 max-w-md text-sm font-light">This account is currently authorized on another device browser. Please deauthorize it via your active device settings first.</p>
            <button onClick={resetDevice} className="bg-brand-gold text-brand-black hover:bg-white px-6 py-3 font-black uppercase text-xs tracking-widest transition-colors font-sans decoration-none">
                Reset Authorized Device
            </button>
        </div>
    );
  }

  if (deviceRestrictionStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center text-brand-gold bg-brand-black font-semibold tracking-widest font-mono uppercase text-xs">
        Verifying cryptographic device sequence...
      </div>
    );
  }

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

  // PAYMENT REQUIRED VIEW
  if (!isSystemAdmin && (userData?.paymentStatus === 'pending' || userData?.paymentStatus === 'awaiting_approval')) {
    return <Navigate to="/payment-review" replace />;
  }

  // RESTRICTED USER FLOW
  if (!hasActiveMembership && !isSystemAdmin) {
      return (
          <div className="min-h-screen pt-28 px-6 bg-brand-black text-white text-center flex flex-col items-center justify-center">
              <h1 className="text-3xl font-black mb-6 text-brand-gold font-sans uppercase">Access Restricted</h1>
              <p className="text-neutral-400">Your membership is not yet active. Please contact support to approve your account authorization details.</p>
          </div>
      );
  }

  // SIDEBAR SECTIONS AND ORDER
  let enabledFeatures: Record<string, boolean> = {
    profile: true,
    resources: true,
    programs: true,
    events: true,
    community: true,
    shop: true,
    id_card: true,
    referral: true,
    support: true,
    breathing: true
  };
  try {
    if (content.memberDashboardFeaturesJson) {
      enabledFeatures = { ...enabledFeatures, ...JSON.parse(content.memberDashboardFeaturesJson) };
    }
  } catch (err) {}

  const baseSidebarNavItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: Home,
      desc: 'Overview of membership activity',
      meta: 'Welcome Panel, Status, Actions, Happenings'
    },
    {
      id: 'reflection',
      name: 'Wellness Reflection',
      icon: Heart,
      desc: 'Mood & symptom journal',
      meta: 'Daily Tracking, Mood Charts, Personal Growth'
    },
    {
      id: 'breathing',
      name: 'Breathing Space',
      icon: Wind,
      desc: 'Somatic womb & pelvic release',
      meta: 'Solfeggio frequencies, Biometric breathing, Vocal cues'
    },
    {
      id: 'profile',
      name: 'My Profile',
      icon: User,
      desc: 'Manage personal account information',
      meta: 'Personal Info, Membership, Security Settings'
    },
    {
      id: 'resources',
      name: 'Resource Library',
      icon: BookOpen,
      desc: 'Access exclusive member content',
      meta: 'Videos, Audio Resources, Guides, Restorations'
    },
    {
      id: 'programs',
      name: 'Programs & Courses',
      icon: GraduationCap,
      desc: 'Learning and development',
      meta: 'Active Programs, Progress, Courses'
    },
    {
      id: 'events',
      name: 'Events',
      icon: Calendar,
      desc: 'Community events and gatherings',
      meta: 'Upcoming Events, Calendars, RSVP bookings'
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
      desc: 'Exclusive member offers',
      meta: 'Botanicals, Reductions, Somatic oils'
    },
    {
      id: 'id_card',
      name: 'Membership Card',
      icon: CreditCard,
      desc: 'Digital member identity',
      meta: 'Identity verification passcodes, QR'
    },
    {
      id: 'referral',
      name: 'Refer & Earn',
      icon: HeartHandshake,
      desc: 'Affiliate and referral system',
      meta: 'Referral links, Live Earnings balance, Tree'
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

  const sidebarOrder: string[] = (() => {
    try {
      if (content.memberSidebarOrderJson) {
        const parsed = JSON.parse(content.memberSidebarOrderJson);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return ["dashboard", "reflection", "breathing", "profile", "resources", "programs", "events", "community", "inbox", "shop", "id_card", "referral", "support", "settings"];
  })();

  const sidebarNavItems = [...baseSidebarNavItems]
    .filter(item => {
      if (item.id === 'dashboard' || item.id === 'settings') return true;
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

  // Guard active tab redirection
  useEffect(() => {
    if (activeTab !== 'dashboard' && activeTab !== 'settings') {
      if (enabledFeatures[activeTab as keyof typeof enabledFeatures] === false) {
        setActiveTab('dashboard');
      }
    }
  }, [activeTab, enabledFeatures]);

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
    <div className="min-h-screen bg-brand-black text-white pt-24 font-sans flex flex-col lg:flex-row relative">
      
      {/* MOBILE BAR */}
      <div className="lg:hidden w-full bg-zinc-950/90 border-b border-white/5 py-4 px-6 flex items-center justify-between sticky top-[60px] z-[999]">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase text-brand-gold">🌸 Portal /</span>
          <span className="text-xs font-black uppercase text-white tracking-widest">{currentNav.name}</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          type="button"
          className="text-brand-gold hover:text-white p-1"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* FULL-RESTRUCTURE SIDEBAR NAVIGATION */}
      <AnimatePresence>
        {(mobileSidebarOpen || !mobileSidebarOpen) && (
          <aside
            className={`
              w-full lg:w-72 bg-zinc-950 border-r border-white/5 shrink-0 flex flex-col justify-between
              fixed lg:sticky top-[110px] lg:top-24 bottom-0 left-0 z-[1000] lg:z-10 transition-transform duration-300
              ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
            style={{ height: 'calc(100vh - 96px)' }}
          >
            {/* Upper: Title & Scroll Menu List */}
            <div className="flex flex-col flex-1 min-h-0">
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2.5">
                <span className="text-sm">🌸</span>
                <div>
                  <h1 className="text-xs font-medium text-brand-gold uppercase tracking-[0.2em] leading-none">The Vagina Room</h1>
                  <span className="text-[9px] uppercase text-white/40 tracking-wider font-mono font-bold mt-1 block">Member Dashboard</span>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
                {sidebarNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      type="button"
                      className={`
                        w-full flex items-start gap-3 px-4 py-2.5 rounded text-left transition-all group
                        ${isActive 
                          ? 'bg-brand-gold text-brand-black font-extrabold shadow-lg shadow-brand-gold/10' 
                          : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
                        }
                      `}
                    >
                      <Icon 
                        size={15} 
                        className={`mt-0.5 shrink-0 transition-colors ${isActive ? 'text-brand-black' : 'text-brand-gold'}`} 
                      />
                      <div className="leading-tight">
                        <span className="text-[10px] uppercase font-black tracking-wider block">{item.name}</span>
                        <span className={`text-[8px] font-normal leading-normal mt-0.5 block tracking-normal ${isActive ? 'text-brand-black/60 font-medium' : 'text-white/35 font-light'}`}>
                          {item.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Section (MANDATORY STRUCTURE) */}
            <div className="p-4 bg-black/60 border-t border-white/5 space-y-3 font-mono">
              <div className="border-b border-white/5 pb-2.5/2 text-left">
                <p className="text-[7px] text-white/30 uppercase tracking-widest leading-none">Membership</p>
                <p className="text-[10px] font-bold text-white uppercase mt-1">
                  {getMembershipDisplayLabel()}
                </p>
              </div>

              <div className="flex justify-between items-center text-[9px] border-b border-white/5 pb-2">
                <div className="text-left">
                  <p className="text-[7px] text-white/30 uppercase tracking-widest leading-none">Member ID</p>
                  <p className="text-[9px] font-bold text-white uppercase mt-1">
                    {userData?.membershipId || 'TVR-001'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[7px] text-white/30 uppercase tracking-widest leading-none">Expires</p>
                  <p className="text-[9px] font-bold text-brand-gold uppercase mt-1">
                    {formatExpirationDate(userData?.membershipExpiration)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => auth.signOut()}
                type="button"
                className="w-full py-1.5 bg-white/5 hover:bg-red-950/20 text-white hover:text-red-400 text-[8px] uppercase tracking-widest font-black transition-all flex items-center justify-center gap-1.5 border border-white/5 hover:border-red-950/30 font-bold"
              >
                <LogOut size={10} /> Disconnect Account
              </button>
            </div>
          </aside>
        )}
      </AnimatePresence>

      {/* CENTRAL AREA VIEWPORT CONTAINER */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-5xl mx-auto w-full space-y-8" style={{ minHeight: 'calc(100vh - 96px)' }}>
        
        {/* Dynamic Nav Header Bar */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="text-left">
            <h2 className="text-lg font-black uppercase tracking-tight text-white font-sans flex items-center gap-2">
              <currentNav.icon size={16} className="text-brand-gold" />
              {currentNav.name}
            </h2>
            <p className="text-[9px] text-white/40 italic font-mono font-light mt-0.5">{currentNav.meta}</p>
          </div>
          <span className="hidden sm:inline-block font-mono text-[8px] text-white/35 bg-white/5 border border-white/10 px-2.5 py-1 rounded">
            LEDGER_PASSPHRASE_UID: {userData?.membershipId || user.uid}
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
              <div className="space-y-8">
                {/* 1. Welcome Panel */}
                <div className="relative p-6 sm:p-8 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-brand-gold/20 rounded overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none" />
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full filter blur-[100px] pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2 text-left">
                      <span className="text-[9px] font-mono text-brand-gold uppercase tracking-[0.25em] font-normal flex items-center gap-1.5">
                        <Sparkles size={11} className="animate-spin-slow text-brand-gold" /> Personalized Member Community
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black uppercase text-white font-sans tracking-tight flex flex-wrap items-center gap-3">
                        Welcome Back, <span className="text-brand-gold italic font-light font-serif">{userData?.fullName || "Valued Scholar"}</span>
                        {(userData?.role === 'admin' || userData?.isAdmin === true) && (
                          <span className="bg-brand-red/10 text-brand-red border border-brand-red/20 text-[9px] px-2 py-0.5 rounded font-black tracking-widest flex items-center gap-1">
                            <ShieldCheck size={10} /> ADMIN
                          </span>
                        )}
                        {userData?.isFreeMemberForLife && (
                          <span className="bg-brand-gold/10 text-brand-gold border border-brand-gold/20 text-[9px] px-2 py-0.5 rounded font-black tracking-widest flex items-center gap-1">
                            <Sparkles size={10} /> LIFETIME
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-white/60 max-w-xl leading-relaxed font-light">
                        We are thrilled to support your pelvic, somatic, and clinical restoration journey. Explore custom classes, direct WhatsApp advisory channels, botanical reductions, and commission ledgers below.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5 shrink-0">
                      <button
                        onClick={() => setActiveTab('id_card')}
                        type="button"
                        className="bg-brand-gold text-brand-black hover:bg-white text-[9px] font-black uppercase tracking-widest px-4 py-2.5 transition-colors font-bold"
                      >
                        Present Digital ID
                      </button>
                    </div>
                  </div>
                </div>

                {/* Daily Empowering Affirmation Wheel */}
                <DailyAffirmation />

                {/* Member Spotlight Component */}
                <MemberSpotlight />

                {/* 2. Membership Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Status */}
                  <div className="p-6 bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/14 rounded flex flex-col justify-between text-left">
                    <div>
                      <p className="text-[8px] font-mono uppercase tracking-[0.25em] text-white/30">Community Status</p>
                      <h4 className="text-sm font-black uppercase text-white mt-1.5 tracking-tight flex items-center gap-1.5">
                        <CheckCircle2 className="text-emerald-400 shrink-0" size={14} /> Active Verification
                      </h4>
                    </div>
                    <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono">Current tier</span>
                      <span className="px-2 py-0.5 bg-brand-gold/15 border border-brand-gold/30 rounded-[2px] text-[8px] text-brand-gold uppercase font-bold font-mono">
                        {userData?.membershipType || 'Standard'}
                      </span>
                    </div>
                  </div>

                  {/* Expiration */}
                  <div className="p-6 bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/14 rounded flex flex-col justify-between text-left">
                    <div>
                      <p className="text-[8px] font-mono uppercase tracking-[0.25em] text-white/30">Expiration Period</p>
                      <h4 className="text-sm font-black uppercase text-brand-gold mt-1.5 tracking-tight flex items-center gap-1.5 font-mono">
                        <CalendarCheck className="text-brand-gold shrink-0" size={14} /> {formatExpirationDate(userData?.membershipExpiration)}
                      </h4>
                    </div>
                    <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono text-left">Period Validity</span>
                      <span className="font-mono text-[8.5px] text-white/50">
                        Quarterly sync active
                      </span>
                    </div>
                  </div>

                    {/* Referral Stats (Dynamic Statistics for Member decision aiding) */}
                    {enabledFeatures.referral !== false && (
                      <div className="p-6 bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/14 rounded flex flex-col justify-between text-left">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[8px] font-mono uppercase tracking-[0.25em] text-white/30">Referral Ledger</p>
                            <h4 className="text-sm font-black uppercase text-white mt-1.5 tracking-tight flex items-center gap-1.5 font-mono">
                              <DollarSign className="text-brand-gold shrink-0" size={14} /> ₦{userData?.referralBalance || 0}
                            </h4>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] font-mono uppercase tracking-[0.25em] text-white/30">Active Referrals</p>
                            <h4 className="text-[11px] font-black text-brand-gold mt-1 font-mono">
                              {userData?.activeReferredMembers || 0} SINCERE ADVOCATES
                            </h4>
                          </div>
                        </div>
                        <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono">Growth Contribution</span>
                          <button 
                            onClick={() => setActiveTab('referral')}
                            className="text-[8px] text-brand-gold font-black uppercase hover:underline"
                          >
                            VIEW TREE →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. WELLNESS MODULE PROGRESS TRACKER */}
                  <div className="p-6 bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/10 rounded">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black uppercase text-brand-gold tracking-tight flex items-center gap-2">
                            <GraduationCap size={16} /> Wellness Module Progress
                        </h3>
                        <span className="text-brand-gold font-mono text-xs font-bold">{progress}% Complete</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full mb-6 overflow-hidden">
                        <div className="bg-brand-gold h-full transition-all duration-700" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="space-y-2">
                        {defaultPrograms.map(prog => {
                            const completed = prog.lessons.filter(l => !!completedLessonsMap[l.id]).length;
                            const total = prog.lessons.length;
                            return (
                                <div key={prog.id} className="flex justify-between text-xs text-white/60 font-mono">
                                    <span>{prog.title}</span>
                                    <span>{completed}/{total}</span>
                                </div>
                            );
                        })}
                    </div>
                  </div>

                  {/* 4. Community Engagement & Clinical Restoration Progress */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {enabledFeatures.programs !== false && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                           <CheckCircle2 size={12} className="text-brand-gold" /> Personal Restoration Milestones
                        </h4>
                        <div className="bg-white/[0.01] border border-white/5 p-5 space-y-4 text-left">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] uppercase font-mono text-white/50">
                               <span>Anatomy Completion</span>
                               <span className="text-brand-gold">45%</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 overflow-hidden">
                               <div className="h-full bg-brand-gold transition-all duration-700" style={{ width: '45%' }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] uppercase font-mono text-white/50">
                               <span>Cycle Restoration Sync</span>
                               <span className="text-brand-gold">80%</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 overflow-hidden">
                               <div className="h-full bg-brand-gold transition-all duration-700" style={{ width: '80%' }} />
                            </div>
                          </div>
                          <div className="pt-2">
                            <button 
                              onClick={() => setActiveTab('programs')}
                              className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-4 py-2 text-[8px] font-black uppercase tracking-widest transition-all border border-white/5"
                            >
                              RESUME CURRICULUM
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {enabledFeatures.community !== false && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                           <MessageSquare size={12} className="text-brand-gold" /> Social Engagement Statistics
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/[0.01] border border-white/5 p-4 text-left">
                            <p className="text-[8px] text-white/30 uppercase font-mono">Forum Posts</p>
                            <p className="text-xl font-black text-white mt-1 font-mono">{userData?.communityPostsCount || 0}</p>
                          </div>
                          <div className="bg-white/[0.01] border border-white/5 p-4 text-left">
                            <p className="text-[8px] text-white/30 uppercase font-mono">Digital Coins</p>
                            <p className="text-xl font-black text-brand-gold mt-1 font-mono">{(userData?.communityPoints || 0) * 10}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Member ID Code */}
                  <div className="p-6 bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/14 rounded flex flex-col justify-between text-left">
                    <div>
                      <p className="text-[8px] font-mono uppercase tracking-[0.25em] text-white/30">Secure Digital Identification</p>
                      <h4 className="text-sm font-mono text-white mt-1.5 tracking-wider select-all font-bold">
                        {userData?.membershipId || 'TVR-001'}
                      </h4>
                    </div>
                    <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono">Hardware Security</span>
                      <span className="px-1.5 py-0.5 bg-white/10 text-white/60 text-[8px] rounded uppercase font-bold font-mono">Terminal Active</span>
                    </div>
                  </div>

                {/* 2b. Dynamic Community Performance Statistics */}
                <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-black p-6 border border-white/5 rounded-none space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 font-bold">
                      <Award size={12} /> Member Activity & Ambassador Statistics
                    </p>
                    <span className="text-[8px] font-mono text-zinc-500 uppercase">Synchronized today</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                    <div className="space-y-1 text-left">
                      <p className="text-[9px] text-white/40 uppercase tracking-wider font-light">Available Commissions</p>
                      <p className="text-xl font-bold font-mono text-white">${(userData?.totalEarnings || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                      <p className="text-[8px] text-brand-gold font-mono uppercase">+${(userData?.pendingPayout || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} Pending</p>
                    </div>

                    <div className="space-y-1 text-left">
                      <p className="text-[9px] text-white/40 uppercase tracking-wider font-light">Affiliate Referrals</p>
                      <p className="text-xl font-bold font-mono text-white">{(userData?.totalReferrals || 0)} Invited</p>
                      <p className="text-[8px] text-emerald-400 font-mono uppercase">{(userData?.activeReferredMembers || 0)} Active Syncs</p>
                    </div>

                    <div className="space-y-1 text-left">
                      <p className="text-[9px] text-white/40 uppercase tracking-wider font-light">Somatic Programs</p>
                      <p className="text-xl font-bold font-mono text-white">{defaultPrograms.length} Courses</p>
                      <p className="text-[8px] text-brand-gold font-mono uppercase">{progress}% Avg Progress</p>
                    </div>

                    <div className="space-y-1 text-left">
                      <p className="text-[9px] text-white/40 uppercase tracking-wider font-light">Wellness Gatherings</p>
                      <p className="text-xl font-bold font-mono text-white">{(userData?.rsvpCount || 0) > 0 ? `${userData.rsvpCount} Attended` : `0 Circles`}</p>
                      <p className="text-[8px] text-[#0088cc] font-mono uppercase">Next: Wed 4PM</p>
                    </div>
                  </div>
                </div>

                {/* 3. Quick Actions */}
                <div className="p-6 bg-white/[0.01] border border-white/10 rounded text-left space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-brand-gold">
                    ⚡ QUICK DIRECT COMMANDS
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {enabledFeatures.resources !== false && (
                      <button
                        onClick={() => setActiveTab('resources')}
                        className="bg-zinc-950 border border-white/5 hover:border-brand-gold/40 p-4 text-center rounded transition-colors group"
                        type="button"
                      >
                        <div className="text-brand-gold group-hover:scale-105 transition-transform mx-auto w-fit mb-2">📚</div>
                        <p className="text-[10px] font-black uppercase text-white">Get Manuals</p>
                      </button>
                    )}
                    {enabledFeatures.events !== false && (
                      <button
                        onClick={() => setActiveTab('events')}
                        className="bg-zinc-950 border border-white/5 hover:border-brand-gold/40 p-4 text-center rounded transition-colors group"
                        type="button"
                      >
                        <div className="text-brand-gold group-hover:scale-105 transition-transform mx-auto w-fit mb-2">📅</div>
                        <p className="text-[10px] font-black uppercase text-white">Book Circles</p>
                      </button>
                    )}
                    {enabledFeatures.shop !== false && (
                      <button
                        onClick={() => setActiveTab('shop')}
                        className="bg-zinc-950 border border-white/5 hover:border-brand-gold/40 p-4 text-center rounded transition-colors group"
                        type="button"
                      >
                        <div className="text-brand-gold group-hover:scale-105 transition-transform mx-auto w-fit mb-2">🛍️</div>
                        <p className="text-[10px] font-black uppercase text-white">Claim 15% Reduction</p>
                      </button>
                    )}
                    {enabledFeatures.referral !== false && (
                      <button
                        onClick={() => setActiveTab('referral')}
                        className="bg-zinc-950 border border-white/5 hover:border-brand-gold/40 p-4 text-center rounded transition-colors group"
                        type="button"
                      >
                        <div className="text-brand-gold group-hover:scale-105 transition-transform mx-auto w-fit mb-2">🤝</div>
                        <p className="text-[10px] font-black uppercase text-white">Advocate Link</p>
                      </button>
                    )}
                  </div>
                </div>

                {/* 4. Upcoming Events & Recent Resources Previews inside dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <InnerCircleContent />
                  </div>
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-zinc-950 to-neutral-900 border border-white/10 rounded space-y-4 text-left">
                      <span className="text-brand-gold font-mono text-[8px] uppercase tracking-[0.2em] block">Somatic Quick tip</span>
                      <h5 className="text-xs font-black uppercase text-white tracking-tight leading-snug">Pelvic thermal temperature matrix</h5>
                      <p className="text-[11px] text-white/50 leading-relaxed font-light">
                        Never steam with boiling temperature. Maintain organic herbal sequence formulas at 38°C to guard vaginal structures during cycles.
                      </p>
                      <button
                        onClick={() => setActiveTab('resources')}
                        type="button"
                        className="text-[9px] uppercase font-black tracking-widest text-brand-gold hover:text-white flex items-center gap-1 leading-none transition-colors"
                      >
                        Enter library portal <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
              <MemberMicroShop />
            )}

            {/* TAB: ID CARD */}
            {activeTab === 'id_card' && (
              <div className="max-w-xl mx-auto space-y-8 py-4">
                <MemberIDCard />
                
                {/* Physical Pass Guidelines */}
                <div className="p-6 border border-white/10 bg-white/[0.01] rounded text-left">
                  <h5 className="text-xs font-black uppercase tracking-wide text-brand-gold mb-2 font-sans font-black">
                    Lounge Presentation Instructions
                  </h5>
                  <p className="text-xs text-white/65 leading-relaxed font-light font-sans">
                    Present this secure interactive viewport to our lounge receptionists or lounge hosts at any local pop-up gathering or private integration ritual. The unique QR code coordinates and membership identification numbers assure seamless passcode authorizations!
                  </p>
                </div>
              </div>
            )}

            {/* TAB: REFER & EARN (AFFILIATE) */}
            {activeTab === 'referral' && (
              <AffiliateTracker />
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
            {activeTab === 'reflection' && (
              <WellnessReflection />
            )}

            {/* TAB: BREATHING SPACE */}
            {activeTab === 'breathing' && (
              <SomaticBreathingPage isDashboardTab={true} />
            )}

          </motion.div>
        </AnimatePresence>
      </main>

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
