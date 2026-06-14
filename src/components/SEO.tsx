import React, { useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../context/ContentContext';

interface SEOProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
}

export default function SEO({ 
  title, 
  description, 
  ogImage, 
  ogType = 'website',
  keywords,
  ogTitle,
  ogDescription
}: SEOProps) {
  const { content, updatePageSEO } = useContent();

  const seoData = useMemo(() => {
    try {
      return JSON.parse(content.seoSettingsJson);
    } catch (e) {
      return {
        metaDescription: "A safe and global supportive community providing trusted clinical education, restorative therapy, and guidance.",
        metaKeywords: "women's health, reproductive health, vaginal health, Dr. FID, intimate wellness",
        ogImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80",
        authorName: "Dr. FID"
      };
    }
  }, [content.seoSettingsJson]);

  const generalData = useMemo(() => {
    try {
      return JSON.parse(content.generalSettingsJson);
    } catch (e) {
      return {
        siteName: "The Vagina Room",
        metaTitle: "The Vagina Room - Holistic Wellness & Intimate Reproductive Education"
      };
    }
  }, [content.generalSettingsJson]);

  const siteName = generalData.siteName || "The Vagina Room";
  const fullTitle = title ? `${title} | ${siteName}` : (generalData.metaTitle || siteName);
  const finalDescription = description || seoData.metaDescription;
  const finalKeywords = keywords || seoData.metaKeywords;
  const finalOgImage = ogImage || seoData.ogImage;
  const finalOgTitle = ogTitle ? `${ogTitle} | ${siteName}` : fullTitle;
  const finalOgDescription = ogDescription || finalDescription;

  useEffect(() => {
    updatePageSEO(fullTitle, finalDescription);
  }, [fullTitle, finalDescription, updatePageSEO]);

  const gaTrackingId = seoData.gaTrackingId;
  const fbPixelId = seoData.fbPixelId;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content={seoData.authorName || "Dr. FID"} />

      {/* Analytics: Google Analytics 4 */}
      {gaTrackingId && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`} />
      )}
      {gaTrackingId && (
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaTrackingId}');
          `}
        </script>
      )}

      {/* Analytics: Meta Pixel (Facebook) */}
      {fbPixelId && (
        <script>
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbPixelId}');
            fbq('track', 'PageView');
          `}
        </script>
      )}
      {fbPixelId && (
        <noscript>
          {`<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1" />`}
        </noscript>
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDescription} />
      <meta name="twitter:image" content={finalOgImage} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={window.location.href} />
    </Helmet>
  );
}
