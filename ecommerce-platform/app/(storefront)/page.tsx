'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { useCart } from '@/hooks/useCart';
import { formatCurrency, calculateDiscountPercent } from '@/lib/utils';
import type { Product } from '@/lib/types';
import SpinWheel from '@/components/storefront/SpinWheel';

export default function StorefrontHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeName, setStoreName] = useState('Store');
  const [tagline, setTagline] = useState('Quality Products, Best Prices');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const { addItem } = useCart();
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    const cid = storage.getCartClientId();
    if (!cid) return;
    const client = storage.getClient(cid);
    if (client?.storefrontSettings) {
      setStoreName(client.storefrontSettings.storeName);
      setTagline(client.storefrontSettings.tagline);
      setPrimaryColor(client.storefrontSettings.primaryColor);
    }
    setProducts(storage.getProducts(cid).filter(p => p.status === 'active').slice(0, 8));
  }, []);

  const handleAdd = (p: Product) => {
    addItem({ productId: p.id, productName: p.name, image: p.images[0], price: p.salePrice || p.basePrice, quantity: 1 });
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <div>
      <SpinWheel />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, ' + primaryColor + ' 0%, transparent 50%)' }} />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{storeName}</h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">{tagline}</p>
          <Link href="/products" className="inline-block px-8 py-3 rounded-full text-white font-semibold text-lg transition-transform hover:scale-105" style={{ backgroundColor: primaryColor }}>
            Shop Now →
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
          <p className="text-gray-500 mt-2">Discover our best sellers</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(p => {
            const discount = p.salePrice ? calculateDiscountPercent(p.basePrice, p.salePrice) : 0;
            return (
              <div key={p.id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Link href={`/products/${p.id}`} className="block relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                  <span className="text-6xl">🛍️</span>
                  {discount > 0 && <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">{discount}% OFF</span>}
                  {p.inventory === 0 && <span className="absolute top-3 right-3 px-2 py-1 bg-gray-800 text-white text-xs rounded-full">Sold Out</span>}
                </Link>
                <div className="p-4">
                  <Link href={`/products/${p.id}`} className="block">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{p.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{p.category}</p>
                  </Link>
                  <div className="flex items-center gap-2 mt-2">
                    {p.salePrice ? (<><span className="text-lg font-bold" style={{ color: primaryColor }}>{formatCurrency(p.salePrice)}</span><span className="text-sm text-gray-400 line-through">{formatCurrency(p.basePrice)}</span></>) : <span className="text-lg font-bold text-gray-900">{formatCurrency(p.basePrice)}</span>}
                  </div>
                  <button onClick={() => handleAdd(p)} disabled={p.inventory === 0} className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white hover:opacity-90" style={{ backgroundColor: p.inventory > 0 ? primaryColor : undefined }}>
                    {added === p.id ? '✓ Added!' : p.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {products.length === 0 && <p className="text-center text-gray-400 py-12">No products available</p>}
        <div className="text-center mt-10">
          <Link href="/products" className="inline-block px-6 py-3 border-2 rounded-full font-semibold text-sm transition-colors hover:text-white" style={{ borderColor: primaryColor, color: primaryColor }}>
            View All Products →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          {[
            { icon: '🚚', title: 'Fast Delivery', desc: 'Delivery within 3-5 business days' },
            { icon: '💰', title: 'Cash on Delivery', desc: 'Pay when you receive your order' },
            { icon: '🔄', title: 'Easy Returns', desc: '7-day return policy on all items' },
          ].map(f => (
            <div key={f.title} className="p-6"><span className="text-4xl">{f.icon}</span><h3 className="font-bold text-gray-900 mt-4 mb-2">{f.title}</h3><p className="text-sm text-gray-500">{f.desc}</p></div>
          ))}
        </div>
      </section>
    </div>
  );
}
