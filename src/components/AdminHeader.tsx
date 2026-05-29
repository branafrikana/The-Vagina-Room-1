import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function AdminHeader() {
  return (
    <header className="bg-brand-black border-b border-white/10 py-5 px-6 md:px-12 relative z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center">
            <Shield className="text-brand-gold" size={16} />
          </div>
          <div>
            <span className="font-sans text-sm font-black uppercase tracking-[0.2em] text-white">
              The Vagina Room
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-brand-gold block -mt-1 font-bold">
              ADMIN CONTROL CENTER
            </span>
          </div>
        </div>
        
        <Link 
          to="/" 
          className="text-xs uppercase font-black tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Back to Live Website
        </Link>
      </div>
    </header>
  );
}
