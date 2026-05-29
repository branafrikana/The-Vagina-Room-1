import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, RefreshCw } from "lucide-react";
import { useContent } from "../context/ContentContext";

export default function PwaPopup() {
  const { content } = useContent();
  const pwaSettings = JSON.parse(content.pwaSettingsJson || '{}');
  const brandingSettings = JSON.parse(content.brandingSettingsJson || '{}');
  const isEnabledInBackend = pwaSettings.showPopup !== false;
  
  const appLogoUrl = brandingSettings.headerLogoUrl || "/icon-512.png";

  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "other">("other");
  const [installSuccess, setInstallSuccess] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<"idle" | "checking" | "latest" | "error">("idle");

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
        triggerPopup(2000); // Reduced delay for faster visibility
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Safari / iOS and other fallback non-Chromium devices (where beforeinstallprompt won't trigger)
    // We schedule a fallback trigger
    triggerPopup(3000); // Reduced delay for faster visibility

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      if (showTimeout) {
        clearTimeout(showTimeout);
      }
    };
  }, [isStandalone, isEnabledInBackend]);

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA native install selection: ${outcome}`);
    if (outcome === "accepted") {
      setInstallSuccess(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleCheckForUpdates = async () => {
    if (!("serviceWorker" in navigator)) return;
    setCheckingUpdate(true);
    setUpdateStatus("checking");

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        // Trigger core update request from server
        await reg.update();
        
        // Simulating status change for premium tactile response
        setTimeout(() => {
          setCheckingUpdate(false);
          setUpdateStatus("latest");
          
          setTimeout(() => {
            setUpdateStatus("idle");
          }, 3000);
        }, 1500);
      } else {
        setCheckingUpdate(false);
        setUpdateStatus("error");
        setTimeout(() => setUpdateStatus("idle"), 3000);
      }
    } catch (err) {
      console.error("Error inspecting software update:", err);
      setCheckingUpdate(false);
      setUpdateStatus("error");
      setTimeout(() => setUpdateStatus("idle"), 3000);
    }
  };

  // If already running as standalone app, render the manual update check badge
  if (isStandalone) {
    return (
      <div className="fixed bottom-6 left-6 z-[100] pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          className="bg-brand-black/95 backdrop-blur-md border border-brand-gold/20 flex items-center gap-3 px-3.5 py-1.5 hover:border-brand-gold/40 transition-colors shadow-2xl"
        >
          <div className="flex flex-col">
            <span className="text-[7.5px] uppercase tracking-widest text-white/40 font-mono">
              Web App v1.0.0
            </span>
            <span className="text-[9px] uppercase tracking-wider text-brand-gold font-bold font-mono">
              {updateStatus === "checking" ? (
                "Checking..."
              ) : updateStatus === "latest" ? (
                "Up To Date"
              ) : updateStatus === "error" ? (
                "Check failed"
              ) : (
                "Wellness Space"
              )}
            </span>
          </div>

          <button
            onClick={handleCheckForUpdates}
            disabled={checkingUpdate}
            className="p-1.5 hover:bg-white/5 active:bg-white/10 text-brand-gold border border-brand-gold/15 transition-all text-[9px] font-black uppercase tracking-widest flex items-center justify-center cursor-pointer disabled:opacity-50"
            title="Check for PWA updates manually"
          >
            <RefreshCw 
              size={11} 
              className={`${checkingUpdate ? "animate-spin" : "hover:rotate-45 transition-transform duration-300"}`} 
            />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-x-0 bottom-0 pointer-events-none z-[9999] p-4 md:p-6 lg:p-8 flex justify-center md:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-md bg-brand-black/95 backdrop-blur-2xl border border-brand-gold/30 rounded-none shadow-2xl p-6 relative pointer-events-auto overflow-hidden"
          >
            {/* Main Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 border border-brand-gold/20 flex items-center justify-center flex-shrink-0">
                  <img
                    src={appLogoUrl}
                    alt="App Logo"
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-white font-sans text-[11px] font-black tracking-widest uppercase">
                    {deviceType === 'ios' ? 'Save as App' : 'Install Web App'}
                  </h4>
                  <p className="text-white/40 text-[9px] font-medium leading-none mt-1">
                    {deviceType === 'ios' ? 'Add to Home Screen for best experience' : 'Enjoy a faster & offline experience'}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {installSuccess ? (
                    <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Check size={12} /> Ready
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={handleDismiss}
                        className="text-white/30 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors"
                      >
                        Later
                      </button>
                      {deferredPrompt ? (
                        <button
                          onClick={handleNativeInstall}
                          className="bg-brand-gold text-brand-black px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-brand-gold/5 whitespace-nowrap"
                        >
                          Install App
                        </button>
                      ) : (
                        <div className="text-[10px] text-white font-bold tracking-widest">
                          {deviceType === 'ios' ? 'Tap Share ⇪ to Install' : 'Tap menu ⋮ to Install'}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Always show instructions if not native prompt and not success */}
              {!deferredPrompt && !installSuccess && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="pt-4 border-t border-white/10 space-y-3"
                >
                  <p className="text-[8px] text-white font-bold tracking-widest uppercase text-center w-full">
                    {deviceType === 'ios' 
                      ? "Instructions: Tap 'Share' ⇪ → 'Add to Home Screen'"
                      : "Instructions: Tap menu ⋮ → 'Install' or 'Add to Home Screen'"}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
