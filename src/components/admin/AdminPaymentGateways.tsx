import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { 
  CreditCard, 
  Save, 
  Trash2, 
  Plus,
  ShieldCheck, 
  Key, 
  Info, 
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface AdminPaymentGatewaysProps {
  orders: any[];
}

export default function AdminPaymentGateways({ orders }: AdminPaymentGatewaysProps) {
  const { content, updateContentField, saveContentChanges } = useContent();
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'webhooks'>('config');

  const parseJSON = (jsonString: string, fallback: any) => {
    try {
      return JSON.parse(jsonString || '{}');
    } catch {
      return fallback;
    }
  };

  const paymentConfig = parseJSON(content.paymentSettingsJson, {
    gateways: {
      paystack: { store: { enabled: true, pub: "", sec: "" }, membership: { enabled: true, pub: "", sec: "" } },
      flutterwave: { store: { enabled: false, pub: "", sec: "" }, membership: { enabled: false, pub: "", sec: "" }, webhookHash: "" },
      stripe: { store: { enabled: false, pub: "", sec: "" }, membership: { enabled: false, pub: "", sec: "" }, webhookSecret: "" },
      paypal: { store: { enabled: false, cid: "", sec: "" }, membership: { enabled: false, cid: "", sec: "" }, webhookId: "" }
    },
    manual: {
      store: [],
      membership: []
    }
  });

  // Ensure default structures exist even after parsing to prevent crashes
  const defaultGateways = {
    paystack: { store: { enabled: true, pub: "", sec: "" }, membership: { enabled: true, pub: "", sec: "" } },
    flutterwave: { store: { enabled: false, pub: "", sec: "" }, membership: { enabled: false, pub: "", sec: "" }, webhookHash: "" },
    stripe: { store: { enabled: false, pub: "", sec: "" }, membership: { enabled: false, pub: "", sec: "" }, webhookSecret: "" },
    paypal: { store: { enabled: false, cid: "", sec: "" }, membership: { enabled: false, cid: "", sec: "" }, webhookId: "" }
  };

  if (!paymentConfig.gateways) {
    paymentConfig.gateways = defaultGateways;
  } else {
    // Fill in missing providers
    Object.keys(defaultGateways).forEach(provider => {
      if (!paymentConfig.gateways[provider]) {
        paymentConfig.gateways[provider] = (defaultGateways as any)[provider];
      } else {
        // Fill in missing types (store/membership)
        if (!paymentConfig.gateways[provider].store) paymentConfig.gateways[provider].store = { enabled: false, pub: "", sec: "" };
        if (!paymentConfig.gateways[provider].membership) paymentConfig.gateways[provider].membership = { enabled: false, pub: "", sec: "" };
      }
    });
  }

  if (!paymentConfig.manual) {
    paymentConfig.manual = { store: [], membership: [] };
  }
  if (!paymentConfig.manual.store || !Array.isArray(paymentConfig.manual.store)) paymentConfig.manual.store = [];
  if (!paymentConfig.manual.membership || !Array.isArray(paymentConfig.manual.membership)) paymentConfig.manual.membership = [];

  const exportBookkeepingCSV = () => {
    try {
      // Orders Data
      const orderRows = (orders || []).map(o => [
        o.orderNo || 'N/A',
        o.createdAt?.toDate ? o.createdAt.toDate().toISOString() : 'N/A',
        o.customer?.fullName || 'N/A',
        o.grandTotal || 0,
        o.status || 'pending'
      ]);
      const orderHeader = ["Order No", "Date", "Customer", "Total", "Status"];

      // Gateways Data
      const gatewayRows = Object.entries(paymentConfig.gateways).map(([name, config]: [string, any]) => [
        name,
        config?.store?.enabled ? "Active" : "Inactive",
        config?.membership?.enabled ? "Active" : "Inactive"
      ]);
      const gatewayHeader = ["Gateway", "Store Status", "Membership Status"];

      const csvContent = [
        "TRANSACTIONS",
        orderHeader.join(","),
        ...orderRows.map(row => row.join(",")),
        "",
        "PAYMENT METHODS",
        gatewayHeader.join(","),
        ...gatewayRows.map(row => row.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `bookkeeping_data_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("CSV Export error", err);
      alert("Failed to export CSV. See console for details.");
    }
  };

  const updateConfig = (newConfig: any) => {
    updateContentField("paymentSettingsJson", JSON.stringify(newConfig, null, 2));
  };

  const toggleGateway = (provider: string, type: 'store' | 'membership') => {
    const newConfig = { ...paymentConfig };
    if (!newConfig.gateways[provider]) newConfig.gateways[provider] = {};
    if (!newConfig.gateways[provider][type]) newConfig.gateways[provider][type] = { enabled: false };
    
    newConfig.gateways[provider][type].enabled = !newConfig.gateways[provider][type].enabled;
    updateConfig(newConfig);
  };

  const addManualMethod = (type: 'store' | 'membership') => {
    const newConfig = { ...paymentConfig };
    newConfig.manual[type].push({ name: "New Bank Method", details: "" });
    updateConfig(newConfig);
  };

  const updateManualMethod = (type: 'store' | 'membership', index: number, field: string, value: string) => {
    const newConfig = { ...paymentConfig };
    newConfig.manual[type][index][field] = value;
    updateConfig(newConfig);
  };

  const deleteManualMethod = (type: 'store' | 'membership', index: number) => {
    const newConfig = { ...paymentConfig };
    newConfig.manual[type].splice(index, 1);
    updateConfig(newConfig);
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex justify-between items-center bg-white/[0.02] border border-white/10 p-6">
        <h2 className="text-xl font-black uppercase tracking-tighter text-brand-gold flex items-center gap-2">
          <CreditCard className="w-5 h-5" /> Unified Payment Gateways
        </h2>
        <div className='flex gap-2'>
          <button onClick={exportBookkeepingCSV} className="px-8 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            Export Bookkeeping CSV
          </button>
          <button onClick={saveContentChanges} className="px-8 py-3 bg-brand-gold text-brand-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">
            <Save size={14} className="inline mr-2"/> Save Configuration
          </button>
        </div>
      </div>

      {activeSubTab === 'config' && (
        <div className="space-y-8">
          {/* Automatic Payment Gateways */}
          <div className="bg-white/[0.02] border border-white/10 p-6 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-white border-b border-white/5 pb-3">Automated Gateways</h3>
            {Object.keys(paymentConfig.gateways).map(provider => (
              <div key={provider} className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-white/5 pb-4">
                <div className="font-bold text-white uppercase">{provider}</div>
                <div className="flex gap-4">
                  {(['store', 'membership'] as const).map(type => (
                    <button 
                      key={type}
                      onClick={() => toggleGateway(provider, type)}
                      className={`px-4 py-2 text-[10px] uppercase font-black ${paymentConfig.gateways[provider][type].enabled ? 'bg-emerald-500 text-white' : 'bg-red-500/20 text-red-500'}`}
                    >
                      {type}: {paymentConfig.gateways[provider][type].enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Manual Methods */}
          {(['store', 'membership'] as const).map(type => (
            <div key={type} className="bg-white/[0.02] border border-white/10 p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Manual Methods: {type}</h3>
                <button onClick={() => addManualMethod(type)} className="px-4 py-2 bg-brand-gold text-brand-black text-[10px] font-black"><Plus size={12} className="inline"/> Add</button>
              </div>
              {paymentConfig.manual[type].map((m: any, i: number) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={m.name} onChange={(e) => updateManualMethod(type, i, 'name', e.target.value)} className="bg-black border border-white/10 p-2 text-xs text-white" />
                  <input value={m.details} onChange={(e) => updateManualMethod(type, i, 'details', e.target.value)} className="bg-black border border-white/10 p-2 text-xs text-white flex-grow" placeholder="Enter bank details" />
                  <button onClick={() => deleteManualMethod(type, i)} className="text-red-500"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
