'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { storage } from '@/lib/storage';
import { generateId, generateSKU, generateSlug } from '@/lib/utils';
import type { Product, ProductVariant, Category } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const { client } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: '', sku: '', description: '', category: '', basePrice: '', salePrice: '', inventory: '0', lowStockThreshold: '10', purchasePrice: '', location: '', slug: '', metaDescription: '', status: 'active' as Product['status'] });
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newCat, setNewCat] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);

  useEffect(() => { if (client) setCategories(storage.getCategories(client.id)); }, [client]);
  useEffect(() => { if (form.name) { setForm(f => ({ ...f, sku: f.sku || generateSKU(form.name), slug: generateSlug(form.name) })); } }, [form.name]);

  const addVariant = () => { setVariants([...variants, { id: generateId(), type: '', options: [] }]); };
  const updateVariant = (idx: number, field: string, value: string) => { const v = [...variants]; if (field === 'type') v[idx].type = value; setVariants(v); };
  const addOption = (idx: number, option: string) => { if (!option.trim()) return; const v = [...variants]; v[idx].options.push(option.trim()); setVariants(v); };
  const removeOption = (vIdx: number, oIdx: number) => { const v = [...variants]; v[vIdx].options.splice(oIdx, 1); setVariants(v); };
  const removeVariant = (idx: number) => { setVariants(variants.filter((_, i) => i !== idx)); };

  const addNewCategory = () => {
    if (!client || !newCat.trim()) return;
    const cat: Category = { id: generateId(), clientId: client.id, name: newCat.trim(), displayOrder: categories.length + 1, createdAt: new Date().toISOString() };
    storage.addCategory(client.id, cat);
    setCategories([...categories, cat]);
    setForm({ ...form, category: newCat.trim() });
    setNewCat('');
    setShowNewCat(false);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.basePrice || Number(form.basePrice) <= 0) e.basePrice = 'Must be > 0';
    if (form.salePrice && Number(form.salePrice) >= Number(form.basePrice)) e.salePrice = 'Must be less than base price';
    if (!form.category) e.category = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = (addAnother: boolean) => {
    if (!client || !validate()) return;
    setSaving(true);
    const now = new Date().toISOString();
    const product: Product = {
      id: generateId(), clientId: client.id, name: form.name.trim(), sku: form.sku || generateSKU(form.name), description: form.description, category: form.category,
      basePrice: Number(form.basePrice), salePrice: form.salePrice ? Number(form.salePrice) : undefined,
      images: ['/placeholder-product.svg'], variants, inventory: Number(form.inventory) || 0, lowStockThreshold: Number(form.lowStockThreshold) || 10,
      purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : undefined, location: form.location, slug: form.slug || generateSlug(form.name),
      metaDescription: form.metaDescription, status: form.status, views: 0, addToCartCount: 0, purchaseCount: 0, createdAt: now, updatedAt: now,
    };
    storage.addProduct(client.id, product);
    if (addAnother) {
      setForm({ name: '', sku: '', description: '', category: form.category, basePrice: '', salePrice: '', inventory: '0', lowStockThreshold: '10', purchasePrice: '', location: '', slug: '', metaDescription: '', status: 'active' });
      setVariants([]);
      setSaving(false);
    } else {
      router.push('/admin/products');
    }
  };

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>{children}{error && <p className="text-xs text-red-500 mt-1">{error}</p>}</div>
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <button onClick={() => router.push('/admin/products')} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Basic Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Product Name *" error={errors.name}>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </Field>
          <Field label="SKU">
            <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </Field>
        </div>
        <Field label="Description">
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value.slice(0, 500) })} rows={3} maxLength={500} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <p className="text-xs text-gray-400 mt-1">{form.description.length}/500</p>
        </Field>
        <Field label="Category *" error={errors.category}>
          <div className="flex gap-2">
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Select</option>{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <button onClick={() => setShowNewCat(!showNewCat)} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">+ New</button>
          </div>
          {showNewCat && <div className="flex gap-2 mt-2"><input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Category name" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" /><button onClick={addNewCategory} className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm">Add</button></div>}
        </Field>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Pricing</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Base Price (৳) *" error={errors.basePrice}>
            <input type="number" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: e.target.value })} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </Field>
          <Field label="Sale Price (৳)" error={errors.salePrice}>
            <input type="number" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </Field>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
              {form.salePrice && Number(form.salePrice) < Number(form.basePrice) ? `${Math.round(((Number(form.basePrice) - Number(form.salePrice)) / Number(form.basePrice)) * 100)}% OFF` : 'No discount'}
            </div>
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Variants</h2>
          <button onClick={addVariant} className="text-sm text-blue-500 hover:text-blue-600">+ Add Variant Type</button>
        </div>
        {variants.map((v, vi) => (
          <div key={v.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex gap-3 items-center">
              <input value={v.type} onChange={e => updateVariant(vi, 'type', e.target.value)} placeholder="e.g. Size, Color" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <button onClick={() => removeVariant(vi)} className="text-red-500 text-sm">Remove</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {v.options.map((o, oi) => (
                <span key={oi} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">{o}<button onClick={() => removeOption(vi, oi)} className="text-blue-400 hover:text-blue-600">×</button></span>
              ))}
            </div>
            <div className="flex gap-2">
              <input placeholder="Add option" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" onKeyDown={e => { if (e.key === 'Enter') { addOption(vi, (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }} />
            </div>
          </div>
        ))}
      </div>

      {/* Inventory */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Inventory</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Current Stock"><input type="number" value={form.inventory} onChange={e => setForm({ ...form, inventory: e.target.value })} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></Field>
          <Field label="Low Stock Threshold"><input type="number" value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></Field>
          <Field label="Purchase Price (৳)"><input type="number" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></Field>
        </div>
        <Field label="Location/Shelf"><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></Field>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">SEO & Visibility</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="URL Slug"><input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></Field>
          <Field label="Status">
            <div className="flex gap-4 mt-1">{(['active', 'hidden', 'archived'] as const).map(s => (
              <label key={s} className="flex items-center gap-2 text-sm"><input type="radio" name="status" checked={form.status === s} onChange={() => setForm({ ...form, status: s })} /><span className="capitalize">{s}</span></label>
            ))}</div>
          </Field>
        </div>
        <Field label="Meta Description"><textarea value={form.metaDescription} onChange={e => setForm({ ...form, metaDescription: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></Field>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button onClick={() => router.push('/admin/products')} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
        <button onClick={() => save(true)} disabled={saving} className="px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50">Save & Add Another</button>
        <button onClick={() => save(false)} disabled={saving} className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50">{saving ? 'Saving...' : 'Save Product'}</button>
      </div>
    </div>
  );
}
