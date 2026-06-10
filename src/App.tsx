import { lazy, Suspense, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
          The Vagina Room Sanctuary • Restoring Wellness & Dignity
        </p>
      </footer>
    </div>
  );
}

function PageGuard({ children }: { children: ReactNode }) {
  const { content, isAdmin } = useContent();
  const location = useLocation();

  // Parse disabledPages
  let disabledPages: Record<string, boolean> = {};
  if (content?.disabledPagesJson) {
    try {
      disabledPages = JSON.parse(content.disabledPagesJson);
    } catch (e) {}
  }

  const currentPath = location.pathname;

  // Find if current path or any parent path matches a disabled route
  const isDisabled = Object.keys(disabledPages).some(path => {
    if (!disabledPages[path]) return false;
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath === path || currentPath.startsWith(path + "/");
  });

  // Admin and dashboards cannot be disabled for security
  const isSystemPath = currentPath.startsWith("/admin") || currentPath.startsWith("/member-dashboard") || currentPath.startsWith("/partner-dashboard") || currentPath.startsWith("/login") || currentPath.startsWith("/register");

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
const AdminPage = lazy(() => import('./pages/AdminPage'));
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import FocusAreasPage from './pages/FocusAreasPage';
import DrFidPage from './pages/DrFidPage';
import DrFidBookingPage from './pages/DrFidBookingPage';
import TeamPage from './pages/TeamPage';
import ProjectsPage from './pages/ProjectsPage';
import EventsPage from './pages/EventsPage';
import GalleryPage from './pages/GalleryPage';
import ProductsPage from './pages/ProductsPage';
import CheckoutPage from './pages/CheckoutPage';
import ContactPage from './pages/ContactPage';
import SupportPage from './pages/SupportPage';
import PartnerPage from './pages/PartnerPage';
import PolicyPage from './pages/PolicyPage';
import TermsPage from './pages/TermsPage';
import JoinCommunityPage from './pages/JoinCommunityPage';
import TelegramCommunityPage from './pages/TelegramCommunityPage';
import TelegramCommunityThankYouPage from './pages/TelegramCommunityThankYouPage';
import ThankYouPage from './pages/ThankYouPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import PaymentReviewPage from './pages/PaymentReviewPage';
import SomaticBreathingPage from './pages/SomaticBreathingPage';
const MemberDashboardPage = lazy(() => import('./pages/MemberDashboardPage'));
const PartnerDashboardPage = lazy(() => import('./pages/PartnerDashboardPage'));
import AffiliatePage from './pages/AffiliatePage';
import BlogListPage from './pages/BlogListPage';
import BlogPostPage from './pages/BlogPostPage';
import DynamicPageRenderer from './pages/DynamicPageRenderer';

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
  const location = useLocation();
  return (
    <div className="min-h-screen">
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/focus-areas" element={<FocusAreasPage />} />
        <Route path="/dr-fid" element={<DrFidPage />} />
        <Route path="/dr-fid-booking" element={<DrFidBookingPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/partner" element={<PartnerPage />} />
        <Route path="/privacy-policy" element={<PolicyPage />} />
        <Route path="/terms-of-service" element={<TermsPage />} />
        <Route path="/join-community" element={<JoinCommunityPage />} />
        <Route path="/telegram" element={<TelegramCommunityPage />} />
        <Route path="/telegram/thank-you" element={<TelegramCommunityThankYouPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/somatic-breathing" element={<SomaticBreathingPage />} />
        <Route path="/payment-review" element={<PaymentReviewPage />} />
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
        <Route path="/affiliate-program" element={<AffiliatePage />} />
        <Route path="/blogs" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/admin" element={
          <Suspense fallback={<AdminSuspense />}>
            <AdminPage />
          </Suspense>
        } />
        <Route path="*" element={<DynamicPageRenderer />} />
      </Routes>
    </div>
  );
}

function GlobalWidgets() {
  const location = useLocation();
  
  // Hide chat widget and PWA popup on specific landing pages to reduce distractions
  const hideOnPaths = ['/telegram'];
  const shouldHide = hideOnPaths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));
  
  if (shouldHide) return null;

  return (
    <>
      <PwaPopup />
      <WhatsAppWidget />
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
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </ContentProvider>
    </HelmetProvider>
  );
}

