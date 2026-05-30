import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { initializeApp as clientInitializeApp } from "firebase/app";
import { getFirestore as clientGetFirestore, collection as clientCollection, doc as clientDoc, getDoc as clientGetDoc, setDoc as clientSetDoc, addDoc as clientAddDoc, serverTimestamp as clientServerTimestamp } from "firebase/firestore";
import axios from "axios";
import nodemailer from "nodemailer";
import cors from "cors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();


// -- (Keep existing imports and setup) --
// ... (omitted)

// --- Added Payment Routes ---

// Generic payment initialization
// Moved routes below to ensure they are defined after app is initialized

// Load Firebase Config
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
let firebaseConfig: any = {};

if (process.env.FIREBASE_CONFIG) {
  try {
    firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
    console.log("[FIREBASE] Configuration loaded from FIREBASE_CONFIG environment variable.");
  } catch (error: any) {
    console.error("[FIREBASE] Failed to parse FIREBASE_CONFIG env variable:", error.message);
  }
} else if (fs.existsSync(firebaseConfigPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));
  console.log("[FIREBASE] Configuration loaded from local firebase-applet-config.json.");
}

// Initialize Firebase via Client SDK to avoid IAM permission limits on Cloud Run
let appInstance: any;
if (firebaseConfig && Object.keys(firebaseConfig).length > 0) {
  try {
    appInstance = clientInitializeApp(firebaseConfig);
    console.log("[FIREBASE] Firebase client initialized successfully.");
  } catch (e) {
    console.error("[FIREBASE] Init error (config exists but failed to load):", e);
  }
} else {
  console.log("[FIREBASE] Firebase config not detected. Running in standalone local mode. Content edits will write to internal disk.");
}

// Variables for global access
let db: any;
let contentColl: any;
let submissionsColl: any;
let ordersColl: any;
let currentDbId: string | null | undefined = undefined;
let isFirestoreAvailable = true;
let lastFirestoreError: string | null = null;

function initFirestore(databaseId?: string | null) {
  if (!appInstance) {
    isFirestoreAvailable = false;
    lastFirestoreError = "No Firebase App Instance (missing config)";
    console.log("[FIREBASE] Firestore not initialized (no appInstance), running in standalone mode.");
    return;
  }
  try {
    currentDbId = databaseId || firebaseConfig.firestoreDatabaseId;
    db = clientGetFirestore(appInstance, currentDbId);
    contentColl = clientCollection(db, "configs");
    submissionsColl = clientCollection(db, "submissions");
    ordersColl = clientCollection(db, "orders");
    console.log(`[FIREBASE] Firestore client prepared (db: ${currentDbId || "(default)"})`);
    isFirestoreAvailable = true; 
    lastFirestoreError = null;
  } catch (err: any) {
    isFirestoreAvailable = false;
    lastFirestoreError = err.message;
    console.warn(`[FIREBASE] Firestore client initialization failed for db ${databaseId || "(default)"}. Error: ${err.message}`);
  }
}

/**
 * Executes a Firestore operation with an automatic fallback to the default database
 * if the specific database is not found (Error 5).
 */
async function withFirestoreFallback<T>(operation: (coll: any) => Promise<T>): Promise<T> {
  // If we already know Firestore is completely unavailable, don't even try and throw an error that the caller can catch
  if (!isFirestoreAvailable || !contentColl) {
    const err = new Error(lastFirestoreError || "Firestore is currently unavailable or disabled.");
    (err as any).isFirestoreUnavailable = true;
    throw err;
  }
  
  try {
    return await operation(contentColl);
  } catch (err: any) {
    const isNotFound = err.message?.includes("NOT_FOUND") || err.code === 5 || err.message?.includes("database not found") || err.code === "not-found";
    const isPermissionDenied = err.message?.includes("PERMISSION_DENIED") || 
                               err.message?.toLowerCase().includes("permission") || 
                               err.message?.toLowerCase().includes("insufficient") ||
                               err.code === "permission-denied" ||
                               err.code === "PERMISSION_DENIED" ||
                               err.code === 7;
    
    // If it's a "database not found" error and we're currently using a specific database ID
    if (isNotFound && currentDbId !== null) {
      console.warn(`[FIREBASE] Database "${currentDbId}" not found. Falling back to the (default) database...`);
      initFirestore(null); // Switch to default
      
      if (!isFirestoreAvailable) {
        throw new Error("Firestore default database is also unavailable.");
      }

      // Try seeding the default database if it might be empty
      seedFirestore(); 
      
      // Retry the operation with the now-default contentColl
      try {
        return await operation(contentColl);
      } catch (retryErr: any) {
        if (retryErr.message?.includes("NOT_FOUND") || retryErr.code === 5 || retryErr.code === "not-found") {
          isFirestoreAvailable = false; // Even the default is missing
          lastFirestoreError = "Default database not found.";
          console.info("[FIREBASE] Default Firestore database not found. Moving to standalone flat-file mode.");
        }
        throw retryErr;
      }
    }
    
    if (isNotFound || isPermissionDenied) {
      isFirestoreAvailable = false;
      lastFirestoreError = err.message || err.code;
    }
    throw err;
  }
}

// Initial initialization attempt
initFirestore();

// Seed Firestore if it's empty and we have a connection
async function seedFirestore() {
  if (!isFirestoreAvailable || !contentColl) return;
  try {
    const dRef = clientDoc(contentColl, "global");
    const docSnap = await clientGetDoc(dRef);
    if (!docSnap.exists() && fs.existsSync(CONTENT_FILE)) {
      console.log(`[FIREBASE] Seeding local content into Firestore (db: ${currentDbId || "(default)"})...`);
      const localData = JSON.parse(fs.readFileSync(CONTENT_FILE, "utf8"));
      await clientSetDoc(dRef, localData, { merge: true });
      console.log("[FIREBASE] Seeding successful.");
    } else {
      console.log("[FIREBASE] Cloud content detected. Skipping initial seed.");
    }
  } catch (err: any) {
    const isNotFound = err.message?.includes("NOT_FOUND") || err.code === 5 || err.message?.includes("database not found") || err.code === "not-found";
    const isPermissionDenied = err.message?.includes("PERMISSION_DENIED") || 
                               err.message?.toLowerCase().includes("permission") || 
                               err.message?.toLowerCase().includes("insufficient") ||
                               err.code === "permission-denied" ||
                               err.code === "PERMISSION_DENIED" ||
                               err.code === 7;
    
    if (isNotFound) {
      if (currentDbId !== null) {
        console.warn("[FIREBASE] INITIAL seeding failed: Specific database not found, falling back to default database...");
        initFirestore(null); // Fallback to (default)
        seedFirestore(); // Retry once
      } else {
        isFirestoreAvailable = false;
        lastFirestoreError = "Default database missing.";
        console.info("[FIREBASE] Default Firestore database not found. Seeding skipped.");
      }
    } else if (isPermissionDenied) {
      isFirestoreAvailable = false;
      lastFirestoreError = "Permission Denied (Rules might not be deployed yet).";
      console.info("[FIREBASE] Permission denied during seeding. Proceeding with local fallback.");
    } else {
      console.warn("[FIREBASE] Could not check/seed Firestore:", err.message);
    }
  }
}
seedFirestore();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(cors());
app.use(express.json({ limit: "50mb" }));


// Paths for files
const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

// Ensure database files and directory exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Image upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Configure Cloudinary if credentials are provided in env
const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

if (useCloudinary) {
  cloudinary.config(cloudinaryConfig);
  console.log("[MEDIA] Cloudinary is configured and ready for file uploads.");
} else {
  console.log("[MEDIA] CRITICAL: Cloudinary credentials missing. Images will ONLY be stored locally and will BREAK after server restart.");
}

// --- API Routes ---

/**
 * MEDIA STATUS: Reports if cloud storage (Cloudinary) and persistence (Firestore) are ready.
 */
