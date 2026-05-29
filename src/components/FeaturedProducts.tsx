import { motion } from 'motion/react';
import { Award, ShoppingBag, ExternalLink, ShoppingCart, MessageCircle } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { useCart } from '../context/CartContext';
import EditableText from './EditableText';

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
  isExternal?: boolean;
}

export default function FeaturedProducts() {
  const { content } = useContent();
  const { addToCart } = useCart();
  
  const generalSettings = JSON.parse(content.generalSettingsJson || '{}');
  const whatsappPhone = generalSettings.whatsappPhone || content.contactPhone;

  let products: ProductItem[] = [];
  try {
    if (content.productsListJson) {
      const allProducts = JSON.parse(content.productsListJson);
      
      // Get selected IDs from content
      let selectedIds: string[] = [];
      try {
        if (content.featuredProductIdsJson) {
          selectedIds = JSON.parse(content.featuredProductIdsJson);
        }
      } catch (e) {
        console.warn("Error parsing featuredProductIdsJson", e);
      }

      if (Array.isArray(allProducts)) {
        if (selectedIds.length > 0) {
          // Filter by selected IDs
          products = allProducts.filter(p => selectedIds.includes(p.id));
        } else {
          // Fallback to top 3 if nothing selected
          products = allProducts.slice(0, 3);
        }
      }
    }
  } catch (err) {
    console.warn("Could not parse productsListJson", err);
  }

  const generateDynamicWhatsAppLink = (product: any) => {
    if (product.orderLink && product.orderLink.startsWith('https://wa.me')) {
      const phone = whatsappPhone.replace(/\s+/g, '').replace('+', '');
      if (product.orderLink.includes(phone)) return product.orderLink;
    }
    const phone = whatsappPhone.replace(/\s+/g, '').replace('+', '');
    const message = `Hi, I am interested in ordering: *${product.title}* (₦${product.price}). Please provide more details.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  if (products.length === 0) return null;

  return (
    <section className="py-20 px-6 bg-brand-black border-b border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-sans font-black tracking-tighter text-white uppercase">
                <EditableText field="productsHomeHeading" />
              </h2>
              <p className="text-sm font-serif text-white/60 mt-2">
                <EditableText field="productsHomeSub" multiline />
              </p>
            </div>
            <a href="/products" className="text-[10px] uppercase font-black tracking-widest text-brand-gold hover:text-white transition-colors">
              <EditableText field="productsHomeLinkText" />
            </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((p, idx) => {
            const isAffiliateMode = p.orderMethod === 'affiliate' || (!!p.externalLink);
            const isWhatsAppMode = p.orderMethod === 'whatsapp';
            const activeOrderLink = p.orderLink || p.externalLink;
            const priceFormatted = !isNaN(Number(String(p.price).replace(/[^0-9.]/g, '')))
              ? Number(String(p.price).replace(/[^0-9.]/g, '')).toLocaleString()
              : p.price;

            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                key={p.id}
                className="group flex flex-col bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300 relative overflow-hidden"
              >
                <div className="h-60 w-full overflow-hidden bg-white/5">
                  <img 
                    src={p.imageUrl} 
                    alt={p.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-sans font-black text-white group-hover:text-brand-gold transition-colors truncate">
                      {p.title}
                    </h3>
                    <p className="text-xs font-serif text-white/50 leading-relaxed line-clamp-2 italic">
                      {p.description}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 flex items-center justify-between border-t border-white/5 gap-2">
                    <div className="min-w-0">
                      <span className="text-md font-mono font-black text-brand-gold">
                        {p.currency === "NGN" ? "₦" : p.currency === "USD" ? "$" : `${p.currency} `}
                        {priceFormatted}
                      </span>
                    </div>

                    {isAffiliateMode ? (
                      <a
                        href={activeOrderLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/5 hover:bg-brand-gold hover:text-brand-black transition-colors"
                        title="View marketplace"
                      >
                        <ExternalLink size={14} />
                      </a>
                    ) : isWhatsAppMode ? (
                      <a
                        href={generateDynamicWhatsAppLink(p)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors"
                        title="Order via WhatsApp"
                      >
                        <MessageCircle size={14} />
                      </a>
                    ) : (
                      <button
                        onClick={() => addToCart({ id: p.id, title: p.title, price: p.price, currency: p.currency, imageUrl: p.imageUrl })}
                        className="p-2 bg-white/5 hover:bg-brand-gold hover:text-brand-black transition-colors"
                        title="Add to Cart"
                      >
                        <ShoppingCart size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
