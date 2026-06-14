import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useGoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    // Dynamic loading of GA tracking ID from environment variables
    const trackingId = import.meta.env.VITE_GA_TRACKING_ID;
    
    // Privacy compliance: Respect browser's "Do Not Track" and local opt-out choice
    const isOptedOut = localStorage.getItem("ga_opt_out") === "true";
    const respectDoNotTrack = navigator.doNotTrack === "1" || (window as any).doNotTrack === "1";
    
    if (!trackingId || isOptedOut || respectDoNotTrack) {
      console.log("Google Analytics is inactive (no ID configured, opt-out is stored, or Do Not Track is toggled)");
      return;
    }

    const loadGtagScript = () => {
      // Avoid duplicate script appending
      if (document.getElementById("ga-gtag-script")) return;

      const script1 = document.createElement("script");
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
      script1.id = "ga-gtag-script";
      document.head.appendChild(script1);

      const script2 = document.createElement("script");
      script2.id = "ga-gtag-config";
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', '${trackingId}', {
          'anonymize_ip': true,
          'send_page_view': false
        });
      `;
      document.head.appendChild(script2);
    };

    loadGtagScript();

    // Fire actual page view transit and ensure IP anonymization is applied
    if ((window as any).gtag) {
      (window as any).gtag("config", trackingId, {
        page_path: location.pathname + location.search,
        anonymize_ip: true
      });
      console.log(`Privacy-compliant GA tracked pageview: ${location.pathname}${location.search}`);
    }
  }, [location]);
}
