import React from 'react';

export default function AdminFooter() {
  return (
    <footer className="bg-zinc-950 border-t border-white/5 py-8 px-6 md:px-12 mt-auto z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-white/30 uppercase tracking-widest text-center md:text-left">
        <div>
          © {new Date().getFullYear()} THE VAGINA ROOM. ALL CHANNELS SECURED.
        </div>
        <div className="flex gap-6">
          <span>CONSOLE PORTAL V1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
