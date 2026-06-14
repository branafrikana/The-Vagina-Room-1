import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

const createIcon = (html: string, viewBox = "0 0 24 24") => {
  const Component = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, color = "currentColor", strokeWidth = 2, className = "", ...props }, ref) => (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={viewBox}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
        {...props}
      />
    )
  );
  Component.displayName = 'Icon';
  return Component;
};

// Compact unique path dictionary
const d: Record<string, string> = {
  ChevronDown: '<path d="m6 9 6 6 6-6" />',
  ChevronUp: '<path d="m18 15-6-6-6 6" />',
  ChevronRight: '<path d="m9 18 6-6-6-6" />',
  ChevronLeft: '<path d="m15 18-6-6 6-6" />',
  Plus: '<path d="M5 12h14M12 5v14" />',
  Minus: '<path d="M5 12h14" />',
  Trash2: '<path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" />',
  Info: '<circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />',
  CheckCircle: '<circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />',
  CheckCircle2: '<circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />',
  Check: '<path d="m5 12 4 4 10-10" />',
  User: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />',
  Loader2: '<path d="M21 12a9 9 0 1 1-6.219-8.56" />',
  AlertCircle: '<circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />',
  Eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />',
  EyeOff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" />',
  Database: '<ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />',
  Download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />',
  ShieldCheck: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4" />',
  Calendar: '<rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />',
  ArrowUpCircle: '<circle cx="12" cy="12" r="10" /><polyline points="16 12 12 8 8 12" /><line x1="12" x2="12" y1="16" y2="8" />',
  Quote: '<path d="M16 8a4 4 0 1 0 4 4v-2c0-2.661-1.741-4-4-4M6 8a4 4 0 1 0 4 4v-2c0-2.661-1.741-4-4-4" />',
  Sparkles: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />',
  Brain: '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-4.88A2.5 2.5 0 0 1 9.5 2ZM14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-4.88A2.5 2.5 0 0 0 14.5 2Z" />',
  Moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />',
  Smile: '<circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" />',
  HeartPulse: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7ZM3.22 12H7l2-5 3 10 2-7 1 3h3.5" />',
  Heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />',
  Save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8" />',
  X: '<path d="M18 6 6 18M6 6l12 12" />',
  Mail: '<rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />',
  MessageCircle: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />',
  MessageSquare: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />',
  HelpCircle: '<circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />',
  FileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7ZM14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8" />',
  Lock: '<rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />',
  CircleDot: '<circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="1" />',
  Send: '<line x1="22" x2="11" y1="2" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />',
  Home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22v-10h6v10" />',
  GraduationCap: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0zM6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />',
  Search: '<circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />',
  Clock: '<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />',
  MapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />',
  Filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />',
  ToggleLeft: '<rect width="20" height="12" x="2" y="6" rx="6" /><circle cx="8" cy="12" r="3" />',
  ToggleRight: '<rect width="20" height="12" x="2" y="6" rx="6" /><circle cx="16" cy="12" r="3" />',
  Medal: '<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15M11 12 5.12 2.2M13 12l5.88-9.8" /><circle cx="12" cy="16" r="6" />',
  Star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />',
  ExternalLink: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />',
  ShoppingCart: '<circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />',
  ShoppingBag: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />',
  Menu: '<line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />',
  LogOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />',
  Play: '<polygon points="5 3 19 12 5 21 5 3" />',
  Globe: '<circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />',
  Users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="16" cy="3.13" r="3" />',
  Briefcase: '<rect width="20" height="14" x="2" y="7" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />',
  KeyRound: '<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 1.5 1.5M15.5 7.5 14 6" />',
  LogIn: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />',
  HandHelping: '<path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3M14 10V5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5M10 10V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5M2 13h4M2 16h4M2 19h4" /><rect width="12" height="4" x="10" y="17" rx="1" />',
  Upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />',
  ClipboardList: '<rect width="8" height="4" x="8" y="2" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 11h4M12 16h4M8 11h.01M8 16h.01" />',
  Truck: '<rect width="7" height="9" x="14" y="9" /><rect width="11" height="9" x="3" y="9" /><path d="M14 9h4l3 3v6h-7" /><circle cx="7.5" cy="18.5" r="2.5" /><circle cx="16.5" cy="18.5" r="2.5" />',
  Scale: '<line x1="12" x2="12" y1="3" y2="21" /><line x1="5" x2="19" y1="3" y2="3" /><path d="M8 8s-3 1-3 4 3 4 3 4V8zM16 8s3 1 3 4-3 4-3 4V8z" />',
  LayoutGrid: '<rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />',
  Camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" />',
  Maximize2: '<polyline points="15 3 21 3 21 9M9 21 3 21 3 15" /><line x1="21" x2="14" y1="3" y2="10" /><line x1="3" x2="10" y1="21" y2="14" />',
  Share2: '<circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />',
  Ticket: '<path d="M21 8h-4a2 2 0 0 0 0 4 2 2 0 0 0 0 4h4" /><rect width="18" height="12" x="3" y="6" rx="2" />',
  Infinity: '<path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4z" />',
  Sun: '<circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />',
  Droplets: '<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.52-2.93L7 7l-2.48 2.32C3.57 9.99 3 11.09 3 12.25c0 2.22 1.8 4.05 4 4.05zm10 0c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.52-2.93L17 7l-2.48 2.32c-.95.67-1.52 1.77-1.52 2.93 0 2.22 1.8 4.05 4 4.05z" />',
  BatteryMedium: '<rect width="16" height="10" x="2" y="7" rx="2" ry="2" /><line x1="22" x2="22" y1="11" y2="13" /><line x1="6" x2="6" y1="11" y2="13" /><line x1="10" x2="10" y1="11" y2="13" />',
  Droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z" />',
  PlayCircle: '<circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />',
  Meh: '<circle cx="12" cy="12" r="10" /><line x1="8" x2="16" y1="15" y2="15" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" />',
  Frown: '<circle cx="12" cy="12" r="10" /><path d="M16 16s-1.5-2-4-2-4 2-4 2" /><line x1="9" x2="9.01" y1="9" y2="9" /><line x1="15" x2="15.01" y1="9" y2="9" />',
  AlertTriangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />',
  ShieldAlert: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 8v4" /><circle cx="12" cy="16" r="1" />',
  Shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />',
  Stethoscope: '<path d="M4.5 16.5c-1.5-1.5-2.5-3-2.5-4.5A4.5 4.5 0 0 1 6.5 7.5c1.5 0 2.5.5 3.5 1.5M22 17a3 3 0 0 1-6 0M14 3v12" /><circle cx="14" cy="3" r="1" /><path d="M11 12c.5 1 1.5 2.5 3 2.5H16" /><ellipse cx="19" cy="17" rx="1" ry="1" />',
  Layers: '<path d="m12 2-8 4 8 4 8-4-8-4zM4 12l8 4 8-4M4 16l8 4 8-4" />',
  Megaphone: '<path d="m3 11 18-5v12L3 13V11zM11.6 16.8a3 3 0 1 1-5.8-1.6" />',
  UserCheck: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="m16 11 2 2 4-4" />',
  Flower2: '<circle cx="12" cy="12" r="3" /><circle cx="12" cy="5" r="3" /><circle cx="12" cy="19" r="3" /><circle cx="5" cy="12" r="3" /><circle cx="19" cy="12" r="3" />',
  Zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />',
  Compass: '<circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" />',
  ArrowUpRight: '<path d="M7 17l10-10M7 7h10v10" />',
  HeartHandshake: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7ZM12 11h2l1 1-3 3-2-2 2-2" />',
  Activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2" />',
  Target: '<circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />',
  Map: '<path d="M14.12 3.4 8 6.06 2.6 3.4A1 1 0 0 0 1 4.3v15.2a1 1 0 0 0 1.4.9l5.6-2.4 6.2 2.65 5.4-2.27a1 1 0 0 0 .4-.9V4.3a1 1 0 0 0-1.4-.9L14.12 3.4zM8 6v14M14 4v14" />',
  TrendingUp: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />',
  History: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5M12 7v5l4 2" />',
  ArrowRight: '<path d="M5 12h14M12 5l7 7-7 7" />',
  ArrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7" />',
  Badge: '<path d="M3.85 8.62a4 4 0 0 1 .78-4.06 4 4 0 0 1 4.14-.77 4 4 0 0 1 3.16-3.16 4 4 0 0 1 4.14.77 4 4 0 0 1 .78 4.06 4 4 0 0 1 3.16 3.16 4 4 0 0 1-.77 4.14 4 4 0 0 1-3.16 3.16 4 4 0 0 1-4.14.77 4 4 0 0 1-3.16 3.16 4 4 0 0 1-4.14-.77 4 4 0 0 1-.78-4.06 4 4 0 0 1-3.16-3.16z" />',
  Bot: '<rect width="18" height="10" x="3" y="11" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8.01" y2="16" /><line x1="16" y1="16" x2="16.01" y2="16" />',
  BookmarkCheck: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16zM9 10l2 2 4-4" />',
  Bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />',
  Flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />',
  Gift: '<rect width="18" height="14" x="3" y="8" rx="2" /><path d="M12 5a3 3 0 1 0-3 3h6a3 3 0 1 0-3-3M12 22V8M3 12h18" />',
  GripVertical: '<circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" />',
  Headphones: '<path d="M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v6z" />',
  Laptop: '<rect width="16" height="10" x="4" y="6" rx="2" /><path d="M2 20h20M12 16h.01" />',
  LifeBuoy: '<circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="4.93" y1="4.93" x2="9.17" y2="9.17" /><line x1="14.83" y1="14.83" x2="19.07" y2="19.07" /><line x1="14.83" y1="9.17" x2="19.07" y2="4.93" /><line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />',
  Lightbulb: '<path d="M15 14c.5-1.5 1.5-2.5 1.5-4a4.5 4.5 0 0 0-9 0c0 1.5 1 2.5 1.5 4h6Z" /><path d="M9 18h6M10 22h4" />',
  Link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />',
  ListOrdered: '<line x1="10" x2="21" y1="6" y2="6" /><line x1="10" x2="21" y1="12" y2="12" /><line x1="10" x2="21" y1="18" y2="18" /><path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1.5" />',
  ListTodo: '<rect width="18" height="18" x="3" y="3" rx="2" /><line x1="8" x2="16" y1="9" y2="9" /><line x1="8" x2="16" y1="15" y2="15" /><path d="M5 9h.01M5 15h.01" />',
  Music: '<path d="M9 18V5l12-2v13M9 9h12" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />',
  Package: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" x2="12" y1="22.08" y2="12" />',
  Pause: '<rect width="4" height="16" x="14" y="4" /><rect width="4" height="16" x="6" y="4" />',
  PenTool: '<path d="m12 22 1-1c1.4-1.4 2.4-3.2 3-5l1-4-4 1c-1.8.6-3.6 1.6-5 3l-1 1M18 6l4-4M15 11l3 3" />',
  Percent: '<circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /><line x1="19" x2="5" y1="5" y2="19" />',
  Power: '<path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" />',
  Printer: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" rx="1" /><path d="M6 9V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5" />',
  RefreshCw: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M16 3h5v5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 21H3v-5" />',
  Smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" /><line x1="12" x2="12" y1="18" y2="18" />',
  Phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />',
  PhoneCall: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3" /><path d="M16 2a4 4 0 0 1 4 4" /><path d="M16 6a1 1 0 0 1 1 1" />',
  Wallet: '<path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-3" /><circle cx="18" cy="12" r="1" />',
  Wind: '<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2M12 12H2" />',
  UserPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="16" x2="22" y1="11" y2="11" />',
  BellRing: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0M4 4c-.75-.75-1.5-1.5-2-1M20 4c.75-.75 1.5-1.5 2-1" />',
  Book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M6 6h10M6 10h10" />',
  FileCheck: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7ZM14 2v4a2 2 0 0 0 2 2h4M9 15l2 2 4-4" />',
  FileSignature: '<path d="M20 19.5v-13a2.5 2.5 0 0 0-2.5-2.5h-11A2.5 2.5 0 0 0 4 6.5v13a2.5 2.5 0 0 0 2.5 2.5h11a2.5 2.5 0 0 0 2.5-2.5zM14 7v6l-4-4-4 4v-6M8 16h8" />',
  ArrowUp: '<path d="M12 19V5M5 12l7-7 7 7" />',
  BellCheck: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0M9 11l2 2 4-4" />',
  Video: '<path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" />',
  VideoOff: '<path d="M10.66 6H14a2 2 0 0 1 2 2v3.34l3.66-3.66a1 1 0 0 1 1.64.77v9.1a1 1 0 0 1-1.64.77l-3.66-3.66V16a2 2 0 0 1-2 2h-3.34M2 2l20 20M4 6H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10" />',
  Copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />',
  BarChart3: '<path d="M3 3v18h18M18 17V9M12 17v-4M6 17v-2" />',
  Settings: '<circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />',
  Inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />',
  ArrowDown: '<path d="M12 5v14M19 12l-7 7-7-7" />',
  Edit: '<path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />',
  Crown: '<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14a1 1 0 0 0 1-1v-1H4v1a1 1 0 0 0 1 1z" />',
  DollarSign: '<line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />',
  XCircle: '<circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />',
  LayoutDashboard: '<rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />',
  CheckSquare: '<polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />',
  Tag: '<path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l7.29-7.29a1 1 0 0 0 0-1.41L12 2zM12 2" /><circle cx="7.5" cy="7.5" r="1" />',
  Coins: '<circle cx="8" cy="8" r="6" /><circle cx="18" cy="18" r="4" /><path d="M12 10a6 6 0 0 1 6-6h1M12 14a6 6 0 0 1 6 6" />',
  Cake: '<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" /><path d="M4 16h16" /><ellipse cx="12" cy="9" rx="4" ry="2" /><path d="M12 2v5" />',
  Building2: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />',
  Image: '<rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />',
  CornerDownLeft: '<polyline points="9 10 4 15 9 20" /><path d="M20 4v7a4 4 0 0 1-4 4H4" />',
  CalendarCheck: '<rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" />',
  Layout: '<rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18M9 21V9" />',
  Grid: '<rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 12h18M12 3v18" />',
  Repeat: '<path d="m17 2 4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />',
  Handshake: '<path d="m11 17 2 2a1 1 0 0 0 1.4 0l4-4a1 1 0 0 0 0-1.4l-1.4-1.4a1 1 0 0 0-1.4 0l-1.4 1.4" /><path d="m12 14-3-3a1 1 0 0 0-1.4 0L3.3 15.3a1 1 0 0 0 0 1.4l1.4 1.4a1 1 0 0 0 1.4 0L10 14" /><path d="m18 11-4-4M10 7l-4 4" />',
  Cloud: '<path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42-1.89-1.93-3.5-4-3.5a4.37 4.37 0 0 0-4 2.82C3.5 11 3 13.5 4 15.5A4 4 0 0 0 8 19h9.5" />',
  Key: '<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 1.5 1.5M15.5 7.5 14 6" />',
  Link2: '<path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8" />',
  Palette: '<path d="M12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 14.52 3 16.8 4.64 18.5a1 1 0 0 0 1.36-.2C6.54 17.65 7.23 17 8 17H9C9.55 17 10 17.45 10 18V20C10 21.1 10.9 22 12 22Z" /><circle cx="7.5" cy="10.5" r="1" /><circle cx="11.5" cy="7.5" r="1" /><circle cx="16.5" cy="9.5" r="1" /><circle cx="15.5" cy="14.5" r="1" />',
  Columns: '<rect width="18" height="18" x="3" y="3" rx="2" /><path d="M12 3v18" />',
  BrainCircuit: '<path d="M12 4.5a2.5 2.5 0 0 0-4.96-.44 2.5 2.5 0 0 0 0 3.12 3 3 0 0 0 0 4.88 2.5 2.5 0 0 0 4.96-.44V4.5Z" /><path d="M12 4.5a2.5 2.5 0 0 1 4.96-.44 2.5 2.5 0 0 1 0 3.12 3 3 0 0 1 0 4.88 2.5 2.5 0 0 1-4.96-.44V4.5Z" /><path d="M16 8h4v4h-2M8 8H4v4h2" />',
  BarChart: '<line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" />',
  Thermometer: '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />',
  PieChart: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />',
  List: '<line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" />',
  CalendarDays: '<rect width="18" height="18" x="3" y="4" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />',
  QrCode: '<rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a1 1 0 0 0-1 1v3M10 16h2v2h-2zm6-6h2M10 10h2M14 14h2" />',
  ArrowBigRightDash: '<path d="M5 9h4V5l7 7-7 7v-4H5V9zm14-4v14" />',
  Hourglass: '<path d="M5 2h14M5 22h14M19 2c0 4-3 7-7 7s-7-3-7-7M5 22c0-4 3-7 7-7s7 3 7 7" />',
  Tv: '<rect width="20" height="15" x="2" y="7" rx="2" ry="2" /><path d="m17 2-5 5-5-5" />',
  BarChart2: '<line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" />',
  BookOpen: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />',
  CreditCard: '<rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />',
  Linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" />',
  Twitter: '<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />',
  Facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />',
  Youtube: '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />',
  Instagram: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />',
  Bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />',
  Orbit: '<circle cx="12" cy="12" r="3" /><ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(-45 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(45 12 12)" />'
};

