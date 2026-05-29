import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from './components/ScrollToTop';
import PwaPopup from './components/PwaPopup';
import AdminBar from './components/AdminBar';
import DynamicThemeManager from './components/DynamicThemeManager';
import { ContentProvider } from './context/ContentContext';
import { CartProvider } from './context/CartContext';

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
            <Routes>
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
          </BrowserRouter>
        </CartProvider>
      </ContentProvider>
    </HelmetProvider>
  );
}

