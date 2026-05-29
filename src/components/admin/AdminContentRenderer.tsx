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
  AdminDrFidBookingTab
} from './AdminOtherTabs';

interface Props {
  activeContentTab: "home" | "about_us" | "about_dr_fid" | "dr_fid_booking" | "focus_areas" | "team_partner" | "projects_events" | "gallery" | "contact" | "testimonials" | "support" | "policy_terms" | "footer";
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
      {activeContentTab === 'footer' && <AdminFooterTab />}
    </div>
  );
}
