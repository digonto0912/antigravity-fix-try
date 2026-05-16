'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * ImageCropper — a canvas-based cropper that enforces a specific aspect ratio.
 * Props:
 *   imageSrc: string — the object URL or data URL of the image to crop
 *   aspectRatio: number — width / height ratio to enforce
 *   onCrop: (blob: Blob) => void — callback with the cropped image blob
 *   onCancel: () => void — callback to cancel cropping
 *   label: string — label to display (e.g. "Navbar Logo")
 */
export default function ImageCropper({ imageSrc, aspectRatio, onCrop, onCancel, label }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0 });
  const [displayScale, setDisplayScale] = useState(1);

  // Load image and compute initial crop area
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const natW = img.naturalWidth;
      const natH = img.naturalHeight;
      setImgSize({ w: natW, h: natH });

      // Compute max crop rect that fits within image with the target aspect ratio
      let cropW, cropH;
      if (natW / natH > aspectRatio) {
        // Image is wider than target ratio — height-constrained
        cropH = natH;
        cropW = Math.round(natH * aspectRatio);
      } else {
        // Image is taller — width-constrained
        cropW = natW;
        cropH = Math.round(natW / aspectRatio);
      }

      const cropX = Math.round((natW - cropW) / 2);
      const cropY = Math.round((natH - cropH) / 2);
      setCrop({ x: cropX, y: cropY, w: cropW, h: cropH });
      setImgLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc, aspectRatio]);

  // Calculate display scale to fit image in container
  useEffect(() => {
    if (!imgLoaded || !containerRef.current) return;
    const maxW = containerRef.current.clientWidth - 32;
    const maxH = 400;
    const scale = Math.min(maxW / imgSize.w, maxH / imgSize.h, 1);
    setDisplayScale(scale);
  }, [imgLoaded, imgSize]);

  // Draw the preview
  useEffect(() => {
    if (!imgLoaded || !canvasRef.current || !imgRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const dw = Math.round(imgSize.w * displayScale);
    const dh = Math.round(imgSize.h * displayScale);
    canvasRef.current.width = dw;
    canvasRef.current.height = dh;

    // Draw full image
    ctx.drawImage(imgRef.current, 0, 0, dw, dh);

    // Draw dark overlay outside crop
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, dw, dh);

    // Clear crop area to show original
    const cx = crop.x * displayScale;
    const cy = crop.y * displayScale;
    const cw = crop.w * displayScale;
    const ch = crop.h * displayScale;
    ctx.clearRect(cx, cy, cw, ch);
    ctx.drawImage(imgRef.current, crop.x, crop.y, crop.w, crop.h, cx, cy, cw, ch);

    // Draw crop border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, cw, ch);

    // Corner handles
    const handleSize = 8;
    ctx.fillStyle = '#3b82f6';
    // Corners
    [
      [cx, cy], [cx + cw, cy],
      [cx, cy + ch], [cx + cw, cy + ch],
    ].forEach(([hx, hy]) => {
      ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
    });
  }, [imgLoaded, imgSize, crop, displayScale]);

  // Mouse/touch handlers for dragging the crop area
  const getPos = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) / displayScale,
      y: (clientY - rect.top) / displayScale,
    };
  }, [displayScale]);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    const pos = getPos(e);
    // Check if click is inside crop area
    if (pos.x >= crop.x && pos.x <= crop.x + crop.w && pos.y >= crop.y && pos.y <= crop.y + crop.h) {
      setDragging(true);
      setDragStart({ x: pos.x, y: pos.y, cropX: crop.x, cropY: crop.y });
    }
  }, [getPos, crop]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    e.preventDefault();
    const pos = getPos(e);
    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;
    let newX = Math.round(dragStart.cropX + dx);
    let newY = Math.round(dragStart.cropY + dy);

    // Clamp to image bounds
    newX = Math.max(0, Math.min(newX, imgSize.w - crop.w));
    newY = Math.max(0, Math.min(newY, imgSize.h - crop.h));

    setCrop(prev => ({ ...prev, x: newX, y: newY }));
  }, [dragging, dragStart, getPos, imgSize, crop.w, crop.h]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  // Perform the crop
  const handleCrop = useCallback(() => {
    if (!imgRef.current) return;
    const offscreen = document.createElement('canvas');
    offscreen.width = crop.w;
    offscreen.height = crop.h;
    const ctx = offscreen.getContext('2d');
    ctx.drawImage(imgRef.current, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
    offscreen.toBlob((blob) => {
      if (blob) onCrop(blob);
    }, 'image/png', 1);
  }, [crop, onCrop]);

  if (!imgLoaded) {
    return (
      <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center">
        <div className="bg-white rounded-xl p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-300 border-t-blue-500 mx-auto" />
          <p className="text-sm text-gray-600 mt-3">Loading image...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden" ref={containerRef}>
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Crop {label || 'Image'}</h3>
          <p className="text-xs text-gray-500 mt-1">
            Drag the highlighted area to reposition. Aspect ratio is locked.
          </p>
        </div>

        <div className="p-4 flex justify-center bg-gray-100" style={{ minHeight: '200px' }}>
          <canvas
            ref={canvasRef}
            className="cursor-move"
            style={{ maxWidth: '100%' }}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          />
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Crop: {crop.w}×{crop.h}px • Ratio: {(crop.w / crop.h).toFixed(2)}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCrop}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Crop & Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
