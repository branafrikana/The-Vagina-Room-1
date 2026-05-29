const fs = require('fs');

const generateInput = (key, label) => `
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">${label}</label>
        ${key.toLowerCase().includes('json') || key.toLowerCase().includes('list') || key.toLowerCase().includes('paragraph') || key.toLowerCase().includes('desc') || key.toLowerCase().includes('struggles') || key.toLowerCase().includes('bio') || key.toLowerCase().includes('quote') || key.toLowerCase().includes('text') || key.toLowerCase().includes('experiences') ? 
        `<textarea 
          value={content.${key} || ""}
          onChange={(e) => updateContentField("${key}", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-24 text-xs font-mono leading-relaxed" 
        />` : 
        `<input 
          type="text" 
          value={content.${key} || ""}
          onChange={(e) => updateContentField("${key}", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
        />`}
      </div>
`;

const generateImageInput = (key, label) => `
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">${label} URL</label>
        <input 
          type="text" 
          value={content.${key} || ""}
          onChange={(e) => updateContentField("${key}", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs mb-2 font-mono" 
        />
        <ImageUploader fieldKey="${key}" label="Upload ${label}" />
      </div>
`;

function buildHomeTab() {
  return `import React from 'react';
import { useContent } from '../../context/ContentContext';
import { Sparkles } from 'lucide-react';
import { ImageUploader } from '../../pages/AdminPage';

export default function AdminHomeTab() {
  const { content, updateContentField } = useContent();

  return (
    <div className="space-y-12">
      {/* 1. Primary Hero */}
      <div className="border-t border-white/5 pt-8 space-y-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5"><Sparkles size={14} /> 1. Primary Hero</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateInput('heroWelcome', 'Hero Welcome')}
          ${generateInput('heroHeading', 'Hero Heading')}
        </div>
        ${generateInput('heroSub', 'Hero Subtitle')}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateInput('heroBtnText', 'CTA Button Text')}
          ${generateInput('heroBtnUrl', 'CTA Button URL')}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateImageInput('heroBgUrl', 'Hero Background Image')}
        </div>
      </div>

      {/* 2. Dr Fid / About The Room */}
      <div className="border-t border-white/5 pt-8 space-y-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">👤 2. Bio Spotlight: Dr. FID</h4>
        ${generateInput('drFidHeading', 'Heading')}
        ${generateInput('drFidQuote', 'Quote')}
        ${generateInput('drFidBio1', 'Bio Paragraph 1')}
        ${generateInput('drFidBio2', 'Bio Paragraph 2')}
        ${generateInput('drFidBio3', 'Bio Paragraph 3')}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateImageInput('drFidImageUrl', 'Dr FID Portrait')}
        </div>
      </div>

      {/* 3. Identity Grid */}
      <div className="border-t border-white/5 pt-8 space-y-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">🔲 3. Identity Grid & Ticker</h4>
        ${generateInput('tickerText', 'Ticker Text')}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateInput('identityLabel1', 'Label 1')}
          ${generateImageInput('identityImg1', 'Image 1')}
          ${generateInput('identityLabel2', 'Label 2')}
          ${generateImageInput('identityImg2', 'Image 2')}
          ${generateInput('identityLabel3', 'Label 3')}
          ${generateImageInput('identityImg3', 'Image 3')}
          ${generateInput('identityLabel4', 'Label 4')}
          ${generateImageInput('identityImg4', 'Image 4')}
        </div>
      </div>

      {/* 4. About */}
      <div className="border-t border-white/5 pt-8 space-y-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">📖 4. General About Us (Sanctuary)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateInput('aboutUsSub', 'About Sub-prefix')}
          ${generateInput('aboutUsTitle', 'About Title')}
          ${generateInput('aboutTitle', 'Groundwork Title')}
          ${generateInput('aboutHeading', 'Groundwork Heading')}
        </div>
        ${generateInput('aboutUsBoxText', 'Focus Box Text')}
        ${generateInput('aboutUsParagraph1', 'About Paragraph 1')}
        ${generateInput('aboutParagraph1', 'Bio Paragraph 1')}
        ${generateInput('aboutParagraph2', 'Bio Paragraph 2')}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateInput('aboutUsMissionTitle', 'Mission Title')}
          ${generateInput('aboutUsMissionDesc', 'Mission Description')}
          ${generateInput('aboutUsVisionTitle', 'Vision Title')}
          ${generateInput('aboutUsVisionDesc', 'Vision Description')}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateImageInput('aboutImageUrl', 'About Section Image')}
        </div>
      </div>

      {/* 5. Why We Exist */}
      <div className="border-t border-white/5 pt-8 space-y-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">💡 5. Why We Exist</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateInput('whyWeExistCatalyst', 'Catalyst Subtext')}
          ${generateInput('whyWeExistTitle', 'Title')}
        </div>
        ${generateInput('whyWeExistDesc', 'Description (Intro)')}
        ${generateInput('whyWeExistStruggleTitle', 'Struggle Subtitle')}
        ${generateInput('whyWeExistStruggles', 'Struggles List (one per line)')}
        ${generateInput('whyWeExistQuote', 'Quote')}
      </div>

      {/* 6. Focus Areas */}
      <div className="border-t border-white/5 pt-8 space-y-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">🎯 6. Focus Areas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateInput('focusAreasSub', 'Sub-prefix')}
          ${generateInput('focusAreasTitle', 'Title')}
        </div>
        ${generateInput('focusAreasJson', 'Focus Areas Overrides (JSON)')}
      </div>

      {/* 7. Who We Serve */}
      <div className="border-t border-white/5 pt-8 space-y-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">👥 7. Who We Serve</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateInput('whoWeServeSub', 'Sub-prefix')}
          ${generateInput('whoWeServeTitle', 'Title')}
        </div>
        ${generateInput('whoWeServeDesc', 'Description')}
        ${generateInput('whoWeServeAudienceList', 'Audience List (one per line)')}
      </div>

      {/* 8. YouTube KYV Hero */}
      <div className="border-t border-white/5 pt-8 space-y-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">▶️ 8. Know Your Vagina Series</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateInput('kyvLabel', 'Label')}
          ${generateInput('kyvHeading', 'Heading')}
        </div>
        ${generateInput('kyvSubtexts', 'Subtexts (one per line)')}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateInput('kyvBtnText', 'Button Text')}
          ${generateInput('kyvYoutubeUrl', 'YouTube URL')}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateInput('kyvBadgeTitle', 'Badge Title')}
          ${generateInput('kyvBadgeAction', 'Badge Action')}
        </div>
        ${generateInput('kyvBadgeBar', 'Badge Bottom Bar')}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateImageInput('kyvImageUrl', 'Banner Image')}
        </div>
      </div>

      {/* 9. Values & Differentiators */}
      <div className="border-t border-white/5 pt-8 space-y-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">🛡️ 9. Core Values & Differentiators</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateInput('valuesSub', 'Values Sub')}
          ${generateInput('valuesTitle', 'Values Title')}
        </div>
        ${generateInput('valuesDesc', 'Values Description')}
        ${generateInput('coreValuesJson', 'Values Overrides (JSON)')}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          ${generateInput('differentiatorsSub', 'Diffs Sub')}
          ${generateInput('differentiatorsTitle', 'Diffs Title')}
        </div>
        ${generateInput('differentiatorsDesc', 'Diffs Description')}
        ${generateInput('differentiatorsJson', 'Diffs Overrides (JSON)')}
      </div>

      {/* 10. Community Section */}
      <div className="border-t border-white/5 pt-8 space-y-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">👑 10. Inside The Community</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateInput('communitySub', 'Sub-prefix')}
          ${generateInput('communityTitle', 'Title')}
        </div>
        ${generateInput('communityDesc', 'Description (Summary)')}
        ${generateInput('communityExperiencesTitle', 'Experiences List Title')}
        ${generateInput('communityExperiences', 'Experiences (one per line)')}
        ${generateInput('communityQuote', 'Quote')}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateInput('communityBtnText', 'Button Text')}
          ${generateInput('communityBtnUrl', 'Button URL')}
          ${generateImageInput('communityImageUrl', 'Side Image')}
        </div>
      </div>

      {/* 11. Trust & Safety */}
      <div className="border-t border-white/5 pt-8 space-y-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">🔒 11. Trust & Safety</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateInput('tsSub', 'Sub-prefix')}
          ${generateInput('tsTitle', 'Title')}
        </div>
        ${generateInput('tsDesc', 'Description')}
        ${generateInput('tsList', 'Safety Protocols (one per line)')}
        ${generateInput('tsQuote', 'Quote')}
      </div>

      {/* 12. The Promise */}
      <div className="border-t border-white/5 pt-8 space-y-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">🤝 12. The Promise</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${generateInput('promiseSub', 'Sub-prefix')}
          ${generateInput('promiseTitle', 'Title')}
        </div>
        ${generateInput('promiseHeading', 'Heading')}
        ${generateInput('promiseText', 'Text')}
        ${generateInput('promiseQuote', 'Quote')}
        ${generateInput('promiseRightLabel', 'Label Above List')}
        ${generateInput('promiseList', 'Promise List (one per line)')}
        
        <div className="mt-8">
          <h5 className="text-xs font-black uppercase text-brand-gold mb-4">Banner Section Inside Promise</h5>
          ${generateInput('promiseBannerHeading', 'Banner Heading')}
          ${generateInput('promiseBannerDesc', 'Banner Desc')}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${generateInput('promiseBannerBtnText', 'Banner Button Text')}
            ${generateInput('promiseBannerBtnUrl', 'Banner Button URL')}
          </div>
        </div>
      </div>

      {/* 13. FAQ */}
      <div className="border-t border-white/5 pt-8 space-y-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">❓ 13. FAQ Database</h4>
        ${generateInput('faqDataJson', 'FAQ Array (JSON)')}
      </div>

      {/* 14. Footer / Global Info */}
      <div className="border-t border-white/5 pt-8 space-y-6 pb-20">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">📍 14. Footer & Contact Info</h4>
        ${generateInput('footerCopyright', 'Footer Copyright')}
      </div>
    </div>
  );
}
`;
}

function buildOtherTabs() {
  return `import React from 'react';
import { useContent } from '../../context/ContentContext';

export function AdminTeamTab() {
  const { content, updateContentField } = useContent();
  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">👥 Team Content</h4>
        ${generateInput('teamTitle', 'Team Title')}
        ${generateInput('teamDesc', 'Team Description')}
        ${generateInput('teamMembersJson', 'Team Data (JSON Array)')}
      </div>
      <div className="border-t border-white/5 pt-8 space-y-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">🤝 Partner Content</h4>
        ${generateInput('partnerTitle', 'Partner Title')}
        ${generateInput('partnerDesc', 'Partner Subtitle')}
        ${generateInput('partnerSubmitTitle', 'Partner Submit Card Title')}
        ${generateInput('partnerSubmitDesc', 'Partner Submit Card Desc')}
      </div>
    </div>
  );
}

export function AdminGalleryTab() {
  const { content, updateContentField } = useContent();
  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">🖼️ Gallery Content</h4>
        ${generateInput('galleryTitle', 'Title')}
        ${generateInput('galleryDesc', 'Description')}
        ${generateInput('galleryImagesListJson', 'Gallery Array (JSON)')}
      </div>
      <div className="border-t border-white/5 pt-8 space-y-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">✨ Projects Content</h4>
        ${generateInput('projectsTitle', 'Title')}
        ${generateInput('projectsDesc', 'Description')}
        ${generateInput('projectsListJson', 'Projects Array (JSON)')}
      </div>
      <div className="border-t border-white/5 pt-8 space-y-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">🗓️ Events Content</h4>
        ${generateInput('eventsTitle', 'Title')}
        ${generateInput('eventsDesc', 'Description')}
        ${generateInput('eventsListJson', 'Events Array (JSON)')}
      </div>
    </div>
  );
}

export function AdminContactTab() {
  const { content, updateContentField } = useContent();
  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-6">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">📞 Contact Details</h4>
        ${generateInput('contactAddress', 'Address')}
        ${generateInput('contactEmail', 'Email Address')}
        ${generateInput('contactPhone', 'Phone Number')}
      </div>
    </div>
  );
}
`;
}

function buildRenderer() {
  return `import React from 'react';
import AdminHomeTab from './AdminHomeTab';
import { AdminTeamTab, AdminGalleryTab, AdminContactTab } from './AdminOtherTabs';

interface Props {
  activeContentTab: "home" | "community" | "team_partner" | "events_projects_gallery" | "contact";
  handleSaveAllContent: () => void;
  saveStatus: string;
}

export default function AdminContentRenderer({ activeContentTab, handleSaveAllContent, saveStatus }: Props) {
  return (
    <div>
      {activeContentTab === 'home' && <AdminHomeTab />}
      {activeContentTab === 'team_partner' && <AdminTeamTab />}
      {activeContentTab === 'events_projects_gallery' && <AdminGalleryTab />}
      {activeContentTab === 'contact' && <AdminContactTab />}
    </div>
  );
}
`;
}

fs.mkdirSync('src/components/admin', { recursive: true });
fs.writeFileSync('src/components/admin/AdminHomeTab.tsx', buildHomeTab());
fs.writeFileSync('src/components/admin/AdminOtherTabs.tsx', buildOtherTabs());
fs.writeFileSync('src/components/admin/AdminContentRenderer.tsx', buildRenderer());
console.log("Admin tabs generated successfully!");
