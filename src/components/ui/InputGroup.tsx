import React from 'react';

interface InputGroupProps {
  label: string;
  children: React.ReactNode;
}

export function InputGroup({ label, children }: InputGroupProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black uppercase tracking-wider text-white/40 block">
        {label}
      </label>
      {children}
    </div>
  );
}
