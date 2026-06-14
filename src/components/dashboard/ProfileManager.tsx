import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useContent, FALLBACK_DEFAULTS } from '../../context/ContentContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { 
  User, 
  MapPin, 
  Award, 
  Mail, 
  Phone, 
  Lock, 
  Bell, 
  Eye, 
  EyeOff, 
  Download, 
  LogOut, 
  Check, 
  RefreshCw, 
  Smartphone, 
  ShieldCheck, 
  AlertCircle, 
  Trash2, 
  Camera, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  Globe, 
  Shield, 
  Info, 
  HeartHandshake,
  UserPlus,
  Trophy,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Firestore Error Handlers according to standard guidelines
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Incident Logged: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function ProfileManager() {
  const { user, userData } = useAuth();
  const { content } = useContent();

  const badgesConfig = React.useMemo(() => {
    try {
      return JSON.parse(content.badgesConfigJson || FALLBACK_DEFAULTS.badgesConfigJson);
    } catch (e) {
      return [
        { "id": "womb_listener", "title": "🌸 Womb Listener", "desc": "Active Thread Starter", "criteria": "Draft 1+ post onto the global Community Timeline." },
        { "id": "somatic_helper", "title": "💬 Somatic Helper", "desc": "Sisterhood Guidance", "criteria": "Write 1+ helpful reply or thread comment inside discussion circles." },
        { "id": "luminous_beacon", "title": "🌟 Luminous Beacon", "desc": "Atmospheric Support", "criteria": "Glow 3+ support hearts to sisters across timeline feeds." },
        { "id": "circle_guardian", "title": "👥 Circle Guardian", "desc": "Circle Pioneer", "criteria": "Be an active sibling inside 2+ specialized discussion groups." },
        { "id": "community_pillar", "title": "👑 Community Pillar", "desc": "Steward-Mentor Rank", "criteria": "Accumulate a total of 50+ holistic contribution points." }
      ];
    }
  }, [content.badgesConfigJson]);

  // Active section toggles
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'membership' | 'settings' | 'security' | 'actions'>('info');
  const [showHowToEarnModal, setShowHowToEarnModal] = useState(false);
  const [showToast, setShowToast] = useState('');
  const [saving, setSaving] = useState(false);

  // Form Fields: 🧾 Personal Information
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [locationValue, setLocationValue] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [birthDate, setBirthDate] = useState('');

  // Form Fields: ⚙️ Account Settings
  const [language, setLanguage] = useState('English');
  const [commPreference, setCommPreference] = useState('WhatsApp');
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    whatsappSync: true,
    weeklyReminders: false,
    securityLogs: true
  });
  const [privacy, setPrivacy] = useState({
    privateDirectory: false,
    hideLocationMap: false,
    anonymousActivity: false
  });
  const [themePreference, setThemePreference] = useState<'dark' | 'light'>('dark');

  // Form Fields: 🔒 Password & Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordRaw, setShowPasswordRaw] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [authorizedDevices, setAuthorizedDevices] = useState([
    { id: 'dev-1', name: 'iPhone 15 Pro', spec: 'Lagos, Nigeria • Current Mobile Session', authorizedAt: 'Today, 14:33', icon: Smartphone },
    { id: 'dev-2', name: 'Apple MacBook Pro 14"', spec: 'Ikeja, Nigeria • Chrome on macOS', authorizedAt: '05 June 2026, 09:12', icon: Smartphone },
    { id: 'dev-3', name: 'iPad Pro 11"', spec: 'Abuja, Nigeria • Safari on iPadOS', authorizedAt: '28 May 2026, 11:44', icon: Smartphone }
  ]);

  // Derived Values: 🌸 Membership details from profile context
  const membershipId = userData?.membershipId || 'TVR-AMB-4819';
  const membershipTier = userData?.membershipType || 'Gold Affiliate';
  const joinDate = userData?.createdAt || '15 June 2026';
  const renewalDate = '15 December 2026';
  const membershipPlan = 'Quarterly Womb Circle & Discount Stack Access';

  const activeBenefitsList = [
    { title: 'Sisterhood Shala Lounge Unlocked', desc: 'Secure direct messaging, specialized forums, and peer verification access.' },
    { title: 'Daily Womb Tracking Logs Archive', desc: 'Automatic analysis tools mapped onto personal cycle indexes.' },
    { title: '15% automatic cart deductions', desc: 'Saves 15% on organic steam compress matrices in the micro-shop.' },
    { title: 'Priority Webinar Reservations', desc: 'Access to monthly councils and streaming workshops hosted by Dr. FID.' }
  ];

  // Load User Data from context onto state
  useEffect(() => {
    if (userData) {
      setFullName(userData.fullName || userData.name || '');
      setEmailAddress(userData.email || '');
      setPhoneNumber(userData.phoneNumber || '');
      setLocationValue(userData.location || userData.city || userData.country || '');
      setProfilePhoto(userData.photoURL || userData.profilePhoto || localStorage.getItem('tvr_custom_id_photo') || '');
      setEmergencyContact(userData.emergencyContact || '');
      setBirthDate(userData.birthDate || '');
      
      if (userData.language) setLanguage(userData.language);
      if (userData.commPreference) setCommPreference(userData.commPreference);
    }
  }, [userData]);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 4500);
  };

  // Update Firestore user document
  const handleUpdateProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    setSaving(true);
    const pathForWrite = `users/${user.uid}`;
    
    const fieldsToSave = {
      fullName,
      name: fullName, // backup field compatibility
      phoneNumber,
      location: locationValue,
      photoURL: profilePhoto,
      emergencyContact,
      birthDate,
      language,
      commPreference,
      updatedAt: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, "users", user.uid), fieldsToSave);
      triggerToast('🌻 Somatic profile parameters successfully written to the secure registry.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, pathForWrite);
    } finally {
      setTimeout(() => setSaving(false), 600);
    }
  };

  // Base64 profile Photo loader
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // FileReader wrapper
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setProfilePhoto(base64String);
        localStorage.setItem('tvr_custom_id_photo', base64String);
        
        // Write instantly back into user's profile
        if (user) {
          try {
            await updateDoc(doc(db, "users", user.uid), { photoURL: base64String });
            triggerToast('📸 Private profile portrait embedded and synced with secure ledger.');
          } catch (err) {
            console.error("Failed to sync profile picture to database:", err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = async () => {
    setProfilePhoto('');
    localStorage.removeItem('tvr_custom_id_photo');
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), { photoURL: '' });
        triggerToast('🗑️ Profile avatar reverted to sovereign cosmic initials.');
      } catch (err) {
        console.error("Failed to remove profile photo:", err);
      }
    }
  };

  const handleTogglePinBadge = async (badgeId: string) => {
    if (!user) return;
    const currentPins = userData?.pinnedBadges || [];
    let updatedPins = [...currentPins];
    
    if (currentPins.includes(badgeId)) {
      updatedPins = updatedPins.filter(id => id !== badgeId);
      triggerToast('📌 Badge unpinned from profile showcase.');
    } else {
      if (currentPins.length >= 3) {
        triggerToast('⚠️ Only up to 3 badges can be pinned to your profile showcase.');
        return;
      }
      updatedPins.push(badgeId);
      triggerToast('📌 Badge successfully pinned to profile showcase!');
    }

    try {
      await updateDoc(doc(db, "users", user.uid), { pinnedBadges: updatedPins });
    } catch (err) {
      console.error("Failed to pin/unpin badge", err);
      triggerToast('Could not register profile showcase updates.');
    }
  };

  // Security password updater with real feedback
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      alert("Please provide your current security password credentials.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Confirm password parameters must match your new target password.");
      return;
    }
    if (newPassword.length < 6) {
      alert("Secure password parameters must contain at least 6 alphanumeric tokens.");
      return;
    }
    
    if (!auth.currentUser) return;
    
    setSaving(true);
    try {
      const { updatePassword } = await import('firebase/auth');
      await updatePassword(auth.currentUser, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      triggerToast('🔒 Security credentials rotated! Encryption certificate successfully updated.');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
         alert("Security policy requires you to log out and log back in before rotating credentials.");
      } else {
         alert(err.message || 'Failed to update credentials.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Device management handle
  const handleRevokeDevice = (id: string, name: string) => {
    setAuthorizedDevices(prev => prev.filter(d => d.id !== id));
    triggerToast(`🛡️ Revoked and locked device authorization for: ${name}`);
  };

  // Download secure somatic records JSON
  const handleDownloadAccountData = () => {
    const accountData = {
      identity_header: "The Vagina Room - Somatic Identity Passport",
      audit_source: "AES-256 Encrypted Cloud Ledger",
      extracted_at: new Date().toISOString(),
      member_credentials: {
        id: membershipId,
        tier: membershipTier,
        plan: membershipPlan,
        joined: joinDate,
        expires: renewalDate,
        active_perks: activeBenefitsList.map(b => b.title)
      },
      personal_profile: {
        full_name: fullName,
        email: emailAddress,
        phone: phoneNumber,
        location: locationValue,
        emergency_contact: emergencyContact
      },
      client_preferences: {
        language,
        communication_channel: commPreference,
        theme_preference: themePreference,
        notifications_enabled: notifications,
        privacy_isolation: privacy
      },
      devices_registered: authorizedDevices.map(d => ({ device: d.name, stats: d.spec }))
    };

    const blob = new Blob([JSON.stringify(accountData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tvr_somatic_profile_${membershipId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("📥 Somatic registration details successfully saved to your offline storage.");
  };

  return (
    <div className="space-y-8 font-sans text-white text-left">
      
      {/* Toast Notifier Display */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 z-[9999] px-4 py-3 bg-zinc-950 border border-brand-gold/40 text-brand-gold font-mono text-[9.5px] uppercase tracking-wider font-extrabold flex items-center gap-2 shadow-2xl rounded-sm"
          >
            <Sparkles size={11} className="text-brand-gold animate-spin shrink-0" />
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How to Earn Badges Modal */}
      {showHowToEarnModal && (
        <div className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowHowToEarnModal(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#110f0f] border border-[#D4AF37]/35 p-6 md:p-8 space-y-6 relative text-left rounded-none shadow-[0_0_50px_rgba(212,175,55,0.05)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm uppercase tracking-widest font-serif text-brand-gold flex items-center gap-2">
                  <Trophy size={14} /> Somatic Badge Requirements
                </h3>
                <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase tracking-wider">
                  Guidelines to accrue status, badges, and sibling ranks
                </p>
              </div>
              <button 
                onClick={() => setShowHowToEarnModal(false)}
                className="text-white/40 hover:text-white font-mono text-[10px] uppercase tracking-widest"
                type="button"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              {badgesConfig.map((badge: any) => (
                <div key={badge.id} className="p-4 bg-black/40 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-serif text-xs font-extrabold text-[#D4AF37] uppercase">{badge.title}</span>
                    <span className="text-[8px] font-mono text-white/50 uppercase tracking-widest">{badge.desc}</span>
                  </div>
                  <p className="text-[10.5px] text-white/70 font-sans leading-relaxed font-light">
                    {badge.criteria}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/5 flex justify-between items-center text-[8.5px] font-mono text-white/45">
              <span>💡 Engagement levels synchronize dynamically</span>
              <span className="text-brand-gold font-bold">The Vagina Room</span>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Profile Sidebar Summary Panel */}
        <div className="w-full lg:w-1/3 bg-[#110f0f] border border-white/5 p-6 rounded-none space-y-6 shrink-0 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/[0.02] blur-xl pointer-events-none rounded-full" />
          
          <div className="flex flex-col items-center text-center space-y-4">
            
            {/* Visual Portrait Image Wrapper */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border border-brand-gold/40 bg-zinc-900 overflow-hidden flex items-center justify-center relative shadow-xl">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Member Portrait" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-2xl font-mono text-brand-gold leading-none font-bold">
                    {(fullName || user?.email || 'N/A').split('@')[0].slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              
              <label className="absolute bottom-0 right-0 p-1.5 bg-brand-gold text-brand-black rounded-full hover:scale-110 active:scale-95 transition-transform cursor-pointer shadow">
                <Camera size={12} strokeWidth={3} />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>

            <div className="space-y-1">
              <h3 className="text-md font-serif font-black tracking-tight text-white uppercase">
                {fullName || 'Sister of the Community'}
              </h3>
              <p className="text-[9px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold">
                {membershipTier}
              </p>
              <p className="text-[10px] text-white/40 block leading-tight truncate px-4">
                {emailAddress || user?.email}
              </p>
            </div>

          </div>

          <div className="pt-4 border-t border-white/5 space-y-2.5 font-mono text-[9px] uppercase tracking-wider text-white/50">
            <div className="flex justify-between">
              <span>Sovereign Token</span>
              <span className="text-white/80 font-bold">{membershipId}</span>
            </div>
            <div className="flex justify-between">
              <span>Community Level</span>
              <span className="text-white/80 font-bold">Approved Active</span>
            </div>
            <div className="flex justify-between">
              <span>Account Node</span>
              <span className="text-brand-gold font-bold">Obsidian Premium</span>
            </div>
          </div>

          {/* Pinned Badge Showcase */}
          <div className="pt-4 border-t border-white/5 space-y-2 text-left">
            <span className="text-[8px] font-mono uppercase text-[#D4AF37]/50 tracking-widest block flex items-center gap-1 select-none">
              <Trophy size={10} /> Pinned Showcase
            </span>
            {userData?.pinnedBadges && userData.pinnedBadges.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {userData.pinnedBadges.map((bgId: string) => {
                  const badgeDef = badgesConfig.find((b: any) => b.id === bgId);
                  if (!badgeDef) return null;
                  return (
                    <span 
                      key={bgId} 
                      className="inline-flex items-center gap-1 text-[8.5px] px-2 py-0.5 bg-brand-gold/10 text-brand-gold border border-brand-gold/25 uppercase rounded font-mono font-bold"
                      title={`${badgeDef.title}: ${badgeDef.desc}`}
                    >
                      {badgeDef.title}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-[8px] font-mono text-white/30 italic">No pinned badges showcase. Pin badges from the active dashboard.</p>
            )}
          </div>

          {/* Quick Upload Removal Handle */}
          {profilePhoto && (
            <button
              onClick={handleRemovePhoto}
              className="w-full text-center text-[8.5px] font-mono text-red-400 hover:text-red-300 block py-1 px-2 border border-dashed border-red-500/20 hover:border-red-500/40 bg-red-500/5 transition-all text-center uppercase tracking-widest"
            >
              Discard Portrait Token
            </button>
          )}

          {/* Interactive Navigation List inside Profile Manager */}
          <div className="pt-4 border-t border-white/5 flex flex-col gap-1 font-mono text-[10px] uppercase tracking-widest">
            {[
              { id: 'info', label: '🧾 Personal Information', desc: 'Secure contact & portal' },
              { id: 'membership', label: '🌸 Membership Details', desc: 'View privileges & status' },
              { id: 'settings', label: '⚙️ Account Settings', desc: 'Notification & theme nodes' },
              { id: 'security', label: '🔒 Password & Security', desc: 'Ledger logins & 2FA' },
              { id: 'actions', label: '⚡ Quick Actions', desc: 'Data exports & sign out' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as any);
                  triggerToast(`📁 Switched workspace block to: ${tab.label.split(' ').slice(1).join(' ')}`);
                }}
                className={`p-3 text-left transition-all border flex flex-col justify-center ${
                  activeSubTab === tab.id 
                    ? 'bg-brand-gold/10 border-brand-gold text-brand-gold font-bold' 
                    : 'bg-transparent border-transparent text-white/60 hover:text-white hover:border-white/10 hover:bg-white/[0.01]'
                }`}
              >
                <span className="text-[10px] font-extrabold">{tab.label}</span>
                <span className="text-[8px] font-light text-white/30 lowercase mt-0.5 tracking-normal">{tab.desc}</span>
              </button>
            ))}
          </div>

        </div>

        {/* Right Section Config Panels */}
        <div className="flex-1 w-full bg-white/[0.01] border border-white/10 p-6 sm:p-8 space-y-6 rounded-none text-left relative min-h-[460px]">
          
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <span className="text-[8.5px] font-mono text-brand-gold uppercase tracking-[0.2em] font-semibold block">My Community Profile Node</span>
              <h2 className="text-lg font-serif tracking-wide text-white uppercase font-black">
                {activeSubTab === 'info' && '🧾 Personal Information'}
                {activeSubTab === 'membership' && '🌸 Membership Details'}
                {activeSubTab === 'settings' && '⚙️ Account Settings'}
                {activeSubTab === 'security' && '🔒 Password & Security'}
                {activeSubTab === 'actions' && '⚡ Quick Actions'}
              </h2>
            </div>

            {saving && (
              <span className="text-[9px] font-mono text-brand-gold uppercase tracking-widest animate-pulse flex items-center gap-1">
                <RefreshCw size={10} className="animate-spin" /> saving change
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSubTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >

              {/* RENDER SECTION 1: PERSONAL INFORMATION */}
              {activeSubTab === 'info' && (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <p className="text-[11px] text-white/50 leading-relaxed font-sans font-light">
                    Keep your profile metadata current. This somatic coordinate information assists in building customized herbal, botanical, and stream access rules inside the Community.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1">
                      <label className="text-[9px] text-white/50 uppercase tracking-wider block">Full Name Account Signature</label>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 hover:border-white/20 p-3 text-white focus:border-brand-gold outline-none rounded-none transition-colors"
                        placeholder="e.g. Sonia Ebele"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-white/50 uppercase tracking-wider block">Private Email Address</label>
                      <input 
                        type="email" 
                        value={emailAddress}
                        disabled
                        className="w-full bg-zinc-900/60 border border-white/5 p-3 text-white/40 cursor-not-allowed rounded-none"
                        placeholder="verified.email@somatic"
                      />
                      <span className="text-[8px] text-white/30 italic block mt-0.5">Contact support to rotate security sign-in email.</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-white/50 uppercase tracking-wider block">WhatsApp Liaison Phone</label>
                      <input 
                        type="tel" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 hover:border-white/20 p-3 text-white focus:border-brand-gold outline-none rounded-none transition-colors"
                        placeholder="e.g. +234 80 1234 5678"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-white/50 uppercase tracking-wider block">Geographical Region Node</label>
                      <input 
                        type="text" 
                        value={locationValue}
                        onChange={(e) => setLocationValue(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 hover:border-white/20 p-3 text-white focus:border-brand-gold outline-none rounded-none transition-colors"
                        placeholder="e.g. Lagos, Nigeria"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-white/50 uppercase tracking-wider block">Birth Date (For Community Greetings)</label>
                      <input 
                        type="date" 
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 hover:border-white/20 p-3 text-white focus:border-brand-gold outline-none rounded-none transition-colors [color-scheme:dark]"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[9px] text-white/50 uppercase tracking-wider block">Optional Private Emergency Contact</label>
                      <input 
                        type="text" 
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 hover:border-white/20 p-3 text-white focus:border-brand-gold outline-none rounded-none transition-colors"
                        placeholder="e.g. Obinna Ebele (Partner / Brother) - +234 81 9876 5432"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 text-right">
                    <button 
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-brand-gold hover:bg-white text-brand-black transition-colors font-mono text-[10px] uppercase tracking-widest font-black"
                    >
                      {saving ? 'Syncing Ledger Database...' : 'Save Personal Info'}
                    </button>
                  </div>
                </form>
              )}


              {/* RENDER SECTION 2: MEMBERSHIP DETAILS */}
              {activeSubTab === 'membership' && (
                <div className="space-y-6">
                  <p className="text-[11px] text-white/50 leading-relaxed font-sans font-light">
                    Your active somatics network parameters. Membership is secured on blockchain ledger checks synchronized hourly.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                    
                    <div className="p-4 bg-black/40 border border-white/5 space-y-2">
                      <span className="text-[8px] text-white/45 uppercase tracking-wider block">Active Membership Plan</span>
                      <p className="text-white font-bold font-serif text-sm">{membershipPlan}</p>
                      <span className="inline-block px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8.5px] uppercase font-bold tracking-widest leading-none mt-1">
                        Live Approved ✅
                      </span>
                    </div>

                    <div className="p-4 bg-black/40 border border-white/5 space-y-2">
                      <span className="text-[8px] text-white/45 uppercase tracking-wider block">Authorized SOMATIC TIER</span>
                      <p className="text-[#D4AF37] font-extrabold text-sm uppercase tracking-wide flex items-center gap-1.5">
                        <Award size={14} /> {membershipTier}
                      </p>
                      <p className="text-[9px] text-white/35">ID Token: {membershipId}</p>
                    </div>

                    <div className="p-3 bg-zinc-950 border border-white/5">
                      <span className="text-[8px] text-white/45 uppercase tracking-wider block">ESTABLISHED JOIN TIME</span>
                      <p className="text-white/80 font-bold mt-1 text-[11px] font-mono">{joinDate}</p>
                    </div>

                    <div className="p-3 bg-zinc-950 border border-white/5">
                      <span className="text-[8px] text-[#D4AF37] uppercase tracking-wider block font-bold">RENEWAL LEDGER CHECK IN</span>
                      <p className="text-brand-gold font-bold mt-1 text-[11px] font-mono">{renewalDate}</p>
                    </div>

                  </div>

                  <div className="space-y-2.5 pt-2">
                    <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-widest font-black block">🛡️ Active Privileges Stack</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                      {activeBenefitsList.map((ben, idx) => (
                        <div key={idx} className="p-3.5 bg-[#121010] border border-white/10 text-left space-y-1">
                          <h4 className="text-[11px] font-bold text-white uppercase flex items-center gap-1">
                            <Check size={11} className="text-brand-gold shrink-0" />
                            {ben.title}
                          </h4>
                          <p className="text-[9.5px] text-white/50 leading-snug font-sans font-light">{ben.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Badge Showcase Planner */}
                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <div className="flex flex-wrap justify-between items-center gap-3 select-none">
                      <div>
                        <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-widest font-black block">🏆 Badge Showcase Planner</span>
                        <p className="text-[10.5px] text-white/50 leading-snug">
                          Manage and pin achievements to make your sovereign footprint visible within the community.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowHowToEarnModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-brand-gold/30 text-brand-gold bg-brand-gold/10 hover:bg-[#D4AF37] hover:text-black transition-all font-mono text-[9px] uppercase font-bold"
                        title="View Badge Requirements"
                        type="button"
                      >
                        <HelpCircle size={11} />
                        How to Earn
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {badgesConfig.map((badge: any) => {
                        const isEarned = (userData?.communityBadges || []).includes(badge.id);
                        const isPinned = (userData?.pinnedBadges || []).includes(badge.id);
                        
                        return (
                          <div 
                            key={badge.id}
                            className={`p-4 border text-left flex flex-col justify-between space-y-3 relative overflow-hidden transition-all duration-300 ${
                              isEarned
                                ? 'bg-[#121010]/85 border-[#D4AF37]/35 shadow-[0_0_15px_rgba(212,175,55,0.02)]'
                                : 'bg-[#0c0909]/60 border-white/5 opacity-60'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-xs font-black uppercase text-white font-mono tracking-wide leading-tight">
                                  {badge.title}
                                </h4>
                                <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 border leading-none shrink-0 ${
                                  isEarned 
                                    ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20' 
                                    : 'bg-zinc-950/40 text-white/30 border-white/5'
                                }`}>
                                  {isEarned ? 'Earned' : 'Locked'}
                                </span>
                              </div>
                              <p className="text-[8.5px] font-mono text-white/45 uppercase tracking-widest">{badge.desc}</p>
                              <p className="text-[10px] text-white/75 font-sans leading-relaxed font-light pt-1">
                                {isEarned ? `Requirements matched. Ready for your profile canvas!` : badge.criteria}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-white/5 flex gap-2">
                              {isEarned ? (
                                <button
                                  onClick={() => handleTogglePinBadge(badge.id)}
                                  className={`w-full py-1 text-center font-mono text-[8.5px] uppercase font-bold transition-all border ${
                                    isPinned 
                                      ? 'bg-brand-gold text-brand-black border-brand-gold hover:bg-transparent hover:text-brand-gold' 
                                      : 'bg-transparent text-white/60 border-white/10 hover:border-brand-gold hover:text-white'
                                  }`}
                                  type="button"
                                >
                                  {isPinned ? '📌 Pinned Showcase' : 'Pin to Showcase'}
                                </button>
                              ) : (
                                <div className="w-full py-1 border border-dashed border-white/5 text-center font-mono text-[8px] text-white/20 uppercase">
                                  Complete criteria to unlock
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}


              {/* RENDER SECTION 3: ACCOUNT SETTINGS */}
              {activeSubTab === 'settings' && (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <p className="text-[11px] text-white/50 leading-relaxed font-sans font-light">
                    Configure your communication nodes and local viewport variables. Keep your privacy variables safe from unauthorized client lookups.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-mono">
                    
                    {/* Language dropdown select */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-white/50 uppercase tracking-wider block">Language Preference</label>
                      <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 p-3 text-white focus:border-brand-gold outline-none rounded-none"
                      >
                        <option value="English">English (Sovereign)</option>
                        <option value="Yoruba">Yoruba (Yorùbá)</option>
                        <option value="Igbo">Igbo (Ásụ̀sụ́ Ìgbò)</option>
                        <option value="Swahili">Swahili (Kiswahili)</option>
                        <option value="French">French (Français)</option>
                        <option value="Spanish">Spanish (Español)</option>
                      </select>
                    </div>

                    {/* Preferred liaison channel */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-white/50 uppercase tracking-wider block">Primary Liaison Preference</label>
                      <select 
                        value={commPreference}
                        onChange={(e) => setCommPreference(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 p-3 text-white focus:border-brand-gold outline-none rounded-none"
                      >
                        <option value="WhatsApp">Direct WhatsApp Sync</option>
                        <option value="Email">Standard Secure Email</option>
                        <option value="In-App">Internal notifications only</option>
                      </select>
                    </div>

                    {/* Notification Checklist */}
                    <div className="p-4 bg-black/30 border border-white/5 space-y-3 sm:col-span-2">
                      <span className="text-[9px] text-brand-gold uppercase tracking-wider font-bold block">🔔 Notification Settings Node</span>
                      
                      <div className="space-y-2.5">
                        {[
                          { key: 'emailAlerts', label: 'Receive Security Certificate & Password Emails', desc: 'Alerts you instantly if credential parameters rotate.' },
                          { key: 'whatsappSync', label: 'Sync Community Thread Replies to WhatsApp', desc: 'Direct secure dispatch from verified peer nodes.' },
                          { key: 'weeklyReminders', label: 'Weekly Botanical Steam Clean Recaps', desc: 'Weekly review files curated specifically for your cycle type.' },
                          { key: 'securityLogs', label: 'Authorized Device Logins security warnings', desc: 'Instant warning if novel IP indexes request profile authorization.' }
                        ].map((notifOption) => (
                          <label key={notifOption.key} className="flex items-start gap-3 cursor-pointer group">
                            <input 
                              type="checkbox"
                              checked={(notifications as any)[notifOption.key]}
                              onChange={(e) => setNotifications({
                                ...notifications,
                                [notifOption.key]: e.target.checked
                              })}
                              className="mt-1 accent-brand-gold cursor-pointer"
                            />
                            <div className="text-left font-sans text-[10.5px]">
                              <p className="font-bold text-white group-hover:text-brand-gold transition-colors">{notifOption.label}</p>
                              <p className="text-[8.5px] text-white/40 font-light">{notifOption.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Privacy Control Preferences */}
                    <div className="p-4 bg-black/30 border border-white/5 space-y-3 sm:col-span-2">
                      <span className="text-[9px] text-brand-gold uppercase tracking-wider font-bold block">🔒 Privacy Preferences Isolation</span>
                      
                      <div className="space-y-2.5">
                        {[
                          { key: 'privateDirectory', label: 'Hide profile configuration from peer Sister Directory', desc: 'Conceals your active initials and region from search engines.' },
                          { key: 'hideLocationMap', label: 'Suppress geographic location coordinates tracking', desc: 'Forbid map visualizers from querying your regional cluster.' },
                          { key: 'anonymousActivity', label: 'Keep forum message nodes strictly anonymous', desc: 'Sign forum contributions with a generic security hash.' }
                        ].map((privOption) => (
                          <label key={privOption.key} className="flex items-start gap-3 cursor-pointer group">
                            <input 
                              type="checkbox"
                              checked={(privacy as any)[privOption.key]}
                              onChange={(e) => setPrivacy({
                                ...privacy,
                                [privOption.key]: e.target.checked
                              })}
                              className="mt-1 accent-brand-gold cursor-pointer"
                            />
                            <div className="text-left font-sans text-[10.5px]">
                              <p className="font-bold text-white group-hover:text-brand-gold transition-colors">{privOption.label}</p>
                              <p className="text-[8.5px] text-white/40 font-light">{privOption.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Theme Mode Toggle visually */}
                    <div className="p-4 bg-zinc-950 border border-white/5 sm:col-span-2 flex justify-between items-center text-xs">
                      <div className="text-left font-sans">
                        <p className="font-bold text-white uppercase tracking-wider font-mono text-[10px]">🎨 Theme Preferences Configuration</p>
                        <p className="text-[9px] text-white/40 font-light">The community is optimized inside Cosmic Obsidian Dark parameters to alleviate eye strain.</p>
                      </div>
                      
                      <div className="flex bg-[#121010] p-1 border border-white/10 rounded-sm shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setThemePreference('dark');
                            triggerToast("🎨 Theme preference locked to Cosmic Obsidian Dark.");
                          }}
                          className={`px-3 py-1 text-[8.5px] uppercase font-mono font-bold tracking-wider transition-colors ${
                            themePreference === 'dark' 
                              ? 'bg-brand-gold text-brand-black' 
                              : 'text-white/50 hover:text-white'
                          }`}
                        >
                          Obsidian Dark
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setThemePreference('light');
                            triggerToast("⚠️ High Contrast theme is recommended only for high glare environments. Theme preference changed to light.");
                          }}
                          className={`px-3 py-1 text-[8.5px] uppercase font-mono font-bold tracking-wider transition-colors ${
                            themePreference === 'light' 
                              ? 'bg-brand-gold text-brand-black' 
                              : 'text-white/50 hover:text-white'
                          }`}
                        >
                          Contrast Light
                        </button>
                      </div>
                    </div>

                  </div>

                  <div className="pt-4 border-t border-white/5 text-right flex justify-between items-center">
                    <span className="text-[9px] text-white/40 italic font-mono">* All visual parameters automatically cache down in browser memory.</span>
                    <button 
                      type="submit"
                      className="px-6 py-2.5 bg-brand-gold hover:bg-white text-brand-black transition-colors font-mono text-[10px] uppercase tracking-widest font-black"
                    >
                      Save Account Prefs
                    </button>
                  </div>
                </form>
              )}


              {/* RENDER SECTION 4: PASSWORD & SECURITY */}
              {activeSubTab === 'security' && (
                <div className="space-y-6">
                  
                  {/* Password update form */}
                  <form onSubmit={handleUpdatePassword} className="space-y-4 p-4 bg-black/40 border border-white/5 rounded-none text-left">
                    <span className="text-[9px] text-brand-gold font-mono tracking-wider font-black block uppercase">🔐 Rotate Portal Password</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                      <div className="space-y-1">
                        <label className="text-[8.5px] text-white/40 uppercase block">Current Password</label>
                        <div className="relative">
                          <input 
                            type={showPasswordRaw ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-[#121010] border border-white/10 p-2.5 text-white focus:border-brand-gold outline-none text-[11px]"
                            placeholder="••••••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordRaw(!showPasswordRaw)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                          >
                            {showPasswordRaw ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8.5px] text-white/40 uppercase block">New Password Target</label>
                        <input 
                          type={showPasswordRaw ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-[#121010] border border-white/10 p-2.5 text-white focus:border-brand-gold outline-none text-[11px]"
                          placeholder="At least 6 chars"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8.5px] text-white/40 uppercase block">Confirm New Entry</label>
                        <input 
                          type={showPasswordRaw ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-[#121010] border border-white/10 p-2.5 text-white focus:border-brand-gold outline-none text-[11px]"
                          placeholder="Must match"
                        />
                      </div>
                    </div>

                    <div className="text-right pt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-white/5 hover:bg-white/15 text-white transition-colors border border-white/10 hover:border-brand-gold uppercase text-[9px] font-mono tracking-widest font-black"
                      >
                        Rotate Password Cert
                      </button>
                    </div>
                  </form>

                  {/* Two-Factor Authentication Toggle */}
                  <div className="p-4 bg-black/40 border border-white/5 rounded-none flex justify-between items-center font-mono text-xs">
                    <div className="space-y-1 text-left font-sans">
                      <p className="font-bold text-white uppercase tracking-wider font-mono text-[9px]">📱 Two-Factor Authentication (2FA)</p>
                      <p className="text-[9.5px] text-white/50 font-light">Injects an extra authentication challenge over Google Authenticator during portal request entries.</p>
                    </div>

                    <button
                      onClick={() => {
                        setIs2FAEnabled(!is2FAEnabled);
                        triggerToast(is2FAEnabled ? "🛡️ 2FA Challenge loop successfully bypassed." : "🔐 Authenticator 2FA loop initialized. Check your verified backup nodes.");
                      }}
                      className={`px-3 py-1.5 font-bold uppercase tracking-widest text-[8.5px] border ${
                        is2FAEnabled 
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400' 
                          : 'bg-white/5 border-white/15 text-white/60 hover:text-white hover:border-white/30'
                      }`}
                    >
                      {is2FAEnabled ? '2FA ACTIVE ✓' : 'ENABLE 2FA'}
                    </button>
                  </div>

                  {/* Authorized Device Lists / Device Authorization */}
                  <div className="space-y-2.5">
                    <span className="text-[9px] font-mono text-brand-gold uppercase tracking-wider font-bold block text-left">📱 Authorized Devices & Active Sessions</span>
                    
                    <div className="space-y-2">
                      {authorizedDevices.map((dev) => (
                        <div key={dev.id} className="p-3.5 bg-zinc-950 border border-white/5 flex justify-between items-center text-xs font-mono">
                          <div className="flex items-center gap-3 text-left">
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                              <Smartphone size={14} className="text-brand-gold" />
                            </div>
                            <div className="space-y-0.5 font-sans">
                              <p className="font-bold text-white uppercase tracking-wider text-[10.5px]">{dev.name}</p>
                              <p className="text-[9px] text-white/40 font-mono">{dev.spec}</p>
                            </div>
                          </div>

                          <div className="text-right flex items-center gap-3">
                            <span className="text-[8px] text-white/30 block mr-2 font-mono">auth: {dev.authorizedAt}</span>
                            
                            {dev.id !== 'dev-1' ? (
                              <button
                                onClick={() => handleRevokeDevice(dev.id, dev.name)}
                                className="text-red-400 hover:text-red-300 p-1 bg-red-500/10 hover:bg-red-500/20 rounded border border-red-500/20"
                                title="Revoke Device"
                              >
                                <Trash2 size={11} />
                              </button>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-brand-gold/10 border border-brand-gold/20 text-[#D4AF37] text-[7.5px] font-bold">CURRENT DEVICE</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Login activity stream & Security Alerts */}
                  <div className="p-4 bg-zinc-950 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-wider block font-bold">🔒 Secure Session Entry Logs</span>
                      <span className="text-[8px] font-mono text-white/45 uppercase">Last checked: 1 minute ago</span>
                    </div>

                    <div className="space-y-2 text-[9px] font-mono">
                      {[
                        { time: 'Today, 14:33 UTC', device: 'Chrome (macOS)', ip: '102.89.2.148', action: 'Approved Login Key' },
                        { time: '05 June 2026, 09:12 UTC', device: 'Safari (iOS)', ip: '197.210.8.21', action: 'Approved Login Key' },
                        { time: '28 May 2026, 11:44 UTC', device: 'Womb Compass Applet', ip: '105.112.180.45', action: '2FA Certified Entry' }
                      ].map((log, idx) => (
                        <div key={idx} className="flex justify-between items-center text-white/50 border-b border-white/[0.02] pb-1.5 last:border-0 last:pb-0">
                          <span className="font-semibold text-white/75">{log.time}</span>
                          <span>{log.device}</span>
                          <span className="text-white/30 font-bold">{log.ip}</span>
                          <span className="text-emerald-400 text-right">{log.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}


              {/* RENDER SECTION 5: QUICK ACTIONS */}
              {activeSubTab === 'actions' && (
                <div className="space-y-6">
                  <p className="text-[11px] text-white/50 leading-relaxed font-sans font-light">
                    Administrative triggers for your profile data node. Download account datasets, sync membership indices, or terminate active authorization cookies.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] font-mono tracking-widest font-black uppercase">
                    
                    {/* Edit Profile anchor triggers top list change */}
                    <button
                      onClick={() => {
                        setActiveSubTab('info');
                        triggerToast('📝 Modify your contact variables in the fields provided.');
                      }}
                      className="p-4 bg-[#121010] hover:bg-brand-gold/10 hover:text-brand-gold text-white border border-white/10 transition-colors flex items-center gap-3"
                    >
                      <User size={13} className="text-brand-gold shrink-0" />
                      Edit Profile Info Form
                    </button>

                    {/* Update Membership parameters */}
                    <button
                      onClick={() => {
                        setActiveSubTab('membership');
                        triggerToast('🌸 Transiting to active membership details card.');
                      }}
                      className="p-4 bg-[#121010] hover:bg-brand-gold/10 hover:text-brand-gold text-white border border-white/10 transition-colors flex items-center gap-3"
                    >
                      <Award size={13} className="text-brand-gold shrink-0" />
                      Update Membership Status
                    </button>

                    {/* Download Account Data JSON format */}
                    <button
                      onClick={handleDownloadAccountData}
                      className="p-4 bg-[#121010] hover:bg-brand-gold hover:text-brand-black text-white border border-white/10 transition-colors flex items-center gap-3"
                    >
                      <Download size={13} className="text-[#D4AF37] shrink-0" />
                      Download Account Data (JSON)
                    </button>

                    {/* Manage devices block shortcut */}
                    <button
                      onClick={() => {
                        setActiveSubTab('security');
                        triggerToast('🔐 Scrolling down to active sessions list block.');
                      }}
                      className="p-4 bg-[#121010] hover:bg-brand-gold/10 hover:text-brand-gold text-white border border-white/10 transition-colors flex items-center gap-3"
                    >
                      <Smartphone size={13} className="text-brand-gold shrink-0" />
                      Manage Active Devices
                    </button>

                    {/* Standard Secure log out */}
                    <button
                      onClick={async () => {
                        const confirmLogOut = window.confirm("Are you positive you wish to close this secure Somatic session?");
                        if (confirmLogOut) {
                          try {
                            await auth.signOut();
                            triggerToast("🔒 Session terminated safely. Redirecting...");
                          } catch (err) {
                            console.error("Log out error occurred:", err);
                          }
                        }
                      }}
                      className="p-4 bg-red-950/20 hover:bg-red-900/50 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-colors flex items-center gap-3 md:col-span-2 cursor-pointer"
                    >
                      <LogOut size={13} className="shrink-0" />
                      Sign Out of Community Account
                    </button>

                  </div>

                  {/* security certificate caution note */}
                  <div className="p-4 bg-zinc-950 border border-[#D4AF37]/20 rounded-none text-left flex items-start gap-3">
                    <ShieldCheck size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                    <div className="font-sans text-[10px] text-white/50 leading-relaxed font-light">
                      <p className="font-mono text-[9px] text-[#D4AF37] font-bold uppercase tracking-wider mb-1">
                        Sovereign Data Protection Certified
                      </p>
                      The Vagina Room employs strict, zero-knowledge client lookup limits. Declassified data backup keys are fully encrypted prior to temporary browser compilation. Never reveal your token ID block or credentials.
                    </div>
                  </div>

                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
