import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useContent } from '../context/ContentContext';

interface SEOProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  keywords?: string;
}

export default function SEO({ 
  title, 
  description, 
  ogImage, 
  ogType = 'website',
  keywords 
}: SEOProps) {
  const { content } = useContent();

  const seoData = useMemo(() => {
    try {
      return JSON.parse(content.seoSettingsJson);
    } catch (e) {
      return {
        metaDescription: "A safe sanctuary and global supportive community providing trusted clinical education, restorative therapy, and guidance.",
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

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content={seoData.authorName || "Dr. FID"} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalOgImage} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={window.location.href} />
    </Helmet>
  );
}
