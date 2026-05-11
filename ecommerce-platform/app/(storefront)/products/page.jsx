'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { storage } from '@/lib/storage';
import { useCart } from '@/hooks/useCart';
import { formatCurrency, calculateDiscountPercent } from '@/lib/utils';

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-400">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const primaryColor = '#3b82f6';
  const { addItem } = useCart();
  const [added, setAdded] = useState(null);

  useEffect(() => { const _run = async () => {
    const cid = await storage.getCartClientId();
    if (!cid) return;
    const allProds = await storage.getProducts(cid);
    setProducts(allProds.filter(p => p.status === 'active'));
    setCategories(await storage.getCategories(cid));
    // Auto-select category from URL param
    const catParam = searchParams.get('cat');
    if (catParam) setCategory(catParam);
  }; _run(); }, [searchParams]);

  let filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== 'all' && p.category !== category) return false;
    return true;
  });

  switch (sort) {
    case 'price_low': filtered.sort((a, b) => (a.salePrice || a.basePrice) - (b.salePrice || b.basePrice)); break;
    case 'price_high': filtered.sort((a, b) => (b.salePrice || b.basePrice) - (a.salePrice || a.basePrice)); break;
    case 'popular': filtered.sort((a, b) => b.purchaseCount - a.purchaseCount); break;
    default: filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const handleAdd = (p) => {
    addItem({ productId: p.id, productName: p.name, image: p.images[0], price: p.salePrice || p.basePrice, quantity: 1 });
    setAdded(p.id); setTimeout(() => setAdded(null), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">All Products</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="flex-1 min-w-[200px] px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white">
          <option value="newest">Newest</option><option value="price_low">Price: Low to High</option><option value="price_high">Price: High to Low</option><option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Results */}
      <p className="text-sm text-gray-500 mb-4">{filtered.length} products found</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(p => {
          const discount = p.salePrice ? calculateDiscountPercent(p.basePrice, p.salePrice) : 0;
          return (
            <div key={p.id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Link href={`/products/${p.id}`} className="block relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center overflow-hidden">
                {p.images?.[0] && p.images[0] !== '/placeholder-product.svg' ? (
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl">🛍️</span>
                )}
                {discount > 0 && <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">{discount}% OFF</span>}
                {p.inventory === 0 && <span className="absolute top-3 right-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-full">Sold Out</span>}
                {p.inventory > 0 && p.inventory <= 5 && <span className="absolute bottom-3 left-3 px-2 py-1 bg-orange-500 text-white text-xs rounded-full">Only {p.inventory} left!</span>}
              </Link>
              <div className="p-4">
                <Link href={`/products/${p.id}`}><h3 className="font-semibold text-gray-900 group-hover:text-blue-600">{p.name}</h3></Link>
                <p className="text-xs text-gray-400 mt-1">{p.category}</p>
                <div className="flex items-center gap-2 mt-2">
                  {p.salePrice ? (<><span className="text-lg font-bold" style={{color:primaryColor}}>{formatCurrency(p.salePrice)}</span><span className="text-sm text-gray-400 line-through">{formatCurrency(p.basePrice)}</span></>) : <span className="text-lg font-bold">{formatCurrency(p.basePrice)}</span>}
                </div>
                <button onClick={() => handleAdd(p)} disabled={p.inventory === 0} className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:bg-gray-200 disabled:text-gray-400" style={{backgroundColor: p.inventory > 0 ? primaryColor : undefined}}>
                  {added === p.id ? '✓ Added!' : p.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="text-center py-16 text-gray-400"><span className="text-5xl block mb-4">🔍</span><p>No products found</p></div>}
    </div>
  );
}
