import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check } from "lucide-react";
import { useContent } from "../context/ContentContext";

export default function PwaPopup() {
  const { content } = useContent();
  const pwaSettings = JSON.parse(content.pwaSettingsJson || '{}');
  const brandingSettings = JSON.parse(content.brandingSettingsJson || '{}');
  const isEnabledInBackend = pwaSettings.pwaEnabled !== false;
  
  const appLogoUrl = pwaSettings.iconUrl || brandingSettings.headerLogoUrl || "/icon-512.png";

  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "other">("other");
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // 1. Detect if already in standalone app mode
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia("(display-mode: standalone)").matches || 
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    const standalone = checkStandalone();

    // 2. Detect Device Type
    const detectDevice = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setDeviceType("ios");
      } else if (/android/.test(userAgent)) {
        setDeviceType("android");
      } else {
        setDeviceType("other");
      }
    };
    detectDevice();

    // Prevent show timeouts completely if standalone OR if disabled in backend
    if (standalone || !isEnabledInBackend) {
      setIsVisible(false);
      return;
    }

    let showTimeout: NodeJS.Timeout;

    const triggerPopup = (delayMs: number) => {
      showTimeout = setTimeout(() => {
        setIsVisible(true);
      }, delayMs);
    };

    // 3. Keep track of native Chrome/Android install promoter event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // If PWA is eligible, show popup after short graceful introduction
      if (!showTimeout) {
        triggerPopup(1500); 
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Safari / iOS and other fallback non-Chromium devices (where beforeinstallprompt won't trigger)
    // We schedule a fallback trigger if they haven't seen it recently
    triggerPopup(4000); 

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      if (showTimeout) {
        clearTimeout(showTimeout);
      }
    };
  }, [isStandalone, isEnabledInBackend]);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstallSuccess(true);
        setTimeout(() => setIsVisible(false), 2000);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback for iOS or non-supporting browsers
      if (deviceType === 'ios') {
        alert("To install: Tap the Share button (⇪) and select 'Add to Home Screen'.");
      } else {
        alert("Please use your browser menu (⋮) and select 'Install' or 'Add to Desktop'.");
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (isStandalone) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-x-0 bottom-6 pointer-events-none z-[9999] px-4 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-[#0a0a0a] border border-[#D4AF37]/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-5 md:p-6 relative pointer-events-auto"
          >
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Logo Area */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-16 h-16 bg-brand-black border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 p-2">
                  {appLogoUrl && appLogoUrl.trim() !== "" ? (
                    <img
                      src={appLogoUrl}
                      alt="App Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#111]" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-white font-sans text-lg font-black tracking-widest uppercase leading-none">
                    Install App
                  </h4>
                  <p className="text-white/40 text-[10px] font-medium tracking-wide mt-2">
                    Faster & offline experience
                  </p>
                </div>
              </div>
              
              {/* Action Area */}
              <div className="flex items-center gap-6">
                {installSuccess ? (
                  <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Check size={14} /> Ready
                  </span>
                ) : (
                  <>
                    <button
                      onClick={handleDismiss}
                      className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                    >
                      Later
                    </button>
                    <button
                      onClick={handleNativeInstall}
                      className="hover:bg-opacity-80 text-brand-black px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl whitespace-nowrap"
                      style={{ backgroundColor: brandingSettings.pwaCtaColor || '#D4AF37' }}
                    >
                      Install
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
