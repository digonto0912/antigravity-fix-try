'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { useCart } from '@/hooks/useCart';
import { formatCurrency, calculateDiscountPercent } from '@/lib/utils';
import type { Product } from '@/lib/types';
import StockTicker from '@/components/storefront/StockTicker';
import Notifications from '@/components/storefront/Notifications';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const cid = storage.getCartClientId();
    if (!cid) return;
    const client = storage.getClient(cid);
    if (client?.storefrontSettings) setPrimaryColor(client.storefrontSettings.primaryColor);
    const p = storage.getProduct(cid, id);
    if (p) {
      setProduct(p);
      storage.updateProduct(cid, id, { views: p.views + 1 });
      const defaults: Record<string, string> = {};
      p.variants.forEach(v => { if (v.options.length > 0) defaults[v.type] = v.options[0]; });
      setSelectedVariants(defaults);
      setRelated(storage.getProducts(cid).filter(x => x.status === 'active' && x.category === p.category && x.id !== p.id).slice(0, 4));
    }
  }, [id]);

  if (!product) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400">Product not found</div>;

  const discount = product.salePrice ? calculateDiscountPercent(product.basePrice, product.salePrice) : 0;
  const price = product.salePrice || product.basePrice;

  const handleAdd = () => {
    addItem({ productId: product.id, productName: product.name, image: product.images[0], price, quantity, variant: selectedVariants });
    const cid = storage.getCartClientId();
    if (cid) storage.updateProduct(cid, product.id, { addToCartCount: product.addToCartCount + 1 });
    setAdded(true); setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <StockTicker inventory={product.inventory} />
      <Notifications productName={product.name} />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6"><Link href="/" className="hover:text-gray-600">Home</Link> / <Link href="/products" className="hover:text-gray-600">Products</Link> / <span className="text-gray-700">{product.name}</span></nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center relative">
          <span className="text-9xl">🛍️</span>
          {discount > 0 && <span className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-full">SAVE {discount}%</span>}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-wider">{product.category}</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold" style={{ color: primaryColor }}>{formatCurrency(price)}</span>
            {product.salePrice && <span className="text-xl text-gray-400 line-through">{formatCurrency(product.basePrice)}</span>}
            {discount > 0 && <span className="px-2 py-1 bg-red-100 text-red-700 text-sm font-bold rounded">{discount}% OFF</span>}
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Variants */}
          {product.variants.map(v => (
            <div key={v.id}>
              <label className="text-sm font-medium text-gray-700 mb-2 block">{v.type}</label>
              <div className="flex flex-wrap gap-2">
                {v.options.map(o => (
                  <button key={o} onClick={() => setSelectedVariants({ ...selectedVariants, [v.type]: o })} className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${selectedVariants[v.type] === o ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>{o}</button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Quantity</label>
            <div className="inline-flex items-center border border-gray-300 rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 text-gray-600 hover:bg-gray-50">−</button>
              <span className="px-6 py-2 font-medium border-x border-gray-300">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))} className="px-4 py-2 text-gray-600 hover:bg-gray-50">+</button>
            </div>
            {product.inventory > 0 && product.inventory <= 10 && <p className="text-sm text-orange-600 mt-2">⚡ Only {product.inventory} left in stock!</p>}
          </div>

          {/* Add to cart */}
          <button onClick={handleAdd} disabled={product.inventory === 0} className="w-full py-4 rounded-xl text-lg font-bold text-white transition-all hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed" style={{ backgroundColor: product.inventory > 0 ? primaryColor : undefined }}>
            {added ? '✓ Added to Cart!' : product.inventory === 0 ? 'Out of Stock' : `Add to Cart — ${formatCurrency(price * quantity)}`}
          </button>

          {/* Info */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-500"><span>🚚</span> Free shipping over ৳1,000</div>
            <div className="flex items-center gap-2 text-sm text-gray-500"><span>💰</span> Cash on Delivery</div>
            <div className="flex items-center gap-2 text-sm text-gray-500"><span>🔄</span> 7-day returns</div>
            <div className="flex items-center gap-2 text-sm text-gray-500"><span>✅</span> Quality guaranteed</div>
          </div>

          <div className="text-xs text-gray-400">SKU: {product.sku}</div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map(p => (
              <Link key={p.id} href={`/products/${p.id}`} className="group bg-white rounded-xl border hover:shadow-lg transition-all">
                <div className="aspect-square bg-gray-50 rounded-t-xl flex items-center justify-center"><span className="text-4xl">🛍️</span></div>
                <div className="p-3"><h3 className="text-sm font-medium group-hover:text-blue-600">{p.name}</h3><p className="text-sm font-bold mt-1">{formatCurrency(p.salePrice || p.basePrice)}</p></div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