app.get("/api/media/status", async (req, res) => {
  res.json({
    cloudinary: {
      configured: useCloudinary,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || "Not Set"
    },
    firestore: {
      connected: isFirestoreAvailable,
      databaseId: currentDbId || "(default)",
      error: lastFirestoreError
    },
    localAssets: fs.existsSync(UPLOADS_DIR) ? fs.readdirSync(UPLOADS_DIR).filter(f => !f.startsWith('.')).length : 0
  });
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const content = await getLatestContent();
  let mediaConfig: any = {};
  try { mediaConfig = JSON.parse(content.mediaSettingsJson || "{}"); } catch(e) {}
  
  const cCloudName = mediaConfig.cloudinaryCloudName || process.env.CLOUDINARY_CLOUD_NAME;
  const cApiKey = mediaConfig.cloudinaryApiKey || process.env.CLOUDINARY_API_KEY;
  const cApiSecret = mediaConfig.cloudinaryApiSecret || process.env.CLOUDINARY_API_SECRET;
  
  const isCloudinarySet = !!(cCloudName && cApiKey && cApiSecret);

  if (isCloudinarySet) {
    try {
      // Re-configure cloudinary for this upload in case it changed
      cloudinary.config({
        cloud_name: cCloudName,
        api_key: cApiKey,
        api_secret: cApiSecret
      });
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "thevaginaroom",
      });
      // Delete the temporary local file as it's safe in the cloud
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("[MEDIA] Failed to delete temporary file:", err);
      }
      return res.json({ success: true, url: result.secure_url });
    } catch (error: any) {
      console.error("[MEDIA] Cloudinary upload failure:", error);
      // Fallback to local storage if Cloudinary upload fails
      const fileUrl = `/uploads/${req.file.filename}`;
      return res.json({ success: true, url: fileUrl, warning: "Uploaded locally because Cloudinary was unreachable: " + error.message });
    }
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

// Serve uploaded files statically
app.use("/uploads", express.static(UPLOADS_DIR));

// Define administrative default content
const DEFAULT_CONTENT = {
  // Page Hero
  heroWelcome: "WELCOME TO",
  heroHeading: "The Vagina Room",
  heroSub: "Where Women Heal, Learn & Thrive...",
  heroBtnText: "👉 Join The Community",
  heroBtnUrl: "https://join.thevaginaroom.com",
  heroBgUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80",

  // Meet Dr Fid
  drFidHeading: "MEET DR. FID",
  drFidBio1: "Ambassador Dr. Damilola Awoyemi, popularly known as Dr. FID, is a seasoned SPA Business Consultant, Holistic Wellness Expert, women’s wellness advocate and visionary entrepreneur committed to transforming lives through integrative healthcare, restorative therapy, and sustainable wellness enterprise development.",
  drFidBio2: "Through The Vagina Room, she is building a safe and empowering platform where women can access trusted education, emotional support, and holistic wellness guidance for their intimate and reproductive health journey.",
  drFidBio3: "Combining clinical expertise with compassionate care, she creates confidential spaces that help women gain clarity, confidence, healing, and a deeper understanding of their bodies and overall wellbeing.",
  drFidQuote: '"Restoring wellness, empowering women, and transforming lives through holistic healing and education."',
  drFidImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200",
  drFidPageImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200",

  // About details
  aboutTitle: "OUR MISSION & GROUNDWORK",
  aboutHeading: "A SANCTUARY FOR EVERY WOMAN'S HEALTH JOURNEY",
  aboutParagraph1: "We believe that women's reproductive and sexual wellness is a crucial aspect of healthcare. For far too long, conversations surrounding intimate anatomy, hormonal transitions, fertility, and sexual satisfaction have been shrouded in shame, silence, or clinical detachment.",
  aboutParagraph2: "The Vagina Room is building a sanctuary where biology meets compassion. We dismantle stigmas by providing accurate, science-backed education that empowers you to trust your body, navigate transitions, and find holistic restoration.",
  aboutImageUrl: "https://images.unsplash.com/photo-1518608046882-94d3fed0ae24?auto=format&fit=crop&q=80&w=1200",

  // Why We Exist (Promise)
  promiseHeading: "Our Unshakable Promise to Women",
  promiseText: "We hold ourselves to a gold standard of safety, integrity, and warmth. When you enter The Vagina Room, you enter a sphere of unfiltered truth, curated medicine, and genuine companionship.",

  // Contact page details
  contactAddress: "84 Okpanam Rd, opp. Legislative Quarters, GRA Phase I, Asaba, Delta State, Nigeria.",
  contactEmail: "info@thevaginaroom.com / support@thevaginaroom.com",
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

  // Support page details
  supportInvestLabel: "INVEST IN WELLNESS",
  supportHeading: "SUPPORT THE ROOM VISION",
  supportSub: "Your contributions fuel the groundwork of women's health restoration and community scaling.",
  supportFuelHeading: "FUELING THE RESTORATION",
  supportFuelDesc: "Every contribution directly impacts the quality and reach of the sanctuary. We prioritize rural outreach and Clinical Hygiene Standardizations.",
  supportClosingHeading: "WE ARE GRATEFUL FOR YOUR SUPPORT",
  supportClosingDesc: "EVERY CONTRIBUTION MATTERS. TOGETHER WE ARE BUILDING A NEW STANDARD FOR REPRODUCTIVE WELLNESS.",
  supportPaystackUrl: "https://paystack.com/pay/thevaginaroom",
  supportImpactStatsJson: "[]",

  // General settings
  footerCopyright: "© 2026 THE VAGINA ROOM. ALL RIGHTS RESERVED.",
  adminEmail: "admin@thevaginaroom.com",
  adminPassword: "admin123",

  // Testimonials
  testimonialsSub: "WHAT MEMBERS SAY",
  testimonialsTitle: "Testimonials.",
  testimonialsDesc: "Real stories of healing, empowerment, and restoration from women in our community.",
  testimonialsJson: "",

  partnersHeading: "As Seen In & Partnering Teams",
  partnersSub: "MEDIA & COLLEGIAL ALLIANCES",
  partnersLogosJson: '[\n  { "name": "BBC Africa", "imageUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300", "type": "Media Appearance", "link": "", "headline": "Exhibiting state-sanctioned advocacy of gynaecological education for indigenous West African women.", "impactYear": "2025" },\n  { "name": "BellaNaija Style", "imageUrl": "https://images.unsplash.com/photo-1618005198143-e5283b519a7f?auto=format&fit=crop&q=80&w=300", "type": "Media Appearance", "link": "", "headline": "Spotlighting high-fashion wellness integrations and Breaking Taboos around feminine anatomy wellness.", "impactYear": "2026" },\n  { "name": "Guardian Woman", "imageUrl": "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=80&w=300", "type": "Media Appearance", "link": "", "headline": "A comprehensive editorial on empowering women to discover clinical alternative therapies for recovery and rehabilitation.", "impactYear": "2024" },\n  { "name": "Punch Newspaper", "imageUrl": "https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&q=80&w=300", "type": "Media Appearance", "link": "", "headline": "Breaking reports on natural herbal therapeutic standardizations for modern African wellness models.", "impactYear": "2025" },\n  { "name": "Channels Television", "imageUrl": "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&q=80&w=300", "type": "Media Appearance", "link": "", "headline": "Live interview broadcasting standard methods of anatomical restoration and chiropractic hygiene practices.", "impactYear": "2026" },\n  { "name": "Holistic Health Initiative", "imageUrl": "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&q=80&w=300", "type": "Trusted Partner", "link": "", "headline": "Aligning certified professionals to strengthen capacity across the holistic reproductive wellness domain.", "impactYear": "Active" },\n  { "name": "Global Wellness Council", "imageUrl": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300", "type": "Trusted Partner", "link": "", "headline": "A strategic global wellness network validating complementaries and standardizing gynaecological spa guidelines.", "impactYear": "Active" }\n]',

  // Navigation Menu, Headers, and Settings Manager Schema
  generalSettingsJson: '{\n  "siteName": "The Vagina Room",\n  "metaTitle": "The Vagina Room - Holistic Wellness & Intimate Reproductive Education",\n  "supportEmail": "info@thevaginaroom.com",\n  "supportPhone": "+234 813 546 4432",\n  "whatsappPhone": "+234 813 546 4432",\n  "whatsappMethod": "REDIRECT",\n  "whatsappApiKey": "",\n  "whatsappBusinessId": "",\n  "timezone": "UTC+1 (Lagos)"\n}',
  productsTitle: "Our Curated Products",
  productsSub: "PHYTO-MEDICINAL & INTENSIVE CARE SELECTIONS",
  productsDesc: "Scientifically-backed natural formulations, chiropractic hygiene formulas, and holistic wellness tools curated by Dr. FID to strengthen, restore, and preserve reproductive wellbeing.",
  productsExternalUrl: "https://fakestoreapi.com/products/category/women's clothing",
  productsListJson: '[\n  {\n    "id": "p1",\n    "title": "Bespoke Reproductive Restoration Kit",\n    "price": "45,000",\n    "currency": "NGN",\n    "description": "Comprehensive intimate restorative set containing premium chiropractic hygiene herbal steam formula, reproductive system organic infusions, and Dr. FID\'s signature instructional wellness guide.",\n    "imageUrl": "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=600"\n  },\n  {\n    "id": "p2",\n    "title": "Anatomical Chiropractic Healing Balm",\n    "price": "12,500",\n    "currency": "NGN",\n    "description": "High-purity extract botanical formulation engineered for musculoskeletal soothing, pelvic release integration, and daily soft-tissue restoration therapy.",\n    "imageUrl": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600"\n  },\n  {\n    "id": "p3",\n    "title": "Intimate pH Balancing Botanical Wash",\n    "price": "10,000",\n    "currency": "NGN",\n    "description": "Sulfate-free, clinical-grade organic botanical wash formulated with low acidic pH to match biological zones perfectly. Free from artificial perfumes or toxic synthetic parabens.",\n    "imageUrl": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600"\n  }\n]',
  brandingSettingsJson: '{\n  "primaryMode": "gradient",\n  "primaryColor": "#C41E3A",\n  "primaryGradStart": "#C41E3A",\n  "primaryGradEnd": "#8B0000",\n  "primaryGradAngle": 135,\n  "secondaryMode": "flat",\n  "secondaryColor": "#D4AF37",\n  "secondaryGradStart": "#D4AF37",\n  "secondaryGradEnd": "#B8860B",\n  "secondaryGradAngle": 45,\n  "fontFamily": "Inter",\n  "buttonRoundness": "md",\n  "baseFontSize": 16,\n  "logoUrlAlt": ""\n}',
  fontSizeOverridesJson: '{}',
  faviconUrl: "",
  seoSettingsJson: '{\n  "metaDescription": "A safe sanctuary and global supportive community providing trusted clinical education, restorative therapy, and guidance.",\n  "metaKeywords": "women\'s health, reproductive health, vaginal health, Dr. FID, intimate wellness",\n  "ogImage": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80",\n  "authorName": "Dr. FID"\n}',
  securitySettingsJson: '{\n  "sessionTimeout": "60 mins",\n  "twoFactorAuth": "Optional",\n  "restrictIframe": "No",\n  "allowedOrigins": "*"\n}',
  topHeaderSettingsJson: '{\n  "logoText": "The Vagina Room",\n  "logoImageUrl": "",\n  "enableSearchBar": true,\n  "enableNotificationsIcon": true,\n  "enableMessagesIcon": true,\n  "enableAdminProfileDropdown": true\n}',
  leftSidebarSettingsJson: '{\n  "isCollapsible": true,\n  "defaultCollapsed": false,\n  "sections": [\n    {\n      "label": "Main Operations",\n      "items": [\n        { "label": "Client Enquiries", "path": "/admin?tab=submissions", "icon": "Inbox", "badge": "Active" },\n        { "label": "Live Page Designer", "path": "/admin?tab=content", "icon": "Layout", "badge": "" }\n      ]\n    },\n    {\n      "label": "Content Management",\n      "items": [\n        { "label": "Community Content", "path": "/admin?tab=content&sub=home", "icon": "Home", "badge": "" },\n        { "label": "Reproductive Focus Areas", "path": "/admin?tab=content&sub=focus_areas", "icon": "BookOpen", "badge": "" },\n        { "label": "Testimonials Slider", "path": "/admin?tab=content&sub=testimonials", "icon": "MessageSquare", "badge": "" }\n      ]\n    }\n  ],\n  "quickAccessLinks": [\n    { "label": "View Live Site", "path": "/", "icon": "ExternalLink" },\n    { "label": "System Settings", "path": "/admin?tab=settings", "icon": "Settings" }\n  ]\n}',
  pwaSettingsJson: '{\n  "name": "The Vagina Room",\n  "short_name": "Vagina Room",\n  "description": "A sanctuary for intimate wellness and reproductive education.",\n  "theme_color": "#C41E3A",\n  "background_color": "#0a0a0a",\n  "display": "standalone",\n  "orientation": "portrait",\n  "iconUrl": "/icon-512.png"\n}',
  contactBgUrl: "https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=1600",
  bookingBgUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1600"
};

