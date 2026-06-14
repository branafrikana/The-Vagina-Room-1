import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Share2, 
  Link as LinkIcon, 
  Users, 
  Wallet, 
  TrendingUp, 
  Megaphone, 
  Award,
  Download,
  Copy,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BarChart3,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ReferAndEarn() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'links' | 'earnings' | 'resources' | 'leaderboard'>('dashboard');
  const [toastMessage, setToastMessage] = useState('');
  
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const referralLink = "vroom.com/join?ref=MEM-9842";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    triggerToast("Referral link copied to clipboard");
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
            <HeartHandshake size={18} />
            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-widest font-mono">Affiliate System</h4>
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
                Ambassador Growth Hub
             </span>
             <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest font-bold flex items-center gap-1">Level: Growth Partner <Award size={10} /></span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase text-white tracking-tight flex items-center gap-3">
            🤝 Refer & Earn
          </h2>
          <p className="text-xs text-white/50 max-w-2xl font-light font-sans leading-relaxed">
            Turn your healing journey into shared impact. Become an active partner in expanding the community while earning rewards for bringing value and wellness visibility to others.
          </p>
        </div>
        
        <div className="flex gap-4 shrink-0 w-full lg:w-auto">
           <div className="bg-white/5 border border-white/10 p-5 flex-1 lg:flex-none flex items-center justify-between lg:justify-center gap-4 min-w-[150px]">
              <div>
                 <div className="text-[9px] font-mono uppercase tracking-widest text-[#D4AF37] mb-1">Total Earned</div>
                 <div className="text-2xl font-bold font-serif text-white">₦145,000</div>
              </div>
              <Wallet size={24} className="text-[#D4AF37] opacity-20" />
           </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar font-mono text-[10px] uppercase tracking-widest bg-white/[0.02] p-1">
        {[
          { id: 'dashboard', label: 'Overview' },
          { id: 'links', label: 'Links & Setup' },
          { id: 'earnings', label: 'Commissions' },
          { id: 'resources', label: 'Marketing Hub' }
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
         
         {/* OVERVIEW */}
         {activeTab === 'dashboard' && (
            <div className="space-y-6">
               <div className="grid md:grid-cols-4 gap-4">
                  {[
                     { title: 'Clicks', value: '1,204', icon: LinkIcon, trend: '+12% this week' },
                     { title: 'Sign-Ups', value: '48', icon: Users, trend: '+4 this week' },
                     { title: 'Conversions', value: '8.5%', icon: TrendingUp, trend: 'Top 10% ambassador' },
                     { title: 'Pending Payout', value: '₦32,500', icon: CreditCard, trend: 'Available next cycle' }
                  ].map((stat, i) => (
                     <div key={i} className="bg-[#110f0f] border border-white/5 p-5 group hover:border-[#D4AF37]/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                           <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{stat.title}</div>
                           <stat.icon size={16} className="text-[#D4AF37] opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xl font-serif font-black text-white">{stat.value}</div>
                        <div className="text-[9px] font-mono text-emerald-400/70 mt-3">{stat.trend}</div>
                     </div>
                  ))}
               </div>
               
               <div className="grid md:grid-cols-3 gap-6 mt-8">
                 {/* Quick Link Card */}
                 <div className="md:col-span-2 bg-[#110f0f] border border-white/5 p-6 md:p-8">
                    <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2"><Share2 size={16} className="text-[#D4AF37]"/> Share Your Link</h3>
                    <p className="text-sm text-white/60 mb-6 max-w-lg">Share this unique trackable link directly with your network, support groups, or add it to your social media bio.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                       <div className="bg-black border border-white/10 px-4 py-3 flex-1 font-mono text-xs text-[#D4AF37] flex items-center overflow-x-auto whitespace-nowrap">
                          {referralLink}
                       </div>
                       <button onClick={copyToClipboard} className="shrink-0 bg-white text-black px-6 py-3 font-mono text-[10px] font-black uppercase tracking-widest hover:bg-[#D4AF37] transition-colors flex items-center justify-center gap-2">
                          <Copy size={14} /> Copy Link
                       </button>
                    </div>
                 </div>
                 
                 {/* Level Progress */}
                 <div className="bg-gradient-to-b from-[#110f0f] to-zinc-950 border border-white/5 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
                    <h3 className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest font-bold mb-4">Current Status</h3>
                    <div className="text-xl font-serif font-black text-white uppercase mb-1 flex items-center gap-2"> Growth Partner <Award size={18} className="text-[#D4AF37]"/></div>
                    <p className="text-xs text-white/50 mb-6">Unlock "Elite Ambassador" at 100 successful referrals.</p>
                    
                    <div className="space-y-2 relative z-10">
                       <div className="flex justify-between text-[10px] font-mono text-white/70">
                          <span>48 Referrals</span>
                          <span>100 Goal</span>
                       </div>
                       <div className="w-full bg-black border border-white/10 h-2">
                          <div className="bg-[#D4AF37] h-full" style={{ width: '48%' }} />
                       </div>
                    </div>
                 </div>
               </div>
            </div>
         )}
         
         {/* CAMPAIGN LINKS */}
         {activeTab === 'links' && (
            <div className="space-y-6">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase">Campaign Setup & Tracking Links</h3>
                    <p className="text-xs text-white/50 mt-1 max-w-xl">Generate targeted QR codes and specific landing page links for your promotions.</p>
                  </div>
                  <button onClick={() => triggerToast("New campaign generator loaded.")} className="px-4 py-2 bg-[#D4AF37] text-black font-mono text-[9px] font-black uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2">
                     + New Link
                  </button>
               </div>
               
               <div className="bg-[#110f0f] border border-white/5">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm font-sans whitespace-nowrap">
                        <thead>
                           <tr className="border-b border-white/10 text-[9px] font-mono text-white/40 uppercase tracking-widest">
                              <th className="p-4 font-normal">Campaign Name</th>
                              <th className="p-4 font-normal">Created Copied</th>
                              <th className="p-4 font-normal">Visits</th>
                              <th className="p-4 font-normal">Sign-ups</th>
                              <th className="p-4 font-normal text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           <tr className="border-b border-white/5 group hover:bg-white/[0.02]">
                              <td className="p-4">
                                 <p className="font-bold text-white">Main Profile Link</p>
                                 <p className="text-[10px] text-white/40 font-mono mt-0.5">/join?ref=MEM-9842</p>
                              </td>
                              <td className="p-4 text-white/60">May 01, 2026</td>
                              <td className="p-4 text-white/80">950</td>
                              <td className="p-4 font-bold text-[#D4AF37]">42</td>
                              <td className="p-4 text-right">
                                 <button onClick={copyToClipboard} className="text-[10px] font-mono text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 hover:bg-[#D4AF37] hover:text-black transition-colors uppercase tracking-widest inline-flex items-center gap-2">
                                    <Copy size={12}/> Copy
                                 </button>
                              </td>
                           </tr>
                           <tr className="border-b border-white/5 group hover:bg-white/[0.02]">
                              <td className="p-4">
                                 <p className="font-bold text-white">Fertility Bundle Campaign</p>
                                 <p className="text-[10px] text-white/40 font-mono mt-0.5">/shop/bundle?ref=MEM-9842</p>
                              </td>
                              <td className="p-4 text-white/60">June 08, 2026</td>
                              <td className="p-4 text-white/80">254</td>
                              <td className="p-4 font-bold text-[#D4AF37]">6</td>
                              <td className="p-4 text-right">
                                 <button onClick={copyToClipboard} className="text-[10px] font-mono text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 hover:bg-[#D4AF37] hover:text-black transition-colors uppercase tracking-widest inline-flex items-center gap-2">
                                    <Copy size={12}/> Copy
                                 </button>
                              </td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         )}
         
         {/* EARNINGS */}
         {activeTab === 'earnings' && (
            <div className="space-y-6">
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 
                 {/* Available Balance */}
                 <div className="lg:col-span-1 bg-[#D4AF37] text-black p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                       <Wallet size={120} />
                    </div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest opacity-80 mb-6">Available For Withdrawal</h3>
                    <div className="text-4xl font-serif font-black mb-2 relative z-10">₦32,500</div>
                    <p className="text-xs font-medium font-sans mb-8">Cleared commissions ready for payout.</p>
                    
                    <button onClick={() => triggerToast("Payout request submitted successfully.")} className="w-full py-3 bg-black text-white font-mono text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-black hover:border-black border border-transparent transition-colors relative z-10">
                       Request Payout
                    </button>
                 </div>
                 
                 {/* Transaction Log */}
                 <div className="lg:col-span-2 bg-[#110f0f] border border-white/5 p-6">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="text-sm font-bold text-white uppercase">Commission History</h3>
                       <button className="text-[10px] font-mono text-white/40 hover:text-white uppercase">View All</button>
                    </div>
                    
                    <div className="space-y-4">
                       {[
                          { reason: 'Membership Subscription (New)', user: 'A*** O.', amount: '₦5,000', date: 'June 10', status: 'Cleared' },
                          { reason: 'Shop: Somatic Wellness Kit', user: 'F*** M.', amount: '₦7,500', date: 'June 08', status: 'Pending' },
                          { reason: 'Course: Preconception Setup', user: 'C*** E.', amount: '₦12,000', date: 'June 05', status: 'Cleared' }
                       ].map((tx, i) => (
                          <div key={i} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0 last:pb-0">
                             <div>
                                <p className="text-sm font-bold text-white">{tx.reason}</p>
                                <p className="text-[10px] font-mono text-white/40 mt-1">{tx.user} • {tx.date}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-sm font-bold text-[#D4AF37]">{tx.amount}</p>
                                <p className={`text-[8px] font-mono uppercase tracking-widest mt-1 ${tx.status === 'Cleared' ? 'text-emerald-400' : 'text-amber-400'}`}>{tx.status}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
               </div>
            </div>
         )}
         
         {/* MARKETING RESOURCES */}
         {activeTab === 'resources' && (
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <Megaphone size={24} className="text-[#D4AF37]" />
                  <div>
                    <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase">Marketing Command Center</h3>
                    <p className="text-xs text-white/50 max-w-xl">Curated and ready-to-use digital assets, copy templates, and campaign kits to supercharge your reach.</p>
                  </div>
               </div>
               
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {[
                     { category: 'Ready-Made Content', title: 'Complete Instagram Starter Kit', desc: 'Pre-written captions and brand imagery designed for Grid & Reels.', type: 'ZIP Folder' },
                     { category: 'WhatsApp Prompts', title: 'Broadcast Message Scripts', desc: 'High-converting text templates emphasizing community support.', type: 'PDF Document' },
                     { category: 'Brand Assets', title: 'Official Logos & Brand Guide', desc: 'Vector logos, color codes, and authorized photography.', type: 'Drive Link' },
                     { category: 'Sales Guides', title: 'Objection Handling Playbook', desc: 'How to easily explain The Vagina Room’s subscription model securely.', type: 'Digital Guide' }
                  ].map((resource, i) => (
                     <div key={i} className="bg-zinc-950 border border-white/5 p-6 flex flex-col group hover:border-[#D4AF37]/30 transition-colors">
                        <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-widest mb-3 block">{resource.category}</span>
                        <h4 className="text-sm font-bold text-white uppercase mb-2 group-hover:text-[#D4AF37] transition-colors">{resource.title}</h4>
                        <p className="text-xs text-white/50 mb-6 flex-1">{resource.desc}</p>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-white/10">
                           <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest bg-white/5 px-2 py-0.5">{resource.type}</span>
                           <button onClick={() => triggerToast(`Downloading ${resource.title}...`)} className="text-[#D4AF37] hover:text-white transition-colors">
                              <Download size={16} />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
