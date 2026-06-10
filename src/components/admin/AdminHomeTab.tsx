import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { 
  Sparkles, 
  Layout, 
  User, 
  Grid, 
  Repeat, 
  Info, 
  Target, 
  Users, 
  Play, 
  ShieldCheck, 
  Quote, 
  MessageSquare, 
  Handshake, 
  Package, 
  Instagram, 
  HelpCircle,
  Eye,
  Star,
  Lock,
  Heart,
  GripVertical
} from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import ArrayJSONEditor from './ArrayJSONEditor';
import { FOCUS_AREAS, CORE_VALUES, DIFFERENTIATORS } from '../../constants';

const fallbackAudience = [
  { title: "Teen girls", description: "Foundation for a lifelong journey of self-discovery." },
  { title: "Young women", description: "Clear guidance for the years of transition." },
  { title: "Married women", description: "Restoring intimacy and relational harmony." },
  { title: "Expectant mothers", description: "Nurturing wholeness through the miracle of life." },
  { title: "Postpartum mothers", description: "Support through the transformation of motherhood." },
  { title: "Women with fertility challenges", description: "Compassionate guidance through seasons of waiting." },
  { title: "Women navigating hormone changes", description: "Balance and grace for the seasons of shift." },
  { title: "Couples seeking intimacy support", description: "Rebuilding bridges of connection and intimacy." },
  { title: "Women seeking healing from trauma", description: "Safe passage toward reclamation and peace." }
];