// Ensure database files and directory exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Serve uploaded files statically across all environments (Vite and dist fallbacks)
app.use("/uploads", express.static(UPLOADS_DIR));

// Generic payment initialization
app.post("/api/payments/initialize", async (req, res) => {
  const { provider, amount, email, reference } = req.body;
  
  try {
    const content = await getLatestContent();
    let paymentConfig: any = {};
    try {
      paymentConfig = JSON.parse(content.paymentSettingsJson || "{}");
    } catch (e) {
      console.warn("[PAYMENT] Invalid Payment JSON config");
    }

    const paystackSecretKey = paymentConfig.paystackSecretKey || process.env.PAYSTACK_SECRET_KEY;
    const flutterwaveSecretKey = paymentConfig.flutterwaveSecretKey || process.env.FLUTTERWAVE_SECRET_KEY;

    if (provider === "paystack") {
      if (!paystackSecretKey) return res.status(500).json({ error: "Paystack config missing" });
      const response = await axios.post("https://api.paystack.co/transaction/initialize", {
        amount: Math.round(parseFloat(amount) * 100), // Paystack expects kobo/lowest unit
        email,
        reference
      }, {
        headers: { Authorization: `Bearer ${paystackSecretKey}` }
      });
      return res.json(response.data);
    } else if (provider === "flutterwave") {
      if (!flutterwaveSecretKey) return res.status(500).json({ error: "Flutterwave config missing" });
      const response = await axios.post("https://api.flutterwave.com/v3/payments", {
        amount,
        currency: "NGN",
        email,
        tx_ref: reference,
        redirect_url: process.env.URL + "/checkout/verify"
      }, {
        headers: { Authorization: `Bearer ${flutterwaveSecretKey}` }
      });
      return res.json(response.data);
    }
    
    return res.status(400).json({ error: "Invalid provider" });
  } catch (err: any) {
    console.error(`[PAYMENT] ${provider} initialization failed:`, err.response?.data || err.message);
    res.status(500).json({ error: `Failed to initialize ${provider}` });
  }
});

// Paystack Webhook
app.post("/api/payments/webhook/paystack", express.json({type: 'application/json'}), async (req, res) => {
  try {
    const content = await getLatestContent();
    let paymentConfig: any = {};
    try { paymentConfig = JSON.parse(content.paymentSettingsJson || "{}"); } catch (e) {}
    
    const paystackSecretKey = paymentConfig.paystackSecretKey || process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) return res.status(400).send("No secret key configured");

    const hash = req.headers["x-paystack-signature"];
    const computedHash = crypto.createHmac('sha512', paystackSecretKey).update(JSON.stringify(req.body)).digest('hex');

    if (hash !== computedHash) {
      console.warn("[PAYSTACK WEBHOOK] Invalid signature match");
      // Continue returning 200 optionally so it stops retrying, or 401
      return res.status(401).send("Invalid signature");
    }

    console.log("[PAYSTACK WEBHOOK] Verified processing event:", req.body.event);
    // Process successful payment logic here
    res.sendStatus(200);
  } catch (err) {
    console.error("[PAYSTACK WEBHOOK] Error:", err);
    res.sendStatus(500);
  }
});

