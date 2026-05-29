import React from 'react';
import { useContent } from '../../context/ContentContext';
import { 
  Truck, 
  CreditCard, 
  Plus, 
  Trash2, 
  Save,
  CheckCircle2
} from 'lucide-react';

export default function AdminCheckoutSettings() {
  const { content, updateContentField, saveContentChanges } = useContent();

  const parseJSON = (jsonString: string, fallback: any) => {
    try {
      return JSON.parse(jsonString || '{}');
    } catch {
      return fallback;
    }
  };

  const checkoutConfig = parseJSON(content.checkoutSettingsJson, { shippingLocations: [], paymentMethods: [] });
  const paymentMethods = (checkoutConfig.paymentMethods || []).map((m: any) => 
    typeof m === 'string' ? { name: m, enabled: true } : m
  );

  const updateConfig = (newConfig: any) => {
    updateContentField("checkoutSettingsJson", JSON.stringify(newConfig, null, 2));
  };

  const addShippingLocation = () => {
    const updated = {
      ...checkoutConfig,
      shippingLocations: [
        ...(checkoutConfig.shippingLocations || []),
        { name: "New Location", fee: 0 }
      ]
    };
    updateConfig(updated);
  };

  const removeShippingLocation = (index: number) => {
    const updated = {
      ...checkoutConfig,
      shippingLocations: checkoutConfig.shippingLocations.filter((_: any, i: number) => i !== index)
    };
    updateConfig(updated);
  };

  const updateShippingLocation = (index: number, field: string, value: any) => {
    const locations = [...checkoutConfig.shippingLocations];
    locations[index] = { ...locations[index], [field]: value };
    updateConfig({ ...checkoutConfig, shippingLocations: locations });
  };

  const addPaymentMethod = () => {
    const updated = {
      ...checkoutConfig,
      paymentMethods: [...paymentMethods, { name: "New Payment Method", enabled: true }]
    };
    updateConfig(updated);
  };

  const removePaymentMethod = (index: number) => {
    const updated = {
      ...checkoutConfig,
      paymentMethods: paymentMethods.filter((_: any, i: number) => i !== index)
    };
    updateConfig(updated);
  };

  const updatePaymentMethod = (index: number, name: string) => {
    const updatedMethods = [...paymentMethods];
    updatedMethods[index] = { ...updatedMethods[index], name };
    updateConfig({ ...checkoutConfig, paymentMethods: updatedMethods });
  };

  const togglePaymentMethod = (index: number) => {
    const updatedMethods = [...paymentMethods];
    updatedMethods[index] = { ...updatedMethods[index], enabled: !updatedMethods[index].enabled };
    updateConfig({ ...checkoutConfig, paymentMethods: updatedMethods });
  };

  const Section = ({ title, icon: Icon, children, onAdd }: any) => (
    <div className="bg-white/5 border border-white/10 p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-brand-gold" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-brand-gold">{title}</h3>
        </div>
        {onAdd && (
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-gold hover:text-white transition-colors"
          >
            <Plus size={14} /> Add New
          </button>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-32">
       <div className="flex justify-between items-center bg-white/[0.02] border border-white/10 p-6">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-brand-gold">Checkout Infrastructure</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Configure delivery rates, zones, and supported payment avenues.</p>
          </div>
          <button 
            onClick={saveContentChanges}
            className="px-8 py-3 bg-brand-gold text-brand-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
          >
            <Save size={14} /> Commit Changes
          </button>
       </div>

       <div className="grid grid-cols-1 gap-8">
          {/* Shipping Locations */}
          <Section title="Delivery Zones & Fees" icon={Truck} onAdd={addShippingLocation}>
            <div className="grid grid-cols-1 gap-3">
              {checkoutConfig.shippingLocations?.map((loc: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-center bg-brand-black/40 border border-white/5 p-4 group">
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-white/30 tracking-widest">Location Name</label>
                      <input 
                        value={loc.name}
                        onChange={e => updateShippingLocation(idx, "name", e.target.value)}
                        className="w-full bg-transparent border-b border-white/10 focus:border-brand-gold outline-none text-xs p-1"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-white/30 tracking-widest">Delivery Fee (₦)</label>
                      <input 
                        type="number"
                        value={loc.fee}
                        onChange={e => updateShippingLocation(idx, "fee", parseFloat(e.target.value))}
                        className="w-full bg-transparent border-b border-white/10 focus:border-brand-gold outline-none text-xs p-1"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => removeShippingLocation(idx)}
                    className="p-2 text-white/20 hover:text-brand-red transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </Section>

          {/* Payment Methods */}
          <Section title="Payment Gateways & Methods" icon={CreditCard} onAdd={addPaymentMethod}>
            <div className="grid grid-cols-1 gap-3">
              {paymentMethods.map((method: any, idx: number) => (
                <div key={idx} className={`flex gap-4 items-center bg-brand-black/40 border p-4 transition-colors ${method.enabled ? 'border-white/5' : 'border-brand-red/20 opacity-50'}`}>
                  <div className="flex-grow">
                     <label className="text-[9px] font-black uppercase text-white/30 tracking-widest block mb-1">Method Status: {method.enabled ? <span className="text-emerald-400">Active</span> : <span className="text-brand-red">Disabled</span>}</label>
                     <input 
                        value={method.name}
                        onChange={e => updatePaymentMethod(idx, e.target.value)}
                        className="w-full bg-transparent border-b border-white/10 focus:border-brand-gold outline-none text-xs p-1"
                        placeholder="e.g. Bank Transfer"
                      />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => togglePaymentMethod(idx)}
                      className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest border transition-all ${method.enabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'bg-brand-red/10 border-brand-red/30 text-brand-red hover:bg-brand-red hover:text-white'}`}
                    >
                      {method.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <button 
                      onClick={() => removePaymentMethod(idx)}
                      className="p-2 text-white/20 hover:text-brand-red transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Section>
       </div>

       <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 flex flex-col items-center text-center space-y-4">
          <CheckCircle2 className="text-emerald-500 w-12 h-12" />
          <div>
            <h4 className="text-lg font-black uppercase tracking-tight text-white font-serif">Sync Verification</h4>
            <p className="text-xs text-white/60 max-w-lg mx-auto">
              Delivery locations and payment options updated here will be reflected instantly on the storefront checkout page. Pricing values are in Naira (₦).
            </p>
          </div>
          <button 
            onClick={saveContentChanges}
            className="px-12 py-4 bg-emerald-500 text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-brand-black transition-all shadow-2xl"
          >
            Deploy Settings Global
          </button>
       </div>
    </div>
  );
}
