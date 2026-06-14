import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { ImageUploader } from './ImageUploader';
import { Eye, EyeOff, Database, Download } from 'lucide-react';
import { InputGroup } from '../ui/InputGroup';

interface AdminSettingsTabProps {
  activeTab: "general" | "branding" | "seo" | "security" | "social" | "integrations";
}

export default function AdminSettingsTab({ activeTab }: AdminSettingsTabProps) {
  const { content, updateContentField, saveContentChanges, exportDatabaseToJson } = useContent();
  const [showPassword, setShowPassword] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const parseJSON = (jsonString: string, fallback: any) => {
    try {
      if (!jsonString) return fallback;
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON:", jsonString, e);
      return fallback;
    }
  };

  const [systemStatus, setSystemStatus] = useState<any>(() => {
    try {
      // Synchronously check configuration on mount to prevent layout/status flickering
      const mediaConf = JSON.parse(content.mediaSettingsJson || "{}");
      const payConf = JSON.parse(content.paymentSettingsJson || "{}");
      const smtpConf = JSON.parse(content.smtpSettingsJson || "{}");
      
      const hasCloudinary = !!(
        mediaConf?.cloudinaryCloudName || 
        mediaConf?.cloudinaryApiKey || 
        mediaConf?.cloudinaryApiSecret ||
        localStorage.getItem("cloudinary_config")
      );
      
      const hasPaystack = !!(
        payConf?.storePaystackPublicKey || 
        payConf?.storePaystackSecretKey || 
        payConf?.membershipPaystackPublicKey || 
        payConf?.membershipPaystackSecretKey
      );

      const hasFlutterwave = !!(
        payConf?.storeFlutterwaveSecretKey || 
        payConf?.membershipFlutterwaveSecretKey
      );

      const hasSmtp = !!(
        smtpConf?.host || 
        smtpConf?.user || 
        smtpConf?.pass
      );

      return {
        status: 'online',
        database: 'connected (client-side)',
        firestore: true,
        cloudinary: hasCloudinary,
        paystack: hasPaystack,
        flutterwave: hasFlutterwave,
        smtp: hasSmtp
      };
    } catch {
      return {
        status: 'online',
        database: 'connected (client-side)',
        firestore: true,
        cloudinary: false,
        paystack: false,
        flutterwave: false,
        smtp: false
      };
    }
  });
  const [statusLoading, setStatusLoading] = useState(false);

  const handleExportDatabase = async () => {
    setExporting(true);
    try {
      const data = await exportDatabaseToJson();
      const backupFilename = `tvr_firestore_backup_${new Date().toISOString().split("T")[0]}.json`;
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", backupFilename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      console.log("Database backup exported successfully!");
    } catch (e: any) {
      console.error("Export database failed:", e);
      alert("Failed to export database: " + e.message);
    } finally {
      setExporting(false);
    }
  };

  const refreshStatus = React.useCallback(async () => {
    setStatusLoading(true);
    try {
      const mediaConf = parseJSON(content.mediaSettingsJson, {});
      const payConf = parseJSON(content.paymentSettingsJson, {});
      const smtpConf = parseJSON(content.smtpSettingsJson, {});

      // 1. Check Cloudinary Configured
      const hasCloudinary = !!(
        mediaConf?.cloudinaryCloudName || 
        mediaConf?.cloudinaryApiKey || 
        mediaConf?.cloudinaryApiSecret ||
        localStorage.getItem("cloudinary_config")
      );

      // 2. Check Database Connected (Firestore)
      // Since the admin dashboard relies on Firestore to save config/content, firestore is connected.
      const hasFirestore = true;

      // 3. Check Paystack Configured
      const hasPaystack = !!(
        payConf?.storePaystackPublicKey || 
        payConf?.storePaystackSecretKey || 
        payConf?.membershipPaystackPublicKey || 
        payConf?.membershipPaystackSecretKey
      );

      // 4. Check Flutterwave Configured
      const hasFlutterwave = !!(
        payConf?.storeFlutterwaveSecretKey || 
        payConf?.membershipFlutterwaveSecretKey
      );

      // 5. Check SMTP Configured
      const hasSmtp = !!(
        smtpConf?.host || 
        smtpConf?.user || 
        smtpConf?.pass
      );

      setSystemStatus({
        status: 'online',
        database: 'connected (client-side)',
        storage: hasCloudinary ? 'configured' : 'not-configured',
        cloudinary: hasCloudinary,
        firestore: hasFirestore,
        paystack: hasPaystack,
        flutterwave: hasFlutterwave,
        smtp: hasSmtp
      });
    } catch (err) {
      console.error("Failed to fetch system status", err);
    } finally {
      setStatusLoading(false);
    }
  }, [content.mediaSettingsJson, content.paymentSettingsJson, content.smtpSettingsJson]);

  React.useEffect(() => {
    if (activeTab === 'integrations') {
      refreshStatus();
    }
  }, [activeTab, content.mediaSettingsJson, content.paymentSettingsJson, content.smtpSettingsJson, refreshStatus]);

  const updateJSONField = async (configKey: string, field: string, value: any) => {
    console.log("Updating field:", configKey, field, value);
    const current = parseJSON((content as any)[configKey], {});
    const updated = { ...current, [field]: value };
    const jsonString = JSON.stringify(updated, null, 2);
    console.log("New JSON string:", jsonString);
    await saveContentChanges({ [configKey]: jsonString });
  };

  if (activeTab === "general") {
    const config = parseJSON(content.generalSettingsJson, {});
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Site Name</label>
            <input 
              type="text" 
              value={config.siteName || ""}
              onChange={(e) => updateJSONField("generalSettingsJson", "siteName", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block tracking-widest">Slogan / Tagline</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={config.slogan || ""}
                onChange={(e) => updateJSONField("generalSettingsJson", "slogan", e.target.value)}
                className="flex-grow bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                placeholder="e.g. Empowering Wellness & Intimacy"
              />
              <button
                onClick={() => updateJSONField("generalSettingsJson", "showHeaderSlogan", !config.showHeaderSlogan)}
                className={`px-4 text-[9px] font-black uppercase tracking-widest border transition-all ${
                  config.showHeaderSlogan 
                    ? "bg-brand-gold border-brand-gold text-brand-black" 
                    : "bg-transparent border-white/10 text-white/40 hover:text-white"
                }`}
              >
                {config.showHeaderSlogan ? "Header: ON" : "Header: OFF"}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Support Email</label>
            <input 
              type="email" 
              value={config.supportEmail || ""}
              onChange={(e) => updateJSONField("generalSettingsJson", "supportEmail", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
            />
          </div>
          <div className="flex justify-between items-center bg-black/40 p-3 border border-white/5 mt-2">
              <div>
                <p className="text-[10px] font-black uppercase text-white">Enable User Signups</p>
                <p className="text-[8px] text-white/30 uppercase tracking-tighter">Allow new members to register on the website</p>
              </div>
              <button
                type="button"
                onClick={() => updateJSONField("generalSettingsJson", "signupsEnabled", config.signupsEnabled !== false ? false : true)}
                className={`w-10 h-5 relative rounded-full transition-colors ${config.signupsEnabled !== false ? 'bg-brand-gold' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.signupsEnabled !== false ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex justify-between items-center bg-black/40 p-3 border border-white/5 mt-2">
              <div>
                <p className="text-[10px] font-black uppercase text-brand-red">Global Maintenance Mode</p>
                <p className="text-[8px] text-white/30 uppercase tracking-tighter">Redirect visitors to the offline sanctuary placeholder page</p>
              </div>
              <button
                type="button"
                onClick={() => updateJSONField("generalSettingsJson", "maintenanceMode", !config.maintenanceMode)}
                className={`w-10 h-5 relative rounded-full transition-colors ${config.maintenanceMode ? 'bg-brand-red' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.maintenanceMode ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
        </div>
        <div className="border-t border-white/5 pt-6 mt-6">
          <h3 className="text-sm font-black uppercase text-brand-gold mb-4">Membership Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Gold Plan Price (₦ - NGN)</label>
              <input 
                type="text" 
                value={content.membershipPriceGoldNGN || "25000"}
                onChange={(e) => updateContentField("membershipPriceGoldNGN", e.target.value)}
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                placeholder="25000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Gold Plan Price ($ - USD)</label>
              <input 
                type="text" 
                value={content.membershipPriceGoldUSD || "45"}
                onChange={(e) => updateContentField("membershipPriceGoldUSD", e.target.value)}
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                placeholder="45"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Diamond Plan Price (₦ - NGN)</label>
              <input 
                type="text" 
                value={content.membershipPriceDiamondNGN || "85000"}
                onChange={(e) => updateContentField("membershipPriceDiamondNGN", e.target.value)}
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                placeholder="85000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Diamond Plan Price ($ - USD)</label>
              <input 
                type="text" 
                value={content.membershipPriceDiamondUSD || "150"}
                onChange={(e) => updateContentField("membershipPriceDiamondUSD", e.target.value)}
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                placeholder="150"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Support Phone</label>
            <input 
              type="text"
              value={config.supportPhone || ""}
              onChange={(e) => updateJSONField("generalSettingsJson", "supportPhone", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">WhatsApp Phone</label>
            <input 
              type="text" 
              value={config.whatsappPhone || ""}
              onChange={(e) => updateJSONField("generalSettingsJson", "whatsappPhone", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
              placeholder="e.g. +2348012345678"
            />
            <p className="text-[8px] text-brand-gold/50 uppercase tracking-widest leading-relaxed">Ensure full international format starting with '+' for global sync.</p>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">WhatsApp Method</label>
            <select
               value={config.whatsappMethod || "REDIRECT"}
               onChange={(e) => updateJSONField("generalSettingsJson", "whatsappMethod", e.target.value)}
               className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
            >
                <option value="REDIRECT">Redirect (wa.me)</option>
                <option value="API">Direct API (Requires Setup)</option>
            </select>
          </div>
          {config.whatsappMethod === "API" && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">WhatsApp API Key</label>
                <input 
                  type="password"
                  value={config.whatsappApiKey || ""}
                  onChange={(e) => updateJSONField("generalSettingsJson", "whatsappApiKey", e.target.value)}
                  className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">WhatsApp Business ID</label>
                <input 
                  type="text"
                  value={config.whatsappBusinessId || ""}
                  onChange={(e) => updateJSONField("generalSettingsJson", "whatsappBusinessId", e.target.value)}
                  className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Timezone</label>
            <select 
              value={config.timezone || "UTC+1 (Lagos)"}
              onChange={(e) => updateJSONField("generalSettingsJson", "timezone", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
            >
              <option value="UTC+1 (Lagos)">UTC+1 (Lagos)</option>
              <option value="GMT">GMT</option>
              <option value="EST">EST</option>
              <option value="PST">PST</option>
            </select>
          </div>
        </div>

        {/* E-commerce & Member Benefits */}
        <div className="border border-white/5 bg-white/[0.01] p-5 space-y-4">
          <div>
            <h4 className="text-xs font-black text-brand-gold uppercase tracking-[0.2em]">E-commerce & Member Benefits</h4>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Control automated discounts and digital fulfillment policies</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-black/40 p-3 border border-white/5">
                <div>
                  <p className="text-[10px] font-black uppercase text-white">Enable Member Discounts</p>
                  <p className="text-[8px] text-white/30 uppercase tracking-tighter">Automatic price reduction for verified sisters</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateJSONField("generalSettingsJson", "memberDiscountEnabled", config.memberDiscountEnabled === false)}
                  className={`w-10 h-5 relative rounded-full transition-colors ${config.memberDiscountEnabled !== false ? 'bg-brand-gold' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.memberDiscountEnabled !== false ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Member Discount Percentage (%)</label>
                <div className="flex gap-2">
                  <input 
                    type="range" min="0" max="50" step="1"
                    value={config.memberDiscountPercent || 10}
                    onChange={(e) => updateJSONField("generalSettingsJson", "memberDiscountPercent", parseInt(e.target.value))}
                    className="flex-grow accent-brand-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer mt-3"
                  />
                  <span className="text-brand-gold font-mono text-[11px] w-8 text-right self-center">{config.memberDiscountPercent || 10}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-black/40 p-3 border border-white/5">
                <div>
                  <p className="text-[10px] font-black uppercase text-white">Direct E-book Redirect</p>
                  <p className="text-[8px] text-white/30 uppercase tracking-tighter">Redirect to download page immediately after payment success</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateJSONField("generalSettingsJson", "autoRedirectDigital", config.autoRedirectDigital === false)}
                  className={`w-10 h-5 relative rounded-full transition-colors ${config.autoRedirectDigital !== false ? 'bg-brand-gold' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.autoRedirectDigital !== false ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Digital Receipt Greeting</label>
                <textarea 
                  value={config.digitalReceiptNote || "Thank you for supporting the community. Your digital resources are linked below for immediate use."}
                  onChange={(e) => updateJSONField("generalSettingsJson", "digitalReceiptNote", e.target.value)}
                  rows={2}
                  className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-[10px] italic font-sans" 
                  placeholder="Greeting included in the digital delivery email..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Manual Payment / Bank Transfer Settings */}
        <div className="border border-white/5 bg-white/[0.01] p-5 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <h4 className="text-xs font-black text-brand-gold uppercase tracking-[0.2em]">Bank Transfer Configuration</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Separate disbursement endpoints for memberships and products</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/50">A. Membership Subscriptions</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Bank Name</label>
                <input 
                  type="text" 
                  value={config.membershipBankName || config.bankName || ""}
                  onChange={(e) => updateJSONField("generalSettingsJson", "membershipBankName", e.target.value)}
                  placeholder="e.g. Access Bank"
                  className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Account Name</label>
                <input 
                  type="text" 
                  value={config.membershipAccountName || config.accountName || ""}
                  onChange={(e) => updateJSONField("generalSettingsJson", "membershipAccountName", e.target.value)}
                  placeholder="e.g. TVR Community"
                  className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Account Number</label>
                <input 
                  type="text" 
                  value={config.membershipAccountNumber || config.accountNumber || ""}
                  onChange={(e) => updateJSONField("generalSettingsJson", "membershipAccountNumber", e.target.value)}
                  placeholder="e.g. 0123456789"
                  className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/50">B. Product Store (Digital & Physical)</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Bank Name</label>
                <input 
                  type="text" 
                  value={config.storeBankName || config.bankName || ""}
                  onChange={(e) => updateJSONField("generalSettingsJson", "storeBankName", e.target.value)}
                  placeholder="e.g. Zenith Bank"
                  className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Account Name</label>
                <input 
                  type="text" 
                  value={config.storeAccountName || config.accountName || ""}
                  onChange={(e) => updateJSONField("generalSettingsJson", "storeAccountName", e.target.value)}
                  placeholder="e.g. TVR Micro-Shop"
                  className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Account Number</label>
                <input 
                  type="text" 
                  value={config.storeAccountNumber || config.accountNumber || ""}
                  onChange={(e) => updateJSONField("generalSettingsJson", "storeAccountNumber", e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Floating Widget Options */}
        <div className="border border-white/5 bg-white/[0.01] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-3 mb-2">
            <div>
              <h4 className="text-xs font-black text-brand-gold uppercase tracking-[0.2em]">WhatsApp Floating Chat</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Interactive helpdesk button served globally to clients</p>
            </div>
            <button
              type="button"
              onClick={() => updateJSONField("generalSettingsJson", "whatsappWidgetEnabled", config.whatsappWidgetEnabled !== false ? false : true)}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                config.whatsappWidgetEnabled !== false 
                  ? "bg-green-600/20 border-green-500 text-green-400" 
                  : "bg-transparent border-white/10 text-white/40 hover:text-white"
              }`}
            >
              {config.whatsappWidgetEnabled !== false ? "Widget: ACTIVE" : "Widget: DISABLED"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Widget Screen Position</label>
              <select
                value={config.whatsappWidgetPosition || "RIGHT"}
                onChange={(e) => updateJSONField("generalSettingsJson", "whatsappWidgetPosition", e.target.value)}
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
              >
                <option value="RIGHT">Right-Hand Side (Recommended)</option>
                <option value="LEFT">Left-Hand Side</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Launcher Button Icon</label>
              <select
                value={config.whatsappWidgetIconStyle || "MESSAGE"}
                onChange={(e) => updateJSONField("generalSettingsJson", "whatsappWidgetIconStyle", e.target.value)}
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
              >
                <option value="MESSAGE">Support Message Bubble</option>
                <option value="WHATSAPP">Official WhatsApp Icon</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Linked WhatsApp Line</label>
              <input 
                type="text" 
                value={config.whatsappPhone || ""}
                onChange={(e) => updateJSONField("generalSettingsJson", "whatsappPhone", e.target.value)}
                placeholder="e.g. +234 813 546 4432"
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Chat Window Welcome Memo</label>
              <textarea 
                value={config.whatsappWidgetGreeting || "Hi! Welcome to The Vagina Room. How can we guide your wellness journey today?"}
                onChange={(e) => updateJSONField("generalSettingsJson", "whatsappWidgetGreeting", e.target.value)}
                rows={2}
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Text Entry Box Placeholder</label>
              <textarea 
                value={config.whatsappWidgetPlaceholder || "Ask about private clinical consultation, events, community, or products..."}
                onChange={(e) => updateJSONField("generalSettingsJson", "whatsappWidgetPlaceholder", e.target.value)}
                rows={2}
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
              />
            </div>
          </div>

          <div className="border-t border-white/5 pt-4">
            <ImageUploader 
              fieldKey={"whatsappWidgetLogo" as any} 
              label="WhatsApp Widget Header Avatar Logo" 
              currentValue={config.whatsappWidgetLogo} 
              onUploadSuccess={(url: string) => updateJSONField("generalSettingsJson", "whatsappWidgetLogo", url)}
            />
            <p className="text-[9px] text-white/30 uppercase tracking-wider mt-1">If empty, defaults automatically to your site header navigation logo or the brand symbol</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Meta Title (Browser Tab)</label>
          <input 
            type="text" 
            value={config.metaTitle || ""}
            onChange={(e) => updateJSONField("generalSettingsJson", "metaTitle", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Admin Email</label>
          <input 
            type="email" 
            value={content.adminEmail || "admin@thevaginaroom.com"}
            onChange={(e) => updateContentField("adminEmail", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Admin Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              value={content.adminPassword || "admin123"}
              onChange={(e) => updateContentField("adminPassword", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs pr-10" 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold">PWA Master Control</p>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                { (parseJSON(content.pwaSettingsJson, {}).pwaEnabled !== false) ? 'SYSTEM ACTIVE' : 'SYSTEM OFFLINE' }
              </span>
              <button 
                onClick={() => updateJSONField("pwaSettingsJson", "pwaEnabled", parseJSON(content.pwaSettingsJson, {}).pwaEnabled === false)}
                className={`w-10 h-5 relative rounded-full transition-colors ${parseJSON(content.pwaSettingsJson, {}).pwaEnabled !== false ? 'bg-emerald-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${parseJSON(content.pwaSettingsJson, {}).pwaEnabled !== false ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">App Name</label>
              <input type="text" value={parseJSON(content.pwaSettingsJson, {}).name || ""} onChange={(e) => updateJSONField("pwaSettingsJson", "name", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Short Name</label>
              <input type="text" value={parseJSON(content.pwaSettingsJson, {}).short_name || ""} onChange={(e) => updateJSONField("pwaSettingsJson", "short_name", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Description</label>
              <textarea value={parseJSON(content.pwaSettingsJson, {}).description || ""} onChange={(e) => updateJSONField("pwaSettingsJson", "description", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs h-20" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Theme Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={parseJSON(content.pwaSettingsJson, {}).theme_color || "#C41E3A"} 
                  onChange={(e) => updateJSONField("pwaSettingsJson", "theme_color", e.target.value)} 
                  className="w-10 h-10 bg-transparent border-none cursor-pointer flex-shrink-0" 
                />
                <input 
                  type="text" 
                  value={parseJSON(content.pwaSettingsJson, {}).theme_color || ""} 
                  onChange={(e) => updateJSONField("pwaSettingsJson", "theme_color", e.target.value)} 
                  className="flex-grow bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs uppercase font-mono" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Background Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={parseJSON(content.pwaSettingsJson, {}).background_color || "#0a0a0a"} 
                  onChange={(e) => updateJSONField("pwaSettingsJson", "background_color", e.target.value)} 
                  className="w-10 h-10 bg-transparent border-none cursor-pointer flex-shrink-0" 
                />
                <input 
                  type="text" 
                  value={parseJSON(content.pwaSettingsJson, {}).background_color || ""} 
                  onChange={(e) => updateJSONField("pwaSettingsJson", "background_color", e.target.value)} 
                  className="flex-grow bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs uppercase font-mono" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Display Mode</label>
              <select value={parseJSON(content.pwaSettingsJson, {}).display || "standalone"} onChange={(e) => updateJSONField("pwaSettingsJson", "display", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs">
                 <option value="fullscreen">Fullscreen</option>
                 <option value="standalone">Standalone</option>
                 <option value="minimal-ui">Minimal UI</option>
                 <option value="browser">Browser</option>
              </select>
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block column">PWA Icon Image</label>
              <ImageUploader 
                fieldKey="pwaSettingsJson"
                label="Upload Icon Image (Ideally square, e.g. 512x512 PNG)"
                onUploadSuccess={(url) => updateJSONField("pwaSettingsJson", "iconUrl", url)}
                currentValue={parseJSON(content.pwaSettingsJson, {}).iconUrl || ""}
              />
            </div>
          </div>
        </div>



        {/* Page Pre-Loader & Transition Customization */}
        <div className="pt-6 border-t border-white/10 mt-6">
          <div className="border border-white/5 bg-white/[0.01] p-5 space-y-6">
            <div>
              <h4 className="text-xs font-black text-brand-gold uppercase tracking-[0.2em]">Page Pre-Loader & Transition Customization</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Customize the visual greeting and tagline shown when pages are booting or validating memberships</p>
            </div>

            {(() => {
              const bConf = parseJSON(content.brandingSettingsJson, {});
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Loader Top Soft Label</label>
                      <input 
                        type="text" 
                        value={bConf.loaderLabel || "THE VAGINA ROOM SISTERS"}
                        onChange={(e) => updateJSONField("brandingSettingsJson", "loaderLabel", e.target.value)}
                        placeholder="e.g. LOADING SECURE CLIENT SANCTUARY"
                        className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                      />
                      <p className="text-[8px] text-white/30 uppercase tracking-wider">The tiny label that appears above the spinning visual on load.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block tracking-widest">Loader Main Slogan / Custom Soft Text</label>
                      <input 
                        type="text" 
                        value={bConf.loaderSubtext || "Restoring Wellness & Dignity"}
                        onChange={(e) => updateJSONField("brandingSettingsJson", "loaderSubtext", e.target.value)}
                        placeholder="e.g. Empowering Somatic Intimacy"
                        className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                      />
                      <p className="text-[8px] text-white/30 uppercase tracking-wider">Main loading tagline, shown underneath the spinning visual.</p>
                    </div>

                    <div className="flex justify-between items-center bg-black/40 p-3 border border-white/5 mt-2">
                      <div>
                        <p className="text-[10px] font-black uppercase text-white">Show Loading Soft Text</p>
                        <p className="text-[8px] text-white/30 uppercase tracking-tighter">Toggle displaying any text/taglines on the loading screen</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateJSONField("brandingSettingsJson", "loaderShowText", bConf.loaderShowText !== false ? false : true)}
                        className={`w-10 h-5 relative rounded-full transition-colors ${bConf.loaderShowText !== false ? 'bg-brand-gold' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${bConf.loaderShowText !== false ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Loader Icon Spin Speed</label>
                      <select
                        value={bConf.loaderSpinSpeed || "normal"}
                        onChange={(e) => updateJSONField("brandingSettingsJson", "loaderSpinSpeed", e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
                      >
                        <option value="slow">Elegant & Slow Speed</option>
                        <option value="normal">Standard Speed</option>
                        <option value="fast">High Velocity Speed</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Loader Spinning Graphic Layout</label>
                      <select
                        value={bConf.loaderLogoType || "DEFAULT"}
                        onChange={(e) => updateJSONField("brandingSettingsJson", "loaderLogoType", e.target.value)}
                        className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
                      >
                        <option value="DEFAULT">Main Circular Site Navigation Logo</option>
                        <option value="TEXT_LOGO">Golden Serif Text Logo ("THE vagina ROOM")</option>
                        <option value="CUSTOM_LOGO">Custom Uploaded Preloader Asset</option>
                      </select>
                    </div>

                    {bConf.loaderLogoType === "CUSTOM_LOGO" && (
                      <div className="space-y-2 col-span-1 md:col-span-2 border border-dashed border-white/10 p-3 bg-black/50">
                        <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Upload Custom Spinner Asset</label>
                        <ImageUploader 
                          fieldKey="brandingSettingsJson"
                          label="Upload Graphic (e.g. SVG / Transparent PNG)"
                          onUploadSuccess={(url) => updateJSONField("brandingSettingsJson", "loaderLogoUrl", url)}
                          currentValue={bConf.loaderLogoUrl || ""}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "branding") {
    const config = parseJSON(content.brandingSettingsJson, {});
    
    const ColorControl = ({ label, modeKey, colorKey, gradStartKey, gradEndKey, gradAngleKey, defaultColor, defaultStart, defaultEnd }: any) => (
      <div className="space-y-4 p-4 bg-white/5 border border-white/5 rounded-sm">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold">{label}</p>
          <div className="flex gap-2 p-1 bg-black/40 rounded">
            {['flat', 'gradient'].map((m) => (
              <button
                key={m}
                onClick={() => updateJSONField("brandingSettingsJson", modeKey, m)}
                className={`px-3 py-1 text-[9px] uppercase font-bold transition-all ${
                  (config[modeKey] || 'flat') === m 
                    ? "bg-brand-gold text-brand-black" 
                    : "text-white/40 hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {(config[modeKey] || 'flat') === 'flat' ? (
          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-wider text-white/30 block">Flat Color</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={config[colorKey] || defaultColor}
                onChange={(e) => updateJSONField("brandingSettingsJson", colorKey, e.target.value)}
                className="w-10 h-10 bg-transparent border-none cursor-pointer" 
              />
              <input 
                type="text" 
                value={config[colorKey] || defaultColor}
                onChange={(e) => updateJSONField("brandingSettingsJson", colorKey, e.target.value)}
                className="flex-grow bg-brand-black border border-white/10 p-2 text-white focus:border-brand-gold focus:outline-none text-[10px] uppercase font-mono" 
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/30 block">Start</label>
                <div className="flex gap-1">
                  <input 
                    type="color" 
                    value={config[gradStartKey] || defaultStart}
                    onChange={(e) => updateJSONField("brandingSettingsJson", gradStartKey, e.target.value)}
                    className="w-8 h-8 bg-transparent border-none cursor-pointer" 
                  />
                  <input 
                    type="text" 
                    value={config[gradStartKey] || defaultStart}
                    onChange={(e) => updateJSONField("brandingSettingsJson", gradStartKey, e.target.value)}
                    className="flex-grow bg-brand-black border border-white/10 p-1 text-white focus:border-brand-gold focus:outline-none text-[9px] uppercase font-mono" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-white/30 block">End</label>
                <div className="flex gap-1">
                  <input 
                    type="color" 
                    value={config[gradEndKey] || defaultEnd}
                    onChange={(e) => updateJSONField("brandingSettingsJson", gradEndKey, e.target.value)}
                    className="w-8 h-8 bg-transparent border-none cursor-pointer" 
                  />
                  <input 
                    type="text" 
                    value={config[gradEndKey] || defaultEnd}
                    onChange={(e) => updateJSONField("brandingSettingsJson", gradEndKey, e.target.value)}
                    className="flex-grow bg-brand-black border border-white/10 p-1 text-white focus:border-brand-gold focus:outline-none text-[9px] uppercase font-mono" 
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase tracking-wider text-white/30 block">Angle: {config[gradAngleKey] || 135}°</label>
              <input 
                type="range" min="0" max="360"
                value={config[gradAngleKey] || 135}
                onChange={(e) => updateJSONField("brandingSettingsJson", gradAngleKey, parseInt(e.target.value))}
                className="w-full accent-brand-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-white/5">
              <div className="text-[8px] text-white/20 uppercase">Preview</div>
              <div className="h-4 flex-grow rounded-[2px]" style={{ background: `linear-gradient(${config[gradAngleKey] || 135}deg, ${config[gradStartKey] || defaultStart}, ${config[gradEndKey] || defaultEnd})` }} />
            </div>
          </div>
        )}
      </div>
    );

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ColorControl 
            label="Primary Identity (Red)" 
            modeKey="primaryMode"
            colorKey="primaryColor"
            gradStartKey="primaryGradStart"
            gradEndKey="primaryGradEnd"
            gradAngleKey="primaryGradAngle"
            defaultColor="#C41E3A"
            defaultStart="#C41E3A"
            defaultEnd="#8B0000"
          />
          <ColorControl 
            label="Secondary Accent (Gold)" 
            modeKey="secondaryMode"
            colorKey="secondaryColor"
            gradStartKey="secondaryGradStart"
            gradEndKey="secondaryGradEnd"
            gradAngleKey="secondaryGradAngle"
            defaultColor="#D4AF37"
            defaultStart="#D4AF37"
            defaultEnd="#B8860B"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Main Font Family</label>
            <select 
              value={config.fontFamily || "Inter"}
              onChange={(e) => updateJSONField("brandingSettingsJson", "fontFamily", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
            >
              <option value="Inter">Inter (Clean Sans)</option>
              <option value="Space Grotesk">Space Grotesk (Modern)</option>
              <option value="Playfair Display">Playfair Display (Serif)</option>
              <option value="JetBrains Mono">JetBrains Mono (Technical)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Interface Roundness</label>
            <select 
              value={config.buttonRoundness || "md"}
              onChange={(e) => updateJSONField("brandingSettingsJson", "buttonRoundness", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
            >
              <option value="none">Square (Sharp)</option>
              <option value="sm">Small Radius</option>
              <option value="md">Medium (Modern)</option>
              <option value="lg">Large Round</option>
              <option value="full">Circle (Pill)</option>
            </select>
          </div>
        </div>

        <div className="bg-white/5 p-4 border border-white/5 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold">PWA Installation Settings</p>
          </div>
          <InputGroup label="PWA Install CTA Button Color">
            <div className="flex gap-2">
              <input 
                type="color"
                value={config.pwaCtaColor || "#D4AF37"}
                onChange={(e) => updateJSONField("brandingSettingsJson", "pwaCtaColor", e.target.value)}
                className="w-10 h-10 bg-transparent border-none cursor-pointer"
              />
              <input
                type="text"
                value={config.pwaCtaColor || "#D4AF37"}
                onChange={(e) => updateJSONField("brandingSettingsJson", "pwaCtaColor", e.target.value)}
                className="flex-grow bg-brand-black border border-white/10 p-2 text-white text-xs font-mono"
              />
            </div>
          </InputGroup>
        </div>

        <div className="bg-white/5 p-4 border border-white/5 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold">Global Typography Scaling</p>
            <span className="text-white/60 font-mono text-[10px]">{config.baseFontSize || 16}px</span>
          </div>
          <div className="space-y-2 pt-2">
            <label className="text-[9px] font-bold uppercase tracking-wider text-white/30 block">Default Base Size (Site-wide)</label>
            <input 
              type="range" min="12" max="24" step="1"
              value={config.baseFontSize || 16}
              onChange={(e) => updateJSONField("brandingSettingsJson", "baseFontSize", parseInt(e.target.value))}
              className="w-full accent-brand-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[8px] text-white/20 uppercase">
              <span>Compact (12px)</span>
              <span>Large (24px)</span>
            </div>
            <p className="text-[9px] text-brand-gold/50 italic leading-relaxed pt-2">
              Note: This sets the root font size. You can still adjust individual text blocks using the interactive editor.
            </p>
          </div>
        </div>
        <div className="space-y-4">
           <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold border-b border-white/5 pb-2">Logo Management</p>
           
           <div className="space-y-8">
             {/* Header Logo */}
             <div className="bg-white/5 p-4 border border-white/5 space-y-4">
               <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Header Logo</p>
                 <div className="flex gap-2 p-1 bg-black/40 rounded">
                   {['text', 'image'].map((m) => (
                     <button
                       key={m}
                       onClick={() => updateJSONField("brandingSettingsJson", "headerLogoType", m)}
                       className={`px-3 py-1 text-[9px] uppercase font-bold transition-all ${
                         (config.headerLogoType || 'text') === m 
                           ? "bg-brand-gold text-brand-black" 
                           : "text-white/40 hover:text-white"
                       }`}
                     >
                       {m}
                     </button>
                   ))}
                 </div>
               </div>
               
               {(config.headerLogoType || 'text') === 'image' && (
                 <div className="space-y-4">
                   <ImageUploader 
                     fieldKey="headerLogoUrl" 
                     label="Header Navigation Logo (Top Left)" 
                      currentValue={config.headerLogoUrl} 
                     onUploadSuccess={(url: string) => updateJSONField("brandingSettingsJson", "headerLogoUrl", url)}
                   />
                   <div className="space-y-2 border-t border-white/5 pt-2">
                     <div className="flex justify-between items-center">
                       <label className="text-[9px] font-bold uppercase tracking-wider text-white/40">Logo Height</label>
                       <span className="text-white/60 font-mono text-[10px]">{config.headerLogoHeight || 44}px</span>
                     </div>
                     <input 
                       type="range" min="16" max="150" step="1"
                       value={config.headerLogoHeight || 44}
                       onChange={(e) => updateJSONField("brandingSettingsJson", "headerLogoHeight", parseInt(e.target.value))}
                       className="w-full accent-brand-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                     />
                   </div>
                 </div>
               )}
               {/* Note: I'll need to update ImageUploader to support custom callbacks or just use the fieldKey directly if it matches the content state field */}
             </div>

             {/* Footer Logo 1 */}
             <div className="bg-white/5 p-4 border border-white/5 space-y-4">
               <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Footer Logo 1 (Main)</p>
                 <div className="flex gap-2 p-1 bg-black/40 rounded">
                   {['text', 'image'].map((m) => (
                     <button
                       key={m}
                       onClick={() => updateJSONField("brandingSettingsJson", "footerLogo1Type", m)}
                       className={`px-3 py-1 text-[9px] uppercase font-bold transition-all ${
                         (config.footerLogo1Type || 'text') === m 
                           ? "bg-brand-gold text-brand-black" 
                           : "text-white/40 hover:text-white"
                       }`}
                     >
                       {m}
                     </button>
                   ))}
                 </div>
               </div>
               
               {(config.footerLogo1Type || 'text') === 'image' && (
                 <div className="space-y-4">
                   <ImageUploader 
                      fieldKey="footerLogo1Url" 
                      label="Footer Primary Logo (Main Footer)" 
                       currentValue={config.footerLogo1Url} 
                      onUploadSuccess={(url: string) => updateJSONField("brandingSettingsJson", "footerLogo1Url", url)}
                   />
                   <div className="space-y-2 border-t border-white/5 pt-2">
                     <div className="flex justify-between items-center">
                       <label className="text-[9px] font-bold uppercase tracking-wider text-white/40">Logo Height</label>
                       <span className="text-white/60 font-mono text-[10px]">{config.footerLogo1Height || 64}px</span>
                     </div>
                     <input 
                       type="range" min="24" max="250" step="2"
                       value={config.footerLogo1Height || 64}
                       onChange={(e) => updateJSONField("brandingSettingsJson", "footerLogo1Height", parseInt(e.target.value))}
                       className="w-full accent-brand-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                     />
                   </div>
                 </div>
               )}
             </div>

             {/* Footer Logo 2 */}
             <div className="bg-white/5 p-4 border border-white/5 space-y-4">
               <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Footer Logo 2 (Accents)</p>
                 <div className="flex gap-2 p-1 bg-black/40 rounded">
                   {['text', 'image'].map((m) => (
                     <button
                       key={m}
                       onClick={() => updateJSONField("brandingSettingsJson", "footerLogo2Type", m)}
                       className={`px-3 py-1 text-[9px] uppercase font-bold transition-all ${
                         (config.footerLogo2Type || 'text') === m 
                           ? "bg-brand-gold text-brand-black" 
                           : "text-white/40 hover:text-white"
                       }`}
                     >
                       {m}
                     </button>
                   ))}
                 </div>
               </div>
               
               {(config.footerLogo2Type || 'text') === 'image' && (
                 <div className="space-y-4">
                   <ImageUploader 
                      fieldKey="footerLogo2Url" 
                      label="Footer Secondary/Accent Logo" 
                       currentValue={config.footerLogo2Url} 
                      onUploadSuccess={(url: string) => updateJSONField("brandingSettingsJson", "footerLogo2Url", url)}
                   />
                   <div className="space-y-2 border-t border-white/5 pt-2">
                     <div className="flex justify-between items-center">
                       <label className="text-[9px] font-bold uppercase tracking-wider text-white/40">Logo Height</label>
                       <span className="text-white/60 font-mono text-[10px]">{config.footerLogo2Height || 32}px</span>
                     </div>
                     <input 
                       type="range" min="12" max="120" step="1"
                       value={config.footerLogo2Height || 32}
                       onChange={(e) => updateJSONField("brandingSettingsJson", "footerLogo2Height", parseInt(e.target.value))}
                       className="w-full accent-brand-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                     />
                   </div>
                 </div>
               )}
             </div>

             {/* Social Grid Logo */}
             <div className="bg-white/5 p-4 border border-white/5 space-y-4">
               <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Social Section Logo (Above "Stay In Touch")</p>
                 <div className="flex gap-2 p-1 bg-black/40 rounded">
                   {['text', 'image'].map((m) => (
                     <button
                       key={m}
                       onClick={() => updateJSONField("brandingSettingsJson", "socialLogoType", m)}
                       className={`px-3 py-1 text-[9px] uppercase font-bold transition-all ${
                         (config.socialLogoType || 'text') === m 
                           ? "bg-brand-gold text-brand-black" 
                           : "text-white/40 hover:text-white"
                       }`}
                     >
                       {m}
                     </button>
                   ))}
                 </div>
               </div>
               
               {(config.socialLogoType || 'text') === 'image' && (
                 <div className="space-y-4">
                   <ImageUploader 
                     fieldKey="socialLogoUrl" 
                     label="Social Section Logo Image" 
                     currentValue={config.socialLogoUrl} 
                     onUploadSuccess={(url: string) => updateJSONField("brandingSettingsJson", "socialLogoUrl", url)}
                   />
                   <div className="space-y-2 border-t border-white/5 pt-2">
                     <div className="flex justify-between items-center">
                       <label className="text-[9px] font-bold uppercase tracking-wider text-white/40">Logo Height</label>
                       <span className="text-white/60 font-mono text-[10px]">{config.socialLogoHeight || 80}px</span>
                     </div>
                     <input 
                       type="range" min="30" max="300" step="2"
                       value={config.socialLogoHeight || 80}
                       onChange={(e) => updateJSONField("brandingSettingsJson", "socialLogoHeight", parseInt(e.target.value))}
                       className="w-full accent-brand-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                     />
                   </div>
                 </div>
               )}
             </div>

             {/* Telegram Landing Page Branding */}
             <div className="bg-white/5 p-4 border border-white/5 space-y-4">
               <div className="flex justify-between items-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Telegram Page Header Logo</p>
                 <div className="flex gap-2 p-1 bg-black/40 rounded">
                   {['text', 'image'].map((m) => (
                     <button
                       key={m}
                       onClick={() => updateContentField("telegramHeaderLogoType", m)}
                       className={`px-3 py-1 text-[9px] uppercase font-bold transition-all ${
                         (content.telegramHeaderLogoType || 'text') === m 
                           ? "bg-brand-gold text-brand-black" 
                           : "text-white/40 hover:text-white"
                       }`}
                     >
                       {m}
                     </button>
                   ))}
                 </div>
               </div>
               
               {(content.telegramHeaderLogoType || 'text') === 'image' ? (
                 <div className="space-y-4">
                   <ImageUploader 
                      fieldKey="telegramHeaderLogoUrl" 
                      label="Telegram Page Header Logo" 
                      currentValue={content.telegramHeaderLogoUrl} 
                      onUploadSuccess={(url: string) => updateContentField("telegramHeaderLogoUrl", url)}
                   />
                   <div className="space-y-2 border-t border-white/5 pt-2">
                     <div className="flex justify-between items-center">
                       <label className="text-[9px] font-bold uppercase tracking-wider text-white/40">Logo Height</label>
                       <span className="text-white/60 font-mono text-[10px]">{content.telegramHeaderLogoHeight || 44}px</span>
                     </div>
                     <input 
                       type="range" min="16" max="150" step="1"
                       value={content.telegramHeaderLogoHeight || 44}
                       onChange={(e) => updateContentField("telegramHeaderLogoHeight", parseInt(e.target.value))}
                       className="w-full accent-brand-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                     />
                   </div>
                 </div>
               ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 block">Text Logo</label>
                    <input 
                       type="text" 
                       value={content.telegramHeaderTextLogo || ""}
                       onChange={(e) => updateContentField("telegramHeaderTextLogo", e.target.value)}
                       className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                    />
                  </div>
               )}
             </div>

             {/* Favicon */}
             <div className="bg-white/5 p-4 border border-white/5 space-y-4">
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Favicon (Browser Tab Icon)</p>
                 <p className="text-[9px] text-white/30 italic mb-2">Usually 32x32px or 16x16px. Displayed in the browser tab.</p>
               </div>
               
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-white/50 block">Favicon URL / Path</label>
                 <input 
                   type="text" 
                   value={content.faviconUrl || ""}
                   onChange={(e) => updateContentField("faviconUrl", e.target.value)}
                   className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
                   placeholder="e.g., /favicon.ico or https://..."
                 />
               </div>

               <ImageUploader 
                 fieldKey="faviconUrl" 
                 label="Upload Browser Favicon" 
                 currentValue={content.faviconUrl || ""} 
                 onUploadSuccess={(url: string) => updateContentField("faviconUrl", url)}
               />
             </div>

             <ImageUploader 
                fieldKey="logoUrlAlt" 
                label="Alternative Emblem / Branding Asset" 
                currentValue={config.logoUrlAlt}
                onUploadSuccess={(url: string) => updateJSONField("brandingSettingsJson", "logoUrlAlt", url)}
             />
           </div>
        </div>
      </div>
    );
  }

  if (activeTab === "seo") {
    const config = parseJSON(content.seoSettingsJson, {});
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Site Slogan (SEO Tagline)</label>
          <input 
            type="text" 
            value={config.slogan || ""}
            onChange={(e) => updateJSONField("seoSettingsJson", "slogan", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
            placeholder="Official Brand Slogan"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Meta Description</label>
          <textarea 
            value={config.metaDescription || ""}
            onChange={(e) => updateJSONField("seoSettingsJson", "metaDescription", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs h-24" 
            placeholder="Search engine summary..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Meta Keywords (Comma separated)</label>
          <input 
            type="text" 
            value={config.metaKeywords || ""}
            onChange={(e) => updateJSONField("seoSettingsJson", "metaKeywords", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Author Name</label>
            <input 
              type="text" 
              value={config.authorName || "Dr. FID"}
              onChange={(e) => updateJSONField("seoSettingsJson", "authorName", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
            />
          </div>
        </div>

        <div className="border border-white/5 bg-white/[0.01] p-5 space-y-4">
          <div>
            <h4 className="text-xs font-black text-brand-gold uppercase tracking-[0.2em]">Analytics & Performance</h4>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Integrate tracking pixels for conversion monitoring and traffic analysis</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Google Analytics ID (G-XXXXX)</label>
              <input 
                type="text" 
                value={config.gaTrackingId || ""}
                onChange={(e) => updateJSONField("seoSettingsJson", "gaTrackingId", e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Meta Pixel ID (Facebook)</label>
              <input 
                type="text" 
                value={config.fbPixelId || ""}
                onChange={(e) => updateJSONField("seoSettingsJson", "fbPixelId", e.target.value)}
                placeholder="123456789012345"
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/40 block">Digital Product Redirect URL (Success Page)</label>
              <input 
                type="text" 
                value={config.digitalSuccessRedirect || "/member-dashboard?tab=resources"}
                onChange={(e) => updateJSONField("seoSettingsJson", "digitalSuccessRedirect", e.target.value)}
                placeholder="e.g. /download-success"
                className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" 
              />
            </div>
          </div>
        </div>

        <div className="border border-white/5 bg-white/[0.01] p-5 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold border-b border-white/5 pb-2">Browser Presence & Branding</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <ImageUploader 
                  fieldKey="faviconUrl"
                  label="Site Favicon (Browser Tab Icon)"
                  currentValue={content.faviconUrl}
                  onUploadSuccess={(url) => updateContentField("faviconUrl", url)}
               />
               <p className="text-[9px] text-white/30 italic">Best as a square .ico or .png file (e.g., 32x32 or 192x192).</p>
            </div>
            <div className="space-y-4">
               <ImageUploader 
                  fieldKey="ogImage" 
                  label="OG Graph Preview Image (Social Sharing)" 
                  currentValue={config.ogImage}
                  onUploadSuccess={(url: string) => updateJSONField("seoSettingsJson", "ogImage", url)}
               />
               <p className="text-[9px] text-white/30 italic">Recommended size: 1200x630px for optimal social sharing previews.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "security") {
    const config = parseJSON(content.securitySettingsJson, {});
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Session Timeout</label>
            <select 
              value={config.sessionTimeout || "60 mins"}
              onChange={(e) => updateJSONField("securitySettingsJson", "sessionTimeout", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
            >
              <option value="15 mins">15 mins</option>
              <option value="30 mins">30 mins</option>
              <option value="60 mins">60 mins</option>
              <option value="4 hours">4 hours</option>
              <option value="Never">Never (Insecure)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Two-Factor Auth Status</label>
            <select 
              value={config.twoFactorAuth || "Optional"}
              onChange={(e) => updateJSONField("securitySettingsJson", "twoFactorAuth", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
            >
              <option value="Required">Required (Secure)</option>
              <option value="Optional">Optional</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Restrict Iframe Embedding</label>
            <select 
              value={config.restrictIframe || "No"}
              onChange={(e) => updateJSONField("securitySettingsJson", "restrictIframe", e.target.value)}
              className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
            >
              <option value="Yes">Yes (SAMEORIGIN)</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Allowed API Origins (CORS)</label>
          <input 
            type="text" 
            value={config.allowedOrigins || "*"}
            onChange={(e) => updateJSONField("securitySettingsJson", "allowedOrigins", e.target.value)}
            className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs font-mono" 
          />
          <p className="text-[9px] text-white/20">Use * for all, or specific domains separated by commas.</p>
        </div>
        
        <div className="mt-8 p-4 bg-brand-red/10 border border-brand-red/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-red mb-2">Notice</p>
          <p className="text-[10px] text-brand-red/80 leading-relaxed italic">Changes to security parameters may affect administrative access. Ensure you have backup procedures in place before tightening origin restrictions.</p>
        </div>
      </div>
    );
  }

  if (activeTab === "social") {
    return (
      <div className="space-y-6">
        <div className="bg-white/5 p-6 border border-white/10 space-y-6 mb-8">
           <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold">Section Titles</p>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Main Heading Title</label>
                <input type="text" value={content.socialSectionTitle || ""} onChange={(e) => updateContentField("socialSectionTitle", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" placeholder="e.g. JOIN THE COMMUNITY" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Sub-Title / Slogan</label>
                <input type="text" value={content.socialSubTitle || ""} onChange={(e) => updateContentField("socialSubTitle", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" placeholder="e.g. STAY IN TOUCH WITH ME" />
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">X (Twitter) Link</label>
            <input type="text" value={content.socialLinkX || ""} onChange={(e) => updateContentField("socialLinkX", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Instagram Link</label>
            <input type="text" value={content.socialLinkInstagram || ""} onChange={(e) => updateContentField("socialLinkInstagram", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">TikTok Link</label>
            <input type="text" value={content.socialLinkTiktok || ""} onChange={(e) => updateContentField("socialLinkTiktok", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Facebook Link</label>
            <input type="text" value={content.socialLinkFacebook || ""} onChange={(e) => updateContentField("socialLinkFacebook", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">YouTube Link</label>
            <input type="text" value={content.socialLinkYoutube || ""} onChange={(e) => updateContentField("socialLinkYoutube", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">LinkedIn Link</label>
            <input type="text" value={content.socialLinkLinkedin || ""} onChange={(e) => updateContentField("socialLinkLinkedin", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "integrations") {
    const mediaConfig = parseJSON(content.mediaSettingsJson, {});
    const paymentConfig = parseJSON(content.paymentSettingsJson, {});
    const smtpConfig = parseJSON(content.smtpSettingsJson, {});

    const StatusIndicator = ({ isActive, error }: { isActive: boolean, error?: string }) => (
      <div className="flex flex-col items-end gap-1">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-brand-red"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-brand-red"}`} />
          {isActive ? "Configured & Active" : "Not Configured / Inactive"}
        </span>
        {error && <span className="text-[8px] text-brand-red font-mono lowercase max-w-[200px] text-right truncate" title={error}>{error}</span>}
      </div>
    );

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center bg-white/5 p-4 border border-white/10 rounded-sm">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-white">API Integrations</p>
            <p className="text-[10px] text-white/50 mt-1">Configure external services. Save standard dashboard to apply changes.</p>
          </div>
          <button 
            onClick={refreshStatus}
            disabled={statusLoading}
            className="px-4 py-2 bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {statusLoading ? "Testing..." : "Test Connections"}
          </button>
        </div>

        {/* Cloudinary */}
        <div className="bg-brand-black border border-white/10 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-brand-gold">Cloudinary (Media Storage)</p>
              <p className="text-[10px] text-white/40 mt-1">Replaces local /uploads with persistent cloud storage.</p>
            </div>
            <StatusIndicator isActive={systemStatus?.cloudinary === true} error={systemStatus?.cloudinaryError} />
          </div>
          <div className="grid grid-cols-1 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 block">Cloud Name</label>
              <input type="text" value={mediaConfig.cloudinaryCloudName || ""} onChange={(e) => updateJSONField("mediaSettingsJson", "cloudinaryCloudName", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 block">API Key</label>
              <input type="text" value={mediaConfig.cloudinaryApiKey || ""} onChange={(e) => updateJSONField("mediaSettingsJson", "cloudinaryApiKey", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 block">API Secret</label>
              <input type="password" value={mediaConfig.cloudinaryApiSecret || ""} onChange={(e) => updateJSONField("mediaSettingsJson", "cloudinaryApiSecret", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 block">Unsigned Upload Preset</label>
              <input type="text" value={mediaConfig.cloudinaryUploadPreset || ""} onChange={(e) => updateJSONField("mediaSettingsJson", "cloudinaryUploadPreset", e.target.value)} placeholder="e.g. ml_default" className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
          </div>
        </div>

        {/* Firebase */}
        <div className="bg-brand-black border border-white/10 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#FFCA28]">Firebase (Database)</p>
              <p className="text-[10px] text-white/40 mt-1">Saves configuration to firebase-applet-config.json</p>
            </div>
            <StatusIndicator isActive={systemStatus?.firestore === true} error={systemStatus?.firestoreError} />
          </div>
          <div className="pt-2 space-y-4">
            <p className="text-[10px] text-white/50 leading-relaxed italic">
              Paste your Firebase Service Account JSON or client configuration JSON here. This will be saved to the local configuration file and used by the server on subsequent restarts. Note that the FIREBASE_CONFIG environment variable takes precedence on deployment platforms like Render.
            </p>
            <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 block">Firebase Config JSON String</label>
               <textarea 
                  value={content.firebaseConfigRaw || ""} 
                  onChange={(e) => updateContentField("firebaseConfigRaw", e.target.value)} 
                  placeholder='{"projectId": "...", "apiKey": "..."}'
                  className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs font-mono min-h-[120px]" 
               />
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="bg-brand-black border border-white/10 p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#0ea5e9]">Payment Gateways</p>
              <p className="text-[10px] text-white/40 mt-1">Configure separate API keys for membership subscriptions and store orders.</p>
            </div>
          </div>

          {/* Paystack Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-black uppercase tracking-widest text-white">Paystack Integration</p>
              <StatusIndicator isActive={systemStatus?.paystack === true} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 bg-white/[0.02] border border-white/5">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Store Secret Key</label>
                <input type="password" value={paymentConfig.storePaystackSecretKey || paymentConfig.paystackSecretKey || ""} onChange={(e) => updateJSONField("paymentSettingsJson", "storePaystackSecretKey", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
              </div>
              <div className="space-y-2 p-4 bg-white/[0.02] border border-white/5">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Store Public Key</label>
                <input type="text" value={paymentConfig.storePaystackPublicKey || ""} onChange={(e) => updateJSONField("paymentSettingsJson", "storePaystackPublicKey", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
              </div>
              <div className="space-y-2 p-4 bg-white/[0.02] border border-white/5">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Membership Secret Key</label>
                <input type="password" value={paymentConfig.membershipPaystackSecretKey || paymentConfig.paystackSecretKey || ""} onChange={(e) => updateJSONField("paymentSettingsJson", "membershipPaystackSecretKey", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
              </div>
              <div className="space-y-2 p-4 bg-white/[0.02] border border-white/5">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Membership Public Key</label>
                <input type="text" value={paymentConfig.membershipPaystackPublicKey || ""} onChange={(e) => updateJSONField("paymentSettingsJson", "membershipPaystackPublicKey", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
              </div>
            </div>
          </div>

          {/* Flutterwave Section */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-black uppercase tracking-widest text-white">Flutterwave Integration</p>
              <StatusIndicator isActive={systemStatus?.flutterwave === true} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 bg-white/[0.02] border border-white/5">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Store Secret Key</label>
                <input type="password" value={paymentConfig.storeFlutterwaveSecretKey || paymentConfig.flutterwaveSecretKey || ""} onChange={(e) => updateJSONField("paymentSettingsJson", "storeFlutterwaveSecretKey", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
              </div>
              <div className="space-y-2 p-4 bg-white/[0.02] border border-white/5">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">Membership Secret Key</label>
                <input type="password" value={paymentConfig.membershipFlutterwaveSecretKey || paymentConfig.flutterwaveSecretKey || ""} onChange={(e) => updateJSONField("paymentSettingsJson", "membershipFlutterwaveSecretKey", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
              </div>
            </div>
            <div className="space-y-2 p-4 bg-white/[0.02] border border-white/5 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">FLW Webhook Encryption Hash</label>
                <input type="password" value={paymentConfig.flutterwaveWebhookSecretHash || ""} onChange={(e) => updateJSONField("paymentSettingsJson", "flutterwaveWebhookSecretHash", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
          </div>
        </div>

        {/* SMTP Details */}
        <div className="bg-brand-black border border-white/10 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white">SMTP (Email Delivery)</p>
              <p className="text-[10px] text-white/40 mt-1">Used for system alerts, booking confirmations, and orders.</p>
            </div>
            <StatusIndicator isActive={systemStatus?.smtp === true} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">SMTP Host</label>
              <input type="text" value={smtpConfig.host || ""} onChange={(e) => updateJSONField("smtpSettingsJson", "host", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">SMTP Port</label>
              <input type="text" value={smtpConfig.port || ""} onChange={(e) => updateJSONField("smtpSettingsJson", "port", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">SMTP User</label>
              <input type="text" value={smtpConfig.user || ""} onChange={(e) => updateJSONField("smtpSettingsJson", "user", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">SMTP Pass</label>
              <input type="password" value={smtpConfig.pass || ""} onChange={(e) => updateJSONField("smtpSettingsJson", "pass", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/30 block">SMTP From Address</label>
              <input type="email" value={smtpConfig.from || ""} onChange={(e) => updateJSONField("smtpSettingsJson", "from", e.target.value)} className="w-full bg-brand-black border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs" />
            </div>
          </div>
        </div>

        {/* Database Backup Export Section */}
        <div className="bg-brand-black border border-white/10 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-brand-gold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-brand-gold" /> Firestore Database Backup
              </p>
              <p className="text-[10px] text-white/40 mt-1">Export current Firestore database content to a JSON file for manual backup purposes.</p>
            </div>
            <button 
              type="button"
              onClick={handleExportDatabase}
              disabled={exporting}
              className="px-4 py-2 bg-brand-gold hover:bg-white text-brand-black text-[10px] uppercase font-black transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {exporting ? "Exporting..." : "Download Backup JSON"}
            </button>
          </div>
          <div className="pt-2">
            <p className="text-[10px] text-white/50 leading-relaxed italic">
              Downloads a consolidated JSON backup including configurations, submissions, blog articles, pages, and other persistent database collections securely to your local machine.
            </p>
          </div>
        </div>

      </div>
    );
  }

  return null;
}
