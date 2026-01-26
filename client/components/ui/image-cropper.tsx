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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 overflow-auto">
      <div className="relative bg-white rounded-lg p-8 shadow-2xl w-full max-w-xl flex flex-col items-center mx-4 my-8">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
        <div className="relative w-80 h-80 bg-gray-100 max-w-full">
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
          <Button onClick={handleSave} className="bg-indigo-600 text-white min-w-[100px]">Save</Button>
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
