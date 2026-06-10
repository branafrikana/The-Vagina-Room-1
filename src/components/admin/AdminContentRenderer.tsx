import React from 'react';
import AdminHomeTab from './AdminHomeTab';
import { 
  AdminAboutUsTab,
  AdminDrFidTab, 
  AdminFocusAreasTab, 
  AdminTeamPartnerTab, 
  AdminProjectsEventsTab, 
  AdminGalleryTab, 
  AdminContactTab,
  AdminTestimonialsTab,
  AdminSupportTab,
  AdminPolicyTermsTab,
  AdminFooterTab,
  AdminDrFidBookingTab,
  AdminJoinCommunityTab,
  AdminTelegramCommunityTab,
  AdminAffiliateProgramTab
} from './AdminOtherTabs';

interface Props {
  activeContentTab: "home" | "about_us" | "about_dr_fid" | "dr_fid_booking" | "focus_areas" | "team_partner" | "projects_events" | "gallery" | "contact" | "testimonials" | "support" | "policy_terms" | "join_community" | "telegram_community" | "footer" | "affiliate_program";
  handleSaveAllContent: () => void;
  saveStatus: string;
}

export default function AdminContentRenderer({ activeContentTab, handleSaveAllContent, saveStatus }: Props) {
  return (
    <div>
      {activeContentTab === 'home' && <AdminHomeTab />}
      {activeContentTab === 'about_us' && <AdminAboutUsTab />}
      {activeContentTab === 'about_dr_fid' && <AdminDrFidTab />}
      {activeContentTab === 'dr_fid_booking' && <AdminDrFidBookingTab />}
      {activeContentTab === 'focus_areas' && <AdminFocusAreasTab />}
      {activeContentTab === 'team_partner' && <AdminTeamPartnerTab />}
      {activeContentTab === 'projects_events' && <AdminProjectsEventsTab />}
      {activeContentTab === 'gallery' && <AdminGalleryTab />}
      {activeContentTab === 'contact' && <AdminContactTab />}
      {activeContentTab === 'testimonials' && <AdminTestimonialsTab />}
      {activeContentTab === 'support' && <AdminSupportTab />}
      {activeContentTab === 'policy_terms' && <AdminPolicyTermsTab />}
      {activeContentTab === 'join_community' && <AdminJoinCommunityTab />}
      {activeContentTab === 'telegram_community' && <AdminTelegramCommunityTab />}
      {activeContentTab === 'affiliate_program' && <AdminAffiliateProgramTab />}
      {activeContentTab === 'footer' && <AdminFooterTab />}
    </div>
  );
}