// Flutterwave Webhook
app.post("/api/payments/webhook/flutterwave", express.json({type: 'application/json'}), async (req, res) => {
  try {
    const content = await getLatestContent();
    let paymentConfig: any = {};
    try { paymentConfig = JSON.parse(content.paymentSettingsJson || "{}"); } catch (e) {}
    
    const secretHash = paymentConfig.flutterwaveWebhookSecretHash || process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH;
    if (!secretHash) return res.status(400).send("No webhook hash configured");

    const hash = req.headers["verif-hash"];
    if (!hash || hash !== secretHash) {
      console.warn("[FLUTTERWAVE WEBHOOK] Invalid verif-hash");
      return res.status(401).send("Invalid hash");
    }

    console.log("[FLUTTERWAVE WEBHOOK] Verified processing event:", req.body.event);
    // Process successful payment logic here
    res.sendStatus(200);
  } catch (err) {
    console.error("[FLUTTERWAVE WEBHOOK] Error:", err);
    res.sendStatus(500);
  }
});

if (!fs.existsSync(CONTENT_FILE)) {
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(DEFAULT_CONTENT, null, 2), "utf8");
}

if (!fs.existsSync(SUBMISSIONS_FILE)) {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2), "utf8");
}

// ---------------------- HELPER FUNCTIONS ----------------------

async function getLatestContent() {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const data = fs.readFileSync(CONTENT_FILE, "utf8");
      const savedData = JSON.parse(data);
      // Ensure adminEmail and adminPassword exist
      return {
        ...DEFAULT_CONTENT,
        ...savedData,
      };
    }
  } catch (e) {
    console.error("[CONTENT] Failed to read content file:", e);
  }
  return DEFAULT_CONTENT;
}

async function checkAdminPassword(password: string): Promise<boolean> {
  const content = await getLatestContent();
  const adminPassword = (content.adminPassword !== undefined && content.adminPassword !== null) ? content.adminPassword : (process.env.ADMIN_PASSWORD || "admin123");
  return password === adminPassword;
}

async function sendConfirmationEmail(to: string, subject: string, html: string) {
  const content = await getLatestContent();
  let smtpConfig: any = {};
  try {
    smtpConfig = JSON.parse(content.smtpSettingsJson || "{}");
  } catch (e) {
    console.warn("[MAIL] Invalid SMTP JSON config");
  }
  
  const host = smtpConfig.host || process.env.SMTP_HOST;
  const port = parseInt(smtpConfig.port || process.env.SMTP_PORT || "587");
  const user = smtpConfig.user || process.env.SMTP_USER;
  const pass = smtpConfig.pass || process.env.SMTP_PASS;
  const from = smtpConfig.from || process.env.SMTP_FROM || user;

  if (!host || !user || !pass) {
      console.warn("[MAIL] SMTP configuration missing, email not sent.");
      return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false, 
    auth: {
      user,
      pass,
    },
  });

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    console.log(`[MAIL] Confirmation email sent to ${to}`);
  } catch (err) {
    console.error(`[MAIL] Failed to send email to ${to}:`, err);
  }
}

// ---------------------- API ROUTES ----------------------


