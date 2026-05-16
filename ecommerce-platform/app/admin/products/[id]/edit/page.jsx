'use client';
import { useState, useEffect, useCallback, use } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { storage } from '@/lib/storage';
import { generateSlug } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { generateId, formatCurrency } from '@/lib/utils';

// Defined outside component to prevent focus loss on re-render
function F({ label, error, children }) {
  return (
    <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>{children}{error && <p className="text-xs text-red-500 mt-1">{error}</p>}</div>
  );
}

export default function EditProductPage({ params }) {
  const { id } = use(params);
  const { client } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ name: '', description: '', category: '', basePrice: '', discountPercent: '', inventory: '0', lowStockThreshold: '10', purchasePrice: '', slug: '', status: 'active' });
  const [variants, setVariants] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!client) return;
    const init = async () => {
      setCategories(await storage.getCategories(client.id));
      const p = await storage.getProduct(client.id, id);
      if (p) {
        // Calculate discount percent from basePrice and salePrice
        let discPct = '';
        if (p.salePrice && p.salePrice < p.basePrice) {
          discPct = String(Math.round(((p.basePrice - p.salePrice) / p.basePrice) * 100));
        }
        setForm({ name: p.name, description: p.description, category: p.category, basePrice: String(p.basePrice), discountPercent: discPct, inventory: String(p.inventory), lowStockThreshold: String(p.lowStockThreshold), purchasePrice: p.purchasePrice ? String(p.purchasePrice) : '', slug: p.slug, status: p.status });
        setVariants(p.variants || []);
        // Load existing images
        if (p.images && p.images.length > 0) {
          setImagePreview(p.images.filter(url => url && url !== '/placeholder-product.svg'));
        }
      }
    };
    init();
  }, [client, id]);

  // Use stable callback updater to prevent focus loss
  const updateField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const addVariant = useCallback(() => {
    setVariants(prev => [...prev, { id: generateId(), type: '', options: [] }]);
  }, []);

  const removeVariant = useCallback((idx) => {
    setVariants(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const updateVariant = useCallback((idx, field, value) => {
    setVariants(prev => {
      const v = [...prev];
      if (field === 'type') v[idx] = { ...v[idx], type: value };
      return v;
    });
  }, []);

  const addOption = useCallback((idx, opt) => {
    if (!opt.trim()) return;
    setVariants(prev => {
      const v = [...prev];
      v[idx] = { ...v[idx], options: [...v[idx].options, opt.trim()] };
      return v;
    });
  }, []);

  const removeOption = useCallback((vi, oi) => {
    setVariants(prev => {
      const v = [...prev];
      v[vi] = { ...v[vi], options: v[vi].options.filter((_, i) => i !== oi) };
      return v;
    });
  }, []);

  // Handle Cloudinary image upload
  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setImagePreview(prev => [...prev, data.url]);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setUploadingImage(false);
  }, []);

  const removeImage = useCallback((idx) => {
    setImagePreview(prev => prev.filter((_, i) => i !== idx));
  }, []);

  // Calculate final price from base price and discount
  const baseNum = Number(form.basePrice) || 0;
  const discNum = Number(form.discountPercent) || 0;
  const finalPrice = discNum > 0 ? Math.round(baseNum * (1 - discNum / 100)) : baseNum;

  const validate = useCallback(() => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.basePrice || baseNum <= 0) e.basePrice = 'Must be > 0';
    if (discNum < 0 || discNum >= 100) e.discountPercent = 'Must be 0-99%';
    if (!form.category) e.category = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form.name, form.basePrice, form.category, baseNum, discNum]);

  const save = useCallback(async () => {
    if (!client || !validate()) return;
    setSaving(true);
    const salePrice = discNum > 0 ? finalPrice : undefined;
    const images = imagePreview.length > 0 ? imagePreview : ['/placeholder-product.svg'];
    await storage.updateProduct(client.id, id, {
      name: form.name.trim(), description: form.description, category: form.category,
      basePrice: baseNum, salePrice, images,
      variants, inventory: Number(form.inventory), lowStockThreshold: Number(form.lowStockThreshold),
      purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : undefined,
      slug: form.slug || generateSlug(form.name), status: form.status,
    });
    router.push('/admin/products');
  }, [client, form, variants, imagePreview, validate, router, id, baseNum, discNum, finalPrice]);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-gray-900">Edit Product</h1><button onClick={() => router.push('/admin/products')} className="text-sm text-gray-500">← Back</button></div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold">Basic Information</h2>
        <F label="Name *" error={errors.name}><input value={form.name} onChange={e => updateField('name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></F>
        <F label="Description"><textarea value={form.description} onChange={e => updateField('description', e.target.value.slice(0, 500))} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></F>
        <F label="Category *" error={errors.category}><select value={form.category} onChange={e => updateField('category', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="">Select</option>{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></F>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold">Product Images</h2>
        <div className="flex flex-wrap gap-3">
          {imagePreview.map((url, i) => (
            <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
            </div>
          ))}
          <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            {uploadingImage ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
            ) : (
              <><span className="text-2xl text-gray-400">+</span><span className="text-xs text-gray-500">Upload</span></>
            )}
          </label>
        </div>
      </div>

      {/* Simplified Pricing: Price → Discount % → Final Price */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold">Pricing</h2>
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <F label="Price *" error={errors.basePrice}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">৳</span>
              <input type="number" value={form.basePrice} onChange={e => updateField('basePrice', e.target.value)} className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </F>
          <F label="Discount %" error={errors.discountPercent}>
            <div className="relative">
              <input type="number" min="0" max="99" value={form.discountPercent} onChange={e => updateField('discountPercent', e.target.value)} placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
            </div>
          </F>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Final Price</label>
            <div className="flex items-center gap-2 h-[38px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-lg font-bold text-green-600">{formatCurrency(finalPrice)}</span>
              {discNum > 0 && <span className="text-xs text-gray-400 line-through">{formatCurrency(baseNum)}</span>}
            </div>
          </div>
        </div>
        <F label="Purchase Price (cost)"><input type="number" value={form.purchasePrice} onChange={e => updateField('purchasePrice', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none max-w-xs" /></F>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between"><h2 className="font-semibold">Variants</h2><button onClick={addVariant} className="text-sm text-blue-500">+ Add</button></div>
        {variants.map((v, vi) => (
          <div key={v.id} className="border rounded-lg p-4 space-y-2">
            <div className="flex gap-2"><input value={v.type} onChange={e => updateVariant(vi, 'type', e.target.value)} placeholder="Type" className="flex-1 px-3 py-2 border rounded-lg text-sm" /><button onClick={() => removeVariant(vi)} className="text-red-500 text-sm">×</button></div>
            <div className="flex flex-wrap gap-1">{v.options.map((o, oi) => <span key={oi} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs flex items-center gap-1">{o}<button onClick={() => removeOption(vi, oi)}>×</button></span>)}</div>
            <input placeholder="Add option (Enter)" className="w-full px-3 py-2 border rounded-lg text-sm" onKeyDown={e => { if (e.key === 'Enter') { addOption(vi, (e.target).value); (e.target).value = ''; } }} />
          </div>
        ))}
      </div>

      {/* Inventory - only Current Stock and Low Threshold */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold">Inventory</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Current Stock"><input type="number" value={form.inventory} onChange={e => updateField('inventory', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></F>
          <F label="Low Stock Threshold"><input type="number" value={form.lowStockThreshold} onChange={e => updateField('lowStockThreshold', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" /></F>
        </div>
      </div>

      {/* Status only - SEO hidden */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold">Visibility</h2>
        <F label="Status"><div className="flex gap-4 mt-1">{(['active','hidden','archived']).map(s => <label key={s} className="flex items-center gap-1 text-sm"><input type="radio" checked={form.status===s} onChange={()=>updateField('status',s)} />{s}</label>)}</div></F>
      </div>

      <div className="flex gap-3 justify-end">
        <button onClick={() => router.push('/admin/products')} className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
        <button onClick={save} disabled={saving} className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50">{saving ? 'Saving...' : 'Update Product'}</button>
      </div>
    </div>
  );
}
