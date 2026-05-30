import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from './components/ScrollToTop';
import PwaPopup from './components/PwaPopup';
import AdminBar from './components/AdminBar';
import WhatsAppWidget from './components/WhatsAppWidget';
import DynamicThemeManager from './components/DynamicThemeManager';
import { ContentProvider } from './context/ContentContext';
import { CartProvider } from './context/CartContext';
import { motion, AnimatePresence } from 'motion/react';

// Eagerly/Statically load pages for instant access and zero visual delays
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
import AdminPage from './pages/AdminPage';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ 
          duration: 0.4, 
          ease: [0.215, 0.610, 0.355, 1.000] // Perfect cinematic easeOutCubic
        }}
        className="min-h-screen"
      >
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
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <ContentProvider>
        <CartProvider>
          <DynamicThemeManager />
          <BrowserRouter>
            <ScrollToTop />
            <AdminBar />
            <PwaPopup />
            <WhatsAppWidget />
            <AnimatedRoutes />
          </BrowserRouter>
        </CartProvider>
      </ContentProvider>
    </HelmetProvider>
  );
}