// --- API Routes ---
app.get("/api/proxy-products", async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).json({ error: "No external products source URL specified." });
  }
  try {
    console.log(`[PROXY] Fetching external products from: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`External server responded with status: ${response.status}`);
    }
    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    console.error("[PROXY] Failed fetching external products:", err.message);
    return res.status(500).json({ error: "Failed to fetch external products", details: err.message });
  }
});

function migrateObsoleteIdentities(content: any) {
  if (!content) return content;
  const migrated = { ...content };
  if (migrated.identityLabel1 === "Holistic Wellness") migrated.identityLabel1 = "Speaker";
  if (migrated.identityLabel2 === "Integrative Therapy") migrated.identityLabel2 = "Trainer";
  if (migrated.identityLabel3 === "SPA Business Expert") migrated.identityLabel3 = "Coach";
  if (migrated.identityLabel4 === "Women’s Health" || migrated.identityLabel4 === "Women's Health") migrated.identityLabel4 = "Therapist";

  if (migrated.identitiesJson) {
    try {
      let arr = JSON.parse(migrated.identitiesJson);
      if (Array.isArray(arr) && arr.length > 0) {
        let modified = false;
        arr = arr.map((item: any) => {
          const label = item.label;
          let newLabel = label;
          if (label === "Holistic Wellness") { newLabel = "Speaker"; modified = true; }
          else if (label === "Integrative Therapy") { newLabel = "Trainer"; modified = true; }
          else if (label === "SPA Business Expert") { newLabel = "Coach"; modified = true; }
          else if (label === "Women’s Health" || label === "Women's Health") { newLabel = "Therapist"; modified = true; }
          return { ...item, label: newLabel };
        });
        if (modified) {
          migrated.identitiesJson = JSON.stringify(arr);
        }
      }
    } catch (e) {
      // safe fallback for parsing failure
    }
  }
  return migrated;
}

// Fetch editable site content
app.get("/api/content", async (req, res) => {
  try {
    // If we're already in standalone mode, skip Firestore attempt
    if (!isFirestoreAvailable) {
      throw new Error("Operating in standalone mode.");
    }

    const data = await withFirestoreFallback(async (coll) => {
      const docSnap = await clientGetDoc(clientDoc(coll, "global"));
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    });

    if (data) {
      return res.json(migrateObsoleteIdentities(data));
    }
    
    // Fallback if doc doesn't exist in Firestore
    if (fs.existsSync(CONTENT_FILE)) {
      const localData = fs.readFileSync(CONTENT_FILE, "utf8");
      return res.json(migrateObsoleteIdentities(JSON.parse(localData)));
    }
    
    res.json(migrateObsoleteIdentities(DEFAULT_CONTENT));
  } catch (err: any) {
    const isNotFound = err.message?.includes("NOT_FOUND") || err.code === 5 || err.message?.includes("database not found") || err.message?.includes("unavailable");
    const isStandalone = !isFirestoreAvailable || err.isFirestoreUnavailable;

    if (isStandalone || isNotFound) {
      // Just log once as info and then use fallback silenty
      if (err.message && !err.message.includes("standalone")) {
         console.info("[FIREBASE] Firestore unavailable, using local content fallback.");
      }
    } else {
      console.warn("[FIREBASE] Firestore fetch error:", err.message);
    }
    
    try {
      if (fs.existsSync(CONTENT_FILE)) {
        const localData = fs.readFileSync(CONTENT_FILE, "utf8");
        return res.json(migrateObsoleteIdentities(JSON.parse(localData)));
      }
      res.json(migrateObsoleteIdentities(DEFAULT_CONTENT));
    } catch (localErr: any) {
      res.status(500).json({ error: "Content loading failed", details: localErr.message });
    }
  }
});

// Save updated content
app.post("/api/content", async (req, res) => {
  const { password, content: rawContent } = req.body;
  if (!(await checkAdminPassword(password))) {
    return res.status(401).json({ error: "Unauthorized. Incorrect admin password." });
  }

  if (!rawContent) {
    return res.status(400).json({ error: "Missing updated content payload." });
  }

  // Intercept firebaseConfigRaw to update local firebase-applet-config.json
  if (rawContent.firebaseConfigRaw) {
    try {
      // Validate that it's actually valid JSON before saving.
      const parsed = JSON.parse(rawContent.firebaseConfigRaw);
      fs.writeFileSync("firebase-applet-config.json", JSON.stringify(parsed, null, 2), "utf8");
      
      // Update running config as well just in case, but usually requires restart
      if (!process.env.FIREBASE_CONFIG) {
         // Optionally you could try to reinit here, but we will let restart handle it fully
      }
    } catch(e) {
      console.error("[FIREBASE] Ignoring invalid json for firebaseConfigRaw", e);
    }
  }

  const content = migrateObsoleteIdentities(rawContent);

  // Always sync to local file for safety
  try {
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), "utf8");
  } catch (fsErr: any) {
    if (process.env.NODE_ENV !== "production") console.error("[STORAGE] Local sync failed:", fsErr);
  }

  try {
    await withFirestoreFallback(async (coll) => {
      await clientSetDoc(clientDoc(coll, "global"), content, { merge: true });
    });
    res.json({ success: true, message: "Content database saved to Firestore successfully!", content });
  } catch (err: any) {
    if (isFirestoreAvailable) {
      console.error("[FIREBASE] Firestore persist failed:", err.message);
    }
    res.json({ 
      success: true, 
      message: "Content saved to local server (Firestore sync failed).", 
      details: err.message,
      content 
    });
  }
});

// Admin Authentication Route
app.post("/api/login", async (req, res) => {
  const { password } = req.body;
  const content = await getLatestContent();
  const adminPassword = content.adminPassword || process.env.ADMIN_PASSWORD || "admin123";

  if (password === adminPassword) {
    res.json({ success: true, message: "Authentication successful." });
  } else {
    res.status(401).json({ success: false, error: "Incorrect password." });
  }
});

// Submit forms (contact / partnerships)
app.post("/api/submissions", async (req, res) => {
  const { formType, formData } = req.body;

  if (!formType || !formData) {
    return res.status(400).json({ error: "Missing form type or fields." });
  }

  const newSubmission = {
    timestamp: new Date().toISOString(),
    formType,
    data: formData,
  };

  try {
    if (!isFirestoreAvailable || !db) throw new Error("Firestore not available");
    
    try {
      const firebaseSubmission = {
        ...newSubmission,
        timestamp: clientServerTimestamp(),
      };
      const docRef = await clientAddDoc(submissionsColl, firebaseSubmission);
      
      // Send confirmation email if email is provided
      if (formData.email) {
        await sendConfirmationEmail(
          formData.email, 
          "Submission Received - The Vagina Room", 
          `<h1>Thank you for your submission</h1><p>We have received your ${formType} form. We will be in touch shortly.</p>`
        );
      }

      res.json({ success: true, message: "Submission captured successfully!", id: docRef.id });
    } catch (err: any) {
      const isNotFound = err.message?.includes("NOT_FOUND") || err.code === 5 || err.message?.includes("database not found");
      if (isNotFound && currentDbId !== null) {
        initFirestore(null);
        if (isFirestoreAvailable) {
           const firebaseSubmission = {
             ...newSubmission,
             timestamp: clientServerTimestamp(),
           };
           const docRef = await clientAddDoc(submissionsColl, firebaseSubmission);
           return res.json({ success: true, message: "Submission captured successfully (fell back to default DB)!", id: docRef.id });
        }
      }
      throw err;
    }
  } catch (err: any) {
    // Local fallback for submissions
    try {
      let submissions: any[] = [];
      if (fs.existsSync(SUBMISSIONS_FILE)) {
        try {
          submissions = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf8") || "[]");
        } catch (e) {
          console.error("[STORAGE] Invalid local submissions JSON, resetting:", e);
        }
      }
      const fallbackSubmission = { ...newSubmission, id: `local_${Date.now()}` };
      submissions.push(fallbackSubmission);
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), "utf8");
      
      if (isFirestoreAvailable) {
         console.warn("[FIREBASE] Submission Firestore save failed, using local fallback:", err.message);
      }
      res.json({ success: true, message: "Submission received (offline mode enabled)!", id: fallbackSubmission.id, localOnly: true });
    } catch (localErr: any) {
      res.status(500).json({ error: "Total submission failure", details: localErr.message });
    }
  }
});

// Fetch submissions (password protected)
app.get("/api/submissions", async (req, res) => {
  const password = req.query.password as string;

  if (!(await checkAdminPassword(password))) {
    return res.status(401).json({ error: "Unauthorized access denied." });
  }

  try {
    let submissions: any[] = [];

    if (isFirestoreAvailable && submissionsColl) {
      try {
        const { query: clientQuery, orderBy: clientOrderBy, getDocs: clientGetDocs } = await import('firebase/firestore');
        const q = clientQuery(submissionsColl, clientOrderBy("timestamp", "desc"));
        const snapshot = await clientGetDocs(q);
        submissions = snapshot.docs.map(doc => {
          const data = doc.data() as any;
          let tsStr = new Date().toISOString();
          if (data.timestamp && typeof data.timestamp.toDate === 'function') {
            tsStr = data.timestamp.toDate().toISOString();
          } else if (typeof data.timestamp === 'string') {
            tsStr = data.timestamp;
          }
          return {
            id: doc.id,
            ...data,
            timestamp: tsStr
          };
        });
      } catch (firestoreErr) {
        console.warn("[FIREBASE] Submissions fetch failed, checking local fallback:", firestoreErr instanceof Error ? firestoreErr.message : String(firestoreErr));
      }
    }

    // Merge or fallback to local submissions
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      try {
        const localSubmissions = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf8") || "[]");
        if (submissions.length === 0) {
          submissions = localSubmissions;
        } else {
          submissions = [...submissions, ...localSubmissions].sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        }
      } catch (e) {
        console.error("[STORAGE] Local submissions read failed:", e);
      }
    }

    res.json(submissions);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load submissions", details: err.message });
  }
});

// Delete a submission (admin access)
app.delete("/api/submissions/:id", async (req, res) => {
  const password = req.query.password as string;
  const { id } = req.params;

  if (!(await checkAdminPassword(password))) {
    return res.status(401).json({ error: "Unauthorized access denied." });
  }

  let deletedLocal = false;
  let deletedFirestore = false;
  let firestoreError = null;

  // 1. Try deleting from the local fallback file first
  if (fs.existsSync(SUBMISSIONS_FILE)) {
    try {
      const localSubmissions = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf8") || "[]");
      const filtered = localSubmissions.filter((sub: any) => sub.id !== id);
      if (filtered.length !== localSubmissions.length) {
        fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(filtered, null, 2), "utf8");
        deletedLocal = true;
      }
    } catch (e: any) {
      console.error("[STORAGE] Local submission delete failed:", e);
    }
  }

  // 2. Try deleting from Firestore if available and not a local ID
  if (isFirestoreAvailable && submissionsColl && !id.startsWith("local_")) {
    try {
      const { deleteDoc: clientDeleteDoc } = await import('firebase/firestore');
      await clientDeleteDoc(clientDoc(submissionsColl, id));
      deletedFirestore = true;
    } catch (err: any) {
      console.warn("[FIREBASE] Firestore submission delete failed:", err.message);
      firestoreError = err.message;
    }
  }

  if (deletedLocal || deletedFirestore || id.startsWith("local_")) {
    return res.json({ success: true, message: "Submission deleted successfully." });
  }

  if (firestoreError) {
    return res.status(500).json({ error: "Failed to delete from Firestore", details: firestoreError });
  }

  return res.json({ success: true, message: "Submission removed." });
});

// Create an order
app.post("/api/orders", async (req, res) => {
  const orderData = req.body;

  if (!orderData || !orderData.orderNo) {
    return res.status(400).json({ error: "Missing order information." });
  }

  const newOrder = {
    ...orderData,
    createdAt: orderData.createdAt || new Date().toISOString()
  };

  try {
    if (!isFirestoreAvailable || !db) throw new Error("Firestore not available");

    try {
      const firebaseOrder = {
        ...newOrder,
        timestamp: clientServerTimestamp()
      };
      const docRef = await clientAddDoc(ordersColl, firebaseOrder);
      res.json({ success: true, message: "Order logged successfully!", id: docRef.id });
    } catch (err: any) {
      console.warn("[FIREBASE] Firestore order write failed, trying fallback:", err.message);
      throw err;
    }
  } catch (err: any) {
    // Local fallback for orders
    try {
      let orders: any[] = [];
      if (fs.existsSync(ORDERS_FILE)) {
        try {
          orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8") || "[]");
        } catch (e) {
          console.error("[STORAGE] Invalid local orders JSON, resetting:", e);
        }
      }
      const localOrder = { ...newOrder, id: `local_${orderData.orderNo || Date.now()}` };
      orders.push(localOrder);
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
      
      res.json({ success: true, message: "Order recorded successfully (offline mode enabled)!", id: localOrder.id, localOnly: true });
    } catch (localErr: any) {
      res.status(500).json({ error: "Total order logging failure", details: localErr.message });
    }
  }
});

// Fetch orders (password protected)
app.get("/api/orders", async (req, res) => {
  const password = req.query.password as string;

  if (!(await checkAdminPassword(password))) {
    return res.status(401).json({ error: "Unauthorized access denied." });
  }

  try {
    let orders: any[] = [];

    if (isFirestoreAvailable && ordersColl) {
      try {
        const { query: clientQuery, orderBy: clientOrderBy, getDocs: clientGetDocs } = await import('firebase/firestore');
        const q = clientQuery(ordersColl, clientOrderBy("createdAt", "desc"));
        const snapshot = await clientGetDocs(q);
        orders = snapshot.docs.map(doc => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            ...data
          };
        });
      } catch (firestoreErr) {
        console.warn("[FIREBASE] Orders fetch failed, checking local fallback:", firestoreErr instanceof Error ? firestoreErr.message : String(firestoreErr));
      }
    }

    // Merge or fallback to local orders
    if (fs.existsSync(ORDERS_FILE)) {
      try {
        const localOrders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8") || "[]");
        if (orders.length === 0) {
          orders = localOrders;
        } else {
          const seenNos = new Set(orders.map(o => o.orderNo));
          const uniqueLocals = localOrders.filter((o: any) => !seenNos.has(o.orderNo));
          orders = [...orders, ...uniqueLocals];
        }
      } catch (e) {
        console.error("[STORAGE] Local orders read failed:", e);
      }
    }

    // Sort by date desc
    orders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load orders", details: err.message });
  }
});

// Media Sync Endpoint: Migrates local /uploads/ to Cloudinary
app.get("/api/admin/validate-cloudinary", async (req, res) => {
  const password = req.query.password as string;
  if (!(await checkAdminPassword(password))) {
    return res.status(401).json({ error: "Unauthorized access denied." });
  }

  if (!useCloudinary) {
    return res.status(400).json({ 
      success: false, 
      message: "Cloudinary is not configured in environment variables.",
      details: "Missing CLOUDINARY_CLOUD_NAME, API_KEY, or API_SECRET."
    });
  }

  try {
    // Try to ping cloudinary API
    const ping = await cloudinary.api.ping();
    res.json({ 
      success: true, 
      message: "Cloudinary Cloud Mirror is successfully configured and reachable.",
      details: ping
    });
  } catch (err: any) {
    res.status(500).json({ 
      success: false, 
      message: "Cloudinary configuration is invalid or unreachable.",
      details: err.message 
    });
  }
});

app.get("/api/admin/validate-firestore", async (req, res) => {
  const password = req.query.password as string;
  if (!(await checkAdminPassword(password))) {
    return res.status(401).json({ error: "Unauthorized access denied." });
  }

  if (!isFirestoreAvailable || !contentColl) {
    return res.status(400).json({ 
      success: false, 
      message: "Firestore is currently disconnected or in standalone mode.",
      details: lastFirestoreError || "Initialization failed."
    });
  }

  try {
    // Perform a test read/write
    const testRef = clientDoc(contentColl, "_system_test_");
    await clientSetDoc(testRef, { lastCheck: new Date().toISOString(), status: "validated" });
    const snap = await clientGetDoc(testRef);
    
    if (snap.exists()) {
      res.json({ 
        success: true, 
        message: "Firestore Database is successfully validated (Read/Write OK).",
        databaseId: currentDbId || "(default)"
      });
    } else {
      throw new Error("Test write succeeded but document not found on read.");
    }
  } catch (err: any) {
    res.status(500).json({ 
      success: false, 
      message: "Firestore validation failed.",
      details: err.message 
    });
  }
});

app.get("/api/admin/system-status", async (req, res) => {
  const password = req.query.password as string;
  if (!(await checkAdminPassword(password))) {
    return res.status(401).json({ error: "Unauthorized access denied." });
  }

  const content = await getLatestContent();
  
  // Cloudinary
  let mediaConfig: any = {};
  try { mediaConfig = JSON.parse(content.mediaSettingsJson || "{}"); } catch(e) {}
  const cCloudName = mediaConfig.cloudinaryCloudName || process.env.CLOUDINARY_CLOUD_NAME;
  const cApiKey = mediaConfig.cloudinaryApiKey || process.env.CLOUDINARY_API_KEY;
  const cApiSecret = mediaConfig.cloudinaryApiSecret || process.env.CLOUDINARY_API_SECRET;
  const isCloudinarySet = !!(cCloudName && cApiKey && cApiSecret);

  // Firestore (Either ENV or local config file)
  const isFirestoreSet = isFirestoreAvailable && !!contentColl || fs.existsSync(path.join(process.cwd(), "firebase-applet-config.json"));

  // SMTP
  let smtpConfig: any = {};
  try { smtpConfig = JSON.parse(content.smtpSettingsJson || "{}"); } catch(e) {}
  const smtpHost = smtpConfig.host || process.env.SMTP_HOST;
  const smtpUser = smtpConfig.user || process.env.SMTP_USER;
  const smtpPass = smtpConfig.pass || process.env.SMTP_PASS;
  const isSmtpSet = !!(smtpHost && smtpUser && smtpPass);

  // Payment
  let paymentConfig: any = {};
  try { paymentConfig = JSON.parse(content.paymentSettingsJson || "{}"); } catch(e) {}
  const paystackSecret = paymentConfig.paystackSecretKey || process.env.PAYSTACK_SECRET_KEY;
  const flutterwaveSecret = paymentConfig.flutterwaveSecretKey || process.env.FLUTTERWAVE_SECRET_KEY;
  const stripeSecret = paymentConfig.stripeSecretKey || process.env.STRIPE_SECRET_KEY;

  res.json({
    cloudinary: isCloudinarySet,
    firestore: isFirestoreSet,
    smtp: isSmtpSet,
    paystack: !!paystackSecret,
    flutterwave: !!flutterwaveSecret,
    stripe: !!stripeSecret
  });
});

// Media Sync Endpoint: Migrates local /uploads/ to Cloudinary
app.post("/api/media/sync", async (req, res) => {
  const { password } = req.body;
  if (!(await checkAdminPassword(password))) {
    return res.status(401).json({ error: "Unauthorized access denied." });
  }

  if (!useCloudinary) {
    return res.status(400).json({ error: "Cloudinary is not configured. Please verify environment variables." });
  }

  try {
    const contentRaw = fs.readFileSync(CONTENT_FILE, "utf-8");
    const content = JSON.parse(contentRaw);
    let migrationCount = 0;
    const errors: string[] = [];

    const migrateObject = async (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === "string" && obj[key].startsWith("/uploads/")) {
          const fileName = obj[key].replace("/uploads/", "");
          const localPath = path.join(UPLOADS_DIR, fileName);
          
          if (fs.existsSync(localPath)) {
            try {
              console.log(`[SYNC] Migrating local asset: ${fileName}`);
              const uploadRes = await cloudinary.uploader.upload(localPath, {
                folder: "the_vagina_room/migration",
                public_id: fileName.split(".")[0]
              });
              
              if (uploadRes.secure_url) {
                obj[key] = uploadRes.secure_url;
                migrationCount++;
                // Optional: Delete local file after sync to keep disk clean?
                // fs.unlinkSync(localPath); 
              }
            } catch (err: any) {
              console.error(`[SYNC] Failed to migrate ${fileName}:`, err.message);
              errors.push(`${fileName}: ${err.message}`);
            }
          } else {
            console.warn(`[SYNC] File not found on disk: ${localPath}`);
            errors.push(`${fileName}: File missing on server disk`);
          }
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          await migrateObject(obj[key]);
        }
      }
    };

    await migrateObject(content);

    if (migrationCount > 0) {
      fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2));
      console.log(`[SYNC] Successfully migrated ${migrationCount} assets.`);
    }

    res.json({ 
      success: true, 
      message: `Migration check complete.`,
      migratedCount: migrationCount,
      errors: errors.length > 0 ? errors : null
    });
  } catch (err: any) {
    console.error("[SYNC] Global migration error:", err);
    res.status(500).json({ error: "Internal migration logic failed", details: err.message });
  }
});

// Update an order (admin access / transaction update)
app.patch("/api/orders/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  let updatedLocal = false;
  let updatedFirestore = false;
  let firestoreError = null;

  // 1. Try updating local fallback file
  if (fs.existsSync(ORDERS_FILE)) {
    try {
      const localOrders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8") || "[]");
      const index = localOrders.findIndex((o: any) => o.id === id || o.orderNo === id);
      if (index !== -1) {
        localOrders[index] = { ...localOrders[index], ...updates };
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(localOrders, null, 2), "utf8");
        updatedLocal = true;
      }
    } catch (e) {
      console.error("[STORAGE] Local order update failed:", e);
    }
  }

  // 2. Try updating in Firestore
  if (isFirestoreAvailable && ordersColl && !id.startsWith("local_")) {
    try {
      const { updateDoc: clientUpdateDoc } = await import('firebase/firestore');
      await clientUpdateDoc(clientDoc(ordersColl, id), updates);
      updatedFirestore = true;
    } catch (err: any) {
      console.warn("[FIREBASE] Firestore order update failed:", err.message);
      firestoreError = err.message;
    }
  }

  if (updatedLocal || updatedFirestore || id.startsWith("local_")) {
    res.json({ success: true, message: "Order updated successfully." });
  } else if (firestoreError) {
    res.status(500).json({ error: "Failed to update order in Firestore", details: firestoreError });
  } else {
    res.json({ success: true, message: "Order update processed." });
  }
});

// Delete an order (admin access)
app.delete("/api/orders/:id", async (req, res) => {
  const { id } = req.params;

  let deletedLocal = false;
  let deletedFirestore = false;
  let firestoreError = null;

  // 1. Try deleting from local fallback
  if (fs.existsSync(ORDERS_FILE)) {
    try {
      const localOrders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8") || "[]");
      const filtered = localOrders.filter((o: any) => o.id !== id && o.orderNo !== id);
      if (filtered.length !== localOrders.length) {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(filtered, null, 2), "utf8");
        deletedLocal = true;
      }
    } catch (e) {
      console.error("[STORAGE] Local order deletion failed:", e);
    }
  }

  // 2. Try deleting from Firestore
  if (isFirestoreAvailable && ordersColl && !id.startsWith("local_")) {
    try {
      const { deleteDoc: clientDeleteDoc } = await import('firebase/firestore');
      await clientDeleteDoc(clientDoc(ordersColl, id));
      deletedFirestore = true;
    } catch (err: any) {
      console.warn("[FIREBASE] Firestore order deletion failed:", err.message);
      firestoreError = err.message;
    }
  }

  if (deletedLocal || deletedFirestore || id.startsWith("local_")) {
    res.json({ success: true, message: "Order deleted successfully." });
  } else if (firestoreError) {
    res.status(500).json({ error: "Failed to delete order from Firestore", details: firestoreError });
  } else {
    res.json({ success: true, message: "Order removed." });
  }
});

// Checkout route
app.post("/api/checkout", async (req, res) => {
  const { orderNo, name, email, cartItems, totalPrice, shippingAddress, phone } = req.body;

  if (!email || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "Missing checkout information." });
  }

  try {
    const currency = cartItems[0]?.currency === 'NGN' ? '₦' : cartItems[0]?.currency === 'USD' ? '$' : '₦';
    const itemsHtml = cartItems.map((item: any) => `
      <tr style="border-bottom: 1px solid #333;">
        <td style="padding: 12px 0; color: #ffffff; font-family: sans-serif; font-size: 14px;">
          <strong style="display: block; color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">${item.title}</strong>
          <span style="color: #666; font-size: 12px;">Qty: ${item.quantity}</span>
        </td>
        <td style="padding: 12px 0; text-align: right; color: #ffffff; font-family: sans-serif; font-size: 14px;">
          ${currency}${(parseFloat(item.price.replace(/,/g, '')) * item.quantity).toLocaleString()}
        </td>
      </tr>
    `).join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;700&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #000000; color: #ffffff; font-family: 'Inter', sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; border: 1px solid #D4AF37; padding: 40px;">
                <!-- Header -->
                <tr>
                  <td align="center" style="padding-bottom: 40px;">
                    <h1 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 4px;">The Vagina Room</h1>
                    <p style="color: #666; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-top: 10px;">A Sanctuary for Women's Wellness</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding-bottom: 30px;">
                    <h2 style="color: #ffffff; font-family: 'Playfair Display', serif; font-size: 22px; margin: 0 0 15px 0;">Order Confirmation</h2>
                    <p style="color: #aaaaaa; font-size: 14px; line-height: 1.6; margin: 0;">
                      Dear <strong style="color: #D4AF37;">${name}</strong>, thank you for your order. We have received your request and will be processing it shortly.
                    </p>
                  </td>
                </tr>

                <!-- Order Info -->
                <tr>
                  <td style="background-color: #111; padding: 20px; border-left: 2px solid #D4AF37; margin-bottom: 30px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Order Number</td>
                        <td style="color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; text-align: right;">Status</td>
                      </tr>
                      <tr>
                        <td style="color: #ffffff; font-size: 18px; font-weight: bold; padding-top: 5px;">#${orderNo}</td>
                        <td style="color: #D4AF37; font-size: 14px; font-weight: bold; padding-top: 5px; text-align: right;">RECEIVED</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Items Table -->
                <tr>
                  <td style="padding: 30px 0;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      ${itemsHtml}
                      <tr>
                        <td style="padding: 20px 0 0 0; color: #D4AF37; font-weight: bold; font-size: 16px;">Grand Total</td>
                        <td style="padding: 20px 0 0 0; text-align: right; color: #D4AF37; font-weight: bold; font-size: 24px;">${currency}${totalPrice.toLocaleString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Shipping Info -->
                <tr>
                  <td style="padding: 20px; border: 1px solid #222; background-color: #050505;">
                    <h3 style="color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">Shipping Information</h3>
                    <p style="color: #888; font-size: 13px; line-height: 1.5; margin: 0;">
                      ${shippingAddress}<br>
                      Phone: ${phone}
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding-top: 50px; border-top: 1px solid #222; margin-top: 40px;">
                    <p style="color: #444; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">
                      &copy; 2026 THE VAGINA ROOM | LAGOS, NIGERIA
                    </p>
                    <p style="color: #666; font-size: 10px; margin-top: 10px; font-style: italic;">
                      If you have any questions, please contact us via WhatsApp or reply to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await sendConfirmationEmail(
      email,
      `Order Confirmation #${orderNo} - The Vagina Room`,
      emailHtml
    );
    res.json({ success: true, message: "Order processed and confirmation sent." });
  } catch (err: any) {
    console.error("[CHECKOUT] Checkout email failed:", err);
    res.status(500).json({ success: false, error: "Failed to process checkout email." });
  }
});

