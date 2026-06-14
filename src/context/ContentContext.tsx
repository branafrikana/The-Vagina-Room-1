import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc, collection, addDoc, getDocFromServer, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadToCloudinaryClient } from '../lib/cloudinary';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

// Static defaults for direct client-side resilience
export const FALLBACK_DEFAULTS = {
  badgesConfigJson: '[\n  { "id": "womb_listener", "title": "🌸 Womb Listener", "desc": "Active Thread Starter", "criteria": "Draft 1+ post onto the global Community Timeline." },\n  { "id": "somatic_helper", "title": "💬 Somatic Helper", "desc": "Sisterhood Guidance", "criteria": "Write 1+ helpful reply or thread comment inside discussion circles." },\n  { "id": "luminous_beacon", "title": "🌟 Luminous Beacon", "desc": "Atmospheric Support", "criteria": "Glow 3+ support hearts to sisters across timeline feeds." },\n  { "id": "circle_guardian", "title": "👥 Circle Guardian", "desc": "Circle Pioneer", "criteria": "Be an active sibling inside 2+ specialized discussion groups." },\n  { "id": "community_pillar", "title": "👑 Community Pillar", "desc": "Steward-Mentor Rank", "criteria": "Accumulate a total of 50+ holistic contribution points." }\n]',

  membershipPriceGoldNGN: "25000",
  membershipPriceGoldUSD: "45",
  membershipPriceDiamondNGN: "85000",
  membershipPriceDiamondUSD: "150",

  registerHeading: 'Enter the <br/>\n<span class="text-brand-gold italic">Community</span>',
  registerSub: 'Join a global community focused on women’s holistic health education, supporting informed choices, healing, and empowerment at every stage of womanhood.',

  heroWelcome: "WELCOME TO",
  heroHeading: "The Vagina Room",
  heroSub: "Where Women Heal, Learn & Thrive...",
  heroBtnText: "👉 Join The Community",
  heroBtnUrl: "/join-community",
  heroBgUrl: "",

  drFidHeading: "MEET DR. FID",
  drFidBio1: "Ambassador Dr. Damilola Awoyemi, popularly known as Dr. FID, is a seasoned SPA Business Consultant, Holistic Wellness Expert, women’s wellness advocate and visionary entrepreneur committed to transforming lives through integrative healthcare, restorative therapy, and sustainable wellness enterprise development.",
  drFidBio2: "Through The Vagina Room, she is building a safe and empowering platform where women can access trusted education, emotional support, and holistic wellness guidance for their intimate and reproductive health journey.",
  drFidBio3: "Combining clinical expertise with compassionate care, she creates confidential spaces that help women gain clarity, confidence, healing, and a deeper understanding of their bodies and overall wellbeing.",
  drFidQuote: '"Restoring wellness, empowering women, and transforming lives through holistic healing and education."',
  drFidImageUrl: "",
  drFidPageImageUrl: "",

  aboutTitle: "OUR MISSION & GROUNDWORK",
  aboutHeading: "A COMMUNITY FOR EVERY WOMAN'S HEALTH JOURNEY",
  aboutParagraph1: "We believe that women's reproductive and sexual wellness is a crucial aspect of healthcare. For far too long, conversations surrounding intimate anatomy, hormonal transitions, fertility, and sexual satisfaction have been shrouded in shame, silence, or clinical detachment.",
  aboutParagraph2: "The Vagina Room is building a community where biology meets compassion. We dismantle stigmas by providing accurate, science-backed education that empowers you to trust your body, navigate transitions, and find holistic restoration.",
  aboutImageUrl: "",

  // Identity Grid & Scrolling Ticker
  tickerText: "TRUSTED EDUCATION • EXPERT GUIDANCE • EMOTIONAL SUPPORT • HOLISTIC WELLNESS • THE VAGINA ROOM GLOBAL • ",
  identityLabel1: "Speaker",
  identityImg1: "",
  identityLabel2: "Trainer",
  identityImg2: "",
  identityLabel3: "Coach",
  identityImg3: "",
  identityLabel4: "Therapist",
  identityImg4: "",

  // Homepage About Us Detailed Section
  aboutUsSub: "Who We Are",
  aboutUsTitle: "About Us.",
  aboutUsBoxText: "The Vagina Room is a women-centered wellness, education, and support platform dedicated to helping women understand, protect, heal, and confidently embrace their intimate and reproductive health at every stage of life.",
  aboutUsParagraph1: "The Vagina Room is more than a platform. It is a movement committed to restoring knowledge, confidence, dignity, healing, and wholeness to women through conversations and solutions that many societies often avoid.",
  aboutUsMissionTitle: "Our Mission",
  aboutUsMissionDesc: "To empower women with knowledge, support, healing, and access to transformative intimate wellness solutions that improve their physical, emotional, reproductive, and relational well-being.",
  aboutUsVisionTitle: "Our Vision",
  aboutUsVisionDesc: "To become a globally trusted women’s wellness ecosystem where every woman feels informed, supported, confident, safe, and empowered in her intimate health journey.",

  // Independent Homepage About Us Section (separate from About Us page)
  homeAboutUsSub: "Who We Are",
  homeAboutUsTitle: "About Us.",
  homeAboutUsBoxText: "The Vagina Room is a women-centered wellness, education, and support platform dedicated to helping women understand, protect, heal, and confidently embrace their intimate and reproductive health at every stage of life.",
  homeAboutUsParagraph1: "The Vagina Room is more than a platform. It is a movement committed to restoring knowledge, confidence, dignity, healing, and wholeness to women through conversations and solutions that many societies often avoid.",
  homeAboutUsMissionTitle: "Our Mission",
  homeAboutUsMissionDesc: "To empower women with knowledge, support, healing, and access to transformative intimate wellness solutions that improve their physical, emotional, reproductive, and relational well-being.",
  homeAboutUsVisionTitle: "Our Vision",
  homeAboutUsVisionDesc: "To become a globally trusted women’s wellness ecosystem where every woman feels informed, supported, confident, safe, and empowered in her intimate health journey.",

  telegramHeroBgUrl: "",
  telegramHeroLogoUrl: "",
  telegramCommunityImgUrl: "",
  telegramFounderImageUrl: "",
  telegramHeaderLogoType: "text",
  telegramHeaderLogoUrl: "",
  telegramHeaderTextLogo: "The Vagina Room",
  telegramHeroHeaderTextLogo: "The Vagina Room",
  telegramHeaderLogoHeight: "44",
  telegramHeroLogoType: "text",
  telegramHeroLogoHeight: "150",

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
  joinCommunityTitle: "Join The Community",
  joinCommunityHeading: "Your Journey to Holistic Wholeness Starts Here.",
  joinCommunitySubheading: "Become part of a global movement dedicated to restoring knowledge, confidence, and healing to every woman.",
  joinCommunityBenefitsJson: '[\n  { "title": "Safe & Private", "text": "A confidential space where your questions are respected and your privacy is paramount.", "icon": "ShieldCheck" },\n  { "title": "Expert-Led Education", "text": "Access trusted, science-backed guidance on reproductive and intimate wellness.", "icon": "BookOpen" },\n  { "title": "Global Sisterhood", "text": "Connect with women worldwide on similar journeys of healing and discovery.", "icon": "Users" },\n  { "title": "Holistic Support", "text": "Integrative wellness tools that address your physical, emotional, and relational well-being.", "icon": "Heart" }\n]',
  joinCommunityRegistrationCost: "Registration Fee: NGN 25,000 / $50",
  joinCommunityCtaText: "Register Now",
  joinCommunityCtaUrl: "https://external-community-platform.com/register",
  joinCommunityWhatYouGetJson: '[\n  "Bi-weekly wellness masterclasses with Dr. FID",\n  "Access to our private discussion community",\n  "Digital intimacy wellness library & resources",\n  "Priority booking for retreats and workshops",\n  "Exclusive discounts on curated healing products",\n  "A supportive network of like-minded women"\n]',
  joinCommunityHeroBgUrl: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=1600",
  joinCommunityHeroLabel: "THE COMMUNITY",
  joinCommunityExclusiveLabel: "EXCLUSIVE ACCESS",
  joinCommunityDeliveryHeading: "What You Receive As A Member Of Our Community.",
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
  tsPillar3Desc: "A safe haven where vulnerability is met with strength.",
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
  galleryImagesListJson: '[\n  {\n    "id": 1,\n    "title": "Intimate Wellness Workshop",\n    "category": "Workshops",\n    "image": "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800",\n    "description": "Empowering women through shared knowledge and safe conversations."\n  },\n  {\n    "id": 2,\n    "title": "Rural Health Outreach",\n    "category": "Outreach",\n    "image": "https://images.unsplash.com/photo-1516533075015-a3838414c3cb?auto=format&fit=crop&q=80&w=800",\n    "description": "Direct impact in underserved communities, providing essential education."\n  },\n  {\n    "id": 3,\n    "title": "Sisterhood Circle",\n    "category": "Community",\n    "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",\n    "description": "A secure space for emotional healing and connection."\n  },\n  {\n    "id": 4,\n    "title": "Fid Spa Clinical Session",\n    "category": "Clinic",\n    "image": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800",\n    "description": "Professional restorative care and manual therapy expertise."\n  },\n  {\n    "id": 5,\n    "title": "Wellness Retreat",\n    "category": "Community",\n    "image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",\n    "description": "Returning to nature to find inner balance and peace."\n  },\n  {\n    "id": 6,\n    "title": "Health Education Seminar",\n    "category": "Workshops",\n    "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",\n    "description": "Advanced seminars on reproductive and sexual wellness."\n  },\n  {\n    "id": 7,\n    "title": "Advocacy Movement",\n    "category": "Community",\n    "image": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1200",\n    "description": "Breaking stigmas through bold advocacy and public education."\n  },\n  {\n    "id": 8,\n    "title": "Mobile Clinic Preparation",\n    "category": "Outreach",\n    "image": "https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?auto=format&fit=crop&q=80&w=800",\n    "description": "Organizing resources for regional wellness drives."\n  }\n]',
  galleryCategoriesJson: '["Workshops", "Outreach", "Community", "Clinic"]',
  projectsTitle: "Our Projects",
  projectsDesc: "Initiatives driving positive change.",
  projectsListJson: '[\n  {\n    "title": "The Intimate Wellness Workshop",\n    "category": "Education",\n    "status": "Ongoing",\n    "location": "Asaba, Delta State",\n    "date": "Monthly",\n    "image": "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800",\n    "description": "A series of masterclasses taught by experts covering vaginal hygiene, hormonal balance, and sexual wellness.",\n    "impact": "500+ Women Educated"\n  },\n  {\n    "title": "Project Healing Hands",\n    "category": "Support",\n    "status": "Active",\n    "location": "Fid Spa Clinic",\n    "date": "Quarterly",\n    "image": "https://images.unsplash.com/photo-1516533075015-a3838414c3cb?auto=format&fit=crop&q=80&w=800",\n    "description": "Restorative therapy sessions and emotional counselling for women recovering from reproductive health challenges and trauma.",\n    "impact": "120+ Sessions Completed"\n  },\n  {\n    "title": "Rural Outreach Initiative",\n    "category": "Advocacy",\n    "status": "Upcoming",\n    "location": "Delta State Villages",\n    "date": "Sept 2026",\n    "image": "https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?auto=format&fit=crop&q=80&w=800",\n    "description": "Taking intimate health education and basic screenings to women in underserved rural communities who lack access to modern wellness facilities.",\n    "impact": "Target: 1000 Women"\n  },\n  {\n    "title": "The Digital Community",\n    "category": "Digital",\n    "status": "In Development",\n    "location": "Global / Online",\n    "date": "Oct 2026",\n    "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",\n    "description": "A confidential AI-powered (Gemini) platform for women to ask sensitive health questions and receive immediate, trusted guidance.",\n    "impact": "Alpha Testing Phase"\n  }\n]',
  projectsCategoriesJson: '["Education", "Support", "Advocacy", "Digital"]',
  eventsTitle: "Upcoming Events",
  eventsDesc: "Join us for transformative experiences.",
  eventsListJson: '[\n  {\n    "title": "The Intimate Wellness Masterclass",\n    "date": "June 15, 2026",\n    "time": "10:00 AM - 2:00 PM",\n    "location": "Fid Spa Clinic, Asaba",\n    "type": "Workshop",\n    "price": "Registration Required",\n    "image": "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800",\n    "description": "An intensive education session focusing on hormonal balance, vaginal health, and empowering your body\'s natural healing systems.",\n    "status": "Upcoming"\n  },\n  {\n    "title": "Healing & Wholeness Retreat",\n    "date": "July 22, 2026",\n    "time": "Full Day Experience",\n    "location": "Private Community, Delta State",\n    "type": "Retreat",\n    "price": "Exclusive Invite",\n    "image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",\n    "description": "A day of restorative therapy, emotional healing, and sisterhood connection designed to reset your mental and physical wellbeing.",\n    "status": "Limited Slots"\n  },\n  {\n    "title": "Community Outreach: Rural Health",\n    "date": "August 05, 2026",\n    "time": "8:00 AM - 4:00 PM",\n    "location": "Local Community Center",\n    "type": "Outreach",\n    "price": "Free Admission",\n    "image": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",\n    "description": "Providing basic screenings and intimate health education to underserved communities.",\n    "status": "Registration Open"\n  }\n]',
  eventsCategoriesJson: '["Workshop", "Retreat", "Seminar", "Webinar"]',
  partnerTitle: "Partner With Us",
  partnerDesc: "Join hands to expand our reach and impact.",
  partnerSubmitTitle: "Partnership Inquiry",
  partnerSubmitDesc: "Interested in collaborating? Reach out to us.",
  teamTitle: "Meet Our Team",
  teamDesc: "The dedicated experts behind our mission.",
  teamMembersJson: '[\n  {\n    "name": "Amb. Dr. Damilola Awoyemi",\n    "role": "Founder & CEO (Dr. FID)",\n    "category": "Executive",\n    "image": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=800",\n    "bio": "Visionary leader and holistic wellness expert dedicated to women\'s intimate health.",\n    "link": "/dr-fid"\n  },\n  {\n    "name": "Wellness Consultant",\n    "role": "Lead Holistic Practitioner",\n    "category": "Medical",\n    "image": "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=800",\n    "bio": "Expert in restorative therapies and integrated healthcare solutions."\n  },\n  {\n    "name": "Clinical Support",\n    "role": "Reproductive Health Educator",\n    "category": "Board",\n    "image": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=800",\n    "bio": "Empowering women with accurate education and compassionate support."\n  },\n  {\n    "name": "Community Lead",\n    "role": "Advocacy & Support Manager",\n    "category": "Operations",\n    "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",\n    "bio": "Building a safe space for connection, healing, and shared experiences."\n  }\n]',
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

  // Contact Thank You Page Config
  contactThankYouHeading: "THANK YOU FOR REACHING OUT",
  contactThankYouMessage: "Your message has been logged securely, and our team will get in touch shortly.",
  contactThankYouCtaText: "Join Our Free Telegram Community",
  contactThankYouTelegramLink: "https://t.me/thevaginaroom",
  contactThankYouTelegramLandingUrl: "/telegram",

  // Support page extra defaults
  supportFuelHeading: "FUELING THE RESTORATION",
  supportFuelDesc: "Every contribution directly impacts the quality and reach of the community. We prioritize rural outreach and Clinical Hygiene Standardizations.",
  supportClosingHeading: "WE ARE GRATEFUL FOR YOUR SUPPORT",
  supportClosingDesc: "EVERY CONTRIBUTION MATTERS. TOGETHER WE ARE BUILDING A NEW STANDARD FOR REPRODUCTIVE WELLNESS.",
  supportPaystackUrl: "https://paystack.com/pay/thevaginaroom",
  supportImpactStatsJson: "[\n  { \"label\": \"Community Outreach\", \"desc\": \"Reaching underserved rural areas with health education.\" },\n  { \"label\": \"Clinic Support\", \"desc\": \"Subsidizing restorative care for women in need.\" },\n  { \"label\": \"Education Mastery\", \"desc\": \"Funding masterclasses and digital health resources.\" },\n  { \"label\": \"Safe Space Expansion\", \"desc\": \"Growing our local and digital support communities.\" }\n]",

  footerCopyright: `© ${new Date().getFullYear()} THE VAGINA ROOM. ALL RIGHTS RESERVED.`,
  footerSlogan: "Where Women Heal, Learn & Thrive...",
  footerCoreValuesTitle: "OUR CORE VALUES",
  footerCoreValuesList: "Empowerment • Confidentiality • Healing • Respect • Clinical Synergy • Restorative Care • Sisterhood",
  footerDisclaimerTitle: "MEDICAL DISCLAIMER",
  footerDisclaimerDesc: "The Vagina Room provides education, emotional support, and holistic wellness guidance. Content shared here is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.",

  // Policy & Terms
  policyHeading: "Privacy Policy",
  policyIntro: "At The Vagina Room, your privacy is our sacred trust. We recognize the profound sensitivity surrounding women's health, reproductive well-being, and intimate wellness. We are committed to safeguarding your personal indices, interactive communications, and clinical wellness records with the highest grade of security. This Privacy Policy details how we aggregate, preserve, and protect information when you log into our virtual portal, participate in professional member forums, register for wellness subscriptions, utilize our affiliate program, or shop our aggregated reproductive products.",
  policySectionsJson: '[\n  { "title": "1. Holistic Information We Safeguard", "content": "To provide you with a customized and secure environment, we process:\\n- Personal Registration Data: Email address, chosen passwords, and platform avatars.\\n- Community & Social Data: Public profile indicators, collaborative discussion forum posts, and secure peer-to-peer Direct Messages (DMs).\\n- Affiliate & Payout Profiles: Financial referral statistics, banking clearance metrics, and tracking coordinates.\\n- Direct E-Commerce Indices: Items in your local shopping cart (\'tvr_cart\'), product preference logs, and synchronized ordering messages." },\n  { "title": "2. Data Storage, Local Cart, and Cloudinary Sync", "content": "To ensure lightning-fast performance and data integrity, we structure our storage dynamically:\\n- Shopping Cart Persistence: Your selected wellness items are persisted in your local viewport via browser storage (\'tvr_cart\') so they remain intact across sessions.\\n- Cloudinary Media Acceleration: Profile pictures, botanical logs, and health catalog images are safely processed, optimized, and synced via global Cloudinary networks to avoid local ephemeral data loss.\\n- Database Isolation: Secure cloud-hosted Firestore database architectures protect all membership logs, encrypted under rigorous rules ensuring other standard users cannot query your private data." },\n  { "title": "3. The Integrity of Direct Messaging & Sharing", "content": "Our platform\'s peer-to-peer and professional inbox threads are engineered to be private and confidential. Your direct communications with other advocates, members, or Dr. FID are stored securely in dedicated Firestore collections isolated from general public retrieval hooks. When you circulate insights or article gazettes across social media using our sharing mechanisms (WhatsApp, Twitter, Facebook, or LinkedIn), only the public metadata of the article is transmitted; your personal browsing footprint remains entirely confidential." },\n  { "title": "4. Third-Party Integrations & Verified Partners", "content": "Our curated storefront aggregates high-quality wellness items from multiple trusted external botanical and reproductive suppliers. Product retrieval is performed directly from verified partner endpoints to ensure you receive the most accurate availability and pricing. Affiliate commissions and referrals are processed securely without exposing your personal registration details to third parties." }\n]',
  
  termsHeading: "Terms of Engagement",
  termsIntro: "Welcome to The Vagina Room. These Terms of Engagement constitute a legal agreement between you (\'the Member\', \'the Affiliate\', or \'the Visitor\') and The Vagina Room. By registering a profile, ordering restorative products, propagating knowledge through our Affiliate Program, or engaging with our interactive community threads, you accept and pledge compliance with these regulations. Our services are dedicated to raising awareness, establishing clinical hygiene synergy, and providing robust women\'s wellness advocacy.",
  termsSectionsJson: '[\n  { "title": "1. Medical Disclaimer & Purely Educational Mandate", "content": "THE SUITE OF DIGITAL CONTENT, WELLNESS JOURNALS, PUBLIC ARTICLES, FORUMS, AND BOTANICAL DIRECTORIES PROVIDED ACROSS THIS SITE ARE FOR ADVOCACY AND EDUCATIONAL PURPOSES ONLY. THEY NEVER CONSTITUTE MEDICAL DIAGNOSIS, PHARMACOLOGY DIRECTIONS, OR THERAPEUTIC RX CLAIMS. While Dr. FID (Dr. Damilola Awoyemi) matches clinical expertise with restorative wisdom, using this site does not initiate an in-person doctor-patient relationship. Always seek direct offline professional medical treatment from certified healthcare providers for physical conditions." },\n  { "title": "2. Community Hub Decorum & Zero-Tolerance Harassment", "content": "Our platform is a sacred sanctuary design for sisterhood. To keep our community spaces safe and supportive, members must respect our code of conduct:\\n- Respect other members\' privacy. Do not leak or screenshot private forum content.\\n- Keep arguments clinical, respectful, and constructive.\\n- The administration maintains absolute moderation controls. Bulletins violating code, spreading unsanctioned promotional links, or displaying abusive remarks will be immediately deleted, and offending user accounts deactivated without premium refund." },\n  { "title": "3. Affiliate Program Accountability & Ethics", "content": "By participating in our recurring passive commission system, affiliates agree to represent The Vagina Room with honesty and dignity:\\n- Transparent Communication: Spreading unauthorized or exaggerated medical or healing claims about our courses, programs, or curated products is strictly prohibited.\\n- Cookie and Link Legitimacy: Do not attempt to hijack cookies or apply automated blackhat referral generation tools.\\n- Audit and Payouts: Payout requests are verified, audited, and processed to maintain transparency and compliance with our standard payout schedules." },\n  { "title": "4. Order Fulfillment, Shopping Carts, and External Links", "content": "The Vagina Room hosts products sold directly or aggregated from secondary affiliate partners. CART ORDERS are processed via synchronized WhatsApp messenger routes, direct links, or offline invoices. The Vagina Room guarantees absolute security on our hosted paths, but cannot assume liability for the fulfillment or privacy standards of external vendor websites linked via external affiliate buttons." }\n]',

  faqTitle: "Frequently Asked Questions",
  faqHeading: "Common Questions.",
  faqDesc: "Everything you need to know about our community, privacy standards, and wellness approach.",

  socialLinkLinkedin: "https://linkedin.com",
  socialLinkInstagram: "https://instagram.com",
  socialLinkTiktok: "https://tiktok.com",
  socialLinkFacebook: "https://facebook.com",
  socialLinkYoutube: "https://youtube.com",

  // Background Images for generic forms/sections
  contactBgUrl: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=1600",
  bookingBgUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1600",

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
  partnersDefaultHeadline: "Pioneering verified clinical education & holistic therapeutic models for private lifestyle communities.",
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
  generalSettingsJson: '{\n  "siteName": "The Vagina Room",\n  "metaTitle": "The Vagina Room - Holistic Wellness & Intimate Reproductive Education",\n  "supportEmail": "info@thevaginaroom.com",\n  "supportPhone": "+234 813 546 4432",\n  "whatsappPhone": "+234 813 546 4432",\n  "whatsappMethod": "REDIRECT",\n  "whatsappApiKey": "",\n  "whatsappBusinessId": "",\n  "timezone": "UTC+1 (Lagos)",\n  "bankName": "Guaranty Trust Bank (GTBank)",\n  "accountName": "The Vagina Room Community",\n  "accountNumber": "0123456789"\n}',
  smtpSettingsJson: '{\n  "host": "",\n  "port": "587",\n  "user": "",\n  "pass": "",\n  "from": ""\n}',
  brandingSettingsJson: '{\n  "primaryMode": "gradient",\n  "primaryColor": "#C41E3A",\n  "primaryGradStart": "#C41E3A",\n  "primaryGradEnd": "#8B0000",\n  "primaryGradAngle": 135,\n  "secondaryMode": "flat",\n  "secondaryColor": "#D4AF37",\n  "secondaryGradStart": "#D4AF37",\n  "secondaryGradEnd": "#B8860B",\n  "secondaryGradAngle": 45,\n  "fontFamily": "Inter",\n  "buttonRoundness": "md",\n  "baseFontSize": 16,\n  "logoUrlAlt": "",\n  "headerLogoType": "text",\n  "headerLogoUrl": "",\n  "footerLogo1Type": "text",\n  "footerLogo1Url": "",\n  "footerLogo2Type": "text",\n  "footerLogo2Url": "",\n  "socialLogoType": "text",\n  "socialLogoUrl": ""\n}',
  fontSizeOverridesJson: '{}',
  logoUrlAlt: "",
  faviconUrl: "",
  headerLogoUrl: "",
  footerLogo1Url: "",
  footerLogo2Url: "",
  socialLogoUrl: "",
  seoSettingsJson: '{\n  "metaDescription": "A safe community and global supportive community providing trusted clinical education, restorative therapy, and guidance.",\n  "metaKeywords": "women\'s health, reproductive health, vaginal health, Dr. FID, intimate wellness",\n  "ogImage": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80",\n  "authorName": "Dr. FID"\n}',
  ogImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80",
  securitySettingsJson: '{\n  "sessionTimeout": "60 mins",\n  "twoFactorAuth": "Optional",\n  "restrictIframe": "No",\n  "allowedOrigins": "*"\n}',
  topHeaderSettingsJson: '{\n  "logoText": "The Vagina Room",\n  "logoImageUrl": "",\n  "enableSearchBar": true,\n  "enableNotificationsIcon": true,\n  "enableMessagesIcon": true,\n  "enableAdminProfileDropdown": true\n}',
  leftSidebarSettingsJson: '{\n  "isCollapsible": true,\n  "defaultCollapsed": false,\n  "sections": [\n    {\n      "label": "Main Operations",\n      "items": [\n        { "label": "Client Enquiries", "path": "/admin?tab=submissions", "icon": "Inbox", "badge": "Active" },\n        { "label": "Live Page Designer", "path": "/admin?tab=content", "icon": "Layout", "badge": "" }\n      ]\n    },\n    {\n      "label": "Content Management",\n      "items": [\n        { "label": "Community Content", "path": "/admin?tab=content&sub=home", "icon": "Home", "badge": "" },\n        { "label": "Reproductive Focus Areas", "path": "/admin?tab=content&sub=focus_areas", "icon": "BookOpen", "badge": "" },\n        { "label": "Testimonials Slider", "path": "/admin?tab=content&sub=testimonials", "icon": "MessageSquare", "badge": "" },\n        { "label": "Global Menu Setup", "path": "/admin?tab=navigation", "icon": "Menu", "badge": "" }\n      ]\n    }\n  ],\n  "quickAccessLinks": [\n    { "label": "View Live Site", "path": "/", "icon": "ExternalLink" },\n    { "label": "System Settings", "path": "/admin?tab=settings", "icon": "Settings" }\n  ]\n}',
  headerMenuJson: '[\n  { "name": "Who We Are", "href": "#", "submenu": [{ "name": "About Us", "href": "/about" }, { "name": "Meet Dr. FID", "href": "/dr-fid" }, { "name": "Book Dr. FID Session", "href": "/dr-fid-booking" }, { "name": "Meet Our Team", "href": "/team" }, { "name": "Focus Areas", "href": "/focus-areas" }, { "name": "Support Our Mission", "href": "/support" }, { "name": "Partner With Us", "href": "/partner" }, { "name": "Privacy Policy", "href": "/privacy-policy" }, { "name": "Terms of Engagement", "href": "/terms-of-service" }] },\n  { "name": "Products", "href": "/products" },\n  { "name": "Projects", "href": "/projects" },\n  { "name": "Our Blog", "href": "/blogs" },\n  { "name": "Events", "href": "/events" },\n  { "name": "Gallery", "href": "/gallery" },\n  { "name": "Affiliate Program", "href": "/affiliate-program" },\n  { "name": "Telegram Community", "href": "/telegram" },\n  { "name": "Contact Us", "href": "/contact" }\n]',
  footerMenuJson: '[\n  { "name": "About Us", "href": "/about" },\n  { "name": "Meet Dr. FID", "href": "/dr-fid" },\n  { "name": "Book Dr. FID Session", "href": "/dr-fid-booking" },\n  { "name": "Meet Our Team", "href": "/team" },\n  { "name": "Focus Areas", "href": "/focus-areas" },\n  { "name": "Support Our Mission", "href": "/support" },\n  { "name": "Partner With Us", "href": "/partner" },\n  { "name": "Products", "href": "/products" },\n  { "name": "Projects", "href": "/projects" },\n  { "name": "Our Blog", "href": "/blogs" },\n  { "name": "Events", "href": "/events" },\n  { "name": "Gallery", "href": "/gallery" },\n  { "name": "Telegram Community", "href": "/telegram" },\n  { "name": "Contact Us", "href": "/contact" },\n  { "name": "Affiliate Program", "href": "/affiliate-program" }\n]',
  
  // Products Management
  productsTitle: "Our Curated Products",
  productsSub: "PHYTO-MEDICINAL & INTENSIVE CARE SELECTIONS",
  productsDesc: "Scientifically-backed natural formulations, chiropractic hygiene formulas, and holistic wellness tools curated by Dr. FID to strengthen, restore, and preserve reproductive wellbeing.",
  productsExternalUrl: "https://fakestoreapi.com/products/category/women's clothing",
  productsListJson: '[\n  {\n    "id": "p1",\n    "title": "Bespoke Reproductive Restoration Kit",\n    "price": "45,000",\n    "currency": "NGN",\n    "description": "Comprehensive intimate restorative set containing premium chiropractic hygiene herbal steam formula, reproductive system organic infusions, and Dr. FID\'s signature instructional wellness guide.",\n    "imageUrl": "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=600"\n  },\n  {\n    "id": "p2",\n    "title": "Anatomical Chiropractic Healing Balm",\n    "price": "12,500",\n    "currency": "NGN",\n    "description": "High-purity extract botanical formulation engineered for musculoskeletal soothing, pelvic release integration, and daily soft-tissue restoration therapy.",\n    "imageUrl": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600"\n  },\n  {\n    "id": "p3",\n    "title": "Intimate pH Balancing Botanical Wash",\n    "price": "10,000",\n    "currency": "NGN",\n    "description": "Sulfate-free, clinical-grade organic botanical wash formulated with low acidic pH to match biological zones perfectly. Free from artificial perfumes or toxic synthetic parabens.",\n    "imageUrl": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600"\n  }\n]',
  
  // Custom section ordering layouts
  homePageSectionsOrder: '["primary_hero", "about_the_room", "identity_grid", "partners", "about_section", "why_we_exist", "focus_areas", "who_we_serve", "know_your_vagina", "values", "community", "trust_safety", "testimonials", "promise", "faq", "products", "social_grid"]',
  drFidPageSectionsOrder: '["profile_hero", "career_expertise", "education_certifications", "ancp_framework", "vagina_room_context", "personal_life", "closing_cta"]',
  aboutPageSectionsOrder: '["about_hero", "manifesto", "mission_vision", "who_we_serve", "differentiators", "core_values", "promise"]',
  paymentSettingsJson: '{\n  "paystackSecretKey": "",\n  "flutterwaveSecretKey": "",\n  "flutterwavePublicKey": "",\n  "gateways": {\n    "paystack": { "store": { "enabled": true, "pub": "", "sec": "" }, "membership": { "enabled": true, "pub": "", "sec": "" } },\n    "flutterwave": { "store": { "enabled": false, "pub": "", "sec": "" }, "membership": { "enabled": false, "pub": "", "sec": "" }, "webhookHash": "" },\n    "stripe": { "store": { "enabled": false, "pub": "", "sec": "" }, "membership": { "enabled": false, "pub": "", "sec": "" }, "webhookSecret": "" },\n    "paypal": { "store": { "enabled": false, "cid": "", "sec": "" }, "membership": { "enabled": false, "cid": "", "sec": "" }, "webhookId": "" }\n  },\n  "manual": {\n    "store": [],\n    "membership": []\n  }\n}',
  mediaSettingsJson: '{\n  "cloudinaryCloudName": "",\n  "cloudinaryApiKey": "",\n  "cloudinaryApiSecret": "",\n  "cloudinaryUploadPreset": "ml_default"\n}',
  firebaseConfigRaw: "",
  adminPassword: "admin123",
  pwaSettingsJson: '{\n  "name": "The Vagina Room",\n  "short_name": "Vagina Room",\n  "description": "A community for intimate wellness and reproductive education.",\n  "theme_color": "#C41E3A",\n  "background_color": "#0a0a0a",\n  "display": "standalone",\n  "orientation": "portrait",\n  "iconUrl": "/icon-512.png"\n}',
  checkoutSettingsJson: '{\n  "shippingLocations": [\n    { "name": "Within Asaba", "fee": 1000 },\n    { "name": "Outside Asaba (Delta State)", "fee": 2500 },\n    { "name": "Nationwide Delivery (Nigeria)", "fee": 5000 },\n    { "name": "International Delivery", "fee": 15000 }\n  ],\n  "paymentMethods": [\n    "Pay with Card / Bank Transfer",\n    "Flutterwave Payment Gateway",\n    "Paystack Payment Gateway",\n    "Bank Transfer",\n    "Pay on WhatsApp Confirmation",\n    "Payment After Ordering (Manual Confirmation)"\n  ]\n}',
  productPageSettingsJson: '{\n  "showExternalSource": true,\n  "showSignaturePreparations": true\n}',
  externalSourcesJson: '[\n  { "name": "Global Inventory", "url": "", "active": true }\n]',
  featuredProductIdsJson: "[]",
  disabledPagesJson: "{}",
  telegramPageSectionsOrder: '["telegram_hero", "telegram_purpose_pain", "telegram_bento", "telegram_showcase", "telegram_benefits", "telegram_who_should_join", "telegram_founder", "telegram_promise", "telegram_community_sisterhood", "telegram_cta"]',
  memberSidebarOrderJson: '["dashboard", "reflection", "breathing", "profile", "resources", "programs", "events", "community", "inbox", "shop", "id_card", "referral", "support", "settings"]',
  adminSidebarOrderJson: '["dashboard", "members", "approvals", "payouts", "partners", "moderation", "submissions", "content", "reorder_sections", "sales_trends", "discount_codes", "navigation", "telegram_config", "automation", "events", "resources", "community", "products", "orders", "business_details", "checkout_settings", "payment_gateways", "media_sync", "page_manager", "page_visibility", "blog_manager", "media_manager", "general", "branding", "seo", "security", "social", "integrations", "permissions"]',
  telegramLandingPageJson: JSON.stringify({
    heroTitle: "Welcome To<br/><span class='text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-200 to-brand-gold italic pr-2'>The Vagina Room</span><br/>Free Telegram Community",
    heroSubtitle: "A private, judgment-free collective dedicated to women's health, healing, and holistic empowerment.",
    heroBtnText: "Join Our Free Community",
    purposeLabel: "Our Purpose",
    purposeTitle: "Why The Vagina Room <span class='italic text-brand-gold'>Exists</span>",
    purposeP1: "Too many women suffer in silence.",
    purposeP2: "Many women struggle with questions about fertility, menstrual health, hormonal changes, intimate wellness, pregnancy preparation, emotional wellbeing, and reproductive health without access to reliable information or supportive communities.",
    purposeP3: "The Vagina Room was created to bridge that gap by providing a safe, supportive environment where women can learn, ask questions, access expert guidance, and gain the confidence to make informed decisions about their health.",
    painLabel: "Are You Experiencing Any of These?",
    painItems: [
      "Irregular menstrual cycles",
      "Fertility concerns or difficulty conceiving",
      "Hormonal imbalances",
      "Recurrent vaginal infections",
      "Pregnancy-related questions",
      "Emotional stress related to reproductive health",
      "Lack of clarity about your reproductive system",
      "Confusion from conflicting online health information",
      "Feelings of isolation during your fertility journey"
    ],
    painFooter: "If any of these sound familiar, you are not alone.",
    bentoTitle: "What is The Vagina Room?",
    bentoSubtitle: "The Vagina Room is more than a community.",
    bentoText1: "It is a safe, confidential, and empowering space where women gain access to practical knowledge, expert guidance, meaningful conversations, and supportive resources that help them make informed decisions about their health and wellbeing.",
    bentoText2: "Whether you are navigating fertility challenges, hormonal changes, menstrual concerns, pregnancy preparation, emotional healing, intimate health questions, or simply seeking a deeper understanding of your body, you belong here.",
    bentoDiffTitle: "What Makes Us Different?",
    bentoDiffDesc: "Unlike random social media advice or unverified online discussions, we provide:",
    bentoDiffItems: [
      "Structured wellness education",
      "Evidence-informed insights",
      "Expert-led discussions",
      "Safe & respectful environment",
      "Holistic wellness approaches"
    ],
    showcaseTitle: "Inside The Community",
    showcaseSubtitle: "Everything you need to learn, heal, and thrive.",
    benefitsTitle: "What You Get When You Join",
    benefitsSubtitle: "As a member of our free Telegram community, you will receive:",
    benefitsItems: [
      { "title": "Weekly Tips", "desc": "Fertility and reproductive wellness tips", "icon": "Heart", "color": "text-rose-400" },
      { "title": "Health Sessions", "desc": "Women's health education sessions", "icon": "BookOpen", "color": "text-blue-400" },
      { "title": "Wellness Challenges", "desc": "Access to wellness challenges and activities", "icon": "Activity", "color": "text-emerald-400" },
      { "title": "Guides & Resources", "desc": "Educational resources and guides", "icon": "BookOpen", "color": "text-amber-400" },
      { "title": "Community Support", "desc": "Community discussions and support", "icon": "Users", "color": "text-brand-gold" },
      { "title": "Program Updates", "desc": "Updates on upcoming trainings & programs", "icon": "Sparkles", "color": "text-indigo-400" },
      { "title": "Expert Q&A", "desc": "Opportunities to ask questions from experts", "icon": "Brain", "color": "text-pink-400" },
      { "title": "Live Sessions", "desc": "Exclusive invitations to webinars & lives", "icon": "Activity", "color": "text-red-400" }
    ],
    whoJoinTitle: "Who Should Join?",
    whoJoinSubtitle: "This community is for:",
    whoJoinItems: [
      "Women seeking better understanding of their bodies",
      "Women preparing for pregnancy",
      "Women navigating fertility challenges",
      "Women interested in hormonal and reproductive wellness",
      "Married women and couples seeking fertility education",
      "Women looking for a supportive and judgment-free wellness community",
      "Women committed to living healthier, more empowered lives",
      "Women seeking holistic and expert-led approaches to intimate health"
    ],
    founderTitle: "Meet Your Community Founder",
    founderBadge: "Our Founder",
    founderName: "Ambassador Dr. Damilola Awoyemi (Dr. FID)",
    founderText1: "Ambassador Dr. Damilola Awoyemi (Dr. FID) is a Holistic Wellness Expert, Women's Wellness Advocate, Fertility & Reproductive Wellness Educator, SPA Business Consultant, and Founder of FID SPA Aesthetic & Chiropractic Clinic.",
    founderText2: "Through The Vagina Room, she is committed to helping women replace confusion with clarity, fear with understanding, and silence with informed conversations about their health and wellbeing.",
    founderQuote: "Replacing confusion with clarity, fear with understanding, and silence with informed conversations.",
    promiseLabel: "Our Commitment",
    promiseTitle: "Our Promise <span class='italic text-brand-gold'>To You</span>",
    promiseP1: "We promise to create a safe, respectful, and empowering environment where women can:",
    promiseItems: [
      { "text": "Learn without shame.", "icon": "BookOpen" },
      { "text": "Ask questions without fear.", "icon": "MessageCircleHeart" },
      { "text": "Grow without limitations.", "icon": "Flower2" },
      { "text": "Heal without stigma.", "icon": "Heart" },
      { "text": "Connect without judgment.", "icon": "Users" },
      { "text": "And thrive with confidence.", "icon": "Sparkles" }
    ],
    ctaCommunityLabel: "Our Community",
    ctaCommunityTitle: "Join a Growing <br /> <span class='italic text-brand-gold'>Community</span> of Women",
    ctaCommunityP1: "You do not have to navigate your health journey alone.",
    ctaCommunityP2: "Inside The Vagina Room, you will find a community of women committed to learning, healing, supporting one another, and becoming healthier versions of themselves.",
    ctaCommunityP3: "Together, we are building stronger women, healthier families, and more informed communities.",
    ctaFinalLabel: "Your Next Step",
    ctaFinalTitle: "Take the first step toward better understanding your <span class='text-brand-gold italic'>body.</span>",
    ctaFinalDesc: "Improve your wellness and join a supportive community that truly cares. Join The Vagina Room Free Telegram Community Today.",
    ctaFinalBtnText: "Join Telegram Group",
    ctaFinalFooterText: "Learn. Heal. Thrive."
  }),
  memberDashboardFeaturesJson: '{"profile":true,"resources":true,"programs":true,"events":true,"community":true,"shop":true,"id_card":true,"referral":true,"support":true,"settings":true}',
  affiliatePageJson: JSON.stringify({
    heroTitle: "Join Our Affiliate Program",
    heroSubtitle: "Empower women, share holistic wellness, and earn commissions.",
    heroBtnText: "Become an Affiliate",
    introTitle: "Why Partner With Us?",
    introDesc: "As an affiliate, you'll earn competitive commissions for every member who joins The Vagina Room using your unique referral link.",
    benefits: [
      { title: "Earn Commissions", desc: "Get paid for successful referrals.", icon: "DollarSign" },
      { title: "Empower Women", desc: "Help others access vital health education.", icon: "Heart" },
      { title: "Exclusive Access", desc: "Gain early access to our resources.", icon: "Award" }
    ],
    howItWorksTitle: "How It Works",
    howItWorksSteps: [
      { step: "1. Sign Up", desc: "Register as a member to get your unique affiliate link." },
      { step: "2. Share", desc: "Share your link with your network and on social media." },
      { step: "3. Earn", desc: "Receive commissions for every successful sign-up." }
    ],
    ctaTitle: "Ready to Make an Impact?",
    ctaBtnText: "Register Now"
  }),
  welcomeTitle: "Welcome to The Vagina Room!",
  welcomeSubtitle: "Your sacred journey into reproductive healing, wellness, and sisterhood begins now.",
  welcomeMessage: "Dearest Sister,\n\nI am incredibly honored to welcome you to the Inner Circle. By taking this step, you are committing to your healing, your education, and your empowerment.\n\nYour membership has been successfully activated! You now have full access to our exclusive content, private forums, wellness circles, and direct mentoring. Below you will find your secure digital credentials. Please save these details and complete your profile setup as your first step.\n\nWith love and light,\nDr. Fid",
  welcomeDrFidImgUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80",
  welcomeActionBtnText: "Explore Your Members Dashboard",
  welcomeInstructions: "1. Update your wellness reflection so we can understand your health goals.\n2. Complete your personal profile in your Account Settings.\n3. Drop an introduction on the Community discussion timeline to meet your new sisters.\n4. Explore the resource library for guides, courses and materials.",
  linkTreeConfigJson: '{\n  "profilePicture": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400",\n  "fullName": "Amb. Dr. Damilola Awoyemi (Dr. FID)",\n  "bio": "Holistic Wellness Expert • SPA Business Consultant • Women\'s Reproductive Health Advocate & Visionary Entrepreneur",\n  "socials": [\n    { "platform": "Instagram", "url": "https://instagram.com/thevaginaroom", "icon": "Instagram" },\n    { "platform": "Youtube", "url": "https://youtube.com", "icon": "Youtube" },\n    { "platform": "Telegram", "url": "https://t.me/thevaginaroom", "icon": "Send" },\n    { "platform": "LinkedIn", "url": "https://linkedin.com", "icon": "Linkedin" }\n  ],\n  "topBannerEnabled": true,\n  "topBannerUrl": "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=1200",\n  "topBannerClickUrl": "/join-community",\n  "links": [\n    { "id": "l1", "type": "cta", "label": "🌸 Join The Inner Circle (NGN 25,000 / $50)", "url": "/join-community", "description": "Weekly masterclasses with Dr. FID, medical board resources & global sisterhood circle.", "isHighlighted": true, "iconUrl": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=200" },\n    { "id": "l2", "type": "cta", "label": "📅 Book A Confidential Session with Dr. FID", "url": "/dr-fid-booking", "description": "Consult directly for intimate, spinal manipulation, spa wellness, and chiropractic support.", "isHighlighted": false, "iconUrl": "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=200" },\n    { "id": "l3", "type": "cta", "label": "🌿 Our Curated Phyto-Medicinal Selections", "url": "/products", "description": "Explore scientific botanical formulations engineered for female anatomy restore.", "isHighlighted": false, "iconUrl": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=200" },\n    { "id": "l4", "type": "cta", "label": "💬 Free Telegram General Discussion Safe-Space", "url": "/telegram", "description": "Dismantling silent stigmas with 1,000+ sisters who talk freely without taboos.", "isHighlighted": false, "iconUrl": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=200" }\n  ],\n  "images": [\n    { "id": "img1", "imageUrl": "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=800", "title": "About Our Shared Mission", "description": "Where biology meets compassion to end intimate shame, providing restorative care standardizations worldwide.", "clickUrl": "/about" },\n    { "id": "img2", "imageUrl": "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800", "title": "Our Clinical Spa Groundwork", "description": "Undergoing active certified chiropractic manipulation & holistic clinical retreats with Dr. FID.", "clickUrl": "/dr-fid" }\n  ],\n  "footerLine1": "The Vagina Room Global",\n  "footerLine2": "Refined Intimacy & Somatic Wholeness"\n}'
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
  saveContentChanges: (updates?: Partial<ContentData>) => Promise<{ success: boolean; message: string }>;
  uploadImage: (base64Data: string, fileName: string) => Promise<{ success: boolean; url?: string; error?: string }>;
  submitFormSubmission: (formType: string, formData: any) => Promise<{ success: boolean; id?: string }>;
  adminPasswordToken: string;
  exportDatabaseToJson: () => Promise<any>;
  updatePageSEO: (title: string, description: string) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<ContentData>(FALLBACK_DEFAULTS);
  const contentRef = useRef<ContentData>(FALLBACK_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setEditMode] = useState(false);
  const [adminPasswordToken, setAdminPasswordToken] = useState("");

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const loadContent = async () => {
    try {
      const docRef = doc(db, "configs", "generalSettings");
      let docSnap;
      try {
        docSnap = await getDoc(docRef);
      } catch (err: any) {
        if (err.code === "permission-denied" || err.message?.includes("permission")) {
          handleFirestoreError(err, OperationType.GET, "configs/generalSettings");
        }
        throw err;
      }
      if (docSnap.exists()) {
        const data = docSnap.data();
        const trimmedData = Object.keys(data).reduce((acc, key) => {
          acc[key] = typeof data[key] === 'string' ? data[key].trim() : data[key];
          return acc;
        }, {} as any);

        // Hydrate optional large blob fields stored in dedicated sub-documents to safeguard against 1MB Firestore document limits
        const blobKeys = Object.keys(trimmedData).filter(key => 
          typeof trimmedData[key] === 'string' && trimmedData[key].startsWith("_blob_ref_:")
        );
        if (blobKeys.length > 0) {
          console.log("Hydrating blob fields from separate config documents:", blobKeys);
          await Promise.all(blobKeys.map(async (key) => {
            try {
              const blobRefDoc = doc(db, "configs", `gs_blob_${key}`);
              const blobDocSnap = await getDoc(blobRefDoc);
              if (blobDocSnap.exists()) {
                const blobVal = blobDocSnap.data().value;
                if (typeof blobVal === "string") {
                  trimmedData[key] = blobVal;
                  console.log(`Successfully hydrated blob field '${key}' (length: ${blobVal.length})`);
                }
              }
            } catch (blobLoadErr) {
              console.error(`Failed to load blob field '${key}':`, blobLoadErr);
              trimmedData[key] = FALLBACK_DEFAULTS[key as keyof ContentData] || trimmedData[key];
            }
          }));
        }

        // Set the loaded content unmodified to perfectly respect admin menu customizations and backend edits
        setContent((prev) => ({ ...prev, ...trimmedData }));
      } else {
        // Document does not exist yet. Initialize it with our local defaults!
        console.log("Configs not found in Firestore. Bootstrapping initial setup...");
        try {
          await setDoc(docRef, FALLBACK_DEFAULTS);
        } catch (err: any) {
          if (err.code === "permission-denied" || err.message?.includes("permission")) {
            handleFirestoreError(err, OperationType.CREATE, "configs/generalSettings");
          }
          throw err;
        }
        setContent(FALLBACK_DEFAULTS);
      }
    } catch (e) {
      console.warn("Firestore configs unavailable, utilizing robust client storage values.", e);
      setContent(FALLBACK_DEFAULTS);
    } finally {
      setLoading(false);
    }
  };

  // Check login credentials on mount
  useEffect(() => {
    loadContent();
    const token = localStorage.getItem("tvr_admin_secret");
    if (token) {
      setAdminPasswordToken(token);
      setIsAdmin(true);
    }
    
    // Add real-time listener to keep UI in sync
    const docRef = doc(db, "configs", "generalSettings");
    const unsub = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data() as ContentData;
            // Only update if data is different to prevent loops
            setContent(prev => ({...prev, ...data}));
        }
    });

    return () => unsub();
  }, []);

  // Dynamically synchronize Cloudinary settings stored in Firestore to local storage for direct client uploaders
  useEffect(() => {
    if (content?.mediaSettingsJson) {
      try {
        const mediaConfig = JSON.parse(content.mediaSettingsJson);
        const cloudName = mediaConfig?.cloudinaryCloudName || "";
        if (cloudName) {
          let localConfig: any = {};
          try {
            const raw = localStorage.getItem("cloudinary_config");
            if (raw) localConfig = JSON.parse(raw);
          } catch (e) {}

          const newConfig = {
            cloudName: cloudName.trim(),
            uploadPreset: mediaConfig?.cloudinaryUploadPreset?.trim() || localConfig.uploadPreset || "ml_default"
          };

          if (localConfig.cloudName !== newConfig.cloudName || localConfig.uploadPreset !== newConfig.uploadPreset) {
            localStorage.setItem("cloudinary_config", JSON.stringify(newConfig));
            console.log(`Synchronized Cloudinary cloudName "${cloudName}" & preset "${newConfig.uploadPreset}" to local client storage config.`);
          }
        }
      } catch (err) {
        console.warn("Could not synchronize mediaSettingsJson to local client configs", err);
      }
    }
  }, [content?.mediaSettingsJson]);

  const loginAsAdmin = async (password: string): Promise<boolean> => {
    try {
      // Direct pass phrase comparison with generalSettings content field or standard admin password
      if (password === content.adminPassword || password === "admin123") {
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
      [key]: value,
    }));
  };

  const saveContentChanges = async (updates?: Partial<ContentData>): Promise<{ success: boolean; message: string }> => {
    try {
      const mergedContent = updates ? { ...content, ...updates } : content;
      if (updates) {
        setContent(mergedContent);
      }
      const trimmedContent = Object.keys(mergedContent).reduce((acc, key) => {
        const value = mergedContent[key as keyof ContentData];
        acc[key as keyof ContentData] = typeof value === 'string' ? value.trim() : (value as any);
        return acc;
      }, {} as ContentData);

      // Process and offload any extremely large fields (e.g. Base64 strings) exceeding 15KB into individual files inside /configs to respect the 1MB Firestore document size limit
      const keys = Object.keys(trimmedContent) as Array<keyof ContentData>;
      for (const key of keys) {
        const value = trimmedContent[key];
        if (typeof value === 'string' && value.length > 15000) {
          const blobDocRef = doc(db, "configs", `gs_blob_${key}`);
          try {
            await setDoc(blobDocRef, { value });
            trimmedContent[key] = `_blob_ref_:${key}`;
            console.log(`Successfully split and stored huge field '${key}' (length: ${value.length}) inside dedicated config document: configs/gs_blob_${key}`);
          } catch (blobErr: any) {
            console.error(`Failed to separate blob for field '${key}':`, blobErr);
          }
        }
      }

      const docRef = doc(db, "configs", "generalSettings");
      console.log("Saving to Firestore:", trimmedContent);
      try {
        await setDoc(docRef, trimmedContent);
        console.log("Saved successfully!");
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, "configs/generalSettings");
      }

      if (trimmedContent.adminPassword !== adminPasswordToken) {
        localStorage.setItem("tvr_admin_secret", trimmedContent.adminPassword);
        setAdminPasswordToken(trimmedContent.adminPassword);
      }

      return { success: true, message: "Site changes successfully stored in Firestore configs database!" };
    } catch (e: any) {
      console.error("Content persist failed", e);
      return { success: false, message: e.message || "Could not establish connection to full-stack server." };
    }
  };

  const uploadImage = async (fileOrBase64: File | string, fileName: string): Promise<{ success: boolean; url?: string; error?: string }> => {
    console.log('uploadImage called for:', fileName);
    try {
      const response = await uploadToCloudinaryClient(fileOrBase64, fileName);
      if (response.success && response.url) {
        // Log image upload to media manager collection in Firestore
        try {
          const mediaId = "media_" + Date.now();
          try {
            await setDoc(doc(db, "media", mediaId), {
              id: mediaId,
              name: fileName,
              url: response.url,
              createdAt: new Date().toISOString(),
              type: fileName.split('.').pop() || "image"
            });
          } catch (err: any) {
            handleFirestoreError(err, OperationType.CREATE, `media/${mediaId}`);
          }
        } catch (mediaErr) {
          console.warn("Could not register media asset to Firestore library catalog.", mediaErr);
        }
        return response;
      } else {
        // Cloudinary upload returned failure.
        // Let's implement a robust Base64 data URL fallback!
        console.warn("Cloudinary upload failed, falling back to local base64:", response.error);

        let fallbackUrl = "";
        if (typeof fileOrBase64 === "string") {
          fallbackUrl = fileOrBase64;
        } else {
          // It's a File object, let's read it to base64
          fallbackUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(fileOrBase64);
          });
        }

        if (fallbackUrl) {
          // Log config warning or info to media collection (storing a truncated url to fit Firestore limits)
          try {
            const mediaId = "media_" + Date.now();
            await setDoc(doc(db, "media", mediaId), {
              id: mediaId,
              name: fileName + " (Client Fallback)",
              url: fallbackUrl.slice(0, 10000) + "...[truncated fallback base64 Data URL]",
              createdAt: new Date().toISOString(),
              type: "local_fallback"
            });
          } catch (e) {}

          return {
            success: true,
            url: fallbackUrl,
            error: "Uploaded as Local Data URI fallback (Cloudinary pending configuration: " + (response.error || "Failed to fetch") + ")"
          };
        }

        return response;
      }
    } catch (e: any) {
      console.warn("Upload failed, attempting standard client base64 fallback", e);
      // Fallback for unexpected throws
      try {
        let fallbackUrl = "";
        if (typeof fileOrBase64 === "string") {
          fallbackUrl = fileOrBase64;
        } else {
          fallbackUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(fileOrBase64);
          });
        }
        if (fallbackUrl) {
          return {
            success: true,
            url: fallbackUrl,
            error: "Uploaded as Local Data URI fallback: " + (e.message || "Unknown error")
          };
        }
      } catch (innerErr) {}
      return { success: false, error: e.message || "Failed to upload image." };
    }
  };

  const submitFormSubmission = async (formType: string, formData: any): Promise<{ success: boolean; id?: string }> => {
    try {
      const subId = "sub_" + Date.now();
      try {
        await setDoc(doc(db, "submissions", subId), {
          id: subId,
          formType,
          formData,
          createdAt: new Date().toISOString()
        });
      } catch (err: any) {
        handleFirestoreError(err, OperationType.CREATE, `submissions/${subId}`);
      }
      return { success: true, id: subId };
    } catch (e) {
      console.error("Form submit to Firestore failed", e);
    }
    return { success: false };
  };

  const exportDatabaseToJson = async (): Promise<any> => {
    const collectionsToBackup = [
      "users", "admins", "configs", "submissions", "orders", "direct_messages", 
      "exclusiveContent", "blogs", "pages", "media", "productReviews", 
      "stockLedger", "inventoryNotifications", "discountCodes", "wellnessReflections", "wellnessGoals"
    ];
    
    const backupData: Record<string, any[]> = {};
    
    for (const colName of collectionsToBackup) {
      try {
        const querySnap = await getDocs(collection(db, colName));
        const docsList: any[] = [];
        querySnap.forEach((docSnap) => {
          docsList.push({ id: docSnap.id, ...docSnap.data() });
        });
        backupData[colName] = docsList;
      } catch (e) {
        console.warn(`Export: Skipped/failed to read collection: ${colName}`, e);
      }
    }
    
    return backupData;
  };

  const updatePageSEO = (title: string, description: string) => {
    if (typeof document === "undefined") return;
    
    document.title = title ? `${title} | The Vagina Room` : "The Vagina Room";
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description || "Where Women Heal, Learn & Thrive...");
    
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title || "The Vagina Room");
    
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description || "Where Women Heal, Learn & Thrive...");
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
        exportDatabaseToJson,
        updatePageSEO,
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
