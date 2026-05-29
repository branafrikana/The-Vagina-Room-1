import Navigation from '../components/Navigation';
import { Helmet } from 'react-helmet-async';
import PrimaryHero from '../components/PrimaryHero';
import Hero from '../components/Hero';
import AboutTheRoom from '../components/AboutTheRoom';
import IdentityGrid from '../components/IdentityGrid';
import PartnersSlider from '../components/PartnersSlider';
import About from '../components/About';
import WhyWeExist from '../components/WhyWeExist';
import FocusAreas from '../components/FocusAreas';
import WhoWeServe from '../components/WhoWeServe';
import Values from '../components/Values';
import CommunitySection from '../components/CommunitySection';
import TrustSafety from '../components/TrustSafety';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Promise from '../components/Promise';
import SocialGrid from '../components/SocialGrid';
import FeaturedProducts from '../components/FeaturedProducts';
import Footer from '../components/Footer';
import { useContent } from '../context/ContentContext';

export default function HomePage() {
  const { content } = useContent();

  const renderSection = (id: string) => {
    switch (id) {
      case 'primary_hero':
        return <PrimaryHero key="primary_hero" />;
      case 'about_the_room':
        return <AboutTheRoom key="about_the_room" />;
      case 'identity_grid':
        return <IdentityGrid key="identity_grid" />;
      case 'partners':
        return <PartnersSlider key="partners" />;
      case 'about_sanctuary':
        return <About key="about_sanctuary" />;
      case 'why_we_exist':
        return <WhyWeExist key="why_we_exist" />;
      case 'focus_areas':
        return <FocusAreas key="focus_areas" />;
      case 'who_we_serve':
        return <WhoWeServe key="who_we_serve" />;
      case 'know_your_vagina':
        return <Hero key="know_your_vagina" />;
      case 'values':
        return <Values key="values" />;
      case 'community':
        return <CommunitySection key="community" />;
      case 'trust_safety':
        return <TrustSafety key="trust_safety" />;
      case 'testimonials':
        return <Testimonials key="testimonials" />;
      case 'promise':
        return <Promise key="promise" />;
      case 'faq':
        return <FAQ key="faq" />;
      case 'products':
        return <FeaturedProducts key="products" />;
      case 'social_grid':
        return <SocialGrid key="social_grid" />;
      default:
        return null;
    }
  };

  let sectionIds = [
    "primary_hero",
    "about_the_room",
    "identity_grid",
    "partners",
    "about_sanctuary",
    "why_we_exist",
    "focus_areas",
    "who_we_serve",
    "know_your_vagina",
    "values",
    "community",
    "trust_safety",
    "testimonials",
    "promise",
    "faq",
    "products",
    "social_grid"
  ];

  if (content.homePageSectionsOrder) {
    try {
      const parsed = JSON.parse(content.homePageSectionsOrder);
      if (Array.isArray(parsed) && parsed.length > 0) {
        sectionIds = parsed;
      }
    } catch (e) {
      console.warn("Error parsing homePageSectionsOrder", e);
    }
  }

  return (
    <>
      <Helmet>
        <title>Home - The Room</title>
        <meta name="description" content="Welcome to The Room, the premier space for connection, safety, and empowerment. Learn more about our community and focus areas." />
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-grow">
          {sectionIds.map(id => renderSection(id))}
        </main>
        <Footer />
      </div>
    </>
  );
}