// Dr. FID Booking route
app.post("/api/book-dr-fid", async (req, res) => {
  const { 
    fullName, 
    email, 
    phone, 
    organization, 
    bookingType, 
    eventTitle, 
    date, 
    location,
    eventTheme,
    preferredTopic,
    eventDescription,
    venue,
    time,
    audienceSize,
    eventType,
    duration,
    presentationNeeds,
    accommodation,
    travelSupport,
    notes 
  } = req.body;

  if (!email || !fullName) {
    return res.status(400).json({ error: "Email and Full Name are required." });
  }

  try {
    const bookingData = {
      fullName, 
      email, 
      phone, 
      organization, 
      bookingType, 
      eventTitle, 
      date, 
      location,
      eventTheme,
      preferredTopic,
      eventDescription,
      venue,
      time,
      audienceSize,
      eventType,
      duration,
      presentationNeeds,
      accommodation,
      travelSupport,
      notes,
      timestamp: new Date().toISOString()
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;700&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #000000; color: #ffffff; font-family: 'Inter', sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; border: 1px solid #D4AF37; padding: 40px;">
                <!-- Header -->
                <tr>
                  <td align="center" style="padding-bottom: 40px;">
                    <h1 style="color: #D4AF37; font-family: 'Playfair Display', serif; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 4px;">Dr. FID Booking</h1>
                    <p style="color: #666; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; margin-top: 10px;">New Engagement Request</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding-bottom: 30px;">
                    <h2 style="color: #ffffff; font-family: 'Playfair Display', serif; font-size: 20px; margin: 0 0 15px 0;">Request Confirmation</h2>
                    <p style="color: #aaaaaa; font-size: 14px; line-height: 1.6; margin: 0;">
                      Dear <strong style="color: #D4AF37;">${fullName}</strong>, thank you for your invitation. We have received your booking request for <strong>${eventTitle || 'your event'}</strong>. Our team will review the details and get back to you shortly.
                    </p>
                  </td>
                </tr>

                <!-- Summary -->
                <tr>
                  <td style="padding: 20px; border: 1px solid #222; background-color: #050505;">
                    <h3 style="color: #D4AF37; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0; border-bottom: 1px solid #222; pb-2">Engagement Details</h3>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="color: #ffffff; font-size: 13px;">
                      <tr><td style="padding: 5px 0; color: #666; width: 40%;">Type:</td><td style="padding: 5px 0;">${bookingType}</td></tr>
                      <tr><td style="padding: 5px 0; color: #666;">Format:</td><td style="padding: 5px 0;">${eventType}</td></tr>
                      <tr><td style="padding: 5px 0; color: #666;">Date:</td><td style="padding: 5px 0;">${date} at ${time}</td></tr>
                      <tr><td style="padding: 5px 0; color: #666;">Location:</td><td style="padding: 5px 0;">${location} (${venue})</td></tr>
                      <tr><td style="padding: 5px 0; color: #666;">Organization:</td><td style="padding: 5px 0;">${organization}</td></tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding-top: 50px; border-top: 1px solid #222; margin-top: 40px;">
                    <p style="color: #444; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin: 0;">
                      &copy; 2026 THE VAGINA ROOM | LAGOS, NIGERIA
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Persist as a submission
    try {
      if (isFirestoreAvailable && submissionsColl) {
        const firebaseSubmission = {
          timestamp: clientServerTimestamp(),
          formType: "booking_dr_fid",
          data: bookingData
        };
        await clientAddDoc(submissionsColl, firebaseSubmission);
      } else {
        let submissions: any[] = [];
        if (fs.existsSync(SUBMISSIONS_FILE)) {
          try {
            submissions = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf8") || "[]");
          } catch (jsonErr) {
            console.error("[STORAGE] Invalid local submissions JSON for booking:", jsonErr);
          }
        }
        submissions.push({
          timestamp: new Date().toISOString(),
          formType: "booking_dr_fid",
          data: bookingData,
          id: `local_${Date.now()}`
        });
        fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), "utf8");
      }
    } catch (e) {
      console.error("[BOOKING] Persistence failed:", e);
    }

    await sendConfirmationEmail(
      email,
      `Booking Request Received: ${eventTitle || 'Engagement Opportunity'} - Dr. FID`,
      emailHtml
    );
    res.json({ success: true, message: "Booking request submitted successfully." });
  } catch (err: any) {
    console.error("Booking process failed:", err);
    res.status(500).json({ error: "Booking process failed." });
  }
});

