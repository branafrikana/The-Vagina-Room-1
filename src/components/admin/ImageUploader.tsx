import React, { useState } from "react";
import { useContent, ContentData } from "../../context/ContentContext";

interface ImageUploaderProps {
  fieldKey: keyof ContentData;
  label: string;
  onUploadSuccess?: (url: string) => void;
  currentValue?: string;
}

export function ImageUploader({ fieldKey, label, onUploadSuccess, currentValue }: ImageUploaderProps) {
  const { content, updateContentField, uploadImage } = useContent();
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setStatus("error");
      setErrorText("File size exceeds 10MB limit.");
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setLocalPreview(base64Data);
      
      setStatus("uploading");
      setErrorText("");

      try {
        const res = await uploadImage(base64Data, file.name);
        if (res.success && res.url) {
          if (onUploadSuccess) {
            onUploadSuccess(res.url);
          } else {
            updateContentField(fieldKey, res.url);
          }
          setStatus("success");
          // Keep local preview until re-render, or reset it
          setTimeout(() => setStatus("idle"), 3000);
        } else {
          setStatus("error");
          setErrorText(res.error || "Upload rejected.");
          setLocalPreview(null);
        }
      } catch (err) {
        setStatus("error");
        setErrorText("Unexpected upload error.");
        setLocalPreview(null);
      }
    };
    reader.onerror = () => {
      setStatus("error");
      setErrorText("Could not read file data.");
    };
    reader.readAsDataURL(file);
  };

  const currentUrl = localPreview || (currentValue !== undefined ? currentValue : content[fieldKey]);

  // Clean, truncated name presentation to avoid displaying massive base64 or long CDN URLs
  const cleanUrlText = currentUrl
    ? currentUrl.startsWith("data:")
      ? "Local Image (Uploading...)"
      : currentUrl.length > 40
        ? currentUrl.substring(currentUrl.lastIndexOf('/') + 1) || (currentUrl.slice(0, 37) + "...")
        : (currentUrl as string)
    : "No image selected";

  return (
    <div className="bg-white/5 border border-white/10 p-4 space-y-3 rounded-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-gold block">{label}</span>
          <span className="text-[11px] font-mono text-white/60 block mt-1 truncate select-all leading-normal" title={(currentUrl as string) || ""}>
            {cleanUrlText}
          </span>
        </div>
        <div className="flex-shrink-0">
          {currentUrl ? (
            <div className="w-16 h-16 bg-neutral-900/60 rounded border border-white/10 flex items-center justify-center p-1 overflow-hidden group relative">
              <img 
                src={currentUrl as string} 
                alt="Preview" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-white/5 rounded border border-dashed border-white/10 flex items-center justify-center text-white/20 text-[10px] font-mono">
              NONE
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center justify-center h-9 px-4 bg-brand-gold text-brand-black text-[10px] uppercase font-black tracking-wider hover:bg-brand-red hover:text-white transition-colors cursor-pointer select-none rounded">
          {status === "uploading" ? (
            <span className="flex items-center gap-1">Uploading...</span>
          ) : (
            <span className="flex items-center gap-1.5">Choose File & Upload</span>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="hidden" 
            disabled={status === "uploading"}
          />
        </label>
        
        {status === "success" && (
          <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">✓ Assets secured</span>
        )}
        {status === "error" && (
          <span className="text-[10px] font-mono text-brand-red font-bold flex items-center gap-1">✕ {errorText}</span>
        )}
      </div>
    </div>
  );
}
