import ScreenLoader from './components/ScreenLoader';
import { lazy, Suspense, ReactNode, useMemo } from 'react';
import { usePreloadImages } from './hooks/usePreloadImages';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useGoogleAnalytics } from './hooks/useGoogleAnalytics';
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from './components/ScrollToTop';
import PwaPopup from './components/PwaPopup';
import AdminBar from './components/AdminBar';
import WhatsAppWidget from './components/WhatsAppWidget';
import DynamicThemeManager from './components/DynamicThemeManager';
import ImpersonationBanner from './components/ImpersonationBanner';
import { ContentProvider, useContent } from './context/ContentContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { ShieldAlert, Home, MessageSquare } from 'lucide-react';

function OfflinePagePlaceholder() {
  return (
    <div className="min-h-screen bg-brand-black text-white flex flex-col justify-between py-12 px-6 relative overflow-hidden font-sans">
      <Helmet>
        <title>Under Maintenance | The Vagina Room</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Decorative Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full text-center relative z-10">
        <span className="text-2xl">🌸</span>
        <h1 className="text-xs font-black uppercase tracking-[0.3em] mt-2 text-brand-gold">
          The Vagina Room
        </h1>
      </header>

      {/* Body content */}
      <main className="max-w-md mx-auto w-full text-center py-16 relative z-10 my-auto flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-16 h-16 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mb-8 text-brand-gold"
        >
          <ShieldAlert className="w-8 h-8" />
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-4xl font-serif text-white tracking-tight mb-4"
        >
          Sacred Re-centering
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xs md:text-sm text-white/60 tracking-wider leading-relaxed mb-10 font-sans uppercase"
        >
          This sanctuary space is currently undergoing re-preservation or spiritual alignment by Dr. FID and the custodians. Please explore other open rooms or check back soon.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full"
        >
          <a
            href="/"
            className="flex-1 h-12 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all"
          >
            <Home className="w-4 h-4 text-brand-gold" />
            <span>Go Home</span>
          </a>
          <a
            href="/contact"
            className="flex-1 h-12 bg-brand-gold hover:bg-brand-red text-brand-black hover:text-white rounded-lg flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact Us</span>
          </a>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center relative z-10">
        <p className="text-[9px] font-mono uppercase text-white/30 tracking-[0.2em]">
          The Vagina Room Community • Restoring Wellness & Dignity
        </p>
      </footer>
    </div>
  );
}

function PageGuard({ children }: { children: ReactNode }) {
  const { content, isAdmin, loading } = useContent();
  const location = useLocation();

  if (loading) {
    return <ScreenLoader />;
  }

  // Parse disabledPages
  let disabledPages: Record<string, boolean> = {};
  if (content?.disabledPagesJson) {
    try {
      disabledPages = JSON.parse(content.disabledPagesJson);
    } catch (e) {}
  }

  // Parse global maintenance mode flag
  let isMaintenanceMode = false;
  if (content?.generalSettingsJson) {
    try {
      const generalSettings = JSON.parse(content.generalSettingsJson);
      isMaintenanceMode = !!generalSettings.maintenanceMode;
    } catch (e) {}
  }

  const currentPath = location.pathname;

  // Admin and dashboards cannot be disabled for security/access
  const isSystemPath = currentPath.startsWith("/admin") || currentPath.startsWith("/member-dashboard") || currentPath.startsWith("/partner-dashboard") || currentPath.startsWith("/login") || currentPath.startsWith("/register");

  // Handle Global Maintenance Mode
  if (isMaintenanceMode && !isSystemPath) {
    if (isAdmin) {
      return (
        <div className="relative">
          <div className="bg-brand-red text-white text-[10px] text-center py-2 px-4 sticky top-0 z-50 font-mono flex items-center justify-center gap-2 shadow-lg border-b border-brand-gold/20 uppercase tracking-widest">
            <span>⚠️ Global Maintenance Mode Active: Visitors are redirected to the Offline sanctuary space. Admin bypass is active.</span>
          </div>
          {children}
        </div>
      );
    }
    return <OfflinePagePlaceholder />;
  }

  // Find if current path or any parent path matches a disabled route
  const isDisabled = Object.keys(disabledPages).some(path => {
    if (!disabledPages[path]) return false;
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath === path || currentPath.startsWith(path + "/");
  });

  if (isDisabled && !isSystemPath) {
    if (isAdmin) {
      return (
        <div className="relative">
          <div className="bg-brand-red text-white text-[10px] text-center py-2 px-4 sticky top-0 z-50 font-mono flex items-center justify-center gap-2 shadow-lg border-b border-white/10 uppercase tracking-widest">
            <span>⚠️ Admin Preview: This page is set as de-activated for visitors. You are seeing this preview as an authenticated admin.</span>
          </div>
          {children}
        </div>
      );
    }

    return <OfflinePagePlaceholder />;
  }

  return <>{children}</>;
}

