'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { useCart } from '@/hooks/useCart';
import { formatCurrency, calculateDiscountPercent } from '@/lib/utils';
import type { Product } from '@/lib/types';
import Notifications from '@/components/storefront/Notifications';
import { AccordionSections, ReviewsSection } from '@/components/storefront/ProductDetailSections';
import {
  ChevronLeft, Heart, Star, ChevronDown, Clock, Truck,
  ArrowRight, MessageSquare, HelpCircle, Flag, Play
} from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [activeImg, setActiveImg] = useState(0);
  const [openSections, setOpenSections] = useState<string[]>(['details']);
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [recentBuyers, setRecentBuyers] = useState(0);

  const toggleSection = (s: string) =>
    setOpenSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  useEffect(() => {
    setRecentBuyers(Math.floor(Math.random() * 12) + 2);
    const run = async () => {
      const cid = await storage.getCartClientId();
      if (!cid) return;
      const p = await storage.getProduct(cid, id);
      if (p) {
        setProduct(p);
        await storage.updateProduct(cid, id, { views: p.views + 1 });
        const defaults: Record<string, string> = {};
        p.variants.forEach(v => { if (v.options.length > 0) defaults[v.type] = v.options[0]; });
        setSelectedVariants(defaults);
        const allProds = await storage.getProducts(cid);
        setRelated(allProds.filter(x => x.status === 'active' && x.category === p.category && x.id !== p.id).slice(0, 6));
      }
    };
    run();
  }, [id]);

  if (!product) return (
    <div className="min-h-screen bg-sf-bg-primary flex items-center justify-center font-sf-sans text-sf-primary-light text-lg">Loading product…</div>
  );

  const discount = product.salePrice ? calculateDiscountPercent(product.basePrice, product.salePrice) : 0;
  const price = product.salePrice || product.basePrice;
  const images = product.images.length > 0 ? product.images : [];
  const hasImages = images.length > 0;

  const handleAdd = async () => {
    addItem({ productId: product.id, productName: product.name, image: product.images[0], price, quantity, variant: selectedVariants });
    const cid = await storage.getCartClientId();
    if (cid) await storage.updateProduct(cid, product.id, { addToCartCount: product.addToCartCount + 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const navImg = (dir: number) => { if (hasImages) setActiveImg(p => (p + dir + images.length) % images.length); };

  return (
    <div className="min-h-screen bg-sf-bg-primary font-sf-sans text-sf-primary antialiased">
      <Notifications productName={product.name} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="py-4 md:py-6">
          <Link href="/products" className="flex items-center gap-1 text-sf-primary-light hover:text-sf-primary font-bold text-[13.1px] tracking-tight transition-colors">
            <ChevronLeft className="w-4 h-4" />Back to search results
          </Link>
        </header>

        {/* Main Product Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-8 md:gap-12 mt-4 md:mt-8 pb-20">
          {/* LEFT: Gallery + Reviews */}
          <div className="space-y-12">
            {/* Gallery */}
            <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
              {/* Thumbnails */}
              {hasImages && images.length > 1 && (
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
                  {images.map((img, idx) => (
                    <button key={idx} onClick={() => setActiveImg(idx)}
                      className={`relative w-15 h-15 rounded-sm overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-all ${activeImg === idx ? 'border-sf-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-80'}`}>
                      <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="relative flex-1 aspect-square bg-black/5 rounded-sm overflow-hidden group">
                {product.purchaseCount > 3 && (
                  <div className="absolute top-4 left-4 z-10 bg-sf-accent-yellow px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-sf-primary fill-sf-primary" />
                    <span className="text-[13px] font-bold text-sf-primary">Bestseller</span>
                  </div>
                )}
                <button onClick={() => setWishlisted(!wishlisted)} className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Heart className={`w-6 h-6 transition-colors ${wishlisted ? 'fill-sf-accent-red text-sf-accent-red' : 'text-sf-primary hover:fill-sf-accent-red hover:text-sf-accent-red'}`} />
                </button>
                <div className="w-full h-full flex items-center justify-center">
                  {hasImages ? <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" /> : <span className="text-9xl">🛍️</span>}
                </div>
                {hasImages && images.length > 1 && (
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => navImg(-1)} className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md hover:bg-gray-50 active:scale-95 transition-all"><ChevronLeft className="w-6 h-6" /></button>
                    <button onClick={() => navImg(1)} className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md hover:bg-gray-50 active:scale-95 transition-all"><ArrowRight className="w-6 h-6" /></button>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Reviews */}
            <ReviewsSection />
          </div>

          {/* RIGHT: Sidebar */}
          <aside className="space-y-8">
            <div className="space-y-5">
              {/* Urgency */}
              <p className="text-[13px] font-bold text-sf-accent-red flex items-center gap-2 bg-sf-accent-red/5 p-3 rounded-sm">
                <Clock className="w-4 h-4" />In demand. {recentBuyers} people bought this recently.
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <span className="text-[34px] font-bold tracking-tight">{formatCurrency(price)}</span>
                {product.salePrice && <span className="text-xl text-sf-primary-light line-through decoration-sf-primary opacity-60">{formatCurrency(product.basePrice)}</span>}
              </div>
              {discount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-sf-accent-green/10 text-sf-accent-green px-2.5 py-1 rounded-sm font-bold">{discount}% off</span>
                  <span className="text-sf-accent-green font-bold">• Limited time sale</span>
                </div>
              )}
              <p className="text-[13.8px] text-sf-primary-light border-b border-sf-border-light pb-4">VAT included (where applicable)</p>
            </div>

            {/* Title + Stars */}
            <div className="space-y-3">
              <h1 className="text-xl md:text-[22px] leading-snug font-medium">{product.name}</h1>
              <p className="font-bold text-[15px] hover:underline cursor-pointer flex items-center gap-2">
                {product.category}<HelpCircle className="w-4 h-4 opacity-30" />
              </p>
              <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-sf-primary fill-sf-primary" />)}</div>
            </div>

            {/* Returns */}
            <div className="flex items-center gap-3 text-[14px] py-1">
              <Truck className="w-5 h-5 text-sf-primary-light" /><span>Returns &amp; exchanges accepted</span>
            </div>

            {/* Variants + Quantity + Add to Cart */}
            <div className="space-y-5 pt-2">
              {product.variants.map(v => (
                <div key={v.id} className="space-y-2.5">
                  <label className="text-[14px] font-bold">{v.type}</label>
                  <div className="relative">
                    <select value={selectedVariants[v.type] || ''} onChange={e => setSelectedVariants({ ...selectedVariants, [v.type]: e.target.value })}
                      className="w-full h-12 px-4 border border-sf-border rounded-sm appearance-none bg-transparent hover:border-sf-primary transition-colors focus:outline-none cursor-pointer text-[15.5px]">
                      {v.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none opacity-50" />
                  </div>
                </div>
              ))}

              {/* Personalization */}
              <button className="flex items-center gap-2 text-[13.5px] font-bold py-2.5 hover:bg-black/5 px-3 -mx-3 rounded transition-colors group w-full text-left">
                <MessageSquare className="w-4 h-4 opacity-60" />
                <span className="flex-1">Add personalization <span className="font-normal text-sf-primary-light">(optional)</span></span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              {/* Quantity */}
              <div className="space-y-2.5">
                <label className="text-[14px] font-bold">Quantity</label>
                <div className="relative">
                  <select value={quantity} onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full h-12 px-4 border border-sf-border rounded-sm appearance-none bg-transparent hover:border-sf-primary transition-colors focus:outline-none cursor-pointer text-[15.5px]">
                    {Array.from({ length: Math.min(product.inventory || 10, 10) }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none opacity-50" />
                </div>
              </div>

              {/* Add to Cart Button */}
              <button onClick={handleAdd} disabled={product.inventory === 0}
                className={`w-full h-14 rounded-full font-bold text-[16px] transition-all shadow-md mt-4 ${
                  added ? 'bg-sf-accent-green text-white scale-[0.98]'
                  : product.inventory === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-sf-primary text-white hover:scale-[1.01] active:scale-[0.98]'
                }`}>
                {added ? '✓ Added to Cart!' : product.inventory === 0 ? 'Out of Stock' : `Add to cart — ${formatCurrency(price * quantity)}`}
              </button>
            </div>

            {/* Collapsible Accordion Sections */}
            <AccordionSections openSections={openSections} toggleSection={toggleSection} description={product.description} category={product.category} sku={product.sku} />

            {/* Report */}
            <button className="flex items-center gap-2 text-[13.5px] font-bold underline underline-offset-4 py-2 hover:text-sf-accent-red transition-colors">
              <Flag className="w-4 h-4" />Report this item
            </button>
          </aside>
        </main>

        {/* Similar Products */}
        {related.length > 0 && (
          <section className="pt-20 pb-32 border-t border-sf-border-light mt-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">
                <h2 className="text-3xl md:text-4xl font-sf-serif tracking-tight text-sf-primary">You may also like</h2>
                <div className="flex items-center gap-2 bg-black/5 px-2 py-1 rounded">
                  <span className="text-[12px] font-bold text-sf-primary-light uppercase tracking-wider">Including ads</span>
                  <HelpCircle className="w-3.5 h-3.5 opacity-30" />
                </div>
              </div>
              <Link href="/products" className="px-8 py-3.5 border-2 border-sf-primary rounded-full text-sm font-bold hover:bg-sf-primary hover:text-white transition-all transform active:scale-95">See more</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 md:gap-4">
              {related.map(p => {
                const rPrice = p.salePrice || p.basePrice;
                return (
                  <Link key={p.id} href={`/products/${p.id}`} className="group relative block">
                    <div className="aspect-square rounded-xl mb-3 overflow-hidden shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1 bg-sf-bg-secondary">
                      {p.images[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="text-5xl">🛍️</span></div>}
                      <button className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 active:scale-90" onClick={e => e.preventDefault()}>
                        <Heart className="w-5 h-5 text-sf-primary" />
                      </button>
                    </div>
                    <h3 className="text-[14px] line-clamp-2 leading-relaxed mb-1.5 text-sf-primary/90 font-medium group-hover:text-sf-primary transition-colors">{p.name}</h3>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sf-accent-green-dark text-[16px]">{formatCurrency(rPrice)}</span>
                      {p.salePrice && <span className="text-[13px] text-sf-primary-light line-through decoration-sf-primary opacity-40">{formatCurrency(p.basePrice)}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
