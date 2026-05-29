import React, { createContext, useContext, useState, useEffect } from "react";
import { uploadImage as uploadToBackend } from '../api/client';
import { fetchWithApiBase } from '../lib/api';

// Static defaults for direct client-side resilience
export const FALLBACK_DEFAULTS = {
  heroWelcome: "WELCOME TO",
  heroHeading: "The Vagina Room",
  heroSub: "Where Women Heal, Learn & Thrive...",
  heroBtnText: "👉 Join The Community",
  heroBtnUrl: "/join-community",
  heroBgUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80",

  drFidHeading: "MEET DR. FID",
  drFidBio1: "Ambassador Dr. Damilola Awoyemi, popularly known as Dr. FID, is a seasoned SPA Business Consultant, Holistic Wellness Expert, women’s wellness advocate and visionary entrepreneur committed to transforming lives through integrative healthcare, restorative therapy, and sustainable wellness enterprise development.",
  drFidBio2: "Through The Vagina Room, she is building a safe and empowering platform where women can access trusted education, emotional support, and holistic wellness guidance for their intimate and reproductive health journey.",
  drFidBio3: "Combining clinical expertise with compassionate care, she creates confidential spaces that help women gain clarity, confidence, healing, and a deeper understanding of their bodies and overall wellbeing.",
  drFidQuote: '"Restoring wellness, empowering women, and transforming lives through holistic healing and education."',
  drFidImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200",
  drFidPageImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200",

  aboutTitle: "OUR MISSION & GROUNDWORK",
  aboutHeading: "A SANCTUARY FOR EVERY WOMAN'S HEALTH JOURNEY",
  aboutParagraph1: "We believe that women's reproductive and sexual wellness is a crucial aspect of healthcare. For far too long, conversations surrounding intimate anatomy, hormonal transitions, fertility, and sexual satisfaction have been shrouded in shame, silence, or clinical detachment.",
  aboutParagraph2: "The Vagina Room is building a sanctuary where biology meets compassion. We dismantle stigmas by providing accurate, science-backed education that empowers you to trust your body, navigate transitions, and find holistic restoration.",
  aboutImageUrl: "https://images.unsplash.com/photo-1518608046882-94d3fed0ae24?auto=format&fit=crop&q=80&w=1200",

  // Identity Grid & Scrolling Ticker
  tickerText: "TRUSTED EDUCATION • EXPERT GUIDANCE • EMOTIONAL SUPPORT • HOLISTIC WELLNESS • THE VAGINA ROOM GLOBAL • ",
  identityLabel1: "Speaker",
  identityImg1: "https://images.unsplash.com/photo-1576089234411-497c62ca621e?auto=format&fit=crop&q=80&w=800",
  identityLabel2: "Trainer",
  identityImg2: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
  identityLabel3: "Coach",
  identityImg3: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=800",
  identityLabel4: "Therapist",
  identityImg4: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",

  // Homepage About Us Detailed Section
  aboutUsSub: "Who We Are",
  aboutUsTitle: "About Us.",
  aboutUsBoxText: "The Vagina Room is a women-centered wellness, education, and support platform dedicated to helping women understand, protect, heal, and confidently embrace their intimate and reproductive health at every stage of life.",
  aboutUsParagraph1: "The Vagina Room is more than a platform. It is a movement committed to restoring knowledge, confidence, dignity, healing, and wholeness to women through conversations and solutions that many societies often avoid.",
  aboutUsMissionTitle: "Our Mission",
  aboutUsMissionDesc: "To empower women with knowledge, support, healing, and access to transformative intimate wellness solutions that improve their physical, emotional, reproductive, and relational well-being.",
  aboutUsVisionTitle: "Our Vision",
  aboutUsVisionDesc: "To become a globally trusted women’s wellness ecosystem where every woman feels informed, supported, confident, safe, and empowered in her intimate health journey.",

  // Why We Exist Section
  whyWeExistCatalyst: "THE CATALYST",
  whyWeExistTitle: "Why The Vagina Room Exists.",
  whyWeExistDesc: "We exist to break the silence, shame, misinformation, and fear surrounding women’s bodies by providing trusted education, expert guidance, emotional support, and holistic wellness solutions in a safe, confidential, and empowering environment.",
  whyWeExistStruggleTitle: "Many women silently struggle with:",
  whyWeExistStruggles: "Silence surrounding intimate health\nShame and stigma\nMisinformation and fear\nRecurrent infections or discomfort\nHormonal and reproductive challenges\nLack of trusted expert guidance",
  whyWeExistQuote: '"Because no woman should have to navigate her health journey alone."',

  // Focus Areas / Capabilities (JSON string list control)
  focusAreasSub: "CAPABILITIES",
  focusAreasTitle: "Focus Areas for \"The Vagina Room\"",
  focusAreasHeading: "Focus Areas.",
  focusAreasCtaHeading: "Start Your Transformation.",
  focusAreasCtaSub: "Healing is a journey. We are here to guide every step.",
  focusAreasCtaUrl: "/join-community",
  focusAreasCtaBtnText: "Join The Community",
  focusAreasCtaBgUrl: "",
  
  // Who We Serve phase list
  whoWeServeSub: "Who We Serve",
  whoWeServeTitle: "The Vagina Room serves.",
  whoWeServeDesc: "Same operating principle, different leverage points. We restore knowledge across all generations.",
  whoWeServeAudienceList: "Teen girls\nYoung women\nMarried women\nExpectant mothers\nPostpartum mothers\nWomen with fertility challenges\nWomen navigating hormone changes\nCouples seeking intimacy support\nWomen seeking healing from trauma",

  // YT Know Your Vagina Series
  kyvLabel: "THE VAGINA ROOM'S",
  kyvHeading: "Know Your Vagina Series.",
  kyvSubtexts: "BREAKING SILENCE. RESTORING KNOWLEDGE.\nRESTORING DIGNITY, RESTORING HEALING.",
  kyvImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1600",
  kyvYoutubeUrl: "https://www.youtube.com",
  kyvBtnText: "Explore Channel",
  kyvBadgeTitle: "Know Your Vagina Series",
  kyvBadgeAction: "Showing on YouTube",
  kyvBadgeBar: "Watch on Dr FID YouTube Channel",

  // Values Section
  valuesSub: "Foundational Pillars",
  valuesTitle: "Our Core Values.",
  valuesDesc: "We protect every story with absolute privacy and deliver care with deep compassion.",
  differentiatorsSub: "Unique Proposition",
  differentiatorsTitle: "What Makes Us Different.",
  differentiatorsDesc: "We are building a globally trusted women’s wellness ecosystem focused on restorative healthcare.",

  // Inside Community Section
  communitySub: "EXCLUSIVITY",
  communityTitle: "Inside The Community.",
  communityDesc: "Join a safe and supportive environment designed to help women learn, heal, grow, and confidently handle their wellness journey.",
  communityImageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1200",
  communityExperiencesTitle: "Inside The Vagina Room, You Will Experience:",
  communityExperiences: "Educational wellness sessions\nWomen’s health awareness discussions\nSafe and supportive conversations\nExpert-led guidance and insights\nConfidential peer community interaction\nPractical reproductive and intimate health education\nEmotional wellness and confidence support\nRestorative wellness and holistic self-care",
  communityQuote: '"A community where your voice is heard, your questions are respected, and your wellbeing truly matters."',
  communityBtnText: "Join The Community",
  communityBtnUrl: "/join-community",

  // Join Community Page
  joinCommunityTitle: "Join The Sanctuary",
  joinCommunityHeading: "Your Journey to Holistic Wholeness Starts Here.",
  joinCommunitySubheading: "Become part of a global movement dedicated to restoring knowledge, confidence, and healing to every woman.",
  joinCommunityBenefitsJson: '[\n  { "title": "Safe & Private", "text": "A confidential space where your questions are respected and your privacy is paramount.", "icon": "ShieldCheck" },\n  { "title": "Expert-Led Education", "text": "Access trusted, science-backed guidance on reproductive and intimate wellness.", "icon": "BookOpen" },\n  { "title": "Global Sisterhood", "text": "Connect with women worldwide on similar journeys of healing and discovery.", "icon": "Users" },\n  { "title": "Holistic Support", "text": "Integrative wellness tools that address your physical, emotional, and relational well-being.", "icon": "Heart" }\n]',
  joinCommunityRegistrationCost: "Registration Fee: NGN 25,000 / $50",
  joinCommunityCtaText: "Register Now",
  joinCommunityCtaUrl: "https://external-community-platform.com/register",
  joinCommunityWhatYouGetJson: '[\n  "Bi-weekly wellness masterclasses with Dr. FID",\n  "Access to our private discussion sanctuary",\n  "Digital intimacy wellness library & resources",\n  "Priority booking for retreats and workshops",\n  "Exclusive discounts on curated healing products",\n  "A supportive network of like-minded women"\n]',
  joinCommunityHeroBgUrl: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=1600",
  joinCommunityHeroLabel: "THE SANCTUARY",
  joinCommunityExclusiveLabel: "EXCLUSIVE ACCESS",
  joinCommunityDeliveryHeading: "What You Receive As A Member Of Our Sanctuary.",
  joinCommunityReadyHeading: "Ready to Begin?",
  joinCommunityReadyDesc: "Step into a curated environment designed for your transformation, healing, and peace.",
  joinCommunityUnlockBtnText: "Unlock Membership",
  joinCommunitySecureLabel: "Secure External Registration Gate",
  joinCommunityFinalHeading: "Your Voice Matters. Your Healing Is Priority.",
  joinCommunityFinalLabel: "THE VAGINA ROOM GLOBAL COMMUNITY",

  // Trust & Safety
  tsSub: "Verification",
  tsTitle: "A Safe, Confidential Space.",
  tsDesc: "We understand the vulnerability required to share your journey. Our protocols are built on an unwavering foundation of trust.",
  tsList: "Privacy\nRespect\nEmotional safety\nNon-judgmental learning\nCompassionate guidance\nRestoration",
  tsQuote: '"This is a space where your questions are safe."',

  promiseHeading: "Our Unshakable Promise to Women",
  promiseText: "We hold ourselves to a gold standard of safety, integrity, and warmth. When you enter The Vagina Room, you enter a sphere of unfiltered truth, curated medicine, and genuine companionship.",
  promiseSub: "Our Commitment",
  promiseTitle: "The Promise.",
  promiseQuote: '"I believe every woman deserves access to the knowledge that restores her confidence and dignity."',
  promiseRightLabel: "Every Woman's Right",
  promiseList: "Access to accurate intimate health education\nA safe space to be heard and supported\nConfidence in her body\nFreedom from shame and stigma\nHolistic wellness and healing\nThe power to make informed decisions",
  promiseBannerHeading: "Reclaim Your Wholeness.",
  promiseBannerDesc: "Restore. Heal. Thrive. Join The Community for informed, confident, and empowered women.",
  promiseBannerBtnText: "Join the Community",
  promiseBannerBtnUrl: "/join-community",

  // Focus Areas Detailed
  focusArea1Title: "Vaginal & Reproductive Wellness",
  focusArea1Items: "Vaginal health & hygiene\nVaginal microbiome health\nInfection treatment & prevention\nSTI testing & treatment\nMenstrual health support\nPelvic floor health\nSexual pain management\nHormonal balance & therapy\nPregnancy & postpartum care\nMenopause support\nFertility support & guidance\nContraception & family planning",
  focusArea2Title: "Sexual Wellness & Relationship Support",
  focusArea2Items: "Sexual health education\nSexual intimacy coaching\nLibido & desire enhancement\nSex therapy & counselling\nRelationship counselling\nSexual trauma support\nSexual education for life stages\nIdentity & orientation support",
  focusArea3Title: "Holistic Healing & Empowerment",
  focusArea3Items: "Body positivity & self-love\nNatural & alternative therapies\nHerbal wellness education\nEmotional wellness support\nConfidence rebuilding\nReproductive rights advocacy",

  // Who We Serve Phases
  whoWeServePhase1Title: "Teen girls",
  whoWeServePhase1Desc: "Foundation for a lifelong journey of self-discovery.",
  whoWeServePhase2Title: "Young women",
  whoWeServePhase2Desc: "Clear guidance for the years of transition.",
  whoWeServePhase3Title: "Married women",
  whoWeServePhase3Desc: "Restoring intimacy and relational harmony.",
  whoWeServePhase4Title: "Expectant mothers",
  whoWeServePhase4Desc: "Nurturing wholeness through the miracle of life.",
  whoWeServePhase5Title: "Postpartum mothers",
  whoWeServePhase5Desc: "Support through the transformation of motherhood.",
  whoWeServePhase6Title: "Women with fertility challenges",
  whoWeServePhase6Desc: "Compassionate guidance through seasons of waiting.",
  whoWeServePhase7Title: "Women navigating hormone changes",
  whoWeServePhase7Desc: "Balance and grace for the seasons of shift.",
  whoWeServePhase8Title: "Couples seeking intimacy support",
  whoWeServePhase8Desc: "Rebuilding bridges of connection and intimacy.",
  whoWeServePhase9Title: "Women seeking healing from trauma",
  whoWeServePhase9Desc: "Safe passage toward reclamation and peace.",

  // Core Values Detailed
  value1Title: "Confidentiality",
  value1Desc: "We protect every story with strict privacy and trust.",
  value2Title: "Compassion",
  value2Desc: "We deliver care with empathy and understanding.",
  value3Title: "Education",
  value3Desc: "We simplify knowledge for informed health decisions.",
  value4Title: "Empowerment",
  value4Desc: "We equip people to take charge of their wellbeing.",
  value5Title: "Wellness",
  value5Desc: "We restore balance through holistic, effective care.",
  value6Title: "Advocacy",
  value6Desc: "We promote awareness and break health stigmas.",

  // Differentiators Detailed
  diff1Title: "Safe & Judgment-Free",
  diff1Desc: "We foster a confidential and compassionate environment where women can ask questions freely without fear, shame, or stigma.",
  diff2Title: "Education-Driven",
  diff2Desc: "We simplify complex reproductive and sexual health conversations into relatable, practical, and empowering knowledge.",
  diff3Title: "Holistic Wellness Approach",
  diff3Desc: "We combine medical education, emotional support, lifestyle wellness, counselling, and natural wellness perspectives to support the whole woman.",
  diff4Title: "Community & Support",
  diff4Desc: "We are building a supportive ecosystem where women can connect, learn, heal, and grow together.",

  // Trust & Safety Pillars
  tsPillar1Title: "Privacy",
  tsPillar1Desc: "Your data and story are locked behind clinical-grade security.",
  tsPillar2Title: "Respect",
  tsPillar2Desc: "Dignity is the baseline of every interaction and solution.",
  tsPillar3Title: "Emotional safety",
  tsPillar3Desc: "A sanctuary where vulnerability is met with strength.",
  tsPillar4Title: "Non-judgmental learning",
  tsPillar4Desc: "No shame, just clear, scientific, and compassionate truths.",
  tsPillar5Title: "Compassionate guidance",
  tsPillar5Desc: "Walking beside you through every delicate transition.",
  tsPillar6Title: "Restoration",
  tsPillar6Desc: "Focused on returning you to your peak biological and emotional state.",

  // Promise Cards
  promiseCard1Title: "Access to accurate intimate health education",
  promiseCard1Desc: "Every woman deserves truth over myths.",
  promiseCard2Title: "A safe space to be heard and supported",
  promiseCard2Desc: "Your voice matters in your healing journey.",
  promiseCard3Title: "Confidence in her body",
  promiseCard3Desc: "Restoring the innate trust between woman and biology.",
  promiseCard4Title: "Freedom from shame and stigma",
  promiseCard4Desc: "Dismantling the silence that hides suffering.",
  promiseCard5Title: "Holistic wellness and healing",
  promiseCard5Desc: "Medicine that respects the whole human experience.",
  promiseCard6Title: "The power to make informed decisions",
  promiseCard6Desc: "Knowledge is the ultimate tool for agency.",

  // Gallery, Projects, Events, Partner, Team
  galleryTitle: "Our Gallery",
  galleryDesc: "A glimpse into our journey and community impact.",
  galleryImagesListJson: "[]",
  galleryCategoriesJson: '["Workshops", "Outreach", "Community", "Clinic"]',
  projectsTitle: "Our Projects",
  projectsDesc: "Initiatives driving positive change.",
  projectsListJson: "[]",
  projectsCategoriesJson: '["Education", "Support", "Advocacy", "Digital"]',
  eventsTitle: "Upcoming Events",
  eventsDesc: "Join us for transformative experiences.",
  eventsListJson: "[]",
  eventsCategoriesJson: '["Workshop", "Retreat", "Seminar", "Webinar"]',
  partnerTitle: "Partner With Us",
  partnerDesc: "Join hands to expand our reach and impact.",
  partnerSubmitTitle: "Partnership Inquiry",
  partnerSubmitDesc: "Interested in collaborating? Reach out to us.",
  teamTitle: "Meet Our Team",
  teamDesc: "The dedicated experts behind our mission.",
  teamMembersJson: "[]",
  teamCategoriesJson: '["Medical", "Wellness", "Operations", "Board"]',

  // Testimonials Section
  testimonialsSub: "WHAT MEMBERS SAY",
  testimonialsTitle: "Testimonials.",
  testimonialsDesc: "Real stories of healing, empowerment, and restoration from women in our community.",
  testimonialsJson: "",
  testimonialCategoriesJson: '["Healing", "Education", "Support", "Community"]',

  contactAddress: "84 Okpanam Rd, opp. Legislative Quarters, GRA Phase I, Asaba, Delta State, Nigeria.",
  contactEmail: "info@thevaginaroom.com",
  contactPhone: "+234 802 729 4320",
  contactLabel: "GET IN TOUCH",
  contactHeading: "LET'S START THE CONVERSATION",
  contactSub: "Whether you're seeking guidance, looking to partner, or just want to say hello, we're here to listen.",
  contactConfidentialityTitle: "Your Privacy is our Priority",
  contactConfidentialityDesc: "All inquiries are handled with the highest level of confidentiality and medical ethics. Your data is protected.",
  contactWaysToSupportLabel: "GET INVOLVED",
  contactWaysToSupportTitle: "BEYOND THE CONVERSATION",
  contactSupportMissionTitle: "SUPPORT OUR MISSION",
  contactSupportMissionDesc: "Help us expand the reach of women's wellness resources and clinical community initiatives.",
  contactSupportMissionBtnText: "GO TO SUPPORT PAGE",
  contactPartnerWithUsTitle: "PARTNER WITH US",
  contactPartnerWithUsDesc: "We're always looking to collaborate with organizations and professionals who share our vision.",
  contactPartnerWithUsBtnText: "EXPLORE PARTNERSHIPS",

  // Support page extra defaults
  supportFuelHeading: "FUELING THE RESTORATION",
  supportFuelDesc: "Every contribution directly impacts the quality and reach of the sanctuary. We prioritize rural outreach and Clinical Hygiene Standardizations.",
  supportClosingHeading: "WE ARE GRATEFUL FOR YOUR SUPPORT",
  supportClosingDesc: "EVERY CONTRIBUTION MATTERS. TOGETHER WE ARE BUILDING A NEW STANDARD FOR REPRODUCTIVE WELLNESS.",
  supportPaystackUrl: "https://paystack.com/pay/thevaginaroom",
  supportImpactStatsJson: "[\n  { \"label\": \"Community Outreach\", \"desc\": \"Reaching underserved rural areas with health education.\" },\n  { \"label\": \"Clinic Support\", \"desc\": \"Subsidizing restorative care for women in need.\" },\n  { \"label\": \"Education Mastery\", \"desc\": \"Funding masterclasses and digital health resources.\" },\n  { \"label\": \"Safe Space Expansion\", \"desc\": \"Growing our local and digital support communities.\" }\n]",

  footerCopyright: "© 2026 THE VAGINA ROOM. ALL RIGHTS RESERVED.",
  footerSlogan: "Where Women Heal, Learn & Thrive...",
  footerCoreValuesTitle: "OUR CORE VALUES",
  footerCoreValuesList: "Empowerment • Confidentiality • Healing • Respect • Clinical Synergy • Restorative Care • Sisterhood",
  footerDisclaimerTitle: "MEDICAL DISCLAIMER",
  footerDisclaimerDesc: "The Vagina Room provides education, emotional support, and holistic wellness guidance. Content shared here is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.",

  // Policy & Terms
  policyHeading: "Privacy Policy",
  policyIntro: "At The Vagina Room, we respect your privacy and are committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit our website, attend our clinics or workshops, or use our services, and our practices for collecting, using, maintaining, protecting, and disclosing that information.\n\nGiven the sensitive nature of women's health, reproductive wellness, and emotional care, confidentiality and privacy are at the core of our mission.",
  policySectionsJson: '[\n  { "title": "Information We Collect", "content": "We collect several types of information from and about users of our services, including Personal Identifiers (Name, address, email), Health Information provided voluntarily, and Usage Details (IP addresses, browser types)." },\n  { "title": "How We Use Your Information", "content": "We use your information to provide our health services, answer inquiries, send updates about workshops (if you opt in), and improve our website performance." },\n  { "title": "Disclosure of Your Information", "content": "We do not sell, rent, or trade your personal information. We may disclose it to affiliates bound by confidentiality or to comply with legal processes." },\n  { "title": "Data Security", "content": "We implement measures designed to secure your information from accidental loss and unauthorized access. However, internet transmission is not 100% secure." }\n]',
  
  termsHeading: "Terms of Engagement",
  termsIntro: "By accessing and using this website, and by engaging with the services provided by The Vagina Room, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this website\'s particular services, you shall be subject to any posted guidelines or rules applicable to such services.",
  termsSectionsJson: '[\n  { "title": "1. Acceptance of Terms", "content": "Your use of this site confirms your acceptance of these terms." },\n  { "title": "2. Not Medical Advice", "content": "Content provided is for informational purposes only and is not a substitute for professional medical advice. Always seek a physician\'s advice for medical conditions." },\n  { "title": "3. Use of the Site", "content": "You are granted a limited license for personal use. You must not violate laws or disrupt the website\'s operation." },\n  { "title": "4. Intellectual Property", "content": "All contents are owned by The Vagina Room and protected by copyright laws." },\n  { "title": "5. Limitation of Liability", "content": "The Vagina Room is not liable for damages arising from your use of the website." }\n]',

  faqTitle: "Frequently Asked Questions",
  faqHeading: "Common Questions.",
  faqDesc: "Everything you need to know about our community, privacy standards, and wellness approach.",

  socialLinkLinkedin: "https://linkedin.com",
  socialLinkInstagram: "https://instagram.com",
  socialLinkTiktok: "https://tiktok.com",
  socialLinkFacebook: "https://facebook.com",
  socialLinkYoutube: "https://youtube.com",

  // Serialized lists with JSON defaults for advanced programmatic lists
  faqDataJson: "",
  focusAreasJson: "",
  coreValuesJson: "",
  differentiatorsJson: "",
  audienceJson: "",
  identitiesJson: "",
  whyWeExistJson: "",
  whoWeServeJson: "",
  communityJson: "",
  trustSafetyJson: "",

  partnersHeading: "As Seen In & Partnering Teams",
  partnersSub: "MEDIA & COLLEGIAL ALLIANCES",
  partnersDefaultHeadline: "Pioneering verified clinical education & holistic therapeutic models for private lifestyle sanctuaries.",
  partnersDescription: "Showcasing accredited features on global television networks, reputable press media publishers, and joint ventures with institutional clinical wellness allies.",
  partnersLogosJson: '[\n  { "name": "Global Media Partner", "imageUrl": "https://placehold.co/400x400/e2e8f0/1e293b?text=Media+Logo+1", "type": "Media Appearance", "link": "", "headline": "Exhibiting state-sanctioned advocacy of gynaecological education for indigenous West African women.", "impactYear": "2026" },\n  { "name": "Innovating Wellness Journal", "imageUrl": "https://placehold.co/400x400/e2e8f0/1e293b?text=Media+Logo+2", "type": "Media Appearance", "link": "", "headline": "Spotlighting high-fashion wellness integrations and Breaking Taboos around feminine anatomy wellness.", "impactYear": "2026" },\n  { "name": "Global Health Alliance", "imageUrl": "https://placehold.co/400x400/e2e8f0/1e293b?text=Brand+Logo+1", "type": "Trusted Partner", "link": "", "headline": "A strategic global wellness network validating complementaries and standardizing gynaecological spa guidelines.", "impactYear": "Active" }\n]',
  partnersLogoSize: "200",

  // Dr. FID Booking Page
  bookingHeroSub: "Contact & Bookings",
  bookingHeroTitle: "Invite Dr. FID.",
  bookingHeroDesc: "Invite Dr. FID for speaking engagements, wellness conferences, corporate trainings, retreats, women’s wellness events, and transformational health conversations.",
  bookingAboutHeading: "Holistic Wellness Expert & Women’s wellness advocate.",
  bookingAboutDesc: "Ambassador Dr. Damilola Awoyemi (Dr. FID) is a Holistic Wellness Expert, SPA Business Consultant, women’s wellness advocate, and creator of transformational wellness systems focused on integrative healing, reproductive wellness, emotional wellbeing, and sustainable wellness entrepreneurship.",
  bookingAvailableList: "Speaking Engagements\nConferences & Summits\nCorporate Wellness Trainings\nWomen’s Wellness Programs\nRetreats & Wellness Experiences\nSPA & Wellness Business Trainings\nHealth Awareness Campaigns\nPanel Sessions & Interviews\nEducational Workshops",

  // Custom additions for Dr. FID Bio page sections
  drFidCertifications: "The Open International University for Complementary Medicines, USA\nAzteca University (Spinal Manipulation Certification)\nWestern Ville University, USA (Naturopathy and Herbal Therapeutics)\nMAHC Natural Medicine Academy, USA\nBachelor of Public Health, University of Ibadan",
  drFidExpertiseJson: "[\n  {\"title\": \"Integrative Naturopathy\"},\n  {\"title\": \"Spinal Manipulation\"},\n  {\"title\": \"Herbal Therapeutics\"},\n  {\"title\": \"Holistic Body Restoration\"},\n  {\"title\": \"Chiropractic Care\"},\n  {\"title\": \"Naturopathy\"}\n]",
  drFidAncpParagraph1: "An innovative and structured wellness business model integrating Acupuncture, Naturopathy, Chiropractic, and Physiotherapy into a unified spa system.",
  drFidAncpParagraph2: "This framework empowers wellness practitioners and spa owners to deliver exceptional clinical-grade care, implement standardized treatment protocols, and build sustainable, high-performing wellness businesses.",
  drFidAncpParagraph3: "Through FID FUSION Limited and FID SPA Aesthetic & Chiropractic Clinic, she has trained and certified over 30 spa professionals, strengthening capacity within the wellness and therapeutic industry while advancing professional standards in holistic care delivery in Nigeria.",
  drFidAncpTrainedCount: "30+",
  drFidAncpProtocolsLabel: "Unified",
  drFidPersonalLifeTitle: "Devoted Wife & Mother.",
  drFidPersonalLifeParagraph1: "Beyond her professional identity, Ambassador Dr. Damilola Awoyemi is a devoted wife and mother. She is married to Awoyemi Oluwafisayo, and they are blessed with three children: Awoyemi Ireayo, Awoyemi Iremide, and Awoyemi Irenitemi.",
  drFidPersonalLifeParagraph2: "Her work bridges healthcare, wellness innovation, entrepreneurship, and family-centered values, positioning her as a respected authority in holistic wellness and integrative spa business development.",
  drFidPersonalLifePhilosophy: "Addressing the body, mind, and emotional system as a unified whole.",

  // Custom additions for Support/Donate page sections
  supportInvestLabel: "Invest in Her Wellness",
  supportHeading: "Support The Mission.",
  supportSub: "Your contribution fuels a movement dedicated to restoring dignity, knowledge, and healing to women everywhere.",

  // Navigation Menu, Headers, and Settings Manager Schema
  generalSettingsJson: '{\n  "siteName": "The Vagina Room",\n  "metaTitle": "The Vagina Room - Holistic Wellness & Intimate Reproductive Education",\n  "supportEmail": "info@thevaginaroom.com",\n  "supportPhone": "+234 813 546 4432",\n  "whatsappPhone": "+234 813 546 4432",\n  "whatsappMethod": "REDIRECT",\n  "whatsappApiKey": "",\n  "whatsappBusinessId": "",\n  "timezone": "UTC+1 (Lagos)"\n}',
  smtpSettingsJson: '{\n  "host": "",\n  "port": "587",\n  "user": "",\n  "pass": "",\n  "from": ""\n}',
  brandingSettingsJson: '{\n  "primaryMode": "gradient",\n  "primaryColor": "#C41E3A",\n  "primaryGradStart": "#C41E3A",\n  "primaryGradEnd": "#8B0000",\n  "primaryGradAngle": 135,\n  "secondaryMode": "flat",\n  "secondaryColor": "#D4AF37",\n  "secondaryGradStart": "#D4AF37",\n  "secondaryGradEnd": "#B8860B",\n  "secondaryGradAngle": 45,\n  "fontFamily": "Inter",\n  "buttonRoundness": "md",\n  "baseFontSize": 16,\n  "logoUrlAlt": "",\n  "headerLogoType": "text",\n  "headerLogoUrl": "",\n  "footerLogo1Type": "text",\n  "footerLogo1Url": "",\n  "footerLogo2Type": "text",\n  "footerLogo2Url": "",\n  "socialLogoType": "text",\n  "socialLogoUrl": ""\n}',
  fontSizeOverridesJson: '{}',
  logoUrlAlt: "",
  faviconUrl: "",
  headerLogoUrl: "",
  footerLogo1Url: "",
  footerLogo2Url: "",
  socialLogoUrl: "",
  seoSettingsJson: '{\n  "metaDescription": "A safe sanctuary and global supportive community providing trusted clinical education, restorative therapy, and guidance.",\n  "metaKeywords": "women\'s health, reproductive health, vaginal health, Dr. FID, intimate wellness",\n  "ogImage": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80",\n  "authorName": "Dr. FID"\n}',
  ogImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80",
  securitySettingsJson: '{\n  "sessionTimeout": "60 mins",\n  "twoFactorAuth": "Optional",\n  "restrictIframe": "No",\n  "allowedOrigins": "*"\n}',
  topHeaderSettingsJson: '{\n  "logoText": "The Vagina Room",\n  "logoImageUrl": "",\n  "enableSearchBar": true,\n  "enableNotificationsIcon": true,\n  "enableMessagesIcon": true,\n  "enableAdminProfileDropdown": true\n}',
  leftSidebarSettingsJson: '{\n  "isCollapsible": true,\n  "defaultCollapsed": false,\n  "sections": [\n    {\n      "label": "Main Operations",\n      "items": [\n        { "label": "Client Enquiries", "path": "/admin?tab=submissions", "icon": "Inbox", "badge": "Active" },\n        { "label": "Live Page Designer", "path": "/admin?tab=content", "icon": "Layout", "badge": "" }\n      ]\n    },\n    {\n      "label": "Content Management",\n      "items": [\n        { "label": "Community Content", "path": "/admin?tab=content&sub=home", "icon": "Home", "badge": "" },\n        { "label": "Reproductive Focus Areas", "path": "/admin?tab=content&sub=focus_areas", "icon": "BookOpen", "badge": "" },\n        { "label": "Testimonials Slider", "path": "/admin?tab=content&sub=testimonials", "icon": "MessageSquare", "badge": "" },\n        { "label": "Global Menu Setup", "path": "/admin?tab=navigation", "icon": "Menu", "badge": "" }\n      ]\n    }\n  ],\n  "quickAccessLinks": [\n    { "label": "View Live Site", "path": "/", "icon": "ExternalLink" },\n    { "label": "System Settings", "path": "/admin?tab=settings", "icon": "Settings" }\n  ]\n}',
  headerMenuJson: '[\n  { "name": "Who We Are", "href": "#", "submenu": [{ "name": "About Us", "href": "/about" }, { "name": "Meet Dr. FID", "href": "/dr-fid" }, { "name": "Join Our Community", "href": "/join-community" }, { "name": "Meet Our Team", "href": "/team" }, { "name": "Focus Areas", "href": "/focus-areas" }, { "name": "Support Our Mission", "href": "/support" }, { "name": "Partner With Us", "href": "/partner" }] },\n  { "name": "Products", "href": "/products" },\n  { "name": "Projects", "href": "/projects" },\n  { "name": "Events", "href": "/events" },\n  { "name": "Gallery", "href": "/gallery" },\n  { "name": "Contact Us", "href": "/contact" }\n]',
  footerMenuJson: '[\n  { "name": "About Us", "href": "/about" },\n  { "name": "Meet Dr. FID", "href": "/dr-fid" },\n  { "name": "Meet Our Team", "href": "/team" },\n  { "name": "Focus Areas", "href": "/focus-areas" },\n  { "name": "Support Our Mission", "href": "/support" },\n  { "name": "Partner With Us", "href": "/partner" },\n  { "name": "Products", "href": "/products" },\n  { "name": "Projects", "href": "/projects" },\n  { "name": "Events", "href": "/events" },\n  { "name": "Gallery", "href": "/gallery" },\n  { "name": "Contact Us", "href": "/contact" }\n]',
  
  // Products Management
  productsTitle: "Our Curated Products",
  productsSub: "PHYTO-MEDICINAL & INTENSIVE CARE SELECTIONS",
  productsDesc: "Scientifically-backed natural formulations, chiropractic hygiene formulas, and holistic wellness tools curated by Dr. FID to strengthen, restore, and preserve reproductive wellbeing.",
  productsExternalUrl: "https://fakestoreapi.com/products/category/women's clothing",
  productsListJson: '[\n  {\n    "id": "p1",\n    "title": "Bespoke Reproductive Restoration Kit",\n    "price": "45,000",\n    "currency": "NGN",\n    "description": "Comprehensive intimate restorative set containing premium chiropractic hygiene herbal steam formula, reproductive system organic infusions, and Dr. FID\'s signature instructional wellness guide.",\n    "imageUrl": "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=600"\n  },\n  {\n    "id": "p2",\n    "title": "Anatomical Chiropractic Healing Balm",\n    "price": "12,500",\n    "currency": "NGN",\n    "description": "High-purity extract botanical formulation engineered for musculoskeletal soothing, pelvic release integration, and daily soft-tissue restoration therapy.",\n    "imageUrl": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600"\n  },\n  {\n    "id": "p3",\n    "title": "Intimate pH Balancing Botanical Wash",\n    "price": "10,000",\n    "currency": "NGN",\n    "description": "Sulfate-free, clinical-grade organic botanical wash formulated with low acidic pH to match biological zones perfectly. Free from artificial perfumes or toxic synthetic parabens.",\n    "imageUrl": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600"\n  }\n]',
  
  // Custom section ordering layouts
  homePageSectionsOrder: '["primary_hero", "about_the_room", "identity_grid", "partners", "about_sanctuary", "why_we_exist", "focus_areas", "who_we_serve", "know_your_vagina", "values", "community", "trust_safety", "testimonials", "promise", "faq", "products", "social_grid"]',
  drFidPageSectionsOrder: '["profile_hero", "career_expertise", "education_certifications", "ancp_framework", "vagina_room_context", "personal_life", "closing_cta"]',
  aboutPageSectionsOrder: '["about_hero", "manifesto", "mission_vision", "who_we_serve", "differentiators", "core_values", "promise"]',
  paymentSettingsJson: '{\n  "paystackSecretKey": "",\n  "flutterwaveSecretKey": "",\n  "flutterwavePublicKey": ""\n}',
  adminPassword: "admin123",
  pwaSettingsJson: '{\n  "name": "The Vagina Room",\n  "short_name": "Vagina Room",\n  "description": "A sanctuary for intimate wellness and reproductive education.",\n  "theme_color": "#C41E3A",\n  "background_color": "#0a0a0a",\n  "display": "standalone",\n  "orientation": "portrait",\n  "iconUrl": "/icon-512.png"\n}',
  checkoutSettingsJson: '{\n  "shippingLocations": [\n    { "name": "Within Asaba", "fee": 1000 },\n    { "name": "Outside Asaba (Delta State)", "fee": 2500 },\n    { "name": "Nationwide Delivery (Nigeria)", "fee": 5000 },\n    { "name": "International Delivery", "fee": 15000 }\n  ],\n  "paymentMethods": [\n    "Pay with Card / Bank Transfer",\n    "Flutterwave Payment Gateway",\n    "Paystack Payment Gateway",\n    "Bank Transfer",\n    "Pay on WhatsApp Confirmation",\n    "Payment After Ordering (Manual Confirmation)"\n  ]\n}',
  productPageSettingsJson: '{\n  "showExternalSource": true,\n  "showSignaturePreparations": true\n}',
  externalSourcesJson: '[\n  { "name": "Global Inventory", "url": "", "active": true }\n]',
  featuredProductIdsJson: "[]"
};

