import React, { useState } from "react";
import { useContent } from "../../context/ContentContext";
import { Trash2, Plus, ArrowUp, ArrowDown, Upload, Globe, Award, Sparkles, FileText, DollarSign, Link2, Eye, EyeOff, Check, MessageCircle, ShoppingCart, ExternalLink, Star } from "lucide-react";
import { ImageUploader } from "../../pages/AdminPage";

interface ProductItem {
  id: string;
  title: string;
  price: string;
  currency: string;
  description: string;
  imageUrl: string;
  orderMethod?: 'cart' | 'affiliate' | 'whatsapp';
  orderLink?: string;
  externalLink?: string; // Legacy
  featured?: boolean;
}

export default function AdminProductsPanel() {
  const { content, updateContentField, saveContentChanges } = useContent();
  const [activeTab, setActiveTab] = useState<"catalog" | "in_house" | "checkout_settings">("catalog");

  // Load and parse Local products from productsListJson
  let products: ProductItem[] = [];
  try {
    if (content.productsListJson) {
      const parsed = JSON.parse(content.productsListJson);
      if (Array.isArray(parsed)) {
        // Hydrate featured status from featuredProductIdsJson
        let featuredIds: string[] = [];
        try {
          featuredIds = JSON.parse(content.featuredProductIdsJson || "[]");
        } catch {}

        products = parsed.map(p => ({
          ...p,
          featured: featuredIds.includes(p.id)
        }));
      }
    }
  } catch (err) {
    console.error("Could not parse productsListJson", err);
  }

  // Update overall productsListJson
  const saveProductsListChange = (updated: ProductItem[]) => {
    updateContentField("productsListJson", JSON.stringify(updated, null, 2));
  };

  // Modify individual product property
  const handleModifyProduct = (index: number, key: keyof ProductItem, value: any) => {
    const nextProducts = [...products];
    const updatedProd = {
      ...nextProducts[index],
      [key]: value
    };
    
    // Auto-sync WhatsApp link if in whatsapp mode and relevant fields changed
    if (updatedProd.orderMethod === "whatsapp" && ["title", "price", "description", "currency"].includes(key)) {
      updatedProd.orderLink = generateWhatsAppLink(updatedProd);
    }
    
    nextProducts[index] = updatedProd;

    // Handle featured toggle sync
    if (key === 'featured') {
      let featuredIds: string[] = [];
      try {
        featuredIds = JSON.parse(content.featuredProductIdsJson || "[]");
      } catch {}
      
      const prodId = updatedProd.id;
      if (value) {
        if (!featuredIds.includes(prodId)) {
          featuredIds.push(prodId);
        }
      } else {
        featuredIds = featuredIds.filter(id => id !== prodId);
      }
      updateContentField("featuredProductIdsJson", JSON.stringify(featuredIds));
    }

    saveProductsListChange(nextProducts);
  };

  // Add new in-house product boilerplate
  const handleAddProduct = () => {
    const newProduct: ProductItem = {
      id: `prod_${Date.now()}`,
      title: "New Intimate Formulation",
      price: "15,000",
      currency: "NGN",
      description: "Organic botanical extract curated to nourish pelvic tissue, supporting biological restorative routines.",
      imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=600",
      orderMethod: 'cart'
    };
    saveProductsListChange([...products, newProduct]);
  };

  const generateWhatsAppLink = (product: ProductItem) => {
    let generalConfig: any = {};
    try { generalConfig = JSON.parse(content.generalSettingsJson || "{}"); } catch {}
    const phone = generalConfig.whatsappPhone || "2340000000000";
    const cleanPhone = phone.replace(/\D/g, '');
    
    const message = `Hello Dr. FID, I would like to order the following preparation:\n\n*Product:* ${product.title}\n*Price:* ${product.currency}${product.price}\n\n${product.description}\n\nPlease confirm availability and payment details.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // Delete product
  const handleDeleteProduct = (index: number) => {
    const nextProducts = products.filter((_, idx) => idx !== index);
    saveProductsListChange(nextProducts);
  };

  // Move product up/down for reordering
  const handleMoveProduct = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === products.length - 1) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const nextProducts = [...products];
    const temp = nextProducts[index];
    nextProducts[index] = nextProducts[swapIndex];
    nextProducts[swapIndex] = temp;
    saveProductsListChange(nextProducts);
  };

  const productSettings = JSON.parse(content.productPageSettingsJson || '{}');
  const updateProductSettings = (key: string, val: boolean) => {
    updateContentField("productPageSettingsJson", JSON.stringify({ ...productSettings, [key]: val }, null, 2));
  };

  const externalSources = JSON.parse(content.externalSourcesJson || '[]');
  const updateExternalSources = (newSources: any[]) => {
    updateContentField("externalSourcesJson", JSON.stringify(newSources, null, 2));
  };

  const addExternalSource = () => {
    const next = [...externalSources, { name: "New Source", url: "", active: true }];
    updateExternalSources(next);
  };

  const removeExternalSource = (idx: number) => {
    const next = externalSources.filter((_: any, i: number) => i !== idx);
    updateExternalSources(next);
  };

  const editExternalSource = (idx: number, field: string, value: any) => {
    const next = [...externalSources];
    next[idx] = { ...next[idx], [field]: value };
    updateExternalSources(next);
  };

  return (
    <div className="space-y-8">
      {/* Sub tabs inside products panel */}
      <div className="flex border-b border-white/5 pb-2 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-5 py-3 text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "catalog"
              ? "bg-brand-red text-white"
              : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          🌐 External Catalog Source & Typography
        </button>
        <button
          onClick={() => setActiveTab("in_house")}
          className={`px-5 py-3 text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "in_house"
              ? "bg-brand-red text-white"
              : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          🏺 Dr. FID Signatures Editor ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("checkout_settings" as any)}
          className={`px-5 py-3 text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
            activeTab === "checkout_settings"
              ? "bg-brand-red text-white"
              : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          ⚙️ Checkout, Payments & WhatsApp
        </button>
      </div>

      {/* Persistence helper for this panel */}
      <div className="flex justify-end">
         <button 
           onClick={saveContentChanges}
           className="px-6 py-2 bg-brand-gold text-brand-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
         >
           <Check size={14} /> Persist Module Changes
         </button>
      </div>

      {activeTab === "checkout_settings" && (
        <div className="space-y-6">
          <div className="bg-white/[0.01] border border-white/5 p-6 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
               WhatsApp Order Routing
            </h4>
            
            {(() => {
              let generalConfig: any = {};
              try { generalConfig = JSON.parse(content.generalSettingsJson || "{}"); } catch {}
              
              const updateGeneral = (key: string, val: string) => {
                 updateContentField("generalSettingsJson", JSON.stringify({ ...generalConfig, [key]: val }, null, 2));
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">WhatsApp Routing Phone (For Orders)</label>
                    <input
                      type="text"
                      value={generalConfig.whatsappPhone || ""}
                      onChange={(e) => updateGeneral("whatsappPhone", e.target.value)}
                      className="w-full bg-brand-black border border-white/10 text-white font-mono text-xs px-4 py-3 focus:border-brand-gold outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">WhatsApp Handling Method</label>
                    <select
                      value={generalConfig.whatsappMethod || "REDIRECT"}
                      onChange={(e) => updateGeneral("whatsappMethod", e.target.value)}
                      className="w-full bg-brand-black border border-white/10 text-white font-mono text-xs px-4 py-3 focus:border-brand-gold outline-none cursor-pointer"
                    >
                      <option value="REDIRECT">Redirect (wa.me Link Popup)</option>
                      <option value="API">Headless API (Cloud API Setup Required)</option>
                    </select>
                  </div>

                  {generalConfig.whatsappMethod === "API" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">WhatsApp API Key (Bearer Token)</label>
                        <input
                          type="password"
                          value={generalConfig.whatsappApiKey || ""}
                          onChange={(e) => updateGeneral("whatsappApiKey", e.target.value)}
                          className="w-full bg-brand-black border border-white/10 text-white font-mono text-xs px-4 py-3 focus:border-brand-gold outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">WhatsApp Business Account ID</label>
                        <input
                          type="text"
                          value={generalConfig.whatsappBusinessId || ""}
                          onChange={(e) => updateGeneral("whatsappBusinessId", e.target.value)}
                          className="w-full bg-brand-black border border-white/10 text-white font-mono text-xs px-4 py-3 focus:border-brand-gold outline-none"
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="bg-white/[0.01] border border-white/5 p-6 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
               Gateway Keys (Paystack & Flutterwave)
            </h4>
            
            {(() => {
              let paymentConfig: any = {};
              try { paymentConfig = JSON.parse(content.paymentSettingsJson || "{}"); } catch {}
              
              const updatePayment = (key: string, val: string) => {
                 updateContentField("paymentSettingsJson", JSON.stringify({ ...paymentConfig, [key]: val }, null, 2));
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Paystack Secret Key</label>
                    <input
                      type="password"
                      value={paymentConfig.paystackSecretKey || ""}
                      onChange={(e) => updatePayment("paystackSecretKey", e.target.value)}
                      className="w-full bg-brand-black border border-white/10 text-white font-mono text-xs px-4 py-3 focus:border-brand-gold outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Flutterwave Public Key</label>
                    <input
                      type="text"
                      value={paymentConfig.flutterwavePublicKey || ""}
                      onChange={(e) => updatePayment("flutterwavePublicKey", e.target.value)}
                      className="w-full bg-brand-black border border-white/10 text-white font-mono text-xs px-4 py-3 focus:border-brand-gold outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Flutterwave Secret Key</label>
                    <input
                      type="password"
                      value={paymentConfig.flutterwaveSecretKey || ""}
                      onChange={(e) => updatePayment("flutterwaveSecretKey", e.target.value)}
                      className="w-full bg-brand-black border border-white/10 text-white font-mono text-xs px-4 py-3 focus:border-brand-gold outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Flutterwave Webhook Secret Hash</label>
                    <input
                      type="password"
                      value={paymentConfig.flutterwaveWebhookSecretHash || ""}
                      onChange={(e) => updatePayment("flutterwaveWebhookSecretHash", e.target.value)}
                      className="w-full bg-brand-black border border-white/10 text-white font-mono text-xs px-4 py-3 focus:border-brand-gold outline-none"
                      placeholder="e.g. my_secret_hash_123"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2 mt-4 pt-4 border-t border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-brand-gold mb-2">Webhook URLs for your Gateway Dashboard:</p>
                    <div className="space-y-2">
                       <p className="text-[9px] text-white/50 font-mono"><strong>Paystack Webhook:</strong> {window.location.origin}/api/payments/webhook/paystack</p>
                       <p className="text-[9px] text-white/50 font-mono"><strong>Flutterwave Webhook:</strong> {window.location.origin}/api/payments/webhook/flutterwave</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {activeTab === "catalog" && (
        <div className="space-y-6">
          {/* Visibility Master Control for This Tab */}
          <div className="bg-white/[0.03] border border-white/5 p-4">
            <label className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-brand-gold" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Enable External Partner Catalog</span>
                  <span className="text-[8px] text-white/30 uppercase tracking-widest">Exposes marketplace search to your storefront</span>
                </div>
              </div>
              <div 
                onClick={(e) => { e.stopPropagation(); updateProductSettings("showExternalSource", !productSettings.showExternalSource); }}
                className={`w-10 h-5 rounded-full relative transition-colors ${productSettings.showExternalSource ? 'bg-brand-gold' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${productSettings.showExternalSource ? 'left-6' : 'left-1'}`} />
              </div>
            </label>
          </div>

          {/* Multi-Source Manager */}
          {productSettings.showExternalSource && (
            <div className="bg-brand-gold/5 border border-brand-gold/20 p-6 space-y-6 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-brand-gold" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-brand-gold">Multi-Marketplace Connectors</h3>
                </div>
                <button 
                  onClick={addExternalSource}
                  className="px-4 py-2 bg-brand-gold text-brand-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
                >
                  <Plus size={12} /> Add Marketplace Source
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {externalSources.map((source: any, idx: number) => (
                  <div key={idx} className="bg-brand-black/60 border border-white/10 p-5 flex flex-col md:flex-row gap-4 items-start md:items-center group">
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-white/40 tracking-widest">Marketplace Name / Identity</label>
                        <input 
                          value={source.name}
                          onChange={e => editExternalSource(idx, "name", e.target.value)}
                          placeholder="e.g. Amazon Affiliate, Jumia, Etsy"
                          className="w-full bg-white/5 border-b border-white/10 focus:border-brand-gold outline-none text-xs p-2 text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-white/40 tracking-widest">Inventory API Endpoint (REST JSON)</label>
                        <input 
                          value={source.url}
                          onChange={e => editExternalSource(idx, "url", e.target.value)}
                          placeholder="https://api.external.com/products"
                          className="w-full bg-white/5 border-b border-white/10 focus:border-brand-gold outline-none text-xs p-2 text-white font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => editExternalSource(idx, "active", !source.active)}
                        className={`p-2.5 rounded transition-colors ${source.active ? 'bg-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-brand-black' : 'bg-white/5 text-white/20 hover:bg-white/10 hover:text-white'}`}
                        title={source.active ? "Deactivate Source" : "Activate Source"}
                      >
                        {source.active ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button 
                        onClick={() => removeExternalSource(idx)}
                        className="p-2.5 bg-brand-red/5 text-white/20 hover:bg-brand-red hover:text-white transition-colors rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {externalSources.length === 0 && (
                  <div className="py-12 text-center border border-dashed border-white/10 text-white/20 text-[10px] uppercase font-black tracking-[0.3em] bg-white/[0.02]">
                    No external inventory sources configured.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Top level copywriting typography */}
          <div className="bg-white/[0.01] border border-white/5 p-6 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
              🎨 Page Typography & Copywriting
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Catalog Sub-Header</label>
                <input
                  type="text"
                  value={content.productsSub || ""}
                  onChange={(e) => updateContentField("productsSub", e.target.value)}
                  className="w-full bg-brand-black border border-white/10 text-white font-mono text-xs px-4 py-3 focus:border-brand-gold outline-none"
                  placeholder="e.g., PHYTO-MEDICINAL & INTENSIVE CARE SELECTIONS"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Catalog Page Main Title</label>
                <input
                  type="text"
                  value={content.productsTitle || ""}
                  onChange={(e) => updateContentField("productsTitle", e.target.value)}
                  className="w-full bg-brand-black border border-white/10 text-white font-mono text-xs px-4 py-3 focus:border-brand-gold outline-none"
                  placeholder="e.g., Our Curated Products"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Catalog Page Mini Bio / Description</label>
                <textarea
                  value={content.productsDesc || ""}
                  onChange={(e) => updateContentField("productsDesc", e.target.value)}
                  rows={2}
                  className="w-full bg-brand-black border border-white/10 text-white font-mono text-xs p-4 focus:border-brand-gold outline-none leading-relaxed"
                  placeholder="Enter a descriptive paragraph explaining the purpose of these selections."
                />
              </div>
            </div>
          </div>

          {/* External Source Setup */}
          <div className="bg-white/[0.01] border border-white/5 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="text-brand-gold" size={16} />
              <h4 className="text-xs font-black uppercase tracking-wider text-brand-gold">
                🗺️ External Products Inventory Source API
              </h4>
            </div>
            
            <p className="text-[10px] text-white/50 leading-relaxed uppercase tracking-wider">
              In addition to your manually curated Dr. FID products, you can list products from any REST API, public database, or Shopify shop feed. Our backend routes secure inquiries to bypass browser-specific CORS issues automatically.
            </p>

            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">External API Feed Source URL</label>
              <input
                type="text"
                value={content.productsExternalUrl || ""}
                onChange={(e) => updateContentField("productsExternalUrl", e.target.value)}
                className="w-full bg-brand-black border border-white/10 text-white font-mono text-xs px-4 py-3.5 focus:border-brand-gold outline-none"
                placeholder="e.g., https://fakestoreapi.com/products"
              />
              <span className="text-[9px] font-mono text-brand-gold/60 block mt-1">
                💡 Current Source Default: <strong className="select-all">https://fakestoreapi.com/products/category/women's clothing</strong> (Use this for dynamic testing).
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "in_house" && (
        <div className="space-y-6">
          {/* Visibility Master Control for This Tab */}
          <div className="bg-white/[0.03] border border-white/5 p-4">
            <label className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2">
                <Award size={14} className="text-brand-gold" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Enable Dr. FID Signatures</span>
                  <span className="text-[8px] text-white/30 uppercase tracking-widest">Show your curated formulations on the storefront</span>
                </div>
              </div>
              <div 
                onClick={(e) => { e.stopPropagation(); updateProductSettings("showSignaturePreparations", !productSettings.showSignaturePreparations); }}
                className={`w-10 h-5 rounded-full relative transition-colors ${productSettings.showSignaturePreparations ? 'bg-brand-gold' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${productSettings.showSignaturePreparations ? 'left-6' : 'left-1'}`} />
              </div>
            </label>
          </div>
          <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-4">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">🏺 Manually Curated Signature Listings</h4>
              <p className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Edit custom formulas with price and images.</p>
            </div>
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-brand-gold text-brand-black hover:bg-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1 cursor-pointer"
            >
              <Plus size={11} /> Add New Formulation
            </button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/10 bg-white/[0.01]">
              <Sparkles size={24} className="mx-auto text-brand-gold mb-2 opacity-50" />
              <p className="text-[10px] uppercase font-black tracking-widest text-white/40">No Signature Preparations Created</p>
              <button
                onClick={handleAddProduct}
                className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[9px] uppercase font-mono tracking-widest"
              >
                Add First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {products.map((p, idx) => (
                <div 
                  key={p.id || idx}
                  className="bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 p-6 space-y-6 relative group transition-colors duration-300"
                >
                  {/* Top quick actions */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[9px] font-mono font-bold text-brand-gold uppercase tracking-widest bg-brand-gold/10 px-2.5 py-1">
                      🔬 Formulation Block #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleModifyProduct(idx, "featured", !p.featured)}
                        className={`p-1.5 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                          p.featured 
                            ? "bg-brand-gold text-brand-black" 
                            : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                        }`}
                        title={p.featured ? "Remove from Featured" : "Add to Featured"}
                      >
                        <Star size={12} fill={p.featured ? "currentColor" : "none"} />
                        {p.featured ? "Featured" : "Regular"}
                      </button>
                      <button
                        onClick={() => handleMoveProduct(idx, "up")}
                        disabled={idx === 0}
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-white disabled:opacity-40"
                        title="Move Up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => handleMoveProduct(idx, "down")}
                        disabled={idx === products.length - 1}
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-white disabled:opacity-40"
                        title="Move Down"
                      >
                        <ArrowDown size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(idx)}
                        className="p-1.5 bg-brand-red/10 hover:bg-brand-red/20 text-brand-red ml-2"
                        title="Delete Formulation"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Visual Media Uploader column */}
                    <div className="md:col-span-1 space-y-4">
                      <span className="text-[9px] uppercase font-black tracking-wider text-white/30 block">Image Source</span>
                      <ImageUploader
                        fieldKey="productsListJson" // Dummy reference to satisfy interface
                        label="Product Listing Image"
                        currentValue={p.imageUrl}
                        onUploadSuccess={(url) => handleModifyProduct(idx, "imageUrl", url)}
                      />
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-white/40 block">Manual Image Direct Link URL</label>
                        <input
                          type="text"
                          value={p.imageUrl}
                          onChange={(e) => handleModifyProduct(idx, "imageUrl", e.target.value)}
                          className="w-full bg-brand-black border border-white/5 text-white/80 font-mono text-[10px] px-2 py-1.5 outline-none focus:border-white/20"
                        />
                      </div>
                    </div>

                    {/* Meta info details columns */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-wider text-white/40 block">Product/Formulation title</label>
                          <input
                            type="text"
                            value={p.title}
                            onChange={(e) => handleModifyProduct(idx, "title", e.target.value)}
                            className="w-full bg-brand-black border border-white/10 text-white font-sans text-xs px-3 py-2.5 outline-none focus:border-brand-gold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-wider text-white/40 block">Currency</label>
                          <select
                            value={p.currency}
                            onChange={(e) => handleModifyProduct(idx, "currency", e.target.value)}
                            className="w-full bg-brand-black border border-white/10 text-white font-mono text-xs px-2 py-2.5 outline-none focus:border-brand-gold"
                          >
                            <option value="NGN">NGN (₦)</option>
                            <option value="USD">USD ($)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-[9px] font-black uppercase tracking-wider text-white/40 block flex items-center gap-1">
                            <DollarSign size={10} /> Cost/Price Amount
                          </label>
                          <input
                            type="text"
                            value={p.price}
                            onChange={(e) => handleModifyProduct(idx, "price", e.target.value)}
                            className="w-full bg-brand-black border border-white/10 text-white font-mono text-xs px-3 py-2.5 outline-none focus:border-brand-gold"
                            placeholder="e.g., 45,000"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-wider text-white/40 block">Short Restoratives Description</label>
                        <textarea
                          value={p.description}
                          onChange={(e) => handleModifyProduct(idx, "description", e.target.value)}
                          rows={2}
                          className="w-full bg-brand-black border border-white/10 text-white font-serif text-xs p-3 outline-none focus:border-brand-gold leading-relaxed"
                          placeholder="State clinical components, uses, and instructions."
                        />
                      </div>

                      {/* Ordering Method Controls */}
                      <div className="pt-4 border-t border-white/5 space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: 'cart', label: 'Standard Cart Checkout', icon: <ShoppingCart size={10} /> },
                            { id: 'whatsapp', label: 'WhatsApp Direct Order', icon: <MessageCircle size={10} /> },
                            { id: 'affiliate', label: 'External Marketplace', icon: <ExternalLink size={10} /> }
                          ].map(method => (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => {
                                const nextProducts = [...products];
                                const updatedProd = { ...nextProducts[idx], orderMethod: method.id as any };
                                if (method.id === 'whatsapp' && !updatedProd.orderLink) {
                                  updatedProd.orderLink = generateWhatsAppLink(updatedProd);
                                }
                                nextProducts[idx] = updatedProd;
                                saveProductsListChange(nextProducts);
                              }}
                              className={`px-3 py-2 text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${
                                (p.orderMethod || 'cart') === method.id
                                  ? "bg-brand-gold text-brand-black border-brand-gold"
                                  : "bg-white/[0.03] text-white/40 border border-white/5 hover:text-white hover:bg-white/10"
                              }`}
                            >
                              {method.icon} {method.label}
                            </button>
                          ))}
                        </div>

                        {p.orderMethod === 'whatsapp' && (
                          <div className="bg-brand-black/40 border border-brand-gold/20 p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <label className="text-[9px] font-black uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
                                <MessageCircle size={11} /> WhatsApp API Link configuration
                              </label>
                              <button 
                                onClick={() => handleModifyProduct(idx, "orderLink", generateWhatsAppLink(p))}
                                className="text-[8px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                              >
                                🔄 Re-Sync Link from Description
                              </button>
                            </div>
                            <input
                              type="text"
                              value={p.orderLink || ""}
                              onChange={(e) => handleModifyProduct(idx, "orderLink", e.target.value)}
                              className="w-full bg-white/5 border border-white/10 text-white font-mono text-[10px] px-3 py-2 outline-none focus:border-brand-gold"
                              placeholder="https://wa.me/..."
                            />
                            <p className="text-[8px] text-white/20 uppercase tracking-widest leading-relaxed">
                              This link is triggered when the user clicks 'Order via WhatsApp'. It can include pre-filled text to help you identify the product immediately.
                            </p>
                          </div>
                        )}

                        {p.orderMethod === 'affiliate' && (
                          <div className="bg-brand-black/40 border border-blue-500/20 p-4 space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                              <ExternalLink size={11} /> External Marketplace URL
                            </label>
                            <input
                              type="text"
                              value={p.orderLink || ""}
                              onChange={(e) => handleModifyProduct(idx, "orderLink", e.target.value)}
                              className="w-full bg-white/5 border border-white/10 text-white font-mono text-[10px] px-3 py-2 outline-none focus:border-blue-500/50"
                              placeholder="e.g. Amazon, Jumia, Etsy product page"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
