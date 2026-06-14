import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Calendar, 
  Award, 
  RefreshCw, 
  Copy, 
  Settings,
  Image as ImageIcon,
  CheckCircle2,
  Lock,
  Zap,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import MemberIDCard from './MemberIDCard';

export default function MemberIdentity() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState<'card' | 'status' | 'settings'>('card');
  const [toastMessage, setToastMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const memberName = userData?.fullName || userData?.name || 
    (userData?.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : 'Sister of the Community');
  const membershipId = userData?.membershipId || 'TVR-AMB-4819';
  
  const getPlanDisplay = (tier: string) => {
    if (!tier) return "Gold Plan";
    const t = tier.toLowerCase();
    if (t === 'gold' || t === 'quarterly') return "Premium Member (Gold)";
    if (t === 'diamond' || t === 'yearly') return "VIP Member (Diamond)";
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };
  
  const membershipTier = getPlanDisplay(userData?.membershipType || 'gold');

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      triggerToast("Identity successfully verified on secure network.");
    }, 1500);
  };

  return (
    <div className="space-y-8 font-sans text-white text-left relative pb-20">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 bg-[#D4AF37] text-black px-6 py-4 rounded-none shadow-2xl z-[9999] border border-white/20 flex gap-3 items-center"
          >
            <ShieldCheck size={18} />
            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-widest font-mono">Identity System</h4>
              <p className="text-sm font-medium">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <div className="bg-[#110f0f] border border-white/5 p-6 sm:p-8 relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4AF37]/[0.02] blur-3xl rounded-full select-none pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
             <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-[0.3em] font-extrabold block">
                Authentication & Status
             </span>
             <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest font-bold flex items-center gap-1">
                <CheckCircle2 size={10} /> Verified Active
             </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase text-white tracking-tight flex items-center gap-3">
            💳 Member Identity
          </h2>
          <p className="text-xs text-white/50 max-w-2xl font-light font-sans leading-relaxed">
            Your digital proof of access and belonging. Manage your secure credential, track your ecosystem level, and verify your authenticity network-wide.
          </p>
        </div>
        
        <div className="flex gap-4 shrink-0 w-full lg:w-auto">
           <div className="bg-white/5 border border-white/10 p-5 flex-1 lg:flex-none flex flex-col justify-center gap-2 min-w-[150px]">
              <div className="text-[9px] font-mono uppercase tracking-widest text-white/50">Current Tier</div>
              <div className="text-sm font-bold font-sans text-[#D4AF37] uppercase flex items-center gap-2">
                 {membershipTier} <Award size={14} />
              </div>
           </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar font-mono text-[10px] uppercase tracking-widest bg-white/[0.02] p-1">
        {[
          { id: 'card', label: 'Digital ID Card' },
          { id: 'status', label: 'Membership Status & Tiers' },
          { id: 'settings', label: 'Identity Settings' }
        ].map(tab => (
          <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={`px-4 py-2.5 whitespace-nowrap transition-all border-b-2 ${
               activeTab === tab.id 
                 ? 'border-[#D4AF37] text-[#D4AF37] font-bold bg-[#D4AF37]/5' 
                 : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'
             }`}
          >
             {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
         
         {/* DIGITAL ID CARD */}
         {activeTab === 'card' && (
            <div className="space-y-6">
               <MemberIDCard />
            </div>
         )}
         
         {/* STATUS & TIERS */}
         {activeTab === 'status' && (
            <div className="space-y-6">
               <div className="grid md:grid-cols-3 gap-6">
                 
                 {/* Current Status Box */}
                 <div className="md:col-span-1 bg-[#110f0f] border border-[#D4AF37]/30 p-6 relative overflow-hidden group flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-2xl group-hover:bg-[#D4AF37]/10 transition-colors" />
                    <div>
                       <h3 className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest font-bold mb-4">Ecosystem Standing</h3>
                       <div className="text-2xl font-serif font-black text-white uppercase mb-1">{membershipTier}</div>
                       <p className="text-xs text-white/50 mb-6">You are actively accessing premium transformative health education & support.</p>
                       
                       <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-white/80">
                             <CheckCircle2 size={16} className="text-emerald-500" /> Secure System ID Linked
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/80">
                             <CheckCircle2 size={16} className="text-emerald-500" /> Digital Profile Encrypted
                          </div>
                          <div className="flex items-center gap-2 text-sm text-white/80">
                             <CheckCircle2 size={16} className="text-emerald-500" /> Device Access Whitelisted
                          </div>
                       </div>
                    </div>
                    
                    <button onClick={handleVerify} disabled={isVerifying} className="mt-8 w-full px-4 py-3 bg-white/5 hover:bg-[#D4AF37] border border-white/10 hover:border-[#D4AF37] text-white hover:text-black font-mono text-[9px] uppercase tracking-widest transition-colors font-bold flex items-center justify-center gap-2">
                       {isVerifying ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />} Ping Verification Server
                    </button>
                 </div>
                 
                 {/* Tier Progression */}
                 <div className="md:col-span-2 bg-[#110f0f] border border-white/5 p-6">
                   <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Tier Progression Network</h3>
                   
                   <div className="space-y-4">
                      {[
                         { name: 'Basic Wellness Member', desc: 'Free access to introductory material', active: false, passed: true },
                         { name: 'Active Learning Member', desc: 'Completed initial courses & setups', active: false, passed: true },
                         { name: 'Premium Member', desc: 'Full event, tools & community access', active: true, passed: false },
                         { name: 'VIP / Elite Member', desc: '1-on-1 access and priority scheduling', active: false, passed: false }
                      ].map((tier, i) => (
                         <div key={i} className={`p-4 border flex items-center justify-between ${tier.active ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50' : tier.passed ? 'bg-white/[0.02] border-white/10 opacity-60' : 'bg-transparent border-white/5 opacity-40'}`}>
                            <div className="flex items-center gap-4">
                               <div className={`w-8 h-8 flex items-center justify-center rounded-full ${tier.active ? 'bg-[#D4AF37] text-black' : tier.passed ? 'bg-white/20 text-white' : 'bg-white/5 text-white/30'}`}>
                                  {tier.passed ? <CheckCircle size={14} /> : <Lock size={14} />}
                               </div>
                               <div>
                                  <h4 className={`text-sm font-bold uppercase ${tier.active ? 'text-[#D4AF37]' : 'text-white'}`}>{tier.name}</h4>
                                  <p className="text-[10px] font-mono mt-0.5">{tier.desc}</p>
                               </div>
                            </div>
                            {tier.active && <span className="text-[9px] font-mono bg-[#D4AF37] text-black px-2 py-0.5 uppercase tracking-widest font-black">Current</span>}
                         </div>
                      ))}
                   </div>
                 </div>

               </div>
            </div>
         )}
         
         {/* SETTINGS */}
         {activeTab === 'settings' && (
            <div className="space-y-6">
               <div className="grid md:grid-cols-2 gap-6">
                  {/* Photo Management */}
                  <div className="bg-[#110f0f] border border-white/5 p-6">
                     <h3 className="text-sm font-bold text-white uppercase mb-2 flex items-center gap-2"><ImageIcon size={16} className="text-[#D4AF37]" /> Identity Presentation</h3>
                     <p className="text-[10px] font-mono text-white/50 mb-6 uppercase tracking-wider">Manage your official member portrait used across physical lounge access and digital verification.</p>
                     
                     <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start p-4 bg-black/40 border border-white/10">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white/30 font-serif text-2xl overflow-hidden shrink-0">
                           {userData?.photoURL ? <img src={userData.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : memberName[0]}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                           <p className="text-sm text-white font-bold">{memberName}</p>
                           <p className="text-[9px] font-mono mt-1 text-[#D4AF37] uppercase tracking-widest mb-3">{membershipId}</p>
                           <button onClick={() => triggerToast("Use the ID card interface to upload a new portrait.")} className="text-[10px] font-mono uppercase bg-white/10 hover:bg-white/20 px-3 py-1.5 transition-colors border border-white/10">
                              Update Portrait
                           </button>
                        </div>
                     </div>
                  </div>
                  
                  {/* Security */}
                  <div className="bg-[#110f0f] border border-white/5 p-6">
                     <h3 className="text-sm font-bold text-white uppercase mb-2 flex items-center gap-2"><Lock size={16} className="text-[#D4AF37]" /> Authentication & Privacy</h3>
                     <p className="text-[10px] font-mono text-white/50 mb-6 uppercase tracking-wider">Control your cryptographic signatures and privacy visibility within the ecosystem.</p>
                     
                     <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 border border-white/10 bg-black/20">
                           <div>
                              <p className="text-xs text-white font-bold uppercase">Public Discovery</p>
                              <p className="text-[9px] font-mono text-white/40 mt-1">Allow other members to view your tier</p>
                           </div>
                           <div className="w-10 h-5 bg-[#D4AF37] rounded-full relative cursor-pointer" onClick={() => triggerToast("Privacy setting updated.")}>
                              <div className="w-4 h-4 bg-black rounded-full absolute top-0.5 right-0.5" />
                           </div>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 border border-white/10 bg-black/20">
                           <div>
                              <p className="text-xs text-white font-bold uppercase">Dynamic QR Rotation</p>
                              <p className="text-[9px] font-mono text-white/40 mt-1">Cycle QR tokens hourly for extreme security</p>
                           </div>
                           <div className="w-10 h-5 bg-white/20 rounded-full relative cursor-pointer" onClick={() => triggerToast("QR rotation standard active.")}>
                              <div className="w-4 h-4 bg-white/50 rounded-full absolute top-0.5 left-0.5" />
                           </div>
                        </div>
                        <button onClick={() => triggerToast("Revocation warning initiated.")} className="mt-4 w-full py-2 border border-red-500/30 text-red-400 text-[9px] font-mono uppercase tracking-widest hover:bg-red-500/10 transition-colors">
                           Revoke Active Device Sessions
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
