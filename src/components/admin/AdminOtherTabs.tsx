import React from 'react';
import { useContent } from '../../context/ContentContext';
import ArrayJSONEditor from './ArrayJSONEditor';
import { ImageUploader } from '../../pages/AdminPage';

// Defaults
const DEFAULT_ABOUT_OBJECTIVES = [
  "Comprehensive Wellness Education",
  "Confidential Mentorship & Guidance",
  "Clinical Synergy (Integrative Naturopathy & Restorative Spa Care)"
];

const DEFAULT_TEAM = [
  {
    name: "Amb. Dr. Damilola Awoyemi",
    role: "Founder & CEO (Dr. FID)",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800",
    bio: "Visionary leader and holistic wellness expert dedicated to women's intimate health.",
    link: "/dr-fid"
  },
  {
    name: "Wellness Consultant",
    role: "Lead Holistic Practitioner",
    image: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=800",
    bio: "Expert in restorative therapies and integrated healthcare solutions.",
  },
  {
    name: "Clinical Support",
    role: "Reproductive Health Educator",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=800",
    bio: "Empowering women with accurate education and compassionate support.",
  },
  {
    name: "Community Lead",
    role: "Advocacy & Support Manager",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    bio: "Building a safe space for connection, healing, and shared experiences.",
  }
];

const DEFAULT_GALLERY = [
  {
    id: 1,
    title: "Intimate Wellness Workshop",
    category: "Workshops",
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800",
    description: "Empowering women through shared knowledge and safe conversations."
  },
  {
    id: 2,
    title: "Rural Health Outreach",
    category: "Outreach",
    image: "https://images.unsplash.com/photo-1516533075015-a3838414c3cb?auto=format&fit=crop&q=80&w=800",
    description: "Direct impact in underserved communities, providing essential education."
  },
  {
    id: 3,
    title: "Sisterhood Circle",
    category: "Community",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    description: "A secure space for emotional healing and connection."
  },
  {
    id: 4,
    title: "Fid Spa Clinical Session",
    category: "Clinic",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800",
    description: "Professional restorative care and manual therapy expertise."
  },
  {
    id: 5,
    title: "Wellness Retreat",
    category: "Community",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
    description: "Returning to nature to find inner balance and peace."
  },
  {
    id: 6,
    title: "Health Education Seminar",
    category: "Workshops",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
    description: "Advanced seminars on reproductive and sexual wellness."
  }
];

const DEFAULT_PROJECTS = [
  {
    title: "The Intimate Wellness Workshop",
    category: "Education",
    status: "Ongoing",
    location: "Asaba, Delta State",
    date: "Monthly",
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800",
    description: "A series of masterclasses taught by experts covering vaginal hygiene, hormonal balance, and sexual wellness.",
    impact: "500+ Women Educated"
  },
  {
    title: "Project Healing Hands",
    category: "Support",
    status: "Active",
    location: "Fid Spa Clinic",
    date: "Quarterly",
    image: "https://images.unsplash.com/photo-1516533075015-a3838414c3cb?auto=format&fit=crop&q=80&w=800",
    description: "Restorative therapy sessions and emotional counselling for women recovering from reproductive health challenges and trauma.",
    impact: "120+ Sessions Completed"
  }
];

const DEFAULT_EVENTS = [
  {
    title: "The Intimate Wellness Masterclass",
    date: "June 15, 2026",
    time: "10:00 AM - 2:00 PM",
    location: "Fid Spa Clinic, Asaba",
    type: "Workshop",
    price: "Registration Required",
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800",
    description: "An intensive education session focusing on hormonal balance, vaginal health, and empowering your body's natural healing systems.",
    status: "Upcoming"
  },
  {
    title: "Healing & Wholeness Retreat",
    date: "July 22, 2026",
    time: "Full Day Experience",
    location: "Private Sanctuary, Delta State",
    type: "Retreat",
    price: "Exclusive Invite",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
    description: "A day of restorative therapy, emotional healing, and sisterhood connection designed to reset your mental and physical wellbeing.",
    status: "Limited Slots"
  }
];

const DEFAULT_FOCUS_AREAS = [
  {
    title: "Vaginal & Reproductive Wellness",
    description: "We provide education, support, and wellness solutions around the core of women's physical health.",
    items: [
      "Vaginal health & hygiene",
      "Vulva and vagina wellness",
      "Vaginal microbiome health",
      "Infection treatment & prevention",
      "STI testing & treatment",
      "Menstrual health support",
      "Pelvic floor health",
      "Sexual pain management",
      "Hormonal balance & therapy",
      "Pregnancy & postpartum care",
      "Menopause support",
      "Fertility support & guidance",
      "Contraception & family planning"
    ]
  },
  {
    title: "Sexual Wellness & Relationship Support",
    description: "We create safe and respectful spaces for women and couples to learn, heal, and grow.",
    items: [
      "Sexual health education",
      "Sexual intimacy coaching",
      "Libido & desire enhancement",
      "Sex therapy & counselling",
      "Relationship counselling",
      "Sexual trauma support",
      "Sexual education for different life stages",
      "Gender identity & sexual orientation support"
    ]
  },
  {
    title: "Holistic Healing & Empowerment",
    description: "Embracing emotional, mental, natural, and lifestyle-centered wellness approaches.",
    items: [
      "Body positivity & self-love",
      "Natural & alternative therapies",
      "Herbal wellness education",
      "Emotional wellness support",
      "Confidence rebuilding",
      "Women’s reproductive rights advocacy"
    ]
  }
];

