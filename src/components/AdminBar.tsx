import { useContent } from "../context/ContentContext";
import { Link, useLocation } from "react-router-dom";
import { Eye, Edit3, Save, Compass, LogOut, Check, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function AdminBar() {
  const { isAdmin, isEditMode, setEditMode, saveContentChanges } = useContent();
  const location = useLocation();
  const [saving, setSaving] = useState(false);
  const [outcome, setOutcome] = useState<string | null>(null);

  // If the user isn't logged in as admin, or is currently visiting the admin page, do not render this toolbar
  if (!isAdmin || location.pathname === "/admin") {
    return null;
  }

  const handleQuickSave = async () => {
    setSaving(true);
    setOutcome(null);
    try {
      const result = await saveContentChanges();
      if (result.success) {
        setOutcome("Saved!");
        setTimeout(() => setOutcome(null), 3000);
      } else {
        setOutcome("Error");
        setTimeout(() => setOutcome(null), 3000);
      }
    } catch (e) {
      setOutcome("Fail");
      setTimeout(() => setOutcome(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed top-0 inset-x-0 z-[9999] bg-brand-black/95 backdrop-blur-md border-b border-brand-gold/30 p-2 md:p-3 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs w-full shadow-2xl font-sans">
      <div className="flex items-center gap-3">
        {/* Flashing Status Indicator */}
        <span className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white">
          THE VAGINA ROOM <span className="text-brand-gold italic lowercase font-serif font-light text-xs ml-1 font-bold">cms controller</span>
        </span>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {/* Toggle Mode Button */}
        <button
          onClick={() => setEditMode(!isEditMode)}
          className={`px-3 py-1.5 rounded-none text-[8.5px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer border ${
            isEditMode
              ? "bg-brand-gold text-brand-black border-brand-gold font-bold"
              : "bg-white/5 border-white/10 text-white hover:bg-white/10"
          }`}
          title="Toggle inline edit controls"
        >
          {isEditMode ? (
            <>
              <Edit3 size={11} className="stroke-[2.5]" /> Editing Mode Active
            </>
          ) : (
            <>
              <Eye size={11} /> Browse Mode Active
            </>
          )}
        </button>

        {/* Global Quick Save */}
        <button
          onClick={handleQuickSave}
          disabled={saving}
          className="px-3 py-1.5 bg-brand-red text-white hover:bg-white hover:text-brand-black border border-brand-red hover:border-white rounded-none text-[8.5px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <Save size={11} /> 
          {saving ? "Persisting..." : outcome ? outcome : "Quick Save"}
        </button>

        {/* CMS Dashboard Anchor */}
        <Link
          to="/admin"
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-brand-gold border border-brand-gold/20 rounded-none text-[8.5px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-1"
        >
          <Compass size={11} /> Launch Dashboard
        </Link>
      </div>
    </div>
  );
}
