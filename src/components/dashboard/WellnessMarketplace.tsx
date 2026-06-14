import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Tag, 
  Package, 
  FileText, 
  GraduationCap, 
  Ticket,
  Heart,
  Percent,
  Search,
  Star,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  ListOrdered
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

export default function WellnessMarketplace() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'bundles' | 'digital' | 'orders' | 'loyalty'>('home');
  const [toastMessage, setToastMessage] = useState('');
  
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const categories = [
    { id: 'supplements', name: 'Supplements', icon: Heart, desc: 'Hormonal balance & fertility support' },
    { id: 'herbal', name: 'Herbal Products', icon: Tag, desc: 'Natural plant-based solutions' },
    { id: 'kits', name: 'Wellness Kits', icon: Package, desc: 'Pre-packaged holistic systems' },
    { id: 'digital', name: 'Digital Products', icon: FileText, desc: 'Resources, guides & trackers' },
    { id: 'courses', name: 'Courses', icon: GraduationCap, desc: 'Structured learning journeys' },
    { id: 'events', name: 'Event Tickets', icon: Ticket, desc: 'Live healing experiences' }
  ];

  return (
    <div className="space-y-8 font-sans text-white text-left relative pb-20">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 bg-[#D4AF37] text-black px-6 py-4 rounded-none shadow-2xl z-[9999] border border-white/20 flex gap-3 items-center"
          >
            <ShoppingBag size={18} />
            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-widest font-mono">Marketplace</h4>
              <p className="text-sm font-medium">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <div className="bg-[#110f0f] border border-white/5 p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4AF37]/[0.02] blur-3xl rounded-full select-none pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
             <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-[0.3em] font-extrabold block">
                Curated Wellness Marketplace
             </span>
             <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest font-bold">15% Member Discount Active</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase text-white tracking-tight">
            🛍️ Member Shop
          </h2>
          <p className="text-xs text-white/50 max-w-2xl font-light font-sans leading-relaxed">
            A curated distribution system for trusted wellness products, digital resources, and transformational tools seamlessly aligned with your healing journey.
          </p>
        </div>
        
        <div className="shrink-0 bg-white/5 border border-white/10 p-4 text-center min-w-[120px]">
           <div className="text-[9px] font-mono uppercase tracking-widest text-white/50 mb-1">Loyalty Points</div>
           <div className="text-xl font-bold font-serif text-[#D4AF37] flex justify-center items-center gap-1"><Award size={18} /> 1,240</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar font-mono text-[10px] uppercase tracking-widest bg-white/[0.02] p-1">
        {[
          { id: 'home', label: 'Overview' },
          { id: 'products', label: 'Physical Products' },
          { id: 'bundles', label: 'Bundles & Kits' },
          { id: 'digital', label: 'Digital & Event Access' },
          { id: 'orders', label: 'Order History' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab.id 
                ? 'border-[#D4AF37] text-[#D4AF37] font-bold bg-[#D4AF37]/5' 
                : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
         
         {/* HOME OVERVIEW */}
         {activeTab === 'home' && (
            <div className="space-y-6">
               
               {/* Smart Recommendation Banner */}
               <div className="bg-gradient-to-r from-zinc-900 to-black border border-white/10 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-1/2 h-full bg-[#D4AF37]/5 blur-2xl group-hover:bg-[#D4AF37]/10 transition-colors" />
                  <div className="relative z-10 space-y-2">
                     <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">
                        <Star size={14} /> Smart Suggestion
                     </div>
                     <h4 className="text-lg font-bold text-white uppercase font-sans">Fertility Optimization Pathway</h4>
                     <p className="text-xs text-white/60 font-sans max-w-lg">Based on your recent cycle tracking and emotional wellness logs, we recommend this curated start kit to balance stress and hormonal rhythms.</p>
                  </div>
                  <button onClick={() => triggerToast("Viewing kit details...")} className="relative z-10 shrink-0 px-6 py-3 bg-white text-black font-mono text-[10px] font-black uppercase tracking-widest hover:bg-[#D4AF37] transition-colors">
                     View Curated Bundle
                  </button>
               </div>

               {/* Browse Categories Grid */}
               <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase mt-8 mb-4">Shop by Transformation Area</h3>
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map(cat => {
                     const Icon = cat.icon;
                     return (
                        <button key={cat.id} onClick={() => triggerToast(`Browsing ${cat.name}`)} className="p-5 bg-[#110f0f] border border-white/5 hover:border-[#D4AF37]/30 text-left group transition-all">
                           <Icon size={24} className="text-[#D4AF37] mb-3 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                           <h4 className="text-sm font-bold text-white uppercase mb-1">{cat.name}</h4>
                           <p className="text-[10px] text-white/50 font-sans leading-relaxed min-h-[30px]">{cat.desc}</p>
                        </button>
                     );
                  })}
               </div>
               
               {/* Trending Products */}
               <div className="mt-8">
                 <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase mb-4 flex items-center gap-2"><TrendingUp size={24} className="text-[#D4AF37]" /> Trending Wellness Items</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                       { title: 'Divine Seed Somatic Womb Elixir', price: '₦38,000', tag: 'Top Rated' },
                       { title: 'Empress Womb Warmth Herbal Infusion', price: '₦15,000', tag: 'Restock' },
                       { title: 'Sovereign Obsidian Pelvic Cleansing Eggs', price: '₦45,000', tag: 'Limited' }
                    ].map((item, i) => (
                       <div key={i} className="bg-[#110f0f] border border-white/5 group hover:border-[#D4AF37]/40 transition-colors flex flex-col h-full">
                          <div className="aspect-square bg-zinc-950 relative border-b border-white/5">
                             <div className="absolute top-2 left-2 bg-black px-2 py-1 text-[8px] font-mono text-white/80 uppercase tracking-widest">{item.tag}</div>
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between">
                             <div>
                               <h5 className="font-bold text-white text-[13px] leading-tight mb-2 uppercase group-hover:text-[#D4AF37] transition-colors">{item.title}</h5>
                               <div className="flex gap-2 items-center mb-4">
                                  <span className="text-xs text-white/50 line-through">₦{(parseInt(item.price.replace(/\D/g, '')) * 1.15).toLocaleString()}</span>
                                  <span className="text-sm font-bold text-[#D4AF37]">{item.price}</span>
                               </div>
                             </div>
                             <button onClick={() => triggerToast("Added to your apothecary basket.")} className="w-full py-2 bg-white/5 hover:bg-[#D4AF37] hover:text-black text-white font-mono text-[9px] uppercase tracking-widest transition-colors font-bold mt-auto border border-white/10 hover:border-[#D4AF37]">
                                Add to Order
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
               </div>
            </div>
         )}

         {/* PRODUCTS */}
         {activeTab === 'products' && (
            <div className="space-y-6">
               <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase">Physical Wellness Supplements & Herbs</h3>
               <div className="bg-[#110f0f] border border-white/5 p-12 text-center">
                  <Tag className="mx-auto text-white/20 mb-4" size={32} />
                  <p className="font-mono text-[10px] uppercase text-white/50 tracking-widest">Connect with natural uterine alignment products. Handcrafted, curated, and optimized.</p>
                  <button onClick={() => setActiveTab('home')} className="mt-4 text-[#D4AF37] text-xs underline font-sans">View recommended items</button>
               </div>
            </div>
         )}

         {/* BUNDLES */}
         {activeTab === 'bundles' && (
            <div className="space-y-6">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div>
                   <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase">Wellness Bundles & Kits</h3>
                   <p className="text-xs text-white/50">Strategically grouped wellness solutions for better outcomes and value.</p>
                 </div>
               </div>

               <div className="grid md:grid-cols-2 gap-6">
                  {[
                     { name: 'Fertility Starter Bundle', price: '₦68,000', orig: '₦80,000', items: ['Ovulation Tracking Kit', 'Fertility Herbal Blend', 'Preconception Course Access'] },
                     { name: 'Hormonal Balance Reset Kit', price: '₦55,000', orig: '₦65,000', items: ['Somatic Womb Elixir', 'Wellness Tracking Journal', 'Stress Relief Audio Library'] }
                  ].map((bundle, i) => (
                     <div key={i} className="bg-zinc-950 border border-white/10 p-6 flex flex-col h-full hover:border-[#D4AF37]/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                           <h4 className="text-lg font-bold text-[#D4AF37] uppercase">{bundle.name}</h4>
                           <Package className="text-white/20" size={24} />
                        </div>
                        <ul className="space-y-2 mb-6 flex-1">
                           {bundle.items.map((bItem, j) => (
                              <li key={j} className="text-sm text-white/80 flex items-center gap-2 before:content-[''] before:w-1 before:h-1 before:bg-[#D4AF37] before:rounded-full">{bItem}</li>
                           ))}
                        </ul>
                        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                           <div>
                              <span className="text-[10px] text-white/40 block">MEMBER KIT PRICE</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-white/30 line-through">{bundle.orig}</span>
                                <span className="font-bold text-white">{bundle.price}</span>
                              </div>
                           </div>
                           <button onClick={() => triggerToast(`Added ${bundle.name} to cart.`)} className="px-4 py-2 bg-[#D4AF37] text-black font-mono text-[9px] uppercase tracking-widest font-black transition-colors hover:bg-white">
                              Add Bundle
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}
         
         {/* DIGITAL RESOURCES */}
         {activeTab === 'digital' && (
            <div className="space-y-6">
               <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase">Instant Digital Access</h3>
               <p className="text-xs text-white/50 max-w-xl">From eBooks and guided programs to course enrollment and live event ticketing.</p>
               
               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                     { type: 'Course', name: 'Preconception Wellness Plan', icon: GraduationCap },
                     { type: 'Event Ticket', name: 'Annual Somatic Retreat Pass', icon: Ticket },
                     { type: 'eBook', name: 'Pelvic Trauma Release Guide', icon: FileText }
                  ].map((item, i) => (
                     <div key={i} className="bg-[#110f0f] border border-white/5 p-5 flex flex-col justify-between h-40">
                        <div className="flex justify-between items-start">
                           <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 text-white/60 border border-white/10 tracking-widest uppercase">{item.type}</span>
                           <item.icon size={16} className="text-white/20" />
                        </div>
                        <h5 className="font-bold text-white text-sm mt-3 uppercase">{item.name}</h5>
                        <button onClick={() => triggerToast("Initiating direct access...")} className="mt-auto text-left text-[9px] font-mono text-[#D4AF37] border-b border-[#D4AF37]/30 pb-1 w-fit hover:text-white transition-colors">
                           Access Now →
                        </button>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* ORDERS */}
         {activeTab === 'orders' && (
            <div className="space-y-6">
               <h3 className="text-xl font-serif font-black tracking-tight text-white uppercase">Logistics & Order History</h3>
               <div className="bg-[#110f0f] border border-white/5">
                  {[
                     { id: 'TVR-9082', status: 'Delivered', date: 'June 01, 2026', items: 1, total: '₦45,000' },
                     { id: 'TVR-9451', status: 'Dispatched', date: 'June 05, 2026', items: 2, total: '₦35,700' }
                  ].map((order, i) => (
                     <div key={i} className="p-4 sm:p-6 border-b border-white/5 last:border-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs text-white/50">{order.id}</span>
                              <span className={`px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest border ${
                                 order.status === 'Delivered' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-brand-gold/10 border-[#D4AF37]/30 text-[#D4AF37]'
                              }`}>
                                 {order.status}
                              </span>
                           </div>
                           <p className="text-xs text-white uppercase font-bold">{order.items} Item{order.items > 1 ? 's' : ''} • {order.total}</p>
                           <p className="text-[10px] text-white/40 font-mono mt-1">Processed: {order.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <button onClick={() => triggerToast(`Fetching receipt for ${order.id}`)} className="text-[10px] font-mono uppercase text-white/50 hover:text-white">View Receipt</button>
                           <button onClick={() => triggerToast(`Tracking details requested.`)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white font-mono text-[9px] uppercase tracking-widest border border-white/10">Track</button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>
    </div>
  );
}
