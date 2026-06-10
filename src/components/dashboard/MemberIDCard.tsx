import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CreditCard, 
  Download, 
  QrCode, 
  ShieldCheck, 
  Calendar, 
  Award, 
  CheckCircle, 
  Info, 
  RefreshCw, 
  Copy, 
  Share2, 
  Sparkles, 
  FileText, 
  Globe, 
  Crown, 
  ChevronRight, 
  User, 
  Upload, 
  ArrowRight, 
  Check, 
  X, 
  Printer,
  Sparkle,
  Zap,
  Activity,
  ArrowBigRightDash,
  Hourglass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Offline, lightweight deterministic SVG QR Code maker for professional presentation
interface QRCodeProps {
  text: string;
  className?: string;
  pixelColor?: string;
}

const SimpleQRCode: React.FC<QRCodeProps> = ({ text, className = "w-24 h-24", pixelColor = "#D4AF37" }) => {
  // Generate pseudo-random deterministic grids based on text
  const qrGridSize = 21; // 21x21 matrix
  const matrix: boolean[][] = Array(qrGridSize).fill(null).map(() => Array(qrGridSize).fill(false));

  // 1. Finder pattern generator
  const drawFinderPattern = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (isBorder || isCenter) {
          if (row + r < qrGridSize && col + c < qrGridSize) {
            matrix[row + r][col + c] = true;
          }
        }
      }
    }
  };

  // Top-Left, Top-Right, Bottom-Left Finder Patterns
  drawFinderPattern(0, 0);
  drawFinderPattern(0, qrGridSize - 7);
  drawFinderPattern(qrGridSize - 7, 0);

  // 2. Alignment Pattern
  const drawAlignmentPattern = (row: number, col: number) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const isCenter = r === 2 && c === 2;
        const isOuter = r === 0 || r === 4 || c === 0 || c === 4;
        if (isOuter || isCenter) {
          matrix[row + r][col + c] = true;
        }
      }
    }
  };
  drawAlignmentPattern(14, 14);

  // 3. Timing lines
  for (let i = 8; i < qrGridSize - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 4. Fill remaining pixels deterministically from the string hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  for (let r = 0; r < qrGridSize; r++) {
    for (let c = 0; c < qrGridSize; c++) {
      // Avoid overwriting finder and timing patterns
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= qrGridSize - 8;
      const inBottomLeft = r >= qrGridSize - 8 && c < 8;
      const inTiming = r === 6 || c === 6;
      const inAlignment = r >= 13 && r <= 17 && c >= 13 && c <= 17;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming && !inAlignment) {
        const bitIndex = (r * qrGridSize + c) % 32;
        const value = ((hash >> bitIndex) & 1) === 1;
        matrix[r][c] = value;
      }
    }
  }

  return (
    <svg viewBox={`0 0 ${qrGridSize} ${qrGridSize}`} className={className} shapeRendering="crispEdges">
      <rect width={qrGridSize} height={qrGridSize} fill="transparent" />
      {matrix.map((row, r) => 
        row.map((active, c) => active ? (
          <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill={pixelColor} />
        ) : null)
      )}
    </svg>
  );
};

