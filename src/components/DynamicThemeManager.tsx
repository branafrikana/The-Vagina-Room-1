import { useEffect } from 'react';
import { useContent } from '../context/ContentContext';
import { Helmet } from 'react-helmet-async';

export default function DynamicThemeManager() {
  const { content } = useContent();

  useEffect(() => {
    try {
      const branding = JSON.parse(content.brandingSettingsJson || '{}');
      const root = document.documentElement;

      if (branding.primaryMode === 'gradient' && branding.primaryGradStart && branding.primaryGradEnd) {
        const angle = branding.primaryGradAngle || 135;
        root.style.setProperty('--brand-primary-gradient', `linear-gradient(${angle}deg, ${branding.primaryGradStart} 0%, ${branding.primaryGradEnd} 100%)`);
        // We set the base color to the start of the gradient for consistency in components that only use colors
        root.style.setProperty('--color-brand-red', branding.primaryGradStart);
      } else if (branding.primaryColor) {
        root.style.setProperty('--color-brand-red', branding.primaryColor);
        root.style.setProperty('--brand-primary-gradient', branding.primaryColor); // Fallback to flat color
      }

      if (branding.secondaryMode === 'gradient' && branding.secondaryGradStart && branding.secondaryGradEnd) {
        const angle = branding.secondaryGradAngle || 45;
        root.style.setProperty('--brand-secondary-gradient', `linear-gradient(${angle}deg, ${branding.secondaryGradStart} 0%, ${branding.secondaryGradEnd} 100%)`);
        root.style.setProperty('--color-brand-gold', branding.secondaryGradStart);
      } else if (branding.secondaryColor) {
        root.style.setProperty('--color-brand-gold', branding.secondaryColor);
        root.style.setProperty('--brand-secondary-gradient', branding.secondaryColor);
      }
      if (branding.fontFamily) {
        root.style.setProperty('--font-sans', `"${branding.fontFamily}", ui-sans-serif, system-ui, sans-serif`);
      }
      
      if (branding.baseFontSize) {
        root.style.setProperty('--base-font-size', `${branding.baseFontSize}px`);
        root.style.fontSize = `${branding.baseFontSize}px`;
      }
      
      // Update body classes if needed, though Tailwind variables are preferred
    } catch (e) {
      console.warn("Theme parsing error", e);
    }
  }, [content.brandingSettingsJson]);

  // Handle SEO Global Defaults
  let seo = { metaDescription: "", metaKeywords: "", authorName: "", ogImage: "" };
  let general = { siteName: "The Vagina Room", metaTitle: "The Vagina Room" };
  let pwa = { name: "The Vagina Room", short_name: "Vagina Room", theme_color: "#C41E3A", iconUrl: "/icon-512.png" };
  
  try {
    seo = JSON.parse(content.seoSettingsJson || '{}');
    general = JSON.parse(content.generalSettingsJson || '{}');
  } catch {}

  try {
    pwa = JSON.parse(content.pwaSettingsJson || '{}');
  } catch {}

  useEffect(() => {
    const faviconUrl = content.faviconUrl || pwa.iconUrl || '/favicon.ico';
    const link = document.getElementById('favicon-link') || document.querySelector("link[rel~='icon']");
    if (link) {
      link.setAttribute('href', faviconUrl);
    }
  }, [content.faviconUrl, pwa.iconUrl]);

  return (
    <Helmet>
      <title>{general.metaTitle || general.siteName}</title>
      <meta name="description" content={seo.metaDescription} />
      <meta name="keywords" content={seo.metaKeywords} />
      <meta name="author" content={seo.authorName} />
      
      {/* PWA Tags */}
      <meta name="theme-color" content={pwa.theme_color || "#C41E3A"} />
      <meta name="apple-mobile-web-app-title" content={pwa.short_name || pwa.name || "Vagina Room"} />
      <link rel="apple-touch-icon" href={pwa.iconUrl || "/icon-512.png"} />
      
      {/* Open Graph */}
      <meta property="og:title" content={general.metaTitle || general.siteName} />
      <meta property="og:description" content={seo.metaDescription} />
      <meta property="og:image" content={seo.ogImage || pwa.iconUrl} />
      <meta property="og:type" content="website" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={general.metaTitle || general.siteName} />
      <meta name="twitter:description" content={seo.metaDescription} />
      <meta name="twitter:image" content={seo.ogImage || pwa.iconUrl} />
    </Helmet>
  );
}
