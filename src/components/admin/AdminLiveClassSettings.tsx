import React, { useState, useEffect } from "react";
import { Video, Save, ExternalLink } from "lucide-react";
import { useContent } from "../../context/ContentContext";

export default function AdminLiveClassSettings() {
  const { content, updateContentField, saveContentChanges } = useContent();
  const [config, setConfig] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveOutcome, setSaveOutcome] = useState<string | null>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(content?.generalSettingsJson || "{}");
      setConfig(parsed);
    } catch (e) {
      console.error("Error parsing generalSettingsJson:", e);
    }
  }, [content?.generalSettingsJson]);

  const handleConfigChange = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveOutcome(null);
    try {
      const updatedJson = JSON.stringify(config);
      updateContentField("generalSettingsJson", updatedJson);
      const res = await saveContentChanges();
      if (res.success) {
        setSaveOutcome("Settings saved successfully.");
      } else {
        setSaveOutcome("Failed to save settings.");
      }
    } catch (e) {
      console.error(e);
      setSaveOutcome("Error saving settings.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveOutcome(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/[0.02] border border-white/5 p-6 animate-fade-in text-left">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20 flex-shrink-0">
            <Video size={18} className="text-brand-gold" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase text-white tracking-widest font-sans">Live Class Control Panel</h2>
            <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono mt-0.5">Embed a broadcast for members to attend remotely.</p>
          </div>
        </div>

        <div className="space-y-6 max-w-3xl">
          <div>
            <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
              Class Activation Status
            </label>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={config?.isLiveClassActive || false}
                  onChange={(e) => handleConfigChange("isLiveClassActive", e.target.checked)}
                />
                <div className="w-11 h-6 bg-zinc-800 border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold"></div>
              </label>
              <span className="text-[10px] font-mono text-white/60">
                {config?.isLiveClassActive ? "GATEWAY OPEN (MEMBERS CAN JOIN)" : "GATEWAY CLOSED"}
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/[0.05]">
            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2">Live Class Embed URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. https://zoom.us/wc/join/your-meeting-id"
                  className="w-full bg-black/40 border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-brand-gold/60 font-mono tracking-widest"
                  value={config?.liveClassEmbedUrl || ""}
                  onChange={(e) => handleConfigChange("liveClassEmbedUrl", e.target.value)}
                />
                {config?.liveClassEmbedUrl && (
                  <a href={config.liveClassEmbedUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center p-3 text-brand-gold bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/20 transition-colors">
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              <p className="text-[9px] text-white/30 uppercase mt-2">Provides the iframe src stream for members dashboard.</p>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2">Broadcast Title</label>
              <input
                type="text"
                placeholder="e.g. Full Moon Somatic Restoration"
                className="w-full bg-black/40 border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-brand-gold/60"
                value={config?.liveClassTitle || ""}
                onChange={(e) => handleConfigChange("liveClassTitle", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2">Broadcast Intelligence / Notes</label>
              <textarea
                rows={3}
                placeholder="Important context or items they should bring..."
                className="w-full bg-black/40 border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-brand-gold/60 resize-none font-sans"
                value={config?.liveClassDescription || ""}
                onChange={(e) => handleConfigChange("liveClassDescription", e.target.value)}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.05] flex items-center justify-between">
            <p className="text-[10px] text-white/40 uppercase font-mono max-w-sm">Changes will broadcast across all live member dashboards immediately.</p>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-brand-gold text-brand-black hover:bg-white text-[10px] font-black uppercase tracking-widest transition-all min-w-[120px] flex items-center justify-center gap-2"
            >
              {isSaving ? "Persisting..." : <><Save size={14} /> Save Configuration</>}
            </button>
          </div>
          
          {saveOutcome && (
            <div className={`p-3 text-[10px] font-mono uppercase tracking-widest text-center ${saveOutcome.includes('Error') || saveOutcome.includes('Failed') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
              {saveOutcome}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
