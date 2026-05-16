'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { storage } from '@/lib/storage';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/shared/Toast';
import ImageCropper from '@/components/shared/ImageCropper';

const DEFAULT_HERO = {
  leftHeading: 'Quick, creative gifts for Mom',
  leftCta: 'Shop for downloads',
  leftCtaLink: '/products',
  leftImage: '',
  rightTitle: "Rising sellers you'll want to get to know",
  rightLinkText: 'Shop now',
  rightLinkHref: '/products',
  rightImage: '',
};

const DEFAULT_BRANDING = {
  navbarLogoType: 'text', // 'text' or 'image'
  navbarLogoText: '',
  navbarLogoImage: '',
  footerLogoType: 'text', // 'text' or 'image'
  footerLogoText: '',
  footerLogoImage: '',
};

// Aspect ratios: navbar = 147:40 (w:h), footer = 74:71 (w:h)
const NAVBAR_ASPECT_RATIO = 147 / 40; // ~3.675
const FOOTER_ASPECT_RATIO = 74 / 71;  // ~1.042
const RATIO_TOLERANCE = 0.05; // 5% tolerance

function checkAspectRatio(file, targetRatio) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const fileRatio = img.naturalWidth / img.naturalHeight;
      const diff = Math.abs(fileRatio - targetRatio) / targetRatio;
      resolve({ matches: diff <= RATIO_TOLERANCE, width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve({ matches: false, width: 0, height: 0 });
    img.src = URL.createObjectURL(file);
  });
}