// Default generic fallback if path not explicitly configured (custom circular/square target placeholder)
const fallbackHtml = '<circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />';

// Helper proxy or mapped exports generator
const icons: Record<string, any> = {};
Object.keys(d).forEach(key => {
  icons[key] = createIcon(d[key]);
});

// Explicit named functional components so they are fully typable and resolvable as static assets
export const ChevronDown = icons.ChevronDown || createIcon(fallbackHtml);
export const ChevronUp = icons.ChevronUp || createIcon(fallbackHtml);
export const ChevronRight = icons.ChevronRight || createIcon(fallbackHtml);
export const ChevronLeft = icons.ChevronLeft || createIcon(fallbackHtml);
export const Plus = icons.Plus || createIcon(fallbackHtml);
export const Minus = icons.Minus || createIcon(fallbackHtml);
export const Trash2 = icons.Trash2 || createIcon(fallbackHtml);
export const Info = icons.Info || createIcon(fallbackHtml);
export const CheckCircle = icons.CheckCircle || createIcon(fallbackHtml);
export const CheckCircle2 = icons.CheckCircle2 || createIcon(fallbackHtml);
export const Check = icons.Check || createIcon(fallbackHtml);
export const User = icons.User || createIcon(fallbackHtml);
export const Loader2 = icons.Loader2 || createIcon(fallbackHtml);
export const AlertCircle = icons.AlertCircle || createIcon(fallbackHtml);
export const Eye = icons.Eye || createIcon(fallbackHtml);
export const EyeOff = icons.EyeOff || createIcon(fallbackHtml);
export const Database = icons.Database || createIcon(fallbackHtml);
export const Download = icons.Download || createIcon(fallbackHtml);
export const ShieldCheck = icons.ShieldCheck || createIcon(fallbackHtml);
export const Calendar = icons.Calendar || createIcon(fallbackHtml);
export const ArrowUpCircle = icons.ArrowUpCircle || createIcon(fallbackHtml);
export const Quote = icons.Quote || createIcon(fallbackHtml);
export const Sparkles = icons.Sparkles || createIcon(fallbackHtml);
export const Brain = icons.Brain || createIcon(fallbackHtml);
export const Moon = icons.Moon || createIcon(fallbackHtml);
export const Smile = icons.Smile || createIcon(fallbackHtml);
export const HeartPulse = icons.HeartPulse || createIcon(fallbackHtml);
export const Heart = icons.Heart || createIcon(fallbackHtml);
export const Save = icons.Save || createIcon(fallbackHtml);
export const X = icons.X || createIcon(fallbackHtml);
export const Mail = icons.Mail || createIcon(fallbackHtml);
export const MessageCircle = icons.MessageCircle || createIcon(fallbackHtml);
export const MessageSquare = icons.MessageSquare || createIcon(fallbackHtml);
export const HelpCircle = icons.HelpCircle || createIcon(fallbackHtml);
export const FileText = icons.FileText || createIcon(fallbackHtml);
export const Lock = icons.Lock || createIcon(fallbackHtml);
export const CircleDot = icons.CircleDot || createIcon(fallbackHtml);
export const Send = icons.Send || createIcon(fallbackHtml);
export const Home = icons.Home || createIcon(fallbackHtml);
export const GraduationCap = icons.GraduationCap || createIcon(fallbackHtml);
export const Search = icons.Search || createIcon(fallbackHtml);
export const Clock = icons.Clock || createIcon(fallbackHtml);
export const Clock3 = icons.Clock || createIcon(fallbackHtml);
export const MapPin = icons.MapPin || createIcon(fallbackHtml);
export const Award = icons.Award || createIcon(fallbackHtml);
export const Filter = icons.Filter || createIcon(fallbackHtml);
export const ToggleLeft = icons.ToggleLeft || createIcon(fallbackHtml);
export const ToggleRight = icons.ToggleRight || createIcon(fallbackHtml);
export const Trophy = createIcon('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />');
export const Medal = icons.Medal || createIcon(fallbackHtml);
export const Star = icons.Star || createIcon(fallbackHtml);
export const ExternalLink = icons.ExternalLink || createIcon(fallbackHtml);
export const ShoppingCart = icons.ShoppingCart || createIcon(fallbackHtml);
export const ShoppingBag = icons.ShoppingBag || createIcon(fallbackHtml);
export const Menu = icons.Menu || createIcon(fallbackHtml);
export const LogOut = icons.LogOut || createIcon(fallbackHtml);
export const Play = icons.Play || createIcon(fallbackHtml);
export const Globe = icons.Globe || createIcon(fallbackHtml);
export const Users = icons.Users || createIcon(fallbackHtml);
export const BookOpen = icons.BookOpen || createIcon(fallbackHtml);
export const Briefcase = icons.Briefcase || createIcon(fallbackHtml);
export const KeyRound = icons.KeyRound || createIcon(fallbackHtml);
export const LogIn = icons.LogIn || createIcon(fallbackHtml);
export const HandHelping = icons.HandHelping || createIcon(fallbackHtml);
export const Upload = icons.Upload || createIcon(fallbackHtml);
export const ClipboardList = icons.ClipboardList || createIcon(fallbackHtml);
export const CreditCard = icons.CreditCard || createIcon(fallbackHtml);
export const Truck = icons.Truck || createIcon(fallbackHtml);
export const Linkedin = icons.Linkedin || createIcon(fallbackHtml);
export const Twitter = icons.Twitter || createIcon(fallbackHtml);
export const Facebook = icons.Facebook || createIcon(fallbackHtml);
export const Youtube = icons.Youtube || createIcon(fallbackHtml);
export const Instagram = icons.Instagram || createIcon(fallbackHtml);
export const Scale = icons.Scale || createIcon(fallbackHtml);
export const LayoutGrid = icons.LayoutGrid || createIcon(fallbackHtml);
export const Camera = icons.Camera || createIcon(fallbackHtml);
export const Maximize2 = icons.Maximize2 || createIcon(fallbackHtml);
export const Share2 = icons.Share2 || createIcon(fallbackHtml);
export const Ticket = icons.Ticket || createIcon(fallbackHtml);
export const Bell = icons.Bell || createIcon(fallbackHtml);
export const Infinity = icons.Infinity || createIcon(fallbackHtml);
export const Orbit = icons.Orbit || createIcon(fallbackHtml);
export const Sun = icons.Sun || createIcon(fallbackHtml);
export const Droplets = icons.Droplets || createIcon(fallbackHtml);
export const BatteryMedium = icons.BatteryMedium || createIcon(fallbackHtml);
export const Droplet = icons.Droplet || createIcon(fallbackHtml);
export const PlayCircle = icons.PlayCircle || createIcon(fallbackHtml);
export const Meh = icons.Meh || createIcon(fallbackHtml);
export const Frown = icons.Frown || createIcon(fallbackHtml);
export const AlertTriangle = icons.AlertTriangle || createIcon(fallbackHtml);
export const ShieldAlert = icons.ShieldAlert || createIcon(fallbackHtml);
export const Shield = icons.Shield || createIcon(fallbackHtml);
export const Stethoscope = icons.Stethoscope || createIcon(fallbackHtml);
export const Layers = icons.Layers || createIcon(fallbackHtml);
export const Megaphone = icons.Megaphone || createIcon(fallbackHtml);
export const UserCheck = icons.UserCheck || createIcon(fallbackHtml);
export const Flower2 = icons.Flower2 || createIcon(fallbackHtml);
export const Zap = icons.Zap || createIcon(fallbackHtml);
export const Compass = icons.Compass || createIcon(fallbackHtml);
export const ArrowUpRight = icons.ArrowUpRight || createIcon(fallbackHtml);
export const HeartHandshake = icons.HeartHandshake || createIcon(fallbackHtml);
export const Activity = icons.Activity || createIcon(fallbackHtml);
export const Target = icons.Target || createIcon(fallbackHtml);
export const Map = icons.Map || createIcon(fallbackHtml);
export const TrendingUp = icons.TrendingUp || createIcon(fallbackHtml);
export const History = icons.History || createIcon(fallbackHtml);
export const ArrowRight = icons.ArrowRight || createIcon(fallbackHtml);
export const ArrowLeft = icons.ArrowLeft || createIcon(fallbackHtml);
export const Badge = icons.Badge || createIcon(fallbackHtml);
export const Bot = icons.Bot || createIcon(fallbackHtml);
export const BookmarkCheck = icons.BookmarkCheck || createIcon(fallbackHtml);
export const Bookmark = icons.Bookmark || createIcon(fallbackHtml);
export const Flame = icons.Flame || createIcon(fallbackHtml);
export const Gift = icons.Gift || createIcon(fallbackHtml);
export const GripVertical = icons.GripVertical || createIcon(fallbackHtml);
export const Headphones = icons.Headphones || createIcon(fallbackHtml);
export const Laptop = icons.Laptop || createIcon(fallbackHtml);
export const LifeBuoy = icons.LifeBuoy || createIcon(fallbackHtml);
export const Lightbulb = icons.Lightbulb || createIcon(fallbackHtml);
export const Link = icons.Link || createIcon(fallbackHtml);
export const ListOrdered = icons.ListOrdered || createIcon(fallbackHtml);
export const ListTodo = icons.ListTodo || createIcon(fallbackHtml);
export const Music = icons.Music || createIcon(fallbackHtml);
export const Package = icons.Package || createIcon(fallbackHtml);
export const Pause = icons.Pause || createIcon(fallbackHtml);
export const PenTool = icons.PenTool || createIcon(fallbackHtml);
export const Percent = icons.Percent || createIcon(fallbackHtml);
export const Power = icons.Power || createIcon(fallbackHtml);
export const Printer = icons.Printer || createIcon(fallbackHtml);
export const RefreshCw = icons.RefreshCw || createIcon(fallbackHtml);
export const Smartphone = icons.Smartphone || createIcon(fallbackHtml);
export const Phone = icons.Phone || createIcon(fallbackHtml);
export const PhoneCall = icons.PhoneCall || createIcon(fallbackHtml);
export const Wallet = icons.Wallet || createIcon(fallbackHtml);
export const Wind = icons.Wind || createIcon(fallbackHtml);
export const UserPlus = icons.UserPlus || createIcon(fallbackHtml);
export const BellRing = icons.BellRing || createIcon(fallbackHtml);
export const Book = icons.Book || createIcon(fallbackHtml);
export const FileCheck = icons.FileCheck || createIcon(fallbackHtml);
export const FileSignature = icons.FileSignature || createIcon(fallbackHtml);
export const ArrowUp = icons.ArrowUp || createIcon(fallbackHtml);
export const BellCheck = icons.BellCheck || createIcon(fallbackHtml);
export const Flower = Flower2;
export const Edit2 = icons.Edit2 || createIcon(fallbackHtml);
export const Edit3 = icons.Edit3 || icons.Edit2 || createIcon(fallbackHtml);