// Eagerly/Statically load main pages for instant access
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const FocusAreasPage = lazy(() => import('./pages/FocusAreasPage'));
const DrFidPage = lazy(() => import('./pages/DrFidPage'));
const DrFidBookingPage = lazy(() => import('./pages/DrFidBookingPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const PartnerPage = lazy(() => import('./pages/PartnerPage'));
const PolicyPage = lazy(() => import('./pages/PolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const JoinCommunityPage = lazy(() => import('./pages/JoinCommunityPage'));
const TelegramCommunityPage = lazy(() => import('./pages/TelegramCommunityPage'));
const TelegramCommunityThankYouPage = lazy(() => import('./pages/TelegramCommunityThankYouPage'));
const ThankYouPage = lazy(() => import('./pages/ThankYouPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const PaymentReviewPage = lazy(() => import('./pages/PaymentReviewPage'));
const SomaticBreathingPage = lazy(() => import('./pages/SomaticBreathingPage'));
const MemberDashboardPage = lazy(() => import('./pages/MemberDashboardPage'));
const PartnerDashboardPage = lazy(() => import('./pages/PartnerDashboardPage'));
const AffiliatePage = lazy(() => import('./pages/AffiliatePage'));
const BlogListPage = lazy(() => import('./pages/BlogListPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const DynamicPageRenderer = lazy(() => import('./pages/DynamicPageRenderer'));
const ConnectPage = lazy(() => import('./pages/ConnectPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

function AdminSuspense() {
  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px]">Accessing Community Core</p>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  useGoogleAnalytics();
  const location = useLocation();
  return (
    <div className="min-h-screen">
      <Routes location={location}>
        <Route path="/" element={<Suspense fallback={<AdminSuspense />}><HomePage /></Suspense>} />
        <Route path="/about" element={<Suspense fallback={<AdminSuspense />}><AboutPage /></Suspense>} />
        <Route path="/focus-areas" element={<Suspense fallback={<AdminSuspense />}><FocusAreasPage /></Suspense>} />
        <Route path="/dr-fid" element={<Suspense fallback={<AdminSuspense />}><DrFidPage /></Suspense>} />
        <Route path="/dr-fid-booking" element={<Suspense fallback={<AdminSuspense />}><DrFidBookingPage /></Suspense>} />
        <Route path="/team" element={<Suspense fallback={<AdminSuspense />}><TeamPage /></Suspense>} />
        <Route path="/projects" element={<Suspense fallback={<AdminSuspense />}><ProjectsPage /></Suspense>} />
        <Route path="/events" element={<Suspense fallback={<AdminSuspense />}><EventsPage /></Suspense>} />
        <Route path="/gallery" element={<Suspense fallback={<AdminSuspense />}><GalleryPage /></Suspense>} />
        <Route path="/products" element={<Suspense fallback={<AdminSuspense />}><ProductsPage /></Suspense>} />
        <Route path="/checkout" element={<Suspense fallback={<AdminSuspense />}><CheckoutPage /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<AdminSuspense />}><ContactPage /></Suspense>} />
        <Route path="/support" element={<Suspense fallback={<AdminSuspense />}><SupportPage /></Suspense>} />
        <Route path="/partner" element={<Suspense fallback={<AdminSuspense />}><PartnerPage /></Suspense>} />
        <Route path="/privacy-policy" element={<Suspense fallback={<AdminSuspense />}><PolicyPage /></Suspense>} />
        <Route path="/terms-of-service" element={<Suspense fallback={<AdminSuspense />}><TermsPage /></Suspense>} />
        <Route path="/join-community" element={<Suspense fallback={<AdminSuspense />}><JoinCommunityPage /></Suspense>} />
        <Route path="/telegram" element={<Suspense fallback={<AdminSuspense />}><TelegramCommunityPage /></Suspense>} />
        <Route path="/telegram/thank-you" element={<Suspense fallback={<AdminSuspense />}><TelegramCommunityThankYouPage /></Suspense>} />
        <Route path="/thank-you" element={<Suspense fallback={<AdminSuspense />}><ThankYouPage /></Suspense>} />
        <Route path="/register" element={<Suspense fallback={<AdminSuspense />}><RegisterPage /></Suspense>} />
        <Route path="/login" element={<Suspense fallback={<AdminSuspense />}><LoginPage /></Suspense>} />
        <Route path="/welcome" element={<Suspense fallback={<AdminSuspense />}><WelcomePage /></Suspense>} />
        <Route path="/somatic-breathing" element={<Suspense fallback={<AdminSuspense />}><SomaticBreathingPage /></Suspense>} />
        <Route path="/payment-review" element={<Suspense fallback={<AdminSuspense />}><PaymentReviewPage /></Suspense>} />
        <Route path="/member-dashboard" element={
          <Suspense fallback={<AdminSuspense />}>
            <MemberDashboardPage />
          </Suspense>
        } />
        <Route path="/partner-dashboard" element={
          <Suspense fallback={<AdminSuspense />}>
            <PartnerDashboardPage />
          </Suspense>
        } />
        <Route path="/affiliate-program" element={<Suspense fallback={<AdminSuspense />}><AffiliatePage /></Suspense>} />
        <Route path="/connect" element={<Suspense fallback={<AdminSuspense />}><ConnectPage /></Suspense>} />
        <Route path="/blogs" element={<Suspense fallback={<AdminSuspense />}><BlogListPage /></Suspense>} />
        <Route path="/blog/:slug" element={<Suspense fallback={<AdminSuspense />}><BlogPostPage /></Suspense>} />
        <Route path="/admin" element={
          <Suspense fallback={<AdminSuspense />}>
            <AdminPage />
          </Suspense>
        } />
        <Route path="*" element={<Suspense fallback={<AdminSuspense />}><DynamicPageRenderer /></Suspense>} />
      </Routes>
    </div>
  );
}

function GlobalWidgets() {
  const location = useLocation();
  const { loading } = useContent();
  
  if (loading) return null;
  
  // Hide chat widget and PWA popup on specific landing pages to reduce distractions
  const hidePwaPaths = ['/telegram'];
  const hideWhatsAppPaths = ['/telegram', '/admin', '/member-dashboard'];
  
  const shouldHidePwa = hidePwaPaths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));
  const shouldHideWhatsApp = hideWhatsAppPaths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));

  return (
    <>
      {!shouldHidePwa && <PwaPopup />}
      {!shouldHideWhatsApp && <WhatsAppWidget />}
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <ContentProvider>
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <MainContent />
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </ContentProvider>
    </HelmetProvider>
  );
}

function MainContent() {
  const { content } = useContent();

  const criticalImages = useMemo(() => {
    const branding = JSON.parse(content?.brandingSettingsJson || "{}");
    const urls = [];
    if (branding.headerLogoUrl) urls.push(branding.headerLogoUrl);
    if (branding.loaderLogoUrl) urls.push(branding.loaderLogoUrl);
    return urls;
  }, [content?.brandingSettingsJson]);

  usePreloadImages(criticalImages);

  return (
    <>
      <DynamicThemeManager />
      <BrowserRouter>
        <ScrollToTop />
        <AdminBar />
        <ImpersonationBanner />
        <GlobalWidgets />
        <PageGuard>
          <AnimatedRoutes />
        </PageGuard>
      </BrowserRouter>
    </>
  );
}

