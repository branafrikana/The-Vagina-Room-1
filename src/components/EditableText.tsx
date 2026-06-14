import React, { useState, useRef, useEffect } from "react";
import { Edit3, Check, X, Minus, Plus } from "lucide-react";
import { useContent, ContentData, FALLBACK_DEFAULTS } from "../context/ContentContext";

interface EditableTextProps {
  field: keyof ContentData | string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div" | "ul";
  multiline?: boolean;
  fancyMode?: "break" | "inline" | "darkBreak";
  fancyColor?: string;
  children?: React.ReactNode;
}

function formatFancyText(text: string, mode: "break" | "inline" | "darkBreak", colorClass = "text-brand-red") {
  if (!text) return "";
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/);
  if (words.length <= 1) {
    return <span className={`${mode === "darkBreak" ? "text-brand-black" : colorClass} italic font-light lowercase`}>{trimmed}</span>;
  }
  const lastWord = words[words.length - 1];
  const mainText = words.slice(0, words.length - 1).join(" ");
  const actualColorClass = mode === "darkBreak" ? "text-brand-black" : colorClass;
  const isBreak = mode === "break" || mode === "darkBreak";
  return (
    <>
      {mainText}
      {isBreak ? <br /> : " "}
      <span className={`${actualColorClass} italic font-light lowercase`}>{lastWord}</span>
    </>
  );
}

export default function EditableText({
  field,
  className = "",
  as: Component = "span",
  multiline = false,
  fancyMode,
  fancyColor,
  children,
}: EditableTextProps) {
  const { content, isAdmin, isEditMode, updateContentField } = useContent();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const dbValue = (content as any)[field];
  const rawText = dbValue !== undefined && dbValue !== null && dbValue !== ""
    ? dbValue
    : ((FALLBACK_DEFAULTS as any)[field] || "");
  
  // Parse font size overrides
  const sizeOverrides = JSON.parse(content.fontSizeOverridesJson || "{}");
  const currentSize = sizeOverrides[field as string] || null;

  useEffect(() => {
    if (!isEditing) {
      setValue(rawText);
    }
  }, [rawText, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      const focusAndSetCursor = () => {
        const el = inputRef.current;
        if (!el) return;
        el.focus();
        if ("selectionStart" in el) {
          el.selectionStart = el.value.length;
          el.selectionEnd = el.value.length;
        }
      };

      focusAndSetCursor();
      const rafId = requestAnimationFrame(focusAndSetCursor);
      const timerId = setTimeout(focusAndSetCursor, 30);
      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timerId);
      };
    }
  }, [isEditing]);

  const updateFontSize = (delta: number) => {
    const newOverrides = { ...sizeOverrides };
    const current = currentSize || 100; // 100% as baseline
    const next = Math.max(50, Math.min(300, current + delta));
    
    if (next === 100) {
      delete newOverrides[field as string];
    } else {
      newOverrides[field as string] = next;
    }
    
    updateContentField("fontSizeOverridesJson", JSON.stringify(newOverrides));
  };

  const textStyle = currentSize ? { fontSize: `${currentSize}%`, lineHeight: '1.2' } : {};

  const handleStartEdit = (e: React.MouseEvent) => {
    if (!isAdmin || !isEditMode) return;
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(true);
  };

  const handleSave = () => {
    updateContentField(field as keyof ContentData, value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(rawText);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation(); // Shield keyboard shortcuts and other system page listeners from intercepting keys
    
    if (e.key === "Enter") {
      if (!multiline) {
        e.preventDefault();
        handleSave();
      } else if (e.ctrlKey || e.metaKey) {
        // Support Ctrl+Enter / Cmd+Enter to save in textarea
        e.preventDefault();
        handleSave();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing && isAdmin && isEditMode) {
    return (
      <div className="inline-block relative w-full z-40 text-left" onClick={(e) => e.stopPropagation()}>
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-brand-black border border-brand-gold/70 text-white p-3 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold min-h-[100px] resize-y rounded-none"
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-brand-black border border-brand-gold/70 text-white px-3 py-1 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold rounded-none"
          />
        )}
        
        <div className="flex flex-wrap gap-2.5 mt-2 justify-between items-center">
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-0.5">
            <button 
              onClick={() => updateFontSize(-5)}
              className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Decrease Font Size"
            >
              <Minus size={10} />
            </button>
            <span className="text-[9px] font-mono text-brand-gold px-1 min-w-[30px] text-center">
              {currentSize || 100}%
            </span>
            <button 
              onClick={() => updateFontSize(5)}
              className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Increase Font Size"
            >
              <Plus size={10} />
            </button>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={handleCancel}
              className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white/50 hover:text-white border border-white/10 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X size={10} /> Esc
            </button>
            <button
              onClick={handleSave}
              className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-brand-gold text-brand-black font-semibold hover:bg-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Check size={10} className="stroke-[3]" /> Enter
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isEditable = isAdmin && isEditMode;

  return (
    <Component
      onClick={handleStartEdit}
      style={textStyle}
      className={`group relative transition-all duration-200 ${
        isEditable 
          ? "cursor-edit border-b border-dashed border-brand-gold/30 hover:border-brand-gold" 
          : ""
      } ${className}`}
      title={isEditable ? "Click to edit inline and adjust size" : ""}
    >
      {children ? children : (fancyMode ? formatFancyText(rawText, fancyMode, fancyColor) : rawText)}
      {isEditable && (
        <span className="absolute -top-6 right-0 bg-brand-gold text-brand-black text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-lg pointer-events-none z-50 whitespace-nowrap">
          <Edit3 size={8} /> Edit & Resize
        </span>
      )}
    </Component>
  );
}
