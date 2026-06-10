import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Percent, 
  Heart, 
  Sparkles, 
  ExternalLink, 
  Check, 
  Trash2,
  FileText,
  Download,
  BookOpen,
  Volume2,
  Bookmark,
  ChevronRight,
  Gift,
  Tag,
  Search,
  Truck,
  MessageSquare,
  HelpCircle,
  Clock,
  ArrowRight,
  BellRing,
  Info,
  CheckCircle2,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';

// Define localized TS interfaces
interface ProductItem {
  id: string;
  title: string;
  price: string;
  currency: string;
  description: string;
  imageUrl?: string;
  category: 'womens_wellness' | 'herbal_blends' | 'intimate_care' | 'pelvic_wellness' | 'lifestyle';
  orderMethod?: 'cart' | 'affiliate' | 'whatsapp';
  externalLink?: string;
  memberDiscountPrice?: string;
  isExternal?: boolean;
  isDigital?: boolean;
  downloadUrl?: string;
}

interface DigitalResource {
  id: string;
  title: string;
  category: 'fertility_guide' | 'ebook' | 'toolkit' | 'audio' | 'workbook';
  type: string;
  size: string;
  description: string;
  author: string;
  downloads: number;
}

interface PromoCode {
  code: string;
  discount: number; // e.g. 0.20 for 20%
  description: string;
  badge: string;
}

interface SimulatedOrder {
  id: string;
  date: string;
  items: { title: string; qty: number; price: string }[];
  total: string;
  currency: string;
  shippingAddress: string;
  status: 'processing' | 'assembling' | 'dispatched' | 'delivered';
  courierDetail: string;
}