/* 1a. ABOUT US PAGE EDITOR */
export function AdminAboutUsTab() {
  const { content, updateContentField } = useContent();

  const DEFAULT_ABOUT_VALUES = [
    { title: "SINCERE INTENTION", desc: "No judgment, no bias—just real restorative guidance." },
    { title: "RESTORATIVE CARE", desc: "Rebuilding anatomical and tissue balance naturally." },
    { title: "EMPOWERING KNOWLEDGE", desc: "Equipping women with tools and terms to advocate for themselves." }
  ];

  const DEFAULT_ABOUT_DIFFERENTIATORS = [
    { title: "Manual Therapeutics", desc: "Combining high-precision massage, stretching, and physical restoration." },
    { title: "Academic Foundations", desc: "Taught by a Public Health and Complementary Medicine pioneer." },
    { title: "Aesthetic Synergy", desc: "Integrating clinic-grade standards into a serene spa experience." }
  ];

  const DEFAULT_ABOUT_WHO_WE_SERVE = [
    "Teen girls navigating puberty",
    "Expectant and postpartum mothers",
    "Women seeking natural hormonal support",
    "Couples seeking intimacy counseling"
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">🌸 About Us Page Elements</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">About Title Keynote</label>
          <input 
            type="text" 
            value={content.aboutTitle || ""}
            onChange={(e) => updateContentField("aboutTitle", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            placeholder="e.g. OUR MISSION & GROUNDWORK"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">About Landing Heading</label>
          <input 
            type="text" 
            value={content.aboutHeading || ""}
            onChange={(e) => updateContentField("aboutHeading", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            placeholder="e.g. A SANCTUARY FOR EVERY WOMAN'S HEALTH JOURNEY"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Main Bio Narrative Paragraph 1</label>
        <textarea 
          value={content.aboutParagraph1 || ""}
          onChange={(e) => updateContentField("aboutParagraph1", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-20 text-xs font-mono leading-relaxed" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Main Bio Narrative Paragraph 2</label>
        <textarea 
          value={content.aboutParagraph2 || ""}
          onChange={(e) => updateContentField("aboutParagraph2", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-20 text-xs font-mono leading-relaxed" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Mission Title</label>
          <input 
            type="text" 
            value={content.aboutUsMissionTitle || ""}
            onChange={(e) => updateContentField("aboutUsMissionTitle", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Vision Title</label>
          <input 
            type="text" 
            value={content.aboutUsVisionTitle || ""}
            onChange={(e) => updateContentField("aboutUsVisionTitle", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Mission Statement Outline</label>
        <textarea 
          value={content.aboutUsMissionDesc || ""}
          onChange={(e) => updateContentField("aboutUsMissionDesc", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-16 text-xs font-mono leading-relaxed" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Vision Statement Outline</label>
        <textarea 
          value={content.aboutUsVisionDesc || ""}
          onChange={(e) => updateContentField("aboutUsVisionDesc", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-16 text-xs font-mono leading-relaxed" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Empowerment Slogan Callout Box</label>
        <textarea 
          value={content.aboutUsBoxText || ""}
          onChange={(e) => updateContentField("aboutUsBoxText", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-16 text-xs font-mono leading-relaxed" 
        />
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">About Landing Hero Banner Photo</label>
        <ImageUploader fieldKey="aboutImageUrl" label="Primary About Cover Image" />
      </div>

      {/* NEW JSON LIST EDITORS FOR ABOUT US SECTIONS */}
      <div className="border-t border-white/5 pt-6 space-y-6">
        <h4 className="text-xs font-black uppercase tracking-wider text-brand-gold">📋 Programmable Lists inside About Us Page</h4>

        <div className="space-y-4">
          <ArrayJSONEditor
            label="Who We Serve Audience Directory"
            fieldKey="whoWeServeJson"
            value={content.whoWeServeJson || ""}
            onChange={updateContentField}
            defaultStructure=""
            itemType="Audience Descriptor"
            fallbackData={DEFAULT_ABOUT_WHO_WE_SERVE}
          />
        </div>

        <div className="space-y-4">
          <ArrayJSONEditor
            label="Service Differentiators"
            fieldKey="differentiatorsJson"
            value={content.differentiatorsJson || ""}
            onChange={updateContentField}
            defaultStructure={{ title: "", desc: "" }}
            itemType="Differentiator Card"
            fallbackData={DEFAULT_ABOUT_DIFFERENTIATORS}
          />
        </div>

        <div className="space-y-4">
          <ArrayJSONEditor
            label="Core Vision Values"
            fieldKey="coreValuesJson"
            value={content.coreValuesJson || ""}
            onChange={updateContentField}
            defaultStructure={{ title: "", desc: "" }}
            itemType="Value Principle"
            fallbackData={DEFAULT_ABOUT_VALUES}
          />
        </div>
      </div>
    </div>
  );
}

/* 1b. ABOUT DR. FID PAGE EDITOR */
export function AdminDrFidTab() {
  const { content, updateContentField } = useContent();

  const DEFAULT_FID_EXPERTISE = [
    { title: "Integrative Naturopathy" },
    { title: "Spinal Manipulation" },
    { title: "Herbal Therapeutics" },
    { title: "Holistic Body Restoration" },
    { title: "Chiropractic Care" },
    { title: "Naturopathy" }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">👑 Dr. FID Biography details</h3>
      
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Ambassador Headline</label>
        <input 
          type="text" 
          value={content.drFidHeading || ""}
          onChange={(e) => updateContentField("drFidHeading", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          placeholder="e.g. Ambassador"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Narrative Paragraph 1 (Aesthetic & Clinical Background)</label>
        <textarea 
          value={content.drFidBio1 || ""}
          onChange={(e) => updateContentField("drFidBio1", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-20 text-xs font-mono leading-relaxed" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Narrative Paragraph 2 (Integrative Pain Management & Wellness Strategy)</label>
        <textarea 
          value={content.drFidBio2 || ""}
          onChange={(e) => updateContentField("drFidBio2", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-20 text-xs font-mono leading-relaxed" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Narrative Paragraph 3 (Global Education & Restorative Mindsets)</label>
        <textarea 
          value={content.drFidBio3 || ""}
          onChange={(e) => updateContentField("drFidBio3", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-20 text-xs font-mono leading-relaxed" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Inspirational Healing Quote Statement</label>
        <textarea 
          value={content.drFidQuote || ""}
          onChange={(e) => updateContentField("drFidQuote", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-20 text-xs font-mono leading-relaxed" 
        />
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Dr. FID Profile Cover Portrait Photo</label>
        <ImageUploader fieldKey="drFidPageImageUrl" label="Primary Portrait Landscape Photo" />
      </div>

      {/* NEW DISCOVERY: ADD CERTIFICATIONS & EXPERTISE TAGS */}
      <div className="border-t border-white/5 pt-6 space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-brand-gold">🎓 Professional Qualifications & Badges</h4>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Academic Certifications list (One per line)</label>
          <textarea 
            value={content.drFidCertifications || ""}
            onChange={(e) => updateContentField("drFidCertifications", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-28 text-xs font-mono leading-relaxed" 
            placeholder="e.g. Western Ville University, USA..."
          />
        </div>

        <div className="space-y-2">
          <ArrayJSONEditor
            label="Expertise Highlight Tags"
            fieldKey="drFidExpertiseJson"
            value={content.drFidExpertiseJson || ""}
            onChange={updateContentField}
            defaultStructure={{ title: "" }}
            itemType="Expertise Core Badge"
            fallbackData={DEFAULT_FID_EXPERTISE}
          />
        </div>
      </div>

      {/* NEW DISCOVERY: ADD ANCP SPA FRAMEWORK DETAILS */}
      <div className="border-t border-white/5 pt-6 space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-brand-gold">🌿 ANCP Wellness Spa Framework Elements</h4>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">ANCP Framework Definition Statement (LHS Core)</label>
          <textarea 
            value={content.drFidAncpParagraph1 || ""}
            onChange={(e) => updateContentField("drFidAncpParagraph1", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-16 text-xs font-mono leading-relaxed" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">ANCP Empowering Narrative Block</label>
          <textarea 
            value={content.drFidAncpParagraph2 || ""}
            onChange={(e) => updateContentField("drFidAncpParagraph2", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-16 text-xs font-mono leading-relaxed" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">ANCP Direct Training Narrative Block</label>
          <textarea 
            value={content.drFidAncpParagraph3 || ""}
            onChange={(e) => updateContentField("drFidAncpParagraph3", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-16 text-xs font-mono leading-relaxed" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Trained Count Milestone</label>
            <input 
              type="text" 
              value={content.drFidAncpTrainedCount || ""}
              onChange={(e) => updateContentField("drFidAncpTrainedCount", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Treatment Protocols Label</label>
            <input 
              type="text" 
              value={content.drFidAncpProtocolsLabel || ""}
              onChange={(e) => updateContentField("drFidAncpProtocolsLabel", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            />
          </div>
        </div>
      </div>

      {/* NEW DISCOVERY: ADD PERSONAL LIFE / FAMILY DETAILS */}
      <div className="border-t border-white/5 pt-6 space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-brand-gold">👨‍👩‍👧‍👦 Personal Life & Philosophical Settings</h4>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Family Section Title</label>
          <input 
            type="text" 
            value={content.drFidPersonalLifeTitle || ""}
            onChange={(e) => updateContentField("drFidPersonalLifeTitle", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Family Bios Narrative - Paragraph 1</label>
          <textarea 
            value={content.drFidPersonalLifeParagraph1 || ""}
            onChange={(e) => updateContentField("drFidPersonalLifeParagraph1", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-20 text-xs font-mono leading-relaxed" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Family Bios Narrative - Paragraph 2</label>
          <textarea 
            value={content.drFidPersonalLifeParagraph2 || ""}
            onChange={(e) => updateContentField("drFidPersonalLifeParagraph2", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-20 text-xs font-mono leading-relaxed" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Core Philosophy Quote text</label>
          <textarea 
            value={content.drFidPersonalLifePhilosophy || ""}
            onChange={(e) => updateContentField("drFidPersonalLifePhilosophy", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-16 text-[11px] font-mono leading-relaxed" 
          />
        </div>
      </div>
    </div>
  );
}

/* 2. FOCUS AREAS TAB */
export function AdminFocusAreasTab() {
  const { content, updateContentField } = useContent();

  return (
    <div className="space-y-6">
      <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">🎯 Focus Page Headings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Focus Page Section Keyword</label>
          <input 
            type="text" 
            value={content.focusAreasSub || ""}
            onChange={(e) => updateContentField("focusAreasSub", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Focus Page Title Header</label>
          <input 
            type="text" 
            value={content.focusAreasHeading || ""}
            onChange={(e) => updateContentField("focusAreasHeading", e.target.value)}
            placeholder="e.g. Focus Areas."
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Focus Page Main Slogan</label>
          <input 
            type="text" 
            value={content.focusAreasTitle || ""}
            onChange={(e) => updateContentField("focusAreasTitle", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
      </div>

      <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2 mt-8">📣 Footer Call to Action</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">CTA Slogan Title</label>
          <input 
            type="text" 
            value={content.focusAreasCtaHeading || ""}
            onChange={(e) => updateContentField("focusAreasCtaHeading", e.target.value)}
            placeholder="e.g. Start Your Transformation."
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">CTA Slogan Description</label>
          <input 
            type="text" 
            value={content.focusAreasCtaSub || ""}
            onChange={(e) => updateContentField("focusAreasCtaSub", e.target.value)}
            placeholder="e.g. Healing is a journey. We are here to guide every step."
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">CTA Redirect URL</label>
          <input 
            type="text" 
            value={content.focusAreasCtaUrl || ""}
            onChange={(e) => updateContentField("focusAreasCtaUrl", e.target.value)}
            placeholder="e.g. https://join.thevaginaroom.com"
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">CTA Button Label</label>
          <input 
            type="text" 
            value={content.focusAreasCtaBtnText || ""}
            onChange={(e) => updateContentField("focusAreasCtaBtnText", e.target.value)}
            placeholder="e.g. Join The Community"
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
      </div>

      <div className="mt-4">
        <ImageUploader fieldKey="focusAreasCtaBgUrl" label="Upload Footer Banner Background Image (Optional)" />
      </div>

      <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2 mt-8">📋 Focus Categories List</h3>

      <div className="space-y-2 mt-2">
        <ArrayJSONEditor
          label="Reproductive & Intimate Focus Sections"
          fieldKey="focusAreasJson"
          value={content.focusAreasJson || ""}
          onChange={updateContentField}
          defaultStructure={{ title: "", description: "", items: [] }}
          itemType="Focus Category"
          fallbackData={DEFAULT_FOCUS_AREAS}
        />
      </div>
    </div>
  );
}

/* 3. TEAM & PARTNER EDITOR */
export function AdminTeamPartnerTab() {
  const { content, updateContentField } = useContent();

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">👥 Team Member Archives</h3>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Team Section Title</label>
          <input 
            type="text" 
            value={content.teamTitle || ""}
            onChange={(e) => updateContentField("teamTitle", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Team Section Description</label>
          <textarea 
            value={content.teamDesc || ""}
            onChange={(e) => updateContentField("teamDesc", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-24 text-xs font-mono leading-relaxed" 
          />
        </div>

        <div className="space-y-2 mt-6">
          <ArrayJSONEditor
            label="Staffing & Practitioner Directory"
            fieldKey="teamMembersJson"
            value={content.teamMembersJson || ""}
            onChange={updateContentField}
            defaultStructure={{ name: "", role: "", category: "", bio: "", image: "", link: "" }}
            itemType="Staff Member"
            fallbackData={DEFAULT_TEAM}
            categoriesKey="teamCategoriesJson"
          />
        </div>
      </div>

      {/* Partners section */}
      <div className="border-t border-white/5 pt-10 space-y-6">
        <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">🤝 Corporate Partnerships</h3>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Partnership Landing Keynote</label>
          <input 
            type="text" 
            value={content.partnerTitle || ""}
            onChange={(e) => updateContentField("partnerTitle", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Partnership Landing Statement Description</label>
          <textarea 
            value={content.partnerDesc || ""}
            onChange={(e) => updateContentField("partnerDesc", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-20 text-xs font-mono leading-relaxed" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Form Banner Headline Title</label>
            <input 
              type="text" 
              value={content.partnerSubmitTitle || ""}
              onChange={(e) => updateContentField("partnerSubmitTitle", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Form Banner Narrative Desc</label>
            <textarea 
              value={content.partnerSubmitDesc || ""}
              onChange={(e) => updateContentField("partnerSubmitDesc", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-12 text-xs font-sans text-white/80" 
            />
          </div>
        </div>
      </div>

      {/* Media & Collegial Alliances Slider Editor */}
      <div className="border-t border-white/5 pt-10 space-y-6">
        <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">📰 Media & Collegial Alliances</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Alliances Pre-Title</label>
            <input 
              type="text" 
              value={content.partnersSub || ""}
              onChange={(e) => updateContentField("partnersSub", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Alliances Main Title</label>
            <input 
              type="text" 
              value={content.partnersHeading || ""}
              onChange={(e) => updateContentField("partnersHeading", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            />
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Fallback Spotlight Headline</label>
          <input 
            type="text" 
            value={content.partnersDefaultHeadline || ""}
            onChange={(e) => updateContentField("partnersDefaultHeadline", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            placeholder="Pioneering verified clinical education & holistic therapeutic models for private lifestyle sanctuaries."
          />
          <p className="text-[10px] text-white/40 italic">This headline is shown in the media spotlight when the selected source does not specify a unique headline.</p>
        </div>

        <div className="space-y-2 mt-4">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Alliances/Press Section Description</label>
          <textarea 
            value={content.partnersDescription || ""}
            onChange={(e) => updateContentField("partnersDescription", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs h-24 resize-none" 
            placeholder="Showcasing accredited features on global television networks, reputable press media publishers, and joint ventures with institutional clinical wellness allies."
          />
          <p className="text-[10px] text-white/40 italic">Brief descriptive text detailing media presence and joint-venture partnerships in the section layout.</p>
        </div>

        <div className="space-y-2 mt-6">
          <ArrayJSONEditor
            label="Media Outlets & Partner Logos"
            fieldKey="partnersLogosJson"
            value={content.partnersLogosJson || ""}
            onChange={updateContentField}
            defaultStructure={{ name: "", imageUrl: "", type: "Media Appearance", link: "", headline: "", impactYear: "" }}
            itemType="Logo Item"
            fallbackData={[
              { name: "BBC Africa", imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300", type: "Media Appearance", link: "", headline: "Exhibiting state-sanctioned advocacy of gynaecological education for indigenous West African women.", impactYear: "2025" },
              { name: "BellaNaija Style", imageUrl: "https://images.unsplash.com/photo-1618005198143-e5283b519a7f?auto=format&fit=crop&q=80&w=300", type: "Media Appearance", link: "", headline: "Spotlighting high-fashion wellness integrations and Breaking Taboos around feminine anatomy wellness.", impactYear: "2026" },
              { name: "Guardian Woman", imageUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=80&w=300", type: "Media Appearance", link: "", headline: "A comprehensive editorial on empowering women to discover clinical alternative therapies for recovery and rehabilitation.", impactYear: "2024" },
              { name: "Punch Newspaper", imageUrl: "https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&q=80&w=300", type: "Media Appearance", link: "", headline: "Breaking reports on natural herbal therapeutic standardizations for modern African wellness models.", impactYear: "2025" },
              { name: "Channels Television", imageUrl: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&q=80&w=300", type: "Media Appearance", link: "", headline: "Live interview broadcasting standard methods of anatomical restoration and chiropractic hygiene practices.", impactYear: "2026" },
              { name: "Holistic Health Initiative", imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&q=80&w=300", type: "Trusted Partner", link: "", headline: "Aligning certified professionals to strengthen capacity across the holistic reproductive wellness domain.", impactYear: "Active" },
              { name: "Global Wellness Council", imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300", type: "Trusted Partner", link: "", headline: "A strategic global wellness network validating complementaries and standardizing gynaecological spa guidelines.", impactYear: "Active" }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

/* 4. PROJECTS & EVENTS TAB */
export function AdminProjectsEventsTab() {
  const { content, updateContentField } = useContent();

  return (
    <div className="space-y-12">
      {/* Projects */}
      <div className="space-y-6">
        <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">✨ Platforms & Special Initiatives</h3>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Projects Headline Slogan</label>
          <input 
            type="text" 
            value={content.projectsTitle || ""}
            onChange={(e) => updateContentField("projectsTitle", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Projects Subheadings Description Text</label>
          <textarea 
            value={content.projectsDesc || ""}
            onChange={(e) => updateContentField("projectsDesc", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-20 text-xs font-mono leading-relaxed" 
          />
        </div>

        <div className="space-y-2 mt-6">
          <ArrayJSONEditor
            label="Initiatives & Outreach Campaigns"
            fieldKey="projectsListJson"
            value={content.projectsListJson || ""}
            onChange={updateContentField}
            defaultStructure={{ title: "", category: "", status: "", location: "", date: "", image: "", description: "", impact: "" }}
            itemType="Campaign Item"
            fallbackData={DEFAULT_PROJECTS}
            categoriesKey="projectsCategoriesJson"
          />
        </div>
      </div>

      {/* Events */}
      <div className="border-t border-white/5 pt-10 space-y-6">
        <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">🗓️ Live Gatherings & Masterclasses</h3>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Events Header Keyword</label>
          <input 
            type="text" 
            value={content.eventsTitle || ""}
            onChange={(e) => updateContentField("eventsTitle", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Events Context Slogan Description</label>
          <textarea 
            value={content.eventsDesc || ""}
            onChange={(e) => updateContentField("eventsDesc", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-20 text-xs font-mono leading-relaxed" 
          />
        </div>

        <div className="space-y-2 mt-6">
          <ArrayJSONEditor
            label="Live Experience Registrations"
            fieldKey="eventsListJson"
            value={content.eventsListJson || ""}
            onChange={updateContentField}
            defaultStructure={{ title: "", date: "", time: "", location: "", type: "", price: "", image: "", description: "", status: "" }}
            itemType="Event Session"
            fallbackData={DEFAULT_EVENTS}
            categoriesKey="eventsCategoriesJson"
          />
        </div>
      </div>
    </div>
  );
}

/* 7. FOOTER EDITOR */
export function AdminFooterTab() {
  const { content, updateContentField } = useContent();

  return (
    <div className="space-y-6">
      <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">👣 Footer Content Editor</h3>
      
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Footer Copyright Text</label>
        <input 
          type="text" 
          value={content.footerCopyright || ""}
          onChange={(e) => updateContentField("footerCopyright", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Footer Slogan</label>
        <input 
          type="text" 
          value={content.footerSlogan || ""}
          onChange={(e) => updateContentField("footerSlogan", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Core Values Title</label>
          <input 
            type="text" 
            value={content.footerCoreValuesTitle || ""}
            onChange={(e) => updateContentField("footerCoreValuesTitle", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Core Values List (Bullet separated)</label>
        <textarea 
          value={content.footerCoreValuesList || ""}
          onChange={(e) => updateContentField("footerCoreValuesList", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-20 text-xs font-mono leading-relaxed" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Medical Disclaimer Title</label>
        <input 
          type="text" 
          value={content.footerDisclaimerTitle || ""}
          onChange={(e) => updateContentField("footerDisclaimerTitle", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Medical Disclaimer Description</label>
        <textarea 
          value={content.footerDisclaimerDesc || ""}
          onChange={(e) => updateContentField("footerDisclaimerDesc", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-40 text-xs font-mono leading-relaxed" 
        />
      </div>
    </div>
  );
}

export function AdminGalleryTab() {
  const { content, updateContentField } = useContent();

  return (
    <div className="space-y-6">
      <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">🖼️ Community Photobook & Gallery</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Gallery Title Phrase</label>
          <input 
            type="text" 
            value={content.galleryTitle || ""}
            onChange={(e) => updateContentField("galleryTitle", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Gallery Explanatory Description</label>
          <input 
            type="text" 
            value={content.galleryDesc || ""}
            onChange={(e) => updateContentField("galleryDesc", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
      </div>

      <div className="space-y-2 mt-6">
        <ArrayJSONEditor
          label="Visual Assets Directory"
          fieldKey="galleryImagesListJson"
          value={content.galleryImagesListJson || ""}
          onChange={updateContentField}
          defaultStructure={{ id: 1, title: "", category: "", image: "", description: "" }}
          itemType="Gallery Photo"
          fallbackData={DEFAULT_GALLERY}
          categoriesKey="galleryCategoriesJson"
        />
      </div>
    </div>
  );
}

/* 6. CONTACT DETAILS TAB */
export function AdminContactTab() {
  const { content, updateContentField } = useContent();

  return (
    <div className="space-y-6 pb-20">
      <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">📂 Page Header & Hero</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Contact Page Section Label</label>
          <input 
            type="text" 
            value={content.contactLabel || ""}
            onChange={(e) => updateContentField("contactLabel", e.target.value)}
            placeholder="e.g. Get In Touch"
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Contact Page Heading</label>
          <input 
            type="text" 
            value={content.contactHeading || ""}
            onChange={(e) => updateContentField("contactHeading", e.target.value)}
            placeholder="e.g. Contact Us."
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Contact Page Slogan Description</label>
        <textarea 
          value={content.contactSub || ""}
          onChange={(e) => updateContentField("contactSub", e.target.value)}
          placeholder="e.g. A safe space starts with a conversation. We are here to listen, support, and guide you."
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs h-20" 
        />
      </div>

      <div className="space-y-4 mb-8">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Contact Feed Blurred Background Image</label>
        <ImageUploader fieldKey="contactBgUrl" label="Background Image" />
      </div>

      <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2 mt-8">📞 Communication Coordinates</h3>
      
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Physical Sanctuary Clinic Address</label>
        <input 
          type="text" 
          value={content.contactAddress || ""}
          onChange={(e) => updateContentField("contactAddress", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Corporate Support Email</label>
          <input 
            type="text" 
            value={content.contactEmail || ""}
            onChange={(e) => updateContentField("contactEmail", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Hotline Call Number</label>
          <input 
            type="text" 
            value={content.contactPhone || ""}
            onChange={(e) => updateContentField("contactPhone", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
      </div>

      <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2 mt-8">🛡️ Trust & Confidentiality Callout</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Confidentiality Card Title</label>
          <input 
            type="text" 
            value={content.contactConfidentialityTitle || ""}
            onChange={(e) => updateContentField("contactConfidentialityTitle", e.target.value)}
            placeholder="e.g. Confidentiality Promise"
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Confidentiality Card Description</label>
          <textarea 
            value={content.contactConfidentialityDesc || ""}
            onChange={(e) => updateContentField("contactConfidentialityDesc", e.target.value)}
            placeholder="Every message sent to The Vagina Room is treated with the highest level of privacy..."
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs h-16" 
          />
        </div>
      </div>

      <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2 mt-8">🤝 Call to Action (Support & Partner Guides)</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">CTA Section Sub-label</label>
          <input 
            type="text" 
            value={content.contactWaysToSupportLabel || ""}
            onChange={(e) => updateContentField("contactWaysToSupportLabel", e.target.value)}
            placeholder="e.g. Collective Action"
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">CTA Section Main Title</label>
          <input 
            type="text" 
            value={content.contactWaysToSupportTitle || ""}
            onChange={(e) => updateContentField("contactWaysToSupportTitle", e.target.value)}
            placeholder="e.g. Ways To Support."
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
      </div>

      <div className="border border-white/5 p-4 rounded-none bg-white/[0.02] space-y-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white/50">Left Promo Card (Donate/Mission)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Mission Title</label>
            <input 
              type="text" 
              value={content.contactSupportMissionTitle || ""}
              onChange={(e) => updateContentField("contactSupportMissionTitle", e.target.value)}
              placeholder="e.g. Support Our Mission"
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Mission Description</label>
            <input 
              type="text" 
              value={content.contactSupportMissionDesc || ""}
              onChange={(e) => updateContentField("contactSupportMissionDesc", e.target.value)}
              placeholder="e.g. Your support helps us reach more women..."
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Button Text</label>
          <input 
            type="text" 
            value={content.contactSupportMissionBtnText || ""}
            onChange={(e) => updateContentField("contactSupportMissionBtnText", e.target.value)}
            placeholder="e.g. Donate Now"
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
      </div>

      <div className="border border-white/5 p-4 rounded-none bg-white/[0.02] space-y-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white/50">Right Promo Card (Partner)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Partner Title</label>
            <input 
              type="text" 
              value={content.contactPartnerWithUsTitle || ""}
              onChange={(e) => updateContentField("contactPartnerWithUsTitle", e.target.value)}
              placeholder="e.g. Partner With Us"
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Partner Description</label>
            <input 
              type="text" 
              value={content.contactPartnerWithUsDesc || ""}
              onChange={(e) => updateContentField("contactPartnerWithUsDesc", e.target.value)}
              placeholder="e.g. Are you a healthcare professional or organization?..."
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Button Text</label>
          <input 
            type="text" 
            value={content.contactPartnerWithUsBtnText || ""}
            onChange={(e) => updateContentField("contactPartnerWithUsBtnText", e.target.value)}
            placeholder="e.g. Learn More"
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
      </div>
    </div>
  );
}

const DEFAULT_TESTIMONIALS_FALLBACK = [
  {
    id: 1,
    quote: "The Vagina Room gave me my dignity back. I used to feel so much shame about my reproductive health questions, but here I found answers and sisterhood.",
    author: "Chiamaka O.",
    role: "Community Member",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    rating: 5
  },
  {
    id: 2,
    quote: "Dr. FID's holistic wellness approach and vaginal health sessions literally saved my marriage. Learning to love and understand my body changed everything.",
    author: "Ngozi E.",
    role: "Workshop Participant",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    rating: 5
  },
  {
    id: 3,
    quote: "A completely safe, non-judgmental, and confidential space. Every young woman needs to be a part of this movement.",
    author: "Fatima Y.",
    role: "Regular Attendee",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
    rating: 5
  }
];

/* 7. TESTIMONIALS CONTENT TAB */
export function AdminTestimonialsTab() {
  const { content, updateContentField } = useContent();

  return (
    <div className="space-y-6 pb-20">
      <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">⭐ Patient & Member Testimonials</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Sub-header Label</label>
          <input 
            type="text" 
            value={content.testimonialsSub || ""}
            onChange={(e) => updateContentField("testimonialsSub", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            placeholder="e.g. WHAT MEMBERS SAY"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Main Section Title</label>
          <input 
            type="text" 
            value={content.testimonialsTitle || ""}
            onChange={(e) => updateContentField("testimonialsTitle", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            placeholder="e.g. Testimonials."
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Section Description Text</label>
        <textarea 
          value={content.testimonialsDesc || ""}
          onChange={(e) => updateContentField("testimonialsDesc", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-20 text-xs font-mono leading-relaxed" 
          placeholder="Describe what these reviews represent..."
        />
      </div>

      <div className="space-y-2 mt-6">
        <ArrayJSONEditor
          label="Testimonials Directory Ledger"
          fieldKey="testimonialsJson"
          value={content.testimonialsJson || ""}
          onChange={updateContentField}
          defaultStructure={{ id: 1, quote: "", author: "", role: "", avatar: "", category: "", rating: 5 }}
          itemType="Review"
          fallbackData={DEFAULT_TESTIMONIALS_FALLBACK}
          categoriesKey="testimonialCategoriesJson"
        />
      </div>
    </div>
  );
}

/* 8. SUPPORT & DONATION EDITOR */
export function AdminSupportTab() {
  const { content, updateContentField } = useContent();

  const DEFAULT_IMPACT_STATS = [
    { label: "Community Outreach", desc: "Reaching underserved rural areas with health education." },
    { label: "Clinic Support", desc: "Subsidizing restorative care for women in need." },
    { label: "Education Mastery", desc: "Funding masterclasses and digital health resources." },
    { label: "Safe Space Expansion", desc: "Growing our local and digital support communities." }
  ];

  return (
    <div className="space-y-6 pb-20">
      <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">❤️ Support & Donations Editor</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Invest Label Slogan</label>
          <input 
            type="text" 
            value={content.supportInvestLabel || ""}
            onChange={(e) => updateContentField("supportInvestLabel", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            placeholder="e.g. Invest in Her Wellness"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Support Main Heading</label>
          <input 
            type="text" 
            value={content.supportHeading || ""}
            onChange={(e) => updateContentField("supportHeading", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            placeholder="e.g. Support The Mission."
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Support Hero Pitch Description</label>
        <textarea 
          value={content.supportSub || ""}
          onChange={(e) => updateContentField("supportSub", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-20 text-xs font-mono leading-relaxed" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Fuel Section Title</label>
          <input 
            type="text" 
            value={content.supportFuelHeading || ""}
            onChange={(e) => updateContentField("supportFuelHeading", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            placeholder="e.g. Fueling Healing."
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Secure Donation Transaction Link</label>
          <input 
            type="text" 
            value={content.supportPaystackUrl || ""}
            onChange={(e) => updateContentField("supportPaystackUrl", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs text-brand-gold font-mono" 
            placeholder="e.g. https://paystack.com/pay/thevaginaroom"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Donation Sincerity Paragraph</label>
        <textarea 
          value={content.supportFuelDesc || ""}
          onChange={(e) => updateContentField("supportFuelDesc", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-20 text-xs font-mono leading-relaxed" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Closing Section Title Phrase</label>
          <input 
            type="text" 
            value={content.supportClosingHeading || ""}
            onChange={(e) => updateContentField("supportClosingHeading", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Closing Section Assurance Text</label>
          <input 
            type="text" 
            value={content.supportClosingDesc || ""}
            onChange={(e) => updateContentField("supportClosingDesc", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>
      </div>

      <div className="space-y-2 mt-6">
        <ArrayJSONEditor
          label="Impact & Funding Allocation Stats"
          fieldKey="supportImpactStatsJson"
          value={content.supportImpactStatsJson || ""}
          onChange={updateContentField}
          defaultStructure={{ label: "", desc: "" }}
          itemType="Impact Statistic"
          fallbackData={DEFAULT_IMPACT_STATS}
        />
      </div>
    </div>
  );
}

/* 10. POLICY & TERMS EDITOR */
export function AdminPolicyTermsTab() {
  const { content, updateContentField } = useContent();

  const DEFAULT_POLICY_SECTIONS = [
    { title: "Introduction", content: "At The Vagina Room, we respect your privacy..." },
    { title: "Information We Collect", content: "We collect several types of information..." },
    { title: "Data Security", content: "We implemented measures designed to secure your personal information..." }
  ];

  const DEFAULT_TERMS_SECTIONS = [
    { title: "1. Acceptance of Terms", content: "By accessing and using this website..." },
    { title: "2. Not Medical Advice", content: "The content provided on this Website is for informational purposes only..." }
  ];

  return (
    <div className="space-y-12">
      {/* Privacy Policy */}
      <div className="space-y-6">
        <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">🛡️ Privacy Policy Content</h3>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Policy Page Main Heading</label>
          <input 
            type="text" 
            value={content.policyHeading || ""}
            onChange={(e) => updateContentField("policyHeading", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Policy Introductory Narrative</label>
          <textarea 
            value={content.policyIntro || ""}
            onChange={(e) => updateContentField("policyIntro", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-32 text-xs font-mono leading-relaxed" 
          />
        </div>

        <div className="space-y-2 mt-6">
          <ArrayJSONEditor
            label="Privacy Policy Granular Sections"
            fieldKey="policySectionsJson"
            value={content.policySectionsJson || ""}
            onChange={updateContentField}
            defaultStructure={{ title: "", content: "" }}
            itemType="Policy Section"
            fallbackData={DEFAULT_POLICY_SECTIONS}
          />
        </div>
      </div>

      {/* Terms of Service */}
      <div className="border-t border-white/5 pt-10 space-y-6">
        <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">⚖️ Terms of Engagement Content</h3>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Terms Page Main Heading</label>
          <input 
            type="text" 
            value={content.termsHeading || ""}
            onChange={(e) => updateContentField("termsHeading", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Terms Introductory Narrative</label>
          <textarea 
            value={content.termsIntro || ""}
            onChange={(e) => updateContentField("termsIntro", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-32 text-xs font-mono leading-relaxed" 
          />
        </div>

        <div className="space-y-2 mt-6">
          <ArrayJSONEditor
            label="Terms of Engagement Granular Sections"
            fieldKey="termsSectionsJson"
            value={content.termsSectionsJson || ""}
            onChange={updateContentField}
            defaultStructure={{ title: "", content: "" }}
            itemType="Terms Section"
            fallbackData={DEFAULT_TERMS_SECTIONS}
          />
        </div>
      </div>

      {/* Footer Branding & Disclaimer */}
      <div className="border-t border-white/5 pt-10 space-y-6">
        <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">📋 Footer Branding & Disclosure</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Footer Slogan</label>
            <input 
              type="text" 
              value={content.footerSlogan || ""}
              onChange={(e) => updateContentField("footerSlogan", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Core Values Header (Footer)</label>
            <input 
              type="text" 
              value={content.footerCoreValuesTitle || ""}
              onChange={(e) => updateContentField("footerCoreValuesTitle", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Core Values List (Footer Ticker/Summary)</label>
          <textarea 
            value={content.footerCoreValuesList || ""}
            onChange={(e) => updateContentField("footerCoreValuesList", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-16 text-xs font-mono leading-relaxed" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Disclaimer Heading</label>
            <input 
              type="text" 
              value={content.footerDisclaimerTitle || ""}
              onChange={(e) => updateContentField("footerDisclaimerTitle", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Footer Copyright Notice</label>
            <input 
              type="text" 
              value={content.footerCopyright || ""}
              onChange={(e) => updateContentField("footerCopyright", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs text-white/40" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Full Disclosure / Medical Disclaimer Text</label>
          <textarea 
            value={content.footerDisclaimerDesc || ""}
            onChange={(e) => updateContentField("footerDisclaimerDesc", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-32 text-xs font-mono leading-relaxed" 
          />
        </div>
      </div>
    </div>
  );
}

/* 6. DR. FID BOOKING PAGE EDITOR */
export function AdminDrFidBookingTab() {
  const { content, updateContentField } = useContent();

  return (
    <div className="space-y-8">
      <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">🎤 Dr. FID Booking & Engagements</h3>
      
      {/* Hero Section */}
      <div className="space-y-6">
        <h4 className="text-xs font-black uppercase tracking-wider text-white/50 border-l-2 border-brand-gold pl-3">Landing Hero Copy</h4>
        
        <div className="space-y-4 mb-4">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Booking Feed Blurred Background Image</label>
          <ImageUploader fieldKey="bookingBgUrl" label="Background Image" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Page Subtitle (Label)</label>
            <input 
              type="text" 
              value={content.bookingHeroSub || ""}
              onChange={(e) => updateContentField("bookingHeroSub", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
              placeholder="e.g. Contact & Bookings"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Main Heading Title</label>
            <input 
              type="text" 
              value={content.bookingHeroTitle || ""}
              onChange={(e) => updateContentField("bookingHeroTitle", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs font-bold" 
              placeholder="e.g. Invite Dr. FID."
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Hero Narrative Description</label>
          <textarea 
            value={content.bookingHeroDesc || ""}
            onChange={(e) => updateContentField("bookingHeroDesc", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-24 text-xs font-mono leading-relaxed" 
            placeholder="Invite Dr. FID for speaking engagements, wellness conferences..."
          />
        </div>
      </div>

      {/* Profile Section */}
      <div className="space-y-6 border-t border-white/5 pt-8">
        <h4 className="text-xs font-black uppercase tracking-wider text-white/50 border-l-2 border-brand-red pl-3">Expert Profile Section</h4>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Profile Heading Title</label>
          <input 
            type="text" 
            value={content.bookingAboutHeading || ""}
            onChange={(e) => updateContentField("bookingAboutHeading", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs" 
            placeholder="e.g. Holistic Wellness Expert & Women’s wellness advocate."
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Profile Detailed Bio</label>
          <textarea 
            value={content.bookingAboutDesc || ""}
            onChange={(e) => updateContentField("bookingAboutDesc", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-32 text-xs font-mono leading-relaxed" 
            placeholder="Ambassador Dr. Damilola Awoyemi (Dr. FID) is a Holistic Wellness Expert..."
          />
        </div>
      </div>

      {/* Availability List */}
      <div className="space-y-6 border-t border-white/5 pt-8">
        <h4 className="text-xs font-black uppercase tracking-wider text-white/50 border-l-2 border-brand-gold pl-3">Services & Availability List</h4>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Available For (One service per line)</label>
          <textarea 
            value={content.bookingAvailableList || ""}
            onChange={(e) => updateContentField("bookingAvailableList", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-48 text-xs font-mono leading-relaxed" 
            placeholder="Speaking Engagements&#10;Conferences & Summits..."
          />
          <p className="text-[10px] text-white/20 italic">List the specific types of engagements Dr. FID is available for. Each line becomes a list item.</p>
        </div>
      </div>
    </div>
  );
}

/* 13. JOIN COMMUNITY PAGE EDITOR */
export function AdminJoinCommunityTab() {
  const { content, updateContentField } = useContent();

  const DEFAULT_BENEFITS = [
    { title: "Safe & Private", text: "A confidential space where your questions are respected and your privacy is paramount.", icon: "ShieldCheck" },
    { title: "Expert-Led Education", text: "Access trusted, science-backed guidance on reproductive and intimate wellness.", icon: "BookOpen" },
    { title: "Global Sisterhood", text: "Connect with women worldwide on similar journeys of healing and discovery.", icon: "Users" },
    { title: "Holistic Support", text: "Integrative wellness tools that address your physical, emotional, and relational well-being.", icon: "Heart" }
  ];

  const DEFAULT_WHAT_YOU_GET = [
    "Bi-weekly wellness masterclasses with Dr. FID",
    "Access to our private discussion sanctuary",
    "Digital intimacy wellness library & resources",
    "Priority booking for retreats and workshops",
    "Exclusive discounts on curated healing products",
    "A supportive network of like-minded women"
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-base font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">🤝 Community Page Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Page Browser Title</label>
          <input 
            type="text" 
            value={content.joinCommunityTitle || ""}
            onChange={(e) => updateContentField("joinCommunityTitle", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
            placeholder="e.g. Join The Sanctuary"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Join Registration Cost</label>
          <input 
            type="text" 
            value={content.joinCommunityRegistrationCost || ""}
            onChange={(e) => updateContentField("joinCommunityRegistrationCost", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
            placeholder="e.g. Registration Fee: NGN 25,000 / $50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Hero Heading</label>
        <textarea 
          value={content.joinCommunityHeading || ""}
          onChange={(e) => updateContentField("joinCommunityHeading", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-16 text-xs font-mono leading-relaxed" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Section Subheading</label>
        <textarea 
          value={content.joinCommunitySubheading || ""}
          onChange={(e) => updateContentField("joinCommunitySubheading", e.target.value)}
          className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold h-16 text-xs font-mono leading-relaxed" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">CTA Button Label</label>
          <input 
            type="text" 
            value={content.joinCommunityCtaText || ""}
            onChange={(e) => updateContentField("joinCommunityCtaText", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Registration External Link</label>
          <input 
            type="text" 
            value={content.joinCommunityCtaUrl || ""}
            onChange={(e) => updateContentField("joinCommunityCtaUrl", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Hero Background Image</label>
        <ImageUploader fieldKey="joinCommunityHeroBgUrl" label="Background Image" />
      </div>

      <div className="border-t border-white/5 pt-6 space-y-6">
        <ArrayJSONEditor
          label="Key Benefits Matrix"
          fieldKey="joinCommunityBenefitsJson"
          value={content.joinCommunityBenefitsJson || ""}
          onChange={updateContentField}
          defaultStructure={{ title: "", text: "", icon: "Heart" }}
          itemType="Benefit Item"
          fallbackData={DEFAULT_BENEFITS}
        />

        <ArrayJSONEditor
          label="Member Deliverables (What You Get)"
          fieldKey="joinCommunityWhatYouGetJson"
          value={content.joinCommunityWhatYouGetJson || ""}
          onChange={updateContentField}
          defaultStructure=""
          itemType="Deliverable"
          fallbackData={DEFAULT_WHAT_YOU_GET}
        />
      </div>
    </div>
  );
}
