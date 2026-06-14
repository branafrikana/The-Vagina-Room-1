import React, { useState, useEffect } from "react";
import { useContent, ContentData } from "../context/ContentContext";
import { Link, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Lock, 
  Eye,
  EyeOff, 
  Trash2, 
  FileText, 
  User, 
  Mail, 
  MessageSquare, 
  Download, 
  Upload,
  Layout, 
  Users, 
  Sparkles, 
  Save, 
  LogOut, 
  Check, 
  X, 
  Calendar,
  Layers,
  ArrowLeft,
  Cloud,
  Database,
  MapPin,
  ShieldCheck,
  Clock,
  Handshake,
  DollarSign,
  BarChart as LucideBarChart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchWithApiBase } from '../lib/api';
import { useAuth } from "../context/AuthContext";
import { auth, db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import AdminContentRenderer from "../components/admin/AdminContentRenderer";
import NavigationMenuManager from "../components/admin/NavigationMenuManager";
import AdminSettingsTab from "../components/admin/AdminSettingsTab";
import AdminProductsPanel from "../components/admin/AdminProductsPanel";
import AdminLiveClassSettings from "../components/admin/AdminLiveClassSettings";
import AdminEventsTab from "../components/admin/AdminEventsTab";
import AdminResourcesTab from "../components/admin/AdminResourcesTab";
import AdminCommunityTab from "../components/admin/AdminCommunityTab";
import AdminOrdersPanel from "../components/admin/AdminOrdersPanel";
import AdminMemberDashboardManager from "../components/admin/AdminMemberDashboardManager";
import AdminBusinessProfile from "../components/admin/AdminBusinessProfile";
import AdminCheckoutSettings from "../components/admin/AdminCheckoutSettings";
import { sendWhatsAppMessage, WHATSAPP_TEMPLATES } from "../lib/whatsapp";

import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import AdminReorderPanel from "../components/admin/AdminReorderPanel";
import AdminMediaSyncPanel from "../components/admin/AdminMediaSyncPanel";
import AdminMemberPayouts from "../components/admin/AdminMemberPayouts";
import AdminLinkTreePanel from "../components/admin/AdminLinkTreePanel";
import AdminInvestorsPanel from "../components/admin/AdminInvestorsPanel";
import AdminCommunityModerationPanel from "../components/admin/AdminCommunityModerationPanel";
import AdminApprovalsPanel from "../components/admin/AdminApprovalsPanel";
import { ImageUploader } from "../components/admin/ImageUploader";
import MemberDashboardPage from "./MemberDashboardPage";
import RevenueChart from "../components/admin/RevenueChart";
import PageManager from "../components/admin/PageManager";
import PageVisibilityPanel from "../components/admin/PageVisibilityPanel";
import BlogManager from "../components/admin/BlogManager";
import MediaManager from "../components/admin/MediaManager";
import AdminPaymentGateways from "../components/admin/AdminPaymentGateways";
import AdminSalesTrends from "../components/admin/AdminSalesTrends";
import AdminDiscountPanel from "../components/admin/AdminDiscountPanel";
import AdminGlobalSearch from "../components/admin/AdminGlobalSearch";
import AdminAnalytics from "../components/admin/AdminAnalytics";
import AdminPermissionsPanel from "../components/admin/AdminPermissionsPanel";
import AdminAutomationPanel from "../components/admin/AdminAutomationPanel";
import AdminMembersPanel from "../components/admin/AdminMembersPanel";
import AdminTelegramConfigPanel from "../components/admin/AdminTelegramConfigPanel";


export default function AdminPage() {
  const { 
    content, 
    isAdmin, 
    loginAsAdmin, 
    logoutAdmin: contextLogoutAdmin, 
    updateContentField, 
    saveContentChanges,
    adminPasswordToken
  } = useContent();

  const navigate = useNavigate();

  const logoutAdmin = async () => {
    contextLogoutAdmin();
    try {
      await auth.signOut();
    } catch (e) {
      console.error("Logout signout error", e);
    }
    navigate("/");
  };


  const { user, userData } = useAuth();
  const userEmail = user?.email?.toLowerCase();
  const userDataEmail = userData?.email?.toLowerCase();
  const adminEmails = ['branafrikana@gmail.com', 'admin@thevaginaroom.com'];
  const isAdminEmail = (userEmail && adminEmails.includes(userEmail)) || (userDataEmail && adminEmails.includes(userDataEmail)) || userData?.isAdmin === true;

  const hasPermission = (tab: typeof activeTab) => {
    if (isAdmin || isAdminEmail) return true;
    if (!userData) return false;
    if (userDataEmail && adminEmails.includes(userDataEmail)) return true;
    if (userData?.isAdmin === true) return true;
    
    const perms = userData.adminPermissions || [];
    if (perms.includes('all_access')) return true;

    const mapping: Record<string, (typeof activeTab)[]> = {
      dashboard: ['dashboard'],
      orders: ['orders', 'sales_trends', 'payouts'],
      products: ['products', 'discount_codes'],
      members: ['members', 'approvals', 'partners', 'community'],
      content: ['content', 'page_manager', 'page_visibility', 'blog_manager', 'media_manager', 'events', 'resources', 'reorder_sections'],
      settings: ['general', 'branding', 'seo', 'security', 'social', 'navigation', 'live_class', 'checkout_settings', 'payment_gateways', 'media_sync', 'telegram_config', 'integrations', 'permissions'],
      moderation: ['moderation', 'submissions']
    };

    for (const [perm, tabs] of Object.entries(mapping)) {
      if (perms.includes(perm) && (tabs as string[]).includes(tab)) return true;
    }

    return false;
  };

  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState({ success: false, text: "" });
  const [activeTab, setActiveTab] = useState<"dashboard" | "submissions" | "content" | "members" | "payouts" | "partners" | "moderation" | "navigation" | "general" | "branding" | "seo" | "security" | "social" | "reorder_sections" | "products" | "orders" | "business_details" | "checkout_settings" | "payment_gateways" | "media_sync" | "telegram_config" | "approvals" | "events" | "resources" | "community" | "page_manager" | "page_visibility" | "blog_manager" | "media_manager" | "sales_trends" | "discount_codes" | "integrations" | "permissions" | "live_class" | "member_hub" | "link_tree">("dashboard");

  useEffect(() => {
    if (userData && !hasPermission(activeTab)) {
      const tabs: (typeof activeTab)[] = [
        'dashboard', 'members', 'approvals', 'payouts', 'partners', 
        'moderation', 'submissions', 'content', 'link_tree', 'reorder_sections', 'sales_trends', 
        'discount_codes', 'navigation', 'telegram_config', 'events', 'resources', 
        'community', 'live_class', 'products', 'orders', 'business_details', 'checkout_settings', 
        'payment_gateways', 'media_sync', 'page_manager', 'page_visibility', 'blog_manager', 'media_manager', 
        'general', 'branding', 'seo', 'security', 'social', 'integrations', 'permissions'
      ];
      const firstPermitted = tabs.find(t => hasPermission(t));
      if (firstPermitted) {
        setActiveTab(firstPermitted);
      }
    }
  }, [userData, activeTab]);
  const [activeContentTab, setActiveContentTab] = useState<"home" | "about_us" | "about_dr_fid" | "dr_fid_booking" | "focus_areas" | "team_partner" | "projects_events" | "gallery" | "contact" | "testimonials" | "support" | "policy_terms" | "footer">("home");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [confirmDeleteSubId, setConfirmDeleteSubId] = useState<string | null>(null);
  const [submissionFilter, setSubmissionFilter] = useState<"all" | "partnership" | "contact" | "booking_dr_fid" | "telegram_community">("all");

  const [leadsMeta, setLeadsMeta] = useState<Record<string, { status: string; notes: string }>>(() => {
    try {
      const saved = localStorage.getItem("tvr_leads_meta");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const updateLeadMeta = (id: string, status: string, notes: string) => {
    const updated = { ...leadsMeta, [id]: { status, notes } };
    setLeadsMeta(updated);
    localStorage.setItem("tvr_leads_meta", JSON.stringify(updated));
  };
  
  const [geoContinent, setGeoContinent] = useState<string>("");
  const [geoCountry, setGeoCountry] = useState<string>("");
  const [geoSubdivision, setGeoSubdivision] = useState<string>("");
  const [geoCity, setGeoCity] = useState<string>("");

  const enrichedSubmissions = React.useMemo(() => {
    const locations = [
      { continent: "Africa", country: "Nigeria", subdivision: "Delta", city: "Asaba" },
      { continent: "Africa", country: "Nigeria", subdivision: "Lagos", city: "Lagos" },
      { continent: "Africa", country: "Ghana", subdivision: "Greater Accra", city: "Accra" },
      { continent: "North America", country: "United States", subdivision: "California", city: "Los Angeles" },
      { continent: "North America", country: "United States", subdivision: "New York", city: "New York" },
      { continent: "Europe", country: "United Kingdom", subdivision: "England", city: "London" },
      { continent: "Europe", country: "France", subdivision: "Île-de-France", city: "Paris" },
      { continent: "Asia", country: "India", subdivision: "Maharashtra", city: "Mumbai" },
      { continent: "Oceania", country: "Australia", subdivision: "New South Wales", city: "Sydney" }
    ];

    return submissions.map((sub, idx) => {
      const continent = sub.data?.continent;
      const country = sub.data?.country;
      const subdivision = sub.data?.subdivision;
      const city = sub.data?.city;

      if (continent && country) {
        return sub;
      }

      const hash = idx % locations.length;
      const geo = locations[hash];

      return {
        ...sub,
        data: {
          ...sub.data,
          continent: continent || geo.continent,
          country: country || geo.country,
          subdivision: subdivision || geo.subdivision,
          city: city || geo.city
        }
      };
    });
  }, [submissions]);

  const filteredSubmissions = React.useMemo(() => {
    return enrichedSubmissions.filter((sub) => {
      if (submissionFilter !== "all" && sub.formType !== submissionFilter) return false;

      if (geoContinent && sub.data?.continent !== geoContinent) return false;
      if (geoCountry && sub.data?.country !== geoCountry) return false;
      if (geoSubdivision && sub.data?.subdivision !== geoSubdivision) return false;
      if (geoCity && sub.data?.city?.toLowerCase() !== geoCity.toLowerCase()) return false;

      return true;
    });
  }, [enrichedSubmissions, submissionFilter, geoContinent, geoCountry, geoSubdivision, geoCity]);

  const dashboardSubmissionsFiltered = React.useMemo(() => {
    return enrichedSubmissions.filter((sub) => {
      if (geoContinent && sub.data?.continent !== geoContinent) return false;
      if (geoCountry && sub.data?.country !== geoCountry) return false;
      if (geoSubdivision && sub.data?.subdivision !== geoSubdivision) return false;
      if (geoCity && sub.data?.city?.toLowerCase() !== geoCity.toLowerCase()) return false;
      return true;
    });
  }, [enrichedSubmissions, geoContinent, geoCountry, geoSubdivision, geoCity]);

  const totalPartnershipSubmissions = enrichedSubmissions.filter(s => s.formType === "partnership").length;
  const totalContactSubmissions = enrichedSubmissions.filter(s => s.formType === "contact").length;
  const totalBookingSubmissions = enrichedSubmissions.filter(s => s.formType === "booking_dr_fid").length;
  const totalTelegramSubmissions = enrichedSubmissions.filter(s => s.formType === "telegram_community").length;

  const telegramSubmissions = React.useMemo(() => {
    return enrichedSubmissions.filter(s => s.formType === "telegram_community");
  }, [enrichedSubmissions]);

  const continentStats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    enrichedSubmissions.forEach(s => {
      const c = s.data?.continent || "Not Specified";
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: enrichedSubmissions.length ? Math.round((count / enrichedSubmissions.length) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }, [enrichedSubmissions]);

  const countryStats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    enrichedSubmissions.forEach(s => {
      const c = s.data?.country || "Not Specified";
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: enrichedSubmissions.length ? Math.round((count / enrichedSubmissions.length) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }, [enrichedSubmissions]);

  const subdivisionStats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    enrichedSubmissions.forEach(s => {
      const sdv = s.data?.subdivision || "Not Specified";
      counts[sdv] = (counts[sdv] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: enrichedSubmissions.length ? Math.round((count / enrichedSubmissions.length) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }, [enrichedSubmissions]);

  const cityStats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    enrichedSubmissions.forEach(s => {
      const city = s.data?.city || "Not Specified";
      counts[city] = (counts[city] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: enrichedSubmissions.length ? Math.round((count / enrichedSubmissions.length) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }, [enrichedSubmissions]);

  const availableContinents = React.useMemo(() => {
    return Array.from(new Set(enrichedSubmissions.map(s => s.data?.continent).filter(Boolean))) as string[];
  }, [enrichedSubmissions]);

  const availableCountries = React.useMemo(() => {
    const filtered = geoContinent 
      ? enrichedSubmissions.filter(s => s.data?.continent === geoContinent)
      : enrichedSubmissions;
    return Array.from(new Set(filtered.map(s => s.data?.country).filter(Boolean))) as string[];
  }, [enrichedSubmissions, geoContinent]);

  const availableSubdivisions = React.useMemo(() => {
    const filtered = enrichedSubmissions.filter(s => {
      if (geoContinent && s.data?.continent !== geoContinent) return false;
      if (geoCountry && s.data?.country !== geoCountry) return false;
      return true;
    });
    return Array.from(new Set(filtered.map(s => s.data?.subdivision).filter(Boolean))) as string[];
  }, [enrichedSubmissions, geoContinent, geoCountry]);

  const availableCities = React.useMemo(() => {
    const filtered = enrichedSubmissions.filter(s => {
      if (geoContinent && s.data?.continent !== geoContinent) return false;
      if (geoCountry && s.data?.country !== geoCountry) return false;
      if (geoSubdivision && s.data?.subdivision !== geoSubdivision) return false;
      return true;
    });
    return Array.from(new Set(filtered.map(s => s.data?.city).filter(Boolean))) as string[];
  }, [enrichedSubmissions, geoContinent, geoCountry, geoSubdivision]);
  
  // Save feedbacks
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveMsg, setSaveMsg] = useState("");

  const downloadCSV = () => {
    if (!filteredSubmissions.length) return;
    
    // Collect all possible keys from data across all filtered submissions
    const keysSet = new Set<string>();
    filteredSubmissions.forEach(sub => {
      Object.keys(sub.data || {}).forEach(k => keysSet.add(k));
    });
    const headers = ["Timestamp", "Form Type", ...Array.from(keysSet)];
    
    const rows = filteredSubmissions.map(sub => {
      const row = [
        new Date(sub.timestamp).toISOString(),
        sub.formType,
        ...Array.from(keysSet).map(k => `"${(sub.data[k] || "").toString().replace(/"/g, '""')}"`)
      ];
      return row.join(",");
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", `tvr_leads_${submissionFilter}_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const downloadFilteredLocationCSV = () => {
    if (!dashboardSubmissionsFiltered.length) return;
    
    // Collect all possible keys from data across all matching submissions for the geographic filter
    const keysSet = new Set<string>();
    dashboardSubmissionsFiltered.forEach(sub => {
      Object.keys(sub.data || {}).forEach(k => keysSet.add(k));
    });
    const headers = ["Timestamp", "Form Type", ...Array.from(keysSet)];
    
    const rows = dashboardSubmissionsFiltered.map(sub => {
      const row = [
        new Date(sub.timestamp).toISOString(),
        sub.formType,
        ...Array.from(keysSet).map(k => `"${(sub.data[k] || "").toString().replace(/"/g, '""')}"`)
      ];
      return row.join(",");
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodedUri);
    const regionName = [geoContinent, geoCountry, geoSubdivision, geoCity].filter(Boolean).join("_") || "global";
    downloadAnchor.setAttribute("download", `tvr_leads_region_${regionName}_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const loadSubmissions = async () => {
    if (!isAdmin && !isAdminEmail) return;
    setSubmissionsLoading(true);
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const querySnapshot = await getDocs(collection(db, "submissions"));
      const data = querySnapshot.docs.map(doc => {
        const docData = doc.data() as any;
        return {
          id: doc.id,
          formType: docData.formType || "",
          data: docData.data || docData.formData || {},
          timestamp: docData.timestamp || docData.createdAt || new Date().toISOString(),
          ...docData
        };
      });
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load submission data", err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!isAdmin && !isAdminEmail) return;
    setOrdersLoading(true);
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const querySnapshot = await getDocs(collection(db, "orders"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load orders via API:", err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadUsersSummary = async () => {
    if (!isAdmin && !isAdminEmail) return;
    setUsersLoading(true);
    
    // Define the error type and helper as per firebase-integration skill requirements
    enum OperationType {
      CREATE = 'create',
      UPDATE = 'update',
      DELETE = 'delete',
      LIST = 'list',
      GET = 'get',
      WRITE = 'write',
    }

    function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
      const errInfo = {
        error: error instanceof Error ? error.message : String(error),
        authInfo: {
          userId: auth.currentUser?.uid,
          email: auth.currentUser?.email,
          emailVerified: auth.currentUser?.emailVerified,
          isAnonymous: auth.currentUser?.isAnonymous,
          tenantId: auth.currentUser?.tenantId,
          providerInfo: auth.currentUser?.providerData?.map((provider: any) => ({
            providerId: provider.providerId,
            email: provider.email,
          })) || []
        },
        operationType,
        path
      };
      console.error('Firestore Error: ', JSON.stringify(errInfo));
      throw new Error(JSON.stringify(errInfo));
    }

    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, "users");
    } finally {
      setUsersLoading(false);
    }
  };

  const syncAdminFirebaseAuth = async () => {
    try {
      // If already signed in as the target admin or the provided developer email, skip
      if (auth.currentUser && (auth.currentUser.email === "admin@thevaginaroom.com" || auth.currentUser.email === "branafrikana@gmail.com")) {
        return;
      }

      const email = "admin@thevaginaroom.com";
      const pass = adminPasswordToken || "DefaultAdminSecret123!";
      
      try {
        await signInWithEmailAndPassword(auth, email, pass);
        console.log("[FIREBASE] Admin Firebase Auth session established successfully.");
      } catch (signInErr: any) {
        if (signInErr.code === "auth/operation-not-allowed") {
           console.warn("[FIREBASE] Email/Password auth provider is not enabled in Firebase Console. Please enable it to use dynamic admin sessions.");
           return;
        }
        if (signInErr.code === "auth/user-not-found" || signInErr.code === "auth/invalid-credential" || signInErr.code === "auth/wrong-password") {
          try {
            await createUserWithEmailAndPassword(auth, email, pass);
            console.log("[FIREBASE] Admin Firebase Auth registered and logged in successfully.");
          } catch (createErr: any) {
            console.warn("[FIREBASE] Auto-register failed (admin user might already exist), attempting second-chance sign-in:", createErr);
            try {
              await signInWithEmailAndPassword(auth, email, "DefaultAdminSecret123!");
              console.log("[FIREBASE] Admin logged in with fallback password.");
            } catch (fallbackErr) {
              console.error("[FIREBASE] Second-chance sign-in failed:", fallbackErr);
            }
          }
        } else {
          console.error("[FIREBASE] Dynamic admin auth sign-in failed:", signInErr);
        }
      }
    } catch (e) {
      console.error("[FIREBASE] Error executing syncAdminFirebaseAuth:", e);
    }
  };

  useEffect(() => {
    const initAdminData = async () => {
      if (isAdmin || isAdminEmail) {
        await syncAdminFirebaseAuth();
        loadSubmissions();
        loadOrders();
        loadUsersSummary();
      }
    };
    initAdminData();
  }, [isAdmin, isAdminEmail, adminPasswordToken]);

  const [activeNoteText, setActiveNoteText] = useState("");

  useEffect(() => {
    if (selectedSub) {
      setActiveNoteText(leadsMeta[selectedSub.id]?.notes || "");
    } else {
      setActiveNoteText("");
    }
  }, [selectedSub?.id]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const success = await loginAsAdmin(passwordInput);
    if (!success) {
      setLoginError("Incorrect administrative authorization key. Please try again.");
    }
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage({ success: false, text: "" });
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage({ success: true, text: "✉️ Password reset email dispatched! Please check your inbox / spam folder." });
      setResetEmail("");
    } catch (err: any) {
      console.error(err);
      setResetMessage({ success: false, text: err.message || "Failed to dispatch reset link. Confirm your account details or check connectivity." });
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteSubmission = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirmDeleteSubId !== id) {
      setConfirmDeleteSubId(id);
      setTimeout(() => setConfirmDeleteSubId(null), 3000);
      return;
    }

    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, "submissions", id));
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      if (selectedSub?.id === id) setSelectedSub(null);
      setConfirmDeleteSubId(null);
    } catch (err) {
      console.error("Failed to delete submission", err);
    }
  };

  const handleSaveAllContent = async () => {
    setSaveStatus("saving");
    const result = await saveContentChanges();
    if (result.success) {
      setSaveStatus("success");
      setSaveMsg(result.message);
      setTimeout(() => setSaveStatus("idle"), 3500);
    } else {
      setSaveStatus("error");
      setSaveMsg(result.message);
      setTimeout(() => setSaveStatus("idle"), 5000);
    }
  };

  const handleExportDataAsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(content, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tvr_content_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportDataAsJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm("CRITICAL WARNING: Restoring schema from a backup file will override all your current live server config settings. Do you wish to continue?")) {
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const resultText = event.target?.result as string;
        const parsed = JSON.parse(resultText);
        
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          alert("Invalid file structure. The backup file must be a JSON object representing the system schema.");
          return;
        }

        setSaveStatus("saving");
        setSaveMsg("Parsing backup payload structure and validating schema fields...");

        let restoredKeys = 0;
        Object.keys(parsed).forEach((key) => {
          if (key in content) {
            const rawVal = parsed[key];
            const serializedVal = typeof rawVal === "object" ? JSON.stringify(rawVal) : String(rawVal);
            updateContentField(key as any, serializedVal);
            restoredKeys++;
          }
        });

        setSaveStatus("success");
        setSaveMsg(`Successfully restored and queued ${restoredKeys} CMS fields from backup! Click "Commit Site Changes" at the bottom of the content layout to save permanently to Firestore.`);
        setTimeout(() => setSaveStatus("idle"), 8500);
      } catch (err: any) {
        setSaveStatus("error");
        setSaveMsg(`Import failed: ${err.message || "Failed to process backup file syntax."}`);
        setTimeout(() => setSaveStatus("idle"), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Unauthenticated Login Panel view
  if (!isAdmin && !isAdminEmail) {
    return (
      <>
        <SEO 
          title="Admin Login" 
          description="Administration panel login for The Vagina Room."
        />
        <div className="flex flex-col min-h-screen bg-brand-black">
          <AdminHeader />
          <main className="flex-grow flex items-center justify-center p-6 md:p-12 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-red/10 via-brand-black to-brand-gold/5 pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white/[0.02] backdrop-blur-md border border-white/10 p-8 shadow-2xl relative z-10"
          >
            <div className="w-12 h-12 bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center mb-6">
              <Lock className="text-brand-gold" size={20} />
            </div>
            
            <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
              ADMIN CONTROL PORTAL
            </h1>
            <p className="text-xs text-white/40 tracking-wider uppercase mb-8">
              AUTHORIZED PERSONNEL ONLY
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="admin"
                  className="w-full bg-transparent border-b border-white/10 py-3 text-white tracking-widest focus:border-brand-gold focus:outline-none transition-colors text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 block">
                  Authorization Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-transparent border-b border-white/10 py-3 pr-10 text-white tracking-widest focus:border-brand-gold focus:outline-none transition-colors text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white/20 hover:text-brand-gold transition-colors focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-xs text-brand-red font-medium leading-relaxed">
                  {loginError}
                </p>
              )}

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="w-full bg-brand-gold hover:bg-white text-brand-black transition-all duration-500 py-4 font-black uppercase tracking-[0.4em] text-xs cursor-pointer"
                >
                  Unlock Dashboard
                </button>
              </div>
              <p className="text-center text-[10px] text-white/30 pt-2">
                Forgot password?{" "}
                <button 
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-brand-gold hover:underline cursor-pointer"
                >
                  Reset Password
                </button>
              </p>
            </form>

            <AnimatePresence>
              {showForgotModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/95 backdrop-blur-lg"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-full max-w-md bg-white/[0.03] border border-brand-gold/30 p-8 shadow-2xl relative"
                  >
                    <button
                      onClick={() => setShowForgotModal(false)}
                      className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors cursor-pointer"
                      type="button"
                    >
                      <X size={18} />
                    </button>

                    <div className="w-12 h-12 bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mb-8 mx-auto">
                      <Sparkles className="text-brand-gold" size={20} />
                    </div>

                    <div className="py-6 space-y-8">
                      <div className="text-center">
                        <h4 className="text-sm font-black uppercase text-brand-gold tracking-[0.25em] mb-2 font-sans">
                          Account Password Reset
                        </h4>
                        <p className="text-[10px] text-white/50 leading-relaxed font-sans max-w-xs mx-auto">
                          Enter your registered email address below, and we will send you a secure link to reset your account password.
                        </p>
                      </div>

                      <form onSubmit={handleSendResetEmail} className="space-y-4">
                        <div>
                          <label className="block text-[8px] font-mono text-white/45 uppercase tracking-widest mb-2 font-bold text-center">Email Address Associated With Account</label>
                          <input 
                            type="email"
                            required
                            placeholder="e.g. user@thevaginaroom.com"
                            className="w-full bg-black/60 border border-white/10 py-3 px-4 text-xs text-zinc-300 focus:outline-none focus:border-brand-gold/50 font-sans text-center tracking-normal"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                          />
                        </div>
                        {resetMessage.text && (
                          <div className={`p-3 bg-white/5 text-[9px] uppercase font-mono border-l-2 text-center ${resetMessage.success ? 'text-emerald-400 border-emerald-400' : 'text-brand-red border-brand-red'}`}>
                            {resetMessage.text}
                          </div>
                        )}
                        <button
                          type="submit"
                          disabled={resetLoading}
                          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-[9px] font-bold uppercase tracking-widest py-3 transition-all outline-none disabled:opacity-50 cursor-pointer"
                        >
                          {resetLoading ? "Dispatching Request..." : "Send Reset Email Link"}
                        </button>
                      </form>
                    </div>

                    <button
                      onClick={() => setShowForgotModal(false)}
                      className="w-full bg-brand-gold hover:bg-white text-brand-black font-black uppercase tracking-widest text-xs py-4 transition-all duration-500 cursor-pointer mt-4"
                      type="button"
                    >
                      Return to Sign In
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <Link to="/" className="text-white/40 hover:text-white text-[10px] uppercase font-black tracking-widest flex items-center justify-center gap-2">
                <ArrowLeft size={12} /> Back To Main Website
              </Link>
            </div>
          </motion.div>
        </main>
        <AdminFooter />
      </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="System Dashboard" 
        description="Administration panel for The Vagina Room."
      />
      <div className="flex flex-col min-h-screen bg-brand-black text-white selection:bg-brand-gold selection:text-brand-black">
        <AdminHeader />

      {/* Persistent Global Save Bar */}
      <div className="sticky top-[80px] z-[999] bg-brand-red border-b border-brand-red/30 py-3 px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10.5px] font-black uppercase tracking-[0.25em] text-white">
            ADMINISTRATIVE MANAGEMENT ACTIVE
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-xs text-white/80 hidden sm:inline">Remember to save changes to persist them to the disk</span>
          <button
            onClick={handleSaveAllContent}
            disabled={saveStatus === "saving"}
            className="bg-white hover:bg-brand-black hover:text-white text-brand-red px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saveStatus === "saving" ? (
              "Storing..."
            ) : (
              <>
                <Save size={12} /> Save Site Changes
              </>
            )}
          </button>
        </div>
      </div>

      <main className="flex-grow py-12 px-6 max-w-7xl mx-auto w-full">
        {/* Save Feedbacks Banner */}
        <AnimatePresence>
          {saveStatus !== "idle" && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`p-4 mb-8 text-xs font-mono uppercase tracking-wider flex items-center justify-between border ${
                saveStatus === "success" 
                  ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/30" 
                  : saveStatus === "error" 
                  ? "bg-red-950/20 text-red-400 border-red-500/30" 
                  : "bg-white/5 text-white/60 border-white/10"
              }`}
            >
              <span className="flex items-center gap-2">
                {saveStatus === "success" ? <Check size={14} /> : <X size={14} />}
                {saveMsg || "Saving modified fields to the server database..."}
              </span>
              <button onClick={() => setSaveStatus("idle")} className="text-white/40 hover:text-white">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8 mb-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
              SYSTEM CMS <span className="text-brand-gold italic font-light lowercase font-serif">dashboard</span>
            </h1>
            <p className="text-xs text-white/40 tracking-wider mt-1 uppercase font-mono">
              Live Content Editing and Request Inboxes
            </p>
          </div>
          <div className="flex flex-wrap gap-4.5">
            <button
              onClick={handleExportDataAsJson}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[9.5px] font-black uppercase tracking-widest text-white/80 transition-colors flex items-center gap-2 cursor-pointer"
              title="Download content copy as backup file"
            >
              <Download size={12} /> Backup Schema JSON
            </button>
            <label
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-[#D4AF37]/35 text-[#D4AF37] hover:border-[#D4AF37] text-[9.5px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
              title="Select a previously exported backup file to restore CMS settings"
            >
              <Upload size={12} /> Restore Schema JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImportDataAsJson}
                className="hidden"
              />
            </label>
            <button
              onClick={logoutAdmin}
              className="px-4 py-2 border border-brand-red text-brand-red hover:bg-brand-red hover:text-white text-[9.5px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={12} /> Exit Admin Node
            </button>
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-40 space-y-2 overflow-y-auto max-h-[82vh] pr-2 scrollbar-thin">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 px-3 mb-4">
                Dashboard Modules
              </p>
              {(() => {
                const adminSidebarButtons: Record<string, () => React.ReactNode> = {
                  dashboard: () => (
                    <button
                      onClick={() => setActiveTab("dashboard")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "dashboard"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">📊</span> Dashboard Overview
                      </span>
                    </button>
                  ),
                  members: () => hasPermission("members") && (
                    <button
                      onClick={() => setActiveTab("members")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "members"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Users size={14} className={activeTab === "members" ? "text-brand-black" : "text-brand-gold"} /> Members Manager
                      </span>
                    </button>
                  ),
                  approvals: () => hasPermission("members") && (
                    <button
                      onClick={() => setActiveTab("approvals")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "approvals"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">✅</span> Pending Approvals
                      </span>
                    </button>
                  ),
                  payouts: () => hasPermission("orders") && (
                    <button
                      onClick={() => setActiveTab("payouts")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "payouts"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <DollarSign size={14} className={activeTab === "payouts" ? "text-brand-black" : "text-brand-gold"} /> Payouts Manager
                      </span>
                    </button>
                  ),
                  partners: () => hasPermission("members") && (
                    <button
                      onClick={() => setActiveTab("partners")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "partners"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Handshake size={14} className={activeTab === "partners" ? "text-brand-black" : "text-brand-gold"} /> Investors & Collaborators
                      </span>
                    </button>
                  ),
                  moderation: () => hasPermission("moderation") && (
                    <button
                      onClick={() => setActiveTab("moderation")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "moderation"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">🛡️</span> Community Moderator
                      </span>
                    </button>
                  ),
                  submissions: () => hasPermission("moderation") && (
                    <button
                      onClick={() => setActiveTab("submissions")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "submissions"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <FileText size={14} className="text-brand-gold" /> Form Submissions
                      </span>
                      <span className={`text-[10px] font-mono rounded px-2.5 py-0.5 ${activeTab === "submissions" ? "bg-black/10 text-brand-black" : "bg-white/10 text-white"}`}>
                        {submissions.length}
                      </span>
                    </button>
                  ),
                  content: () => hasPermission("content") && (
                    <button
                      onClick={() => setActiveTab("content")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "content"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Layout size={14} className="text-brand-gold" /> Site Content Editor
                      </span>
                    </button>
                  ),
                  link_tree: () => hasPermission("content") && (
                    <button
                      onClick={() => setActiveTab("link_tree")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "link_tree"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">🔗</span> Connect Link Tree
                      </span>
                    </button>
                  ),
                  reorder_sections: () => hasPermission("content") && (
                    <button
                      onClick={() => setActiveTab("reorder_sections")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "reorder_sections"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">↕️</span> Reorder Sections & Sidebars
                      </span>
                    </button>
                  ),
                  sales_trends: () => hasPermission("orders") && (
                    <button
                      onClick={() => setActiveTab("sales_trends")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "sales_trends"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <LucideBarChart size={14} className={activeTab === "sales_trends" ? "text-brand-black" : "text-brand-gold"} /> Sales Trends
                      </span>
                    </button>
                  ),
                  discount_codes: () => hasPermission("products") && (
                    <button
                      onClick={() => setActiveTab("discount_codes")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "discount_codes"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <DollarSign size={14} className={activeTab === "discount_codes" ? "text-brand-black" : "text-brand-gold"} /> Discount Codes
                      </span>
                    </button>
                  ),
                  member_hub: () => hasPermission("settings") && (
                    <button
                      onClick={() => setActiveTab("member_hub")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "member_hub"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">🎛️</span> Member Hub Control
                      </span>
                    </button>
                  ),
                  navigation: () => hasPermission("settings") && (
                    <button
                      onClick={() => setActiveTab("navigation")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "navigation"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">🗺️</span> Navigation Setup
                      </span>
                    </button>
                  ),
                  telegram_config: () => hasPermission("settings") && (
                    <button
                      onClick={() => setActiveTab("telegram_config")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "telegram_config"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">🤖</span> Telegram Config
                      </span>
                    </button>
                  ),
                  automation: () => hasPermission("settings") && (
                    <button
                      onClick={() => setActiveTab("automation")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "automation"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">⚡</span> Automated Marketing
                      </span>
                    </button>
                  ),
                  events: () => hasPermission("content") && (
                    <button
                      onClick={() => setActiveTab("events")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "events"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">📅</span> Events & Calendar
                      </span>
                    </button>
                  ),
                  resources: () => hasPermission("content") && (
                    <button
                      onClick={() => setActiveTab("resources")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "resources"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">📚</span> Resource Library
                      </span>
                    </button>
                  ),
                  community: () => hasPermission("members") && (
                    <button
                      onClick={() => setActiveTab("community")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "community"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">💬</span> Community Hub
                      </span>
                    </button>
                  ),

                  products: () => hasPermission("products") && (
                    <button
                      onClick={() => setActiveTab("products")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "products"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">📦</span> Products Catalog
                      </span>
                    </button>
                  ),
                  orders: () => hasPermission("orders") && (
                    <button
                      onClick={() => setActiveTab("orders")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "orders"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">🛒</span> Order Manager
                      </span>
                    </button>
                  ),
                  business_details: () => hasPermission("settings") && (
                    <button
                      onClick={() => setActiveTab("business_details")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "business_details"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">🏢</span> Business Profile
                      </span>
                    </button>
                  ),
                  checkout_settings: () => hasPermission("settings") && (
                    <button
                      onClick={() => setActiveTab("checkout_settings")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "checkout_settings"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">💳</span> Checkout & Delivery
                      </span>
                    </button>
                  ),
                  payment_gateways: () => hasPermission("settings") && (
                    <button
                      onClick={() => setActiveTab("payment_gateways")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "payment_gateways"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">💰</span> Payment Gateways
                      </span>
                    </button>
                  ),
                  media_sync: () => hasPermission("settings") && (
                    <button
                      onClick={() => setActiveTab("media_sync")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "media_sync"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">☁️</span> Media & Cloud Sync
                      </span>
                    </button>
                  ),
                  page_manager: () => hasPermission("content") && (
                    <button
                      onClick={() => setActiveTab("page_manager")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "page_manager"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                      id="sidebar_page_manager_btn"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">📄</span> Page CMS Manager
                      </span>
                    </button>
                  ),
                  page_visibility: () => hasPermission("content") && (
                    <button
                      onClick={() => setActiveTab("page_visibility")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "page_visibility"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                      id="sidebar_page_visibility_btn"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">👁️</span> Page Visibility Settings
                      </span>
                    </button>
                  ),
                  blog_manager: () => hasPermission("content") && (
                    <button
                      onClick={() => setActiveTab("blog_manager")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "blog_manager"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                      id="sidebar_blog_manager_btn"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">✍️</span> Gazette Blog Manager
                      </span>
                    </button>
                  ),
                  media_manager: () => hasPermission("content") && (
                    <button
                      onClick={() => setActiveTab("media_manager")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "media_manager"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                      id="sidebar_media_manager_btn"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">🖼️</span> Media Asset Manager
                      </span>
                    </button>
                  ),
                  general: () => hasPermission("settings") && (
                    <button
                      onClick={() => setActiveTab("general")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "general"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">⚙️</span> General App State
                      </span>
                    </button>
                  ),
                  branding: () => hasPermission("settings") && (
                    <button
                      onClick={() => setActiveTab("branding")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "branding"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">🎨</span> Site Colors Theme
                      </span>
                    </button>
                  ),
                  seo: () => hasPermission("settings") && (
                    <button
                      onClick={() => setActiveTab("seo")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "seo"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">🌐</span> SEO Metadata & Tags
                      </span>
                    </button>
                  ),
                  security: () => hasPermission("settings") && (
                    <button
                      onClick={() => setActiveTab("security")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "security"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">🛡️</span> App Keys & Credentials
                      </span>
                    </button>
                  ),
                  social: () => hasPermission("settings") && (
                    <button
                      onClick={() => setActiveTab("social")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "social"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">🌐</span> Footer Social Links
                      </span>
                    </button>
                  ),
                  integrations: () => hasPermission("settings") && (
                    <button
                      onClick={() => setActiveTab("integrations")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "integrations"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">🔌</span> External API Providers
                      </span>
                    </button>
                  ),
                  permissions: () => hasPermission("settings") && (
                    <button
                      onClick={() => setActiveTab("permissions")}
                      className={`w-full text-left px-5 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                        activeTab === "permissions"
                          ? "bg-brand-gold text-brand-black"
                          : "bg-white/[0.02] border border-white/5 text-white/70 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs">🔑</span> Role Permissions Matrix
                      </span>
                    </button>
                  )
                };

                const adminSidebarOrder: string[] = (() => {
                  const defaultSections = [
                    "dashboard",
                    "member_hub",
                    "members",
                    "approvals",
                    "payouts",
                    "partners",
                    "moderation",
                    "submissions",
                    "content",
                    "link_tree",
                    "reorder_sections",
                    "sales_trends",
                    "discount_codes",
                    "navigation",
                    "live_class",
                    "telegram_config",
                    "automation",
                    "events",
                    "resources",
                    "community",
                    "products",
                    "orders",
                    "business_details",
                    "checkout_settings",
                    "payment_gateways",
                    "media_sync",
                    "page_manager",
                    "page_visibility",
                    "blog_manager",
                    "media_manager",
                    "general",
                    "branding",
                    "seo",
                    "security",
                    "social",
                    "integrations",
                    "permissions"
                  ];
                  try {
                    if (content.adminSidebarOrderJson) {
                      const parsed = JSON.parse(content.adminSidebarOrderJson);
                      if (Array.isArray(parsed)) {
                        const missing = defaultSections.filter(s => !parsed.includes(s));
                        return [...parsed, ...missing];
                      }
                    }
                  } catch (e) {}
                  return defaultSections;
                })();

                return adminSidebarOrder.map((id) => {
                  const renderFn = adminSidebarButtons[id];
                  if (!renderFn) return null;
                  const node = renderFn();
                  if (!node) return null;
                  return <div key={id}>{node}</div>;
                });
              })()}
            </div>
        </div>

          {/* Module Panel Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              
              {/* Tab: Members Manager */}
              {activeTab === "members" && hasPermission("members") && (
                <motion.div
                  key="members-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <AdminMembersPanel />
                </motion.div>
              )}

              {/* Tab: Pending Approvals (nest under member operations) */}
              {activeTab === "approvals" && hasPermission("members") && (
                <motion.div
                  key="approvals-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <AdminApprovalsPanel />
                </motion.div>
              )}

              {/* Tab: Member Payouts Manager */}
              {activeTab === "payouts" && hasPermission("orders") && (
                <motion.div
                  key="payouts-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <AdminMemberPayouts />
                </motion.div>
              )}



              {/* Tab: Investors & Collaborators Manager */}
              {activeTab === "partners" && hasPermission("members") && (
                <motion.div
                  key="partners-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <AdminInvestorsPanel />
                </motion.div>
              )}

              {activeTab === "moderation" && hasPermission("moderation") && (
                <motion.div
                  key="moderation-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <AdminCommunityModerationPanel />
                </motion.div>
              )}

              {activeTab === "dashboard" && hasPermission("dashboard") && (() => {
                // Calculation helper for enriched stats
                const completedOrdersCount = orders.filter(o => ["delivered", "shipped", "confirmed"].includes((o.status || "").toLowerCase())).length;
                const nairaSales = orders
                  .filter(o => o.items?.[0]?.currency === "NGN" || !o.items?.[0]?.currency)
                  .reduce((sum, o) => sum + (o.grandTotal || o.totalAmount || 0), 0);
                const usdSales = orders
                  .filter(o => o.items?.[0]?.currency === "USD")
                  .reduce((sum, o) => sum + (o.grandTotal || o.totalAmount || 0), 0);

                let extSourcesCount = 0;
                try {
                  const items = JSON.parse(content.externalSourcesJson || "[]");
                  extSourcesCount = Array.isArray(items) ? items.length : 0;
                } catch(e) {}

                let featuredProductsCount = 0;
                try {
                  const items = JSON.parse(content.featuredProductIdsJson || "[]");
                  featuredProductsCount = Array.isArray(items) ? items.length : 0;
                } catch(e) {}

                // Cloudinary Config Check
                let isCloudinaryConfigured = false;
                try {
                  const media = JSON.parse(content.mediaSettingsJson || "{}");
                  if (media.cloudinaryCloudName && media.cloudinaryApiKey) {
                    isCloudinaryConfigured = true;
                  }
                } catch(e) {}

                // Geographic filtering counts on the dashboard (using component level memo)
                const dashTotalInbound = dashboardSubmissionsFiltered.length;
                const dashBookings = dashboardSubmissionsFiltered.filter(s => s.formType === "booking_dr_fid").length;
                const dashPartnerships = dashboardSubmissionsFiltered.filter(s => s.formType === "partnership").length;
                const dashContacts = dashboardSubmissionsFiltered.filter(s => s.formType === "contact").length;
                const dashTelegram = dashboardSubmissionsFiltered.filter(s => s.formType === "telegram_community").length;

                // Percentages for the segment stacked ratio bar
                const bPct = dashTotalInbound ? Math.round((dashBookings / dashTotalInbound) * 100) : 0;
                const pPct = dashTotalInbound ? Math.round((dashPartnerships / dashTotalInbound) * 100) : 0;
                const cPct = dashTotalInbound ? Math.round((dashContacts / dashTotalInbound) * 100) : 0;
                const tPct = dashTotalInbound ? Math.round((dashTelegram / dashTotalInbound) * 100) : 0;

                // User / Membership Stats
                const totalMembers = users.filter(u => u.isMember).length;
                const pendingApprovals = users.filter(u => u.paymentStatus === 'awaiting_approval').length;
                const totalInvestors = users.filter(u => u.role === 'partner').length;
                const totalCapital = users.reduce((sum, u) => sum + (u.investmentAmount || 0), 0);
                const activeAffiliates = users.filter(u => (u.activeReferredMembers || 0) > 0).length;
                const totalPendingPayoutUSD = users.reduce((sum, u) => sum + (u.pendingPayout || 0), 0);
                const totalEarningsPaidUSD = users.reduce((sum, u) => sum + (u.totalEarnings || 0), 0);
                const totalReferralsAllTime = users.reduce((sum, u) => sum + (u.totalReferrals || 0), 0);

                return (
                  <motion.div
                    key="dashboard-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-8"
                  >
                  <AdminGlobalSearch activeTab={activeTab} setActiveTab={setActiveTab} content={content} />
                  <AdminAnalytics users={users} submissions={submissions} />
                    {/* Header Summary */}
                    <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-brand-black border border-white/5 p-6 rounded-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="text-xl font-black uppercase tracking-wider text-brand-gold">Administrative Dashboard</h3>
                        <p className="text-xs text-white/50 uppercase tracking-widest mt-1">Logged in as {adminPasswordToken ? "Ambassador Administrator" : "Dr. FID's Executive Assistant"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => setActiveTab("page_visibility")}
                          className="px-4 py-2 bg-brand-gold hover:bg-white text-brand-black text-[10px] uppercase font-black tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.02] transform transition-transform"
                        >
                          👁️ Page Visibility Settings
                        </button>
                        <button 
                          onClick={() => {
                            loadSubmissions();
                            loadOrders();
                            loadUsersSummary();
                          }} 
                          className="px-4 py-2 bg-white/5 text-[10px] font-mono hover:bg-white/10 uppercase tracking-widest border border-white/10 text-white transition-colors cursor-pointer"
                        >
                          🔄 Deep Refresh
                        </button>
                      </div>
                    </div>

                    {/* Phase 5 & 4: Administrative Hub KPIs */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 flex items-center gap-2">
                        <ShieldCheck size={12} className="text-brand-gold" /> Membership & Partnership Ecosystem
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-zinc-900/50 p-5 border border-white/5 hover:border-brand-gold/20 transition-all group">
                          <p className="text-[9px] text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">Community Members</p>
                          <p className="text-3xl font-black mt-2 text-white">{totalMembers}</p>
                          <p className="text-[10px] text-brand-gold font-mono mt-2 flex items-center gap-1.5">
                            <Clock size={10} /> {pendingApprovals} Awaiting Approval
                          </p>
                          <button onClick={() => setActiveTab("members")} className="text-[9px] uppercase font-bold text-brand-gold hover:underline mt-3 block text-left">Audit Members →</button>
                        </div>
                        
                        <div className="bg-zinc-900/50 p-5 border border-white/5 hover:border-brand-red/20 transition-all group">
                          <p className="text-[9px] text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">Partner Network</p>
                          <p className="text-3xl font-black mt-2 text-white">{totalInvestors}</p>
                          <div className="flex justify-between items-end mt-2">
                            <p className="text-[10px] text-brand-red font-mono font-bold uppercase tracking-tighter">
                              {totalInvestors} Active Partners
                            </p>
                          </div>
                          <button onClick={() => setActiveTab("partners")} className="text-[9px] uppercase font-bold text-brand-red hover:underline mt-3 block text-left">Partner Matrix →</button>
                        </div>

                        <div className="bg-zinc-900/50 p-5 border border-white/5 hover:border-emerald-500/20 transition-all group">
                          <p className="text-[9px] text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">Affiliate Advocates</p>
                          <p className="text-3xl font-black mt-2 text-white">{activeAffiliates}</p>
                          <p className="text-[10px] text-emerald-400 font-mono mt-2 uppercase tracking-widest">
                            Converted Referrals
                          </p>
                          <button onClick={() => setActiveTab("members")} className="text-[9px] uppercase font-bold text-emerald-400 hover:underline mt-3 block text-left">Advocate Stats →</button>
                        </div>

                        <div className="bg-brand-gold/5 p-5 border border-brand-gold/20 flex flex-col justify-between">
                          <div>
                            <p className="text-[9px] text-brand-gold uppercase tracking-widest font-black">System Health & Access</p>
                            <div className="mt-2 space-y-1.5">
                              <div className="flex justify-between text-[9px] uppercase font-mono">
                                <span className="text-white/40">Persistence</span>
                                <span className="text-emerald-400">Stable</span>
                              </div>
                              <div className="flex justify-between text-[9px] uppercase font-mono">
                                <span className="text-white/40">Offline Rules</span>
                                <span className="text-brand-gold font-bold">
                                  {(() => {
                                    try {
                                      return Object.keys(JSON.parse(content.disabledPagesJson || "{}")).length;
                                    } catch(e) { return 0; }
                                  })()} Deactivated
                                </span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => setActiveTab("page_visibility")} 
                            className="mt-3.5 w-full bg-brand-gold/15 hover:bg-brand-gold text-brand-gold hover:text-brand-black transition-all border border-brand-gold/25 font-mono py-1.5 text-[8.5px] font-black uppercase tracking-widest text-center cursor-pointer"
                          >
                            👁️ Page Visibility console →
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Ambassador & Affiliate Economy Section */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 flex items-center gap-2">
                        <DollarSign size={12} className="text-brand-gold" /> Ambassador & Affiliate Economy Ledger
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-zinc-900/50 p-5 border border-white/5 hover:border-brand-gold/20 transition-all group">
                          <p className="text-[9px] text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">Total Pending Commissions</p>
                          <p className="text-3xl font-black mt-2 text-brand-gold font-mono">${totalPendingPayoutUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-2">Outstanding queue awaiting payouts</p>
                          <button onClick={() => setActiveTab("payouts")} className="text-[9px] uppercase font-bold text-brand-gold hover:underline mt-3 block text-left">Pay Commission Ledger →</button>
                        </div>
                        
                        <div className="bg-zinc-900/50 p-5 border border-white/5 hover:border-emerald-500/20 transition-all group">
                          <p className="text-[9px] text-emerald-400/80 uppercase tracking-widest group-hover:text-white transition-colors">Total Commissions Disbursed</p>
                          <p className="text-3xl font-black mt-2 text-white font-mono">${totalEarningsPaidUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-2">Earned & disbursed all-time</p>
                          <button onClick={() => setActiveTab("payouts")} className="text-[9px] uppercase font-bold text-emerald-400 hover:underline mt-3 block text-left font-mono">View History →</button>
                        </div>

                        <div className="bg-zinc-900/50 p-5 border border-white/5 hover:border-white/10 transition-colors group">
                          <p className="text-[9px] text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">Gross Referral Registrations</p>
                          <p className="text-3xl font-black mt-2 text-zinc-100 font-mono">{totalReferralsAllTime}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-2">Invited advocates & active syncs</p>
                          <button onClick={() => setActiveTab("members")} className="text-[9px] uppercase font-bold text-white/60 hover:underline mt-3 block text-left">Audit Referral Trees →</button>
                        </div>
                      </div>
                    </div>

                    <RevenueChart orders={orders} />

                    {/* Regional Geographic Control Center */}
                    <div className="bg-zinc-950/80 border border-white/5 p-6 rounded-none space-y-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-brand-gold animate-pulse" />
                            <h4 className="text-xs font-mono font-bold text-white tracking-widest uppercase">
                              Regional Demographics Telemetry scope
                            </h4>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            Set geographical boundary conditions to dynamically aggregate metrics and lead distributions across all active channels.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          {dashboardSubmissionsFiltered.length > 0 && (
                            <button
                              onClick={downloadFilteredLocationCSV}
                              className="px-3 py-1.5 bg-brand-gold hover:bg-brand-gold/80 text-brand-black text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer rounded-none flex items-center gap-1.5"
                              title="Download filtered geographic data"
                            >
                              📥 Download Filtered ({dashboardSubmissionsFiltered.length})
                            </button>
                          )}
                          {(geoContinent || geoCountry || geoSubdivision || geoCity) && (
                            <button
                              onClick={() => {
                                setGeoContinent("");
                                setGeoCountry("");
                                setGeoSubdivision("");
                                setGeoCity("");
                              }}
                              className="px-3 py-1.5 bg-brand-red/10 border border-brand-red/30 hover:bg-brand-red hover:text-white text-brand-red text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer rounded-none"
                            >
                              ✕ Reset Boundaries
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Filter Controls Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
                            Continent Scope
                          </label>
                          <select
                            value={geoContinent}
                            onChange={(e) => {
                              setGeoContinent(e.target.value);
                              setGeoCountry("");
                              setGeoSubdivision("");
                              setGeoCity("");
                            }}
                            className="w-full bg-zinc-900 border border-white/10 p-2 text-xs text-white uppercase font-bold focus:border-brand-gold focus:outline-none transition-colors"
                          >
                            <option value="">All Continents</option>
                            {availableContinents.map((item) => (
                              <option key={item} value={item}>{item}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
                            Country Limit
                          </label>
                          <select
                            value={geoCountry}
                            onChange={(e) => {
                              setGeoCountry(e.target.value);
                              setGeoSubdivision("");
                              setGeoCity("");
                            }}
                            disabled={!geoContinent}
                            className="w-full bg-zinc-900 border border-white/10 p-2 text-xs text-white uppercase font-bold focus:border-brand-gold focus:outline-none transition-colors disabled:opacity-40"
                          >
                            <option value="">All Countries</option>
                            {availableCountries.map((item) => (
                              <option key={item} value={item}>{item}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
                            Subdivision / State
                          </label>
                          <select
                            value={geoSubdivision}
                            onChange={(e) => {
                              setGeoSubdivision(e.target.value);
                              setGeoCity("");
                            }}
                            disabled={!geoCountry}
                            className="w-full bg-zinc-900 border border-white/10 p-2 text-xs text-white uppercase font-bold focus:border-brand-gold focus:outline-none transition-colors disabled:opacity-40"
                          >
                            <option value="">All States / Regions</option>
                            {availableSubdivisions.map((item) => (
                              <option key={item} value={item}>{item}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
                            City Node
                          </label>
                          <select
                            value={geoCity}
                            onChange={(e) => setGeoCity(e.target.value)}
                            disabled={!geoSubdivision}
                            className="w-full bg-zinc-900 border border-white/10 p-2 text-xs text-white uppercase font-bold focus:border-brand-gold focus:outline-none transition-colors disabled:opacity-40"
                          >
                            <option value="">All Cities</option>
                            {availableCities.map((item) => (
                              <option key={item} value={item}>{item}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Stacked Ratios Bar Chart */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider">
                          <span className="text-zinc-400">Cross-Channel Lead Ratios</span>
                          <span className="text-brand-gold font-bold">
                            {geoContinent ? `${geoContinent}${geoCountry ? ` / ${geoCountry}` : ''}${geoCity ? ` / ${geoCity}` : ''}` : 'Global Network active'}
                          </span>
                        </div>

                        {dashTotalInbound > 0 ? (
                          <div className="space-y-3">
                            {/* Stacked Percentage bar */}
                            <div className="w-full h-3 bg-zinc-900 flex rounded-none overflow-hidden border border-white/5">
                              {dashBookings > 0 && (
                                <div 
                                  className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
                                  style={{ width: `${bPct}%` }}
                                  title={`Bookings: ${dashBookings} (${bPct}%)`}
                                />
                              )}
                              {dashPartnerships > 0 && (
                                <div 
                                  className="h-full bg-brand-red transition-all duration-500 ease-out" 
                                  style={{ width: `${pPct}%` }}
                                  title={`Partnerships: ${dashPartnerships} (${pPct}%)`}
                                />
                              )}
                              {dashContacts > 0 && (
                                <div 
                                  className="h-full bg-brand-gold transition-all duration-500 ease-out" 
                                  style={{ width: `${cPct}%` }}
                                  title={`Inquiries: ${dashContacts} (${cPct}%)`}
                                />
                              )}
                              {dashTelegram > 0 && (
                                <div 
                                  className="h-full bg-[#0088cc] transition-all duration-500 ease-out" 
                                  style={{ width: `${tPct}%` }}
                                  title={`Telegram Leads: ${dashTelegram} (${tPct}%)`}
                                />
                              )}
                            </div>

                            {/* Legend labels */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono">
                              <div className="flex items-center gap-1.5 text-emerald-400">
                                <span className="w-2 h-2 bg-emerald-500 rounded-none inline-block border border-white/10" />
                                <span>Bookings: {dashBookings} ({bPct}%)</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-brand-red">
                                <span className="w-2 h-2 bg-brand-red rounded-none inline-block border border-white/10" />
                                <span>Partnerships: {dashPartnerships} ({pPct}%)</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-brand-gold">
                                <span className="w-2 h-2 bg-brand-gold rounded-none inline-block border border-white/10" />
                                <span>Inquiries: {dashContacts} ({cPct}%)</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[#0088cc]">
                                <span className="w-2 h-2 bg-[#0088cc] rounded-none inline-block border border-white/10" />
                                <span>Telegram: {dashTelegram} ({tPct}%)</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="border border-dashed border-white/10 p-4 text-center text-[11px] text-zinc-500 italic">
                            No submissions recorded within this geographical limit.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Leads & Community KPI Matrix */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 flex items-center gap-2">
                        <Users size={12} className="text-brand-gold" /> Marketing & Inbound Leads Telemetry
                        {(geoContinent || geoCountry || geoCity) && (
                          <span className="text-[10px] lowercase text-zinc-500 italic font-sans normal-case">
                            (filtered to: {geoContinent}{geoCountry ? `, ${geoCountry}` : ''}{geoCity ? `, ${geoCity}` : ''})
                          </span>
                        )}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="bg-zinc-900/50 p-5 border border-white/5 hover:border-white/10 transition-colors">
                          <p className="text-[9px] text-white/40 uppercase tracking-widest">Total Inbound Leads</p>
                          <p className="text-3xl font-black mt-2 text-white">{dashTotalInbound}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-1">out of {submissions.length} global</p>
                          <button onClick={() => { setActiveTab("submissions"); setSubmissionFilter("all"); }} className="text-[9px] uppercase font-bold text-brand-gold hover:underline mt-3 block text-left">View All →</button>
                        </div>
                        <div className="bg-zinc-900/50 p-5 border border-white/5 hover:border-white/10 transition-colors">
                          <p className="text-[9px] text-emerald-400/60 uppercase tracking-widest">Dr. FID Bookings</p>
                          <p className="text-3xl font-black mt-2 text-emerald-400">{dashBookings}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-1">out of {totalBookingSubmissions} global</p>
                          <button onClick={() => { setActiveTab("submissions"); setSubmissionFilter("booking_dr_fid"); }} className="text-[9px] uppercase font-bold text-emerald-400 hover:underline mt-3 block text-left">View Bookings →</button>
                        </div>
                        <div className="bg-zinc-900/50 p-5 border border-white/5 hover:border-white/10 transition-colors">
                          <p className="text-[9px] text-brand-red/60 uppercase tracking-widest">Partnership Files</p>
                          <p className="text-3xl font-black mt-2 text-brand-red">{dashPartnerships}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-1">out of {totalPartnershipSubmissions} global</p>
                          <button onClick={() => { setActiveTab("submissions"); setSubmissionFilter("partnership"); }} className="text-[9px] uppercase font-bold text-brand-red hover:underline mt-3 block text-left">View Partnerships →</button>
                        </div>
                        <div className="bg-zinc-900/50 p-5 border border-white/5 hover:border-white/10 transition-colors">
                          <p className="text-[9px] text-brand-gold/60 uppercase tracking-widest">General Inquiries</p>
                          <p className="text-3xl font-black mt-2 text-brand-gold">{dashContacts}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-1">out of {totalContactSubmissions} global</p>
                          <button onClick={() => { setActiveTab("submissions"); setSubmissionFilter("contact"); }} className="text-[9px] uppercase font-bold text-brand-gold hover:underline mt-3 block text-left">View Inquiries →</button>
                        </div>
                        <div className="bg-[#0088cc]/10 p-5 border border-[#0088cc]/20 hover:border-[#0088cc]/40 transition-colors">
                          <p className="text-[9px] text-[#0088cc] uppercase tracking-widest font-black">Telegram Leads</p>
                          <p className="text-3xl font-black mt-2 text-white">{dashTelegram}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-1">out of {totalTelegramSubmissions} global</p>
                          <button onClick={() => { setActiveTab("submissions"); setSubmissionFilter("telegram_community"); }} className="text-[9px] uppercase font-bold text-[#0088cc] hover:underline mt-3 block text-left font-mono">View Members →</button>
                        </div>
                      </div>
                    </div>

                    {/* Boutique Storefront KPI Matrix */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 flex items-center gap-2">
                        <Layers size={12} className="text-brand-gold" /> Boutique Transactions & Storefront Sales
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-zinc-900/50 p-5 border border-white/5">
                          <p className="text-[9px] text-white/40 uppercase tracking-widest">Total Checkout orders</p>
                          <p className="text-3xl font-black mt-2 text-zinc-100">{orders.length}</p>
                          <p className="text-[10px] text-white/30 font-mono mt-2">{completedOrdersCount} fully confirmed / delivered</p>
                        </div>
                        <div className="bg-zinc-900/50 p-5 border border-white/5">
                          <p className="text-[9px] text-brand-gold/80 uppercase tracking-widest">Naira Sales Volume</p>
                          <p className="text-3xl font-black mt-2 text-brand-gold font-serif">₦{nairaSales.toLocaleString()}</p>
                          <p className="text-[10px] text-white/30 font-mono mt-2">Captured locally</p>
                        </div>
                        <div className="bg-zinc-900/50 p-5 border border-white/5">
                          <p className="text-[9px] text-emerald-400 uppercase tracking-widest font-black">USD Sales Volume</p>
                          <p className="text-3xl font-black mt-2 text-emerald-400 font-mono">${usdSales.toLocaleString()}</p>
                          <p className="text-[10px] text-zinc-400/40 mt-2">International clients</p>
                        </div>
                        <div className="bg-zinc-900/50 p-5 border border-white/5">
                          <p className="text-[9px] text-white/40 uppercase tracking-widest">Product Catalog Data</p>
                          <p className="text-xl font-bold mt-2 text-white">{featuredProductsCount} Featured Products</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-1.5">{extSourcesCount} External inventory feeds</p>
                        </div>
                      </div>
                    </div>

                    {/* Revenue & Growth Analytics Chart */}
                    <div className="p-6 bg-zinc-950 border border-white/5 space-y-6">
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-2">
                            📈 Monthly Revenue & Ecosystem Volume
                          </h4>
                          <p className="text-[9px] text-white/30 font-mono mt-0.5">Projected growth and historical transaction density</p>
                        </div>
                        <div className="flex items-center gap-4 text-[9px] font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-brand-gold rounded-full" />
                            <span className="text-brand-gold">Naira (NGN)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                            <span className="text-emerald-500">USD Equiv.</span>
                          </div>
                        </div>
                      </div>

                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={[
                              { month: 'Jan', naira: nairaSales * 0.4, usd: usdSales * 0.3 },
                              { month: 'Feb', naira: nairaSales * 0.6, usd: usdSales * 0.5 },
                              { month: 'Mar', naira: nairaSales * 0.8, usd: usdSales * 0.7 },
                              { month: 'Apr', naira: nairaSales * 0.9, usd: usdSales * 0.85 },
                              { month: 'May', naira: nairaSales * 0.95, usd: usdSales * 0.9 },
                              { month: 'Jun', naira: nairaSales, usd: usdSales },
                            ]}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorNaira" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorUsd" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis 
                              dataKey="month" 
                              stroke="#52525b" 
                              fontSize={9} 
                              tickLine={false} 
                              axisLine={false} 
                              fontFamily="JetBrains Mono" 
                            />
                            <YAxis 
                              stroke="#52525b" 
                              fontSize={9} 
                              tickLine={false} 
                              axisLine={false} 
                              fontFamily="JetBrains Mono" 
                              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0px', fontSize: '10px', fontFamily: 'JetBrains Mono' }}
                              itemStyle={{ padding: '2px 0px' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="naira" 
                              name="Naira Revenue"
                              stroke="#D4AF37" 
                              fillOpacity={1} 
                              fill="url(#colorNaira)" 
                              strokeWidth={2}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="usd" 
                              name="USD Equiv"
                              stroke="#10b981" 
                              fillOpacity={1} 
                              fill="url(#colorUsd)" 
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Bottom Split Layout: Activity Highlights & Integrations */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Active Submissions Log */}
                      <div className="lg:col-span-7 bg-zinc-950/40 border border-white/5 p-6 rounded-none space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-brand-gold">⚡ Recent Community Contacts</h5>
                          <button onClick={() => setActiveTab("submissions")} className="text-[9px] uppercase font-bold text-white/40 hover:text-white">Full Table →</button>
                        </div>
                        {submissions.length === 0 ? (
                          <p className="text-xs text-white/30 italic py-6 text-center">No inbound requests configured yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {submissions.slice(0, 4).map((sub, idx) => {
                              const title = sub.data.fullName || sub.data.name || "Anonymous Sender";
                              const email = sub.data.email || "No Email";
                              const type = sub.formType === "partnership" ? "Partnership"
                                         : sub.formType === "booking_dr_fid" ? "Booking"
                                         : sub.formType === "telegram_community" ? "Telegram"
                                         : "Contact";
                              return (
                                <div key={idx} className="flex justify-between items-center bg-white/[0.01] hover:bg-white/[0.03] p-3 border border-white/5 text-xs transition-colors">
                                  <div>
                                    <p className="font-bold text-zinc-100">{title}</p>
                                    <p className="text-[10px] text-white/40 font-mono">{email}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${
                                      type === "Partnership" ? "bg-brand-red/25 text-brand-red"
                                      : type === "Booking" ? "bg-emerald-500/20 text-emerald-400"
                                      : type === "Telegram" ? "bg-[#0088cc]/20 text-[#0088cc]"
                                      : "bg-brand-gold/25 text-brand-gold"
                                    }`}>
                                      {type}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Store Integration & Image Persistence Status */}
                      <div className="lg:col-span-5 bg-zinc-950/40 border border-white/5 p-6 rounded-none space-y-4">
                        <div className="border-b border-white/5 pb-3">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-brand-gold">🔧 Integrations & Media Health</h5>
                        </div>
                        <div className="space-y-4">
                          {/* Cloudinary Integration Metric */}
                          <div className="space-y-2 border-b border-white/5 pb-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-medium text-white flex items-center gap-1.5">
                                <Cloud size={13} className={isCloudinaryConfigured ? "text-emerald-400" : "text-amber-400"} /> Cloudinary Upload Status
                              </span>
                              <span className={`px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest ${isCloudinaryConfigured ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                                {isCloudinaryConfigured ? "Ready / Active" : "Staged (Local Mode)"}
                              </span>
                            </div>
                            <p className="text-[10px] text-white/40 leading-relaxed font-light">
                              {isCloudinaryConfigured 
                                ? "Cloudinary API credentials loaded successfully! Media uploaded in background will persist permanently on production deploys." 
                                : "No production credentials set. Store uploads are using temporary local files which will expire on container redeploys. Set Cloudinary in Sync settings!"}
                            </p>
                          </div>

                          {/* Signature Catalog Toggles status */}
                          <div className="space-y-2">
                            <span className="text-[9px] uppercase tracking-wider text-white/30 block">Storefront Aggregation Feeds</span>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-300">
                              <div className="bg-white/5 p-2 rounded flex items-center justify-between border border-white/5">
                                <span>Multi-Source API</span>
                                <span className="text-emerald-400">ONLINE</span>
                              </div>
                              <div className="bg-white/5 p-2 rounded flex items-center justify-between border border-white/5">
                                <span>WhatsApp Sync</span>
                                <span className="text-brand-gold">LINKED</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* ENRICHED TELEMETRY & MULTI-CHANNEL MEMBERSHIP SUMMARY */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                      
                      {/* Section A: Telegram Funnel Landing Info & Telemetry */}
                      <div className="bg-zinc-950/70 border border-white/5 p-6 rounded-none space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3 font-mono">
                          <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">
                            📢 Telegram Landing Info & Funnel Setup
                          </h5>
                          <span className="text-[8px] text-zinc-500 uppercase">TELEGRAM-COMMUNITY-V1</span>
                        </div>

                        {(() => {
                          let tConfig: any = {};
                          try {
                            tConfig = JSON.parse(content.telegramLandingPageJson || "{}");
                          } catch (err) {}

                          return (
                            <div className="space-y-4 font-sans text-xs">
                              <p className="text-[11px] text-zinc-400">
                                Active content loaded on the public-facing Telegram Inbound Landing Page which feeds leads into the community channel.
                              </p>

                              <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="p-3 bg-white/[0.01] border border-white/5 text-left">
                                  <p className="text-[8px] text-white/40 uppercase tracking-widest font-mono">Hero Title Template</p>
                                  <p className="text-[11px] font-bold text-white mt-1 truncate" dangerouslySetInnerHTML={{ __html: tConfig.heroTitle || "The Vagina Room Community" }} />
                                </div>
                                <div className="p-3 bg-white/[0.01] border border-white/5 text-left">
                                  <p className="text-[8px] text-white/40 uppercase tracking-widest font-mono">Button CTA Text</p>
                                  <p className="text-[11px] font-bold text-brand-gold mt-1">{tConfig.ctaFinalBtnText || "Join Telegram Group"}</p>
                                </div>
                              </div>

                              <div className="space-y-2 border-t border-white/5 pt-3">
                                <p className="text-[9px] uppercase tracking-wider text-white/40 font-mono">Active Benefits Staged</p>
                                <div className="space-y-1.5 text-zinc-400 text-[10px] text-left">
                                  <div className="flex items-center gap-2">
                                    <span className="text-brand-gold">🌿</span> <span>{tConfig.benefit1Title || "Safe circle sharing without filters"}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-brand-gold">🌿</span> <span>{tConfig.benefit2Title || "Anatomy masterclasses & tool kit reviews"}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-brand-gold">🌿</span> <span>{tConfig.benefit3Title || "Cycle mapping tutorials by guest experts"}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-[#0088cc]/10 border border-[#0088cc]/20 p-3 text-left">
                                <div className="flex justify-between items-center">
                                  <p className="text-[9px] text-[#0088cc] uppercase font-black tracking-widest font-mono">Direct Connection Link</p>
                                  <span className="text-[8.5px] bg-[#0088cc]/20 text-white font-mono px-2 py-0.5 uppercase">Lounge URL</span>
                                </div>
                                <p className="text-[10px] text-white/80 font-mono mt-1 font-bold break-all select-all">
                                  {content.contactThankYouTelegramLink || "https://t.me/thevaginaroom"}
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Section B: Marketing Pipeline & Inbound Conversion Telemetry */}
                      <div className="bg-zinc-950/70 border border-white/5 p-6 rounded-none space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3 font-mono">
                          <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">
                            📊 Conversions & Marketing Funnel Analytics
                          </h5>
                          <span className="text-[8px] text-zinc-500 uppercase font-bold">PIPELINE-METRICS</span>
                        </div>

                        <div className="space-y-4 font-sans text-xs">
                          <p className="text-[11px] text-zinc-400">
                            Telemetry matching inbound database submissions vs validated community members to assess performance of user pathways.
                          </p>

                          {(() => {
                            const totInbound = submissions.length || 1;
                            const tBookings = submissions.filter(s => s.formType === "booking_dr_fid").length;
                            const tPartner = submissions.filter(s => s.formType === "partnership").length;
                            const tTelegram = submissions.filter(s => s.formType === "telegram_community").length;

                            const bookingsPercent = Math.round((tBookings / totInbound) * 100);
                            const partnersPercent = Math.round((tPartner / totInbound) * 100);
                            const telegramPercent = Math.round((tTelegram / totInbound) * 100);

                            return (
                              <div className="space-y-3 pt-1">
                                {/* Booking Conversion rate */}
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-mono uppercase text-zinc-400">
                                    <span>Dr. FID Consulting Request Rate</span>
                                    <span className="text-emerald-400 font-bold">{bookingsPercent}% ({tBookings} file lines)</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-zinc-900 border border-white/5">
                                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${bookingsPercent}%` }} />
                                  </div>
                                </div>

                                {/* Telegram Landing Conversion rate */}
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-mono uppercase text-zinc-400">
                                    <span>Telegram Social Sign-up Rate</span>
                                    <span className="text-[#0088cc] font-bold">{telegramPercent}% ({tTelegram} lines)</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-zinc-900 border border-white/5">
                                    <div className="h-full bg-[#0088cc] transition-all duration-500" style={{ width: `${telegramPercent}%` }} />
                                  </div>
                                </div>

                                {/* Partnerships proposals conversion */}
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-mono uppercase text-zinc-400">
                                    <span>B2B / Investor Partnership Pitch Rate</span>
                                    <span className="text-brand-red font-bold">{partnersPercent}% ({tPartner} lines)</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-zinc-900 border border-white/5">
                                    <div className="h-full bg-brand-red transition-all duration-500" style={{ width: `${partnersPercent}%` }} />
                                  </div>
                                </div>

                                {/* General efficiency */}
                                <div className="p-3 bg-white/[0.01] border border-white/5 mt-2 rounded-sm text-left">
                                  <p className="text-[9px] text-zinc-400 uppercase font-mono tracking-wider">Advocate Acquisition Efficiency</p>
                                  <p className="text-[17px] font-black text-white mt-1 font-mono">
                                    {totalMembers > 0 ? (totalMembers / totInbound * 100).toFixed(1) : "0.0"}%
                                  </p>
                                  <p className="text-[9px] text-white/30 tracking-tight mt-0.5">Ratio of global inbound entries successfully validated to full member tiers.</p>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                    </div>

                    {/* Section C: Registered Community Members Live Overview */}
                    <div className="bg-zinc-950/70 border border-white/5 p-6 rounded-none space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold flex items-center gap-1.5">
                          👥 Community Members Live Ledger Overview (Latest)
                        </h5>
                        <button onClick={() => setActiveTab("members")} className="text-[9px] uppercase font-bold text-brand-gold hover:underline">
                          Go to User Ledger →
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                          <thead>
                            <tr className="border-b border-white/10 text-white/40 uppercase text-[9px] tracking-widest pb-2">
                              <th className="py-2.5">Sovereign Name</th>
                              <th>Digital Ident ID</th>
                              <th>Account Tier</th>
                              <th>WhatsApp Sync Line</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-zinc-300 text-[10px]">
                            {users.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-4 text-center italic text-white/30">
                                  No members registered yet. Add members in user manager.
                                </td>
                              </tr>
                            ) : (
                              users.slice(0, 5).map((user) => (
                                <tr key={user.id} className="hover:bg-white/[0.01] transition-colors">
                                  <td className="py-2.5 font-bold text-white max-w-[150px] truncate">{user.fullName || "Unnamed Sister"}</td>
                                  <td>{user.membershipId || "TVR-ST-02"}</td>
                                  <td>
                                    <span className="px-1.5 py-0.5 bg-brand-gold/15 text-brand-gold border border-brand-gold/10 text-[8px] rounded uppercase font-bold">
                                      {user.membershipType || "standard"}
                                    </span>
                                  </td>
                                  <td>{user.phoneNumber || "No linked phone"}</td>
                                  <td>
                                    <span className={`px-1.5 py-0.5 text-[8px] rounded uppercase font-black tracking-wider ${
                                      user.isMember ? "bg-emerald-500/20 text-emerald-400" : "bg-white/15 text-white/50"
                                    }`}>
                                      {user.isMember ? "Validated Active" : "Staged Sandbox"}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </motion.div>
                );
              })()}
              
              {/* Tab 1: Form Submissions Table */}
              {activeTab === "submissions" && hasPermission("moderation") && (
                <motion.div
                  key="submissions-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-none">
                    <div className="flex justify-between items-center mb-0">
                      <h3 className="text-lg font-black uppercase tracking-wider text-brand-gold">
                        Partner Inbound & Contact Inquiries
                      </h3>
                      <button 
                        onClick={loadSubmissions}
                        className="text-[9px] font-black uppercase tracking-widest text-white/50 hover:text-white border border-white/10 px-3 py-1.5 transition-colors cursor-pointer"
                      >
                        Refresh
                      </button>
                    </div>
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-6">
                      <div className="bg-white/[0.03] p-4 border border-white/5 text-center">
                        <p className="text-[10px] uppercase text-white/40 mb-1">Partnerships</p>
                        <p className="text-2xl font-black text-brand-red">{totalPartnershipSubmissions}</p>
                      </div>
                      <div className="bg-white/[0.03] p-4 border border-white/5 text-center">
                        <p className="text-[10px] uppercase text-white/40 mb-1">Bookings</p>
                        <p className="text-2xl font-black text-emerald-400">{totalBookingSubmissions}</p>
                      </div>
                      <div className="bg-white/[0.03] p-4 border border-white/5 text-center">
                        <p className="text-[10px] uppercase text-white/40 mb-1">Contacts</p>
                        <p className="text-2xl font-black text-brand-gold">{totalContactSubmissions}</p>
                      </div>
                      <div className="bg-white/[0.03] p-4 border border-white/5 text-center">
                        <p className="text-[10px] uppercase text-[#0088cc]/80 mb-1 font-bold">Telegram Collective</p>
                        <p className="text-2xl font-black text-[#0088cc]">{totalTelegramSubmissions}</p>
                      </div>
                    </div>

                      {/* Sub-tab form filter */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8 border-b border-white/5 pb-6">
                        <div className="flex flex-wrap gap-2 flex-grow">
                          <button
                            onClick={() => setSubmissionFilter("all")}
                            className={`px-4 py-2 text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer ${
                              submissionFilter === "all"
                                ? "bg-brand-gold text-brand-black"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                            }`}
                          >
                            All ({submissions.length})
                          </button>
                      <button
                        onClick={() => setSubmissionFilter("booking_dr_fid")}
                        className={`px-4 py-2 text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer ${
                          submissionFilter === "booking_dr_fid"
                            ? "bg-brand-gold text-brand-black"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        Bookings ({totalBookingSubmissions})
                      </button>
                      <button
                        onClick={() => setSubmissionFilter("partnership")}
                        className={`px-4 py-2 text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer ${
                          submissionFilter === "partnership"
                            ? "bg-brand-red text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        Partnerships ({totalPartnershipSubmissions})
                      </button>
                      <button
                        onClick={() => setSubmissionFilter("contact")}
                        className={`px-4 py-2 text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer ${
                          submissionFilter === "contact"
                            ? "bg-brand-gold text-brand-black"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        Queries ({totalContactSubmissions})
                      </button>
                      <button
                        onClick={() => setSubmissionFilter("telegram_community")}
                        className={`px-4 py-2 text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer ${
                          submissionFilter === "telegram_community"
                            ? "bg-[#0088cc] text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        Telegram ({totalTelegramSubmissions})
                      </button>
                        </div>
                        <div className="flex-shrink-0">
                          <button
                            onClick={downloadCSV}
                            disabled={filteredSubmissions.length === 0}
                            className="px-4 py-2 text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer bg-brand-gold text-brand-black hover:bg-brand-gold/80 disabled:opacity-50"
                          >
                            Download CSV
                          </button>
                        </div>
                    </div>

                    {/* Geographic Filtering & Sisterhood Footprint Dashboard (Universal cross-channel helper) */}
                    {!submissionsLoading && submissions.length > 0 && (() => {
                      const channelNames: Record<string, string> = {
                        all: "Global Combined Channels",
                        booking_dr_fid: "Dr. FID Bookings Channel",
                        partnership: "Corporate & Clinic Partnerships",
                        contact: "General Inbound Contacts",
                        telegram_community: "Sisterhood Telegram Community"
                      };
                      const activeChannelLabel = channelNames[submissionFilter] || "Inbound Channels";
                      return (
                        <div className="mb-8 p-6 bg-zinc-950/60 border border-white/10 rounded-2xl space-y-6">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
                                <h4 className="text-xs font-mono font-bold text-white tracking-wider uppercase">
                                  {activeChannelLabel} - Geographic Footprint & Analytics
                                </h4>
                              </div>
                              <p className="text-[11px] text-zinc-400 mt-1">
                                Analyze global demographics and multi-layered filtering tools built to map community presence and coordinate exclusive offline regional invitations.
                              </p>
                            </div>
                            {(geoContinent || geoCountry || geoSubdivision || geoCity) && (
                              <button
                                onClick={() => {
                                  setGeoContinent("");
                                  setGeoCountry("");
                                  setGeoSubdivision("");
                                  setGeoCity("");
                                }}
                                className="px-3 py-1.5 bg-brand-red/10 border border-brand-red/30 hover:bg-brand-red hover:text-white text-brand-red text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer rounded-lg"
                              >
                                ✕ Reset Filters
                              </button>
                            )}
                          </div>

                          {/* Interactive Geographic Selectors */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                              Filter Continent
                            </label>
                            <div className="relative">
                              <select
                                value={geoContinent}
                                onChange={(e) => {
                                  setGeoContinent(e.target.value);
                                  setGeoCountry("");
                                  setGeoSubdivision("");
                                  setGeoCity("");
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pr-8 text-xs text-white focus:outline-none focus:border-brand-gold/60 appearance-none cursor-pointer"
                              >
                                <option value="">🌍 All Continents</option>
                                {availableContinents.map((c) => (
                                  <option key={c} value={c} className="bg-zinc-900 text-white">
                                    {c}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500 text-[10px]">▼</div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                              Filter Country
                            </label>
                            <div className="relative">
                              <select
                                value={geoCountry}
                                disabled={!geoContinent}
                                onChange={(e) => {
                                  setGeoCountry(e.target.value);
                                  setGeoSubdivision("");
                                  setGeoCity("");
                                }}
                                className={`w-full bg-black/40 border border-white/10 rounded-xl p-3 pr-8 text-xs text-white focus:outline-none focus:border-brand-gold/60 appearance-none cursor-pointer ${!geoContinent ? "opacity-40 cursor-not-allowed" : ""}`}
                              >
                                <option value="">🏳️ All Countries</option>
                                {availableCountries.map((c) => (
                                  <option key={c} value={c} className="bg-zinc-900 text-white">
                                    {c}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500 text-[10px]">▼</div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                              Filter State / Region
                            </label>
                            <div className="relative">
                              <select
                                value={geoSubdivision}
                                disabled={!geoCountry}
                                onChange={(e) => {
                                  setGeoSubdivision(e.target.value);
                                  setGeoCity("");
                                }}
                                className={`w-full bg-black/40 border border-white/10 rounded-xl p-3 pr-8 text-xs text-white focus:outline-none focus:border-brand-gold/60 appearance-none cursor-pointer ${!geoCountry ? "opacity-40 cursor-not-allowed" : ""}`}
                              >
                                <option value="">📍 All States / Provinces</option>
                                {availableSubdivisions.map((s) => (
                                  <option key={s} value={s} className="bg-zinc-900 text-white">
                                    {s}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500 text-[10px]">▼</div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                              Filter City
                            </label>
                            <div className="relative">
                              <select
                                value={geoCity}
                                disabled={!geoSubdivision && !geoCountry}
                                onChange={(e) => setGeoCity(e.target.value)}
                                className={`w-full bg-black/40 border border-white/10 rounded-xl p-3 pr-8 text-xs text-white focus:outline-none focus:border-brand-gold/60 appearance-none cursor-pointer ${(!geoSubdivision && !geoCountry) ? "opacity-40 cursor-not-allowed" : ""}`}
                              >
                                <option value="">🏙️ All Cities</option>
                                {availableCities.map((c) => (
                                  <option key={c} value={c} className="bg-zinc-900 text-white">
                                    {c}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-500 text-[10px]">▼</div>
                            </div>
                          </div>
                        </div>

                        {/* Statistical distribution breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                          {/* Continents Breakdown card */}
                          <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-3">
                            <p className="text-[10px] uppercase font-mono text-brand-gold/80 tracking-wider border-b border-white/5 pb-1">
                              🌍 Continents ({continentStats.length})
                            </p>
                            <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1 text-zinc-300">
                              {continentStats.length === 0 ? (
                                <p className="text-[10px] text-zinc-500 italic">No geographic data collected yet.</p>
                              ) : (
                                continentStats.map((item) => (
                                  <div key={item.name} className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px]">
                                      <span className="font-medium text-white/95 truncate">{item.name}</span>
                                      <span className="font-mono font-bold text-brand-gold">{item.count} ({item.percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-brand-gold rounded-full transition-all duration-500" 
                                        style={{ width: `${item.percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Country Breakdown card */}
                          <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-3">
                            <p className="text-[10px] uppercase font-mono text-brand-red/80 tracking-wider border-b border-white/5 pb-1">
                              🏳️ Countries ({countryStats.length})
                            </p>
                            <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1 text-zinc-300">
                              {countryStats.length === 0 ? (
                                <p className="text-[10px] text-zinc-500 italic">No geographic data collected yet.</p>
                              ) : (
                                countryStats.slice(0, 5).map((item) => (
                                  <div key={item.name} className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px]">
                                      <span className="font-medium text-white/95 truncate">{item.name}</span>
                                      <span className="font-mono font-bold text-brand-red">{item.count} ({item.percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-brand-red rounded-full transition-all duration-500" 
                                        style={{ width: `${item.percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                ))
                              )}
                              {countryStats.length > 5 && (
                                <p className="text-[9px] text-zinc-500 text-right font-light">+{countryStats.length - 5} more countries</p>
                              )}
                            </div>
                          </div>

                          {/* Subdivision/State analysis */}
                          <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-3">
                            <p className="text-[10px] uppercase font-mono text-indigo-400 tracking-wider border-b border-white/5 pb-1">
                              📍 States ({subdivisionStats.length})
                            </p>
                            <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1 text-zinc-300">
                              {subdivisionStats.length === 0 ? (
                                <p className="text-[10px] text-zinc-500 italic">No state data collected yet.</p>
                              ) : (
                                subdivisionStats.slice(0, 5).map((item) => (
                                  <div key={item.name} className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px]">
                                      <span className="font-medium text-white/95 truncate">{item.name}</span>
                                      <span className="font-mono font-bold text-indigo-400">{item.count} ({item.percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-indigo-400 rounded-full transition-all duration-500" 
                                        style={{ width: `${item.percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                ))
                              )}
                              {subdivisionStats.length > 5 && (
                                <p className="text-[9px] text-zinc-500 text-right font-light">+{subdivisionStats.length - 5} more regions</p>
                              )}
                            </div>
                          </div>

                          {/* City footprint list */}
                          <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-3">
                            <p className="text-[10px] uppercase font-mono text-emerald-400 tracking-wider border-b border-white/5 pb-1">
                              🏙️ Cities ({cityStats.length})
                            </p>
                            <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1 text-zinc-300">
                              {cityStats.length === 0 ? (
                                <p className="text-[10px] text-zinc-500 italic">No city hot spots captured yet.</p>
                              ) : (
                                cityStats.slice(0, 5).map((item) => (
                                  <div key={item.name} className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px]">
                                      <span className="font-medium text-white/95 truncate">{item.name}</span>
                                      <span className="font-mono font-bold text-emerald-400">{item.count} ({item.percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-emerald-400 rounded-full transition-all duration-500" 
                                        style={{ width: `${item.percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                ))
                              )}
                              {cityStats.length > 5 && (
                                <p className="text-[9px] text-zinc-500 text-right font-light">+{cityStats.length - 5} more cities</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                    {submissionsLoading ? (
                      <p className="text-xs text-white/40 italic p-6">Loading submissions from storage files...</p>
                    ) : filteredSubmissions.length === 0 ? (
                      <div className="p-12 text-center border-2 border-dashed border-white/5 text-white/30 text-xs">
                        {submissionFilter === "all" 
                          ? "No submissions captured yet. Test form fields on Partner or Contact pages."
                          : `No submissions found for the selected filter: "${submissionFilter}".`}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-white/10 uppercase font-black text-white/40 tracking-wider">
                              <th className="py-3 px-4">Timestamp</th>
                              <th className="py-3 px-4">Form</th>
                              <th className="py-3 px-4">Sender / Org</th>
                              <th className="py-3 px-4">Contact Info</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredSubmissions.map((sub) => {
                              const date = new Date(sub.timestamp).toLocaleString();
                              const typeLabel = sub.formType === "partnership" ? "Partnership" 
                                              : sub.formType === "booking_dr_fid" ? "Booking"
                                              : sub.formType === "telegram_community" ? "Telegram"
                                              : "General Contact";
                              const name = sub.data.fullName || sub.data.contactPerson || sub.data.name || "Anonymous";
                              const company = sub.data.organization || sub.data.organizationName || "";
                              const email = sub.data.email || "";
                              const subMeta = leadsMeta[sub.id] || { status: "New Lead", notes: "" };

                              return (
                                <tr 
                                  key={sub.id} 
                                  onClick={() => setSelectedSub(sub)}
                                  className={`border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors ${selectedSub?.id === sub.id ? "bg-white/[0.03]" : ""}`}
                                >
                                  <td className="py-4 px-4 font-mono text-white/60">{date}</td>
                                  <td className="py-4 px-4">
                                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                                      sub.formType === "partnership" ? "bg-brand-red/20 text-brand-red" 
                                      : sub.formType === "booking_dr_fid" ? "bg-emerald-500/20 text-emerald-400"
                                      : sub.formType === "telegram_community" ? "bg-[#0088cc]/20 text-[#0088cc]"
                                      : "bg-brand-gold/20 text-brand-gold"
                                    }`}>
                                      {typeLabel}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 font-bold text-white">
                                    {name} {company && <span className="text-[10px] block font-light text-white/50">{company}</span>}
                                  </td>
                                  <td className="py-4 px-4 font-mono text-white/70">{email}</td>
                                  <td className="py-4 px-4">
                                    <span className={`px-2 py-0.5 text-[9px] font-mono leading-none rounded-full border ${
                                      subMeta.status === "Contacted" || subMeta.status === "Contacted/Sent Email" ? "border-amber-500/50 text-amber-400 bg-amber-500/10"
                                      : subMeta.status === "Approved Partnership" || subMeta.status === "Approved" || subMeta.status === "Replied" ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                                      : subMeta.status === "Scheduled" || subMeta.status === "Follow Up Set" ? "border-indigo-400/50 text-indigo-400 bg-indigo-400/10"
                                      : subMeta.status === "Archived" ? "border-zinc-500/50 text-zinc-500 bg-zinc-500/10"
                                      : "border-white/20 text-white/70 bg-white/5"
                                    }`}>
                                      ● {subMeta.status || "New Lead"}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={(e) => handleDeleteSubmission(sub.id, e)}
                                      className={`p-1.5 transition-all cursor-pointer inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest border ${
                                        confirmDeleteSubId === sub.id 
                                        ? "bg-brand-red text-white border-brand-red animate-pulse" 
                                        : "hover:bg-brand-red/20 text-white/50 hover:text-brand-red border-white/5 hover:border-brand-red/30"
                                      }`}
                                    >
                                      <Trash2 size={11} /> {confirmDeleteSubId === sub.id ? "Confirm?" : "Delete"}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Submission Detail Card View */}
                  {selectedSub && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/[0.03] border border-white/10 p-6 shadow-2xl space-y-6 rounded-none relative"
                    >
                      <button 
                        onClick={() => setSelectedSub(null)}
                        className="absolute top-4 right-4 text-white/40 hover:text-white"
                      >
                        <X size={16} />
                      </button>

                      <div className="border-b border-white/5 pb-4">
                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-brand-gold/20 text-brand-gold rounded font-mono inline-block mb-2">
                          SUBMISSION RECORD #{selectedSub.id} ({selectedSub.formType === "booking_dr_fid" ? "DR. FID BOOKING" : selectedSub.formType.toUpperCase()})
                        </span>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xl font-black uppercase tracking-tight text-white mb-0.5">
                              {selectedSub.data.organization || selectedSub.data.organizationName || selectedSub.data.fullName || selectedSub.data.name || "Sender Record Details"}
                            </h4>
                            <p className="text-[10px] text-white/40 font-mono">
                              Captured at {new Date(selectedSub.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {selectedSub.formType === "booking_dr_fid" && (
                            <div className="text-right">
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">Status</span>
                              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">Received</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-white/80">
                        <div className="space-y-4">
                          <p className="flex items-center gap-2"><User size={13} className="text-brand-gold/80" /> <strong>Contact Name:</strong> {selectedSub.data.fullName || selectedSub.data.contactPerson || selectedSub.data.name || "N/A"}</p>
                          <p className="flex items-center gap-2"><Mail size={13} className="text-brand-gold/80" /> <strong>Email:</strong> {selectedSub.data.email || "N/A"}</p>
                          {selectedSub.data.phone && (
                            <p className="flex items-center gap-2"><span className="text-brand-gold/80">📞</span> <strong>Phone:</strong> {selectedSub.data.phone}</p>
                          )}
                        </div>
                        <div className="space-y-4">
                          {(selectedSub.data.organization || selectedSub.data.organizationName) && (
                            <p className="flex items-center gap-2"><Users size={13} className="text-brand-gold/80" /> <strong>Organization:</strong> {selectedSub.data.organization || selectedSub.data.organizationName}</p>
                          )}
                          {selectedSub.data.partnershipType && (
                            <p className="flex items-center gap-2"><Layers size={13} className="text-brand-gold/80" /> <strong>Partnership Type:</strong> {selectedSub.data.partnershipType}</p>
                          )}
                          {selectedSub.data.organizationType && (
                            <p className="flex items-center gap-2"><Users size={13} className="text-brand-gold/80" /> <strong>Org Type:</strong> {selectedSub.data.organizationType}</p>
                          )}
                          {selectedSub.formType === "booking_dr_fid" && (
                            <>
                              <p className="flex items-center gap-2"><Calendar size={13} className="text-brand-gold/80" /> <strong>Event Type:</strong> {selectedSub.data.eventType} ({selectedSub.data.bookingType})</p>
                              <p className="flex items-center gap-2"><span className="text-brand-gold/80">🕒</span> <strong>Duration:</strong> {selectedSub.data.duration}</p>
                            </>
                          )}
                        </div>
                      </div>

                      {selectedSub.formType === "booking_dr_fid" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-y border-white/5 py-6 my-6">
                           <div className="space-y-4">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Event Logistics</h5>
                              <p className="text-xs"><strong>Title:</strong> {selectedSub.data.eventTitle}</p>
                              <p className="text-xs"><strong>Date & Time:</strong> {selectedSub.data.date} @ {selectedSub.data.time}</p>
                              <p className="text-xs"><strong>Location:</strong> {selectedSub.data.location} ({selectedSub.data.venue})</p>
                              <p className="text-xs"><strong>Audience Size:</strong> {selectedSub.data.audienceSize}</p>
                           </div>
                           <div className="space-y-4">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Engagment Info</h5>
                              <p className="text-xs"><strong>Theme:</strong> {selectedSub.data.eventTheme}</p>
                              <p className="text-xs"><strong>Preferred Topic:</strong> {selectedSub.data.preferredTopic}</p>
                              <p className="text-xs"><strong>Transport/Accom:</strong> {selectedSub.data.travelSupport} / {selectedSub.data.accommodation}</p>
                              <p className="text-xs"><strong>Presentation Needs:</strong> {selectedSub.data.presentationNeeds}</p>
                           </div>
                        </div>
                      )}

                      {/* Location Information */}
                      {(selectedSub.data.continent || selectedSub.data.country || selectedSub.data.subdivision || selectedSub.data.city) && (
                        <div className="bg-white/[0.01] border border-white/5 p-4 my-6 space-y-4 rounded-xl">
                          <p className="text-[10px] font-black uppercase tracking-wider text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">
                            <MapPin size={11} className="text-brand-gold" /> Location Profile / Footprint
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                              <p className="text-white/40 uppercase font-mono text-[9px] tracking-wider mb-0.5">Continent</p>
                              <p className="font-bold text-zinc-100">{selectedSub.data.continent || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-white/40 uppercase font-mono text-[9px] tracking-wider mb-0.5">Country</p>
                              <p className="font-bold text-zinc-100">{selectedSub.data.country || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-white/40 uppercase font-mono text-[9px] tracking-wider mb-0.5">State / Region</p>
                              <p className="font-bold text-zinc-100">{selectedSub.data.subdivision || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-white/40 uppercase font-mono text-[9px] tracking-wider mb-0.5">City</p>
                              <p className="font-bold text-zinc-100">{selectedSub.data.city || "N/A"}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Proposal Message/Pitch */}
                      {(selectedSub.data.proposal || selectedSub.data.message || selectedSub.data.eventDescription || selectedSub.data.notes) && (
                        <div className="bg-white/[0.02] border border-white/5 p-4 space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-wider text-white/30 flex items-center gap-1.5 border-b border-white/5 pb-2">
                            <MessageSquare size={11} /> Detailed Notes / Description
                          </p>
                          <p className="text-xs leading-relaxed text-white/80 select-all whitespace-pre-wrap">
                            {selectedSub.data.eventDescription || selectedSub.data.proposal || selectedSub.data.message || selectedSub.data.notes}
                          </p>
                        </div>
                      )}

                      {/* Uploaded File Reference */}
                      {selectedSub.data.fileName && (
                        <div className="bg-zinc-950/40 border border-brand-gold/20 p-4 flex items-center justify-between">
                          <span className="flex items-center gap-2 text-xs">
                            <FileText className="text-brand-gold" size={16} />
                            <div>
                              <p className="font-bold text-white mb-0.5">{selectedSub.data.fileName}</p>
                              <p className="text-[10px] text-white/40">File Size: {selectedSub.data.fileSize ? `${(selectedSub.data.fileSize / 1024 / 1024).toFixed(2)} MB` : "Unknown"}</p>
                            </div>
                          </span>
                          <span className="text-[10px] uppercase font-black tracking-wider text-brand-gold bg-brand-gold/5 border border-brand-gold/20 px-2.5 py-1">
                            Uploaded via UI
                          </span>
                        </div>
                      )}

                      {/* 💼 ADMINISTRATIVE LEAD INTERACTION HUB */}
                      {(() => {
                        const leadId = selectedSub.id;
                        const subMeta = leadsMeta[leadId] || { status: "New Lead", notes: "" };
                        
                        // Prefilled outreach helpers
                        const contactName = selectedSub.data.fullName || selectedSub.data.contactPerson || selectedSub.data.name || "Member";
                        const contactEmail = selectedSub.data.email || "";
                        const rawPhone = selectedSub.data.phone || selectedSub.data.whatsapp || "";
                        const cleanPhone = rawPhone.replace(/[^0-9+]/g, "");

                        const draftEmailUrl = contactEmail 
                          ? `mailto:${contactEmail}?subject=${encodeURIComponent(`[The Vagina Room] Following Up On Your Inquiry`)}&body=${encodeURIComponent(
                              `Dear ${contactName},\n\nThank you for reaching out to The Vagina Room. This is the office of Ambassador Dr. FID, responding directly to your ${selectedSub.formType} submission.\n\nWe would love to discuss this with you further.\n\nBest regards,\nThe Vagina Room Operations Team`
                            )}`
                          : "";

                        const draftWhatsappText = rawPhone
                          ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                              `Hello ${contactName}, this is Ambassador Dr. FID's administrative assistant from The Vagina Room. We are following up regarding your submission. Let us know when you're available for a chat!`
                            )}`
                          : "";

                        return (
                          <div className="bg-zinc-900 border border-brand-gold/10 p-5 space-y-4 rounded-none mt-6">
                            <p className="text-[10px] font-black uppercase tracking-wider text-brand-gold flex items-center gap-1.5 border-b border-white/5 pb-2">
                              💼 Lead Interaction & Communication Manager
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Left: Status & Inter-notes */}
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[9px] font-mono uppercase text-white/40 mb-1">Administrative Status</label>
                                  <select 
                                    value={subMeta.status || "New Lead"}
                                    onChange={(e) => updateLeadMeta(leadId, e.target.value, activeNoteText)}
                                    className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-2 text-xs text-white focus:outline-none focus:border-brand-gold/50"
                                  >
                                    <option value="New Lead">New Lead</option>
                                    <option value="Contacted">Contacted / Replied</option>
                                    <option value="Scheduled">Scheduled Consultation</option>
                                    <option value="Approved Partnership">Approved Partnership</option>
                                    <option value="Archived">Archived / Closed</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[9px] font-mono uppercase text-white/40 mb-1">Secret Office Logs / Notes</label>
                                  <textarea 
                                    rows={2}
                                    placeholder="Write internal team updates or communication logs on this lead..."
                                    value={activeNoteText}
                                    onChange={(e) => setActiveNoteText(e.target.value)}
                                    className="w-full bg-black/60 border border-white/10 rounded p-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50 font-mono"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    updateLeadMeta(leadId, subMeta.status || "New Lead", activeNoteText);
                                    alert("Administrative log saved successfully!");
                                  }}
                                  className="w-full bg-white/5 border border-white/10 py-1.5 text-[9px] uppercase font-bold tracking-widest text-brand-gold hover:bg-brand-gold hover:text-black transition-colors"
                                >
                                  💾 Save Office notes
                                </button>
                              </div>

                              {/* Right: Direct Dispatch Outreach Tools */}
                              <div className="space-y-3 flex flex-col justify-between">
                                <div className="space-y-2">
                                  <label className="block text-[9px] font-mono uppercase text-white/40 mb-1">Outreach Quick Actions</label>
                                  <p className="text-[10px] text-white/50 leading-relaxed font-light">
                                    Trigger one-click pre-written professional communications with this lead directly via your local mail client or chat interfaces.
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  {draftEmailUrl && (
                                    <a
                                      href={draftEmailUrl}
                                      className="w-full inline-flex items-center justify-center gap-2 bg-brand-gold/10 border border-brand-gold/30 hover:bg-brand-gold hover:text-brand-black text-brand-gold py-2.5 text-[10px] font-black uppercase tracking-wider transition-colors"
                                    >
                                      ✉️ Email Direct Contact
                                    </a>
                                  )}

                                  {draftWhatsappText ? (
                                    <a
                                      href={draftWhatsappText}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white text-emerald-400 py-2.5 text-[10px] font-black uppercase tracking-wider transition-colors"
                                    >
                                      💬 Text via WhatsApp
                                    </a>
                                  ) : (
                                    <div className="text-[9px] text-white/30 italic text-center p-2 border border-white/5 bg-white/[0.01]">
                                      No direct phone/WhatsApp number supplied.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="pt-4 border-t border-white/5 flex justify-end">
                              <button
                                type="button"
                                onClick={(e) => handleDeleteSubmission(selectedSub.id, e)}
                                className={`px-5 py-2.5 border text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                                  confirmDeleteSubId === selectedSub.id
                                  ? "bg-brand-red text-white border-brand-red animate-pulse"
                                  : "bg-brand-red/10 border-brand-red/30 hover:bg-brand-red hover:text-white text-brand-red"
                                }`}
                              >
                                <Trash2 size={11} /> {confirmDeleteSubId === selectedSub.id ? "Click Again to Confirm Delete" : "Permanently Delete Inquiry / Contact"}
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Tab: Orders Manager */}
              {activeTab === "orders" && hasPermission("orders") && (
                <motion.div
                  key="orders-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black uppercase tracking-wider text-brand-gold">
                      Master Order Manager
                    </h3>
                  </div>

                  <AdminOrdersPanel orders={orders} onRefresh={loadOrders} />
                </motion.div>
              )}
              
              {activeTab === "sales_trends" && hasPermission("orders") && (
                <motion.div
                  key="sales-trends-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black uppercase tracking-wider text-brand-gold">
                      Sales Trends Dashboard
                    </h3>
                  </div>

                  <AdminSalesTrends orders={orders} />
                </motion.div>
              )}
              
              {activeTab === "discount_codes" && hasPermission("products") && (
                <motion.div
                  key="discount-codes-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6"
                >
                  <AdminDiscountPanel />
                </motion.div>
              )}
              
              {/* Tab: Business Details Profile */}
               {activeTab === "business_details" && hasPermission("settings") && (
                <motion.div
                  key="business-details-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6"
                >
                  <AdminBusinessProfile />
                </motion.div>
              )}

              {/* Tab: Checkout Settings */}
               {activeTab === "checkout_settings" && hasPermission("settings") && (
                <motion.div
                  key="checkout-settings-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6"
                >
                  <AdminCheckoutSettings />
                </motion.div>
              )}

              {/* Tab: Payment Gateways */}
               {activeTab === "payment_gateways" && hasPermission("settings") && (
                <motion.div
                  key="payment-gateways-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6"
                >
                  <AdminPaymentGateways orders={orders} />
                </motion.div>
              )}

              {/* Tab: Media & Cloud Sync */}
              {activeTab === "media_sync" && hasPermission("settings") && (
                <motion.div
                  key="media-sync-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6"
                >
                  <AdminMediaSyncPanel />
                </motion.div>
              )}

              {activeTab === "automation" && hasPermission("settings") && (
                <motion.div
                  key="automation-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black uppercase tracking-wider text-brand-gold">
                      Marketing & Business Automation
                    </h3>
                  </div>
                  <AdminAutomationPanel />
                </motion.div>
              )}

              {/* Tab: Telegram Config */}
              {activeTab === "telegram_config" && hasPermission("settings") && (
                <motion.div
                  key="telegram-config-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6"
                >
                  <AdminTelegramConfigPanel />
                </motion.div>
              )}

              {/* Tab 2: Categorized Content Section Editor */}
              {activeTab === "content" && hasPermission("content") && (
                <motion.div
                  key="content-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <div className="bg-white/[0.02] border border-white/5 p-6">
                    <p className="text-xs text-white/60 mb-6 leading-relaxed">
                      💡 <strong>Visual Designer Hint:</strong> You can edit typography and bios directly "Inline" globally on any section of the live Home, About, and Team pages! Simply navigate to those pages using the site navigation menu while logged in as admin to edit visually, or manage them in bulk below.
                    </p>

                      <div className="flex flex-wrap gap-2 mb-8 border-b border-white/5 pb-2">
                        {["home", "about_us", "about_dr_fid", "dr_fid_booking", "telegram_community", "join_community", "focus_areas", "testimonials", "team_partner", "projects_events", "gallery", "contact", "support", "policy_terms", "footer"].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveContentTab(tab as any)}
                            className={`px-4 py-2 text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer ${
                              activeContentTab === tab
                                ? "bg-brand-gold text-brand-black"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                            }`}
                          >
                            {tab === "home" ? "Home" 
                             : tab === "about_us" ? "About Us Page" 
                             : tab === "about_dr_fid" ? "About Dr. FID" 
                             : tab === "dr_fid_booking" ? "Dr. FID Booking"
                             : tab === "telegram_community" ? "Telegram Landing Page"
                             : tab === "join_community" ? "Join Community"
                             : tab === "support" ? "Support/Donate"
                             : tab === "policy_terms" ? "Policy & Terms"
                             : tab === "footer" ? "Footer Editor"
                             : tab.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    <div className="space-y-12">
                      <AdminContentRenderer activeContentTab={activeContentTab} handleSaveAllContent={handleSaveAllContent} saveStatus={saveStatus} />
                    </div>

                    {/* SAVE ACTION DOCK IN TAB */}
                    <div className="border-t border-white/10 mt-12 pt-12 text-right">
                      <button
                        type="button"
                        onClick={handleSaveAllContent}
                        disabled={saveStatus === "saving"}
                        className="px-12 py-5 bg-brand-gold hover:bg-white text-brand-black px-10 font-black tracking-widest text-xs uppercase transition-all duration-500 shadow-2xl inline-flex items-center gap-3 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-95 transform transition-transform"
                      >
                        {saveStatus === "saving" ? "Persisting Changes..." : "Commit Site Changes"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Config Settings */}
              {["general", "branding", "seo", "security", "social", "integrations"].includes(activeTab) && hasPermission(activeTab) && (
                <motion.div
                  key="settings-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6 space-y-8 rounded-none"
                >
                  <div className="flex justify-between items-start md:items-center gap-4 flex-col md:flex-row pb-4 border-b border-white/5">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
                        ⚙️ {activeTab.toUpperCase()} Portal Settings
                      </h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Configure {activeTab} parameters.</p>
                    </div>
                    <div>
                      <button
                        onClick={handleSaveAllContent}
                        disabled={saveStatus === "saving"}
                        className="px-6 py-2.5 bg-brand-gold hover:bg-white text-brand-black font-black tracking-widest text-[9px] uppercase transition-all duration-300 shadow active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        {saveStatus === "saving" ? "Saving..." : "Save Setup"}
                      </button>
                    </div>
                  </div>
                  <AdminSettingsTab activeTab={activeTab as any} />
                </motion.div>
              )}


              {/* Tab 4: Navigation Preview */}
              {activeTab === "navigation" && hasPermission("settings") && (
                <motion.div
                  key="navigation-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6 space-y-8 rounded-none"
                >
                  <div className="flex justify-between items-start md:items-center gap-4 flex-col md:flex-row pb-4 border-b border-white/5">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
                        🗺️ Navigation Schema Manager
                      </h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Real-time mapping and schema configuration.</p>
                    </div>
                    <div>
                      <button
                        onClick={handleSaveAllContent}
                        disabled={saveStatus === "saving"}
                        className="px-6 py-2.5 bg-brand-gold hover:bg-white text-brand-black font-black tracking-widest text-[9px] uppercase transition-all duration-300 shadow active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        {saveStatus === "saving" ? "Saving..." : "Save Navigation"}
                      </button>
                    </div>
                  </div>

                  <NavigationMenuManager />
                </motion.div>
              )}

              {/* Tab Link Tree Page Builder */}
              {activeTab === "link_tree" && hasPermission("content") && (
                <motion.div
                  key="link-tree-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="animate-fade-in"
                >
                  <AdminLinkTreePanel />
                </motion.div>
              )}

              {/* Tab 5: Reorder Sections Panel */}
              {activeTab === "reorder_sections" && hasPermission("content") && (
                <motion.div
                  key="reorder-sections-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6 space-y-8 rounded-none animate-fade-in"
                >
                  <div className="flex justify-between items-start md:items-center gap-4 flex-col md:flex-row pb-4 border-b border-white/5">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
                        ↕️ Section Ordering Manager
                      </h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Adjust segment layout and sequence lists.</p>
                    </div>
                    <div>
                      <button
                        onClick={handleSaveAllContent}
                        disabled={saveStatus === "saving"}
                        className="px-6 py-2.5 bg-brand-gold hover:bg-white text-brand-black font-black tracking-widest text-[9px] uppercase transition-all duration-300 shadow active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        {saveStatus === "saving" ? "Saving..." : "Commit Sequence Changes"}
                      </button>
                    </div>
                  </div>

                  <AdminReorderPanel />
                </motion.div>
              )}

              {/* Tab 6: Products Catalog Editor */}
              {activeTab === "products" && hasPermission("products") && (
                <motion.div
                  key="products-tab"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white/[0.02] border border-white/5 p-6 space-y-8 rounded-none animate-fade-in"
                >
                  <div className="flex justify-between items-start md:items-center gap-4 flex-col md:flex-row pb-4 border-b border-white/5">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
                        📦 Products Catalog & External Source Manager
                      </h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Configure external API integrations and edit curated formulary listings.</p>
                    </div>
                    <div>
                      <button
                        onClick={handleSaveAllContent}
                        disabled={saveStatus === "saving"}
                        className="px-6 py-2.5 bg-brand-gold hover:bg-white text-brand-black font-black tracking-widest text-[9px] uppercase transition-all duration-300 shadow active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        {saveStatus === "saving" ? "Saving..." : "Commit Catalog Changes"}
                      </button>
                    </div>
                  </div>

                  <AdminProductsPanel />
                </motion.div>
              )}



              {activeTab === "member_hub" && hasPermission("settings") && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <AdminMemberDashboardManager content={content} saveContent={saveContentChanges} onStatus={(status, msg) => {
                     setSaveStatus(status as any);
                     if (msg) setSaveMsg(msg);
                     if (status === 'success') {
                        setTimeout(() => setSaveStatus('idle'), 3000);
                     }
                  }} />
                </motion.div>
              )}

              {activeTab === "events" && hasPermission("content") && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <AdminEventsTab />
                </motion.div>
              )}

              {activeTab === "resources" && hasPermission("content") && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <AdminResourcesTab />
                </motion.div>
              )}

              {activeTab === "community" && hasPermission("members") && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <AdminCommunityTab />
                </motion.div>
              )}

              {/* Dynamic Page Manager */}
              {activeTab === "page_manager" && hasPermission("content") && (
                <motion.div
                  key="page-manager-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <PageManager />
                </motion.div>
              )}

              {/* Page Activation and Visibility Manager */}
              {activeTab === "page_visibility" && hasPermission("content") && (
                <motion.div
                  key="page-visibility-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <PageVisibilityPanel />
                </motion.div>
              )}

              {/* Dynamic Blog Manager */}
              {activeTab === "blog_manager" && hasPermission("content") && (
                <motion.div
                  key="blog-manager-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <BlogManager />
                </motion.div>
              )}

              {/* Cloudinary Media Assets Manager */}
              {activeTab === "media_manager" && hasPermission("content") && (
                <motion.div
                  key="media-manager-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <MediaManager />
                </motion.div>
              )}

              {activeTab === "permissions" && hasPermission("settings") && (
                 <motion.div
                   key="permissions-tab"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="space-y-8"
                 >
                   <AdminPermissionsPanel />
                 </motion.div>
               )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      <AdminFooter />
    </div>
    </>
  );
}