export default function MemberMicroShop() {
  const { content } = useContent();
  const { addToCart, cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  
  // Dashboard Sub-navigation Tab
  // Options: 'products' | 'resources' | 'discounts' | 'tracker'
  const [shopSubTab, setShopSubTab] = useState<'products' | 'resources' | 'discounts' | 'tracker'>('products');
  
  // Filtering & Interaction state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [productSearch, setProductSearch] = useState<string>('');
  const [resourceSearch, setResourceSearch] = useState<string>('');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Active Promo Code State
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoInput, setPromoInput] = useState<string>('');
  const [promoError, setPromoError] = useState<string>('');
  const [promoSuccess, setPromoSuccess] = useState<string>('');

  // Digital Resource Bookmarking
  const [bookmarkedResources, setBookmarkedResources] = useState<string[]>([]);
  // Resource Downloading Simulation State
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);

  // Simulated Logistics Active Tracker State
  const [simulatedOrders, setSimulatedOrders] = useState<SimulatedOrder[]>([
    {
      id: 'TVR-LOG-9082',
      date: 'June 01, 2026',
      items: [{ title: 'Sovereign Obsidian Pelvic Egg Set', qty: 1, price: '45000' }],
      total: '45,000',
      currency: 'NGN',
      shippingAddress: 'Lounge Seat Alpha, 14 Admiralty Way, Lekki Phase 1, Lagos',
      status: 'delivered',
      courierDetail: 'Delivered by Hand with Signature Rose Seal'
    },
    {
      id: 'TVR-LOG-9451',
      date: 'June 05, 2026',
      items: [
        { title: 'Empress Womb Warmth Herbal Infusion', qty: 2, price: '15000' },
        { title: 'Intimate pH Balance Silk Wash', qty: 1, price: '12000' }
      ],
      total: '35,700', // discounted NGN
      currency: 'NGN',
      shippingAddress: 'Plot 7, Banana Island Hub Gate, Lagos',
      status: 'dispatched',
      courierDetail: 'Express Courier Dispatch Node #L-4'
    }
  ]);

  // Toast indicator state
  const [toastMessage, setToastMessage] = useState<string>('');

  // Setup dynamic admin configuration (retrieve phone numbers for WhatsApp loops)
  const generalConfig = React.useMemo(() => {
    try {
      return JSON.parse(content.generalSettingsJson || '{}');
    } catch {
      return {};
    }
  }, [content.generalSettingsJson]);

  const whatsappPhone = generalConfig.whatsappPhone || "+234 813 546 4432";

  // Trigger brief alert notify
  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // 1. Curate and Merge multi-source product assets
  const parsedAdminProducts = React.useMemo(() => {
    try {
      if (content.productsListJson) {
        const parsed = JSON.parse(content.productsListJson);
        if (Array.isArray(parsed)) {
          return parsed.map((p: any) => ({
            ...p,
            category: p.category || 'womens_wellness',
            orderMethod: p.orderMethod || 'cart',
            id: p.id || `p-admin-${Math.random()}`
          }));
        }
      }
    } catch (e) {
      console.warn("Could not parse productsListJson in Member Shop", e);
    }
    return [];
  }, [content.productsListJson]);

  // Complete signature defaults
  const hardcodedCuratedProducts: ProductItem[] = [
    {
      id: 'p-womens-1',
      title: 'Divine Seed Somatic Womb Elixir',
      price: '38000',
      currency: 'NGN',
      description: 'High-purity botanical cellular extract capsules with star anise, wild yam, and shatavari to support menstrual-lunar equilibrium and womb lubrication cycles.',
      imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=400',
      category: 'womens_wellness',
      orderMethod: 'cart'
    },
    {
      id: 'p-herbal-1',
      title: 'Empress Womb Warmth Herbal Infusion',
      price: '15000',
      currency: 'NGN',
      description: 'A traditional restoration blend of red raspberry leaves, premium organic African mugwort, calendula flowers, and active nettle root designed for pelvic steaming compresses.',
      imageUrl: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=400',
      category: 'herbal_blends',
      orderMethod: 'whatsapp'
    },
    {
      id: 'p-intimate-1',
      title: 'Intimate pH Balance Silk Hygiene Wash',
      price: '12000',
      currency: 'NGN',
      description: 'Ultra-soothing, clinical-grade biological wash matching sensitive vaginal acidic index perfectly. Free from chemical parabens or synthetic fragrances.',
      imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=400',
      category: 'intimate_care',
      orderMethod: 'cart'
    },
    {
      id: 'p-pelvic-1',
      title: 'Sovereign Obsidian Pelvic Cleansing Egg Set',
      price: '45000',
      currency: 'NGN',
      description: 'Three hand-polished, ethically sourced volcanic obsidian pelvic eggs to optimize muscular alignment, strengthen localized tissue, and assist cellular tension release.',
      imageUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=400',
      category: 'pelvic_wellness',
      orderMethod: 'affiliate',
      externalLink: 'https://amazon.com/example-obsidian-eggs'
    },
    {
      id: 'p-lifestyle-1',
      title: 'Womb Alignment Silk Thermal Heat Wrap',
      price: '28000',
      currency: 'NGN',
      description: 'Tailored luxury belt woven with fine organic mulberry silk and thin copper filaments to assist in gentle heat circulation during your sacred bleed phase.',
      imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=400',
      category: 'lifestyle',
      orderMethod: 'cart'
    },
    {
      id: 'p-pelvic-2',
      title: 'Sacred Amethyst Botanical Steam Basin',
      price: '55000',
      currency: 'NGN',
      description: 'Anatomical hardwood chiropractic basin designed to securely anchor steaming procedures with custom therapeutic crystal alignments.',
      imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=400',
      category: 'pelvic_wellness',
      orderMethod: 'whatsapp'
    }
  ];

  // Merge backends with defaults, preventing duplication on custom IDs
  const combinedProductsList = React.useMemo(() => {
    const list = [...parsedAdminProducts];
    hardcodedCuratedProducts.forEach(fallback => {
      const exists = list.some(p => p.id === fallback.id || p.title.toLowerCase() === fallback.title.toLowerCase());
      if (!exists) {
        list.push(fallback);
      }
    });
    return list;
  }, [parsedAdminProducts]);

  // Promo code validation ledger
  const PROMO_CODES: PromoCode[] = [
    { code: 'COSMIC15', discount: 0.15, description: 'Standard Cardholder Discount (Active Globally)', badge: 'Active Member' },
    { code: 'WOMB20', discount: 0.20, description: 'Sisterhood Circle Promo (20% Off)', badge: 'Sister Circle' },
    { code: 'SOVEREIGN30', discount: 0.30, description: 'Mothers of the Soil Summit (30% Off)', badge: 'Grand Council' }
  ];

  // Active discount rate applied (Standard is 15% off)
  const currentDiscountRate = appliedPromo ? appliedPromo.discount : 0.15;

  // Handles putting items safely into checkout
  const handleAddToCart = (p: ProductItem) => {
    const originalPrice = parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0;
    // Calculate custom price according to current user's applied code
    const memberPrice = Math.round(originalPrice * (1 - currentDiscountRate));
    
    addToCart({
      id: p.id,
      title: `${p.title} (Member Promo)`,
      price: p.price, // Store original price, CartContext handles discount
      memberDiscountPrice: p.memberDiscountPrice,
      currency: p.currency || 'NGN',
      imageUrl: p.imageUrl || "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=300",
      isDigital: p.isDigital,
      downloadUrl: p.downloadUrl
    });

    setJustAddedId(p.id);
    setTimeout(() => setJustAddedId(null), 2500);
    showNotification(`🌸 Added "${p.title}" to secure cart. Rate validated!`);
  };

  const generateWhatsAppLink = (product: ProductItem) => {
    const originalPrice = parseFloat(String(product.price).replace(/[^0-9.]/g, '')) || 0;
    const discountedPrice = Math.round(originalPrice * (1 - currentDiscountRate));
    const phone = whatsappPhone.replace(/\s+/g, '').replace('+', '');
    const message = `Greetings Community Logistics, I am a certified member requesting to purchase: *${product.title}* via secure WhatsApp protocol at my privileged member price of ${product.currency} ${discountedPrice.toLocaleString()}.\n\nFormulation ID: [${product.id}]\nPlease confirm dispatch queues!`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  // Filter products list
  const filteredProducts = combinedProductsList.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesKeyword = p.title.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.description.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCategory && matchesKeyword;
  });

  // Digital resources database
  const DIGITAL_GUIDES: DigitalResource[] = [
    {
      id: 'dig-1',
      title: 'Sacred Cell Ovarian and Fertility Blueprint',
      category: 'fertility_guide',
      type: 'PDF Guidebook',
      size: '5.2 MB',
      description: 'Comprehensive guidelines linking biological cycles with traditional somatic extracts. Contains pelvic pH balancing index and daily alignment calendar guides.',
      author: 'Dr. FID (Community Founder)',
      downloads: 412
    },
    {
      id: 'dig-2',
      title: 'The Sacred Pelvis: Traditional Somatic Anatomy Manual',
      category: 'ebook',
      type: 'High-Res E-Book',
      size: '14.8 MB',
      description: 'An illustrated exploration outlining energetic channels, thermal release practices, and safe self-advocacy pelvic steaming guidelines.',
      author: 'Onyeaka Nkem (Traditional Somatic Specialist)',
      downloads: 871
    },
    {
      id: 'dig-3',
      title: 'Hormonal Stabilization & Estrogen Rhythm Toolkit',
      category: 'toolkit',
      type: 'ZIP Bundle (Sheets + Video Log)',
      size: '18.1 MB',
      description: 'Printable worksheets, botanical meal planning schedules, and localized estrogen optimization tracking coordinates designed by expert clinical consultants.',
      author: 'Dr. Audrey Finch (Senior OBGYN)',
      downloads: 304
    },
    {
      id: 'dig-4',
      title: 'Pelvic Trauma Release & Somatic Soundscapes',
      category: 'audio',
      type: 'Active HQ Audio MP3',
      size: '42.5 MB',
      description: 'Audio guidance using theta brain waves and vocal prompts designed to systematically melt tension stored inside pelvic floor tissue.',
      author: 'Chioma Judith & Vagina Room Sound Team',
      downloads: 1240
    },
    {
      id: 'dig-5',
      title: 'Cellular Restoration Somatic Workbook & Diagnostic Map',
      category: 'workbook',
      type: 'Interactive PDF Workbook',
      size: '3.6 MB',
      description: 'Symptom tracking charts, pelvic warmth logging matrices, and self-administered chiropractic diagnostics for daily recovery.',
      author: 'Aisha Umar & The Wellness Council',
      downloads: 98
    }
  ];

  // Filter digital resources
  const filteredResources = DIGITAL_GUIDES.filter(res => {
    const matchesKeyword = res.title.toLowerCase().includes(resourceSearch.toLowerCase()) || 
                          res.description.toLowerCase().includes(resourceSearch.toLowerCase()) ||
                          res.author.toLowerCase().includes(resourceSearch.toLowerCase());
    return matchesKeyword;
  });

  // Handle coupon redeeming
  const handleRedeemPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    
    const inputCleanStr = promoInput.trim().toUpperCase();
    if (!inputCleanStr) return;

    const matched = PROMO_CODES.find(codeObj => codeObj.code === inputCleanStr);
    if (matched) {
      setAppliedPromo(matched);
      setPromoSuccess(`🎉 Success! ${matched.code} activated. Exclusive ${matched.discount * 100}% discount registered across all boutique preparations.`);
      showNotification(`💎 Applied coupon ${matched.code}: ${matched.discount * 100}% Off VIP Privileges!`);
      setPromoInput('');
    } else {
      setPromoError('❌ Code not recorded in the sisterhood digital ledger. Try "WOMB20" or "SOVEREIGN30".');
    }
  };

  // Handle individual simulated downloads
  const handleSimulatedDownload = (resource: DigitalResource) => {
    if (downloadingId) return;

    setDownloadingId(resource.id);
    setDownloadProgress(0);

    const intvl = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(intvl);
          setTimeout(() => {
            setDownloadingId(null);
            setDownloadedIds(prevIds => [...prevIds, resource.id]);
            showNotification(`📥 Saved "${resource.title}" successfully to offline storage!`);
          }, 300);
          return 100;
        }
        return prev + 20; // fast step downloads
      });
    }, 150);
  };

  // Handle Bookmarks
  const toggleBookmark = (id: string, name: string) => {
    if (bookmarkedResources.includes(id)) {
      setBookmarkedResources(prev => prev.filter(bId => bId !== id));
      showNotification(`🗑️ Removed ${name} from your sacred bookmarks.`);
    } else {
      setBookmarkedResources(prev => [...prev, id]);
      showNotification(`🌟 Added ${name} to your vaulted bookmarks library!`);
    }
  };

  // Simulating Checkout directly in dashboard logistics tracker
  const handleSimulateCartCheckout = () => {
    if (cartItems.length === 0) return;

    const newOrderID = `TVR-LOG-${Math.floor(1000 + Math.random() * 9000)}`;
    const dateTodayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
    
    const newSimulatedOrder: SimulatedOrder = {
      id: newOrderID,
      date: dateTodayStr,
      items: cartItems.map(item => ({ title: item.title, qty: item.quantity, price: item.price })),
      total: totalPrice.toLocaleString(),
      currency: cartItems[0].currency,
      shippingAddress: 'My Saved Member Community Profile Residence Address',
      status: 'processing',
      courierDetail: 'Community dispatch is auditing secure seal packings...'
    };

    setSimulatedOrders(prev => [newSimulatedOrder, ...prev]);
    clearCart();
    setShopSubTab('tracker');
    showNotification(`🛍️ Invoice generated! Simulated order ${newOrderID} placed inside terminal tracking queues.`);
  };

  return (
    <div className="space-y-8 font-sans text-white text-left relative">
      
      {/* Toast Notifier */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-8 left-1/2 z-[100] bg-[#0c0a0a] border border-[#D4AF37] px-6 py-3.5 text-brand-gold font-mono text-[9px] uppercase tracking-widest font-bold flex items-center gap-2.5 shadow-2xl"
          >
            <Sparkles size={11} className="animate-spin text-[#D4AF37]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Welcome banner */}
      <div className="bg-gradient-to-br from-[#110f0f] via-zinc-950 to-[#070606] border border-white/5 rounded-none p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/[0.02] blur-3xl rounded-full" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <span className="text-[9px] font-mono text-brand-gold uppercase tracking-[0.3em] font-extrabold block">
                ⭐ Verified Community Apothecary
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-black uppercase text-white mt-1 leading-tight tracking-tight">
                🛍️ Certified Sovereign Shop
              </h2>
              <p className="text-xs text-white/50 max-w-xl font-light font-sans mt-1.5 leading-relaxed">
                Connect with natural uterine alignment products, expert digital fertility toolkits, and premium holistic accessories. Handcrafted, curated, and optimized.
              </p>
            </div>

            {/* Privilege status indicator */}
            <div className="bg-black/80 border border-[#D4AF37]/30 p-3 sm:px-4 shrink-0 font-mono text-[8.5px] uppercase tracking-widest text-[#D4AF37] text-left sm:text-right">
              <span className="text-white/40 block text-[7.5px] mb-0.5">CURRENT BENEFIT LEVEL</span>
              <p className="font-extrabold flex items-center gap-1.5">
                <Percent size={11} /> {Math.round(currentDiscountRate * 100)}% Core Saving Active
              </p>
              {appliedPromo && (
                <span className="text-[7px]_uppercase bg-[#D4AF37]/15 px-1.5 py-0.5 border border-[#D4AF37]/40 block text-center mt-1 text-white select-none">
                  🌟 CODE: {appliedPromo.code} VERIFIED
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions Shortcuts Bar */}
          <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2 text-xs font-mono font-bold uppercase tracking-widest">
            <span className="text-white/30 self-center text-[8.5px] tracking-wider pr-2">⚡ QUICK ACCESS:</span>
            
            <button
              onClick={() => {
                setShopSubTab('products');
                setSelectedCategory('all');
                showNotification("Displaying entire Wellness catalog");
              }}
              className={`px-3 py-1.5 border border-white/5 text-[8px] transition-all hover:border-[#D4AF37] ${
                shopSubTab === 'products' ? 'bg-[#D4AF37] text-black font-extrabold' : 'bg-black/60 text-white/70'
              }`}
            >
              Browse Shop
            </button>

            <button
              onClick={() => {
                setShopSubTab('discounts');
                showNotification("Apothecary discounts loaded");
              }}
              className={`px-3 py-1.5 border border-white/5 text-[8px] transition-all hover:border-[#D4AF37] ${
                shopSubTab === 'discounts' ? 'bg-[#D4AF37] text-black font-extrabold' : 'bg-black/60 text-white/70'
              }`}
            >
              Redeem Promo Code
            </button>

            <button
              onClick={() => {
                setShopSubTab('resources');
                showNotification("Digital resource vault ready");
              }}
              className={`px-3 py-1.5 border border-white/5 text-[8px] transition-all hover:border-[#D4AF37] ${
                shopSubTab === 'resources' ? 'bg-[#D4AF37] text-black font-extrabold' : 'bg-black/60 text-white/70'
              }`}
            >
              Download PDF Guides
            </button>

            <button
              onClick={() => {
                setShopSubTab('tracker');
                showNotification("Auditing logistic streams...");
              }}
              className={`px-3 py-1.5 border border-white/5 text-[8px] transition-all hover:border-[#D4AF37] ${
                shopSubTab === 'tracker' ? 'bg-[#D4AF37] text-black font-extrabold' : 'bg-black/60 text-white/70'
              }`}
            >
              Track Orders ({simulatedOrders.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Sub Navigation Bar */}
      <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar font-mono text-[9.5px] uppercase tracking-widest bg-white/[0.01] p-1">
        <button
          onClick={() => setShopSubTab('products')}
          className={`px-5 py-3 shrink-0 font-bold transition-all border-b-2 ${
            shopSubTab === 'products'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-white/[0.02]'
              : 'border-transparent text-white/50 hover:text-white hover:bg-white/[0.01]'
          }`}
        >
          🌿 Wellness Products
        </button>

        <button
          onClick={() => setShopSubTab('resources')}
          className={`px-5 py-3 shrink-0 font-bold transition-all border-b-2 ${
            shopSubTab === 'resources'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-white/[0.02]'
              : 'border-transparent text-white/50 hover:text-white hover:bg-white/[0.01]'
          }`}
        >
          📚 Digital Resources
        </button>

        <button
          onClick={() => setShopSubTab('discounts')}
          className={`px-5 py-3 shrink-0 font-bold transition-all border-b-2 ${
            shopSubTab === 'discounts'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-white/[0.02]'
              : 'border-transparent text-white/50 hover:text-white hover:bg-white/[0.01]'
          }`}
        >
          💎 Member Discounts & Redeeming
        </button>

        <button
          onClick={() => setShopSubTab('tracker')}
          className={`px-5 py-3 shrink-0 font-bold transition-all border-b-2 ${
            shopSubTab === 'tracker'
              ? 'border-[#D4AF37] text-[#D4AF37] bg-white/[0.02]'
              : 'border-transparent text-white/50 hover:text-white hover:bg-white/[0.01]'
          }`}
        >
          📦 Simulated Order Logistics
        </button>
      </div>

      {/* CONTENT BLOCK 1: UPCOMING GATHERINGS PRODUCTS */}
      {shopSubTab === 'products' && (
        <div className="space-y-6">
          {/* Filtering panels */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.01] p-4 border border-white/5">
            {/* Categories list */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Curations' },
                { id: 'womens_wellness', label: "Women's Wellness" },
                { id: 'herbal_blends', label: 'Herbal Blends' },
                { id: 'intimate_care', label: 'Intimate Care' },
                { id: 'pelvic_wellness', label: 'Pelvic Wellness' },
                { id: 'lifestyle', label: 'Lifestyle Support' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    showNotification(`Filter Category: ${cat.label}`);
                  }}
                  className={`px-3 py-1.5 font-mono text-[8.5px] uppercase tracking-wider transition-all border ${
                    selectedCategory === cat.id
                      ? 'bg-[#D4AF37] border-[#D4AF37] text-black font-extrabold'
                      : 'bg-black/40 border-white/5 text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Keyword Search */}
            <div className="relative w-full md:w-64 shrink-0">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search formulations..."
                className="w-full bg-black/80 border border-white/10 focus:border-[#D4AF37] p-2 pl-8 font-mono text-[10px] text-white outline-none rounded-none"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" size={11} />
              {productSearch && (
                <button 
                  onClick={() => setProductSearch('')} 
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>

          {/* Grid listing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center border border-dashed border-white/10 font-mono text-white/45 uppercase text-[9.5px]">
                No preparations matched your dynamic tracking strings.
              </div>
            ) : (
              filteredProducts.map((p, idx) => {
                const originalVal = parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0;
                // Calculate discounted rate based on current unlocked level
                const discountedVal = Math.round(originalVal * (1 - currentDiscountRate));
                const isJustAdded = justAddedId === p.id;

                const isCartMode = !p.orderMethod || p.orderMethod === 'cart';
                const isAffiliateMode = p.orderMethod === 'affiliate' || (!!p.externalLink);
                const isWhatsAppMode = p.orderMethod === 'whatsapp';

                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-[#110f0f] border border-white/5 hover:border-[#D4AF37]/35 rounded-none p-4 flex flex-col justify-between transition-all duration-300 group relative"
                  >
                    {/* Visual Badges */}
                    <div className="absolute top-6 left-6 z-20 flex gap-1 font-mono text-[7px] uppercase tracking-widest font-black">
                      <span className="bg-black/90 text-brand-gold border border-brand-gold/30 px-2 py-0.5 rounded-sm">
                        {p.category.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Image Frame */}
                      <div className="aspect-square bg-zinc-950 rounded-none overflow-hidden relative border border-white/5">
                        <img
                          src={p.imageUrl || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=300'}
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60" />
                        
                        {/* Member Savings Circle */}
                        <div className="absolute top-2 right-2 p-1 px-1.5 bg-brand-gold text-black text-[7.5px] font-mono font-bold tracking-wider select-none shadow">
                          -{Math.round(currentDiscountRate * 100)}% ACTIVE
                        </div>
                      </div>

                      {/* Info Structure */}
                      <div className="text-left space-y-1.5 pb-2">
                        <h4 className="text-[14px] font-sans font-black uppercase text-white group-hover:text-brand-gold transition-colors leading-tight line-clamp-1">
                          {p.title}
                        </h4>
                        <p className="text-[10.5px] text-white/50 leading-relaxed font-sans font-light h-14 overflow-hidden line-clamp-3 select-none">
                          {p.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer buy actions */}
                    <div className="pt-3 border-t border-white/5 space-y-3 mt-2 text-xs">
                      <div className="flex justify-between items-baseline font-mono text-[9px]">
                        <span className="text-white/30 uppercase tracking-widest">
                          {isAffiliateMode ? "Affiliate Item" : isWhatsAppMode ? "Social Order" : "Boutique Item"}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white/40 line-through">
                             {p.currency === "NGN" ? "₦" : p.currency === "USD" ? "$" : `${p.currency} `}
                             {originalVal.toLocaleString()}
                          </span>
                          <span className="text-brand-gold font-bold text-[13px]">
                             {p.currency === "NGN" ? "₦" : p.currency === "USD" ? "$" : `${p.currency} `}
                             {discountedVal.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Interactive Button Routing depending on Order Method */}
                      {isCartMode && (
                        <button
                          type="button"
                          onClick={() => handleAddToCart(p)}
                          disabled={isJustAdded}
                          className={`w-full py-2.5 text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
                            isJustAdded
                              ? 'bg-emerald-500 text-white cursor-default'
                              : 'bg-white/5 hover:bg-brand-gold hover:text-brand-black text-white'
                          }`}
                        >
                          {isJustAdded ? (
                            <>
                              <Check size={11} strokeWidth={3} /> Rate Applied & Stored
                            </>
                          ) : (
                            <>
                              <ShoppingCart size={11} /> Add to Personal Basket
                            </>
                          )}
                        </button>
                      )}

                      {isAffiliateMode && (
                        <a
                          href={p.externalLink || 'https://amazon.com'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 text-[9px] font-black uppercase tracking-widest bg-zinc-900 border border-white/10 hover:border-brand-gold hover:text-brand-gold text-white text-center flex items-center justify-center gap-1.5 transition-all"
                        >
                          <span>Direct Marketplace Buy</span>
                          <ExternalLink size={10} />
                        </a>
                      )}

                      {isWhatsAppMode && (
                        <a
                          href={generateWhatsAppLink(p)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 text-[9px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white text-center flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-500/10 font-bold"
                        >
                          <span>Secure WhatsApp Order</span>
                          <MessageSquare size={10} />
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* CONTENT BLOCK 2: DIGITAL RESOURCES VAULT */}
      {shopSubTab === 'resources' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border border-white/5 p-6 rounded-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="text-left space-y-1">
              <span className="text-[8px] font-mono text-brand-gold uppercase tracking-widest block">📚 Instant Integration Downloads</span>
              <h3 className="text-md font-black uppercase tracking-tight text-white font-sans">
                Digital Somatic Library
              </h3>
              <p className="text-xs text-white/50 font-light font-sans max-w-lg leading-relaxed">
                As a registered community member, you have total access to expert fertility eBooks, soundscapes for releasing somatic tension, and cycle trackers.
              </p>
            </div>

            {/* Resources search */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                placeholder="Search guidebooks, audio..."
                className="w-full bg-black/80 border border-white/10 focus:border-[#D4AF37] p-2 pl-8 font-mono text-[10px] text-white outline-none rounded-none"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" size={11} />
              {resourceSearch && (
                <button 
                  onClick={() => setResourceSearch('')} 
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>

          {/* Resources listing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResources.map((res) => {
              const bookmarkOn = bookmarkedResources.includes(res.id);
              const hasDownloaded = downloadedIds.includes(res.id);
              const isThisDownloading = downloadingId === res.id;

              return (
                <div
                  key={res.id}
                  className="bg-[#110f0f] border border-white/5 hover:border-white/10 p-5 rounded-none flex flex-col justify-between text-left space-y-4 group relative overflow-hidden transition-all duration-300"
                >
                  {/* Subtle watermarks and book icon */}
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      <span className="p-2 bg-white/5 rounded-none border border-white/5 text-brand-gold self-start shrink-0">
                        {res.category === 'audio' ? <Volume2 size={16} /> : <BookOpen size={16} />}
                      </span>
                      <div>
                        <span className="text-[7.5px] font-mono uppercase bg-white/5 px-2 py-0.5 border border-white/10 text-white/70 block w-fit">
                          {res.type}
                        </span>
                        <h4 className="text-[13.5px] font-sans font-black uppercase text-white mt-1 group-hover:text-brand-gold transition-colors leading-tight">
                          {res.title}
                        </h4>
                      </div>
                    </div>

                    {/* Bookmark action trigger */}
                    <button
                      type="button"
                      onClick={() => toggleBookmark(res.id, res.title)}
                      className="p-1.5 bg-black/60 border border-white/5 hover:border-brand-gold text-white/50 hover:text-brand-gold transition-colors"
                      title="Sovereign Bookmark"
                    >
                      <Bookmark size={12} className={bookmarkOn ? "fill-[#D4AF37] text-[#D4AF37]" : ""} />
                    </button>
                  </div>

                  {/* Guide description */}
                  <div className="space-y-1.5 select-none">
                    <p className="text-[11px] text-white/60 leading-relaxed font-sans font-light">
                      {res.description}
                    </p>
                    <div className="flex items-center gap-3 text-[8.5px] font-mono uppercase text-white/30 pt-1">
                      <span>Curated: {res.author}</span>
                      <span>•</span>
                      <span>Size: {res.size}</span>
                    </div>
                  </div>

                  {/* Simulator action downloader */}
                  <div className="pt-3 border-t border-white/5">
                    {isThisDownloading ? (
                      /* Active progress indicators */
                      <div className="space-y-2 font-mono text-[9px]">
                        <div className="flex justify-between items-center text-brand-gold font-bold">
                          <span>CONNECTING SECURE CRYPTO SHALA CHANNEL...</span>
                          <span>{downloadProgress}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1 relative rounded-none overflow-hidden">
                          <motion.div 
                            className="bg-[#D4AF37] h-full"
                            style={{ width: `${downloadProgress}%` }}
                            transition={{ ease: "easeInOut" }}
                          />
                        </div>
                      </div>
                    ) : (
                      /* standard triggers */
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-[8.5px] font-mono text-white/30 uppercase lowercase">
                          Saved globally: {res.downloads + (hasDownloaded ? 1 : 0)} members
                        </span>

                        <button
                          type="button"
                          onClick={() => handleSimulatedDownload(res)}
                          className={`px-4 py-2 text-[8.5px] font-mono font-black uppercase tracking-widest flex items-center gap-1.5 border transition-all ${
                            hasDownloaded
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-black/60 hover:bg-brand-gold border-[#D4AF37]/45 hover:border-brand-gold text-[#D4AF37] hover:text-black'
                          }`}
                        >
                          <Download size={11} />
                          <span>{hasDownloaded ? 'DOWNLOAD AGAIN ✓' : 'DOWNLOAD (FREE PASS)'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENT BLOCK 3: DISCOUNTS & PROMO CODES HUB */}
      {shopSubTab === 'discounts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side Coupon redeemer */}
            <div className="lg:col-span-1 bg-[#110f0f] border border-white/5 p-6 rounded-none text-left space-y-4">
              <div className="space-y-1">
                <span className="text-[8px] font-mono text-[#D4AF37] uppercase tracking-widest block">💳 Ledger Code Sync</span>
                <h3 className="text-md font-black uppercase text-white font-sans tracking-wide">
                  Redeem Discount Voucher
                </h3>
                <p className="text-xs text-white/50 font-sans font-light leading-relaxed">
                  Enter any seasonal or community-issued campaign pass to unlock supplementary checkout rates on our pharmacy and wellness catalogue.
                </p>
              </div>

              {/* Functional Redeemer Frame */}
              <form onSubmit={handleRedeemPromo} className="space-y-3 pt-2">
                <div>
                  <label className="text-[9px] font-mono text-white/40 block uppercase tracking-wide mb-1">
                    APOTHECARY ACCESS CODE
                  </label>
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="e.g. WOMB20"
                    className="w-full bg-black border border-white/10 hover:border-white/20 focus:border-[#D4AF37] p-2.5 font-mono text-xs uppercase text-white tracking-widest outline-none rounded-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#D4AF37] hover:bg-white text-black font-mono text-[9px] uppercase tracking-widest font-black transition-all"
                >
                  VALIDATE DISPATCH PASS
                </button>
              </form>

              {/* Status responses rendering space */}
              {promoError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 font-mono text-[8.5px] uppercase tracking-wide select-none leading-relaxed">
                  {promoError}
                </div>
              )}

              {promoSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[8.5px] uppercase tracking-wide select-none leading-relaxed">
                  {promoSuccess}
                </div>
              )}
            </div>

            {/* Right side Active coupon listings */}
            <div className="lg:col-span-2 space-y-4">
              <div className="text-left">
                <h4 className="text-sm font-black uppercase text-white font-sans tracking-wide">
                  🏷️ Active Sisterhood Promotions
                </h4>
                <p className="text-[10px] text-white/45 font-mono">
                  Standard passes allocated in the current botanical cycle for verified card-holders.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PROMO_CODES.map((codeObj, index) => {
                  const isCurActive = appliedPromo?.code === codeObj.code || (!appliedPromo && codeObj.code === 'COSMIC15');
                  
                  return (
                    <div
                      key={codeObj.code}
                      onClick={() => {
                        setPromoInput(codeObj.code);
                        showNotification(`Entered ${codeObj.code} code. Ready for validation.`);
                      }}
                      className={`p-4 border text-left flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                        isCurActive
                          ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white'
                          : 'bg-white/[0.01] border-white/5 hover:border-white/15 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[8px] font-mono text-[#D4AF37] uppercase tracking-wider block font-bold">
                            {codeObj.badge.toUpperCase()}
                          </span>
                          <span className="text-sm font-mono font-black text-white tracking-widest">
                            {codeObj.code}
                          </span>
                        </div>
                        <span className="text-right text-[#D4AF37] font-mono font-black text-lg">
                          -{codeObj.discount * 100}%
                        </span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-white/50 leading-relaxed font-sans font-light">
                          {codeObj.description}
                        </p>
                        
                        {isCurActive ? (
                          <span className="text-[8px] font-mono uppercase text-emerald-400 font-bold tracking-widest flex items-center gap-1">
                            <CheckCircle2 size={10} /> CURRENT ACTIVE ACCOUNT RATE
                          </span>
                        ) : (
                          <span className="text-[7.5px] font-mono uppercase text-white/30 group-hover:text-white transition-colors">
                            Click to auto-apply →
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bonus Savings Note */}
              <div className="p-4 bg-zinc-950 border border-white/5 text-xs font-sans text-left leading-relaxed flex gap-3">
                <Info size={16} className="text-[#D4AF37] self-start shrink-0" />
                <div className="space-y-1">
                  <p className="font-bold text-white uppercase text-[10px] font-mono tracking-widest">Apothecary Pricing Mechanics</p>
                  <p className="text-white/40 text-[10.5px]">
                    Members enjoy an absolute premium rate of minimum 15% discount. Redeeming a grand campaign pass upgrades your status rate instantly, which updates cart items automatically.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* CONTENT BLOCK 4: SIMULATED SHALAS LOGISTICS TRACKER */}
      {shopSubTab === 'tracker' && (
        <div className="space-y-6">
          <div className="text-left border-b border-white/5 pb-4">
            <h3 className="text-md font-serif font-black uppercase tracking-wide text-white flex items-center gap-2">
              <Truck size={16} className="text-brand-gold" /> Sovereign Shipments & Dispatch Logistics
            </h3>
            <p className="text-xs text-white/50 font-light mt-0.5">
              Review and live-track active order coordinates processed through our main Lekki Central Apothecary dispatch nodes.
            </p>
          </div>

          <div className="space-y-6">
            {simulatedOrders.map((order, idx) => {
              const stages = ['processing', 'assembling', 'dispatched', 'delivered'];
              const currentStageIdx = stages.indexOf(order.status);

              return (
                <div
                  key={order.id}
                  className="bg-[#110f0f] border border-white/5 p-6 rounded-none text-left space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3 font-mono text-[10px]">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="bg-white/5 border border-white/10 text-white font-extrabold px-2.5 py-1">
                        📦 LEDGER CODE: {order.id}
                      </span>
                      <span className="text-white/40">Planted: {order.date}</span>
                    </div>

                    <div className="font-bold">
                      <span className="text-white/40">INVOICED TOTAL: </span>
                      <span className="text-[#D4AF37]">
                        {order.currency === "NGN" ? "₦" : order.currency === "USD" ? "$" : `${order.currency} `}
                        {order.total}
                      </span>
                    </div>
                  </div>

                  {/* Shipment Products List */}
                  <div className="space-y-2 select-none">
                    <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest block">PACKAGED CODES</span>
                    {order.items.map((it, i) => (
                      <div key={i} className="flex justify-between text-xs text-white/80">
                        <span>• {it.title} <span className="text-white/30 font-mono">x {it.qty}</span></span>
                        <span className="font-mono text-white/50">
                          {order.currency === "NGN" ? "₦" : order.currency === "USD" ? "$" : `${order.currency} `}
                          {(parseFloat(it.price) * it.qty).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Active Visual Stepper indicator */}
                  <div className="grid grid-cols-4 gap-2 relative pt-2">
                    {/* Stepper connected pipe */}
                    <div className="absolute top-[21px] left-8 right-8 h-0.5 bg-white/5 z-0" />
                    
                    {stages.map((stg, sIdx) => {
                      const isCompleted = sIdx <= currentStageIdx;
                      const isCurrent = sIdx === currentStageIdx;

                      return (
                        <div key={stg} className="text-center z-10 relative space-y-2">
                          <span className={`mx-auto w-7 h-7 rounded-full flex items-center justify-center font-mono text-[9px] font-bold border transition-colors ${
                            isCurrent
                              ? 'bg-brand-black border-[#D4AF37] text-brand-gold ring-4 ring-[#D4AF37]/15'
                              : isCompleted
                              ? 'bg-brand-gold border-brand-gold text-black'
                              : 'bg-zinc-950 border-white/10 text-white/20'
                          }`}>
                            {isCompleted ? '✓' : sIdx + 1}
                          </span>
                          
                          <p className={`text-[8.5px] font-mono uppercase tracking-wider block font-black ${
                            isCurrent ? 'text-brand-gold font-bold' : isCompleted ? 'text-white/80' : 'text-white/30'
                          }`}>
                            {stg}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tracking Log detailed coordinates */}
                  <div className="p-3 bg-black/60 border border-white/5 font-mono text-[9px] uppercase tracking-wide text-white/60 space-y-1 leading-relaxed">
                    <div>
                      <span className="text-white/30">LATEST COURIER DISPATCH TELEMETRY: </span>
                      <span className="text-white font-bold">{order.courierDetail}</span>
                    </div>
                    <div>
                      <span className="text-white/30">DELIVERY DISPATCH REGION: </span>
                      <span className="text-white/80">{order.shippingAddress}</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cart Active Checker / Checkout Simulator Drawer */}
      {cartItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 sm:p-6 bg-gradient-to-r from-zinc-950 via-[#131111] to-black border-2 border-brand-gold/30 rounded-none flex flex-col md:flex-row items-center justify-between gap-5 shadow-2xl relative"
        >
          <div className="flex items-center gap-3 text-left">
            <span className="p-2.5 bg-[#D4AF37]/15 border border-[#D4AF37]/45 text-brand-gold shrink-0">
              <ShoppingBag size={18} />
            </span>
            <div className="space-y-0.5">
              <h4 className="text-[12.5px] font-mono text-brand-gold uppercase font-black tracking-wide">
                Active Apothecary Basket ({cartItems.reduce((acc, it) => acc + it.quantity, 0)} Items queued)
              </h4>
              <p className="text-[10px] text-white/50 font-sans font-light leading-relaxed">
                Unlock safe courier delivery to your personal community coordinates. Exclusive member savings rate verified!
              </p>
              <div className="font-mono text-[10.5px] font-bold text-white pt-1">
                INVOICE VALUE: <span className="text-brand-gold">{cartItems[0]?.currency || '₦'} {totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0 font-mono text-[9px] uppercase tracking-widest font-black">
            
            <button
               onClick={() => {
                 clearCart();
                 showNotification("🗑️ Cleared queue basket.");
               }}
               className="px-4 py-2.5 border border-white/5 hover:border-red-500/50 text-white/55 hover:text-red-400 bg-black/40 transition-colors"
            >
              Clear Cart
            </button>

            <button
              onClick={handleSimulateCartCheckout}
              className="flex-1 md:flex-none bg-[#D4AF37] hover:bg-white text-black px-6 py-2.5 font-bold transition-all"
            >
              Simulate Secure Checkout Order
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
}