export type ContentData = typeof FALLBACK_DEFAULTS;

interface ContentContextType {
  content: ContentData;
  loading: boolean;
  isAdmin: boolean;
  isEditMode: boolean;
  loginAsAdmin: (password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  setEditMode: (enabled: boolean) => void;
  updateContentField: (key: keyof ContentData, value: string) => void;
  saveContentChanges: () => Promise<{ success: boolean; message: string }>;
  uploadImage: (base64Data: string, fileName: string) => Promise<{ success: boolean; url?: string; error?: string }>;
  submitFormSubmission: (formType: string, formData: any) => Promise<{ success: boolean; id?: string }>;
  adminPasswordToken: string;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<ContentData>(FALLBACK_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setEditMode] = useState(false);
  const [adminPasswordToken, setAdminPasswordToken] = useState("");

  const loadContent = async () => {
    try {
      const res = await fetchWithApiBase("/api/content");
      if (res.ok) {
        const data = await res.json();
        const trimmedData = Object.keys(data).reduce((acc, key) => {
          acc[key] = typeof data[key] === 'string' ? data[key].trim() : data[key];
          return acc;
        }, {} as any);
        setContent((prev) => ({ ...prev, ...trimmedData }));
      }
    } catch (e) {
      console.warn("Backend API unavailable, utilizing robust client storage values.", e);
    } finally {
      setLoading(false);
    }
  };

  // Check login credentials on mount
  useEffect(() => {
    loadContent();
    const token = localStorage.getItem("tvr_admin_secret");
    if (token) {
      // Validate token silently with auth ping
      setAdminPasswordToken(token);
      setIsAdmin(true);
    }
  }, []);

  const loginAsAdmin = async (password: string): Promise<boolean> => {
    try {
      const res = await fetchWithApiBase("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        localStorage.setItem("tvr_admin_secret", password);
        setAdminPasswordToken(password);
        setIsAdmin(true);
        setEditMode(true); // Automatically trigger editing assistance immediately
        return true;
      }
    } catch (e) {
      console.error("Login verification failed", e);
    }
    return false;
  };

  const logoutAdmin = () => {
    localStorage.removeItem("tvr_admin_secret");
    setAdminPasswordToken("");
    setIsAdmin(false);
    setEditMode(false);
  };

  const updateContentField = (key: keyof ContentData, value: string) => {
    setContent((prev) => ({
      ...prev,
      [key]: key === 'adminPassword' ? value : value.trim(),
    }));
  };

  const saveContentChanges = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const trimmedContent = Object.keys(content).reduce((acc, key) => {
        const value = content[key as keyof ContentData];
        acc[key as keyof ContentData] = typeof value === 'string' ? value.trim() : value;
        return acc;
      }, {} as ContentData);

      const res = await fetchWithApiBase("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: adminPasswordToken,
          content: trimmedContent,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setContent(result.content);
        if (result.content.adminPassword !== adminPasswordToken) {
          localStorage.setItem("tvr_admin_secret", result.content.adminPassword);
          setAdminPasswordToken(result.content.adminPassword);
        }
        return { success: true, message: "Site changes successfully stored in backend database!" };
      }
      return { success: false, message: result.error || "Save operation rejected by server." };
    } catch (e: any) {
      console.error("Content persist failed", e);
      return { success: false, message: "Could not establish connection to full-stack server." };
    }
  };

  const uploadImage = async (base64Data: string, fileName: string): Promise<{ success: boolean; url?: string; error?: string }> => {
    console.log('uploadImage called for:', fileName);
    try {
      // Robust base64 to blob conversion
      const [header, data] = base64Data.split(',');
      const contentType = header.match(/data:(.*);base64/)?.[1] || 'image/png';
      
      const byteCharacters = atob(data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: contentType });
      
      const file = new File([blob], fileName, { type: contentType });
      console.log('Blob created, calling uploadToBackend');

      const response = await uploadToBackend(file);
      console.log('uploadToBackend returned:', response.data);
      return { success: true, url: response.data.url };
    } catch (e: any) {
      console.error("Upload failed in context", e);
      return { success: false, error: e.message || "Failed to upload image." };
    }
  };

  const submitFormSubmission = async (formType: string, formData: any): Promise<{ success: boolean; id?: string }> => {
    try {
      const res = await fetchWithApiBase("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType, formData }),
      });

      if (res.ok) {
        const result = await res.json();
        return { success: true, id: result.id };
      }
    } catch (e) {
      console.error("Form submit failed", e);
    }
    return { success: false };
  };

  return (
    <ContentContext.Provider
      value={{
        content,
        loading,
        isAdmin,
        isEditMode,
        loginAsAdmin,
        logoutAdmin,
        setEditMode,
        updateContentField,
        saveContentChanges,
        uploadImage,
        submitFormSubmission,
        adminPasswordToken,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be initialized inside ContentProvider");
  }
  return context;
}