// WhatsApp API Route
app.post("/api/whatsapp/send", async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: "Phone number and message are required." });
  }

  try {
    let content = DEFAULT_CONTENT;
    if (fs.existsSync(CONTENT_FILE)) {
      content = { ...DEFAULT_CONTENT, ...JSON.parse(fs.readFileSync(CONTENT_FILE, "utf8")) };
    }
    
    // Parse general settings to find WhatsApp API keys
    const generalSettings = JSON.parse(content.generalSettingsJson || "{}");
    const { whatsappMethod, whatsappApiKey, whatsappBusinessId } = generalSettings;

    if (whatsappMethod !== "API" || !whatsappApiKey || !whatsappBusinessId) {
      return res.status(400).json({ error: "WhatsApp API is not configured or enabled." });
    }

    const formattedPhone = phone.replace(/\\s+/g, '').replace('+', '');
    
    const response = await fetch(`https://graph.facebook.com/v17.0/${whatsappBusinessId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${whatsappApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: { body: message }
      }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || "Failed to send WhatsApp message via API");
    }

    res.json({ success: true, data });
  } catch (err: any) {
    console.error("[WHATSAPP API] Error sending message:", err);
    res.status(500).json({ error: "Failed to send WhatsApp message.", details: err.message });
  }
});

/**
 * MEDIA SYNC: Scans current content for local /uploads/ URLs and mirrors them to Cloudinary.
 * This is crucial for cloud deployment (Render/Cloud Run) because local disk is ephemeral.
 */
app.post("/api/media/sync", async (req, res) => {
  const { password } = req.body;
  if (!(await checkAdminPassword(password))) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  if (!useCloudinary) {
    return res.status(400).json({ error: "Cloudinary credentials (env vars) are missing." });
  }

  try {
    const rawContent = await getLatestContent();
    let migratedCount = 0;
    
    // Recursively traverse object and upload strings starting with /uploads/
    const migrateAssets = async (obj: any): Promise<any> => {
      if (typeof obj === "string") {
        if (obj.startsWith("/uploads/")) {
          const localPath = path.join(process.cwd(), "data", obj);
          if (fs.existsSync(localPath)) {
            try {
              console.log(`[MEDIA SYNC] Mirroring: ${obj}`);
              const result = await cloudinary.uploader.upload(localPath, {
                folder: "thevaginaroom_migration",
              });
              migratedCount++;
              return result.secure_url;
            } catch (err: any) {
              console.error(`[MEDIA SYNC] Failed to migrate ${obj}:`, err.message);
              return obj; // Keep original on failure
            }
          }
        }
        return obj;
      } else if (Array.isArray(obj)) {
        return Promise.all(obj.map(item => migrateAssets(item)));
      } else if (typeof obj === "object" && obj !== null) {
        const newObj: any = {};
        for (const key in obj) {
          newObj[key] = await migrateAssets(obj[key]);
        }
        return newObj;
      }
      return obj;
    };

    console.log("[MEDIA SYNC] Starting global asset migration scan...");
    const updatedContent = await migrateAssets(rawContent);
    
    if (migratedCount > 0) {
      // Save updated content locally
      fs.writeFileSync(CONTENT_FILE, JSON.stringify(updatedContent, null, 2), "utf8");
      
      // Update Firestore
      if (isFirestoreAvailable && contentColl) {
        await withFirestoreFallback(async (coll) => {
          await clientSetDoc(clientDoc(coll, "global"), updatedContent, { merge: true });
        });
      }
      
      return res.json({ 
        success: true, 
        message: `Successfully mirrored ${migratedCount} assets to Cloudinary and updated database.`,
        migratedCount 
      });
    }

    res.json({ success: true, message: "Scan complete. No local assets required migration.", migratedCount: 0 });
  } catch (err: any) {
    console.error("[MEDIA SYNC] Critical sync failure:", err);
    res.status(500).json({ error: "Synchronization engine error", details: err.message });
  }
});

// Dynamic PWA Manifest Route
app.get("/manifest.json", async (req, res, next) => {
  try {
    let content = DEFAULT_CONTENT;
    if (fs.existsSync(CONTENT_FILE)) {
      content = { ...DEFAULT_CONTENT, ...JSON.parse(fs.readFileSync(CONTENT_FILE, "utf8")) };
    }
    const pwaSettings = JSON.parse(content.pwaSettingsJson || "{}");
    const iconToUse = pwaSettings.iconUrl || "/icon-512.png";
    
    // Allow CORS for sandboxed development environment and iOS/Android launchers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
    
    res.json({
      name: pwaSettings.name || "The Vagina Room",
      short_name: pwaSettings.short_name || "Vagina Room",
      description: pwaSettings.description || "A sanctuary for intimate wellness and reproductive education.",
      start_url: "/",
      display: pwaSettings.display || "standalone",
      theme_color: pwaSettings.theme_color || "#C41E3A",
      background_color: pwaSettings.background_color || "#0a0a0a",
      orientation: pwaSettings.orientation || "portrait",
      categories: ["health", "education", "wellness"],
      icons: [
        {
          src: iconToUse,
          sizes: "192x192",
          type: "image/png",
          purpose: "any"
        },
        {
          src: iconToUse,
          sizes: "512x512",
          type: "image/png",
          purpose: "any"
        },
        {
          src: iconToUse,
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable"
        }
      ]
    });
  } catch (e) {
    next(); // Fallback to static manifest.json on error
  }
});

// ---------------------- VITE AND STATIC ROUTING ----------------------

async function setupServer() {
  
  if (process.env.NODE_ENV !== "production") {
    // Development Environment: Dev server with HMR routing middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Environment: Static builds files in /dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK ENGINE] Server booted successfully on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
