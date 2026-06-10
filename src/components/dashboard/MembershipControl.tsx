import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Calendar, ArrowUpCircle } from 'lucide-react';

export default function MembershipControl() {
  const { userData } = useAuth();
  
  return (
    <div className="bg-white/[0.02] p-8 border border-white/10 space-y-6">
      <h3 className="text-sm font-black uppercase text-brand-gold tracking-widest flex items-center gap-2">
        <ShieldCheck size={14} /> Membership Status
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-brand-black p-4 border border-white/5">
          <p className="text-[9px] uppercase text-white/40">Current Plan</p>
          <p className="text-sm font-bold text-white">{userData?.membershipType || 'Standard'}</p>
        </div>
        <div className="bg-brand-black p-4 border border-white/5">
          <p className="text-[9px] uppercase text-white/40">Expires</p>
          <p className="text-sm font-bold text-white">{userData?.membershipExpiration ? new Date(userData.membershipExpiration).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
      <button className="w-full bg-brand-gold text-brand-black py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2">
        <ArrowUpCircle size={12} /> Upgrade Plan
      </button>
    </div>
  );
}
