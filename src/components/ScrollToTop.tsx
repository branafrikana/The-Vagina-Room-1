import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If there's a hash, scroll to that element with a robust polling/retry mechanism
    if (hash) {
      const id = hash.replace("#", "");
      let retries = 0;
      const maxRetries = 15; // 1.5 seconds max
      const intervalTime = 100;
      
      const scrollToHashElement = (): boolean => {
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => {
            const headerOffset = 100; // Account for the sticky navigation bar
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
            });
          }, 50);
          return true;
        }
        return false;
      };

      // Try scrolling immediately
      if (scrollToHashElement()) return;

      // Fallback interval if the element takes time to mount (e.g. during page entry animations)
      const interval = setInterval(() => {
        retries++;
        if (scrollToHashElement() || retries >= maxRetries) {
          clearInterval(interval);
        }
      }, intervalTime);

      return () => clearInterval(interval);
    } else {
      // Standard scroll-to-top fallback on route change
      const timer = setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "instant" as any // Use direct instant jump to avoid intermediate visual jitter
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [pathname, hash]);

  // Global document click event listener to smoothly scroll hash hrefs
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Smooth scroll for local in-page links
      if (href.startsWith("#") && href.length > 1) {
        const id = href.substring(1);
        const element = document.getElementById(id);
        if (element) {
          e.preventDefault();
          
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });

          // Gracefully state change url without instant visual jump
          window.history.pushState(null, "", href);
        }
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(prev => {
        const meetsCondition = window.scrollY > 400;
        return meetsCondition !== prev ? meetsCondition : prev;
      });
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 50 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          id="floating-scroll-to-top"
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] w-14 h-14 bg-brand-black text-brand-gold rounded-full flex items-center justify-center shadow-2xl hover:bg-white hover:text-brand-red border border-brand-gold/30 transition-colors cursor-pointer group"
          title="Scroll to Top"
        >
          {/* Flowing background rings */}
          <span className="absolute inset-0 rounded-full border border-brand-gold/30 group-hover:border-brand-red/40 animate-ping opacity-75 pointer-events-none" />
          <span className="absolute -inset-1.5 rounded-full border border-brand-gold/20 group-hover:border-brand-red/30 animate-pulse pointer-events-none" />
          
          <ArrowUp size={20} className="stroke-[2.5] transform group-hover:-translate-y-1 transition-transform duration-300" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

