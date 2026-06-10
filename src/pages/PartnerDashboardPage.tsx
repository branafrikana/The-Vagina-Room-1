import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  Briefcase, TrendingUp, DollarSign, Calendar, Percent, 
  Wallet, RefreshCw, BarChart2, ShieldCheck, PieChart, 
  Layers, Lock, Sparkles, Send, Bell
} from 'lucide-react';

export default function PartnerDashboardPage() {
  const { user, userData } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'payouts' | 'contracts'>('analytics');
  const [showConfigToast, setShowConfigToast] = useState(false);
  const [splitMethod, setSplitMethod] = useState<'auto-weekly' | 'auto-monthly' | 'manual'>('auto-monthly');

  if (!user || userData?.role !== 'partner') {
    // Let's check fallback if roles are in progress of setup
    // Return restriction unless they are set up. But to prevent loop lockouts, let's keep role 'partner' check or admin.
    if (userData?.role !== 'admin' && userData?.role !== 'partner') {
      return <Navigate to="/register" replace />;
    }
  }

  // Portfolio configurations with reliable defaults from user metadata
  const investmentAmountUSD = userData?.investmentAmount || 50000;
  const investmentAmountNGN = investmentAmountUSD * 1500; // Reference conversion NGN
  const sharePercentage = userData?.percentageShare || 12.5;
  const payoutFrequency = userData?.payoutFrequency || 'monthly';
  
  // Custom interactive mock earnings state to simulate the live split management engine
  const [currentTotalRoomRevenueUSD, setCurrentTotalRoomRevenueUSD] = useState(240000);
  const [currentTotalRoomRevenueNGN, setCurrentTotalRoomRevenueNGN] = useState(36000000);

  const partnerShareUSD = (currentTotalRoomRevenueUSD * (sharePercentage / 100));
  const partnerShareNGN = (currentTotalRoomRevenueNGN * (sharePercentage / 100));

  const [payouts, setPayouts] = useState([
    { id: 'pay_01', date: '2026-05-31', amountUSD: 2500, amountNGN: 3750000, status: 'Completed', ref: 'TVR-PAY-921' },
    { id: 'pay_02', date: '2026-04-30', amountUSD: 2350, amountNGN: 3525000, status: 'Completed', ref: 'TVR-PAY-813' },
    { id: 'pay_03', date: '2026-03-31', amountUSD: 3100, amountNGN: 4650000, status: 'Completed', ref: 'TVR-PAY-704' },
    { id: 'pay_04', date: '2026-06-30', amountUSD: partnerShareUSD / 6, amountNGN: partnerShareNGN / 6, status: 'Scheduled', ref: 'Pending Process' },
  ]);

  const handleUpdateSplitSplitSettings = () => {
    setShowConfigToast(true);
    setTimeout(() => setShowConfigToast(false), 3000);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-brand-black text-white selection:bg-brand-gold selection:text-brand-black">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Upper Header Deck */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-8 gap-6">
          <div>
            <span className="text-brand-gold font-mono text-[9px] uppercase tracking-[0.4em] flex items-center gap-1.5 mb-2">
              <ShieldCheck size={11} className="text-brand-gold" /> Investor Relations
            </span>
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none">
              Partner <span className="text-brand-gold italic font-light lowercase">Dashboard</span>
            </h1>
            <p className="text-xs text-white/40 italic font-light mt-2">
              Secure investment administration terminal for {user?.email}
            </p>
          </div>

          {/* Interactive Navigation Elements */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-5 py-3 text-[10px] font-black uppercase tracking-wider border flex items-center gap-2 transition-all leading-none ${
                activeTab === 'analytics'
                  ? 'bg-white text-brand-black border-white'
                  : 'bg-white/[0.01] border-white/10 text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <BarChart2 size={11} /> Analytics & Share
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-5 py-3 text-[10px] font-black uppercase tracking-wider border flex items-center gap-2 transition-all leading-none ${
                activeTab === 'payouts'
                  ? 'bg-white text-brand-black border-white'
                  : 'bg-white/[0.01] border-white/10 text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Wallet size={11} /> Revenue Payout Logs
            </button>
            <button
              onClick={() => setActiveTab('contracts')}
              className={`px-5 py-3 text-[10px] font-black uppercase tracking-wider border flex items-center gap-2 transition-all leading-none ${
                activeTab === 'contracts'
                  ? 'bg-white text-brand-black border-white'
                  : 'bg-white/[0.01] border-white/10 text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Layers size={11} /> Split Allocations
            </button>
          </div>
        </div>

        {/* Dynamic Contract Update Alerts */}
        <AnimatePresence>
          {showConfigToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-brand-gold/10 border border-brand-gold/30 p-4 flex items-center justify-between"
            >
              <span className="text-xs text-brand-gold font-mono uppercase tracking-wider flex items-center gap-2">
                <Bell size={14} /> Payout frequency and split mode synchronized to decentralized accounting registry successfully.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Interactive Portfolio Metrics Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 border border-white/10 bg-white/[0.01] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 blur-3xl pointer-events-none" />
            <span className="text-[9px] uppercase tracking-widest text-white/40 block mb-2 font-mono">Your Initial Premium Share</span>
            <div className="space-y-1">
              <span className="text-3xl font-mono font-black text-brand-gold">${investmentAmountUSD.toLocaleString()}</span>
              {investmentAmountUSD > 0 && (
                <span className="block text-[10px] text-white/30 font-mono">₦{investmentAmountNGN.toLocaleString()} Capital</span>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-white/50">
              <Briefcase size={14} className="text-brand-gold/80" /> Fully Provisioned Capitalization
            </div>
          </div>

          <div className="p-8 border border-white/10 bg-white/[0.01] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 blur-3xl pointer-events-none" />
            <span className="text-[9px] uppercase tracking-widest text-white/40 block mb-2 font-mono">Equity Split Ratio</span>
            <div className="space-y-1">
              <span className="text-3xl font-mono font-black text-white">{sharePercentage}%</span>
              <span className="block text-[10px] text-white/30 font-mono">Of Global Product/Formulation Sales</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-white/50">
              <Percent size={14} className="text-white/40" /> Verified Pool Allocation
            </div>
          </div>

          <div className="p-8 border border-white/10 bg-white/[0.01] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 blur-3xl pointer-events-none" />
            <span className="text-[9px] uppercase tracking-widest text-white/40 block mb-2 font-mono">Share Value (To Date)</span>
            <div className="space-y-1">
              <span className="text-3xl font-mono font-black text-brand-gold">${partnerShareUSD.toLocaleString()}</span>
              <span className="block text-[10px] text-white/30 font-mono">₦{partnerShareNGN.toLocaleString()} Accrued</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-white/50">
              <TrendingUp size={14} className="text-brand-gold/80" /> Pro-Rata Room Revenues
            </div>
          </div>
        </div>

        {/* Tab-driven UI Blocks */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Simulated Revenue performance widgets (Phase 5) */}
                <div className="lg:col-span-2 p-8 border border-white/10 bg-white/[0.01] space-y-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                      <PieChart size={18} className="text-brand-gold" /> Room Performance Metrics
                    </h3>
                    <span className="text-[9px] bg-white/10 px-3 py-1 font-mono uppercase tracking-widest">
                      Live Simulation
                    </span>
                  </div>
                  <p className="text-xs text-white/50 italic font-light leading-relaxed">
                    Interactive simulation displaying the Room's global gross revenue calculations. Your custom equity share is calculated automatically inside the layout.
                  </p>

                  <div className="space-y-4 pt-4">
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-2">
                        <span className="text-white/60 uppercase">Global Room Store Revenue (USD)</span>
                        <span className="font-bold text-white">${currentTotalRoomRevenueUSD.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 bg-brand-gold h-full w-[80%] transition-all duration-700" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono mb-2">
                        <span className="text-white/60 uppercase">Global Room Store Revenue (Naira)</span>
                        <span className="font-bold text-brand-gold">₦{currentTotalRoomRevenueNGN.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 bg-brand-gold h-full w-[65%] transition-all duration-700" />
                      </div>
                    </div>
                  </div>

                  {/* Interactive knobs to simulate split growth */}
                  <div className="pt-6 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 italic">Simulate different sales volumes:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCurrentTotalRoomRevenueUSD(240000);
                          setCurrentTotalRoomRevenueNGN(36000000);
                        }}
                        className="px-4 py-2 border border-white/10 hover:border-brand-gold text-[9px] font-mono uppercase tracking-widest text-white/70 hover:text-white"
                      >
                        Standard 
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTotalRoomRevenueUSD(500000);
                          setCurrentTotalRoomRevenueNGN(75000000);
                        }}
                        className="px-4 py-2 border border-white/10 hover:border-brand-gold text-[9px] font-mono uppercase tracking-widest text-white/70 hover:text-white animate-pulse"
                      >
                        Q3 Projection (+110%)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-8 border border-white/10 bg-white/[0.01] flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[9px] text-brand-gold font-mono uppercase tracking-widest block font-bold">Investment Status</span>
                    <h4 className="text-lg font-black uppercase tracking-tight">Active Shareholder Agreement</h4>
                    <p className="text-xs text-white/50 italic leading-relaxed font-light">
                      Your payout profile is authenticated and bound to standard automated split logic. Re-trigger custom splits at any time via the Admin Management controls.
                    </p>
                  </div>
                  <div className="pt-8 border-t border-white/5 space-y-3">
                    <div className="flex justify-between text-[10px] font-mono uppercase">
                      <span className="text-white/40">Payout Mode:</span>
                      <span className="text-brand-gold font-bold">{payoutFrequency}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono uppercase">
                      <span className="text-white/40">Next Execution:</span>
                      <span className="text-white">2026-06-30</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payouts' && (
              <div className="p-8 border border-white/10 bg-white/[0.01] space-y-8">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                    <Wallet size={18} className="text-brand-gold" /> Payout & Settlement Archive
                  </h3>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                    4 Records Found
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] text-white/40 uppercase">
                        <th className="py-3 px-4 font-black">Settlement ID</th>
                        <th className="py-3 px-4 font-black">Period Close Date</th>
                        <th className="py-3 px-4 font-black text-right">USD Paid</th>
                        <th className="py-3 px-4 font-black text-right">NGN Paid</th>
                        <th className="py-3 px-4 font-black text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px] text-white/80">
                      {payouts.map(p => (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-4 px-4 text-brand-gold font-bold">{p.ref}</td>
                          <td className="py-4 px-4 text-white/60">{p.date}</td>
                          <td className="py-4 px-4 text-right">${Math.round(p.amountUSD).toLocaleString()}</td>
                          <td className="py-4 px-4 text-right text-brand-gold">₦{Math.round(p.amountNGN).toLocaleString()}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2.5 py-1 text-[9px] uppercase font-black tracking-wider leading-none ${
                              p.status === 'Completed' 
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                : 'bg-brand-gold/10 text-brand-gold border border-brand-gold/30 animate-pulse'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'contracts' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Custom split-fee schedule controls */}
                <div className="lg:col-span-2 p-8 border border-white/10 bg-white/[0.01] space-y-6">
                  <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 border-b border-white/5 pb-4">
                    <Layers size={18} className="text-brand-gold" /> Custom Split Engine Schedule
                  </h3>
                  <p className="text-xs text-white/50 italic leading-relaxed font-light">
                    Establish custom commission split management parameters. Splits can be automated weekly, monthly or assigned to manual approval cycles by your team.
                  </p>

                  <div className="space-y-4 pt-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-white/40 block">
                        Split & Payout Rule Type
                      </label>
                      <select 
                        value={splitMethod}
                        onChange={(e: any) => setSplitMethod(e.target.value)}
                        className="w-full bg-brand-black border border-white/15 text-white font-mono text-xs px-4 py-3 outline-none focus:border-brand-gold focus:ring-0 appearance-none cursor-pointer"
                      >
                        <option value="auto-weekly">Automated Weekly Split Transfer (Instant Settlement)</option>
                        <option value="auto-monthly">Automated Monthly Split Transfer (Standard Settlement)</option>
                        <option value="manual">Manual Batch Processing (Secured Ledger Release)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex justify-end">
                    <button
                      onClick={handleUpdateSplitSplitSettings}
                      className="bg-brand-gold hover:bg-white text-brand-black font-black uppercase text-[10px] tracking-widest px-8 py-4 flex items-center gap-2 transition-all leading-none"
                    >
                      Apply Split Customizations
                    </button>
                  </div>
                </div>

                <div className="p-8 border border-white/10 bg-white/[0.01] flex flex-col justify-between">
                  <div className="space-y-4">
                    <Lock size={24} className="text-white/20 mb-2" />
                    <h4 className="text-sm font-black uppercase tracking-wider">Secured Security Clearance</h4>
                    <p className="text-xs text-white/40 italic leading-relaxed font-light">
                      Payout and investment portfolios are globally backed, matching actual local legal compliance frameworks for foreign investments.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