// LogoUploadField defined outside component to prevent focus loss
function LogoUploadField({ label, type, text, image, onTypeChange, onTextChange, onImageClear, onFileSelect, uploading, previewStyle, ratio }) {
  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
      <div className="text-xs text-gray-400 mb-1">
        Required ratio: {ratio} — images not matching this ratio will be cropped before upload.
      </div>
      <div className="flex gap-3">
        <label className={`flex-1 p-3 rounded-lg border-2 cursor-pointer text-center text-sm font-medium transition-all ${type === 'text' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
          <input type="radio" className="sr-only" checked={type === 'text'} onChange={() => onTypeChange('text')} />
          📝 Text Logo
        </label>
        <label className={`flex-1 p-3 rounded-lg border-2 cursor-pointer text-center text-sm font-medium transition-all ${type === 'image' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
          <input type="radio" className="sr-only" checked={type === 'image'} onChange={() => onTypeChange('image')} />
          🖼️ Image Logo
        </label>
      </div>
      {type === 'text' ? (
        <input value={text} onChange={e => onTextChange(e.target.value)} placeholder="Enter your store name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      ) : (
        <div className="flex items-center gap-4">
          {image && (
            <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white px-2 flex items-center" style={previewStyle}>
              <img src={image} alt="" className="w-full h-full object-contain" />
              <button onClick={onImageClear} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
            </div>
          )}
          <label className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition-colors">
            <input type="file" accept="image/*" onChange={onFileSelect} className="hidden" />
            {uploading ? 'Uploading...' : '📷 Upload'}
          </label>
        </div>
      )}
    </div>
  );
}

export default function AdminHomepagePage() {
  const { client } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploadingLeft, setUploadingLeft] = useState(false);
  const [uploadingRight, setUploadingRight] = useState(false);
  const [uploadingNavLogo, setUploadingNavLogo] = useState(false);
  const [uploadingFooterLogo, setUploadingFooterLogo] = useState(false);

  // Cropper state
  const [cropperData, setCropperData] = useState(null);
  // { imageSrc, aspectRatio, target, label }

  useEffect(() => {
    if (!client) return;
    Promise.all([
      storage.getHomepageHero(client.id),
      storage.getSettings(client.id, 'branding'),
      storage.getSettings(client.id, 'discount'),
    ]).then(([heroData, brandingData, discountData]) => {
      if (heroData) setHero({ ...DEFAULT_HERO, ...heroData });
      if (brandingData) setBranding({ ...DEFAULT_BRANDING, ...brandingData });
      if (discountData?.globalPercent) setGlobalDiscount(discountData.globalPercent);
    });
  }, [client]);

  // Upload a file (blob or File) to the API
  const uploadFile = useCallback(async (fileOrBlob, target) => {
    const setters = {
      left: setUploadingLeft, right: setUploadingRight,
      navLogo: setUploadingNavLogo, footerLogo: setUploadingFooterLogo,
    };
    setters[target](true);
    try {
      const formData = new FormData();
      formData.append('file', fileOrBlob);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        if (target === 'left') setHero(prev => ({ ...prev, leftImage: data.url }));
        else if (target === 'right') setHero(prev => ({ ...prev, rightImage: data.url }));
        else if (target === 'navLogo') setBranding(prev => ({ ...prev, navbarLogoImage: data.url }));
        else if (target === 'footerLogo') setBranding(prev => ({ ...prev, footerLogoImage: data.url }));
      }
    } catch (err) { console.error('Upload failed:', err); }
    setters[target](false);
  }, []);

  // Handle logo file selection — check ratio, show cropper if needed
  const handleLogoFileSelect = useCallback(async (e, target) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const targetRatio = target === 'navLogo' ? NAVBAR_ASPECT_RATIO : FOOTER_ASPECT_RATIO;
    const label = target === 'navLogo' ? 'Navbar Logo (147:40)' : 'Footer Logo (74:71)';

    const { matches } = await checkAspectRatio(file, targetRatio);

    if (matches) {
      // Ratio already matches — upload directly
      await uploadFile(file, target);
    } else {
      // Need cropping — show cropper
      const objectUrl = URL.createObjectURL(file);
      setCropperData({ imageSrc: objectUrl, aspectRatio: targetRatio, target, label });
    }

    // Reset input so the same file can be selected again
    e.target.value = '';
  }, [uploadFile]);

  // Handle crop result
  const handleCropComplete = useCallback(async (blob) => {
    if (!cropperData) return;
    const target = cropperData.target;
    // Clean up object URL
    URL.revokeObjectURL(cropperData.imageSrc);
    setCropperData(null);
    await uploadFile(blob, target);
  }, [cropperData, uploadFile]);

  const handleCropCancel = useCallback(() => {
    if (cropperData) URL.revokeObjectURL(cropperData.imageSrc);
    setCropperData(null);
  }, [cropperData]);

  // Handle hero image upload (no cropping needed)
  const handleHeroUpload = useCallback(async (e, target) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file, target);
  }, [uploadFile]);

  const save = async () => {
    if (!client) return;
    setSaving(true);
    await Promise.all([
      storage.saveHomepageHero(client.id, hero),
      storage.saveSettings(client.id, 'branding', branding),
      storage.saveSettings(client.id, 'discount', { globalPercent: Number(globalDiscount) }),
    ]);
    addToast('Settings saved!', 'success');
    setSaving(false);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>

      {/* ===== BRANDING ===== */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">🎨 Store Branding</h2>
        <p className="text-sm text-gray-500">Set your store logo for the navbar and footer. You can use text or upload an image for each.</p>
        <LogoUploadField
          label="Navbar Logo"
          type={branding.navbarLogoType}
          text={branding.navbarLogoText}
          image={branding.navbarLogoImage}
          onTypeChange={t => setBranding(prev => ({ ...prev, navbarLogoType: t }))}
          onTextChange={v => setBranding(prev => ({ ...prev, navbarLogoText: v }))}
          onImageClear={() => setBranding(prev => ({ ...prev, navbarLogoImage: '' }))}
          onFileSelect={e => handleLogoFileSelect(e, 'navLogo')}
          uploading={uploadingNavLogo}
          previewStyle={{ width: '147px', height: '40px' }}
          ratio="147 × 40 (W×H)"
        />
        <LogoUploadField
          label="Footer Logo"
          type={branding.footerLogoType}
          text={branding.footerLogoText}
          image={branding.footerLogoImage}
          onTypeChange={t => setBranding(prev => ({ ...prev, footerLogoType: t }))}
          onTextChange={v => setBranding(prev => ({ ...prev, footerLogoText: v }))}
          onImageClear={() => setBranding(prev => ({ ...prev, footerLogoImage: '' }))}
          onFileSelect={e => handleLogoFileSelect(e, 'footerLogo')}
          uploading={uploadingFooterLogo}
          previewStyle={{ width: '74px', height: '71px' }}
          ratio="74 × 71 (W×H)"
        />
      </div>

      {/* ===== GLOBAL DISCOUNT ===== */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">🏷️ Global Discount</h2>
        <p className="text-sm text-gray-500">Set a discount that applies to ALL products. Individual product discounts override this.</p>
        <div className="flex items-center gap-3 max-w-xs">
          <div className="relative flex-1">
            <input type="number" min="0" max="99" value={globalDiscount} onChange={e => setGlobalDiscount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
          </div>
          <span className="text-sm text-gray-500">off all products</span>
        </div>
        {Number(globalDiscount) > 0 && (
          <div className="bg-green-50 rounded-lg p-3 text-sm text-green-700">
            <strong>Active:</strong> All products will show {globalDiscount}% discount unless they have a specific discount set.
          </div>
        )}
      </div>

      {/* ===== HERO SECTION ===== */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">🏠 Hero — Left Panel</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
            <input value={hero.leftHeading} onChange={e => setHero({ ...hero, leftHeading: e.target.value })} maxLength={29} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <p className="text-xs text-gray-500 mt-1">Maximum 29 characters</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
              <input value={hero.leftCta} onChange={e => setHero({ ...hero, leftCta: e.target.value })} maxLength={18} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <p className="text-xs text-gray-500 mt-1">Maximum 18 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
              <input value={hero.leftCtaLink} onChange={e => setHero({ ...hero, leftCtaLink: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <div className="flex items-center gap-4">
              {hero.leftImage && (
                <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={hero.leftImage} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setHero({ ...hero, leftImage: '' })} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                </div>
              )}
              <label className="px-3 py-2 bg-gray-100 rounded-lg text-sm cursor-pointer hover:bg-gray-200 transition-colors">
                <input type="file" accept="image/*" onChange={e => handleHeroUpload(e, 'left')} className="hidden" />
                {uploadingLeft ? 'Uploading...' : '📷 Upload Image'}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">🏠 Hero — Right Panel</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={hero.rightTitle} onChange={e => setHero({ ...hero, rightTitle: e.target.value })} maxLength={41} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <p className="text-xs text-gray-500 mt-1">Maximum 42 characters</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
              <input value={hero.rightLinkText} onChange={e => setHero({ ...hero, rightLinkText: e.target.value })} maxLength={8} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <p className="text-xs text-gray-500 mt-1">Maximum 8 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
              <input value={hero.rightLinkHref} onChange={e => setHero({ ...hero, rightLinkHref: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Background Image</label>
            <div className="flex items-center gap-4">
              {hero.rightImage && (
                <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={hero.rightImage} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setHero({ ...hero, rightImage: '' })} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                </div>
              )}
              <label className="px-3 py-2 bg-gray-100 rounded-lg text-sm cursor-pointer hover:bg-gray-200 transition-colors">
                <input type="file" accept="image/*" onChange={e => handleHeroUpload(e, 'right')} className="hidden" />
                {uploadingRight ? 'Uploading...' : '📷 Upload Image'}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Image Cropper Modal */}
      {cropperData && (
        <ImageCropper
          imageSrc={cropperData.imageSrc}
          aspectRatio={cropperData.aspectRatio}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
          label={cropperData.label}
        />
      )}
    </div>
  );
}
