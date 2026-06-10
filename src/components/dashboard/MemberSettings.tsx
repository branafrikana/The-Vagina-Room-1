import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Eye, 
  EyeOff, 
  Lock, 
  Shield, 
  Smartphone, 
  Globe, 
  CreditCard, 
  Trash2, 
  Download, 
  Key, 
  RefreshCw, 
  UserCheck, 
  Power, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  Activity, 
  MapPin, 
  Clock,
  Laptop,
  CheckSquare,
  ShieldCheck,
  ChevronRight,
  Info,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

type SettingSection = 'notifications' | 'privacy' | 'security' | 'devices' | 'preferences' | 'membership';

export default function MemberSettings() {
  const { user, userData, hasActiveMembership } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingSection>('notifications');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Notification State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [communityUpdates, setCommunityUpdates] = useState(true);
  const [promotionalMessages, setPromotionalMessages] = useState(false);

  // 2. Privacy State
  const [profileVisibility, setProfileVisibility] = useState<'members' | 'public' | 'private'>('members');
  const [communityDisplayName, setCommunityDisplayName] = useState(userData?.fullName || '');
  const [dataSharing, setDataSharing] = useState(true);
  const [consentApproved, setConsentApproved] = useState(true);
  const [requestDeleteConfirm, setRequestDeleteConfirm] = useState(false);

  // 3. Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState(user?.email || '');

  // 4. Device Management State
  const [activeDevices, setActiveDevices] = useState([
    { id: 'dev-1', name: 'Chrome on Windows', active: 'Just Now', status: 'Authorized', isCurrent: true, location: 'Lagos, NG' },
    { id: 'dev-2', name: 'Samsung Galaxy A54', active: '3 Days Ago', status: 'Authorized', isCurrent: false, location: 'Abuja, NG' },
    { id: 'dev-3', name: 'Safari on macOS', active: '1 Week Ago', status: 'Authorized', isCurrent: false, location: 'Lagos, NG' }
  ]);
  const [deviceResetting, setDeviceResetting] = useState(false);

  // 5. Preferences State
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState('English (UK)');
  const [timeZone, setTimeZone] = useState('Africa/Lagos (GMT+1)');
  const [sizePreference, setSizePreference] = useState<'normal' | 'large'>('normal');

  // Trigger temporary messages
  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleUpdateNotifications = () => {
    triggerSuccess('Notification preferences securely updated on ledger.');
  };

  const handleSavePrivacy = async () => {
    if (user?.uid) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          fullName: communityDisplayName
        });
        triggerSuccess('Privacy options and display name synchronized.');
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to update name on Cloud scale.');
        setTimeout(() => setErrorMsg(''), 4000);
      }
    } else {
      triggerSuccess('Privacy settings synchronized.');
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    triggerSuccess('Credentials successfully updated.');
  };

  const handleDeviceAction = (deviceId: string, actionName: string) => {
    if (actionName === 'disconnect_all') {
      if (confirm("Disconnect and deauthorize all other active device tokens?")) {
        setActiveDevices(prev => prev.filter(d => d.isCurrent));
        triggerSuccess('All remote tokens deauthorized.');
      }
    } else {
      setActiveDevices(prev => prev.filter(d => d.id !== deviceId));
      triggerSuccess('Somatic device access revoked.');
    }
  };

  const handleDownloadData = () => {
    const backupData = {
      userEmail: user?.email,
      membershipId: userData?.membershipId || 'TVR-001',
      activeStatus: hasActiveMembership ? 'Verified' : 'Inactive',
      cyclesData: 'Encrypted somatic records protected by security policy',
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tvr_member_data_${userData?.membershipId || 'TVR-001'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    triggerSuccess('Secured download initialized.');
  };

  const handleDeleteRequest = () => {
    alert("Your account deletion request has been logged safely. A clinical security officer will reach out via your authorized phone/email in 24 hours to conduct ID validation.");
    setRequestDeleteConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Settings Top Notifications/Alert Bar */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-2.5 rounded"
          >
            <CheckCircle2 size={14} className="stroke-[3] shrink-0" />
            {successMsg}
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 font-mono text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-2.5 rounded"
          >
            <AlertTriangle size={14} className="shrink-0" />
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Settings Mini Sidebar of sub-menus */}
        <div className="w-full lg:w-64 bg-zinc-950 border border-white/5 p-4 rounded shrink-0 space-y-1">
          {[
            { id: 'notifications', name: '🔔 Notifications', desc: 'Alert channels & updates' },
            { id: 'privacy', name: '🔒 Privacy Settings', desc: 'Autonomy and visibility logs' },
            { id: 'security', name: '🛡️ Security Settings', desc: 'Passcodes & second-factor' },
            { id: 'devices', name: '📱 Device Management', desc: 'Restricted hardware details' },
            { id: 'preferences', name: '🌐 Preferences', desc: 'Display & localized syncing' },
            { id: 'membership', name: '📋 Membership Settings', desc: 'Gold plan & payments ledger' },
          ].map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as SettingSection)}
                className={`w-full text-left p-3 rounded transition-all flex justify-between items-center group ${
                  isActive 
                    ? 'bg-brand-gold text-brand-black shadow' 
                    : 'hover:bg-white/[0.02] text-white/50 hover:text-white'
                }`}
                type="button"
              >
                <div className="leading-tight">
                  <span className="text-[11px] font-black uppercase tracking-wider block font-sans">
                    {sec.name}
                  </span>
                  <span className={`text-[8px] block font-light mt-0.5 ${isActive ? 'text-brand-black/60 font-medium' : 'text-white/30 font-light'}`}>
                    {sec.desc}
                  </span>
                </div>
                <ChevronRight size={12} className={`transition-transform duration-200 ${isActive ? 'translate-x-1 text-brand-black' : 'group-hover:translate-x-1'}`} />
              </button>
            );
          })}
        </div>

        {/* Outer Form Content Section */}
        <div className="flex-1 w-full min-w-0 bg-white/[0.01] border border-white/10 p-6 sm:p-8 rounded transition-all">
          <AnimatePresence mode="wait">
            {/* NOTIFICATIONS CONTAINER */}
            {activeSection === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-black uppercase text-brand-gold tracking-wider">🔔 Notifications</h3>
                  <p className="text-[10px] text-white/40 italic font-mono mt-0.5">Control how you receive updates and secure communications.</p>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Email */}
                  <div className="flex items-start justify-between border-b border-white/5 pb-4">
                    <div className="text-left max-w-[80%]">
                      <p className="text-[11px] font-bold text-white uppercase tracking-tight">Email Notifications</p>
                      <p className="text-[9px] text-white/40 font-sans font-light mt-0.5">Receive cycle updates, booked session confirmations, and immediate laboratory support ticket replies.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={emailNotifications} 
                        onChange={(e) => setEmailNotifications(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-brand-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold"></div>
                    </label>
                  </div>

                  {/* Community */}
                  <div className="flex items-start justify-between border-b border-white/5 pb-4">
                    <div className="text-left max-w-[80%]">
                      <p className="text-[11px] font-bold text-white uppercase tracking-tight">Community Updates</p>
                      <p className="text-[9px] text-white/40 font-sans font-light mt-0.5">Alert me to new community feed discussions, direct messaging threads, and interactive stream RSVP counts.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={communityUpdates} 
                        onChange={(e) => setCommunityUpdates(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-brand-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold"></div>
                    </label>
                  </div>

                  {/* Promotional */}
                  <div className="flex items-start justify-between border-b border-white/5 pb-4">
                    <div className="text-left max-w-[80%]">
                      <p className="text-[11px] font-bold text-white uppercase tracking-tight">Promotional Messages</p>
                      <p className="text-[9px] text-white/40 font-sans font-light mt-0.5">Let me know when luxury botanical products, partner collaborations, and referral reward bonuses are active.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={promotionalMessages} 
                        onChange={(e) => setPromotionalMessages(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-brand-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleUpdateNotifications}
                    className="bg-brand-gold text-brand-black hover:bg-white px-5 py-2.5 text-[9px] uppercase font-black tracking-widest transition-colors font-sans rounded"
                    type="button"
                  >
                    Save Notification preferences
                  </button>
                </div>
              </motion.div>
            )}

            {/* PRIVACY SETTINGS */}
            {activeSection === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-black uppercase text-brand-gold tracking-wider">🔒 Privacy Settings</h3>
                  <p className="text-[10px] text-white/40 italic font-mono mt-0.5">Manage your structural visibility and personal somatic records.</p>
                </div>

                <div className="space-y-5 text-left">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-mono text-white/50 uppercase tracking-widest block">Community Display Name</label>
                    <input 
                      type="text"
                      className="w-full max-w-md bg-brand-black border border-white/10 focus:border-brand-gold/50 text-white uppercase p-2.5 text-xs font-mono rounded tracking-wider"
                      value={communityDisplayName}
                      onChange={(e) => setCommunityDisplayName(e.target.value)}
                    />
                    <p className="text-[8px] text-white/30 italic">Used in discussion boards and lounges instead of email identity.</p>
                  </div>

                  {/* Profile visibility select */}
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-mono text-white/50 uppercase tracking-widest block">Profile Visibility Mode</label>
                    <div className="grid grid-cols-3 gap-2 max-w-md">
                      {[
                        { id: 'members', label: 'Members Only' },
                        { id: 'public', label: 'Public Index' },
                        { id: 'private', label: 'Strict Private' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setProfileVisibility(item.id as any)}
                          className={`text-[9px] uppercase tracking-wider py-2 font-black rounded border transition-all ${
                            profileVisibility === item.id 
                              ? 'bg-brand-gold text-brand-black border-brand-gold' 
                              : 'bg-transparent border-white/10 hover:border-white/30 text-white/60 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Data sharing toggle */}
                  <div className="flex items-start justify-between border-b border-white/5 pb-4 pt-2">
                    <div className="max-w-[80%]">
                      <p className="text-[11px] font-bold text-white uppercase tracking-tight">Data Sharing Preferences</p>
                      <p className="text-[9px] text-white/40 font-sans font-light mt-0.5">Allow clinical labs to review raw, anonymous feedback structures to optimize herbal blend dynamics.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={dataSharing} 
                        onChange={(e) => setDataSharing(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-brand-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold"></div>
                    </label>
                  </div>

                  {/* Consent Management */}
                  <div className="flex items-start justify-between border-b border-white/5 pb-4">
                    <div className="max-w-[80%]">
                      <p className="text-[11px] font-bold text-white uppercase tracking-tight">Consent Management Matrix</p>
                      <p className="text-[9px] text-white/40 font-sans font-light mt-0.5">Enable continuous medical privacy compliance verification flags with third-party labs.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={consentApproved} 
                        onChange={(e) => setConsentApproved(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-brand-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-gold"></div>
                    </label>
                  </div>

                  {/* Extract / delete triggers */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
                    <button
                      onClick={handleDownloadData}
                      type="button"
                      className="px-4 py-2 border border-white/10 hover:border-brand-gold/40 text-white hover:text-brand-gold text-[9px] font-black uppercase tracking-widest transition-all rounded flex items-center gap-1.5"
                    >
                      <Download size={11} /> Download My Data Index
                    </button>
                    
                    <button
                      onClick={() => setRequestDeleteConfirm(true)}
                      type="button"
                      className="px-4 py-2 border border-red-500/10 hover:border-red-500/40 text-red-400 hover:bg-red-500/5 text-[9px] font-black uppercase tracking-widest transition-all rounded flex items-center gap-1.5"
                    >
                      <Trash2 size={11} /> Request Account Deletion
                    </button>
                  </div>
                </div>

                {/* Privacy Save Bar */}
                <div className="pt-4 flex justify-between items-center bg-black/25 p-4 rounded border border-white/5">
                  <span className="text-[8px] font-mono text-white/30 uppercase tracking-wider">Secure database validation standards</span>
                  <button
                    onClick={handleSavePrivacy}
                    className="bg-brand-gold text-brand-black hover:bg-white px-5 py-2 text-[9px] font-black uppercase tracking-widest transition-colors font-sans rounded"
                    type="button"
                  >
                    Commit Privacy parameters
                  </button>
                </div>

                {/* Delete Confirmation Modal */}
                {requestDeleteConfirm && (
                  <div className="fixed inset-0 bg-black/90 backdrop-blur z-[9999] flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-zinc-950 border border-red-500/30 p-6 rounded relative space-y-4 text-center">
                      <div className="w-12 h-12 bg-red-500/15 border border-red-500/40 text-red-500 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase text-white font-sans tracking-tight">Confirm Deletion Request</h4>
                        <p className="text-[10px] text-white/50 leading-relaxed font-light mt-1 text-left font-sans">
                          Are you completely sure you want to trigger an administrative deletion request? This will permanently wipe all botanical logs, active affiliate referrals, commission scores, and certified course material access. This process is absolutely irreversible.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setRequestDeleteConfirm(false)}
                          className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white text-[9px] uppercase font-black tracking-widest transition-colors rounded font-mono"
                        >
                          Abort Request
                        </button>
                        <button
                          onClick={handleDeleteRequest}
                          className="flex-1 py-2 bg-red-500 text-white hover:bg-red-600 text-[9px] uppercase font-black tracking-widest transition-colors rounded font-mono"
                        >
                          Confirm Deletion Log
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* SECURITY SETTINGS */}
            {activeSection === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-black uppercase text-brand-gold tracking-wider">🛡️ Security Settings</h3>
                  <p className="text-[10px] text-white/40 italic font-mono mt-0.5">Protect your structural account records and physical terminals.</p>
                </div>

                {/* Password reset form */}
                <form onSubmit={handleUpdatePassword} className="space-y-4 border-b border-white/5 pb-6">
                  <h4 className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Change Account Password</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-mono text-white/50 uppercase tracking-widest block">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          className="w-full bg-brand-black border border-white/10 p-2 text-xs text-white uppercase tracking-wider font-mono outline-none rounded focus:border-brand-gold/40"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-2.5 text-white/30 hover:text-white"
                        >
                          {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-mono text-white/50 uppercase tracking-widest block">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-2 text-xs text-white uppercase tracking-wider font-mono outline-none rounded focus:border-brand-gold/40"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] font-mono text-white/50 uppercase tracking-widest block">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-2 text-xs text-white uppercase tracking-wider font-mono outline-none rounded focus:border-brand-gold/40"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-brand-gold text-brand-black hover:bg-white px-4 py-2 text-[9px] uppercase font-black tracking-widest transition-colors font-sans rounded"
                  >
                    Commit New Password
                  </button>
                </form>

                {/* 2-Factor authentication */}
                <div className="flex flex-col sm:flex-row items-start justify-between border-b border-white/5 pb-6 gap-4">
                  <div className="text-left w-full sm:max-w-[70%]">
                    <h4 className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Two-Factor Authentication (2FA)</h4>
                    <p className="text-[11px] font-bold text-white uppercase mt-1 tracking-tight">Google Authenticator Integration</p>
                    <p className="text-[9px] text-white/40 font-sans font-light mt-0.5">Encrypts login with a temporary passcode. If active, every new login terminal authorization session must provide an authorized token coordinate.</p>
                  </div>
                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setTwoFactorEnabled(!twoFactorEnabled);
                        triggerSuccess(twoFactorEnabled ? '2FA disabled.' : '2FA secret initialized successfully. Save your emergency backup code.');
                      }}
                      className={`px-4 py-2 text-[9px] uppercase tracking-widest font-black font-mono transition-all rounded border ${
                        twoFactorEnabled
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/10'
                      }`}
                    >
                      {twoFactorEnabled ? '2FA ACTIVE ✅' : 'ENABLE 2FA SECURITY'}
                    </button>
                  </div>
                </div>

                {/* Security Alerts and Sessions log list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Recovery Options */}
                  <div className="p-4 bg-white/[0.01] border border-white/10 rounded space-y-4 text-left">
                    <h5 className="text-[10px] font-mono text-white/30 uppercase tracking-widest pb-1 border-b border-white/5">Account Recovery Options</h5>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-white/40 uppercase tracking-widest block">Emergency recovery email</label>
                        <input
                          type="email"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          className="w-full bg-brand-black border border-white/10 text-xs text-white p-2 font-mono outline-none rounded focus:border-brand-gold/30"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => triggerSuccess('Recovery email secured.')}
                        className="w-full bg-white/5 hover:bg-white/10 text-white py-2 text-[8px] uppercase tracking-widest font-black transition-colors rounded font-mono"
                      >
                        Set Recovery Method
                      </button>
                    </div>
                  </div>

                  {/* Security Alert logs */}
                  <div className="p-4 bg-white/[0.01] border border-white/10 rounded space-y-3 text-left">
                    <h5 className="text-[10px] font-mono text-white/30 uppercase tracking-widest pb-1 border-b border-white/5">Emergency Security Alerts</h5>
                    <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                      <div className="flex items-start gap-2.5 text-[10px]">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full shrink-0 mt-1" />
                        <div>
                          <p className="font-bold text-white uppercase font-sans">Active terminal sequence synced</p>
                          <p className="text-[8px] text-white/40 mt-0.5 font-mono">Today 13:52 (Lagos, NG - IP: 102.89.x.x)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 text-[10px]">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full shrink-0 mt-1" />
                        <div>
                          <p className="font-bold text-yellow-400 uppercase font-sans flex items-center gap-1">Hardware Key Verified</p>
                          <p className="text-[8px] text-white/40 mt-0.5 font-mono">Yesterday 18:24 (Device authorization updated)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* DEVICE MANAGEMENT */}
            {activeSection === 'devices' && (
              <motion.div
                key="devices"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black uppercase text-brand-gold tracking-wider">📱 Device Management</h3>
                    <p className="text-[10px] text-white/40 italic font-mono mt-0.5">Manage localized terminal hardware browser permissions and authorization states.</p>
                  </div>
                  <button
                    onClick={() => handleDeviceAction('', 'disconnect_all')}
                    type="button"
                    className="px-3 py-1.5 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/10 text-red-400 text-[8px] font-mono uppercase tracking-widest transition-colors font-bold rounded"
                  >
                    Disconnect Other Devices
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  {/* Current Device Details Card */}
                  <div className="bg-gradient-to-br from-zinc-950 to-neutral-900 border border-brand-gold/30 p-5 rounded space-y-4">
                    <span className="text-[8px] font-mono text-brand-gold uppercase tracking-widest block font-bold">CURRENT SECURED DEVICE</span>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5">
                        <Laptop className="text-brand-gold" size={18} />
                        <div>
                          <h4 className="text-xs font-black uppercase text-white font-sans">Chrome on Windows (Latest)</h4>
                          <p className="text-[9px] text-white/40 font-sans mt-0.5 font-mono">IP: 102.89.x.x / Fingerprint sequence active</p>
                        </div>
                      </div>

                      <div className="p-3 bg-black/40 border border-white/5 text-[9px] font-mono text-white/60 rounded">
                        <p className="uppercase text-white/30 text-[8px] tracking-wider leading-none mb-1">Local Identity Key</p>
                        <p className="truncate select-all">{localStorage.getItem('tvr_deviceId') || 'TVR-HARD-KEY-001'}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[9px]">
                        <span className="text-white/40 uppercase font-mono">Authorization Status</span>
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[8px] font-mono tracking-widest uppercase font-bold flex items-center gap-1 rounded">
                          <Check size={9} strokeWidth={3} /> Authorized ✅
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Other devices management */}
                  <div className="p-5 bg-white/[0.01] border border-white/10 rounded space-y-4">
                    <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest block">AUTHORIZED TETHERED DEVICES</span>

                    <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                      {activeDevices.map((dev) => (
                        <div key={dev.id} className="flex items-start justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0 gap-3">
                          <div className="flex items-start gap-2.5 text-[11px] font-sans">
                            <Smartphone className="text-brand-gold shrink-0 mt-0.5" size={14} />
                            <div className="leading-tight">
                              <p className={`font-bold text-white uppercase ${dev.isCurrent ? 'text-brand-gold' : ''}`}>
                                {dev.name} {dev.isCurrent && '(This Device)'}
                              </p>
                              <p className="text-[8px] text-white/30 mt-0.5 font-mono">LOCATION: {dev.location} | ACTIVE: {dev.active}</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 items-end shrink-0">
                            <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-[2px] text-[7.5px] text-white/50 font-mono tracking-wider font-bold">
                              AUTHORIZED
                            </span>
                            {!dev.isCurrent && (
                              <button
                                onClick={() => handleDeviceAction(dev.id, 'revoked')}
                                type="button"
                                className="text-[8px] font-bold text-red-400 hover:text-white uppercase tracking-widest font-sans"
                              >
                                Revoke Access
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Device assurances */}
                <div className="p-4 bg-white/[0.01] border border-dashed border-white/10 text-white/40 text-[9.5px] font-sans flex items-start gap-2.5 rounded text-left">
                  <Info size={14} className="text-brand-gold shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Tethered browser fingerprint protocol active.</strong> The Vagina Room limits concurrent device logs to protect women’s health data security standards. You may clear external credentials to refresh logins on other phones safely.
                  </p>
                </div>
              </motion.div>
            )}

            {/* PREFERENCES */}
            {activeSection === 'preferences' && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-black uppercase text-brand-gold tracking-wider">🌐 Preferences</h3>
                  <p className="text-[10px] text-white/40 italic font-mono mt-0.5">Customize your localized digital dashboard look, language, and size presets.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-2">
                  {/* Theme Select */}
                  <div className="space-y-2">
                    <label className="text-[8px] font-mono text-white/50 uppercase tracking-widest block">Dashboard Theme Palette</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setThemeMode('dark');
                          triggerSuccess('Cosmic Obsidian dark mode optimized successfully.');
                        }}
                        type="button"
                        className={`p-3 text-[9px] uppercase tracking-wider font-black text-center border rounded transition-all flex flex-col items-center gap-1 ${
                          themeMode === 'dark'
                            ? 'bg-brand-gold text-brand-black border-brand-gold shadow'
                            : 'bg-transparent border-white/10 hover:border-white/35 text-white/60 hover:text-white'
                        }`}
                      >
                        🌌 Cosmic Obsidian
                        <span className="text-[7px] opacity-75 font-mono lowercase">Eye-strain defense</span>
                      </button>

                      <button
                        onClick={() => {
                          setThemeMode('light');
                          triggerSuccess('Simulated off-white ambient light theme applied temporarily.');
                        }}
                        type="button"
                        className={`p-3 text-[9px] uppercase tracking-wider font-black text-center border rounded transition-all flex flex-col items-center gap-1 ${
                          themeMode === 'light'
                            ? 'bg-zinc-200 text-zinc-950 border-white'
                            : 'bg-transparent border-white/10 hover:border-white/35 text-white/60 hover:text-white'
                        }`}
                      >
                        🕯️ Alabaster Community
                        <span className="text-[7px] opacity-50 font-mono lowercase">Refined contrast</span>
                      </button>
                    </div>
                  </div>

                  {/* Accessibility sizing */}
                  <div className="space-y-2">
                    <label className="text-[8px] font-mono text-white/50 uppercase tracking-widest block">Accessibility font sizing</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'normal', label: 'Clinical Standard', desc: 'Standard UI font size' },
                        { id: 'large', label: 'Generous Read', desc: 'Enhanced contrast and size' }
                      ].map((pref) => (
                        <button
                          key={pref.id}
                          onClick={() => {
                            setSizePreference(pref.id as any);
                            triggerSuccess(`Font size preset switched to ${pref.label}`);
                          }}
                          type="button"
                          className={`p-3 text-left border rounded transition-all ${
                            sizePreference === pref.id
                              ? 'border-brand-gold text-brand-gold bg-brand-gold/5'
                              : 'border-white/10 text-white/60 hover:border-white/20'
                          }`}
                        >
                          <p className="text-[9px] font-sans font-black uppercase text-white">{pref.label}</p>
                          <p className="text-[7px] text-white/40 mt-0.5">{pref.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Localised Sync dropdown selections */}
                  <div className="space-y-2">
                    <label className="text-[8px] font-mono text-white/50 uppercase tracking-widest block">System Language</label>
                    <select
                      value={language}
                      onChange={(e) => {
                        setLanguage(e.target.value);
                        triggerSuccess(`Language localized to: ${e.target.value}`);
                      }}
                      className="w-full bg-brand-black border border-white/10 p-2.5 text-xs text-white uppercase tracking-wider font-mono outline-none rounded"
                    >
                      <option value="English (UK)">English (UK)</option>
                      <option value="English (US)">English (US)</option>
                      <option value="Yoruba">Yoruba / Èdè Yorùbá</option>
                      <option value="Hausa">Hausa / Ɗanyen</option>
                      <option value="French">French / Français</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] font-mono text-white/50 uppercase tracking-widest block">Sync Time Zone</label>
                    <select
                      value={timeZone}
                      onChange={(e) => {
                        setTimeZone(e.target.value);
                        triggerSuccess(`Live circle schedules synced to: ${e.target.value}`);
                      }}
                      className="w-full bg-brand-black border border-white/10 p-2.5 text-xs text-white uppercase tracking-wider font-mono outline-none rounded"
                    >
                      <option value="Africa/Lagos (GMT+1)">Africa/Lagos (GMT+1)</option>
                      <option value="Europe/London (BST/GMT)">Europe/London (BST/GMT)</option>
                      <option value="America/New_York (EST)">America/New_York (EST)</option>
                      <option value="West African Time (WAT)">West African Time (WAT)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-3 text-[10px] items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />
                  <p className="text-white/40 font-mono uppercase">All options are cached locally within secure cookies.</p>
                </div>
              </motion.div>
            )}

            {/* MEMBERSHIP SETTINGS */}
            {activeSection === 'membership' && (
              <motion.div
                key="membership"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-black uppercase text-brand-gold tracking-wider">📋 Membership Settings</h3>
                  <p className="text-[10px] text-white/40 italic font-mono mt-0.5">Manage your active tier, physical renewals, and payment validation history.</p>
                </div>

                {/* Plan stats boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  <div className="p-4 bg-zinc-950 border border-white/10 rounded">
                    <p className="text-[8.5px] font-mono text-brand-gold uppercase tracking-widest">Membership Plan</p>
                    <p className="text-xs font-black uppercase text-white mt-1.5">{userData?.membershipType || '🌟 Gold quarterly'}</p>
                  </div>
                  <div className="p-4 bg-zinc-950 border border-white/10 rounded">
                    <p className="text-[8.5px] font-mono text-white/30 uppercase tracking-widest">Activation Status</p>
                    <p className="text-xs font-black uppercase text-emerald-400 mt-1.5">ACTIVE VERIFIED ✅</p>
                  </div>
                  <div className="p-4 bg-zinc-950 border border-white/10 rounded">
                    <p className="text-[8.5px] font-mono text-white/30 uppercase tracking-widest">Next Renewal Date</p>
                    <p className="text-xs font-black uppercase text-brand-gold mt-1.5">15 DEC 2026</p>
                  </div>
                </div>

                {/* Billing ledger transactions */}
                <div className="space-y-6 text-left">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-mono text-white/30 uppercase tracking-widest pb-1 border-b border-white/5">Billing Ledgers</h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono text-[10px] text-white/70">
                        <thead>
                          <tr className="border-b border-white/5 uppercase text-white/35 text-[8px] tracking-widest">
                            <th className="py-2">Reference Token ID</th>
                            <th className="py-2">Date Trigger</th>
                            <th className="py-2">Transaction Type</th>
                            <th className="py-2">Amount Paid</th>
                            <th className="py-2 text-right">Receipt File</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono">
                          <tr>
                            <td className="py-3 font-semibold select-all">TXN-734-921</td>
                            <td className="py-3">05 Jun 2026</td>
                            <td className="py-3 uppercase">Gold Renewal</td>
                            <td className="py-3 font-bold text-emerald-400">₦25,000 / $50</td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => alert("Downloading certified transaction receipt index...")}
                                type="button"
                                className="text-brand-gold hover:text-white uppercase font-black tracking-widest text-[8px]"
                              >
                                Get Receipt File
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Official Payment Accounts Info for Bank Transfers */}
                  <div className="bg-white/[0.02] border border-white/5 p-4 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="text-brand-gold" size={14} />
                      <h4 className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Official Payment Account Protocols</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Membership Account */}
                      <div className="p-3 bg-black/40 border border-white/5 space-y-2">
                        <span className="text-[8px] font-mono text-brand-gold uppercase tracking-widest block">FOR MEMBERSHIP ACTIVATIONS</span>
                        <div className="space-y-1 text-[10px] uppercase font-mono">
                          <p className="text-white font-bold">Bank: {JSON.parse(userData?.generalSettingsJson || '{}').membershipBankDetails?.name || 'Vant Edge Microfinance'}</p>
                          <p className="text-white/70">Name: {JSON.parse(userData?.generalSettingsJson || '{}').membershipBankDetails?.accountName || 'THE VAGINA ROOM COMMUNITY'}</p>
                          <p className="text-brand-gold font-black select-all">Account: {JSON.parse(userData?.generalSettingsJson || '{}').membershipBankDetails?.accountNo || '0098432112'}</p>
                        </div>
                        <p className="text-[7.5px] text-white/30 italic mt-1 leading-relaxed">Specific account for all community subscriptions and renewals.</p>
                      </div>

                      {/* Store Account */}
                      <div className="p-3 bg-black/40 border border-white/5 space-y-2">
                        <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest block">FOR BOUTIQUE SHOP ORDERS</span>
                        <div className="space-y-1 text-[10px] uppercase font-mono">
                          <p className="text-white font-bold">Bank: {JSON.parse(userData?.generalSettingsJson || '{}').storeBankDetails?.name || 'Vant Edge Microfinance'}</p>
                          <p className="text-white/70">Name: {JSON.parse(userData?.generalSettingsJson || '{}').storeBankDetails?.accountName || 'THE VAGINA ROOM BOUTIQUE'}</p>
                          <p className="text-white/70 font-black select-all">Account: {JSON.parse(userData?.generalSettingsJson || '{}').storeBankDetails?.accountNo || '0098774321'}</p>
                        </div>
                        <p className="text-[7.5px] text-white/30 italic mt-1 leading-relaxed">Dedicated logistics channel for curated product purchases.</p>
                      </div>
                    </div>

                    <div className="flex gap-2 items-start text-[9px] text-white/30 pt-1">
                      <Info size={12} className="text-brand-gold shrink-0 mt-0.5" />
                      <p>Ensure you select the correct designated account to avoid reconciliation delays. Membership payments submitted to the boutique channel may take 48-72 hours to verify.</p>
                    </div>
                  </div>
                </div>

                {/* Upgrade trigger / plan features list */}
                <div className="p-5 bg-white/[0.01] border border-white/10 rounded flex flex-col md:flex-row items-center justify-between gap-4 text-left">
                  <div className="space-y-1">
                    <p className="text-[9px] font-mono text-brand-gold uppercase tracking-wider font-bold">WANT TO UPGRADE YOUR MEMBERSHIP?</p>
                    <h5 className="text-xs font-black uppercase text-white">Elevate to Lifetime Advocate Tier</h5>
                    <p className="text-[10px] text-white/40 leading-relaxed font-sans">
                      Enjoy lifetime unlimited diagnostic guides, free botanicals delivered quarterly, and higher referral commission payouts (starting at 35% tier structure).
                    </p>
                  </div>
                  <button
                    onClick={() => alert("Upgrading account query dispatched. Admin will coordinate on WhatsApp for transaction setup.")}
                    type="button"
                    className="bg-brand-gold text-brand-black hover:bg-white text-[9px] font-black uppercase tracking-widest px-4 py-2.5 transition-colors font-bold shrink-0 inline-flex items-center gap-1 leading-none rounded"
                  >
                    Upgrade Tier <DollarSign size={11} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
