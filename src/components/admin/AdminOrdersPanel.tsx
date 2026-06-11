import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Trash2, 
  ExternalLink, 
  Eye, 
  Save, 
  User, 
  MapPin, 
  Truck, 
  CreditCard, 
  Info,
  ChevronRight,
  Package,
  Clock,
  CheckCircle
} from 'lucide-react';
import { WHATSAPP_TEMPLATES, sendWhatsAppMessage } from '../../lib/whatsapp';
import { useNotifications } from '../../context/NotificationContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface AdminOrdersPanelProps {
  orders: any[];
  onRefresh: () => void;
}

export default function AdminOrdersPanel({ orders, onRefresh }: AdminOrdersPanelProps) {
  const { content } = useContent();
  const { showToast } = useNotifications();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState<string | null>(null);

  const filteredOrders = orders.filter(order => 
    order.orderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Operational visibility status counts
  const totalOrdersCount = orders.length;
  const counts = orders.reduce(
    (acc, order) => {
      const status = (order.status || 'pending').toLowerCase();
      if (status === 'pending') acc.pending++;
      else if (status === 'confirmed') acc.confirmed++;
      else if (status === 'shipped') acc.shipped++;
      else if (status === 'delivered') acc.delivered++;
      else acc.other++;
      return acc;
    },
    { pending: 0, confirmed: 0, shipped: 0, delivered: 0, other: 0 }
  );

  const handleUpdateStatus = async (order: any, newStatus: string, notify = true) => {
    try {
      await updateDoc(doc(db, "orders", order.id), { status: newStatus });
      
      showToast(`Order #${order.orderNo} status updated to ${newStatus}`, "success");
      
      if (notify && order.customer?.phone) {
        // Option to trigger WhatsApp notification can be added here if desired.
      }
      
      onRefresh();
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...order, status: newStatus });
      }
    } catch(e) {
      console.error("Error updating status", e);
      showToast("Failed to update status", "error");
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirmDeleteOrderId !== id) {
      setConfirmDeleteOrderId(id);
      setTimeout(() => setConfirmDeleteOrderId(null), 3000);
      return;
    }

    try {
      await deleteDoc(doc(db, "orders", id));
      
      onRefresh();
      setConfirmDeleteOrderId(null);
      if (selectedOrder?.id === id) setSelectedOrder(null);
    } catch (e) {
      console.error("Error deleting order", e);
      alert("Failed to delete order");
    }
  };

  const handleStartEdit = (order: any) => {
    setSelectedOrder(order);
    setEditFormData(JSON.parse(JSON.stringify(order)));
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editFormData || !selectedOrder) return;
    try {
      await updateDoc(doc(db, "orders", selectedOrder.id), editFormData);

      alert("Order details updated successfully");
      setIsEditing(false);
      onRefresh();
    } catch (e) {
      console.error("Error updating order", e);
      alert("Failed to update order details");
    }
  };

  const DetailSection = ({ title, icon: Icon, children }: any) => (
    <div className="bg-white/5 border border-white/10 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-brand-gold" />
        <h4 className="text-[11px] font-black uppercase tracking-widest text-brand-gold">{title}</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );

  const DataField = ({ label, value, field, type="text" }: { label: string, value: any, field: string, type?: string }) => {
    // field path e.g. "customer.fullName"
    const path = field.split('.');
    
    if (isEditing) {
      return (
        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase text-white/40 tracking-widest">{label}</label>
          <input 
            type={type}
            value={value || ""}
            onChange={(e) => {
              const newData = { ...editFormData };
              let current = newData;
              for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
              }
              current[path[path.length - 1]] = e.target.value;
              setEditFormData(newData);
            }}
            className="w-full bg-brand-black border border-white/20 p-2 text-xs focus:border-brand-gold outline-none"
          />
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">{label}</p>
        <p className="text-xs text-white/80 font-medium">{value || "N/A"}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Operational Summary Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Pending",
            count: counts.pending,
            color: "text-white/60",
            icon: Clock,
            borderColor: "border-white/10",
            hoverBorderColor: "group-hover:border-white/35",
            iconColor: "text-white/40",
            badgeColor: "bg-white/5 text-white/60",
            glowColor: "group-hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          },
          {
            label: "Confirmed",
            count: counts.confirmed,
            color: "text-brand-gold",
            icon: CheckCircle,
            borderColor: "border-brand-gold/10",
            hoverBorderColor: "group-hover:border-brand-gold/40",
            iconColor: "text-brand-gold/50",
            badgeColor: "bg-brand-gold/5 text-brand-gold",
            glowColor: "group-hover:shadow-[0_0_15px_rgba(212,175,55,0.05)]"
          },
          {
            label: "Shipped",
            count: counts.shipped,
            color: "text-blue-400",
            icon: Truck,
            borderColor: "border-blue-500/10",
            hoverBorderColor: "group-hover:border-blue-500/40",
            iconColor: "text-blue-400/50",
            badgeColor: "bg-blue-500/5 text-blue-400",
            glowColor: "group-hover:shadow-[0_0_15px_rgba(96,165,250,0.05)]"
          },
          {
            label: "Delivered",
            count: counts.delivered,
            color: "text-emerald-400",
            icon: Package,
            borderColor: "border-emerald-500/10",
            hoverBorderColor: "group-hover:border-emerald-500/40",
            iconColor: "text-emerald-400/50",
            badgeColor: "bg-emerald-500/5 text-emerald-400",
            glowColor: "group-hover:shadow-[0_0_15px_rgba(52,211,153,0.05)]"
          }
        ].map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -2 }}
              className={`group relative bg-[#0a0a0a]/60 border ${item.borderColor} ${item.hoverBorderColor} p-5 flex flex-col justify-between transition-all duration-300 ${item.glowColor}`}
            >
              <div className="flex items-start justify-between">
                <span className="font-mono tracking-widest text-[9px] uppercase text-white/40">
                  {item.label} Orders
                </span>
                <IconComponent className={`w-4 h-4 ${item.iconColor} transition-colors group-hover:text-white duration-300`} />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="font-serif text-3xl md:text-4xl font-light text-white tracking-tight">
                  {item.count}
                </span>
                <span className={`px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider rounded ${item.badgeColor}`}>
                  {totalOrdersCount > 0 
                    ? `${Math.round((item.count / totalOrdersCount) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              {/* Gold/Brand accent line at bottom on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-gold/0 to-transparent group-hover:via-brand-gold/30 transition-all duration-500" />
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input 
            type="text" 
            placeholder="Search by Order No, Name, or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 py-3 pl-10 pr-4 text-xs focus:border-brand-gold outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onRefresh} className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <span className="text-[10px] font-black uppercase tracking-widest">Refresh Orders</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-[#111] text-white/40 font-black uppercase tracking-widest border-b border-white/10">
            <tr>
              <th className="py-4 px-4 font-black">Order No</th>
              <th className="py-4 px-4 font-black">Date</th>
              <th className="py-4 px-4 font-black">Customer</th>
              <th className="py-4 px-4 font-black">Total</th>
              <th className="py-4 px-4 font-black">Status</th>
              <th className="py-4 px-4 font-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredOrders.map((order: any) => (
              <tr key={order.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-4 font-mono font-bold text-brand-gold">#{order.orderNo}</td>
                <td className="py-4 px-4 text-white/60">
                  {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}
                </td>
                <td className="py-4 px-4">
                  <div className="font-bold">{order.customer?.fullName}</div>
                  <div className="text-[10px] text-white/40">{order.customer?.phone}</div>
                </td>
                <td className="py-4 px-4 font-bold">
                  {order.items?.[0]?.currency === 'USD' ? '$' : '₦'}{(order.grandTotal || 0).toLocaleString()}
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-500' :
                    order.status === 'shipped' ? 'bg-blue-500/20 text-blue-500' :
                    order.status === 'confirmed' ? 'bg-brand-gold/20 text-brand-gold' :
                    'bg-white/10 text-white/40'
                  }`}>
                    {order.status || 'pending'}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 bg-white/5 border border-white/10 hover:bg-brand-gold hover:text-brand-black transition-all"
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                    <button 
                      onClick={() => handleStartEdit(order)}
                      className="p-2 bg-white/5 border border-white/10 hover:bg-blue-500 hover:text-white transition-all"
                      title="Edit Details"
                    >
                      <Save size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteOrder(order.id)}
                      className={`p-2 transition-all ${
                        confirmDeleteOrderId === order.id 
                        ? "bg-brand-red text-white border-brand-red animate-pulse" 
                        : "bg-white/5 border-white/10 hover:bg-brand-red hover:text-white"
                      } border`}
                      title={confirmDeleteOrderId === order.id ? "Confirm Delete" : "Delete Order"}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-brand-black/95 backdrop-blur-md overflow-hidden"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0f0f0f] border border-white/10 w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl relative"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
                    <ClipboardList className="text-brand-gold" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">Order Detail</h3>
                    <p className="text-[10px] text-brand-gold font-mono font-bold tracking-widest">#{selectedOrder.orderNo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <button 
                      onClick={handleSaveEdit}
                      className="px-6 py-2 bg-brand-gold text-brand-black text-[10px] uppercase font-black tracking-widest hover:bg-white transition-all flex items-center gap-2"
                    >
                      <Save size={14} /> Save Changes
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStartEdit(selectedOrder)}
                      className="px-6 py-2 bg-white/5 border border-white/10 text-[10px] uppercase font-black tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                      <Save size={14} /> Edit Order
                    </button>
                  )}
                  <button 
                    onClick={() => { setSelectedOrder(null); setIsEditing(false); }}
                    className="p-2 hover:bg-white/10 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Customer Info */}
                    <DetailSection title="Personal Information" icon={User}>
                      <DataField label="Full Name" value={isEditing ? editFormData.customer?.fullName : selectedOrder.customer?.fullName} field="customer.fullName" />
                      <DataField label="Email Address" value={isEditing ? editFormData.customer?.email : selectedOrder.customer?.email} field="customer.email" />
                      <DataField label="Mobile Number" value={isEditing ? editFormData.customer?.phone : selectedOrder.customer?.phone} field="customer.phone" />
                    </DetailSection>

                    {/* Billing info */}
                    <DetailSection title="Billing Information" icon={MapPin}>
                      <div className="md:col-span-2">
                        <DataField label="Address" value={isEditing ? editFormData.customer?.billingAddress : selectedOrder.customer?.billingAddress} field="customer.billingAddress" />
                      </div>
                      <DataField label="Landmark" value={isEditing ? editFormData.customer?.billingLandmark : selectedOrder.customer?.billingLandmark} field="customer.billingLandmark" />
                      <DataField label="City" value={isEditing ? editFormData.customer?.billingCity : selectedOrder.customer?.billingCity} field="customer.billingCity" />
                      <DataField label="State" value={isEditing ? editFormData.customer?.billingState : selectedOrder.customer?.billingState} field="customer.billingState" />
                      <DataField label="Country" value={isEditing ? editFormData.customer?.billingCountry : selectedOrder.customer?.billingCountry} field="customer.billingCountry" />
                    </DetailSection>

                    {/* Shipping info */}
                    <DetailSection title="Shipping Information" icon={Truck}>
                      <div className="md:col-span-2">
                        <DataField label="Location Type" value={isEditing ? editFormData.customer?.shippingLocation : selectedOrder.customer?.shippingLocation} field="customer.shippingLocation" />
                      </div>
                      <div className="md:col-span-2">
                        <DataField label="Address" value={isEditing ? editFormData.customer?.shippingAddress : selectedOrder.customer?.shippingAddress} field="customer.shippingAddress" />
                      </div>
                      <DataField label="Landmark" value={isEditing ? editFormData.customer?.shippingLandmark : selectedOrder.customer?.shippingLandmark} field="customer.shippingLandmark" />
                      <DataField label="City" value={isEditing ? editFormData.customer?.shippingCity : selectedOrder.customer?.shippingCity} field="customer.shippingCity" />
                    </DetailSection>

                    {/* Payment info */}
                    <DetailSection title="Payment Information" icon={CreditCard}>
                      <DataField label="Payment Method" value={isEditing ? editFormData.customer?.paymentMethod : selectedOrder.customer?.paymentMethod} field="customer.paymentMethod" />
                      <DataField label="Transaction Ref" value={isEditing ? editFormData.customer?.transactionReference : selectedOrder.customer?.transactionReference} field="customer.transactionReference" />
                    </DetailSection>

                    {/* Additional */}
                    <DetailSection title="Additional Information" icon={Info}>
                      <div className="md:col-span-2">
                        <DataField label="Order Notes" value={isEditing ? editFormData.customer?.orderNotes : selectedOrder.customer?.orderNotes} field="customer.orderNotes" />
                      </div>
                      <DataField label="Preferred Time" value={isEditing ? editFormData.customer?.preferredDeliveryTime : selectedOrder.customer?.preferredDeliveryTime} field="customer.preferredDeliveryTime" />
                      <DataField label="Instructions" value={isEditing ? editFormData.customer?.deliveryPreferences : selectedOrder.customer?.deliveryPreferences} field="customer.deliveryPreferences" />
                    </DetailSection>
                  </div>

                  {/* Right Column - Summary & Status */}
                  <div className="space-y-6">
                    <div className="bg-brand-gold/10 border border-brand-gold/20 p-6 space-y-6 sticky top-0">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-brand-gold" />
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-brand-gold">Status & Fulfillment</h4>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-white/40 tracking-widest">Current Status</label>
                        <div className="flex flex-wrap gap-2">
                          {['pending', 'confirmed', 'shipped', 'delivered'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleUpdateStatus(selectedOrder, status)}
                              className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                                selectedOrder.status === status 
                                  ? 'bg-brand-gold text-brand-black' 
                                  : 'bg-white/5 text-white/40 hover:bg-white/10'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/10 space-y-4">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                          <span className="text-white/40">Subtotal</span>
                          <span>{selectedOrder.items?.[0]?.currency === 'USD' ? '$' : '₦'}{selectedOrder.subtotal?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                          <span className="text-white/40">Ship Fee</span>
                          <span>{selectedOrder.items?.[0]?.currency === 'USD' ? '$' : '₦'}{selectedOrder.deliveryFee?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                          <span className="text-[11px] font-black uppercase tracking-widest text-brand-gold">Grand Total</span>
                          <span className="text-xl font-black text-brand-gold">{selectedOrder.items?.[0]?.currency === 'USD' ? '$' : '₦'}{selectedOrder.grandTotal?.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="pt-6 space-y-3">
                        <div className="flex items-center gap-2 mb-4">
                          <Package className="w-4 h-4 text-brand-gold" />
                          <h4 className="text-[11px] font-black uppercase tracking-widest">Items ({selectedOrder.items?.length || 0})</h4>
                        </div>
                        {selectedOrder.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between gap-4 py-2 border-b border-white/5 last:border-0">
                            <div>
                              <p className="text-[10px] font-black uppercase leading-tight">{item.title}</p>
                              <p className="text-[9px] text-white/40 mt-1 uppercase font-mono">QTY: {item.quantity}</p>
                            </div>
                            <p className="text-[10px] font-bold text-white/80">{item.currency === 'USD' ? '$' : '₦'}{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-black/40 flex justify-between items-center">
                 <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">The Vagina Room Management Node v2.0</p>
                 <button 
                  onClick={() => { setSelectedOrder(null); setIsEditing(false); }}
                  className="px-8 py-3 bg-white text-brand-black text-[10px] uppercase font-black tracking-widest hover:bg-brand-gold transition-all"
                 >
                   Dismiss View
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ClipboardList({ ...props }) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <path d="M9 14h6"/>
      <path d="M9 18h6"/>
      <path d="M9 10h6"/>
    </svg>
  );
}
