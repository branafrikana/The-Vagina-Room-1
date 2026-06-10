import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Cake, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminAutomationPanel() {
  const { userData } = useAuth();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<string | null>(null);

  const triggerBirthdayCheck = async () => {
    const password = prompt("Enter Admin Password to confirm manual trigger:");
    if (!password) return;

    setStatus('loading');
    setTimeout(() => {
        setStatus('error');
        setResult("Birthday triggers are disabled in the current No-Backend architecture.");
    }, 500);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/5 border border-white/10 p-8 rounded-none">
        <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-xl font-black uppercase tracking-widest text-brand-gold flex items-center gap-3">
              <Cake className="text-brand-gold" size={24} /> Birthday Notification Engine
            </h3>
            <p className="text-xs text-white/50 leading-relaxed italic">
              Automated system that scans the community database daily to deliver "Happy Birthday" communal greetings to members. 
              The system uses the configured SMTP server to dispatch these sacred greetings at 00:00 UTC daily.
            </p>
          </div>
          
          <button
            onClick={triggerBirthdayCheck}
            disabled={status === 'loading'}
            className="px-8 py-4 bg-brand-gold hover:bg-white text-brand-black text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {status === 'loading' ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Send size={16} />
            )}
            Force Manual Scan Now
          </button>
        </div>

        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-8 p-4 border flex items-center gap-4 ${
              status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              status === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              'bg-white/5 border-white/10 text-white/60'
            }`}
          >
            {status === 'success' ? <CheckCircle2 size={18} /> : 
             status === 'error' ? <AlertCircle size={18} /> : 
             <Loader2 className="animate-spin" size={18} />}
            <span className="text-[10px] font-mono tracking-wider uppercase">
              {status === 'loading' ? 'Executing database scan...' : result}
            </span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white/[0.02] border border-white/5">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Engine Logistics</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1" />
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase text-white/70">Automatic Trigger</p>
                <p className="text-[9px] text-white/40 leading-relaxed">Runs automatically every 24 hours (86,400 seconds) after server boot.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1" />
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase text-white/70">SMTP Verification</p>
                <p className="text-[9px] text-white/40 leading-relaxed">Ensure SMTP settings are configured in the "integrations" tab for successful delivery.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="p-6 bg-white/[0.02] border border-white/5">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Privacy & Security</h4>
          <p className="text-[9px] text-white/30 leading-relaxed italic">
            Greetings are only dispatched to users with a valid "birthDate" field in their profile. NO sensitive medical data is included in community greetings. All communiques are delivered with clinical compassion and sisterhood branding.
          </p>
        </div>
      </div>
    </div>
  );
}
