import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function ImpersonationBanner() {
  const { isImpersonating, userData, stopImpersonation } = useAuth();
  const navigate = useNavigate();

  if (!isImpersonating || !userData) {
    return null;
  }

  const handleExit = () => {
    stopImpersonation();
    navigate('/admin');
  };

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      className="fixed top-0 inset-x-0 z-[10000] bg-zinc-950/95 border-b-2 border-brand-gold py-3 px-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans tracking-wide"
    >
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-ping shrink-0" />
        <div className="flex items-center gap-2">
          <Eye className="text-brand-gold" size={15} />
          <span className="font-extrabold uppercase text-white/50 text-[10px] tracking-wider">
            Admin Viewport:
          </span>
          <span className="font-semibold text-brand-gold underline select-all">
            {userData.email}
          </span>
          <span className="px-1.5 py-0.5 rounded-[2px] text-[8px] bg-white/10 text-white/60 uppercase font-mono font-bold">
            {userData.role || 'Member'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <button
          onClick={handleExit}
          className="w-full sm:w-auto px-4 py-2 bg-brand-gold text-brand-black hover:bg-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 font-bold border border-brand-gold"
        >
          <ArrowLeft size={12} className="stroke-[2.5]" />
          Exit Preview & Return to Admin
        </button>
      </div>
    </motion.div>
  );
}
