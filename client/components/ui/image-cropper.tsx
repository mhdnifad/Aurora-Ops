import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import Cropper, { Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropper({ image, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropCompleteInternal = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async () => {
    const createImage = (url: string) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', (error) => reject(error));
        img.src = url;
      });
    };
    const imageEl = await createImage(image);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (!croppedAreaPixels) return;
    const { width, height, x, y } = croppedAreaPixels;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imageEl, x, y, width, height, 0, 0, width, height);
    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    const croppedImg = await getCroppedImg();
    if (croppedImg) onCropComplete(croppedImg);
  };

  const modal = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-auto animate-fadeIn">
      <div className="relative rounded-2xl backdrop-blur-2xl bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95 border border-gray-200/50 dark:border-gray-700/50 p-8 shadow-2xl w-full max-w-xl flex flex-col items-center mx-4 my-8 animate-scaleIn">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold focus:outline-none transition-colors duration-200"
          aria-label="Close"
        >
          ×
        </button>
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Crop Image</h3>
        <div className="relative w-80 h-80 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 max-w-full rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteInternal}
          />
        </div>
        <div className="flex gap-4 mt-6 w-full justify-center">
          <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/50 min-w-[100px]">Save</Button>
          <Button onClick={onCancel} variant="outline" className="min-w-[100px]">Cancel</Button>
        </div>
      </div>
    </div>
  );

  if (typeof window !== 'undefined') {
    return ReactDOM.createPortal(modal, document.body);
  }
  return null;
}
