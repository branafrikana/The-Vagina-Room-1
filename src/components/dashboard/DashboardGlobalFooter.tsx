import React from 'react';
import { Mail, MessageCircle, HelpCircle, FileText, Lock, CircleDot } from 'lucide-react';

export default function DashboardGlobalFooter({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  return (
    <footer className="mt-16 border-t border-white/5 pt-12 pb-8 bg-zinc-950/20 backdrop-blur-sm -mx-6 sm:-mx-10 px-6 sm:px-10 rounded-b-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-12">
        
        {/* Brand Block */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🌸</span>
            <span className="text-sm font-black uppercase text-brand-gold tracking-[0.2em]">The Vagina Room</span>
          </div>
          <p className="text-xs text-white/50 font-medium uppercase tracking-widest leading-relaxed">
            Private Wellness Community
          </p>
          <p className="text-sm text-white/40 font-light max-w-xs mt-4">
            Empowering women through education, wellness, support, and guided transformation.
          </p>
          <div className="pt-4 border-t border-white/5 mt-6 inline-block">
             <p className="text-[10px] text-white/40 font-mono italic">
               "Small consistent habits create meaningful progress."
             </p>
          </div>
        </div>

        {/* Explore Links */}
        <div className="space-y-4">
          <h4 className="text-[9px] font-mono text-white/50 uppercase tracking-[0.2em] mb-4">Explore</h4>
          <ul className="space-y-3">
            <li><button onClick={() => setActiveTab('dashboard')} className="text-xs text-white/70 hover:text-white transition-colors">Dashboard</button></li>
            <li><button onClick={() => setActiveTab('journey')} className="text-xs text-white/70 hover:text-white transition-colors">Wellness Journey</button></li>
            <li><button onClick={() => setActiveTab('programs')} className="text-xs text-white/70 hover:text-white transition-colors">Learning Center</button></li>
            <li><button onClick={() => setActiveTab('resources')} className="text-xs text-white/70 hover:text-white transition-colors">Resource Library</button></li>
            <li><button onClick={() => setActiveTab('events')} className="text-xs text-white/70 hover:text-white transition-colors">Events Center</button></li>
            <li><button onClick={() => setActiveTab('community')} className="text-xs text-white/70 hover:text-white transition-colors">Community</button></li>
          </ul>
        </div>

        {/* Member Services */}
        <div className="space-y-4">
          <h4 className="text-[9px] font-mono text-white/50 uppercase tracking-[0.2em] mb-4">Services</h4>
          <ul className="space-y-3">
            <li><button onClick={() => setActiveTab('consultation')} className="text-xs text-white/70 hover:text-white transition-colors">Consultations</button></li>
            <li><button onClick={() => setActiveTab('id_card')} className="text-xs text-white/70 hover:text-white transition-colors">Membership Card</button></li>
            <li><button onClick={() => setActiveTab('rewards')} className="text-xs text-white/70 hover:text-white transition-colors">Rewards</button></li>
            <li><button onClick={() => setActiveTab('referral')} className="text-xs text-white/70 hover:text-white transition-colors">Refer & Earn</button></li>
            <li><button onClick={() => setActiveTab('wellness_tools')} className="text-xs text-white/70 hover:text-white transition-colors">Wellness Tools</button></li>
            <li><button onClick={() => setActiveTab('support')} className="text-xs text-white/70 hover:text-white transition-colors">Support</button></li>
          </ul>
        </div>

        {/* Account & Settings */}
        <div className="space-y-4">
          <h4 className="text-[9px] font-mono text-white/50 uppercase tracking-[0.2em] mb-4">Account</h4>
          <ul className="space-y-3">
            <li><button onClick={() => setActiveTab('profile')} className="text-xs text-white/70 hover:text-white transition-colors">My Profile</button></li>
            <li><button onClick={() => setActiveTab('settings')} className="text-xs text-white/70 hover:text-white transition-colors">Settings</button></li>
            <li><button onClick={() => setActiveTab('inbox')} className="text-xs text-white/70 hover:text-white transition-colors">Notifications</button></li>
            <li><button onClick={() => setActiveTab('settings')} className="text-xs text-white/70 hover:text-white transition-colors">Privacy Settings</button></li>
            <li><button onClick={() => setActiveTab('settings')} className="text-xs text-white/70 hover:text-white transition-colors">Security</button></li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/[0.02] border border-white/5 p-6 rounded-2xl mb-12 items-center">
         <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase text-brand-gold tracking-widest flex items-center gap-2">
               <HelpCircle size={14} /> Need Help?
            </h4>
            <div className="text-xs text-white/60">
               Support Hours: <strong className="text-white">Mon–Fri</strong> | <strong className="text-white">9:00 AM–6:00 PM</strong>
            </div>
         </div>
         <div className="flex flex-wrap gap-3 md:justify-end">
            <button className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white text-[10px] uppercase font-bold tracking-widest rounded-lg flex items-center gap-2 transition-colors">
               <Mail size={14} /> Contact Support
            </button>
            <button className="px-4 py-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[10px] uppercase font-bold tracking-widest rounded-lg flex items-center gap-2 transition-colors">
               <MessageCircle size={14} /> WhatsApp Support
            </button>
         </div>
      </div>

      {/* Sub Footer */}
      <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="text-[10px] text-white/40 uppercase tracking-widest font-mono text-center md:text-left">
            © {new Date().getFullYear()} The Vagina Room<br/>
            All Rights Reserved
         </div>
         
         <div className="flex items-center gap-4 text-[10px] text-white/50 uppercase tracking-widest font-mono">
           <div className="flex items-center gap-1.5"><CircleDot size={10} className="text-emerald-400" /> Platform Operational</div>
           <div className="hidden sm:block text-white/20">|</div>
           <div className="flex items-center gap-1.5 hidden sm:flex"><Lock size={10} className="text-white/40" /> Secure Session</div>
         </div>

         <div className="flex items-center gap-4 text-[10px] text-white/40 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors mb-0 hidden sm:block">Guidelines</a>
         </div>
      </div>
      
    </footer>
  );
}
