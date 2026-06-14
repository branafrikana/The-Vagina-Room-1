import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useContent } from '../context/ContentContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import { sendWhatsAppMessage } from '../lib/whatsapp';
import { motion } from 'motion/react';
import SEO from '../components/SEO';
import { Check, ClipboardList, CreditCard, Info, MapPin, Truck, User, ArrowRight, Sparkles } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

export default function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { content } = useContent();
  const navigate = useNavigate();

  const generalConfig = JSON.parse(content.generalSettingsJson || '{}');
  const paymentConfig = JSON.parse(content.paymentSettingsJson || '{}');
  const shippingLocations = JSON.parse(content.checkoutSettingsJson || '{}').shippingLocations || [];

  const getEnabledMethods = () => {
    const methods = [];
    if (paymentConfig && paymentConfig.gateways) {
      for (const [key, val] of Object.entries(paymentConfig.gateways)) {
        if ((val as any).store?.enabled) methods.push(key.charAt(0).toUpperCase() + key.slice(1));
      }
    }
    if (paymentConfig && paymentConfig.manual?.store) {
      paymentConfig.manual.store.forEach((m: any) => methods.push(m.name));
    }

    // Default fallback if nothing is enabled
    if (methods.length === 0) {
      methods.push("Bank Transfer");
    }
    return methods;
  };
  const paymentMethods = getEnabledMethods();

  const [formData, setFormData] = useState({
    // Personal
    fullName: '',
    email: '',
    phone: '',
    
    // Billing
    billingAddress: '',
    billingLandmark: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    billingCountry: 'Nigeria',

    // Shipping
    shippingLocation: shippingLocations[0]?.name || 'Within Asaba',
    useBillingForShipping: true,
    shippingAddress: '',
    shippingLandmark: '',
    shippingCity: '',
    shippingState: '',
    shippingPostalCode: '',
    shippingCountry: 'Nigeria',

    // Payment
    paymentMethod: paymentMethods[0] || 'Bank Transfer',
    transactionReference: '',
    
    // Additional
    orderNotes: '',
    preferredDeliveryTime: '',
    deliveryPreferences: '',

    // Agreements
    agreedToPolicies: false,

    // Discounts
    discountCode: '',
    discountType: '',
    discountValue: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const deliveryFee = shippingLocations.find((l: any) => l.name === formData.shippingLocation)?.fee || 0;
  const discountAmount = formData.discountType === 'percentage' ? (totalPrice * (Number(formData.discountValue) / 100)) : (Number(formData.discountValue) || 0);
  const grandTotal = Math.max(0, totalPrice + deliveryFee - discountAmount);

  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const digitalItems = cartItems.filter(item => item.isDigital && item.downloadUrl);
  const hasDigital = digitalItems.length > 0;
  
  // Enhanced Paystack key lookup to support multiple possible schema locations in ContentContext
  const paystackKey = 
    paymentConfig.gateways?.paystack?.store?.pub || 
    paymentConfig.storePaystackPublicKey || 
    generalConfig.storePaystackPublicKey || 
    generalConfig.paystackPublicKeyStore || "";

  // Handle setting-based redirection for digital products
  React.useEffect(() => {
    if (isSuccess && hasDigital) {
      try {
        const seoSettings = JSON.parse(content.seoSettingsJson || '{}');
        const generalSettings = JSON.parse(content.generalSettingsJson || '{}');
        
        // If "Instant Redirect" is enabled in Admin, and a URL exists
        if (generalSettings.autoRedirectDigital && seoSettings.digitalSuccessRedirect) {
          const timer = setTimeout(() => {
            window.location.href = seoSettings.digitalSuccessRedirect;
          }, 3000);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        console.warn("Failed to process digital redirect", e);
      }
    }
  }, [isSuccess, hasDigital, content.seoSettingsJson, content.generalSettingsJson]);

  const currencySymbol = cartItems[0]?.currency === 'NGN' ? '₦' : cartItems[0]?.currency === 'USD' ? '$' : '₦';

  const generateWhatsAppMessage = (orderNo: string) => {
    const itemsList = cartItems.map(item => `🛍 *${item.title}*
Qty: ${item.quantity}
Price: ${item.currency === 'NGN' ? '₦' : '$'}${item.price}
Total: ${item.currency === 'NGN' ? '₦' : '$'}${(parseFloat(String(item.price).replace(/[^0-9.]/g, '') || "0") * item.quantity).toFixed(2)}`).join('\n\n');

    const message = `Hi 👋
I would like to place an order from *The Vagina Room*.

━━━━━━━━━━━━━━━
🔖 Order No: *${orderNo}*
━━━━━━━━━━━━━━━

👤 *PERSONAL INFORMATION*
• Name: ${formData.fullName}
• Email: ${formData.email}
• Phone: ${formData.phone}

━━━━━━━━━━━━━━━
📍 *BILLING INFORMATION*
• Address: ${formData.billingAddress}
• Landmark: ${formData.billingLandmark || 'N/A'}
• City/Area: ${formData.billingCity}
• State: ${formData.billingState}
• Country: ${formData.billingCountry}

━━━━━━━━━━━━━━━
🚚 *SHIPPING INFORMATION*
• Location: ${formData.shippingLocation}
• Address: ${formData.useBillingForShipping ? formData.billingAddress : formData.shippingAddress}
• Landmark: ${formData.useBillingForShipping ? formData.billingLandmark : formData.shippingLandmark || 'N/A'}

━━━━━━━━━━━━━━━
💳 *PAYMENT INFORMATION*
• Method: ${formData.paymentMethod}
• Reference: ${formData.transactionReference || 'N/A'}

━━━━━━━━━━━━━━━
🛒 *ORDER SUMMARY*
${itemsList}

• Subtotal: ${currencySymbol}${totalPrice.toFixed(2)}
• Delivery Fee: ${currencySymbol}${deliveryFee.toFixed(2)}
• *Grand Total: ${currencySymbol}${grandTotal.toFixed(2)}*

━━━━━━━━━━━━━━━
📝 *ADDITIONAL INFO*
• Notes: ${formData.orderNotes || 'None'}
• Preferred Time: ${formData.preferredDeliveryTime || 'As soon as possible'}

Thank you for shopping with *The Vagina Room* 💜`;

    return encodeURIComponent(message);
  };

  const bankDetails = {
    name: generalConfig.storeBankName || generalConfig.bankName || "",
    accountName: generalConfig.storeAccountName || generalConfig.accountName || "",
    accountNo: generalConfig.storeAccountNumber || generalConfig.accountNumber || ""
  };
  
  const handleCheckout = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = 'Full Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Mobile Number is required';
    if (!formData.billingAddress) newErrors.billingAddress = 'Billing Address is required';
    if (!formData.agreedToPolicies) newErrors.agreedToPolicies = 'You must agree to store policies';
    
    if (formData.paymentMethod.toLowerCase().includes('card') && !paystackKey) {
      newErrors.paymentMethod = "Card payment is currently unavailable. Please use Bank Transfer.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const orderNo = Math.floor(Math.random() * 1000000).toString();
      
      const processOrder = async (isPaid = false, paymentRef = '') => {
        try {
          // Save order via direct Firestore client
          await addDoc(collection(db, "orders"), {
              orderNo,
              customer: formData,
              items: cartItems,
              subtotal: totalPrice,
              deliveryFee,
              grandTotal,
              status: isPaid ? 'paid' : 'pending',
              paymentReference: paymentRef,
              orderType: 'store',
              createdAt: new Date().toISOString()
          });

          // (Removed /api/checkout sending as no backend is configured)

          if (!isPaid) {
            const phoneToUse = generalConfig.whatsappPhone || content.contactPhone;
            const message = generateWhatsAppMessage(orderNo);
            await sendWhatsAppMessage(phoneToUse, message, generalConfig.whatsappMethod || 'REDIRECT');
          }
          
          setOrderId(orderNo);
          setIsSuccess(true);
          clearCart();
        } catch (e) {
          console.error("Error saving order: ", e);
          alert("Failed to place order. Please try again.");
        }
      };

      if (formData.paymentMethod.toLowerCase().includes('card')) {
        const config = {
          reference: (new Date()).getTime().toString(),
          email: formData.email,
          amount: Math.round(grandTotal * 100), // kobo
          publicKey: paystackKey,
          metadata: {
            custom_fields: [
              {
                display_name: "Customer Name",
                variable_name: "customer_name",
                value: formData.fullName
              },
              {
                display_name: "Order Type",
                variable_name: "order_type",
                value: "store"
              }
            ]
          }
        };

        const initializePayment = usePaystackPayment(config);

        const onSuccess = (reference: any) => {
          processOrder(true, reference.reference);
        };

        const onClose = () => {
          alert("Payment was cancelled. Order not placed.");
        };

        // @ts-ignore
        initializePayment(onSuccess, onClose);
      } else {
        // Manual Transfer / WhatsApp flow
        processOrder(false);
      }
    }
  };

  const Section = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <div className="bg-white/5 border border-white/10 p-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-brand-gold" />
        <h2 className="text-xl font-black uppercase tracking-tight leading-none">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );

  const InputField = ({ label, value, onChange, placeholder, type = "text", error, required = false }: any) => (
    <div className="space-y-1">
      <label className="block text-[10px] font-black uppercase text-white/50 tracking-widest leading-none">
        {label} {required && <span className="text-brand-gold">*</span>}
      </label>
      <input 
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-brand-black/40 border border-white/10 p-4 text-sm focus:border-brand-gold focus:outline-none transition-colors placeholder:text-white/20 text-white"
      />
      {error && <p className="text-brand-gold text-[10px] uppercase font-black">{error}</p>}
    </div>
  );

  return (
    <>
      <SEO 
        title="Checkout" 
        description="Complete your order from The Vagina Room Collective."
      />
      <div className="bg-brand-black text-white min-h-screen flex flex-col font-sans selection:bg-brand-gold selection:text-brand-black">
      <Navigation />
      
      <main className="pt-40 pb-32 flex-grow max-w-5xl mx-auto w-full px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">Premium Collective</span>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
            {isSuccess ? 'Thank You' : 'Checkout'}
          </h1>
        </motion.div>

        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white/5 border border-white/10 space-y-8"
          >
            <div className="w-20 h-20 bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center mx-auto rounded-full">
              <Check className="text-brand-gold w-10 h-10" />
            </div>
            <div className="space-y-4 max-w-lg mx-auto px-6">
              <h2 className="text-3xl font-black uppercase tracking-tight">Order Confirmed!</h2>
              <p className="text-white/60 font-serif leading-relaxed italic text-sm">
                Your order #<span className="text-brand-gold font-mono font-bold font-sans not-italic">{orderId}</span> has been received. 
                {formData.paymentMethod.toLowerCase().includes('card') 
                  ? "A confirmation email has been sent to you."
                  : "Please complete your payment confirmation on WhatsApp via the button below."
                }
              </p>
            </div>

            {hasDigital && (
              <div className="max-w-xl mx-auto border border-brand-gold/20 bg-brand-gold/[0.03] p-8 space-y-6">
                <div className="flex items-center justify-center gap-3">
                  <Sparkles className="w-5 h-5 text-brand-gold animate-pulse" />
                  <h3 className="text-lg font-black uppercase tracking-widest text-brand-gold">Secure Digital Community Access</h3>
                </div>
                
                <div className="space-y-4">
                  <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Your acquired digital assets are ready for instant calibration:</p>
                  <div className="space-y-2">
                    {digitalItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-brand-black/40 border border-white/10 p-4 group hover:border-brand-gold transition-colors">
                        <div className="text-left">
                          <p className="text-[11px] font-black uppercase tracking-tight">{item.title}</p>
                          <p className="text-[8px] text-white/40 uppercase font-mono tracking-widest">Digital Resource Vault</p>
                        </div>
                        <a 
                          href={item.downloadUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-brand-gold text-brand-black px-4 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
                        >
                          Download Access
                        </a>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-white/30 uppercase leading-relaxed italic">
                    * A digital receipt with these community links has also been dispatched to your provided email address.
                  </p>
                </div>
              </div>
            )}
            <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/products')}
                className="bg-brand-gold text-brand-black px-12 py-4 font-black uppercase text-xs tracking-widest hover:bg-white transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10">
            <p className="text-white/40 uppercase font-black tracking-widest">Your cart is empty.</p>
            <button 
              onClick={() => navigate('/products')}
              className="mt-6 text-brand-gold uppercase font-black text-sm hover:tracking-widest transition-all"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* 👤 Personal Information */}
              <Section title="Personal Information" icon={User}>
                <InputField 
                  label="Full Name" 
                  value={formData.fullName} 
                  onChange={(val: string) => setFormData({...formData, fullName: val})} 
                  placeholder="Jane Doe"
                  required
                  error={errors.fullName}
                />
                <InputField 
                  label="Email Address" 
                  type="email"
                  value={formData.email} 
                  onChange={(val: string) => setFormData({...formData, email: val})} 
                  placeholder="jane@example.com"
                  required
                  error={errors.email}
                />
                <div className="md:col-span-2">
                  <InputField 
                    label="Mobile Number" 
                    type="tel"
                    value={formData.phone} 
                    onChange={(val: string) => setFormData({...formData, phone: val})} 
                    placeholder="e.g. +234..."
                    required
                    error={errors.phone}
                  />
                </div>
              </Section>

              {/* 📍 Billing Information */}
              <Section title="Billing Information" icon={MapPin}>
                <div className="md:col-span-2">
                  <InputField 
                    label="Billing Address" 
                    value={formData.billingAddress} 
                    onChange={(val: string) => setFormData({...formData, billingAddress: val})} 
                    placeholder="123 Wellness Way"
                    required
                    error={errors.billingAddress}
                  />
                </div>
                <InputField label="Landmark (Optional)" value={formData.billingLandmark} onChange={(val: string) => setFormData({...formData, billingLandmark: val})} />
                <InputField label="City / Area" value={formData.billingCity} onChange={(val: string) => setFormData({...formData, billingCity: val})} />
                <InputField label="State" value={formData.billingState} onChange={(val: string) => setFormData({...formData, billingState: val})} />
                <InputField label="Postal Code" value={formData.billingPostalCode} onChange={(val: string) => setFormData({...formData, billingPostalCode: val})} />
                <div className="md:col-span-2">
                  <InputField label="Country" value={formData.billingCountry} onChange={(val: string) => setFormData({...formData, billingCountry: val})} />
                </div>
              </Section>

              {/* 🚚 Shipping Information */}
              <Section title="Shipping Information" icon={Truck}>
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-white/50 tracking-widest leading-none">Select Shipping Location</label>
                    <select 
                      value={formData.shippingLocation}
                      onChange={e => setFormData({...formData, shippingLocation: e.target.value})}
                      className="w-full bg-brand-black/40 border border-white/10 p-4 text-sm focus:border-brand-gold focus:outline-none transition-colors text-white"
                    >
                      {shippingLocations.map((loc: any) => (
                        <option key={loc.name} value={loc.name} className="bg-brand-black">{loc.name} ({currencySymbol}{loc.fee.toLocaleString()})</option>
                      ))}
                    </select>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer group py-2">
                    <div className={`w-5 h-5 flex items-center justify-center border transition-colors ${formData.useBillingForShipping ? 'bg-brand-gold border-brand-gold' : 'border-white/20 group-hover:border-white/40'}`}>
                      {formData.useBillingForShipping && <Check className="w-3 h-3 text-brand-black" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={formData.useBillingForShipping}
                      onChange={e => setFormData({...formData, useBillingForShipping: e.target.checked})}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Shipping address same as billing</span>
                  </label>
                </div>

                {!formData.useBillingForShipping && (
                  <>
                    <div className="md:col-span-2">
                      <InputField label="Shipping Address" value={formData.shippingAddress} onChange={(val: string) => setFormData({...formData, shippingAddress: val})} />
                    </div>
                    <InputField label="Landmark (Optional)" value={formData.shippingLandmark} onChange={(val: string) => setFormData({...formData, shippingLandmark: val})} />
                    <InputField label="City / Area" value={formData.shippingCity} onChange={(val: string) => setFormData({...formData, shippingCity: val})} />
                  </>
                )}
              </Section>

              {/* 💳 Payment Information */}
              <Section title="Payment Information" icon={CreditCard}>
                <div className="md:col-span-2 space-y-6">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-white/50 tracking-widest leading-none">Select Payment Method</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {paymentMethods.map((method: string) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setFormData({...formData, paymentMethod: method})}
                          className={`p-4 text-left text-[10px] uppercase font-black tracking-widest border transition-all leading-tight ${formData.paymentMethod === method ? 'bg-brand-gold text-brand-black border-brand-gold' : 'bg-white/5 border-white/10 hover:border-white/30 text-white/60'}`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(formData.paymentMethod === 'Bank Transfer' || (paymentConfig.manual?.store || []).some((m: any) => m.name === formData.paymentMethod)) && (
                    <div className="p-4 bg-brand-gold/10 border border-brand-gold/20 text-xs text-white space-y-2">
                      <p className="font-bold uppercase tracking-widest text-[9px] text-brand-gold">Payment Details:</p>
                      <div className="font-mono text-white/80 space-y-1">
                        {formData.paymentMethod === 'Bank Transfer' ? (
                          <>
                            <p><span className="text-white/40">Bank:</span> {generalConfig.storeBankName || generalConfig.bankName || "N/A"}</p>
                            <p><span className="text-white/40">Name:</span> {generalConfig.storeAccountName || generalConfig.accountName || "N/A"}</p>
                            <p><span className="text-white/40">Number:</span> {generalConfig.storeAccountNumber || generalConfig.accountNumber || "N/A"}</p>
                          </>
                        ) : (
                          <p>{paymentConfig.manual.store.find((m: any) => m.name === formData.paymentMethod)?.details}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <InputField 
                      label="Transaction Reference (Optional)" 
                      value={formData.transactionReference} 
                      onChange={(val: string) => setFormData({...formData, transactionReference: val})} 
                      placeholder="TXN-123456"
                    />
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase text-white/50 tracking-widest leading-none">Upload Payment Receipt (Optional)</label>
                      <input type="file" className="w-full text-xs text-white/50 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-brand-gold file:text-brand-black cursor-pointer bg-white/5 border border-white/10 p-2 text-white" />
                    </div>
                  </div>
                </div>
              </Section>

              {/* 📝 Additional Information */}
              <Section title="Additional Information" icon={Info}>
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-white/50 tracking-widest leading-none">Order Notes / Special Instructions</label>
                    <textarea 
                      value={formData.orderNotes} 
                      onChange={e => setFormData({...formData, orderNotes: e.target.value})}
                      className="w-full bg-brand-black/40 border border-white/10 p-4 text-sm focus:border-brand-gold focus:outline-none transition-colors h-32 text-white"
                    />
                  </div>
                  <InputField label="Preferred Delivery Time" value={formData.preferredDeliveryTime} onChange={(val: string) => setFormData({...formData, preferredDeliveryTime: val})} placeholder="e.g. Morning 10AM-12PM" />
                  <InputField label="Delivery Preferences" value={formData.deliveryPreferences} onChange={(val: string) => setFormData({...formData, deliveryPreferences: val})} placeholder="e.g. Leave at front desk" />
                </div>
              </Section>
            </div>

            {/* 🛒 Order Summary Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-40 space-y-6">
                <div className="bg-brand-gold/10 border border-brand-gold/20 p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="w-5 h-5 text-brand-gold" />
                    <h2 className="text-xl font-black uppercase tracking-tight text-brand-gold leading-none">Order Summary</h2>
                  </div>

                  <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between items-start gap-4">
                        <div>
                          <p className="text-[10px] font-black uppercase leading-tight">{item.title}</p>
                          <p className="text-[10px] text-white/40 uppercase">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-[10px] font-black">{currencySymbol}{(parseFloat(String(item.price).replace(/[^0-9.]/g, '') || "0") * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-white/10 space-y-3">
                    <div className="flex gap-2 mb-4">
                      <input 
                        type="text"
                        placeholder="Discount Code"
                        className="w-full bg-brand-black/40 border border-white/10 p-3 text-[10px] uppercase font-mono tracking-widest text-white/70"
                        value={formData.discountCode || ""}
                        onChange={(e) => setFormData({...formData, discountCode: e.target.value.toUpperCase()})}
                      />
                      <button 
                        type="button" 
                        onClick={async () => {
                           try {
                             const q = query(collection(db, "discountCodes"), where("code", "==", formData.discountCode), where("isActive", "==", true));
                             const snapshot = await getDocs(q);
                             if (snapshot.empty) {
                               alert("Invalid or inactive discount code");
                               return;
                             }
                             const data = snapshot.docs[0].data();
                             if (data.expiryDate && new Date(data.expiryDate) < new Date()) {
                               alert("This discount code has expired");
                               return;
                             }
                             alert("Discount Applied!");
                             setFormData({...formData, discountType: data.type, discountValue: data.value});
                           } catch(e) {
                             console.error("Discount check failed", e);
                             alert("Failed to validate discount");
                           }
                        }}
                        className="bg-brand-gold text-brand-black px-4 text-[10px] font-black uppercase tracking-widest"
                      >
                        Apply
                      </button>
                    </div>

                    <div className="flex justify-between text-[10px] uppercase font-black">
                      <span className="text-white/40">Subtotal</span>
                      <span>{currencySymbol}{totalPrice.toFixed(2)}</span>
                    </div>
                    {formData.discountType && (
                      <div className="flex justify-between text-[10px] uppercase font-black text-brand-gold">
                        <span>Discount ({formData.discountType === 'percentage' ? `${formData.discountValue}%` : currencySymbol + formData.discountValue})</span>
                        <span>-{currencySymbol}{(formData.discountType === 'percentage' ? (totalPrice * (Number(formData.discountValue) / 100)) : Number(formData.discountValue)).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] uppercase font-black">
                      <span className="text-white/40">Delivery Fee</span>
                      <span>{currencySymbol}{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] uppercase font-black border-t border-white/5 pt-3">
                      <span className="text-brand-gold">Total Amount</span>
                      <span className="text-lg text-brand-gold">{currencySymbol}{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className={`mt-1 w-5 h-5 flex-shrink-0 flex items-center justify-center border transition-colors ${formData.agreedToPolicies ? 'bg-brand-gold border-brand-gold' : 'border-white/20 group-hover:border-white/40'}`}>
                        {formData.agreedToPolicies && <Check className="w-3 h-3 text-brand-black" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={formData.agreedToPolicies}
                        onChange={e => setFormData({...formData, agreedToPolicies: e.target.checked})}
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60 leading-relaxed">
                        I agree to store policies and terms
                      </span>
                    </label>
                    {errors.agreedToPolicies && <p className="text-brand-gold text-[10px] uppercase font-black">{errors.agreedToPolicies}</p>}

                    <button 
                      onClick={handleCheckout}
                      className={`w-full ${formData.paymentMethod.toLowerCase().includes('card') ? 'bg-brand-gold text-brand-black' : 'bg-green-600 text-white'} p-5 font-black uppercase text-sm tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95`}
                    >
                      {formData.paymentMethod.toLowerCase().includes('card') ? (
                        <>
                          <CreditCard className="w-5 h-5" />
                          Pay with Paystack
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.100-.198.05-.371-.026-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.394 0 12.03c0 2.119.554 4.188 1.606 6.046L0 24l6.117-1.605a11.803 11.803 0 005.925 1.586h.005c6.634 0 12.032-5.396 12.036-12.032.002-3.213-1.248-6.231-3.517-8.502"/></svg>
                          Order on WhatsApp
                        </>
                      )}
                    </button>
                    
                    <p className="text-[9px] text-white/30 text-center uppercase tracking-widest leading-relaxed">
                      Secure checkout powered by WhatsApp Business. By clicking, you agree to our terms.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
    </>
  );
}
