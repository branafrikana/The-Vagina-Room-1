import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

interface ArrayJSONEditorProps {
  label: string;
  fieldKey: string;
  value: string;
  onChange: (key: string, value: string) => void;
  defaultStructure: any;
  itemType: string;
  fallbackData?: any[];
  categoriesKey?: string; // New: Key for master categories list in content context
}

export default function ArrayJSONEditor({ label, fieldKey, value, onChange, defaultStructure, itemType, fallbackData, categoriesKey }: ArrayJSONEditorProps) {
  const { content, updateContentField, uploadImage } = useContent();
  const [items, setItems] = useState<any[]>(() => {
    if (!value) return fallbackData || [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : (fallbackData || []);
    } catch {
      return fallbackData || [];
    }
  });
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  
  // Master categories derived from content context
  const masterCategories = React.useMemo(() => {
    if (!categoriesKey) return [];
    try {
      const val = (content as any)[categoriesKey];
      if (!val) return [];
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [content, categoriesKey]);

  const updateMasterCategories = (newCats: string[]) => {
    if (categoriesKey) {
      updateContentField(categoriesKey as any, JSON.stringify(newCats));
    }
  };

  const addCategory = (cat: string) => {
    if (!cat.trim() || masterCategories.includes(cat.trim())) return;
    updateMasterCategories([...masterCategories, cat.trim()]);
  };

  const removeCategory = (cat: string) => {
    updateMasterCategories(masterCategories.filter((c: string) => c !== cat));
  };
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ [id: string]: 'idle' | 'uploading' | 'success' | 'error' }>({});
  const [uploadError, setUploadError] = useState<{ [id: string]: string }>({});

  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (!value) {
      setItems(fallbackData || []);
    } else {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        } else if (fallbackData) {
          setItems(fallbackData);
        } else {
          setItems([]);
        }
      } catch {
        setItems(fallbackData || []);
      }
    }
  }

  const save = (newItems: any[]) => {
    onChange(fieldKey, JSON.stringify(newItems, null, 2));
  };

  const addItem = () => {
    const newItem = typeof defaultStructure === 'function' 
      ? defaultStructure() 
      : typeof defaultStructure === 'string' 
        ? "" 
        : { ...defaultStructure };
    const newItems = [...items, newItem];
    setItems(newItems);
    save(newItems);
    setExpandedIndex(newItems.length - 1);
  };

  const updatePrimitiveItem = (index: number, val: string) => {
    const newItems = [...items];
    newItems[index] = val;
    setItems(newItems);
    save(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    save(newItems);
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const updateItemField = (index: number, key: string, val: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: val };
    setItems(newItems);
    save(newItems);
  };
  
  const updateItemArrayListItem = (index: number, arrayKey: string, arrayIndex: number, val: string) => {
    const newItems = [...items];
    const arr = [...(newItems[index][arrayKey] || [])];
    arr[arrayIndex] = val;
    newItems[index] = { ...newItems[index], [arrayKey]: arr };
    setItems(newItems);
    save(newItems);
  };
  
  const addItemArrayListItem = (index: number, arrayKey: string) => {
    const newItems = [...items];
    const arr = [...(newItems[index][arrayKey] || []), ""];
    newItems[index] = { ...newItems[index], [arrayKey]: arr };
    setItems(newItems);
    save(newItems);
  };
  
  const removeItemArrayListItem = (index: number, arrayKey: string, arrayIndex: number) => {
    const newItems = [...items];
    const arr = [...(newItems[index][arrayKey] || [])];
    arr.splice(arrayIndex, 1);
    newItems[index] = { ...newItems[index], [arrayKey]: arr };
    setItems(newItems);
    save(newItems);
  };

  const handleItemFileChange = async (index: number, key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const id = `${index}-${key}`;

    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus(prev => ({ ...prev, [id]: 'error' }));
      setUploadError(prev => ({ ...prev, [id]: 'File size exceeds 10MB limit.' }));
      return;
    }

    setUploadStatus(prev => ({ ...prev, [id]: 'uploading' }));
    setUploadError(prev => ({ ...prev, [id]: '' }));

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await uploadImage(base64Data, file.name);
        if (res.success && res.url) {
          updateItemField(index, key, res.url);
          setUploadStatus(prev => ({ ...prev, [id]: 'success' }));
          setTimeout(() => {
            setUploadStatus(prev => ({ ...prev, [id]: 'idle' }));
          }, 3000);
        } else {
          setUploadStatus(prev => ({ ...prev, [id]: 'error' }));
          setUploadError(prev => ({ ...prev, [id]: res.error || 'Upload rejected.' }));
        }
      } catch (err) {
        setUploadStatus(prev => ({ ...prev, [id]: 'error' }));
        setUploadError(prev => ({ ...prev, [id]: 'Unexpected upload error.' }));
      }
    };
    reader.onerror = () => {
      setUploadStatus(prev => ({ ...prev, [id]: 'error' }));
      setUploadError(prev => ({ ...prev, [id]: 'Could not read file data.' }));
    };
    reader.readAsDataURL(file);
  };

  const renderField = (item: any, key: string, index: number) => {
    const val = item[key];
    if (Array.isArray(val)) {
      return (
        <div key={key} className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/50 block">{key}</label>
          {val.map((arrItem, aIdx) => (
            <div key={aIdx} className="flex items-center gap-2">
               <input
                 type="text"
                 value={arrItem}
                 onChange={(e) => updateItemArrayListItem(index, key, aIdx, e.target.value)}
                 className="flex-1 bg-white/5 border border-white/10 p-2 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs"
               />
               <button type="button" onClick={() => removeItemArrayListItem(index, key, aIdx)} className="text-white/30 hover:text-brand-red p-2"><Trash2 size={14}/></button>
            </div>
          ))}
          <button type="button" onClick={() => addItemArrayListItem(index, key)} className="text-[10px] uppercase font-black text-brand-gold hover:text-white flex items-center gap-1"><Plus size={12}/> Add {key} Item</button>
        </div>
      );
    }

    if (
      key.toLowerCase().includes('image') ||
      key.toLowerCase().includes('avatar') ||
      key.toLowerCase().includes('photo') ||
      key.toLowerCase().includes('logo')
    ) {
      const id = `${index}-${key}`;
      const status = uploadStatus[id] || 'idle';
      const errText = uploadError[id] || '';
      return (
        <div key={key} className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-white/50 block">{key}</label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/5 p-4 border border-white/10">
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={val || ''}
                onChange={(e) => updateItemField(index, key, e.target.value)}
                className="w-full bg-brand-black border border-white/10 p-2.5 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs font-mono"
                placeholder="Image URL"
              />
              
              <div className="flex items-center gap-2">
                <label className="cursor-pointer bg-brand-red hover:bg-white text-white hover:text-brand-black px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] transition-colors inline-block text-center rounded-none">
                  {status === 'uploading' ? 'Uploading...' : 'Upload Image'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleItemFileChange(index, key, e)} 
                    className="hidden" 
                  />
                </label>
                {status === 'success' && <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider">✓ Success</span>}
                {status === 'error' && <span className="text-[9px] text-brand-red font-bold uppercase tracking-wider">{errText || 'Error'}</span>}
              </div>
            </div>

            <div className="flex-shrink-0 self-center">
              {val ? (
                <img 
                  src={val} 
                  alt="List item preview" 
                  className="w-16 h-16 object-cover border border-white/10"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-white/20 text-xs">
                  None
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    // Simple text or textarea (if description/answer)
    const isTextArea = key.toLowerCase().includes('description') || key.toLowerCase().includes('answer') || key.toLowerCase().includes('content') || key.toLowerCase().includes('quote') || key.toLowerCase().includes('bio');
    const isCategory = key.toLowerCase() === 'category' || key.toLowerCase() === 'type';
    const defaultCategories = key.toLowerCase() === 'type' ? ["Media Appearance", "Trusted Partner"] : [];
    const availableCategories = masterCategories.length > 0 ? masterCategories : defaultCategories;
    const uniqueOptions = isCategory 
      ? Array.from(new Set(["All", ...availableCategories, ...items.map(item => item[key]).filter(Boolean)])) 
      : [];

    return (
      <div key={key} className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-white/50 block">{key}</label>
        {isTextArea ? (
          <textarea
            value={val || ''}
            onChange={(e) => updateItemField(index, key, e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs h-20"
          />
        ) : isCategory ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <select
                value={availableCategories.includes(val) ? val : "custom"}
                onChange={(e) => {
                  if (e.target.value !== "custom") {
                    updateItemField(index, key, e.target.value);
                  }
                }}
                className="flex-grow bg-white/5 border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
              >
                <option value="custom" className="bg-brand-black">--- Select Category ---</option>
                {availableCategories.map((opt: string, i: number) => (
                  <option key={i} value={opt} className="bg-brand-black">{opt}</option>
                ))}
              </select>
              <input
                type="text"
                value={val || ''}
                onChange={(e) => updateItemField(index, key, e.target.value)}
                className="flex-1 bg-white/10 border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none text-xs"
                placeholder="Or type custom..."
              />
              {val && !availableCategories.includes(val) && categoriesKey && (
                <button
                  type="button"
                  onClick={() => addCategory(val)}
                  title="Add this to Global Categories list"
                  className="bg-brand-gold text-brand-black px-4 flex items-center justify-center hover:bg-white transition-all group"
                >
                  <Plus size={14} className="group-hover:scale-125 transition-transform" />
                </button>
              )}
            </div>
            {val && !availableCategories.includes(val) && (
              <p className="text-[8px] text-brand-gold italic">This is a custom category. Click the + button to save it for reuse.</p>
            )}
          </div>
        ) : (
          <input
            type="text"
            value={val || ''}
            onChange={(e) => updateItemField(index, key, e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs"
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 border border-white/10 p-6 bg-white/5 mt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold block">{label}</label>
          {categoriesKey && (
            <button 
              type="button"
              onClick={() => setShowCategoryManager(!showCategoryManager)}
              className="text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1.5 hover:border-brand-gold/50 hover:text-brand-gold transition-all flex items-center gap-2"
            >
              <Filter size={10} className={showCategoryManager ? "text-brand-gold" : "text-white/30"} />
              {showCategoryManager ? "Close Category Manager" : "Manage Global Categories"}
            </button>
          )}
        </div>
        <button 
          type="button"
          onClick={addItem}
          className="bg-brand-red hover:bg-white text-white hover:text-brand-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors"
        >
          <Plus size={14} /> Add {itemType}
        </button>
      </div>

      {categoriesKey && showCategoryManager && (
        <div className="bg-brand-black/40 border border-brand-gold/20 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
           <div className="flex items-center justify-between">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold">Global {itemType} Categories</h4>
           </div>
           
           <div className="flex flex-wrap gap-2">
             {masterCategories.map((cat: string) => (
               <div key={cat} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 text-[10px] font-bold">
                 {cat}
                 <button onClick={() => removeCategory(cat)} className="text-white/30 hover:text-brand-red"><Trash2 size={10} /></button>
               </div>
             ))}
             {masterCategories.length === 0 && <span className="text-[10px] text-white/20 italic">No global categories defined yet.</span>}
           </div>

           <div className="flex gap-2">
             <input 
               type="text" 
               placeholder="Add new category"
               className="bg-brand-black border border-white/10 p-2 text-xs text-white focus:border-brand-gold focus:outline-none w-48"
               onKeyDown={(e) => {
                 if (e.key === 'Enter') {
                   e.preventDefault();
                   addCategory((e.target as HTMLInputElement).value);
                   (e.target as HTMLInputElement).value = '';
                 }
               }}
             />
             <button 
               type="button"
               onClick={(e) => {
                 const input = (e.currentTarget.previousSibling as HTMLInputElement);
                 addCategory(input.value);
                 input.value = '';
               }}
               className="bg-white/5 hover:bg-brand-gold hover:text-brand-black border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors"
             >
               Add
             </button>
           </div>
           <p className="text-[9px] text-white/30 italic">Note: These categories will appear in the selection dropdown when editing items.</p>
        </div>
      )}

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="border border-white/10 bg-brand-black overflow-hidden">
            <div 
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-white/5"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <div className="flex items-center gap-4">
                <GripVertical size={16} className="text-white/20" />
                <span className="text-sm font-bold truncate max-w-xs">{typeof item === 'string' ? item : (item.title || item.question || item.name || `${itemType} ${index + 1}`)}</span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeItem(index); }}
                  className="text-white/30 hover:text-brand-red transition-colors p-2"
                >
                  <Trash2 size={16} />
                </button>
                {expandedIndex === index ? <ChevronUp size={20} className="text-brand-gold" /> : <ChevronDown size={20} className="text-white/30" />}
              </div>
            </div>

            {expandedIndex === index && (
              <div className="p-6 border-t border-white/10 space-y-6 bg-white/[0.02]">
                {typeof defaultStructure === 'string' ? (
                  <div className="space-y-4 font-sans">
                    <label className="text-[10px] font-black uppercase tracking-wider text-white/50 block">{itemType} Value</label>
                    <input
                      type="text"
                      value={typeof item === 'string' ? item : ''}
                      onChange={(e) => updatePrimitiveItem(index, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-3 text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs"
                    />
                  </div>
                ) : (
                  Object.keys(defaultStructure).filter(k => k !== 'icon').map(key => renderField(item, key, index))
                )}
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-8 text-white/30 text-xs font-mono">
            No items yet. Click button above to add.
          </div>
        )}
      </div>
    </div>
  );
}
