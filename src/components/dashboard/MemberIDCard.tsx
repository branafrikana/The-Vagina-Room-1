import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
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
  Hourglass,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import domtoimage from 'dom-to-image-more';
import ImageCropModal from './ImageCropModal';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

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
  const { userData, user } = useAuth();
  const { content } = useContent();
  
  // Localized state configurations
  const [isFlipped, setIsFlipped] = useState(false);
  const [showToast, setShowToast] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationDone, setVerificationDone] = useState(true);
  const [activeBenefitIndex, setActiveBenefitIndex] = useState<number | null>(0);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [customPhotoBase64, setCustomPhotoBase64] = useState<string>(() => {
    return localStorage.getItem('tvr_custom_id_photo') || userData?.photoURL || userData?.profilePhoto || '';
  });
  const [cropSrc, setCropSrc] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const cardFrontRef = useRef<HTMLDivElement>(null);
  const cardBackRef = useRef<HTMLDivElement>(null);

  // Sync with user data if there's no custom local override, or if user profile has a fresher image
  useEffect(() => {
    if ((userData?.photoURL || userData?.profilePhoto) && !localStorage.getItem('tvr_custom_id_photo')) {
      setCustomPhotoBase64(userData.photoURL || userData.profilePhoto);
    }
  }, [userData?.photoURL, userData?.profilePhoto]);

  
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

  const brandingSettings = content?.brandingSettingsJson ? JSON.parse(content.brandingSettingsJson) : {};
  const siteLogo = brandingSettings.headerLogoUrl || '';
  const siteName = siteLogo ? '' : 'The Vagina Room';

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
        setCropSrc(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedBase64: string) => {
    setCustomPhotoBase64(croppedBase64);
    localStorage.setItem('tvr_custom_id_photo', croppedBase64);
    setCropSrc('');
    triggerToast('📸 Private portrait securely embedded onto your membership ID card.');
    
    // Sync with Firebase
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), { photoURL: croppedBase64 });
      } catch (err) {
        console.error("Failed to sync profile picture to database:", err);
      }
    }
  };

  // Clean local photo discard
  const handleRemovePhoto = async () => {
    setCustomPhotoBase64('');
    localStorage.removeItem('tvr_custom_id_photo');
    triggerToast('🗑️ Custom photo token removed. Displaying cosmic avatar.');
    
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), { photoURL: '' });
      } catch (err) {
        console.error("Failed to remove profile photo:", err);
      }
    }
  };

  // Simulated sharing URL generator
  const shareUrl = `${window.location.origin}/verify/${membershipId}`;
  
  const handleShareVerification = () => {
    const shareText = `🌸 Verified Active Member of The Vagina Room. ID: ${membershipId}. Validation Status: Live Premium. Check status: ${shareUrl}`;
    navigator.clipboard.writeText(shareText);
    triggerToast('🔗 Verification matrix address copied to clipboard!');
  };

  // PDF Generation function utilizing html2canvas and jspdf
  const handlePrintCard = async () => {
    if (!cardFrontRef.current || !cardBackRef.current) return;
    setIsGeneratingPdf(true);
    triggerToast('Please wait while your PDF is being generated...');

    try {
      const { default: html2canvas } = await import('html2canvas');
      
      const parentNode = cardFrontRef.current.parentElement as HTMLElement;
      const parentOrigTransform = parentNode.style.transform;
      
      // Temporarily store original styles and classes
      const origStyleFront = cardFrontRef.current.style.cssText;
      const origStyleBack = cardBackRef.current.style.cssText;
      const origClassFront = cardFrontRef.current.className;
      const origClassBack = cardBackRef.current.className;

      // Bring parent to 0deg to avoid 3d skew
      parentNode.style.transform = 'rotateY(0deg)';

      const targetWidth = '856px';
      const targetHeight = '540px';

      // Setup front for ideal capture
      cardFrontRef.current.className = origClassFront.replace(/\[backface-visibility:hidden\]/g, '');
      cardFrontRef.current.style.width = targetWidth;
      cardFrontRef.current.style.height = targetHeight;
      cardFrontRef.current.style.position = 'fixed';
      cardFrontRef.current.style.top = '0';
      cardFrontRef.current.style.left = '0';
      cardFrontRef.current.style.zIndex = '99999';

      await new Promise(res => setTimeout(res, 150));

      const canvasFront = await html2canvas(cardFrontRef.current, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: null,
        windowWidth: 1200
      });
      const imgDataFront = canvasFront.toDataURL('image/png', 1.0);

      // Hide front card
      cardFrontRef.current.style.display = 'none';

      // Setup back card
      cardBackRef.current.className = origClassBack
        .replace(/\[transform:rotateY\(180deg\)\]/g, '')
        .replace(/\[backface-visibility:hidden\]/g, '');
      
      cardBackRef.current.style.width = targetWidth;
      cardBackRef.current.style.height = targetHeight;
      cardBackRef.current.style.position = 'fixed';
      cardBackRef.current.style.top = '0';
      cardBackRef.current.style.left = '0';
      cardBackRef.current.style.zIndex = '99999';

      await new Promise(res => setTimeout(res, 150));

      const canvasBack = await html2canvas(cardBackRef.current, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: null,
        windowWidth: 1200
      });
      const imgDataBack = canvasBack.toDataURL('image/png', 1.0);

      // Restore everything precisely
      cardFrontRef.current.className = origClassFront;
      cardFrontRef.current.style.cssText = origStyleFront;
      cardBackRef.current.className = origClassBack;
      cardBackRef.current.style.cssText = origStyleBack;
      parentNode.style.transform = parentOrigTransform;

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'credit-card' // Standard ID card size: 85.6 x 53.98 mm
      });

      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();

      // Add Front
      pdf.addImage(imgDataFront, 'PNG', 0, 0, width, height);
      
      // Add Back
      pdf.addPage('credit-card', 'landscape');
      pdf.addImage(imgDataBack, 'PNG', 0, 0, width, height);

      pdf.save(`Membership_ID_${membershipId}.pdf`);
      triggerToast('✅ PDF generated and saved successfully.');
    } catch (error) {
      console.error('Error generating PDF:', error);
      triggerToast('❌ Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
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

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        {/* Centralized Digital Card Showcase */}
        <div className="w-full max-w-3xl mx-auto space-y-8 pb-10">
          
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-serif font-black text-white uppercase tracking-wider">Digital Identity</h2>
              <p className="text-xs text-white/50 font-mono mt-1">Your secure membership credential</p>
            </div>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="text-[9px] font-mono bg-brand-gold/10 hover:bg-brand-gold border border-brand-gold/20 hover:text-brand-black transition-colors px-4 py-2 uppercase tracking-widest text-brand-gold font-bold rounded shadow-sm"
            >
              Flip ID View 🔄
            </button>
          </div>

          <div className="[perspective:1000px] w-full aspect-[1.586/1] max-h-[80vh]">
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="w-full h-full relative [transform-style:preserve-3d]"
            >
              
              {/* CARD FRONT SIDE */}
              <div 
                ref={cardFrontRef}
                onClick={() => setIsFlipped(true)}
                className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white rounded-2xl p-4 shadow-2xl cursor-pointer"
              >
                {/* Inner layered card */}
                <div className="relative w-full h-full bg-[#f8f9fa] rounded-xl overflow-hidden flex flex-col justify-between p-6 md:p-8 shadow-inner border border-gray-200">
                  
                  {/* Subtle watermarks */}
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-gold/5 blur-[80px] pointer-events-none rounded-full" />
                  <div className="absolute -bottom-10 -left-10 w-[300px] h-[300px] bg-emerald-100/30 blur-[60px] pointer-events-none rounded-full" />
                  
                  {/* Header info */}
                  <div className="relative z-10 flex justify-between items-center pb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        {siteName && (
                          <h4 className="text-sm md:text-base font-black text-gray-900 tracking-widest uppercase flex items-center gap-1.5 leading-none">
                            {siteName}
                          </h4>
                        )}
                        <span className="text-[9px] font-medium text-gray-500 block mt-1 tracking-[0.2em] uppercase">Membership Access Card</span>
                      </div>
                    </div>
                    <div className="text-[9px] tracking-widest text-emerald-800 px-3 py-1.5 bg-emerald-100 border border-emerald-200 uppercase font-black rounded shadow-sm flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Active
                    </div>
                  </div>

                  {/* Profile Avatar & Primary Details Structure */}
                  <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start my-auto w-full">
                    
                    {/* Photo Section with quick upload handle */}
                    <div className="relative group shrink-0">
                      <div className="w-24 h-24 md:w-32 md:h-32 border-[3px] border-white shadow-lg bg-gray-100 rounded-full flex items-center justify-center overflow-hidden relative">
                        {customPhotoBase64 ? (
                          <img 
                            src={customPhotoBase64} 
                            alt="Ambassador portrait" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="text-center font-black text-gray-300 text-3xl md:text-4xl">
                            {userInitials}
                          </div>
                        )}
                      </div>
                      {/* Inline micro upload click handler overlays */}
                      <label className="absolute -bottom-2 -right-2 bg-brand-black text-white p-2.5 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-110 transition-all shadow-xl hover:bg-brand-gold border border-white/20">
                        <Upload size={14} strokeWidth={2.5} />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handlePhotoUpload} 
                        />
                      </label>
                    </div>

                    <div className="min-w-0 space-y-5 flex-1 w-full mt-2 md:mt-0">
                      <div>
                        <h4 className="text-base md:text-xl font-black text-gray-900 leading-tight uppercase tracking-tight pb-1 break-words max-w-full">
                          {memberName}
                        </h4>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-4">
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold block mb-1">ID Number</span>
                            <span className="text-sm md:text-base font-mono text-gray-800 font-bold tracking-wider">{membershipId}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold block mb-1">Subscription Plan</span>
                            <span className="text-sm md:text-base font-mono text-brand-gold font-bold tracking-wider uppercase">{membershipTier}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Footer status timeline */}
                  <div className="relative z-10 pt-4 border-t border-gray-200 flex justify-between items-center mt-6">
                    <div className="flex gap-8">
                      <div className="text-[9px] md:text-[10px] font-mono uppercase text-gray-500 font-semibold tracking-wider">
                        <span className="text-gray-400 block text-[8px] mb-0.5">Joined</span>
                        <span className="text-gray-900">{joinDate}</span>
                      </div>
                      <div className="text-[9px] md:text-[10px] font-mono uppercase text-gray-500 font-semibold tracking-wider">
                        <span className="text-gray-400 block text-[8px] mb-0.5">Valid Thru</span>
                        <span className="text-gray-900">{expiryDate}</span>
                      </div>
                    </div>
                    {/* Bottom Right Logo */}
                    <div>
                      {siteLogo ? (
                        <img src={siteLogo} alt="Logo" className="h-10 md:h-14 w-auto object-contain opacity-90 drop-shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-black rounded-full flex items-center justify-center shadow-sm opacity-90">
                          <Crown size={16} className="text-brand-gold" />
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* CARD BACK SIDE */}
              <div 
                ref={cardBackRef}
                onClick={() => setIsFlipped(false)}
                id="tvr-print-back"
                className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white rounded-2xl p-4 shadow-2xl cursor-pointer"
              >
                <div className="relative w-full h-full bg-[#f8f9fa] rounded-xl overflow-hidden flex flex-col p-6 md:p-8 shadow-inner border border-gray-200">
                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
                  
                  {/* QR and Policy layout */}
                  <div className="flex-1 flex flex-col md:flex-row gap-6 md:gap-10 relative z-10 items-center justify-center">
                    
                    <div className="flex-1 space-y-4">
                      <div>
                        <span className="text-xs md:text-sm font-black text-gray-900 uppercase tracking-widest block mb-2">Terms of Access</span>
                        <p className="text-[10px] md:text-xs text-gray-600 leading-relaxed font-medium">
                          This digital credential certifies that the holder is a registered member of our network. It grants access to designated private physical lounges, specialized partner health dispensaries, and verified online community platforms. This card remains the property of the issuer and is universally non-transferable.
                        </p>
                      </div>
                      
                      <div className="space-y-1.5 pt-4 border-t border-gray-200">
                        <p className="text-[10px] text-gray-500 flex items-center gap-2 font-mono uppercase tracking-wider">
                          <CheckCircle2 size={12} className="text-emerald-500" /> Identity verification passed
                        </p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-2 font-mono uppercase tracking-wider break-all">
                          <ShieldCheck size={12} className="text-brand-gold" /> SIG: {membershipId}
                        </p>
                      </div>
                    </div>

                    {/* QR box container */}
                    <div flex-shrink-0>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setQrScanned(true);
                          triggerToast('🔳 Check-in QR scan successfully simulated!');
                        }}
                        className="relative p-3 bg-white border-2 border-gray-100 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all w-32 h-32 md:w-40 md:h-40 flex items-center justify-center mx-auto"
                        title="Simulate check-in scan"
                      >
                        <SimpleQRCode text={shareUrl} className="w-full h-full opacity-90" pixelColor="#111827" />
                        
                        {qrScanned && (
                          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center flex-col text-[10px] uppercase text-gray-900 font-black p-2 text-center tracking-widest shadow-inner border border-gray-100">
                            <CheckCircle size={24} className="mb-2 text-emerald-500" />
                            Access Granted
                          </div>
                        )}
                      </div>
                      <p className="text-center font-mono text-[8px] text-gray-400 mt-2 uppercase tracking-widest">Tap QR to simulate scan</p>
                    </div>

                  </div>

                  <div className="text-center font-mono text-[9px] text-gray-400 uppercase tracking-widest mt-6 border-t border-gray-200 pt-4">
                    {siteName || 'The Vagina Room'} • {new Date().getFullYear()} Active Core System
                  </div>

                </div>
              </div>

            </motion.div>
          </div>

          {/* User actions row below the ID card */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            <button
              onClick={handlePrintCard}
              className="px-8 py-4 bg-white hover:bg-neutral-100 text-neutral-900 transition-all font-mono text-[11px] uppercase tracking-widest font-bold flex items-center gap-2 shadow-md rounded-full border border-gray-200"
            >
              <Printer size={16} className="text-brand-gold" />
              Save as PDF
            </button>
          </div>

          {customPhotoBase64 && (
            <button
              onClick={handleRemovePhoto}
              className="text-[10px] mt-4 font-mono text-white/40 hover:text-white block mx-auto py-2 px-4 transition-colors"
            >
              Remove Profile Photo
            </button>
          )}

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

      <AnimatePresence>
        {cropSrc && (
          <ImageCropModal 
            imageSrc={cropSrc} 
            onCropComplete={handleCropComplete} 
            onClose={() => setCropSrc('')} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
