import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from '../components/SEO';
import { ShoppingBag, HelpCircle, Sparkles, ExternalLink, Globe, Award, ShieldAlert, ShoppingCart, MessageCircle } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import EditableText from '../components/EditableText';
import { Link } from 'react-router-dom';

interface ProductItem {
  id: string;
  title: string;
  price: string;
  memberDiscountPrice?: string;
  currency: string;
  description: string;
  imageUrl: string;
  externalLink: string;
  isExternal?: boolean;
  isDigital?: boolean;
  downloadUrl?: string;
}

export default function ProductsPage() {
  const { content } = useContent();
  const { userData, hasActiveMembership } = useAuth();
  const { addToCart, totalItems } = useCart();
  const [activeTab, setActiveTab] = useState<'all' | 'in_house' | 'external'>('all');
  
  const productSettings = JSON.parse(content.productPageSettingsJson || '{}');
  const generalSettings = JSON.parse(content.generalSettingsJson || '{}');
  const whatsappPhone = generalSettings.whatsappPhone || content.contactPhone;
  
  const showExternal = productSettings.showExternalSource !== false;
  const showInHouse = productSettings.showSignaturePreparations !== false;

  const [externalProducts, setExternalProducts] = useState<ProductItem[]>([]);
  const [externalLoading, setExternalLoading] = useState(false);
  const [externalError, setExternalError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const externalSources = JSON.parse(content.externalSourcesJson || '[]');

  // 1. Get in-house local products from content.productsListJson with hardcoded fallback
  let inHouseProducts: ProductItem[] = [];
  if (showInHouse) {
    try {
      if (content.productsListJson) {
        const parsed = JSON.parse(content.productsListJson);
        if (Array.isArray(parsed)) {
          inHouseProducts = parsed.map(p => ({
            ...p,
            isExternal: false
          }));
        }
      }
    } catch (err) {
      console.warn("Could not parse productsListJson", err);
    }
  }

  // 2. Load external products using the server-side proxy (parallel fetch from all active sources)
  useEffect(() => {
    const fetchAllExternalSources = async () => {
      if (!showExternal) {
        setExternalProducts([]);
        return;
      }
      
      const activeSources = Array.isArray(externalSources) ? externalSources.filter((s: any) => s.active && s.url && s.url.trim() !== "") : [];
      
      if (activeSources.length === 0) {
        setExternalProducts([]);
        return;
      }
      
      setExternalLoading(true);
      setExternalError(null);
      
      try {
        const fetchPromises = activeSources.map(async (source: any, sourceIdx: number) => {
          try {
            // Use server-side CORS bypass API proxy, with direct fetch as automatic client-side fallback
            const proxyUrl = `/api/proxy-products?url=${encodeURIComponent(source.url)}`;
            let response;
            try {
              response = await fetch(proxyUrl);
            } catch (proxyErr) {
              console.warn(`Proxy fetch failed for ${source.name}, trying direct connection:`, proxyErr);
            }

            if (!response || !response.ok) {
              response = await fetch(source.url);
            }

            if (!response.ok) return [];
            const data = await response.json();
            
            // Handle lists that are directly arrays or nested within search payloads
            let list: any[] = [];
            if (Array.isArray(data)) {
              list = data;
            } else if (data && typeof data === 'object') {
              const arrayKeys = ["products", "items", "data", "results", "list"];
              const foundKey = arrayKeys.find(key => Array.isArray(data[key]));
              if (foundKey) {
                list = data[foundKey];
              } else {
                list = [data]; // Single product response
              }
            }
            
            return list.map((item: any, itemIdx: number) => {
              const id = item.id || item.productId || item.asin || item.itemId || `ext-${sourceIdx}-${itemIdx}-${Math.random()}`;
              const title = item.title || item.name || item.productName || "External Product";
              const price = item.price !== undefined ? String(item.price) : (item.salePrice !== undefined ? String(item.salePrice) : "0");
              const currency = item.currency || (price !== "0" && !isNaN(Number(price)) ? "USD" : "NGN");
              const description = item.description || item.desc || item.summary || "Premium partner item.";
              const imageUrl = item.image || item.imageUrl || item.imgUrl || item.img || item.photo || "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=300";
              const externalLink = item.externalLink || item.link || item.url || item.affiliateLink || item.affiliateUrl || item.buyUrl || "";

              return {
                id: String(id),
                title,
                price,
                currency,
                description,
                imageUrl,
                externalLink,
                isExternal: true,
                sourceName: source.name
              };
            });
          } catch (e) {
            console.error(`Failed to fetch and parse from source ${source.name}:`, e);
            return [];
          }
        });

        const results = await Promise.all(fetchPromises);
        const allFetchedProducts = results.flat();
        setExternalProducts(allFetchedProducts);
        
      } catch (err: any) {
        console.error("External sources aggregated load failure:", err.message);
        setExternalError(err.message || "Failed to parse API payloads.");
      } finally {
        setExternalLoading(false);
      }
    };

    fetchAllExternalSources();
  }, [content.externalSourcesJson, showExternal]);

  // 3. Combine both lists
  const combinedProducts = [...inHouseProducts, ...externalProducts];

  // 4. Decide which products to render based on tab selection and search
  const filteredProducts = combinedProducts.filter(p => {
    const isTabMatch = activeTab === 'all' 
      ? true 
      : activeTab === 'in_house' 
        ? !p.isExternal 
        : p.isExternal;
    
    const isSearchMatch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return isTabMatch && isSearchMatch;
  });

  const renderedProducts = filteredProducts;

  const generateDynamicWhatsAppLink = (product: any) => {
    if (product.orderLink && product.orderLink.startsWith('https://wa.me')) {
      // If it exists, check if we should update the phone number
      const phone = whatsappPhone.replace(/\s+/g, '').replace('+', '');
      // If the link contains the phone, keep it, otherwise rebuild
      if (product.orderLink.includes(phone)) return product.orderLink;
    }
    
    // Fallback/Rebuild
    const phone = whatsappPhone.replace(/\s+/g, '').replace('+', '');
    const message = `Hi, I am interested in ordering: *${product.title}* (₦${product.price}). Please provide more details.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  // Tabs list based on visibility
  const availableTabs = [
    { id: 'all', label: 'All Preparations', count: combinedProducts.length, visible: true },
    { id: 'in_house', label: 'Dr. FID Signatures', count: inHouseProducts.length, visible: showInHouse },
    { id: 'external', label: 'Partner & Marketplace Network', count: externalProducts.length, visible: showExternal }
  ].filter(t => t.visible);

  return (
    <>
      <SEO 
        title={content.productsTitle || "Our Curated Products"} 
        description="Explore custom botanical preparations and external partner products recommended for intimate, somatic, and reproductive restoration."
      />
      
      <div className="bg-brand-black text-white min-h-screen flex flex-col justify-between">
        <Navigation />
        
        <main className="pt-32 flex-grow">
          {/* Header Hero Section */}
          <section className="py-20 px-6 relative overflow-hidden text-center border-b border-white/5 bg-gradient-to-b from-brand-black via-[rgba(180,31,45,0.03)] to-brand-black">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_45%,rgba(180,31,45,0.06)_0%,transparent_50%)] pointer-events-none" />
            
            <div className="max-w-4xl mx-auto space-y-6 relative z-10">
              <span className="text-[10px] uppercase font-black tracking-[0.43em] text-brand-gold bg-brand-gold/5 border border-brand-gold/15 px-4 py-2.5 rounded-none inline-block">
                <EditableText field="productsSub" />
              </span>
              
              <h1 className="text-4xl md:text-6xl font-sans font-black tracking-tighter text-white uppercase leading-none">
                <EditableText field="productsTitle" />
              </h1>
              
              <p className="text-sm md:text-base font-serif text-white/70 max-w-2xl mx-auto leading-relaxed italic">
                <EditableText field="productsDesc" />
              </p>
            </div>
          </section>

          {/* Catalog Tab View Filter Actions */}
          <section className="py-8 bg-brand-black border-b border-white/5 sticky top-36 z-30 backdrop-blur-md bg-brand-black/95">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Category buttons */}
              <div className="flex flex-wrap gap-2">
                {availableTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-5 py-3 text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer select-none rounded-none flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "bg-brand-gold text-brand-black font-black"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {tab.id === 'in_house' ? <Award size={12} /> : tab.id === 'external' ? <Globe size={12} /> : <ShoppingBag size={12} />}
                    <span>{tab.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${activeTab === tab.id ? 'bg-brand-black text-brand-gold' : 'bg-white/15 text-white/80'}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Quick source details summary */}
              {showExternal && (
                <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1.5 self-end md:self-auto text-right">
                  <Sparkles size={11} className="text-brand-gold" />
                  <span>Aggregating {renderedProducts.length} curated selections from {externalSources.filter((s:any)=>s.active).length} {externalSources.filter((s:any)=>s.active).length === 1 ? 'network' : 'networks'}</span>
                </div>
              )}
                <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Search preparations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white/5 border border-white/10 px-4 py-2 text-[10px] uppercase font-black tracking-widest focus:border-brand-gold focus:outline-none w-48 md:w-64 transition-all"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <Link to="/checkout" className="flex items-center gap-2 bg-white text-brand-black px-4 py-2 font-black text-[10px] uppercase group">
                    <ShoppingCart size={14} className="group-hover:scale-110 transition-transform" /> View Cart ({totalItems})
                  </Link>
                </div>
            </div>
          </section>

          {/* Main Products Grid Display */}
          <section className="py-16 px-6 max-w-7xl mx-auto">
            {externalLoading && activeTab === 'external' && externalProducts.length === 0 ? (
              /* Loading shimmer state */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((shimmerId) => (
                  <div key={shimmerId} className="bg-white/[0.02] border border-white/5 animate-pulse flex flex-col h-[520px]">
                    <div className="w-full h-80 bg-white/5" />
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="h-2 bg-white/10 rounded w-1/4" />
                        <div className="h-5 bg-white/10 rounded" />
                        <div className="h-12 bg-white/10 rounded mt-4" />
                      </div>
                      <div className="h-12 bg-white/10 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : renderedProducts.length === 0 ? (
              /* Empty product list state */
              <div className="bg-white/[0.02] border border-white/5 py-24 px-8 text-center max-w-2xl mx-auto">
                <HelpCircle size={48} className="mx-auto text-brand-gold mb-4 opacity-75" />
                <h3 className="text-lg font-black uppercase tracking-wider text-white">No Items Available</h3>
                <p className="text-sm font-serif text-white/50 mt-2 max-w-md mx-auto">
                  {activeTab === 'external' 
                    ? "Currently syncing with partner marketplace feeds. Please check back shortly for updated restorative selections."
                    : "No products added yet. Add preparations in your Admin Dashboard and they will automatically build here."}
                </p>
                {activeTab === 'external' && externalError && (
                  <div className="mt-6 p-4 bg-brand-red/10 border border-brand-red/20 text-brand-red font-mono text-xs max-w-sm mx-auto flex items-center gap-2">
                    <ShieldAlert size={14} className="flex-shrink-0" />
                    <span className="truncate">Sync Notice: {externalError}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Actively rendered products */
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {renderedProducts.map((p: any) => {
                    const isAffiliateMode = p.orderMethod === 'affiliate' || (p.isExternal && !!p.externalLink);
                    const isWhatsAppMode = p.orderMethod === 'whatsapp';
                    const activeOrderLink = p.orderLink || p.externalLink;
                    const priceFormatted = !isNaN(Number(String(p.price).replace(/[^0-9.]/g, '')))
                      ? Number(String(p.price).replace(/[^0-9.]/g, '')).toLocaleString()
                      : p.price;

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        key={p.id}
                        className="group flex flex-col h-[520px] bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all duration-500 rounded-none relative overflow-hidden"
                      >
                        {/* Source alignment badge */}
                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
                          {p.isExternal ? (
                            <span className="bg-blue-950/90 text-blue-300 border border-blue-800/60 text-[8px] font-black tracking-widest uppercase px-3 py-1.5 flex items-center gap-1 backdrop-blur-md">
                              <Globe size={10} /> {p.sourceName || "Partner Network"}
                            </span>
                          ) : (
                            <span className="bg-brand-red/90 text-white border border-brand-red/50 text-[8px] font-black tracking-widest uppercase px-3 py-1.5 flex items-center gap-1 backdrop-blur-md">
                              <Award size={10} /> Dr. FID Signature
                            </span>
                          )}
                          {isAffiliateMode && (
                            <span className="bg-emerald-950/90 text-emerald-400 border border-emerald-800/60 text-[7px] font-black tracking-widest uppercase px-2 py-1 flex items-center gap-1 backdrop-blur-md w-fit">
                              <ExternalLink size={9} /> Direct Marketplace Item
                            </span>
                          )}
                        </div>

                        {/* Product Visual Photo */}
                        <div className="h-80 w-full overflow-hidden bg-white/5 relative flex-shrink-0">
                          <img 
                            src={p.imageUrl} 
                            alt={p.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                        </div>

                        {/* Text and information block */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div className="space-y-2 min-w-0">
                            {/* Product Title */}
                            <h3 className="text-xl font-sans font-black tracking-tight text-white group-hover:text-brand-gold transition-colors truncate">
                              {p.title}
                            </h3>
                            
                            {/* Product Short Description */}
                            <p className="text-xs font-serif text-white/50 leading-relaxed line-clamp-2 italic h-10 overflow-hidden">
                              {p.description}
                            </p>
                          </div>

                          {/* Purchase & Action panel */}
                          <div className="pt-4 flex items-center justify-between border-t border-white/5 gap-4">
                            <div className="flex-shrink-0 min-w-0">
                              <span className="text-[10px] font-mono text-brand-gold/80 block uppercase tracking-wider font-bold">
                                {isAffiliateMode ? "Marketplace Ref" : isWhatsAppMode ? "Social Shop" : "In-Stock Formulation"}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={hasActiveMembership && p.memberDiscountPrice && p.memberDiscountPrice.trim() !== '' ? "text-sm font-mono font-black text-white/40 line-through" : "text-lg font-mono font-black text-brand-gold"}>
                                  {p.currency === "NGN" ? "₦" : p.currency === "USD" ? "$" : `${p.currency} `}
                                  {priceFormatted}
                                </span>
                                {hasActiveMembership && p.memberDiscountPrice && p.memberDiscountPrice.trim() !== '' && (
                                  <span className="text-lg font-mono font-black text-brand-gold">
                                    {p.currency === "NGN" ? "₦" : p.currency === "USD" ? "$" : `${p.currency} `}
                                    {Number(String(p.memberDiscountPrice).replace(/[^0-9.]/g, '')).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {isAffiliateMode ? (
                              <a
                                href={activeOrderLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white text-brand-black hover:bg-brand-gold px-4 py-3 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300"
                              >
                                <span>Buy Now</span>
                                <ExternalLink size={10} />
                              </a>
                            ) : isWhatsAppMode ? (
                              <a
                                href={generateDynamicWhatsAppLink(p)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-500 text-white hover:bg-white hover:text-emerald-500 px-4 py-3 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 shadow-lg shadow-emerald-500/10"
                              >
                                <span>Order via WhatsApp</span>
                                <MessageCircle size={10} />
                              </a>
                            ) : (
                              <button
                                onClick={() => addToCart({ 
                                  id: p.id, 
                                  title: p.title, 
                                  price: p.price, 
                                  memberDiscountPrice: p.memberDiscountPrice,
                                  currency: p.currency, 
                                  imageUrl: p.imageUrl,
                                  isDigital: p.isDigital,
                                  downloadUrl: p.downloadUrl
                                })}
                                className="bg-brand-gold text-brand-black group-hover:bg-white group-hover:text-brand-black px-4 py-3 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300"
                              >
                                <span>Add to Cart</span>
                                <ShoppingCart size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