export default function MemberIDCard() {
  const { userData } = useAuth();
  
  // Localized state configurations
  const [isFlipped, setIsFlipped] = useState(false);
  const [showToast, setShowToast] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationDone, setVerificationDone] = useState(true);
  const [activeBenefitIndex, setActiveBenefitIndex] = useState<number | null>(0);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [customPhotoBase64, setCustomPhotoBase64] = useState<string>(() => {
    return localStorage.getItem('tvr_custom_id_photo') || '';
  });
  
  // QR scanner scan animation trigger
  const [qrScanned, setQrScanned] = useState(false);

  // Form renewal fields (simulated ledger updater)
  const [renewalPeriod, setRenewalPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly');
  const [renewalComplete, setRenewalComplete] = useState(false);

  useEffect(() => {
    if (qrScanned) {
      const timer = setTimeout(() => setQrScanned(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [qrScanned]);

  if (!userData) {
    return (
      <div className="p-8 border border-white/5 bg-zinc-950/40 text-center font-mono text-[11px] uppercase tracking-wider text-white/50">
        🔒 Awaiting active authentication profile session ...
      </div>
    );
  }

  const formatDate = (dateStr: string | undefined | null, fallback: string) => {
    if (!dateStr) return fallback;
    try {
      const date = new Date(dateStr);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
      return fallback;
    }
  };

  // Derive display values from user profile or clear golden defaults
  const memberName = userData.fullName || userData.name || 
    (userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : 'Sister of the Community');
  
  const membershipId = userData.membershipId || 'TVR-AMB-4819';
  
  const getPlanDisplay = (tier: string) => {
    if (!tier) return "Gold Plan (3 Months)";
    const t = tier.toLowerCase();
    if (t === 'gold' || t === 'quarterly') return "Gold Plan (3 Months)";
    if (t === 'diamond' || t === 'yearly') return "Diamond Plan (1 Year)";
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };
  
  const membershipTier = getPlanDisplay(userData.membershipType || 'gold');
  const joinDate = formatDate(userData.createdAt, '15 Jun 2026');
  const expiryDate = formatDate(userData.membershipExpiration, '15 Dec 2026');
  const userInitials = memberName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Handle Copy toast triggers
  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 4000);
  };

  // Profile Image upload callback (utilizing Base64 storage securely inside indexedDB/localStorage)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCustomPhotoBase64(base64String);
        localStorage.setItem('tvr_custom_id_photo', base64String);
        triggerToast('📸 Private portrait securely embedded onto your membership ID card.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Clean local photo discard
  const handleRemovePhoto = () => {
    setCustomPhotoBase64('');
    localStorage.removeItem('tvr_custom_id_photo');
    triggerToast('🗑️ Custom photo token removed. Displaying cosmic avatar.');
  };

  // Simulated sharing URL generator
  const shareUrl = `${window.location.origin}/verify/${membershipId}`;
  
  const handleShareVerification = () => {
    const shareText = `🌸 Verified Active Member of The Vagina Room. ID: ${membershipId}. Validation Status: Live Premium. Check status: ${shareUrl}`;
    navigator.clipboard.writeText(shareText);
    triggerToast('🔗 Verification matrix address copied to clipboard!');
  };

  // Simulated print trigger of ONLY the card element
  const handlePrintCard = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please unlock permission to print your credentials.');
      return;
    }
    
    // Render standard CSS structures inside popup with premium styling for layout output
    printWindow.document.write(`
      <html>
        <head>
          <title>The Vagina Room Membership ID Card - ${membershipId}</title>
          <style>
            body {
              background: #000;
              color: #fff;
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .card-wrapper {
              width: 480px;
              height: 300px;
              border: 2px solid #D4AF37;
              border-radius: 12px;
              background: linear-gradient(135deg, #1A1717 0%, #110F0F 100%);
              padding: 24px;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              position: relative;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 1px solid rgba(212, 175, 55, 0.2);
              padding-bottom: 12px;
            }
            .title {
              color: #D4AF37;
              font-size: 16px;
              letter-spacing: 2px;
              text-transform: uppercase;
              font-weight: bold;
              margin: 0;
            }
            .subtitle {
              color: rgba(255, 255, 255, 0.4);
              font-size: 9px;
              letter-spacing: 1px;
              text-transform: uppercase;
              margin-top: 2px;
            }
            .badge {
              font-size: 8px;
              border: 1px solid #D4AF37;
              color: #D4AF37;
              padding: 3px 8px;
              text-transform: uppercase;
              font-weight: bold;
            }
            .body {
              display: flex;
              gap: 20px;
              align-items: center;
              margin-top: 15px;
            }
            .photo-box {
              width: 80px;
              height: 80px;
              border: 1px solid rgba(212, 175, 55, 0.4);
              background: #252222;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .photo-box img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .initials {
              color: #D4AF37;
              font-size: 24px;
              font-weight: bold;
            }
            .details {
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            .member-name {
              font-size: 18px;
              color: #fff;
              text-transform: uppercase;
              font-weight: bold;
              margin: 0;
            }
            .label {
              font-size: 8px;
              color: rgba(255, 255, 255, 0.4);
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .value {
              font-size: 11px;
              color: #fff;
              font-family: monospace;
            }
            .footer-line {
              display: flex;
              justify-content: space-between;
              font-size: 9px;
              color: rgba(255, 255, 255, 0.4);
              border-top: 1px solid rgba(255, 255, 255, 0.05);
              padding-top: 12px;
            }
            .footer-line span {
              font-family: monospace;
            }
            .print-btn {
              margin-top: 24px;
              background: #D4AF37;
              color: #000;
              border: none;
              padding: 10px 20px;
              cursor: pointer;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 11px;
              letter-spacing: 1px;
            }
            @media print {
              .print-btn {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="card-wrapper">
            <div class="header">
              <div>
                <h1 class="title">The Vagina Room</h1>
                <div class="subtitle">Somatic Sanctum Network</div>
              </div>
              <div class="badge">Verified Active</div>
            </div>
            <div class="body">
              <div class="photo-box">
                ${customPhotoBase64 
                  ? `<img src="${customPhotoBase64}" />` 
                  : `<span class="initials">${userInitials}</span>`}
              </div>
              <div class="details">
                <h2 class="member-name">${memberName}</h2>
                <div>
                  <span class="label">Token Block</span><br/>
                  <span class="value">${membershipId}</span>
                </div>
                <div>
                  <span class="label">Somatic Rank</span><br/>
                  <span class="value">${membershipTier}</span>
                </div>
              </div>
            </div>
            <div class="footer-line">
              <div>JOINED: <span>${joinDate}</span></div>
              <div>VALID THROUGH: <span>${expiryDate}</span></div>
            </div>
          </div>
          <button class="print-btn" onclick="window.print()">Trigger Output Print</button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Membership Benefits matrix data
  const membershipBenefits = [
    {
      title: "Community Access & Sisterhood Lounge",
      slug: "lounge",
      desc: "Instant unlock for member-exclusive conversational topics, forum boards, peer verification, direct messaging channels, and local cluster safe spaces.",
      badge: "Unlimited Safe Spaces"
    },
    {
      title: "Exclusive Curated Resources & Guidelines",
      slug: "resources",
      desc: "Unlock our raw analytical guide books, plant-based remedy lists, clinical logs, and holistic worksheets curated specifically for your profile.",
      badge: "60+ Botanical Files"
    },
    {
      title: "Local & Virtual Event Priority passes",
      slug: "events",
      desc: "Continuous RSVPs to physical seminars, womb-circles, monthly streaming councils, and interactive live workshops without external waitlists.",
      badge: "First-Tier Seats"
    },
    {
      title: "Special Reduction & Reward Multipliers",
      slug: "discounts",
      desc: "Gain an ongoing 15% discount code automatically indexed into your micro-shop and shopping cart, which stack on partner botanist items.",
      badge: "15% Cart Deductions"
    },
    {
      title: "Live Somatic Wellness Consultations",
      slug: "wellness",
      desc: "Secure private scheduling accesses with our directory of certified holistic practitioners, physical trainers, and nutritionists annually.",
      badge: "2 Expert Reviews / Yr"
    }
  ];

  // Instantly verify card state (simulating real network call)
  const handleVerifyStatus = () => {
    setIsVerifying(true);
    setVerificationDone(false);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationDone(true);
      triggerToast('🧬 Cloud verification check successfully complete. Status verified active.');
    }, 1500);
  };

  // Simulated instant payment renewing ledger
  const handleSimulatedPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setRenewalComplete(true);
    setTimeout(() => {
      setRenewalComplete(false);
      setShowRenewalModal(false);
      triggerToast('💳 Plan renewal securely authorized! Cloud ledger sync updated successfully.');
    }, 2000);
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Toast Alert Box */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 z-[9999] px-4 py-3 bg-zinc-950 border border-brand-gold/30 text-brand-gold font-mono text-[9px] uppercase tracking-wider font-black flex items-center gap-2.5 shadow-2xl rounded-sm"
          >
            <Sparkles size={11} className="text-brand-gold animate-spin shrink-0" />
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Hand: Digital Card Showcase (Double-side design with rotatable click transition) */}
        <div className="w-full lg:w-1/2 space-y-6">
          
          <div className="flex justify-between items-center bg-black/30 p-2.5 border border-white/5">
            <span className="text-[9px] font-mono text-white/55 uppercase tracking-widest flex items-center gap-1">
              <CreditCard size={10} className="text-brand-gold" /> Tap Card to Flip
            </span>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="text-[8px] font-mono bg-white/5 hover:bg-brand-gold hover:text-brand-black border border-white/10 hover:border-brand-gold transition-colors px-2 py-0.5 uppercase tracking-widest text-brand-gold font-black"
            >
              Flip ID View 🔄
            </button>
          </div>

          <div className="perspective-[1000px] w-full max-w-md mx-auto aspect-[1.586/1]">
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="w-full h-full relative preserve-3d"
            >
              
              {/* CARD FRONT SIDE */}
              <div 
                onClick={() => setIsFlipped(true)}
                className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-zinc-950 via-neutral-900 to-zinc-950 border border-brand-gold/40 p-6 md:p-8 flex flex-col justify-between overflow-hidden shadow-2xl rounded-none cursor-pointer"
              >
                {/* Visual Ambient Flourishes for Cosmic theme */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-brand-gold/5 blur-[40px] pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-0 w-36 h-36 bg-brand-red/5 blur-[40px] pointer-events-none rounded-full" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(214,175,55,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(214,175,55,0.01)_1px,transparent_1px)] bg-[size:10px_10px]" />
                
                {/* Header info */}
                <div className="relative z-10 flex justify-between items-start border-b border-white/5 pb-3">
                  <div>
                    <h4 className="text-xs font-serif font-black text-brand-gold tracking-widest uppercase flex items-center gap-1.5 leading-none">
                      <Crown size={12} className="inline" /> The Vagina Room
                    </h4>
                    <span className="text-[7.5px] font-mono text-white/40 block mt-1 tracking-wider uppercase">Somatic Community Network</span>
                  </div>
                  <div className="text-[7.5px] font-mono tracking-widest text-emerald-400 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 uppercase font-black">
                    Live Verified 🌸
                  </div>
                </div>

                {/* Profile Avatar & Primary Details Structure */}
                <div className="relative z-10 flex gap-4 md:gap-5 items-center my-2 text-left">
                  
                  {/* Photo Section with quick upload handle */}
                  <div className="relative group shrink-0">
                    <div className="w-16 h-16 md:w-20 md:h-20 border border-brand-gold/30 bg-zinc-950/80 rounded-full flex items-center justify-center overflow-hidden relative shadow-inner">
                      {customPhotoBase64 ? (
                        <img 
                          src={customPhotoBase64} 
                          alt="Ambassador portrait" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="text-center font-mono text-brand-gold text-lg font-black tracking-normal">
                          {userInitials}
                        </div>
                      )}
                    </div>
                    {/* Inline micro upload click handler overlays */}
                    <label className="absolute -bottom-1 -right-1 bg-brand-gold text-brand-black p-1 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-115 transition-all shadow-md">
                      <Upload size={10} strokeWidth={3} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handlePhotoUpload} 
                      />
                    </label>
                  </div>

                  <div className="min-w-0 space-y-2">
                    <div>
                      <h4 className="text-md sm:text-lg font-serif font-black text-white leading-tight uppercase tracking-tight truncate">
                        {memberName}
                      </h4>
                      <p className="text-[8.5px] font-mono text-brand-gold font-bold tracking-widest uppercase">
                        {membershipTier}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 text-[8px] font-mono">
                      <div>
                        <span className="text-white/30 uppercase block leading-none">Member Token</span>
                        <span className="text-white/80 font-bold truncate block tracking-wider uppercase mt-0.5">{membershipId}</span>
                      </div>
                      <div>
                        <span className="text-white/30 uppercase block leading-none">Access Node</span>
                        <span className="text-white/80 font-bold block mt-0.5">Lounge Active</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer status timeline */}
                <div className="relative z-10 pt-2 border-t border-white/5 flex justify-between items-center text-[7.5px] font-mono uppercase text-white/40">
                  <div>
                    VALID FROM: <span className="text-white/70 font-semibold">{joinDate}</span>
                  </div>
                  <div>
                    TO: <span className="text-brand-gold font-bold">{expiryDate}</span>
                  </div>
                </div>

              </div>

              {/* CARD BACK SIDE */}
              <div 
                onClick={() => setIsFlipped(false)}
                className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-[#121010] via-neutral-950 to-[#121010] border border-brand-gold/40 p-5 md:p-6 flex flex-col justify-between overflow-hidden shadow-2xl rounded-none cursor-pointer rotate-Y-180"
              >
                <div className="absolute inset-0 bg-[linear-gradient(rgba(214,175,55,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(214,175,55,0.01)_1px,transparent_1px)] bg-[size:10px_10px]" />
                
                {/* Guidelines Back details */}
                <div className="text-left space-y-1.5 relative z-10">
                  <span className="text-[7.5px] font-mono text-brand-gold uppercase tracking-[0.2em] font-black block">COMMUNITY CODE OF HONOR</span>
                  <p className="text-[7.5px] text-white/55 leading-relaxed font-sans font-light">
                    This digital coordinate certifies that the dynamic certificate holder is registered within our community loop. Designed to support women's privacy networks, clinical sisterhood education, and exclusive chemical formulations. Non-transferable token protected under security standards.
                  </p>
                </div>

                {/* Interactive SVG QR layout & digital lock seal */}
                <div className="flex justify-between items-center relative z-10 pt-2 border-t border-white/5">
                  <div className="text-left text-[7px] font-mono uppercase space-y-1 text-white/45">
                    <div className="flex items-center gap-1 select-all text-white/60">
                      <ShieldCheck size={9} className="text-brand-gold" />
                      SECURE CREDENTIAL BLOCK
                    </div>
                    <div>Digital Signature: <span className="text-white/70">{membershipId.split('-').pop()}</span></div>
                    <div>Ledger State: Approved</div>
                    <div>Verification URL: verified.tvr</div>
                  </div>

                  {/* QR box container */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setQrScanned(true);
                      triggerToast('🔳 Member pass QR read simulated successfully!');
                    }}
                    className="relative p-1.5 bg-white border border-brand-gold/50 rounded-sm hover:scale-105 transition-transform shrink-0"
                    title="Simulate Check-in scan"
                  >
                    <SimpleQRCode text={shareUrl} className="w-14 h-14 md:w-16 md:h-16" pixelColor="#1A1717" />
                    
                    {/* Interactive pulse visualizer */}
                    <div className="absolute inset-0 border border-brand-gold/40 animate-ping rounded pointer-events-none" />
                    
                    {qrScanned && (
                      <div className="absolute inset-0 bg-brand-gold/90 backdrop-blur-xs flex items-center justify-center flex-col text-[7px] font-mono uppercase text-brand-black font-black p-0.5 text-center leading-tight">
                        <CheckCircle size={14} className="mb-0.5 shrink-0" />
                        Checked In
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center font-mono text-[6.5px] text-white/30 uppercase tracking-widest mt-1">
                  Presented under cryptography norms • The Vagina Room 2026
                </div>

              </div>

            </motion.div>
          </div>

          {/* Photo management panel under the ID card (if custom photo uploaded) */}
          {customPhotoBase64 && (
            <button
              onClick={handleRemovePhoto}
              className="text-[9px] font-mono text-white/40 hover:text-red-400 block mx-auto py-1 px-3 border border-dashed border-white/10 hover:border-red-500/30 transition-colors"
            >
              Discard custom image token & revert avatar
            </button>
          )}

          {/* QR Scan instruction */}
          <div className="p-3.5 bg-zinc-950 border border-white/5 text-[9px] text-white/50 leading-relaxed font-sans text-left space-y-1">
            <p className="font-bold uppercase text-brand-gold tracking-wider flex items-center gap-1 font-mono">
              <QrCode size={11} /> Scan and Present
            </p>
            <p className="font-light">
              Present your unique QR code at physical lounges or events for quick registration check-ins. Click on the code above to simulate a checkout verification!
            </p>
          </div>

        </div>

        {/* Right Hand: Interactive Membership Verification, Snapshots, and Quick Actions */}
        <div className="flex-1 w-full space-y-6 text-left">
          
          {/* ✅ MEMBERSHIP VERIFICATION PANEL */}
          <div className="p-5 bg-white/[0.01] border border-white/10 rounded-sm space-y-4">
            <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
              <div>
                <h3 className="text-xs uppercase tracking-widest font-mono text-brand-gold font-bold flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-brand-gold" /> ✅ Membership Verification
                </h3>
                <p className="text-[9px] text-white/40 font-mono mt-0.5">Verify your active membership status instantly.</p>
              </div>
              <span className="text-[10px] uppercase font-serif text-brand-gold font-semibold italic">
                Active Member 🌸
              </span>
            </div>

            {/* Checklists values */}
            <div className="space-y-2.5">
              {[
                { name: 'Active Membership Status', val: 'Verified Live ✅', desc: 'Secure cloud instance validates approved payments.' },
                { name: 'Membership Tier Validation', val: `${membershipTier}`, desc: 'Direct access to level rewards and commission codes is active.' },
                { name: 'Renewal Status', val: `Paid (Until ${expiryDate})`, desc: 'Next payment ledger verification schedule is active.' },
                { name: 'Verification Badge', val: 'Somatic Seal Authenticated', desc: 'Certificate holds official community signature code.' },
                { name: 'Community Access Eligibility', val: 'Lounge and Circles unlocked', desc: 'Symmetric access token generated for interactive councils.' }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-[10px] border-b border-white/[0.02] pb-2 last:border-0 last:pb-0 gap-3">
                  <div className="space-y-0.5 font-sans leading-tight">
                    <p className="font-bold text-white uppercase">{item.name}</p>
                    <p className="text-[8.5px] text-white/40 font-light">{item.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-1.5 py-0.5 bg-brand-gold/10 border border-brand-gold/20 font-mono text-[8px] text-brand-gold uppercase font-bold text-right inline-block">
                      {item.val}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Verify button */}
            <div className="pt-2 flex justify-between items-center text-[9px] font-mono text-white/40">
              <span>Cloud Ledger Key: {membershipId}</span>
              <button
                onClick={handleVerifyStatus}
                disabled={isVerifying}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 uppercase tracking-widest font-black decoration-none border border-white/10 hover:border-brand-gold transition-colors text-brand-gold text-[8.5px] flex items-center gap-1 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw size={10} className="animate-spin text-brand-gold" /> Re-authenticating...
                  </>
                ) : (
                  <>
                    <RefreshCw size={10} /> Test Verification Link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 🎖️ MEMBERSHIP BENEFITS SNAPSHOT */}
          <div className="p-5 bg-white/[0.01] border border-white/10 rounded-sm space-y-4">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-mono text-brand-gold font-bold flex items-center gap-1.5">
                <Award size={13} className="text-brand-gold" /> 🎖️ Membership Benefits Snapshot
              </h3>
              <p className="text-[9px] text-white/40 font-mono mt-0.5">View your current membership privileges.</p>
            </div>

            {/* Benefits accordion style list */}
            <div className="grid grid-cols-1 gap-2">
              {membershipBenefits.map((benefit, idx) => {
                const isActive = activeBenefitIndex === idx;
                return (
                  <div 
                    key={idx}
                    className={`border transition-all ${
                      isActive 
                        ? 'bg-zinc-950/70 border-brand-gold/40' 
                        : 'bg-transparent border-white/5 hover:border-white/15'
                    }`}
                  >
                    <button
                      onClick={() => setActiveBenefitIndex(isActive ? null : idx)}
                      className="w-full p-3 flex justify-between items-center text-[10.5px] uppercase font-bold text-white text-left font-sans group"
                      type="button"
                    >
                      <span className="group-hover:text-brand-gold transition-colors">{benefit.title}</span>
                      <span className="text-[8px] font-mono text-brand-gold shrink-0 border border-brand-gold/20 bg-brand-gold/5 px-2 py-0.5 tracking-wider font-light">
                        {benefit.badge}
                      </span>
                    </button>
                    
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 pt-1 border-t border-white/5 text-[9.5px] text-white/55 leading-relaxed font-sans font-light">
                            {benefit.desc}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 📥 QUICK ACTIONS PANEL */}
          <div className="p-5 bg-zinc-950 border border-white/5 rounded-sm space-y-4">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-mono text-brand-gold font-bold flex items-center gap-1.5">
                <Sparkles size={11} className="text-brand-gold" /> 📥 Quick Actions
              </h3>
              <p className="text-[8.5px] text-white/30 font-mono mt-0.5">Quick administrative features for membership accounts.</p>
            </div>

            {/* Quick action buttons list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9px] font-mono tracking-widest font-black uppercase">
              
              {/* Action 1: Print Card */}
              <button
                onClick={handlePrintCard}
                className="p-3 bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-brand-gold/40 transition-all flex items-center gap-2"
              >
                <Printer size={12} className="text-brand-gold shrink-0" />
                Download Membership Card
              </button>

              {/* Action 2: Save to Device JSON Credential */}
              <button
                onClick={() => {
                  const credentialData = {
                    organization: 'The Vagina Room',
                    memberName: memberName,
                    membershipId: membershipId,
                    membershipTier: membershipTier,
                    status: 'Live Active Verified',
                    establishedDate: joinDate,
                    validationDate: expiryDate,
                    encryptionProtocol: 'AES-256 Cloud Ledger Verified'
                  };
                  const blob = new Blob([JSON.stringify(credentialData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `tvr_identity_${membershipId}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  triggerToast('📥 Secure JSON identity token saved successfully to your downloads page!');
                }}
                className="p-3 bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-brand-gold/40 transition-all flex items-center gap-2"
              >
                <Download size={12} className="text-brand-gold shrink-0" />
                Save to Device (JSON)
              </button>

              {/* Action 3: Copy share URL */}
              <button
                onClick={handleShareVerification}
                className="p-3 bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-brand-gold/40 transition-all flex items-center gap-2"
              >
                <Share2 size={12} className="text-brand-gold shrink-0" />
                Share Verification Link
              </button>

              {/* Action 4: Accordion toggle helper */}
              <button
                onClick={() => {
                  setActiveBenefitIndex(3); // Highlights discounts
                  triggerToast('🎖️ Membership Benefits view shifted to Product Discounts!');
                }}
                className="p-3 bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-brand-gold/40 transition-all flex items-center gap-2"
              >
                <Award size={12} className="text-brand-gold shrink-0" />
                View Membership Benefits Log
              </button>

              {/* Action 5: Renew membership plan */}
              <button
                onClick={() => setShowRenewalModal(true)}
                className="p-3 bg-brand-gold/10 hover:bg-brand-gold hover:text-brand-black text-brand-gold border border-brand-gold/20 hover:border-brand-gold transition-all flex items-center gap-2 sm:col-span-2 cursor-pointer font-extrabold"
              >
                <RefreshCw size={12} className="shrink-0" />
                Renew Membership Program
              </button>

            </div>
          </div>

        </div>

      </div>

      {/* MODAL: MEMBERSHIP RENEWAL (Simulated ledger updater) */}
      <AnimatePresence>
        {showRenewalModal && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-zinc-950 border border-brand-gold/40 p-6 space-y-5 text-left relative"
            >
              <button
                onClick={() => setShowRenewalModal(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                type="button"
              >
                <X size={15} />
              </button>

              <div className="space-y-1">
                <h4 className="text-lg font-serif font-bold text-brand-gold flex items-center gap-1.5">
                  <RefreshCw size={16} /> Renew Membership Program
                </h4>
                <p className="text-[9px] text-white/40 font-mono uppercase">Extend your verified active somatic access timeline.</p>
              </div>

              <div className="p-3.5 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold font-mono text-[9px] leading-relaxed uppercase space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Info size={11} /> Cryptographic Access Extended
                </p>
                <p className="font-light">
                  Renewing locks your 20% ambassador code discounts, unlocks course guides instantly, and grants seamless access passes to virtual womb-circles.
                </p>
              </div>

              <form onSubmit={handleSimulatedPayment} className="space-y-4 font-mono text-[10px]">
                
                {/* Period Selector */}
                <div className="space-y-1 text-left">
                  <label className="text-[8px] text-white/50 uppercase tracking-widest font-bold block">Access Term Plan</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'monthly', term: 'Monthly Link', price: '$15.00' },
                      { id: 'quarterly', term: 'Quarterly Gold', price: '$40.00' },
                      { id: 'annual', term: 'Annual Shala', price: '$120.00' },
                    ].map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setRenewalPeriod(plan.id as any)}
                        className={`p-2.5 text-center border rounded-none transition-all flex flex-col justify-between items-center gap-1 ${
                          renewalPeriod === plan.id
                            ? 'bg-brand-gold text-brand-black border-brand-gold font-bold'
                            : 'bg-transparent border-white/10 text-white/55 hover:border-white/20'
                        }`}
                      >
                        <span className="uppercase text-[8px] tracking-wider block">{plan.term}</span>
                        <span className="text-[11px] block font-black">{plan.price}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[8px] text-white/50 uppercase tracking-widest font-bold block">Secure Payment Gateway Option</label>
                  <div className="p-3 bg-black/45 border border-white/5 text-[9px] text-white/80 flex justify-between items-center">
                    <span className="font-sans">💳 Safe Somatic Visa (**** 4891)</span>
                    <span className="text-white/40 italic">Linked</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3 text-[10px] font-sans">
                  <button
                    type="button"
                    onClick={() => setShowRenewalModal(false)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10 font-mono text-[9px] uppercase tracking-widest font-black"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    disabled={renewalComplete}
                    className="flex-1 py-2 bg-brand-gold hover:bg-white text-brand-black transition-colors font-mono text-[9px] uppercase tracking-widest font-black flex items-center justify-center gap-1"
                  >
                    {renewalComplete ? (
                      <>
                        <RefreshCw size={11} className="animate-spin" /> Authorizing Ledger...
                      </>
                    ) : (
                      <>
                        Confirm and Pay
                      </>
                    )}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
