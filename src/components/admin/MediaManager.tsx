import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, query, orderBy, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import { useContent } from "../../context/ContentContext";
import { Search, Copy, Trash2, Upload, Check, Image, RefreshCw, X, Link } from "lucide-react";
import { uploadToCloudinaryClient, saveCloudinaryConfig } from "../../lib/cloudinary";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  type: string;
}

export default function MediaManager() {
  const { content, saveContentChanges } = useContent();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Cloudinary settings local modifications
  const [cloudinaryCloud, setCloudinaryCloud] = useState("dvttoctcl");
  const [cloudinaryPreset, setCloudinaryPreset] = useState("ml_default");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">("idle");

  // Load configured Cloudinary credentials on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cloudinary_config");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.cloudName) setCloudinaryCloud(parsed.cloudName);
        if (parsed.uploadPreset) setCloudinaryPreset(parsed.uploadPreset);
      }
    } catch (_) {}
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const mCol = collection(db, "media");
      const q = query(mCol, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const items: MediaItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as MediaItem);
      });
      setMedia(items);
    } catch (e) {
      console.error("Failed to query media entries", e);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = () => {
    setSaveStatus("saving");
    saveCloudinaryConfig(cloudinaryCloud, cloudinaryPreset);
    setTimeout(() => {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }, 800);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      const fileName = file.name;

      try {
        const res = await uploadToCloudinaryClient(base64Data, fileName);
        if (res.success && res.url) {
          const mediaId = "media_" + Date.now();
          const docRef = doc(db, "media", mediaId);
          await setDoc(docRef, {
            id: mediaId,
            name: fileName,
            url: res.url,
            createdAt: new Date().toISOString(),
            type: fileName.split('.').pop() || "image"
          });
          fetchMedia();
        } else {
          alert(res.error || "Upload rejected.");
        }
      } catch (err) {
        console.error("Upload error", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const deleteMedia = async (id: string) => {
    if (!confirm("Are you sure you want to delete this asset from the library?")) return;
    try {
      await deleteDoc(doc(db, "media", id));
      setMedia((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      console.error("Could not remove media asset info", e);
    }
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = media.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Cloudinary Direct Config block */}
      <div className="bg-brand-black/40 border border-white/5 p-6 rounded-xl space-y-4">
        <div>
          <h3 className="text-sm font-black text-brand-gold uppercase tracking-wider">Cloudinary Cloud Configuration</h3>
          <p className="text-white/40 text-xs mt-1">Configure your free unsigned Cloudinary credentials here to allow direct uploader connections.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black tracking-wider text-white/50 uppercase block mb-1">Cloud Name</label>
            <input
              type="text"
              value={cloudinaryCloud}
              onChange={(e) => setCloudinaryCloud(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded h-10 px-3 text-xs text-white focus:outline-none focus:border-brand-gold"
              placeholder="e.g. dvttoctcl"
              id="cloudinary_cloud_input"
            />
          </div>
          <div>
            <label className="text-[10px] font-black tracking-wider text-white/50 uppercase block mb-1">Unsigned Upload Preset</label>
            <input
              type="text"
              value={cloudinaryPreset}
              onChange={(e) => setCloudinaryPreset(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded h-10 px-3 text-xs text-white focus:outline-none focus:border-brand-gold"
              placeholder="e.g. ml_default"
              id="cloudinary_preset_input"
            />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            onClick={saveConfig}
            className="h-9 px-6 bg-brand-gold text-brand-black text-[10px] uppercase font-black tracking-widest hover:bg-brand-red hover:text-white transition-all rounded flex items-center justify-center gap-2"
            id="save_cloudinary_settings_btn"
          >
            {saveStatus === "saving" ? (
              <span className="flex items-center gap-1.5 animate-pulse">Saving Credentials...</span>
            ) : saveStatus === "success" ? (
              <span className="flex items-center gap-1.5 text-emerald-950 font-black">✓ Credentials Active</span>
            ) : (
              <span>Save Credentials</span>
            )}
          </button>
        </div>
      </div>

      {/* Main image gallery & direct uploader */}
      <div className="bg-brand-black/40 border border-white/5 p-6 rounded-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-brand-gold uppercase tracking-wider">CMS Media Uploader & Library</h3>
            <p className="text-white/40 text-xs mt-1">Direct Browser-to-Cloudinary uploading. Drag & drop images or click upload to host instantly.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="h-10 px-5 bg-brand-gold hover:bg-brand-red text-brand-black hover:text-white transition-all rounded text-[11px] font-black uppercase tracking-widest cursor-pointer flex items-center gap-2" id="trigger_media_file_upload">
              <Upload className="w-4 h-4" />
              <span>Upload New File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={fetchMedia}
              className="w-10 h-10 border border-white/10 hover:border-brand-gold rounded flex items-center justify-center text-white/60 hover:text-brand-gold transition-colors"
              title="Refresh Library"
              id="refresh_media_library_btn"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Searching filter */}
        <div className="relative">
          <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search media files by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded h-11 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-brand-gold"
            id="search_media_input"
          />
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.2em]">Listing digital assets...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/5 rounded-xl">
            <Image className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-white/40 text-xs">No media files registered in this catalog yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group bg-neutral-900 border border-white/5 rounded-lg overflow-hidden flex flex-col justify-between"
                id={`media_card_${item.id}`}
              >
                {/* Thumbnail display */}
                <div className="aspect-square bg-black flex items-center justify-center relative overflow-hidden p-2 border-b border-white/5">
                  <img
                    src={item.url}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-brand-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopy(item.id, item.url)}
                      className="p-2 bg-brand-gold text-brand-black hover:bg-white transition-colors rounded"
                      title="Copy Direct URL"
                      id={`copy_media_url_btn_${item.id}`}
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-700 font-bold" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteMedia(item.id)}
                      className="p-2 bg-brand-red text-white hover:bg-red-500 transition-colors rounded"
                      title="Delete Image"
                      id={`delete_media_btn_${item.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details layout */}
                <div className="p-3 bg-black/40 space-y-1">
                  <p className="text-[11px] font-bold text-white truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-[9px] font-mono text-white/40 block">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
