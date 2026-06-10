import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import { ShieldCheck, Award, Sparkles, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import SEO from '../components/SEO';
import Navigation from '../components/Navigation';
import { useContent } from '../context/ContentContext';
import EditableText from '../components/EditableText';

export default function RegisterPage() {
  const { content } = useContent();
  const paymentConfig = JSON.parse(content.paymentSettingsJson || '{}');
  const generalSettings = JSON.parse(content.generalSettingsJson || '{}');
  
  if (generalSettings.signupsEnabled === false) {
    return (
      <div className="min-h-screen bg-brand-black text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-black uppercase tracking-widest text-brand-gold">Registration Offline</h1>
          <p className="text-white/60">New user registrations are currently disabled. Please contact support.</p>
          <Link to="/" className="text-brand-gold hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }
  
  const getEnabledMethods = () => {
    const methods = [];
    if (paymentConfig && paymentConfig.gateways) {
      for (const [key, val] of Object.entries(paymentConfig.gateways)) {
        if ((val as any).membership?.enabled) methods.push(key.charAt(0).toUpperCase() + key.slice(1));
      }
    }
    if (paymentConfig && paymentConfig.manual?.membership) {
      paymentConfig.manual.membership.forEach((m: any) => methods.push(m.name));
    }
    // If no methods are enabled, fallback to Card for Paystack (if key exists) or Bank Transfer
    if (methods.length === 0) {
      methods.push("Bank Transfer");
    }
    return methods;
  };
  const paymentMethods = getEnabledMethods();
  
  const paystackKey = paymentConfig.gateways?.paystack?.membership?.pub || "";
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [continent, setContinent] = useState('');
  const [country, setCountry] = useState('');
  const [plan, setPlan] = useState('gold');
  const [paymentGateway, setPaymentGateway] = useState('card');
  const [stateProvince, setStateProvince] = useState('');
  const [city, setCity] = useState('');
  const [isCompetitor, setIsCompetitor] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const p = searchParams.get('plan');
    if (p === 'gold' || p === 'quarterly') {
        setPlan('gold');
    } else if (p === 'diamond' || p === 'yearly') {
        setPlan('diamond');
    }
  }, [searchParams]);
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('ref');
    if (code) {
      setRefCode(code);
      localStorage.setItem('tvr_ref', code);
    } else {
      const stored = localStorage.getItem('tvr_ref');
      if (stored) {
        setRefCode(stored);
      }
    }
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (paymentGateway === 'card' && !paystackKey) {
      setError("Payment gateway is currently unavailable. Please use Bank Transfer or contact support.");
      return;
    }

    setLoading(true);

    const amount = isNigeria 
      ? (plan === 'gold' ? parseInt(content.membershipPriceGoldNGN || "25000") : parseInt(content.membershipPriceDiamondNGN || "85000"))
      : (plan === 'gold' ? parseInt(content.membershipPriceGoldUSD || "45") : parseInt(content.membershipPriceDiamondUSD || "150"));

    const currencyCodeForPayment = isNigeria ? "NGN" : "USD";

    const performRegistration = async (paymentRef?: string) => {
      try {
        // 1. Get/Update Membership ID Counter
        const statsRef = doc(db, 'stats', 'membership');
        const statsDoc = await getDoc(statsRef);
        let count = 0;
        if (statsDoc.exists()) {
          count = statsDoc.data().lastCount || 0;
        }
        const newCount = count + 1;
        const membershipId = `TVR${String(newCount).padStart(3, '0')}`;
        await setDoc(statsRef, { lastCount: newCount }, { merge: true });

        // 2. Calculate Expiration
        const now = new Date();
        const expiration = new Date(now);
        if (plan === 'gold') {
          expiration.setMonth(now.getMonth() + 3);
        } else {
          expiration.setFullYear(now.getFullYear() + 1);
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: email,
          firstName,
          lastName,
          phone,
          continent,
          country,
          stateProvince,
          city,
          isCompetitor,
          paymentGateway,
          paymentReference: paymentRef || null,
          membershipId: membershipId,
          membershipType: plan,
          membershipExpiration: expiration.toISOString(),
          role: 'member',
          isMember: paymentGateway === 'card',
          paymentStatus: paymentGateway === 'card' ? 'approved' : 'pending',
          referredBy: refCode || null,
          referralCode: userCredential.user.uid.substring(0, 8).toUpperCase(),
          totalReferrals: 0,
          activeReferredMembers: 0,
          referralEarningsUSD: 0.00,
          referralEarningsNGN: 0,
          customCommissionPercentage: 20,
          createdAt: new Date().toISOString()
        });
        
        // UPDATE REFERRER STATS
        if (refCode) {
          try {
            const q = query(collection(db, 'users'), where('referralCode', '==', refCode));
            const snap = await getDocs(q);
            if (!snap.empty) {
              const referrerRef = snap.docs[0].ref;
              await updateDoc(referrerRef, {
                totalReferrals: increment(1)
              });
            } else {
              // Backward compatibility for users without referralCode assigned
              const allUsers = await getDocs(collection(db, 'users'));
              const referrer = allUsers.docs.find(d => d.id.substring(0, 8).toUpperCase() === refCode);
              if (referrer) {
                await updateDoc(referrer.ref, {
                  totalReferrals: increment(1)
                });
              }
            }
          } catch(e) {
            console.error("Failed to update referrer stats:", e);
          }
        }

        // (Removed /api/send-welcome-email sending as no backend is configured)
        
        localStorage.removeItem('tvr_ref');
        if (paymentGateway === 'card') {
          navigate('/welcome');
        } else {
          navigate('/payment-review');
        }
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (paymentGateway === 'card') {
      const config = {
        reference: (new Date()).getTime().toString(),
        email: email,
        amount: amount * 100, // Amount is in kobo or cents
        currency: currencyCodeForPayment,
        publicKey: paystackKey,
        metadata: {
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: `${firstName} ${lastName}`
            },
            {
              display_name: "Order Type",
              variable_name: "order_type",
              value: "membership"
            },
            {
              display_name: "Plan",
              variable_name: "plan",
              value: plan
            }
          ]
        }
      };

      const initializePayment = usePaystackPayment(config);

      const onSuccess = (reference: any) => {
        performRegistration(reference.reference);
      };

      const onClose = () => {
        setLoading(false);
        setError("Payment was cancelled. You must complete payment to register.");
      };

      // @ts-ignore
      initializePayment(onSuccess, onClose);
    } else {
      // Manual Transfer
      performRegistration();
    }
  };

  const CONTINENT_COUNTRIES: Record<string, string[]> = {
    "Africa": ["Nigeria", "Ghana", "Kenya", "South Africa", "Rwanda", "Uganda", "Cameroon", "Egypt", "Ethiopia", "Tanzania", "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cape Verde", "Central African Republic", "Chad", "Comoros", "Congo", "Djibouti", "Equatorial Guinea", "Eritrea", "Eswatini", "Gabon", "Gambia", "Guinea", "Guinea-Bissau", "Ivory Coast", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "Sudan", "Togo", "Tunisia", "Zambia", "Zimbabwe"],
    "North America": ["United States", "Canada", "Jamaica", "Trinidad and Tobago", "Other North American Country"],
    "Europe": ["United Kingdom", "Germany", "France", "Netherlands", "Ireland", "Italy", "Spain", "Other European Country"],
    "South America": ["Brazil", "Colombia", "Argentina", "Other South American Country"],
    "Asia": ["India", "United Arab Emirates", "Saudi Arabia", "Singapore", "Japan", "Other Asian Country"],
    "Oceania": ["Australia", "New Zealand", "Other Oceanian Country"]
  };

  const SUBDIVISIONS: Record<string, { label: string; placeholder: string; options?: string[] }> = {
    "Nigeria": {
      label: "State",
      placeholder: "Select State",
      options: [
        "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
      ]
    },
    "Kenya": {
      label: "County",
      placeholder: "Select County",
      options: [
        "Nairobi", "Mombasa", "Kiambu", "Nakuru", "Kisumu", "Uasin Gishu", "Machakos", "Kajiado", "Nyeri", "Makueni", "Kilifi", "Kakamega", "Other County"
      ]
    },
    "Ghana": {
      label: "Region",
      placeholder: "Select Region",
      options: [
        "Greater Accra", "Ashanti", "Western", "Eastern", "Central", "Volta", "Northern", "Brong-Ahafo", "Upper East", "Upper West", "Other Region"
      ]
    },
    "South Africa": {
      label: "Province",
      placeholder: "Select Province",
      options: [
        "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State", "Limpopo", "Mpumalanga", "North West", "Northern Cape"
      ]
    },
    "United States": {
      label: "State",
      placeholder: "Select State",
      options: [
        "California", "Texas", "New York", "Florida", "Illinois", "Georgia", "North Carolina", "Pennsylvania", "Ohio", "Michigan", "Other State"
      ]
    },
    "Canada": {
      label: "Province",
      placeholder: "Select Province",
      options: [
        "Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Other Province"
      ]
    },
    "United Kingdom": {
      label: "Country/Region",
      placeholder: "Select Country/Region",
      options: ["England", "Scotland", "Wales", "Northern Ireland", "Other Region"]
    }
  };

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const isNigeriaDefault = userTimeZone.includes("Africa/Lagos");
  const [useNaira, setUseNaira] = useState(isNigeriaDefault);
  
  const isNigeria = useNaira;
  const currencySymbol = isNigeria ? "₦" : "$";
  const currencyCode = isNigeria ? "NGN" : "USD";

  const goldPriceDisplay = isNigeria ? `₦${content.membershipPriceGoldNGN || "25,000"}` : `$${content.membershipPriceGoldUSD || "45"}`;
  const diamondPriceDisplay = isNigeria ? `₦${content.membershipPriceDiamondNGN || "85,000"}` : `$${content.membershipPriceDiamondUSD || "150"}`;

  const planDetails = {
    gold: {
      name: "Gold Plan",
      price: goldPriceDisplay,
      period: "Gold Plan for 3 Months",
      description: "Gold plan for three months. Quarterly membership with access to reproductive wellness, community, and guides."
    },
    diamond: {
      name: "Diamond Plan",
      price: diamondPriceDisplay,
      period: "Diamond Plan for 1 Year",
      description: "Diamond plan for one year. Complete annual access, direct Dr. FID support channels, and priority workshop slots."
    }
  };

  return (
    <>
      <SEO title="Join The Community" description="Become a member of The Vagina Room and unlock exclusive restorative content and community access." />
      <div className="min-h-screen bg-brand-black text-white selection:bg-brand-gold selection:text-brand-black">
        <Navigation />
        
        <div className="pt-32 pb-20 px-6 grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto items-center">
          {/* Left Column: Value Prop */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-brand-gold bg-brand-gold/5 px-4 py-2 border border-brand-gold/10 inline-block rounded-full">
                Member Onboarding
              </span>
              <EditableText
                field="registerHeading"
                as="h1"
                className="text-5xl md:text-8xl font-serif font-black tracking-tighter text-white leading-[0.95] block"
              >
                <span dangerouslySetInnerHTML={{ __html: content.registerHeading || 'Enter the <br/>\n<span class="text-brand-gold italic">Community</span>' }} />
              </EditableText>
              <EditableText
                field="registerSub"
                as="p"
                multiline
                className="text-white/80 font-sans text-xl max-w-lg leading-relaxed font-light block"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: <ShieldCheck className="text-brand-gold" size={20} />, title: 'Confidential Space', desc: 'Secure, private community lounge.' },
                { icon: <Award className="text-brand-gold" size={20} />, title: 'Expert Guidance', desc: 'Direct access to Dr. FID\'s insights.' },
                { icon: <Sparkles className="text-brand-gold" size={20} />, title: 'Exclusive Content', desc: 'Private webinars and restorative rituals.' },
                { icon: <CheckCircle2 className="text-brand-gold" size={20} />, title: 'Member Shop', desc: 'Curated formulations with discounts.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 bg-white/[0.02] border border-white/5">
                  <div className="mt-1">{item.icon}</div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white">{item.title}</h3>
                    <p className="text-[10px] text-white/60 mt-1 leading-relaxed uppercase">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {refCode && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-[9px] text-white/40 uppercase font-black tracking-[0.1em]">Referral Activated</p>
                  <p className="text-[10px] font-mono text-emerald-400">Invited by advocate: <span className="font-bold">{refCode}</span></p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column: Registration Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="absolute -inset-2 bg-gradient-to-tr from-brand-gold/20 via-transparent to-brand-gold/10 blur-2xl opacity-20 pointer-events-none" />
            
            <div className="relative bg-brand-black/40 backdrop-blur-xl border border-white/10 p-8 md:p-10">
              <h2 className="text-xl font-black uppercase tracking-widest text-white mb-8 border-b border-white/5 pb-4">Create Your Profile</h2>
              
              {error && (
                <div className="mb-6 p-4 bg-brand-red/10 border border-brand-red/20 text-brand-red text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 animate-shake">
                  <Info size={14} /> {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">First Name</label>
                    <input 
                      type="text" 
                      placeholder="Jane" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 p-4 text-sm focus:border-brand-gold outline-none transition-all placeholder:text-white/40"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Last Name</label>
                    <input 
                      type="text" 
                      placeholder="Doe" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 p-4 text-sm focus:border-brand-gold outline-none transition-all placeholder:text-white/40"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="email@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 p-4 text-sm focus:border-brand-gold outline-none transition-all placeholder:text-white/40"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+234 800 000 0000" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 p-4 text-sm focus:border-brand-gold outline-none transition-all placeholder:text-white/40"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Continent</label>
                    <select 
                      value={continent}
                      onChange={(e) => { setContinent(e.target.value); setCountry(''); }}
                      className="w-full bg-brand-black border border-white/10 p-4 text-sm text-white focus:border-brand-gold outline-none transition-all"
                      required
                    >
                      <option value="" className="bg-brand-black text-white">Select Continent</option>
                      {Object.keys(CONTINENT_COUNTRIES).map(cont => <option key={cont} value={cont} className="bg-brand-black text-white">{cont}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Country</label>
                    <select 
                      value={country}
                      onChange={(e) => { 
                        setCountry(e.target.value);
                        if (e.target.value === 'Nigeria') {
                          setUseNaira(true);
                        } else {
                          setUseNaira(false);
                        }
                      }}
                      className="w-full bg-brand-black border border-white/10 p-4 text-sm text-white focus:border-brand-gold outline-none transition-all"
                      required
                      disabled={!continent}
                    >
                      <option value="" className="bg-brand-black text-white">Select Country</option>
                      {continent && CONTINENT_COUNTRIES[continent].map(c => <option key={c} value={c} className="bg-brand-black text-white">{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">State/Province/County</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Lagos" 
                      value={stateProvince} 
                      onChange={(e) => setStateProvince(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 p-4 text-sm focus:border-brand-gold outline-none transition-all placeholder:text-white/40"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">City</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ikeja" 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 p-4 text-sm focus:border-brand-gold outline-none transition-all placeholder:text-white/40"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 ">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Preferred Currency</label>
                  <div className="flex bg-white/[0.03] border border-white/10 p-1">
                    <button 
                      type="button"
                      onClick={() => setUseNaira(true)}
                      className={`flex-1 py-2 text-xs font-black uppercase tracking-widest transition-all ${useNaira ? 'bg-brand-gold text-brand-black' : 'text-white/60'}`}
                    >
                      Naira (NGN)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseNaira(false)}
                      className={`flex-1 py-2 text-xs font-black uppercase tracking-widest transition-all ${!useNaira ? 'bg-brand-gold text-brand-black' : 'text-white/60'}`}
                    >
                      USD ($)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Payment Method</label>
                    <select 
                        value={paymentGateway}
                        onChange={(e) => setPaymentGateway(e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-4 text-sm text-white focus:border-brand-gold outline-none transition-all"
                        required
                    >
                        {paymentMethods.map((m: string) => (
                           <option key={m} value={m} className="bg-brand-black text-white">{m}</option>
                        ))}
                    </select>
                </div>

                {(paymentGateway === 'Bank Transfer' || (paymentConfig.manual?.membership || []).some((m: any) => m.name === paymentGateway)) && (
                  <div className="p-4 bg-brand-gold/10 border border-brand-gold/20 text-xs text-white space-y-2">
                    <p className="font-bold uppercase tracking-widest text-[9px] text-brand-gold">Payment Details:</p>
                    <div className="font-mono text-white/80 space-y-1">
                      {paymentGateway === 'Bank Transfer' ? (
                        <>
                          <p><span className="text-white/40">Bank:</span> {generalSettings.membershipBankName || generalSettings.bankName || "N/A"}</p>
                          <p><span className="text-white/40">Name:</span> {generalSettings.membershipAccountName || generalSettings.accountName || "N/A"}</p>
                          <p><span className="text-white/40">Number:</span> {generalSettings.membershipAccountNumber || generalSettings.accountNumber || "N/A"}</p>
                        </>
                      ) : (
                        <p>{paymentConfig.manual.membership.find((m: any) => m.name === paymentGateway)?.details}</p>
                      )}
                    </div>
                  </div>
                )}


                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Secure Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 p-4 text-sm focus:border-brand-gold outline-none transition-all placeholder:text-white/40"
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/60 ml-1">Select Activation Plan</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(['gold', 'diamond'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPlan(p)}
                        className={`text-left p-4 border transition-all relative ${
                          plan === p 
                            ? 'bg-brand-gold/10 border-brand-gold shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
                            : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">{planDetails[p].name}</span>
                          {plan === p && <CheckCircle2 size={12} className="text-brand-gold" />}
                        </div>
                        <p className="text-lg font-black text-brand-gold leading-none mb-1">
                          {planDetails[p].price}
                        </p>
                        <p className="text-[9px] text-white/40 uppercase tracking-tighter mb-2">
                          {planDetails[p].period}
                        </p>
                        <p className="text-[9px] text-white/30 uppercase leading-relaxed line-clamp-2">
                          {planDetails[p].description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <motion.button 
                    type="submit" 
                    disabled={loading}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-brand-gold text-brand-black p-4 min-h-[44px] font-black uppercase text-xs tracking-widest hover:bg-white transition-all group flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-brand-black border-t-transparent rounded-full animate-spin" />
                        Initializing...
                      </span>
                    ) : (
                      <>
                        Register & Begin Activation
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </div>

                <p className="text-center text-[9px] text-white/50 uppercase tracking-[0.2em] font-black">
                  Already have an account? <Link to="/login" className="text-brand-gold hover:text-white transition-colors">SignIn</Link>
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
