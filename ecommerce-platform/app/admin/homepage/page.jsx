'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { storage } from '@/lib/storage';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/shared/Toast';

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

export default function AdminHomepagePage() {
  const { client } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [saving, setSaving] = useState(false);
  const [uploadingLeft, setUploadingLeft] = useState(false);
  const [uploadingRight, setUploadingRight] = useState(false);

  useEffect(() => {
    if (!client) return;
    storage.getHomepageHero(client.id).then(data => {
      if (data) setHero({ ...DEFAULT_HERO, ...data });
    });
  }, [client]);

  const handleUpload = useCallback(async (e, side) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const setter = side === 'left' ? setUploadingLeft : setUploadingRight;
    setter(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setHero(prev => ({ ...prev, [side === 'left' ? 'leftImage' : 'rightImage']: data.url }));
      }
    } catch (err) { console.error('Upload failed:', err); }
    setter(false);
  }, []);

  const save = async () => {
    if (!client) return;
    setSaving(true);
    await storage.saveHomepageHero(client.id, hero);
    addToast('Homepage hero saved!', 'success');
    setSaving(false);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Homepage Editor</h1>

      {/* Left Hero Panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Hero — Left Panel</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
            <input value={hero.leftHeading} onChange={e => setHero({ ...hero, leftHeading: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
              <input value={hero.leftCta} onChange={e => setHero({ ...hero, leftCta: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
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
                <input type="file" accept="image/*" onChange={e => handleUpload(e, 'left')} className="hidden" />
                {uploadingLeft ? 'Uploading...' : '📷 Upload Image'}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Right Hero Panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Hero — Right Panel</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={hero.rightTitle} onChange={e => setHero({ ...hero, rightTitle: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
              <input value={hero.rightLinkText} onChange={e => setHero({ ...hero, rightLinkText: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
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
                <input type="file" accept="image/*" onChange={e => handleUpload(e, 'right')} className="hidden" />
                {uploadingRight ? 'Uploading...' : '📷 Upload Image'}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
