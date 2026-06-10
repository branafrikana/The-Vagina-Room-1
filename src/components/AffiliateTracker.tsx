import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share2, 
  Copy, 
  Award, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Wallet, 
  Check, 
  Sparkles, 
  History, 
  Gift, 
  Download, 
  Mail, 
  ArrowUpRight, 
  CheckCircle2, 
  HelpCircle, 
  Activity, 
  FileText, 
  Lock, 
  Scale,
  Phone,
  Facebook,
  Instagram,
  ArrowRight,
  Sparkle,
  X,
  CreditCard,
  UserCheck,
  Percent,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function AffiliateTracker() {
  const { user, userData } = useAuth();
  
  // States
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'growth'>('overview');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  
  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState('150');
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'store_credit'>('bank');
  const [bankName, setBankName] = useState('Access Bank');
  const [accountNumber, setAccountNumber] = useState('0124567890');
  const [accountName, setAccountName] = useState('Jane Doe');
  
  // Derived or Seeded Statistics
  const baseCode = userData?.referralCode || (user?.uid ? user.uid.substring(0, 8).toUpperCase() : 'TVR-AMB-88');
  const referralLink = `${window.location.origin}/register?ref=${baseCode}`;
  
  // Real-time tracking sourced from user data, with local state for optimistic UI
  const [availableEarnings, setAvailableEarnings] = useState(userData?.referralEarningsUSD || 0.00);
  const [pendingCommissions, setPendingCommissions] = useState(userData?.pendingPayout || 0.00);
  const [totalEarnings, setTotalEarnings] = useState(userData?.totalEarnings || 0.00);
  const [withdrawalHistoryVal, setWithdrawalHistoryVal] = useState(
    (userData?.totalEarnings || 0) - (userData?.pendingPayout || 0) - (userData?.referralEarningsUSD || 0) // rough estimated calculation
  );
  const [rewardPoints, setRewardPoints] = useState((userData?.activeReferredMembers || 0) * 100);
  const [bonusIncentives, setBonusIncentives] = useState(0.00);

  // Referral counts
  const [totalReferrals, setTotalReferrals] = useState(userData?.totalReferrals || 0);
  const [activeReferrals, setActiveReferrals] = useState(userData?.activeReferredMembers || 0);
  const [pendingReferrals, setPendingReferrals] = useState((userData?.totalReferrals || 0) - (userData?.activeReferredMembers || 0));
  const [successfulSignups, setSuccessfulSignups] = useState(userData?.totalReferrals || 0);
  
  // Calculate conversion rate dynamically (or static if 0)
  const [conversionRate, setConversionRate] = useState(userData?.totalReferrals ? Math.round(((userData?.activeReferredMembers || 0) / userData.totalReferrals) * 100) : 0);
  const [referralGrowth, setReferralGrowth] = useState(userData?.totalReferrals ? 12.5 : 0); // simulated index
  
  // Update local state when userData arrives
  useEffect(() => {
    if (userData) {
      setAvailableEarnings(userData.referralEarningsUSD || 0);
      setPendingCommissions(userData.pendingPayout || 0);
      setTotalEarnings(userData.totalEarnings || userData.referralEarningsUSD || 0);
      setTotalReferrals(userData.totalReferrals || 0);
      setActiveReferrals(userData.activeReferredMembers || 0);
      setPendingReferrals((userData.totalReferrals || 0) - (userData.activeReferredMembers || 0));
      setSuccessfulSignups(userData.totalReferrals || 0);
      setRewardPoints((userData.activeReferredMembers || 0) * 100);
      if (userData.totalReferrals) {
        setConversionRate(Math.round(((userData.activeReferredMembers || 0) / userData.totalReferrals) * 100));
      }
    }
  }, [userData]);

  // Dynamic history logs
  const [referralLogs, setReferralLogs] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    if (user && userData?.referralCode) {
      const fetchRealLogs = async () => {
        try {
          const q = query(collection(db, 'users'), where('referredBy', '==', userData.referralCode));
          const snap = await getDocs(q);
          const logs = snap.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              email: data.email || 'Hidden Email',
              date: new Date(data.createdAt || Date.now()).toISOString().split('T')[0],
              status: data.isMember ? 'Active Support' : 'Pending Verification',
              tier: data.membershipType || 'Standard',
              commission: data.isMember ? `$${10 * (userData?.customCommissionPercentage || 20) / 20}.00` : '$0.00'
            };
          });
          setReferralLogs(logs);
          
          // Also fetch withdrawals
          const wQ = query(collection(db, 'payout_history'), where('userId', '==', user.uid));
          const wSnap = await getDocs(wQ);
          const theWithdrawals = wSnap.docs.map(doc => {
             const data = doc.data();
             return {
                id: doc.id,
                date: data.timestamp ? new Date(data.timestamp.toDate()).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                amount: `$${data.amount?.toFixed(2) || '0.00'}`,
                status: data.status === 'completed' ? 'Disbursed ✅' : 'Processing ⏳',
                method: data.method || 'Bank Transfer'
             };
          });
          setWithdrawals(theWithdrawals);
        } catch (e) {
          console.error("Error fetching referral logs:", e);
        }
      };
      // For immediate empty state
      setReferralLogs([]);
      fetchRealLogs();
    }
  }, [user, userData]);

  // Actions
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    triggerToast('🔗 Unique Referral Link Copied to Clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Join me on The Vagina Room & access premier female wellness education, custom preparations, and an elite supportive community. Sign up here and let's grow together: ${referralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    triggerToast('💬 Redirected to WhatsApp with sharing template!');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
    triggerToast('👥 Redirected to Facebook Share Dialog!');
  };

  const handleShareEmail = () => {
    const subject = `Inviting You to The Vagina Room — Female Wellness & Empowerment`;
    const body = `Hi there,\n\nI want to invite you to join beautiful, high-class female somatic diagnostics and education forum in The Vagina Room. Help more women access support while discovering signature botanical preparations and gold-certified courses.\n\nSign up with my unique ambassador link here:\n${referralLink}\n\nLet's grow together and claim rewards!\nWarmly,\nYour Ambassador Friend`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    triggerToast('✉️ Opened default mail client!');
  };

  // CSV Report Generator
  const handleDownloadReport = () => {
    let csv = 'Referral Token,Email Handle,Registration Date,Current Status,Membership Tier,Commission Generated\n';
    referralLogs.forEach(log => {
      csv += `${baseCode},${log.email},${log.date},${log.status},${log.tier},${log.commission}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tvr_referral_report_${baseCode}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    triggerToast('📊 CSV Referral Ledger Report downloaded successfully!');
  };

  // Submit Payout simulation
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      alert('Please state a valid positive withdraw amount.');
      return;
    }
    if (amount > availableEarnings) {
      alert('Insufficient available balance. Please state an amount below or equivalent to your Available Earnings.');
      return;
    }
    
    try {
      const methodDesc = withdrawMethod === 'bank' ? `${bankName} (${accountNumber.slice(-4)})` : 'Store Credit Voucher';
      
      await addDoc(collection(db, 'payout_history'), {
        userId: user?.uid,
        userEmail: user?.email,
        amount: amount,
        method: methodDesc,
        status: 'pending',
        timestamp: new Date()
      });
      
      if (user?.uid) {
        await updateDoc(doc(db, 'users', user.uid), {
          referralEarningsUSD: increment(-amount),
          pendingPayout: increment(amount), // Send to pending queue for admin disbursement
          payoutMethod: withdrawMethod,
          payoutDetails: methodDesc
        });
      }

      // Process optimistic UI update
      setAvailableEarnings(prev => prev - amount);
      setPendingCommissions(prev => prev + amount);
      setWithdrawals(prev => [
        {
          id: `w-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          amount: `$${amount.toFixed(2)}`,
          status: 'Processing Ledger ⏳',
          method: methodDesc
        },
        ...prev
      ]);
      
      setShowWithdrawModal(false);
      triggerToast(`💰 Payout request for $${amount.toFixed(2)} submitted to accounting ledger!`);
    } catch (e) {
      console.error("Failed to request withdrawal", e);
      alert("System error processing request. Try again.");
    }
  };

  return (
    <div id="refer-earn-root" className="space-y-10 selection:bg-brand-gold selection:text-brand-black text-white">
      
      {/* Dynamic Success Tooltip/Toast */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-[9999] p-4 bg-zinc-950 border border-brand-gold/40 text-brand-gold font-mono text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-3 shadow-2xl rounded"
          >
            <CheckCircle2 size={14} className="stroke-[3] shrink-0" />
            {successToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Spotlight Card */}
      <div className="p-8 md:p-12 bg-zinc-950/80 border border-white/5 relative overflow-hidden backdrop-blur-md rounded-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/5 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-64 h-64 bg-brand-red/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-brand-gold font-mono text-[9px] uppercase tracking-[0.25em] font-semibold">
            <Sparkle size={10} className="animate-pulse" /> Live Ambassador Ledger
          </div>
          <h2 className="text-3xl md:text-5xl font-serif tracking-tight font-light text-gradient-gold">
            🤝 Refer & Earn
          </h2>
          <p className="text-xs md:text-sm text-white/60 font-light leading-relaxed font-sans max-w-2xl">
            Share The Vagina Room and earn rewards for every successful referral. 
            Help more women access wellness education, support, and empowerment while earning commissions, rewards, and exclusive member benefits.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-widest font-mono text-white/40">
            <span className="px-2.5 py-1 bg-white/5 border border-white/10">Code: {baseCode}</span>
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-brand-gold">Commission: 20% Lifetime</span>
          </div>
        </div>
      </div>

      {/* Primary Section: Invite Link Deck */}
      <div className="p-6 md:p-8 bg-black/60 border border-white/10 rounded-none relative">
        <div className="absolute top-2 right-4 text-[9px] font-mono text-brand-gold/30 uppercase tracking-widest">
          EST. 2026
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-md uppercase tracking-wider font-serif text-brand-gold flex items-center gap-2">
              <Share2 size={15} /> 🔗 Referral Link
            </h3>
            <p className="text-[10px] text-white/40 font-mono mt-0.5">Your unique referral link for inviting new members.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
            {/* Display Field */}
            <div className="lg:col-span-8 flex items-center bg-zinc-950 px-4 py-3.5 border border-white/5 font-mono text-[11px] text-white/80 select-all overflow-x-auto whitespace-nowrap scrollbar-none">
              <span className="text-white/30 mr-2 select-none">https://</span>
              <span>{referralLink.replace(/^https?:\/\//, '')}</span>
            </div>
            
            {/* Primary Action Button */}
            <button
              onClick={handleCopyLink}
              id="copy-referral-link"
              className="lg:col-span-4 bg-brand-gold hover:bg-white text-brand-black font-black uppercase text-[10px] tracking-widest px-6 py-3.5 flex items-center justify-center gap-2 transition-all leading-none shadow-lg cursor-pointer max-lg:h-12"
            >
              {copied ? (
                <>
                  <Check size={12} className="stroke-[3]" /> Copied to Ledger
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy Referral Link
                </>
              )}
            </button>
          </div>

          {/* Social Platform Direct Sharing Grid */}
          <div className="pt-2">
            <p className="text-[8px] font-mono uppercase text-white/30 tracking-widest mb-3">Instant Social Outlets</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              
              <button
                onClick={handleShareWhatsApp}
                id="share-whatsapp"
                className="p-3 bg-zinc-950 hover:bg-white/[0.04] border border-white/5 hover:border-brand-gold/50 transition-all flex items-center justify-center gap-2 text-[9px] uppercase tracking-wider font-bold font-mono text-white/70 hover:text-brand-gold group"
              >
                <Phone size={11} className="text-emerald-500 group-hover:scale-110 transition-transform" /> 
                Share via WhatsApp
              </button>

              <button
                onClick={handleShareFacebook}
                id="share-facebook"
                className="p-3 bg-zinc-950 hover:bg-white/[0.04] border border-white/5 hover:border-brand-gold/50 transition-all flex items-center justify-center gap-2 text-[9px] uppercase tracking-wider font-bold font-mono text-white/70 hover:text-brand-gold group"
              >
                <Facebook size={11} className="text-blue-500 group-hover:scale-110 transition-transform" /> 
                Share via Facebook
              </button>

              <button
                onClick={() => setShowInstagramModal(true)}
                id="share-instagram"
                className="p-3 bg-zinc-950 hover:bg-white/[0.04] border border-white/5 hover:border-brand-gold/50 transition-all flex items-center justify-center gap-2 text-[9px] uppercase tracking-wider font-bold font-mono text-white/70 hover:text-brand-gold group"
              >
                <Instagram size={11} className="text-pink-500 group-hover:scale-110 transition-transform" /> 
                Share via Instagram
              </button>

              <button
                onClick={handleShareEmail}
                id="share-email"
                className="p-3 bg-zinc-950 hover:bg-white/[0.04] border border-white/5 hover:border-brand-gold/50 transition-all flex items-center justify-center gap-2 text-[9px] uppercase tracking-wider font-bold font-mono text-white/70 hover:text-brand-gold group"
              >
                <Mail size={11} className="text-yellow-500 group-hover:scale-110 transition-transform" /> 
                Share via Email
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex border-b border-white/5 font-mono text-[9px] uppercase tracking-widest gap-4">
        {[
          { id: 'overview', name: '📊 Statistics & Ledgers' },
          { id: 'rewards', name: '🏆 Rewards Checklist' },
          { id: 'growth', name: '📈 Performance & Tiers' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 border-b px-2 font-bold transition-all ${
              activeTab === tab.id 
                ? 'border-brand-gold text-brand-gold' 
                : 'border-transparent text-white/40 hover:text-white'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-10"
        >
          {activeTab === 'overview' && (
            <>
              {/* SECTION: 📊 Referral Statistics */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1">
                  <div>
                    <h3 className="text-md uppercase tracking-wider font-serif text-brand-gold flex items-center gap-2">
                      <Activity size={15} /> 📊 Referral Statistics
                    </h3>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">Track your referral performance in real time.</p>
                  </div>
                  <span className="text-[8px] text-brand-gold/60 font-mono uppercase tracking-widest">
                    Live updates synchronized
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  
                  {/* Total Referrals */}
                  <div className="p-4 bg-zinc-950 border border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-brand-gold/30 transition-all">
                    <span className="text-[8.5px] text-white/40 font-bold uppercase tracking-wider font-mono">Total Referrals</span>
                    <div className="z-10">
                      <span className="text-3xl font-mono font-black text-white">{totalReferrals}</span>
                      <span className="block text-[7.5px] text-emerald-400 font-mono uppercase tracking-widest mt-1">+3 this week</span>
                    </div>
                  </div>

                  {/* Active Referrals */}
                  <div className="p-4 bg-zinc-950 border border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-brand-gold/30 transition-all">
                    <span className="text-[8.5px] text-white/40 font-bold uppercase tracking-wider font-mono">Active Referrals</span>
                    <div className="z-10">
                      <span className="text-3xl font-mono font-black text-brand-gold">{activeReferrals}</span>
                      <span className="block text-[7.5px] text-white/30 font-mono uppercase tracking-widest mt-1">Paying subscribers</span>
                    </div>
                  </div>

                  {/* Pending Referrals */}
                  <div className="p-4 bg-zinc-950 border border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-brand-gold/30 transition-all">
                    <span className="text-[8.5px] text-white/40 font-bold uppercase tracking-wider font-mono">Pending Referrals</span>
                    <div className="z-10">
                      <span className="text-3xl font-mono font-black text-yellow-500">{pendingReferrals}</span>
                      <span className="block text-[7.5px] text-white/30 font-mono uppercase tracking-widest mt-1">Under verification</span>
                    </div>
                  </div>

                  {/* Successful Sign-Ups */}
                  <div className="p-4 bg-zinc-950 border border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-brand-gold/30 transition-all">
                    <span className="text-[8.5px] text-white/40 font-bold uppercase tracking-wider font-mono">Successful Sign-Ups</span>
                    <div className="z-10">
                      <span className="text-3xl font-mono font-black text-white">{successfulSignups}</span>
                      <span className="block text-[7.5px] text-brand-gold/80 font-mono uppercase tracking-widest mt-1">Lounge certified</span>
                    </div>
                  </div>

                  {/* Conversion Rate */}
                  <div className="p-4 bg-zinc-950 border border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-brand-gold/30 transition-all">
                    <span className="text-[8.5px] text-white/40 font-bold uppercase tracking-wider font-mono">Conversion Rate</span>
                    <div className="z-10">
                      <span className="text-3xl font-mono font-black text-white">{conversionRate}%</span>
                      <span className="block text-[7.5px] text-emerald-400 font-mono uppercase tracking-widest mt-1">Avg limit: 8.5%</span>
                    </div>
                  </div>

                  {/* Referral Growth */}
                  <div className="p-4 bg-zinc-950 border border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-brand-gold/30 transition-all">
                    <span className="text-[8.5px] text-white/40 font-bold uppercase tracking-wider font-mono">Referral Growth</span>
                    <div className="z-10">
                      <span className="text-3xl font-mono font-black text-brand-gold">+{referralGrowth}%</span>
                      <span className="block text-[7.5px] text-white/30 font-mono uppercase tracking-widest mt-1">Growth factor index</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* SECTION: 💰 Commission Tracking */}
              <div className="space-y-6 pt-2">
                <div>
                  <h3 className="text-md uppercase tracking-wider font-serif text-brand-gold flex items-center gap-2">
                    <Wallet size={15} /> 💰 Commission Tracking
                  </h3>
                  <p className="text-[10px] text-white/40 font-mono mt-0.5">Monitor your earnings and reward history.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  
                  {/* Available Earnings */}
                  <div className="p-4 bg-zinc-950 border border-brand-gold/20 flex flex-col justify-between h-28 relative overflow-hidden group hover:bg-brand-gold/[0.01] transition-all">
                    <span className="text-[8.5px] text-brand-gold font-bold uppercase tracking-wider font-mono">Available Earnings</span>
                    <div className="z-10">
                      <span className="text-2xl font-mono font-black text-white">${availableEarnings.toFixed(2)}</span>
                      <span className="block text-[7px] text-white/40 mt-1 font-mono uppercase">₦{(availableEarnings * 1450).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Pending Commissions */}
                  <div className="p-4 bg-zinc-950 border border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-brand-gold/30 transition-all">
                    <span className="text-[8.5px] text-white/40 font-bold uppercase tracking-wider font-mono">Pending Commissions</span>
                    <div className="z-10">
                      <span className="text-2xl font-mono font-black text-zinc-400">${pendingCommissions.toFixed(2)}</span>
                      <span className="block text-[7px] text-white/30 mt-1 font-mono uppercase">Awaiting ledger hold</span>
                    </div>
                  </div>

                  {/* Total Earnings */}
                  <div className="p-4 bg-zinc-950 border border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-brand-gold/30 transition-all">
                    <span className="text-[8.5px] text-white/40 font-bold uppercase tracking-wider font-mono">Total Earnings</span>
                    <div className="z-10">
                      <span className="text-2xl font-mono font-black text-white">${totalEarnings.toFixed(2)}</span>
                      <span className="block text-[7px] text-white/30 mt-1 font-mono uppercase">Cumulative revenue</span>
                    </div>
                  </div>

                  {/* Withdrawal History */}
                  <div className="p-4 bg-zinc-950 border border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-brand-gold/30 transition-all">
                    <span className="text-[8.5px] text-white/40 font-bold uppercase tracking-wider font-mono">Withdrawal History</span>
                    <div className="z-10">
                      <span className="text-2xl font-mono font-black text-zinc-400">${withdrawalHistoryVal.toFixed(2)}</span>
                      <span className="block text-[7px] text-white/30 mt-1 font-mono uppercase">Transferred safely</span>
                    </div>
                  </div>

                  {/* Reward Points Balance */}
                  <div className="p-4 bg-zinc-950 border border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-brand-gold/30 transition-all">
                    <span className="text-[8.5px] text-white/40 font-bold uppercase tracking-wider font-mono">Reward Points Balance</span>
                    <div className="z-10">
                      <span className="text-2xl font-mono font-black text-brand-gold">{rewardPoints} pts</span>
                      <span className="block text-[7px] text-white/30 mt-1 font-mono uppercase">10 points = $1.00 Value</span>
                    </div>
                  </div>

                  {/* Bonus Incentives */}
                  <div className="p-4 bg-zinc-950 border border-white/5 flex flex-col justify-between h-28 relative overflow-hidden group hover:border-brand-gold/30 transition-all">
                    <span className="text-[8.5px] text-white/40 font-bold uppercase tracking-wider font-mono">Bonus Incentives</span>
                    <div className="z-10">
                      <span className="text-2xl font-mono font-black text-white">${bonusIncentives.toFixed(2)}</span>
                      <span className="block text-[7px] text-white/30 mt-1 font-mono uppercase">Dynamic milestones claim</span>
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}

          {activeTab === 'rewards' && (
            /* SECTION: 🏆 Referral Rewards Checklist */
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase text-brand-gold tracking-wider flex items-center gap-2 font-serif">
                  <Award size={16} /> 🏆 Referral Rewards
                </h3>
                <p className="text-[10px] text-white/40 italic font-mono mt-0.5">Unlock additional benefits as you grow your network.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Wellness Reward Points */}
                <div className="p-5 bg-zinc-950 border border-brand-gold/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 text-[7px] font-mono rounded tracking-widest uppercase">
                      LEVEL 1 REWARD
                    </span>
                    <h4 className="text-xs font-serif font-bold text-white uppercase mt-1">Wellness Reward Points</h4>
                    <p className="text-[9px] text-white/50 leading-relaxed font-sans font-light">Earn double reward points on your personal orders for every third registration linked under your system token. Points can be instantly redeemed for signature preparatives or course materials.</p>
                  </div>
                  <div className="shrink-0 text-right font-mono">
                    <p className="text-lg font-black text-brand-gold">UNLOCKED ✅</p>
                    <p className="text-[8px] text-white/40 uppercase font-bold mt-1">Status: Live Active</p>
                  </div>
                </div>

                {/* 2. Free Event Access */}
                <div className="p-5 bg-zinc-950 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-brand-gold/20 transition-all">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-white/5 text-white/60 border border-white/10 text-[7px] font-mono rounded tracking-widest uppercase">
                      LEVEL 2 REWARD (5 SIGNUPS)
                    </span>
                    <h4 className="text-xs font-serif font-bold text-white uppercase mt-1">Free Event Access</h4>
                    <p className="text-[9px] text-white/50 leading-relaxed font-sans font-light">Gain direct premium access codes to all of our local health circles, streaming forums, and medical symposium events. Valid for yourself and one guest.</p>
                  </div>
                  <div className="shrink-0 text-right font-mono">
                    <p className="text-lg font-black text-brand-gold">UNLOCKED ✅</p>
                    <p className="text-[8px] text-white/40 uppercase font-bold mt-1">Referrals match: 18/5</p>
                  </div>
                </div>

                {/* 3. Course Discounts */}
                <div className="p-5 bg-zinc-950 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-brand-gold/20 transition-all">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 text-[7px] font-mono rounded tracking-widest uppercase">
                      CERTIFICATE ACCESS
                    </span>
                    <h4 className="text-xs font-serif font-bold text-white uppercase mt-1">Course Discounts</h4>
                    <p className="text-[9px] text-white/50 leading-relaxed font-sans font-light">Unlock 35% discount vouchers off our curated Vagina Education Certification programs. Vouchers are saved inside your member inbox folder instantly.</p>
                  </div>
                  <div className="shrink-0 text-right font-mono">
                    <p className="text-lg font-black text-white">REDEEMED 🔔</p>
                    <p className="text-[8px] text-white/40 uppercase font-bold mt-1">Saved to inbox folder</p>
                  </div>
                </div>

                {/* 4. Product Discounts */}
                <div className="p-5 bg-zinc-950 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-brand-gold/20 transition-all">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-white/5 text-white/60 border border-white/10 text-[7px] font-mono rounded tracking-widest uppercase">
                      BOTANICAL VALUE
                    </span>
                    <h4 className="text-xs font-serif font-bold text-white uppercase mt-1">Product Discounts</h4>
                    <p className="text-[9px] text-white/50 leading-relaxed font-sans font-light">Enjoy 25% discount coupons off any luxury botanical or anatomical models ordered through the store page.</p>
                  </div>
                  <div className="shrink-0 text-right font-mono">
                    <p className="text-lg font-black text-brand-gold">ACTIVE ✅</p>
                    <p className="text-[8px] text-white/40 uppercase font-bold mt-1">Applied on checkout automatically</p>
                  </div>
                </div>

                {/* 5. Exclusive Community Benefits */}
                <div className="p-5 bg-zinc-950 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-brand-gold/20 transition-all">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-white/5 text-white/60 border border-white/10 text-[7px] font-mono rounded tracking-widest uppercase">
                      VIP CIRCLE (10 SIGNUPS)
                    </span>
                    <h4 className="text-xs font-serif font-bold text-white uppercase mt-1">Exclusive Community Benefits</h4>
                    <p className="text-[9px] text-white/50 leading-relaxed font-sans font-light">Direct invitation into our high-level moderator channels and somatic test group boards, giving you influence over custom herbal formulations and diagnostics setups.</p>
                  </div>
                  <div className="shrink-0 text-right font-mono">
                    <p className="text-lg font-black text-brand-gold">UNLOCKED ✅</p>
                    <p className="text-[8px] text-white/40 uppercase font-bold mt-1">Members joined: 18</p>
                  </div>
                </div>

                {/* 6. Recognition Awards */}
                <div className="p-5 bg-zinc-950 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-brand-gold/20 transition-all">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-brand-gold/15 text-brand-gold border border-brand-gold/20 text-[7px] font-mono rounded tracking-[0.2em] uppercase">
                      GOLD ELITE EXCLUSIVE
                    </span>
                    <h4 className="text-xs font-serif font-bold text-white uppercase mt-1">Recognition Awards</h4>
                    <p className="text-[9px] text-white/50 leading-relaxed font-sans font-light">Receive custom-framed Certificate plaques as a Women's Dignity Advocate and physical gifts from our founders. Awarded live at our Annual Female Health Circle Gala.</p>
                  </div>
                  <div className="shrink-0 text-right font-mono font-medium">
                    <p className="text-xs text-brand-gold uppercase tracking-wider font-bold">NEXT PROGRESSIVE TIER</p>
                    <p className="text-[8px] text-white/30 uppercase font-bold mt-1">12 additional signups needed</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'growth' && (
            /* SECTION: 📈 Performance Level & Tiers */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black uppercase text-brand-gold tracking-wider flex items-center gap-2 font-serif">
                    <TrendingUp size={16} /> 📈 Performance Level
                  </h3>
                  <p className="text-[10px] text-white/40 italic font-mono mt-0.5">Track your referral status and achievements.</p>
                </div>
                <div className="bg-brand-gold/10 border border-brand-gold/20 px-3 py-1 text-[9px] font-mono text-brand-gold uppercase tracking-widest font-black">
                  Current Level: Community Advocate
                </div>
              </div>

              {/* Progress Toward Next Level bar */}
              <div className="bg-zinc-950 p-6 border border-white/5 space-y-4">
                <div className="flex justify-between items-center text-[10px] uppercase font-mono">
                  <span className="text-white/50">Next level progress to Gold Advocate:</span>
                  <span className="text-brand-gold font-bold">18 / 30 Active referrals (60%)</span>
                </div>
                <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-brand-gold h-full" style={{ width: '60%' }} />
                </div>
                <p className="text-[9px] text-white/40 italic font-mono">
                  View progress toward your next level and available rewards. Add 12 active members to shift commission rate to 25%!
                </p>
              </div>

              {/* Levels Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left font-mono">
                
                {/* Level 1: Bronze */}
                <div className="p-4 bg-zinc-950/40 border border-white/10 space-y-3 relative opacity-80">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-white/40 uppercase block font-bold">LEVEL ONE</span>
                    <span className="text-emerald-400 text-[10px]">UNLOCKED</span>
                  </div>
                  <div>
                    <h5 className="text-xs font-black uppercase text-white font-sans tracking-tight">Bronze Advocate</h5>
                    <p className="text-[8px] text-white/40 mt-1 font-sans">Required limit: 0 - 5 members. Earn 15% recurring commissions on general membership orders.</p>
                  </div>
                </div>

                {/* Level 2: Silver */}
                <div className="p-4 bg-gradient-to-b from-brand-gold/[0.02] to-transparent border border-brand-gold/40 space-y-3 relative">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-brand-gold uppercase block font-bold">LEVEL TWO</span>
                    <span className="text-brand-gold text-[10px] font-bold">ACTIVE LEVEL</span>
                  </div>
                  <div>
                    <h5 className="text-xs font-black uppercase text-white font-sans tracking-tight">Silver Advocate</h5>
                    <p className="text-[8px] text-white/50 mt-1 font-sans">Required limit: 6 - 15 members. Currently earning 20% recurring commissions on all active sub-accounts.</p>
                  </div>
                </div>

                {/* Level 3: Gold */}
                <div className="p-4 bg-zinc-950/40 border border-white/5 space-y-3 relative opacity-60">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-white/30 uppercase block font-bold font-serif">LEVEL THREE</span>
                    <span className="text-white/30 text-[9px]">LOCKED</span>
                  </div>
                  <div>
                    <h5 className="text-xs font-black uppercase text-zinc-400 font-sans tracking-tight">Gold Advocate</h5>
                    <p className="text-[8px] text-white/30 mt-1 font-sans">Required limit: 16 - 30 members. Scale up to 25% recurring commissions plus free Event Passes for life.</p>
                  </div>
                </div>

                {/* Level 4: Platinum */}
                <div className="p-4 bg-zinc-950/40 border border-white/5 space-y-3 relative opacity-60">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-white/30 uppercase block font-bold font-serif">LEVEL FOUR</span>
                    <span className="text-white/30 text-[9px]">LOCKED</span>
                  </div>
                  <div>
                    <h5 className="text-xs font-black uppercase text-zinc-400 font-sans tracking-tight">Platinum Advocate</h5>
                    <p className="text-[8px] text-white/30 mt-1 font-sans">Required limit: 30+ active members. Peak 30% recurring commissions, VIP Lounge setup, and Founders Gala invites.</p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* SECTION: 🚀 Quick Actions Widget */}
      <div className="p-6 bg-zinc-950 border border-white/5 space-y-5">
        <div>
          <h3 className="text-xs uppercase tracking-widest text-brand-gold font-mono font-bold flex items-center gap-1.5">
            <Sparkles size={11} className="text-brand-gold" /> 🚀 Quick Actions
          </h3>
          <p className="text-[9px] text-white/30 font-mono mt-0.5">Quick administrative features for affiliate accounts.</p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          
          <button
            onClick={handleCopyLink}
            id="qa-copy-link"
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-mono text-[9px] uppercase tracking-widest font-bold border border-white/5 transition-all text-center flex items-center justify-center gap-1.5"
          >
            <Copy size={11} className="text-brand-gold" /> Copy Referral Link
          </button>
          
          <button
            onClick={() => setShowHistoryModal(true)}
            id="qa-view-history"
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-mono text-[9px] uppercase tracking-widest font-bold border border-white/5 transition-all text-center flex items-center justify-center gap-1.5"
          >
            <History size={11} className="text-brand-gold" /> View Referral History
          </button>

          <button
            onClick={() => setShowWithdrawModal(true)}
            id="qa-withdraw-earnings"
            className="px-4 py-2 bg-brand-gold/10 hover:bg-brand-gold hover:text-brand-black text-brand-gold font-mono text-[9px] uppercase tracking-widest font-bold border border-brand-gold/20 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <DollarSign size={11} /> Withdraw Earnings
          </button>

          <button
            onClick={handleDownloadReport}
            id="qa-download-report"
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-mono text-[9px] uppercase tracking-widest font-bold border border-white/5 transition-all text-center flex items-center justify-center gap-1.5"
          >
            <Download size={11} className="text-brand-gold" /> Download Referral Report
          </button>

          <a
            href="mailto:support@thevaginaroom.com?subject=Affiliate%20Partner%20Inquiry"
            id="qa-contact-support"
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-mono text-[9px] uppercase tracking-widest font-bold border border-white/5 transition-all text-center flex items-center justify-center gap-1.5"
          >
            <Mail size={11} className="text-brand-gold" /> Contact Affiliate Support
          </a>

        </div>
      </div>

      {/* Footer Quote Area */}
      <div className="text-center py-6 border-t border-white/5">
        <p className="text-xs font-serif italic text-white/50 tracking-wide font-light">
          Grow the community. Empower women. Earn rewards. 🌸
        </p>
      </div>

      {/* MODAL 1: REFERRAL HISTORY LOGS */}
      <AnimatePresence>
        {showHistoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-zinc-950 border border-white/10 p-6 rounded-none relative space-y-6 max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowHistoryModal(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                type="button"
              >
                <X size={16} />
              </button>

              <div className="space-y-1">
                <h4 className="text-lg font-serif font-bold text-brand-gold flex items-center gap-2">
                  <History size={16} /> Affiliate Ledger & Referrals
                </h4>
                <p className="text-[10px] text-white/40 font-mono">Detailed records of users signups and commission outcomes linked to your somatic token.</p>
              </div>

              {/* Referral Account Logs Table */}
              <div className="space-y-4">
                <div className="border border-white/10">
                  <table className="w-full text-left font-mono text-[10px]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10 text-[8px] uppercase text-white/40 tracking-wider">
                        <th className="p-3">Email Handle</th>
                        <th className="p-3">Signup Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Tier</th>
                        <th className="p-3 text-right">Commission</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {referralLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-3 text-white/80">{log.email}</td>
                          <td className="p-3 text-white/40">{log.date}</td>
                          <td className="p-3">
                            <span className={`px-1.5 py-0.5 text-[8.5px] rounded-[1px] ${
                              log.status.includes('Active') 
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                                : log.status.includes('Pending') 
                                ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20' 
                                : 'bg-red-500/10 text-red-300 border border-red-500/20'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3 text-white/60">{log.tier}</td>
                          <td className="p-3 text-right text-brand-gold font-bold">{log.commission}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Simulated Withdrawal Records Column */}
                <div className="space-y-2.5 pt-2 text-left">
                  <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold font-mono">Historical Withdrawals Timeline</span>
                  <div className="space-y-2">
                    {withdrawals.map((withdraw) => (
                      <div key={withdraw.id} className="p-3 bg-white/[0.01] border border-white/5 flex justify-between items-center text-[10px]">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white uppercase">{withdraw.method}</p>
                          <p className="text-[8px] text-white/30 font-mono">{withdraw.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">{withdraw.amount}</p>
                          <p className="text-[8.5px] text-brand-gold mt-1 uppercase font-mono">{withdraw.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="px-5 py-2.5 bg-zinc-900 border border-white/10 hover:bg-white/5 text-white font-mono text-[9px] uppercase tracking-widest font-bold"
                >
                  Close Ledger View
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: WITHDRAW EARNINGS FORM */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-zinc-950 border border-white/10 p-6 rounded-none relative space-y-5 text-left"
            >
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                type="button"
              >
                <X size={16} />
              </button>

              <div className="space-y-1">
                <h4 className="text-lg font-serif font-bold text-brand-gold">💰 Withdraw Earnings</h4>
                <p className="text-[10px] text-white/40 font-mono">Claim and disburse your available affiliate commissions.</p>
              </div>

              {/* Status Banner */}
              <div className="p-3 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold font-mono text-[9px] uppercase tracking-wider flex justify-between items-center">
                <span>Instantly Withdrawable:</span>
                <span className="font-black text-xs">${availableEarnings.toFixed(2)}</span>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-4 font-mono text-[10px]">
                
                {/* Method selector */}
                <div className="space-y-1">
                  <label className="text-[8px] text-white/50 uppercase tracking-widest font-bold block">Disbursement Route</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('bank')}
                      className={`py-3 text-[9px] font-bold border transition-all text-center uppercase tracking-widest ${
                        withdrawMethod === 'bank'
                          ? 'border-brand-gold text-brand-gold bg-brand-gold/5'
                          : 'border-white/10 text-white/50 hover:text-white'
                      }`}
                    >
                      <CreditCard size={11} className="inline mr-1" /> Bank Account (Naira/USD)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('store_credit')}
                      className={`py-3 text-[9px] font-bold border transition-all text-center uppercase tracking-widest ${
                        withdrawMethod === 'store_credit'
                          ? 'border-brand-gold text-brand-gold bg-brand-gold/5'
                          : 'border-white/10 text-white/50 hover:text-white'
                      }`}
                    >
                      <Gift size={11} className="inline mr-1" /> Store Credit Voucher
                    </button>
                  </div>
                </div>

                {/* Amount input */}
                <div className="space-y-1">
                  <label className="text-[8px] text-white/50 uppercase tracking-widest font-bold block">Withdraw Value (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-white/40 text-xs font-bold">$</span>
                    <input
                      type="number"
                      required
                      min="10"
                      max={availableEarnings}
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value)}
                      className="w-full bg-black border border-white/10 p-2.5 pl-7 text-xs text-brand-gold selection:bg-brand-gold outline-none focus:border-brand-gold/50"
                    />
                  </div>
                  <p className="text-[8px] text-white/30 italic">A minimum payout threshold limits transactions below $10.</p>
                </div>

                {/* Conditionally render bank fields */}
                {withdrawMethod === 'bank' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3.5 border-t border-white/5 pt-3.5"
                  >
                    <div className="space-y-1">
                      <label className="text-[8px] text-white/40 uppercase block">Receiving Bank Coordinate</label>
                      <select 
                        value={bankName}
                        onChange={e => setBankName(e.target.value)}
                        className="w-full bg-black border border-white/10 p-2.5 text-xs text-white uppercase font-bold outline-none rounded"
                      >
                        <option value="Access Bank">Access Bank Nigeria</option>
                        <option value="Guaranty Trust Bank">Guaranty Trust Bank (GTB)</option>
                        <option value="Zenith Bank">Zenith Bank Plc</option>
                        <option value="United Bank for Africa">United Bank for Africa (UBA)</option>
                        <option value="Chase Bank USD">Chase Bank (US Domestic Wire)</option>
                        <option value="Barclays Bank UK">Barclays Sweep Account (UK)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] text-white/40 uppercase block">Account Number / IBAN</label>
                      <input 
                        type="text" 
                        required
                        value={accountNumber}
                        onChange={e => setAccountNumber(e.target.value)}
                        className="w-full bg-black border border-white/10 p-2 text-xs text-white tracking-widest font-bold focus:border-brand-gold/40 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] text-white/40 uppercase block">Account Owner Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={accountName}
                        onChange={e => setAccountName(e.target.value)}
                        className="w-full bg-black border border-white/10 p-2 text-xs text-white uppercase focus:border-brand-gold/40 outline-none"
                      />
                    </div>
                  </motion.div>
                )}

                {withdrawMethod === 'store_credit' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 bg-white/[0.02] border border-white/5 text-[9px] text-white/50 leading-relaxed font-sans font-light"
                  >
                    💡 Selecting **Store Credit Voucher** provides an immediate voucher code with a **10% premium bonus** value added. E.g., withdrawing **$100.00** grants a **$110.00** store checkout credit!
                  </motion.div>
                )}

                <div className="pt-2 flex justify-end gap-2 text-[9px] uppercase tracking-widest font-bold">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="px-4 py-2 bg-zinc-900 border border-white/10 hover:bg-white/5 text-white"
                  >
                    Abort Payout
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-gold text-brand-black hover:bg-white transition-colors"
                  >
                    Confirm & Queue Ledger Payout
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 3: INSTAGRAM SHARING METHOD */}
      <AnimatePresence>
        {showInstagramModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-zinc-950 border border-white/10 p-6 rounded-none relative space-y-5 text-left font-sans"
            >
              <button
                onClick={() => setShowInstagramModal(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                type="button"
              >
                <X size={16} />
              </button>

              <div className="space-y-1">
                <span className="text-[8px] font-mono text-pink-500 uppercase tracking-widest font-bold block">Sharing Coordinates</span>
                <h4 className="text-md uppercase tracking-wider font-serif text-white">Share via Instagram</h4>
              </div>

              <div className="space-y-3.5 text-xs text-white/70 font-light leading-relaxed">
                <p>Since Instagram doesn't permit direct web link click triggering, please follow these premium sharing steps:</p>
                
                <ol className="list-decimal list-inside space-y-2 text-[11px] font-mono font-medium">
                  <li>
                    <span className="text-brand-gold">Copy Link:</span> <button onClick={() => { handleCopyLink(); setShowInstagramModal(false); }} className="underline text-white hover:text-brand-gold">Click to copy unique link sticker</button>
                  </li>
                  <li>
                    <span className="text-brand-gold">Instagram Bio:</span> Dynamic links are best pasted directly into your bio settings area.
                  </li>
                  <li>
                    <span className="text-brand-gold">Link Stickers:</span> In your stories, choose the "Link" Sticker widget option and paste the copied token.
                  </li>
                </ol>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowInstagramModal(false)}
                  className="px-5 py-2.5 bg-zinc-900 border border-white/10 hover:bg-white/5 text-white font-mono text-[9px] uppercase tracking-widest font-bold"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
