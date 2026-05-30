import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface BreadcrumbsProps {
  items: {
    label: string;
    path?: string;
  }[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-[10px] md:text-[11px] font-medium uppercase tracking-[0.2em] text-white/40 mb-8 overflow-x-auto no-scrollbar whitespace-nowrap py-2" aria-label="Breadcrumb">
      <Link 
        to="/" 
        className="flex items-center gap-1.5 hover:text-brand-gold transition-colors duration-300 group"
      >
        <Home size={12} className="group-hover:scale-110 transition-transform" />
        <span>Home</span>
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={10} className="text-white/10 shrink-0" />
          {item.path ? (
            <Link 
              to={item.path} 
              className="hover:text-brand-gold transition-colors duration-300"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-brand-gold/60 font-black">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
