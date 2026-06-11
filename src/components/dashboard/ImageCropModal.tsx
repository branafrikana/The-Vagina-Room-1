import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion } from 'motion/react';
import { X, Check } from 'lucide-react';

interface Props {
  imageSrc: string;
  onCropComplete: (croppedBase64: string) => void;
  onClose: () => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number; }
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg');
}

export default function ImageCropModal({ imageSrc, onCropComplete, onClose }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropCompleteEvent = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (croppedAreaPixels) {
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedImage) {
                onCropComplete(croppedImage);
            }
        } catch (e) {
            console.error(e);
        }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] p-4 sm:p-6 bg-black/90 backdrop-blur-sm flex items-center justify-center font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden w-full max-w-lg shadow-2xl flex flex-col"
      >
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-950">
          <h3 className="text-white font-serif tracking-widest uppercase">Crop Headshot</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="relative w-full h-[300px] sm:h-[400px] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteEvent}
            onZoomChange={setZoom}
          />
        </div>

        <div className="p-6 bg-zinc-950 flex flex-col gap-4">
          <div className="flex items-center gap-4">
             <span className="text-xs font-mono tracking-widest text-white/50 uppercase">Zoom</span>
             <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-brand-gold h-1 bg-white/10 rounded-full appearance-none outline-none"
             />
          </div>
          <button
            onClick={handleSave}
            className="w-full py-3 bg-brand-gold hover:bg-yellow-500 text-brand-black font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 rounded transition-colors mt-2"
          >
             <Check size={16} /> Save Cropped Headshot
          </button>
        </div>
      </motion.div>
    </div>
  );
}
