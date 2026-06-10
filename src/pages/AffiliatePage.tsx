import React, { useState } from 'react';
import { useContent } from '../context/ContentContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { 
  ArrowRight, 
  Coins, 
  Globe, 
  TrendingUp, 
  GraduationCap, 
  ArrowUpRight, 
  ChevronDown,
  DollarSign,
  Users,
  Target,
  Sparkles,
  Award,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function AffiliatePage() {
  const { content } = useContent();

  // Currency configuration state (Default on Naira (₦))
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');

  // Slider States for Earning Potential Calculator
  const [goldCount, setGoldCount] = useState(15);
  const [diamondCount, setDiamondCount] = useState(8);

  // FAQ Expand/Collapse active indices
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Calculate active pricing metrics based on content settings (with fallbacks)
  const goldPrice = currency === 'NGN' 
    ? parseFloat(content.membershipPriceGoldNGN || "25000") 
    : parseFloat(content.membershipPriceGoldUSD || "45");
  const goldCommission = goldPrice * 0.20;
  const diamondPrice = currency === 'NGN' 
    ? parseFloat(content.membershipPriceDiamondNGN || "85000") 
    : parseFloat(content.membershipPriceDiamondUSD || "150");
  const diamondCommission = diamondPrice * 0.20;
  const currencySymbol = currency === 'NGN' ? '₦' : '$';

  // Calculate earnings
  const goldAnnualEarnings = goldCount * goldCommission * 4; // gold is renewed 4 times a year
  const diamondAnnualEarnings = diamondCount * diamondCommission; // diamond is renewed once a year
  const totalAnnualEarnings = goldAnnualEarnings + diamondAnnualEarnings;
  const equivalentMonthlyEarnings = Math.round(totalAnnualEarnings / 12);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const whyPartnerBenefits = [
    {
      icon: <Coins className="w-6 h-6 text-brand-gold" />,
      title: "Recurring Commissions",
      desc: "Earn ongoing income from every active subscriber you refer. Build regular passive commission structures."
    },
    {
      icon: <Globe className="w-6 h-6 text-brand-gold" />,
      title: "Purpose-Driven Impact",
      desc: "Help women gain access to reproductive wellness education, clinical tips, and essential health advocacy."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-brand-gold" />,
      title: "Scalable Income Potential",
      desc: "Build a robust, long-term income stream with every referral that stays subscribed. No earnings ceiling."
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-brand-gold" />,
      title: "Exclusive Affiliate Access",
      desc: "Get early updates, pre-launch campaign files, digital templates, and private promotional assistance."
    }
  ];

  const clientTypes = [
    { title: "Wellness advocates", desc: "Passionate about natural health and holistic support." },
    { title: "Content creators", desc: "Writers, podcasters, and filmmakers educating their networks." },
    { title: "Community leaders", desc: "Leading active, supportive spaces for women's development." },
    { title: "Health educators", desc: "Midwives, therapists, doulas, and practitioners of restore medicine." },
    { title: "Social media influencers", desc: "Spreading vital body positivity and reproductive science." },
    { title: "Entrepreneurs", desc: "Building sustainable, ethical passive income models." }
  ];

  const marketSupportMaterials = [
    { name: "Ready-to-use promotional content", details: "Proven, expert-written copywriting text for your posts." },
    { name: "Social media templates", details: "Striking Obsidian & Gold branded images and story presets." },
    { name: "Campaign messaging", details: "Ready-to-send messages tailor-made for WhatsApp and email." },
    { name: "Affiliate dashboard tracking", details: "Real-time statistics to audit your referrals, clicks, and payouts." }
  ];

  const faqs = [
    {
      question: "How do I get paid?",
      answer: "Commissions are tracked automatically using your unique cookie-tracked link when your referrals subscribe. Payouts are audited and cleared based on active subscriptions."
    },
    {
      question: "Do I need experience?",
      answer: "No experience is required. Anyone can join, copy their link, and start sharing with colleagues, friends, or digital communities."
    },
    {
      question: "Is there a limit to earnings?",
      answer: "Absolutely no limit. Your income grows in direct correlation with the number of active subscribers you maintain."
    },
    {
      question: "Which subscription plans translate to commissions?",
      answer: `Both the Gold Plan (renewed quarterly) and Diamond Plan (renewed annually) yield a 20% recurring commission. With the current website pricing, this translates to ${currencySymbol}${goldCommission.toLocaleString()} ${currency} per billing cycle for each Gold referral and ${currencySymbol}${diamondCommission.toLocaleString()} ${currency} for each Diamond referral, for as long as they stay subscribed.`
    }
  ];

  return (
    <div className="bg-brand-black text-white min-h-screen pt-24 font-sans selection:bg-brand-gold selection:text-brand-black w-full overflow-x-hidden">
      <SEO 
        title="Join Our Affiliate Program | The Vagina Room" 
        description="Empower women, promote holistic wellness, and earn recurring income while doing meaningful work. Join a global movement that rewards you." 
      />
      <Navigation />

      {/* Hero Header */}
      <section className="relative pt-20 pb-28 px-6 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 via-transparent to-transparent opacity-60"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-mono text-brand-gold uppercase tracking-[0.3em] font-extrabold mb-6 block"
          >
            PROGRAM INFORMATION
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-sans font-black tracking-tighter uppercase leading-[0.9] text-white"
          >
            Join Our <span className="text-brand-gold font-serif italic">Affiliate</span> Program
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-sm md:text-base text-white/70 font-light max-w-2xl mx-auto leading-relaxed"
          >
            Empower women, promote holistic wellness, and earn recurring income while doing meaningful work. 
            Become part of a growing movement that rewards you for spreading awareness and helping women access transformative wellness education.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex justify-center"
          >
            <Link 
              to="/register" 
              className="group bg-brand-gold text-brand-black px-10 py-5 text-xs font-black tracking-[0.25em] uppercase hover:bg-white hover:text-brand-black transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-brand-gold/20"
              id="hero_affiliate_cta_btn"
            >
              Become an Affiliate 
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Partner Grid */}
      <section className="py-24 px-6 border-b border-white/5 relative bg-zinc-950/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-2">
            <span className="text-[10px] font-mono text-brand-gold uppercase tracking-[0.25em] font-extrabold block">GLOBAL ALIGNMENT</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white uppercase tracking-tight">
              Why Partner With Us?
            </h2>
            <div className="w-12 h-[1px] bg-brand-gold/30 mx-auto mt-4"></div>
            <p className="mt-4 text-xs md:text-sm text-white/50 max-w-2xl mx-auto uppercase tracking-wider font-mono">
              As an affiliate, you don’t just earn — you contribute to a global wellness movement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyPartnerBenefits.map((benefit, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -6, borderColor: "rgba(212, 175, 55, 0.35)" }}
                className="p-8 bg-zinc-950/80 border border-white/5 hover:border-brand-gold/25 transition-all duration-300 group rounded-none"
              >
                <div className="w-12 h-12 rounded-none bg-brand-gold/5 border border-brand-gold/20 flex items-center justify-center text-brand-gold mb-6 group-hover:bg-brand-gold group-hover:text-brand-black transition-all duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 font-sans group-hover:text-brand-gold transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Structure Plans */}
      <section className="py-24 px-6 border-b border-white/5 bg-gradient-to-b from-transparent to-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-2">
            <span className="text-[10px] font-mono text-brand-gold uppercase tracking-[0.25em] font-extrabold block">PREDICTABLE PASSIVE FLOW</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white uppercase tracking-tight">
              💸 Commission Structure
            </h2>
            <p className="mt-4 text-xs md:text-sm text-white/50 font-mono uppercase tracking-widest leading-relaxed">
              Earn Recurring Income for Every Active Member You Refer.<br/>
              <span className="text-brand-gold">You earn commissions as long as your referrals remain subscribed.</span>
            </p>
          </div>

          {/* Currency Switcher Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-zinc-950 border border-white/10 p-1 flex items-center space-x-1 rounded-none">
              <button
                onClick={() => setCurrency('NGN')}
                className={`px-5 py-2 text-[10px] uppercase font-mono tracking-widest transition-all duration-300 cursor-pointer ${
                  currency === 'NGN'
                    ? 'bg-brand-gold text-brand-black font-black font-bold'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                🇳🇬 Naira (₦)
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-5 py-2 text-[10px] uppercase font-mono tracking-widest transition-all duration-300 cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-brand-gold text-brand-black font-black font-bold'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                🇺🇸 Dollar ($)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Gold Plan Card */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="relative p-8 md:p-10 bg-zinc-950 border border-white/10 hover:border-brand-gold/30 transition-all rounded-none flex flex-col justify-between overflow-hidden group"
            >
              <div className="absolute top-0 right-0 py-1.5 px-4 bg-yellow-500/10 text-yellow-400 border-l border-b border-white/10 text-[9px] font-mono uppercase font-black tracking-widest">
                3-Month Interval
              </div>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">🟡</span>
                  <div>
                    <h3 className="text-lg font-black uppercase text-white tracking-widest font-sans">
                      GOLD PLAN
                    </h3>
                    <p className="text-[9px] text-white/40 uppercase font-mono mt-0.5">3-Month Membership Subscription</p>
                  </div>
                </div>

                <div className="py-6 border-y border-white/5 my-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold font-serif text-brand-gold">20%</span>
                    <span className="text-xs text-white/60 font-mono uppercase tracking-wider">Recurring Commission</span>
                  </div>
                  <p className="text-xs text-white/40 font-mono mt-2 uppercase">Worth {currencySymbol}{goldCommission.toLocaleString()} {currency} every billing cycle</p>
                </div>

                <ul className="space-y-3.5 text-xs text-white/60 font-light mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-brand-gold shrink-0" />
                    <span>Paid on every renewal cycle for active subscribers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-brand-gold shrink-0" />
                    <span>Short-term commitment for higher initial conversion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-brand-gold shrink-0" />
                    <span>Continuous automated cookie referral tracking</span>
                  </li>
                </ul>
              </div>
              
              <Link 
                to="/register" 
                className="w-full text-center py-3.5 border border-white/10 hover:bg-brand-gold hover:text-brand-black hover:border-brand-gold bg-white/5 uppercase font-mono font-black tracking-widest text-[10px] transition-all"
              >
                Promote Gold Plan
              </Link>
            </motion.div>

            {/* Diamond Plan Card */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="relative p-8 md:p-10 bg-zinc-950 border border-brand-gold/20 hover:border-brand-gold/50 transition-all rounded-none flex flex-col justify-between overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 py-1.5 px-4 bg-brand-gold/15 text-brand-gold border-l border-b border-brand-gold/20 text-[9px] font-mono uppercase font-black tracking-widest">
                Highest Lifetime Value
              </div>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">💎</span>
                  <div>
                    <h3 className="text-lg font-black uppercase text-white tracking-widest font-sans">
                      DIAMOND PLAN
                    </h3>
                    <p className="text-[9px] text-brand-gold uppercase font-mono mt-0.5">1-Year Premium Subscription</p>
                  </div>
                </div>

                <div className="py-6 border-y border-white/5 my-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold font-serif text-brand-gold">20%</span>
                    <span className="text-xs text-white/60 font-mono uppercase tracking-wider">Recurring Commission</span>
                  </div>
                  <p className="text-xs text-brand-gold/60 font-mono mt-2 uppercase">Worth {currencySymbol}{diamondCommission.toLocaleString()} {currency} every billing cycle</p>
                </div>

                <ul className="space-y-3.5 text-xs text-white/60 font-light mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-brand-gold shrink-0" />
                    <span>Higher lifetime commission value per single referral</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-brand-gold shrink-0" />
                    <span>Best for establishing deep, stable passive revenue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-brand-gold shrink-0" />
                    <span>Annual subscription keeps subscribers highly engaged</span>
                  </li>
                </ul>
              </div>

              <Link 
                to="/register" 
                className="w-full text-center py-3.5 bg-brand-gold text-brand-black hover:bg-white hover:text-brand-black uppercase font-mono font-black tracking-widest text-[10px] transition-all"
              >
                Promote Diamond Plan
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ESTIMATED EARNINGS CALCULATOR */}
      <section className="py-24 px-6 border-b border-white/5 bg-brand-black relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-gold/5 via-transparent to-transparent opacity-50 pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-2">
            <span className="text-[10px] font-mono text-brand-gold uppercase tracking-[0.25em] font-extrabold block">INTERACTIVE EARNING ESTIMATOR</span>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-white uppercase tracking-tight">
              📈 Your Earning Potential
            </h2>
            <p className="mt-4 text-xs md:text-sm text-white/50 max-w-2xl mx-auto uppercase tracking-wide leading-relaxed font-mono">
              The more active members you refer, the more predictable your recurring income becomes.<br />
              <span className="text-brand-gold">No limits on total earnings. Experiment with the sliders below!</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4">
            {/* Slider Column */}
            <div className="lg:col-span-7 bg-zinc-950 border border-white/10 p-8 flex flex-col justify-between space-y-8 rounded-none">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-gold mb-8 font-sans">
                  Referral Accumulation Meters
                </h3>

                {/* Slider 1: Gold Plan */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-sans font-bold uppercase text-white/80 block">
                      🟡 Gold Plan Referrals (Active)
                    </span>
                    <span className="font-mono text-brand-gold font-bold bg-brand-gold/15 px-2.5 py-1 text-[11px] rounded">
                      {goldCount} members
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="150"
                    value={goldCount}
                    onChange={(e) => setGoldCount(parseInt(e.target.value))}
                    className="w-full accent-brand-gold bg-white/10 h-1 cursor-ew-resize focus:outline-none"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-white/30 uppercase">
                    <span>0 members</span>
                    <span>150 members</span>
                  </div>
                </div>

                {/* Slider 2: Diamond Plan */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-sans font-bold uppercase text-white/80 block">
                      💎 Diamond Plan Referrals (Active)
                    </span>
                    <span className="font-mono text-brand-gold font-bold bg-brand-gold/15 px-2.5 py-1 text-[11px] rounded">
                      {diamondCount} members
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={diamondCount}
                    onChange={(e) => setDiamondCount(parseInt(e.target.value))}
                    className="w-full accent-brand-gold bg-white/10 h-1 cursor-ew-resize focus:outline-none"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-white/30 uppercase">
                    <span>0 members</span>
                    <span>100 members</span>
                  </div>
                </div>
              </div>

              {/* Live Formula Note */}
              <div className="p-4 bg-white/[0.02] border-l-2 border-brand-gold text-[10px] text-white/40 leading-relaxed font-mono uppercase">
                * COMMISSION META: 20% commission on {currencySymbol}{goldPrice.toLocaleString()} Gold (renewed quarterly = {currencySymbol}{goldCommission.toLocaleString()} recurring × 4 cycles/year) and {currencySymbol}{diamondPrice.toLocaleString()} Diamond (renewed annually = {currencySymbol}{diamondCommission.toLocaleString()} recurring).
              </div>
            </div>

            {/* Results Output Card */}
            <div className="lg:col-span-5 bg-brand-gold text-brand-black p-8 md:p-10 flex flex-col justify-between text-center lg:text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 font-serif font-black text-9xl pointer-events-none -mr-10 -mt-10">
                {currencySymbol}
              </div>

              <div className="relative z-10">
                <span className="text-[9px] font-mono font-black uppercase tracking-[0.25em] text-brand-black/55 block">ESTIMATED REVENUE</span>
                
                {/* Specific Breakdown Panel for 1, 2, 3 members or any count */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 mb-6 bg-brand-black/5 p-4 border border-brand-black/10 rounded-none text-left">
                  <div className="text-left sm:border-r sm:border-brand-black/10 pr-1">
                    <span className="text-[7.5px] font-mono font-black uppercase text-brand-black/60 block tracking-wider">Gold Recurrent</span>
                    <span className="text-[9.5px] font-mono font-semibold block text-brand-black/80">{goldCount} × {currencySymbol}{goldCommission.toLocaleString()}</span>
                    <span className="text-sm font-black text-brand-black leading-tight block mt-0.5">
                      {currencySymbol}{(goldCount * goldCommission).toLocaleString()} <span className="text-[7.5px] font-mono font-medium text-brand-black/70">/Quarter</span>
                    </span>
                  </div>
                  <div className="text-left sm:pl-3">
                    <span className="text-[7.5px] font-mono font-black uppercase text-brand-black/60 block tracking-wider">Diamond Recurrent</span>
                    <span className="text-[9.5px] font-mono font-semibold block text-brand-black/80">{diamondCount} × {currencySymbol}{diamondCommission.toLocaleString()}</span>
                    <span className="text-sm font-black text-brand-black leading-tight block mt-0.5">
                      {currencySymbol}{(diamondCount * diamondCommission).toLocaleString()} <span className="text-[7.5px] font-mono font-medium text-brand-black/70">/Year</span>
                    </span>
                  </div>
                </div>

                {/* Large Annual value */}
                <div className="mb-2">
                  <span className="text-4xl md:text-5xl font-serif font-black tracking-tight leading-none block">
                    {currencySymbol}{totalAnnualEarnings.toLocaleString()}
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-brand-black/65 font-black block mt-1">
                    Estimated Passive Annual Earnings
                  </span>
                </div>

                <div className="w-full h-[1px] bg-brand-black/10 my-4"></div>

                {/* Monthly Stable equivalent */}
                <div>
                  <span className="text-2xl md:text-3xl font-serif font-black tracking-tight leading-none block">
                    {currencySymbol}{equivalentMonthlyEarnings.toLocaleString()}<span className="text-[14px] font-mono">/mo</span>
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-brand-black/65 font-black block mt-1">
                    Equivalent Monthly Stream
                  </span>
                </div>
              </div>

              <div className="mt-8 relative z-10 pt-4 border-t border-brand-black/5">
                <p className="text-[10px] text-brand-black/70 font-light leading-relaxed mb-4">
                  Imagine referring just {goldCount + diamondCount} active VIP members. Your income expands dynamically as referrals scale.
                </p>
                <Link 
                  to="/register" 
                  className="w-full text-center py-3.5 bg-brand-black text-white hover:bg-neutral-900 uppercase font-mono font-black tracking-widest text-[9px] transition-all block"
                >
                  Acquire Referral Link
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 border-b border-white/5 bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-2">
            <span className="text-[10px] font-mono text-brand-gold uppercase tracking-[0.25em] font-extrabold block">SIMPLE 3-STEP SYSTEM</span>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-white uppercase tracking-tight">
              📊 How It Works
            </h2>
            <div className="w-12 h-[1px] bg-brand-gold/30 mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-8 bg-brand-black border border-white/5 relative flex flex-col justify-between min-h-[220px]">
              <div>
                <span className="text-2xl font-mono font-black text-brand-gold/30 block mb-4">01</span>
                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-white mb-2">Sign Up</h3>
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  Register as an affiliate and receive your unique custom referral link instantly.
                </p>
              </div>
              <div className="text-[9px] font-mono text-brand-gold/40 mt-4 uppercase">⚡ Free Registration</div>
            </div>

            {/* Step 2 */}
            <div className="p-8 bg-brand-black border border-white/5 relative flex flex-col justify-between min-h-[220px]">
              <div>
                <span className="text-2xl font-mono font-black text-brand-gold/30 block mb-4">02</span>
                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-white mb-2">Share</h3>
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  Promote your unique link through social media, WhatsApp, email, blogs, and communities.
                </p>
              </div>
              <div className="text-[9px] font-mono text-brand-gold/40 mt-4 uppercase">📣 Multi-Platform</div>
            </div>

            {/* Step 3 */}
            <div className="p-8 bg-brand-black border border-white/5 relative flex flex-col justify-between min-h-[220px]">
              <div>
                <span className="text-2xl font-mono font-black text-brand-gold/30 block mb-4">03</span>
                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-white mb-2">Earn</h3>
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  Earn 20% recurring commissions every time your referred member stays active on the platform.
                </p>
              </div>
              <div className="text-[9px] font-mono text-brand-gold/40 mt-4 uppercase">💰 Fully Automated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For & Why Model Works */}
      <section className="py-24 px-6 border-b border-white/5 relative bg-brand-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Left Col: Who This Is For */}
            <div className="lg:col-span-7 space-y-12">
              <div>
                <span className="text-[10px] font-mono text-brand-gold uppercase tracking-[0.25em] font-extrabold block">IDEAL PROFILES</span>
                <h2 className="text-3xl font-serif font-black uppercase tracking-tight text-white mt-1">
                  🎯 Who This Is For
                </h2>
                <p className="mt-2 text-xs text-white/40 uppercase tracking-widest font-mono">
                  This program is ideal for:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {clientTypes.map((type, idx) => (
                  <div key={idx} className="p-5 bg-zinc-950/75 border border-white/5 space-y-1 hover:border-white/10 transition-colors">
                    <h4 className="text-xs font-black uppercase tracking-wider text-brand-gold">
                      {type.title}
                    </h4>
                    <p className="text-xs text-white/50 font-light leading-relaxed">
                      {type.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Why This Model Works */}
            <div className="lg:col-span-5 space-y-10 lg:pl-6">
              <div>
                <span className="text-[10px] font-mono text-brand-gold uppercase tracking-[0.25em] font-extrabold block">THE MATHEMATICS</span>
                <h3 className="text-3xl font-serif font-black uppercase tracking-tight text-white mt-1">
                  🧠 Why This Model Works
                </h3>
                <p className="mt-4 text-xs text-white/50 leading-relaxed">
                  Unlike conventional one-time commissions that dry up after a sale, this is a recurring subscription-membership revenue system:
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold font-mono text-xs font-black shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-white tracking-widest">Earn While Members Stay Subscribed</h4>
                    <p className="text-xs text-white/50 font-light mt-1">Every premium resource, event, and group discussion keeps subscribers engaged and renewing.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold font-mono text-xs font-black shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-white tracking-widest">Build Long-Term Stability</h4>
                    <p className="text-xs text-white/50 font-light mt-1">Stack referral cohorts month after month to establish a highly predictable monthly passive revenue stream.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold font-mono text-xs font-black shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-white tracking-widest">Grow With the Community</h4>
                    <p className="text-xs text-white/50 font-light mt-1">As our suite of reproductive wellness guides and botanical catalogs expand, value increases, raising conversion scores.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* MARKETING SUPPORT SECTION */}
      <section className="py-24 px-6 border-b border-white/5 bg-zinc-950/60 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-2">
            <span className="text-[10px] font-mono text-brand-gold uppercase tracking-[0.25em] font-extrabold block">AFFILIATE EMPOWERMENT DECK</span>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-white uppercase tracking-tight">
              🚀 Marketing Support Included
            </h2>
            <p className="mt-4 text-xs md:text-sm text-white/50 max-w-2xl mx-auto uppercase tracking-wide leading-relaxed font-mono">
              To guarantee your referrals convert and grow, we provide physical and virtual promotional toolkits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketSupportMaterials.map((support, idx) => (
              <div 
                key={idx}
                className="p-6 bg-brand-black border border-white/5 hover:border-brand-gold/10 transition-all rounded-none"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono text-brand-gold font-bold">ASSET {idx + 1}</span>
                  <Zap size={11} className="text-brand-gold" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white mb-2">
                  {support.name}
                </h4>
                <p className="text-xs text-white/40 font-light leading-relaxed">
                  {support.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-24 px-6 border-b border-white/5 bg-brand-black">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 space-y-2">
            <span className="text-[10px] font-mono text-brand-gold uppercase tracking-[0.25em] font-extrabold block">REPRODUCTIVE GAZETTE HELPDESK</span>
            <h2 className="text-3xl font-serif font-black text-white uppercase tracking-tight">
              💬 Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div 
                  key={index} 
                  className="bg-zinc-950 border border-white/5 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left p-6 flex justify-between items-center text-white/95 hover:text-brand-gold transition-colors focus:outline-none"
                    id={`faq_btn_${index}`}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider font-sans">
                      {faq.question}
                    </span>
                    <ChevronDown 
                      size={14} 
                      className={`text-brand-gold transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="border-t border-white/5"
                      >
                        <div className="p-6 text-xs text-white/60 font-light leading-relaxed bg-white/[0.01]">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call To Action */}
      <section className="py-32 px-6 text-center bg-zinc-950/50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-gold/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-2xl mx-auto relative z-10 space-y-8">
          <span className="text-[9px] font-mono text-brand-gold uppercase tracking-[0.3em] font-extrabold block">
            ❤️ READY TO MAKE AN IMPACT?
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-black text-white uppercase tracking-tight leading-tight">
            Join a mission that empowers women while creating sustainable income for you.
          </h2>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/40 block">
            Start earning recurring commissions today.
          </p>
          <div className="pt-4">
            <Link 
              to="/register" 
              className="bg-white text-brand-black px-12 py-5 text-xs font-black tracking-[0.25em] uppercase hover:bg-brand-gold hover:text-brand-black transition-all duration-300 inline-flex items-center justify-center shadow-2xl"
              id="bottom_register_cta_btn"
            >
              Register Now <ArrowUpRight className="ml-2" size={14} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
