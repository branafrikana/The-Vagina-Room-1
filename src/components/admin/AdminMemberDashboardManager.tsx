import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2, Save, LayoutDashboard, ToggleLeft, AlertCircle, Video, ListOrdered } from 'lucide-react';
import AdminLiveClassSettings from './AdminLiveClassSettings';

export default function AdminMemberDashboardManager({ content, saveContent, onStatus }: { content: any, saveContent: (updates: any) => Promise<any>, onStatus?: (status: string, msg?: string) => void }) {
  const [activeTab, setActiveTab] = useState<'modules' | 'live_class'>('modules');
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (content?.memberDashboardFeaturesJson) {
        setFeatures(JSON.parse(content.memberDashboardFeaturesJson));
      }
    } catch (e) {
      console.error(e);
    }
  }, [content]);

  const toggleFeature = (id: string) => {
    setFeatures(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    if (onStatus) onStatus('saving', 'Updating Member Hub configuration...');
    
    try {
      const res = await saveContent({
        memberDashboardFeaturesJson: JSON.stringify(features)
      });
      if (res && res.success === false) {
        throw new Error(res.message);
      }
      if (onStatus) onStatus('success', 'Member Hub configuration synced to network.');
    } catch (e: any) {
      if (onStatus) onStatus('error', e.message || 'Verification failure during sync');
    } finally {
      setLoading(false);
    }
  };

  const dashboardModules = [
    { id: 'dashboard', label: 'Dashboard Home (Always On)', locked: true },
    { id: 'ai_assistant', label: 'Ask Dr. FID AI' },
    { id: 'id_card', label: 'Member Identity' },
    { id: 'journey', label: 'My Journey' },
    { id: 'womens_wellness', label: 'Women\'s Wellness' },
    { id: 'fertility', label: 'Fertility Center' },
    { id: 'analytics', label: 'Personal Insights (Analytics)' },
    { id: 'wellness_tools', label: 'Digital Wellness Tools' },
    { id: 'consultation', label: 'Expert Booking' },
    { id: 'programs', label: 'Learning Center (Academy)' },
    { id: 'resources', label: 'Resource Library' },
    { id: 'bookmarks', label: 'Saved Collections' },
    { id: 'events', label: 'Events Center' },
    { id: 'community', label: 'Community/Sisterhood' },
    { id: 'inbox', label: 'Private Inbox' },
    { id: 'shop', label: 'Member Shop' },
    { id: 'referral', label: 'Refer & Earn' },
    { id: 'rewards', label: 'Rewards & Progress' },
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="bg-[#111] p-6 border border-white/10 sm:p-8">
        <h2 className="text-2xl font-black uppercase text-brand-gold font-serif mb-6 flex items-center gap-2">
          <LayoutDashboard size={24} /> Central Members Dashboard Manager
        </h2>
        
        <div className="flex border-b border-white/10 mb-8 overflow-x-auto scroolbar-hide">
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'modules' ? 'border-b-2 border-brand-gold text-brand-gold' : 'text-white/50 hover:text-white'
            }`}
          >
            <ToggleLeft size={16} /> Module Toggles
          </button>
          <button
            onClick={() => setActiveTab('live_class')}
            className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'live_class' ? 'border-b-2 border-brand-gold text-brand-gold' : 'text-white/50 hover:text-white'
            }`}
          >
            <Video size={16} /> Live Class
          </button>
        </div>

        {activeTab === 'modules' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <p className="text-sm text-white/50 mb-6 font-light max-w-3xl">
              Toggle features on or off for the member dashboard. Changes reflect globally for all users instantly.
            </p>

            <div className="bg-black/50 p-4 border border-white/5 text-sm text-white/70 flex gap-3 mb-8">
               <AlertCircle size={18} className="text-[#D4AF37] shrink-0" />
               <p>Turning off a feature will hide it from the member sidebar navigation. Statistics and Analytics from these modules will still remain in the database securely.</p>
            </div>

            <div className="bg-[#050505] border border-white/5 p-6 space-y-6">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4 border-b border-white/10 pb-2">
                 Module Visibility Toggles
               </h3>
               
               <div className="grid sm:grid-cols-2 gap-4">
                  {dashboardModules.map(module => {
                     const isOn = features[module.id] !== false; // defaults to true
                     return (
                        <div key={module.id} className="flex items-center justify-between p-4 border border-white/5 bg-white/[0.02]">
                           <div className="font-mono text-xs uppercase tracking-widest text-white/80">
                              {module.label}
                           </div>
                           
                           {module.locked ? (
                              <div className="text-[9px] uppercase tracking-widest text-white/30 bg-white/5 px-2 py-1 rounded">Locked</div>
                           ) : (
                              <button 
                                 onClick={() => toggleFeature(module.id)}
                                 className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${isOn ? 'bg-brand-gold' : 'bg-white/10'}`}
                              >
                                 <div className={`w-4 h-4 bg-black rounded-full absolute top-1 transition-all ${isOn ? 'left-7' : 'left-1'}`} />
                              </button>
                           )}
                        </div>
                     );
                  })}
               </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-brand-gold text-brand-black px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Synchronize Module Configuration
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'live_class' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AdminLiveClassSettings />
          </motion.div>
        )}
      </div>
    </div>
  );
}