export const Mic2 = createIcon('<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" />');
export const Presentation = createIcon('<path d="M2 3h20" /><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" /><path d="M12 16v6" /><path d="M9 22h6" />');
export const HandHeart = createIcon('<path d="M11 14h2a2 2 0 1 0 0-4h-3a2 2 0 1 0 0 4" /><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />');
export const Baby = createIcon('<path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" /><path d="M19 6.31A10 10 0 1 1 12 2v2a8 8 0 1 0 8 8h2a10 10 0 0 1-3-5.69" />');
export const MessageCircleHeart = createIcon('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /><path d="M12 9c.7-1 1.7-1.5 2.5-1.5 1.5 0 2.5 1 2.5 2.5 0 1.5-1.5 2.5-2.5 3.5l-2.5 2.5-2.5-2.5c-1-1-2.5-2-2.5-3.5 0-1.5 1-2.5 2.5-2.5.8 0 1.8.5 2.5 1.5z" />');
export const Clipboard = createIcon('<rect width="8" height="4" x="8" y="2" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />');
export const Square = createIcon('<rect width="18" height="18" x="3" y="3" rx="2" />');
export const Volume2 = createIcon('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />');
export const VolumeX = createIcon('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="22" x2="16" y1="9" y2="15" /><line x1="16" x2="22" y1="9" y2="15" />');
export const RotateCcw = createIcon('<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />');
export const Sparkle = createIcon('<path d="M12 3v18M3 12h18" />');
export const Radio = createIcon('<circle cx="12" cy="12" r="2" /><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />');
export const Flag = createIcon('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />');
export const Video = icons.Video || createIcon('<path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" />');
export const VideoOff = icons.VideoOff || createIcon('<path d="m1 1 22 22M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />');
export const MapIcon = Map;
export const ShieldRoleCheck = ShieldCheck;
export const ClockCheck = Clock;
export const CalendarCheck2 = Calendar;
export const OrbitIcon = Orbit;
export const Copy = icons.Copy || createIcon(fallbackHtml);
export const BarChart3 = icons.BarChart3 || createIcon(fallbackHtml);
export const Cake = icons.Cake || createIcon(fallbackHtml);
export const Building2 = icons.Building2 || createIcon(fallbackHtml);
export const Image = icons.Image || createIcon(fallbackHtml);
export const Inbox = icons.Inbox || createIcon(fallbackHtml);
export const Settings = icons.Settings || createIcon(fallbackHtml);
export const CornerDownLeft = icons.CornerDownLeft || createIcon(fallbackHtml);
export const CalendarCheck = icons.CalendarCheck || createIcon(fallbackHtml);
export const Layout = icons.Layout || createIcon(fallbackHtml);
export const Grid = icons.Grid || createIcon(fallbackHtml);
export const Repeat = icons.Repeat || createIcon(fallbackHtml);
export const Handshake = icons.Handshake || createIcon(fallbackHtml);
export const DollarSign = icons.DollarSign || createIcon(fallbackHtml);
export const ArrowDown = icons.ArrowDown || createIcon(fallbackHtml);
export const Cloud = icons.Cloud || createIcon(fallbackHtml);
export const LayoutDashboard = icons.LayoutDashboard || createIcon(fallbackHtml);
export const Key = icons.Key || createIcon(fallbackHtml);
export const XCircle = icons.XCircle || createIcon(fallbackHtml);
export const Link2 = icons.Link2 || createIcon(fallbackHtml);
export const Edit = icons.Edit || createIcon(fallbackHtml);
export const Palette = icons.Palette || createIcon(fallbackHtml);
export const Columns = icons.Columns || createIcon(fallbackHtml);
export const BrainCircuit = icons.BrainCircuit || createIcon(fallbackHtml);
export const BarChart = icons.BarChart || createIcon(fallbackHtml);
export const Thermometer = icons.Thermometer || createIcon(fallbackHtml);
export const PieChart = icons.PieChart || createIcon(fallbackHtml);
export const List = icons.List || createIcon(fallbackHtml);
export const CalendarDays = icons.CalendarDays || createIcon(fallbackHtml);
export const QrCode = icons.QrCode || createIcon(fallbackHtml);
export const Crown = icons.Crown || createIcon(fallbackHtml);
export const ArrowBigRightDash = icons.ArrowBigRightDash || createIcon(fallbackHtml);
export const Hourglass = icons.Hourglass || createIcon(fallbackHtml);
export const Tv = icons.Tv || createIcon(fallbackHtml);
export const CheckSquare = icons.CheckSquare || createIcon(fallbackHtml);
export const Tag = icons.Tag || createIcon(fallbackHtml);
export const BarChart2 = icons.BarChart2 || createIcon(fallbackHtml);
export const Coins = icons.Coins || createIcon(fallbackHtml);