export default function AdminHomeTab() {
  const { content, updateContentField, saveContentChanges } = useContent();
  const [activeSubTab, setActiveSubTab] = useState<"hero" | "strategic" | "social" | "audience">("hero");

  const updateJSONField = (configKey: string, field: string, value: any) => {
    const current = JSON.parse((content as any)[configKey] || '{}');
    const updated = { ...current, [field]: value };
    updateContentField(configKey as any, JSON.stringify(updated, null, 2));
  };

  const SectionHeader = ({ icon: Icon, title, id }: { icon: any, title: string, id: string }) => (
    <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-gold/10 flex items-center justify-center text-brand-gold rounded">
          <Icon size={16} />
        </div>
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">{title}</h4>
          <p className="text-[9px] font-mono text-white/30 uppercase">Segment ID: {id}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-mono text-emerald-500/50 uppercase flex items-center gap-1">
          <Eye size={10} /> Live Preview Active
        </span>
      </div>
    </div>
  );

  const InputGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black uppercase tracking-wider text-white/40 block">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Sub-Navigation for Home Content */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {[
          { id: 'hero', label: 'Identity & Hero', icon: <Sparkles size={12} /> },
          { id: 'strategic', label: 'Vision & Focus', icon: <Target size={12} /> },
          { id: 'audience', label: 'Audience & Proof', icon: <Users size={12} /> },
          { id: 'social', label: 'Community & Grid', icon: <Instagram size={12} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-5 py-3 text-[10px] uppercase font-black tracking-widest transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === tab.id
                ? "bg-brand-gold text-brand-black"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Persistence helper for this panel */}
      <div className="flex justify-end sticky top-0 z-20 py-2 bg-black/50 backdrop-blur-md -mx-4 px-4">
         <button 
           onClick={() => {
             updateContentField("lastUpdated", new Date().toISOString());
             saveContentChanges();
           }}
           className="px-6 py-3 bg-brand-gold text-brand-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2 shadow-2xl"
         >
           <ShieldCheck size={14} /> Persist Home Changes
         </button>
      </div>

      <div className="space-y-12">
        
        {/* --- IDENTITY & HERO TAB --- */}
        {activeSubTab === "hero" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* HEADER LOGO CONFIG */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-lg space-y-8">
              <SectionHeader icon={Info} title="1.5 Main Header Logo" id="header_logo" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase tracking-wider text-white/40 block">Logo Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={(JSON.parse(content.brandingSettingsJson || '{}').headerLogoType || 'text') === 'text'}
                        onChange={() => updateJSONField("brandingSettingsJson", "headerLogoType", "text")}
                        className="accent-brand-gold"
                      />
                      <span className="text-xs text-white">Text</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={(JSON.parse(content.brandingSettingsJson || '{}').headerLogoType) === 'image'}
                        onChange={() => updateJSONField("brandingSettingsJson", "headerLogoType", "image")}
                        className="accent-brand-gold"
                      />
                      <span className="text-xs text-white">Image</span>
                    </label>
                  </div>
                </div>
                {(JSON.parse(content.brandingSettingsJson || '{}').headerLogoType) === 'image' && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-white/40 block">Logo URL</label>
                    <input 
                      type="text" 
                      value={JSON.parse(content.brandingSettingsJson || '{}').headerLogoUrl || ""}
                      onChange={(e) => updateJSONField("brandingSettingsJson", "headerLogoUrl", e.target.value)}
                      className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                    />
                    <ImageUploader fieldKey="headerLogoUrl" label="Upload Logo" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                    <label className="text-[9px] font-black uppercase tracking-wider text-white/40 block">Logo Height (px)</label>
                    <span className="text-white/60 font-mono text-[10px]">{(JSON.parse(content.brandingSettingsJson || '{}').headerLogoHeight || 44)}px</span>
                </div>
                <input 
                  type="range" min="20" max="150" step="1"
                  value={(JSON.parse(content.brandingSettingsJson || '{}').headerLogoHeight || 44)}
                  onChange={(e) => updateJSONField("brandingSettingsJson", "headerLogoHeight", e.target.value)}
                  className="w-full accent-brand-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* HERO SECTION */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-lg space-y-8">
              <SectionHeader icon={Layout} title="1. Primary Hero Landing" id="primary_hero" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Hero Welcome Accent">
                  <input 
                    type="text" 
                    value={content.heroWelcome || ""}
                    onChange={(e) => updateContentField("heroWelcome", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
                <InputGroup label="Hero Bold Heading">
                  <input 
                    type="text" 
                    value={content.heroHeading || ""}
                    onChange={(e) => updateContentField("heroHeading", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
              </div>

              <InputGroup label="Hero Elegant Subtitle">
                <input 
                  type="text" 
                  value={content.heroSub || ""}
                  onChange={(e) => updateContentField("heroSub", e.target.value)}
                  className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                />
              </InputGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="CTA Button Label">
                  <input 
                    type="text" 
                    value={content.heroBtnText || ""}
                    onChange={(e) => updateContentField("heroBtnText", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
                <InputGroup label="CTA Button Path/URL">
                  <input 
                    type="text" 
                    value={content.heroBtnUrl || ""}
                    onChange={(e) => updateContentField("heroBtnUrl", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <InputGroup label="Hero Immersive Visual (Background URL)">
                  <input 
                    type="text" 
                    value={content.heroBgUrl || ""}
                    onChange={(e) => updateContentField("heroBgUrl", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-[10px] font-mono focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
                <ImageUploader fieldKey="heroBgUrl" label="Upload Replacement Background Assets" />
              </div>
            </div>

            {/* DR FID BIO SECTION */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-lg space-y-8">
              <SectionHeader icon={User} title="2. Founder Spotlight: Dr. FID" id="about_the_room" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                  <InputGroup label="Biography Portrait URL">
                    <input 
                      type="text" 
                      value={content.drFidImageUrl || ""}
                      onChange={(e) => updateContentField("drFidImageUrl", e.target.value)}
                      className="w-full bg-brand-black border border-white/10 p-3 text-white text-[10px] font-mono focus:border-brand-gold outline-none" 
                    />
                  </InputGroup>
                  <ImageUploader fieldKey="drFidImageUrl" label="Upload Portrait Image" />
                </div>

                <div className="md:col-span-2 space-y-6">
                  <InputGroup label="Bio Heading Title">
                    <input 
                      type="text" 
                      value={content.drFidHeading || ""}
                      onChange={(e) => updateContentField("drFidHeading", e.target.value)}
                      className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                    />
                  </InputGroup>
                  <InputGroup label="Core Philosophical Quote">
                    <textarea 
                      value={content.drFidQuote || ""}
                      onChange={(e) => updateContentField("drFidQuote", e.target.value)}
                      className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold h-20 font-serif italic p-4" 
                    />
                  </InputGroup>
                  <div className="space-y-4">
                     <InputGroup label="Narrative Paragraph 01">
                        <textarea 
                          value={content.drFidBio1 || ""}
                          onChange={(e) => updateContentField("drFidBio1", e.target.value)}
                          className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs h-24 leading-relaxed" 
                        />
                     </InputGroup>
                     <InputGroup label="Narrative Paragraph 02">
                        <textarea 
                          value={content.drFidBio2 || ""}
                          onChange={(e) => updateContentField("drFidBio2", e.target.value)}
                          className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs h-24 leading-relaxed" 
                        />
                     </InputGroup>
                  </div>
                </div>
              </div>
            </div>

            {/* IDENTITY GRID */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-lg space-y-8">
              <SectionHeader icon={Grid} title="3. Universal Identity Grid" id="identity_grid" />
              
              <InputGroup label="Scrolling Ticker Perspective Text">
                <textarea 
                  value={content.tickerText || ""}
                  onChange={(e) => updateContentField("tickerText", e.target.value)}
                  className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs h-20" 
                />
              </InputGroup>

              <div className="pt-6 border-t border-white/5">
                <ArrayJSONEditor
                  label="Modular Grid Components"
                  fieldKey="identitiesJson"
                  value={content.identitiesJson || ""}
                  onChange={updateContentField}
                  defaultStructure={{ label: "", image: "" }}
                  itemType="Identity Aspect"
                  fallbackData={[
                    { label: 'Speaker', image: 'https://images.unsplash.com/photo-1576089234411-497c62ca621e?auto=format&fit=crop&q=80&w=800' },
                    { label: 'Trainer', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800' },
                    { label: 'Coach', image: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=800' },
                    { label: 'Therapist', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800' }
                  ]}
                />
              </div>
            </div>
          </div>
        )}

        {/* --- STRATEGIC VISION TAB --- */}
        {activeSubTab === "strategic" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* WHY WE EXIST */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-lg space-y-8">
              <SectionHeader icon={Repeat} title="4. Foundation: Why We Exist" id="why_we_exist" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Catalyst Prefix Label">
                  <input 
                    type="text" 
                    value={content.whyWeExistCatalyst || ""}
                    onChange={(e) => updateContentField("whyWeExistCatalyst", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
                <InputGroup label="Section Core Title">
                  <input 
                    type="text" 
                    value={content.whyWeExistTitle || ""}
                    onChange={(e) => updateContentField("whyWeExistTitle", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
              </div>

              <InputGroup label="Foundational Perspective (Description)">
                <textarea 
                  value={content.whyWeExistDesc || ""}
                  onChange={(e) => updateContentField("whyWeExistDesc", e.target.value)}
                  className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs h-24 leading-relaxed" 
                />
              </InputGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                <div className="space-y-4">
                  <InputGroup label="The Struggle List Subtitle">
                    <input 
                      type="text" 
                      value={content.whyWeExistStruggleTitle || ""}
                      onChange={(e) => updateContentField("whyWeExistStruggleTitle", e.target.value)}
                      className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                    />
                  </InputGroup>
                  <InputGroup label="Common Challenges (One per line)">
                    <textarea 
                      value={content.whyWeExistStruggles || ""}
                      onChange={(e) => updateContentField("whyWeExistStruggles", e.target.value)}
                      className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs h-40 font-mono" 
                    />
                  </InputGroup>
                </div>
                <InputGroup label="Section Closing Quote">
                  <textarea 
                    value={content.whyWeExistQuote || ""}
                    onChange={(e) => updateContentField("whyWeExistQuote", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs h-24 italic" 
                  />
                </InputGroup>
              </div>
            </div>

            {/* FOCUS AREAS */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-lg space-y-8">
              <SectionHeader icon={Target} title="5. Clinical Focus Dimensions" id="focus_areas" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Focus Prefix Decoration">
                  <input 
                    type="text" 
                    value={content.focusAreasSub || ""}
                    onChange={(e) => updateContentField("focusAreasSub", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
                <InputGroup label="Section Dynamic Title">
                  <input 
                    type="text" 
                    value={content.focusAreasTitle || ""}
                    onChange={(e) => updateContentField("focusAreasTitle", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
              </div>

              <div className="pt-6 border-t border-white/5">
                <ArrayJSONEditor
                  label="Therapeutic Focus Segments"
                  fieldKey="focusAreasJson"
                  value={content.focusAreasJson || ""}
                  onChange={updateContentField}
                  defaultStructure={{ title: "", description: "", items: [] }}
                  itemType="Focus Pillar"
                  fallbackData={FOCUS_AREAS}
                />
              </div>
            </div>

            {/* STRATEGIC ABOUT */}
             <div className="bg-white/[0.01] border border-white/5 p-8 rounded-lg space-y-8">
               <SectionHeader icon={Info} title="6. Community DNA: Purpose & Vision" id="about_section" />
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <InputGroup label="Mission Directive Headline">
                      <input 
                        type="text" 
                        value={content.homeAboutUsMissionTitle || ""}
                        onChange={(e) => updateContentField("homeAboutUsMissionTitle", e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                      />
                    </InputGroup>
                    <InputGroup label="Mission Statement Narrative">
                      <textarea 
                        value={content.homeAboutUsMissionDesc || ""}
                        onChange={(e) => updateContentField("homeAboutUsMissionDesc", e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs h-32 leading-relaxed" 
                      />
                    </InputGroup>
                  </div>
                  <div className="space-y-6">
                    <InputGroup label="Visionary Blueprint Headline">
                      <input 
                        type="text" 
                        value={content.homeAboutUsVisionTitle || ""}
                        onChange={(e) => updateContentField("homeAboutUsVisionTitle", e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                      />
                    </InputGroup>
                    <InputGroup label="Vision Statement Narrative">
                      <textarea 
                        value={content.homeAboutUsVisionDesc || ""}
                        onChange={(e) => updateContentField("homeAboutUsVisionDesc", e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs h-32 leading-relaxed" 
                      />
                    </InputGroup>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* --- AUDIENCE & PROOF TAB --- */}
        {activeSubTab === "audience" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* WHO WE SERVE */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-lg space-y-8">
              <SectionHeader icon={Users} title="7. Designated Audience Groups" id="who_we_serve" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Audience Prefix text">
                  <input 
                    type="text" 
                    value={content.whoWeServeSub || ""}
                    onChange={(e) => updateContentField("whoWeServeSub", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
                <InputGroup label="Section Impact Title">
                  <input 
                    type="text" 
                    value={content.whoWeServeTitle || ""}
                    onChange={(e) => updateContentField("whoWeServeTitle", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
              </div>

              <InputGroup label="Inclusivity Narrative (Description)">
                <textarea 
                  value={content.whoWeServeDesc || ""}
                  onChange={(e) => updateContentField("whoWeServeDesc", e.target.value)}
                  className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs h-24 leading-relaxed" 
                />
              </InputGroup>

              <div className="pt-6 border-t border-white/5">
                <ArrayJSONEditor
                  label="Community Segments"
                  fieldKey="whoWeServeJson"
                  value={content.whoWeServeJson || ""}
                  onChange={updateContentField}
                  defaultStructure={{ title: "", description: "" }}
                  itemType="Audience Profile"
                  fallbackData={fallbackAudience}
                />
              </div>
            </div>

            {/* KYV SERIES */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-lg space-y-8">
              <SectionHeader icon={Play} title="8. 'Know Your Vagina' Knowledge Series" id="know_your_vagina" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                  <InputGroup label="Series Promotional Banner URL">
                    <input 
                      type="text" 
                      value={content.kyvImageUrl || ""}
                      onChange={(e) => updateContentField("kyvImageUrl", e.target.value)}
                      className="w-full bg-brand-black border border-white/10 p-3 text-white text-[10px] font-mono focus:border-brand-gold outline-none" 
                    />
                  </InputGroup>
                  <ImageUploader fieldKey="kyvImageUrl" label="Upload Series Banner" />
                </div>

                <div className="md:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Series Accent Label">
                      <input 
                        type="text" 
                        value={content.kyvLabel || ""}
                        onChange={(e) => updateContentField("kyvLabel", e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                      />
                    </InputGroup>
                    <InputGroup label="Series Main Title">
                      <input 
                        type="text" 
                        value={content.kyvHeading || ""}
                        onChange={(e) => updateContentField("kyvHeading", e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                      />
                    </InputGroup>
                  </div>
                  
                  <InputGroup label="Series Narrative Subtexts (One per line)">
                    <textarea 
                      value={content.kyvSubtexts || ""}
                      onChange={(e) => updateContentField("kyvSubtexts", e.target.value)}
                      className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs h-32 font-mono leading-relaxed" 
                    />
                  </InputGroup>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <InputGroup label="Video Integration URL (YouTube)">
                      <input 
                        type="text" 
                        value={content.kyvYoutubeUrl || ""}
                        onChange={(e) => updateContentField("kyvYoutubeUrl", e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                      />
                    </InputGroup>
                    <InputGroup label="Button Interaction Text">
                      <input 
                        type="text" 
                        value={content.kyvBtnText || ""}
                        onChange={(e) => updateContentField("kyvBtnText", e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                      />
                    </InputGroup>
                  </div>
                </div>
              </div>
            </div>

            {/* CORE VALUES */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-lg space-y-8">
              <SectionHeader icon={ShieldCheck} title="9. Institutional Values & Foundation" id="values" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Values Prefix decor">
                  <input 
                    type="text" 
                    value={content.valuesSub || ""}
                    onChange={(e) => updateContentField("valuesSub", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
                <InputGroup label="Section Descriptive Title">
                  <input 
                    type="text" 
                    value={content.valuesTitle || ""}
                    onChange={(e) => updateContentField("valuesTitle", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-8">
                <ArrayJSONEditor
                  label="Strategic DNA Values"
                  fieldKey="coreValuesJson"
                  value={content.coreValuesJson || ""}
                  onChange={updateContentField}
                  defaultStructure={{ name: "", description: "" }}
                  itemType="Core Value"
                  fallbackData={CORE_VALUES}
                />
              </div>
            </div>

            {/* THE PROMISE */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-lg space-y-8">
              <SectionHeader icon={Heart} title="9.2 The Room Promise" id="promise" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Promise Accent Label">
                  <input 
                    type="text" 
                    value={content.promiseSub || ""}
                    onChange={(e) => updateContentField("promiseSub", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
                <InputGroup label="Section Main Title">
                  <input 
                    type="text" 
                    value={content.promiseTitle || ""}
                    onChange={(e) => updateContentField("promiseTitle", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Promise Sidebar Quote">
                  <textarea 
                    value={content.promiseQuote || ""}
                    onChange={(e) => updateContentField("promiseQuote", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs h-24 italic" 
                  />
                </InputGroup>
                <InputGroup label="Affirmative Commitments (One per line)">
                  <textarea 
                    value={content.promiseList || ""}
                    onChange={(e) => updateContentField("promiseList", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs h-24 font-mono" 
                  />
                </InputGroup>
              </div>

              <div className="bg-brand-red/5 p-6 border border-brand-red/20 space-y-6">
                 <h5 className="text-[9px] font-black uppercase tracking-widest text-brand-red">Interactive Promise Banner Configuration</h5>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup label="Banner Headline">
                      <input 
                        type="text" 
                        value={content.promiseBannerHeading || ""}
                        onChange={(e) => updateContentField("promiseBannerHeading", e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                      />
                    </InputGroup>
                    <InputGroup label="Banner Narrative Subtext">
                      <input 
                        type="text" 
                        value={content.promiseBannerDesc || ""}
                        onChange={(e) => updateContentField("promiseBannerDesc", e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                      />
                    </InputGroup>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputGroup label="Button Label">
                      <input 
                        type="text" 
                        value={content.promiseBannerBtnText || ""}
                        onChange={(e) => updateContentField("promiseBannerBtnText", e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                      />
                    </InputGroup>
                    <InputGroup label="Button Redirect URL">
                      <input 
                        type="text" 
                        value={content.promiseBannerBtnUrl || ""}
                        onChange={(e) => updateContentField("promiseBannerBtnUrl", e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                      />
                    </InputGroup>
                    <InputGroup label="Corner Status Label">
                      <input 
                        type="text" 
                        value={content.promiseRightLabel || ""}
                        onChange={(e) => updateContentField("promiseRightLabel", e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                      />
                    </InputGroup>
                 </div>
              </div>
            </div>

            {/* TRUST & SAFETY */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-lg space-y-8">
              <SectionHeader icon={ShieldCheck} title="9.5 Trust & Safety Protocol" id="trust_safety" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Protocol Accent Label">
                  <input 
                    type="text" 
                    value={content.tsSub || ""}
                    onChange={(e) => updateContentField("tsSub", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
                <InputGroup label="Protocol Headline Title">
                  <input 
                    type="text" 
                    value={content.tsTitle || ""}
                    onChange={(e) => updateContentField("tsTitle", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
              </div>

              <InputGroup label="Community Commitment (Description)">
                <textarea 
                  value={content.tsDesc || ""}
                  onChange={(e) => updateContentField("tsDesc", e.target.value)}
                  className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs h-24 duration-200 focus:border-brand-gold outline-none" 
                />
              </InputGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                <InputGroup label="Priority Pillars (One per line)">
                  <textarea 
                    value={content.tsList || ""}
                    onChange={(e) => updateContentField("tsList", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs h-32 font-mono" 
                  />
                </InputGroup>
                <InputGroup label="Operational Assurance Quote">
                  <textarea 
                    value={content.tsQuote || ""}
                    onChange={(e) => updateContentField("tsQuote", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs h-32 italic" 
                  />
                </InputGroup>
              </div>
            </div>
          </div>
        )}

        {/* --- SOCIAL & COMMUNITY TAB --- */}
        {activeSubTab === "social" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            {/* PARTNERS & MEDIA */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-lg space-y-8">
              <SectionHeader icon={Handshake} title="10. Peer Recognition & Media Alliances" id="partners" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Alliances Section Prefix">
                  <input 
                    type="text" 
                    value={content.partnersSub || ""}
                    onChange={(e) => updateContentField("partnersSub", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
                <InputGroup label="Alliances Bold Heading">
                  <input 
                    type="text" 
                    value={content.partnersHeading || ""}
                    onChange={(e) => updateContentField("partnersHeading", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
              </div>

              <InputGroup label="Institutional Alliance Perspective (Description)">
                <textarea 
                  value={content.partnersDescription || ""}
                  onChange={(e) => updateContentField("partnersDescription", e.target.value)}
                  className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs h-24 leading-relaxed" 
                />
              </InputGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-6 border-t border-white/5">
                <ArrayJSONEditor
                  label="Collaborator & Media Logos"
                  fieldKey="partnersLogosJson"
                  value={content.partnersLogosJson || ""}
                  onChange={updateContentField}
                  defaultStructure={{ name: "", imageUrl: "", type: "Media Appearance", link: "", headline: "", impactYear: "" }}
                  itemType="Institutional Partner"
                  fallbackData={[]}
                />
                <div className="bg-white/5 p-6 rounded-lg border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical size={14} className="text-brand-gold" />
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-white">Display Adjustments</h5>
                  </div>
                  <InputGroup label="Logo Square Size (Pixels)">
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="100" 
                        max="600" 
                        step="10"
                        value={content.partnersLogoSize || "200"}
                        onChange={(e) => updateContentField("partnersLogoSize", e.target.value)}
                        className="flex-1 accent-brand-gold" 
                      />
                      <div className="w-16 bg-brand-black border border-white/10 p-2 text-center text-[10px] font-mono text-brand-gold">
                        {content.partnersLogoSize || "200"}px
                      </div>
                    </div>
                  </InputGroup>
                  <p className="text-[9px] text-white/30 italic leading-relaxed">
                    Adjust the physical size of the partner/media logos. The marquee animation will automatically recalculate spacing based on this value.
                  </p>
                </div>
              </div>
            </div>

            {/* COMMUNITY INSIDE */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-lg space-y-8">
              <SectionHeader icon={MessageSquare} title="11. Inside the Room Community" id="community" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                  <InputGroup label="Community Visual Media URL">
                    <input 
                      type="text" 
                      value={content.communityImageUrl || ""}
                      onChange={(e) => updateContentField("communityImageUrl", e.target.value)}
                      className="w-full bg-brand-black border border-white/10 p-3 text-white text-[10px] font-mono focus:border-brand-gold outline-none" 
                    />
                  </InputGroup>
                  <ImageUploader fieldKey="communityImageUrl" label="Upload Community Interface Preview" />
                </div>

                <div className="md:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Community Sub-Prefix">
                      <input 
                        type="text" 
                        value={content.communitySub || ""}
                        onChange={(e) => updateContentField("communitySub", e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                      />
                    </InputGroup>
                    <InputGroup label="Community Bold Title">
                      <input 
                        type="text" 
                        value={content.communityTitle || ""}
                        onChange={(e) => updateContentField("communityTitle", e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                      />
                    </InputGroup>
                  </div>
                  
                  <InputGroup label="Proprietary Experiences (One per line)">
                    <textarea 
                      value={content.communityExperiences || ""}
                      onChange={(e) => updateContentField("communityExperiences", e.target.value)}
                      className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs h-32 font-mono leading-relaxed" 
                    />
                  </InputGroup>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                     <InputGroup label="Access Redirect Text">
                        <input 
                          type="text" 
                          value={content.communityBtnText || ""}
                          onChange={(e) => updateContentField("communityBtnText", e.target.value)}
                          className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                        />
                     </InputGroup>
                     <InputGroup label="Access Redirect URL">
                        <input 
                          type="text" 
                          value={content.communityBtnUrl || ""}
                          onChange={(e) => updateContentField("communityBtnUrl", e.target.value)}
                          className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                        />
                     </InputGroup>
                  </div>
                </div>
              </div>
            </div>

            {/* PRODUCTS SECOTION */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-lg space-y-8">
              <SectionHeader icon={Package} title="12. Homepage Product Highlights" id="products" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Products Segment Prefix">
                  <input 
                    type="text" 
                    value={content.productsHomeSub || ""}
                    onChange={(e) => updateContentField("productsHomeSub", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
                <InputGroup label="Products Segment Headline">
                  <input 
                    type="text" 
                    value={content.productsHomeHeading || ""}
                    onChange={(e) => updateContentField("productsHomeHeading", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
              </div>

              <div className="space-y-6 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <InputGroup label="Specify Featured Product IDs (Dynamic Selection Below)">
                    <span className="text-[10px] text-white/40 italic font-mono">
                      Stored in: featuredProductIdsJson
                    </span>
                  </InputGroup>
                  <div className="text-[9px] font-mono text-brand-gold bg-brand-gold/10 px-2 py-1 rounded">
                    {(() => {
                      try {
                        const selected = JSON.parse(content.featuredProductIdsJson || "[]");
                        return `${selected.length} Selected`;
                      } catch { return "0 Selected"; }
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-4 bg-black/40 border border-white/5 custom-scrollbar">
                  {(() => {
                    let allProducts = [];
                    try {
                      allProducts = JSON.parse(content.productsListJson || "[]");
                    } catch (e) { console.error("Error parsing products in admin", e); }

                    let selectedIds = [];
                    try {
                      selectedIds = JSON.parse(content.featuredProductIdsJson || "[]");
                    } catch { selectedIds = []; }

                    if (allProducts.length === 0) return (
                      <div className="col-span-full py-12 text-center border border-dashed border-white/10">
                        <p className="text-[10px] uppercase tracking-widest text-white/30">No products found in catalog</p>
                      </div>
                    );

                    return allProducts.map((product: any) => {
                      const isSelected = selectedIds.includes(product.id);
                      return (
                        <div 
                          key={product.id}
                          onClick={() => {
                            let newIds = [...selectedIds];
                            if (isSelected) {
                              newIds = newIds.filter(id => id !== product.id);
                            } else {
                              newIds.push(product.id);
                            }
                            updateContentField("featuredProductIdsJson", JSON.stringify(newIds));
                          }}
                          className={`flex gap-3 p-3 cursor-pointer transition-all border ${
                            isSelected 
                              ? "bg-brand-gold/10 border-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.1)]" 
                              : "bg-white/[0.02] border-white/10 hover:border-white/30"
                          }`}
                        >
                          <div className="w-12 h-12 shrink-0 bg-white/5 overflow-hidden">
                            <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <h5 className={`text-[10px] font-black uppercase truncate ${isSelected ? 'text-brand-gold' : 'text-white/80'}`}>
                              {product.title}
                            </h5>
                            <p className="text-[9px] font-mono text-white/40 truncate">{product.price} {product.currency}</p>
                            <div className="mt-1">
                              {isSelected ? (
                                <span className="text-[8px] font-black text-brand-gold uppercase tracking-tighter">● Featured</span>
                              ) : (
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter">○ Inactive</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
                <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest text-center italic">
                  Note: The Homepage will display products in the order they appear in your catalog.
                </p>
              </div>
            </div>

            {/* SOCIAL CONNECTIONS GRID */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-lg space-y-8">
              <SectionHeader icon={Instagram} title="13. Homepage Social Connections Grid" id="social_grid" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Grid Section Title">
                  <input 
                    type="text" 
                    value={content.socialSectionTitle || ""}
                    onChange={(e) => updateContentField("socialSectionTitle", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                    placeholder="e.g. JOIN THE COMMUNITY"
                  />
                </InputGroup>
                <InputGroup label="Stay In Touch / Subtitle Text">
                  <input 
                    type="text" 
                    value={content.socialSubTitle || ""}
                    onChange={(e) => updateContentField("socialSubTitle", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                    placeholder="e.g. STAY IN TOUCH WITH ME"
                  />
                </InputGroup>
              </div>

              <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold mb-6">Direct Social Outlet Links</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputGroup label="X (Twitter)">
                    <input type="text" value={content.socialLinkX || ""} onChange={(e) => updateContentField("socialLinkX", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white text-[10px] font-mono focus:border-brand-gold outline-none" />
                  </InputGroup>
                  <InputGroup label="Instagram">
                    <input type="text" value={content.socialLinkInstagram || ""} onChange={(e) => updateContentField("socialLinkInstagram", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white text-[10px] font-mono focus:border-brand-gold outline-none" />
                  </InputGroup>
                  <InputGroup label="TikTok">
                    <input type="text" value={content.socialLinkTiktok || ""} onChange={(e) => updateContentField("socialLinkTiktok", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white text-[10px] font-mono focus:border-brand-gold outline-none" />
                  </InputGroup>
                  <InputGroup label="Facebook">
                    <input type="text" value={content.socialLinkFacebook || ""} onChange={(e) => updateContentField("socialLinkFacebook", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white text-[10px] font-mono focus:border-brand-gold outline-none" />
                  </InputGroup>
                  <InputGroup label="YouTube">
                    <input type="text" value={content.socialLinkYoutube || ""} onChange={(e) => updateContentField("socialLinkYoutube", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white text-[10px] font-mono focus:border-brand-gold outline-none" />
                  </InputGroup>
                  <InputGroup label="LinkedIn">
                    <input type="text" value={content.socialLinkLinkedin || ""} onChange={(e) => updateContentField("socialLinkLinkedin", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white text-[10px] font-mono focus:border-brand-gold outline-none" />
                  </InputGroup>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold mb-6">Aesthetic Curator (Optional Feed)</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputGroup label="Instagram Handle (@...)">
                    <input 
                      type="text" 
                      value={content.instagramHandle || ""}
                      onChange={(e) => updateContentField("instagramHandle", e.target.value)}
                      className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                    />
                  </InputGroup>
                </div>
                <div className="mt-6">
                  <ArrayJSONEditor
                    label="Curated Feed Media Assets"
                    fieldKey="socialFeedJson"
                    value={content.socialFeedJson || ""}
                    onChange={updateContentField}
                    defaultStructure={{ url: "", type: "image", link: "" }}
                    itemType="Feed Item"
                    fallbackData={[]}
                  />
                </div>
              </div>
            </div>

            {/* FAQ INTEGRATION */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-lg space-y-8">
              <SectionHeader icon={HelpCircle} title="14. Homepage FAQ Quick-View" id="faq" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Inquiry Prefix Decor">
                  <input 
                    type="text" 
                    value={content.faqSub || ""}
                    onChange={(e) => updateContentField("faqSub", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
                <InputGroup label="Inquiry Bold Headline">
                  <input 
                    type="text" 
                    value={content.faqTitle || ""}
                    onChange={(e) => updateContentField("faqTitle", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
              </div>

              <div className="bg-white/5 p-4 border border-white/10 text-[10px] text-white/60 leading-relaxed uppercase tracking-widest font-mono">
                💡 Operational Notice: The home page FAQ list is currently synchronized with the Global FAQ database configured in the Support tab. These fields control the decorative entry typography.
              </div>
            </div>

            {/* TESTIMONIALS */}
            <div className="bg-white/[0.01] border border-white/5 p-8 rounded-lg space-y-8">
              <SectionHeader icon={Star} title="15. Member Voices & Testimonials" id="testimonials" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Testimonials Sub-label">
                  <input 
                    type="text" 
                    value={content.testimonialsSub || ""}
                    onChange={(e) => updateContentField("testimonialsSub", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
                <InputGroup label="Testimonials Main Title">
                  <input 
                    type="text" 
                    value={content.testimonialsTitle || ""}
                    onChange={(e) => updateContentField("testimonialsTitle", e.target.value)}
                    className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs focus:border-brand-gold outline-none" 
                  />
                </InputGroup>
              </div>

              <InputGroup label="Section Narrative Direction">
                <textarea 
                  value={content.testimonialsDesc || ""}
                  onChange={(e) => updateContentField("testimonialsDesc", e.target.value)}
                  className="w-full bg-brand-black border border-white/10 p-3 text-white text-xs h-24 focus:border-brand-gold outline-none" 
                />
              </InputGroup>

              <div className="pt-6 border-t border-white/5">
                <ArrayJSONEditor
                  label="Community Testimonials Ledger"
                  fieldKey="testimonialsJson"
                  value={content.testimonialsJson || ""}
                  onChange={updateContentField}
                  defaultStructure={{ id: 1, quote: "", author: "", role: "", avatar: "", category: "", rating: 5 }}
                  itemType="Member Story"
                  fallbackData={[]}
                />
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
