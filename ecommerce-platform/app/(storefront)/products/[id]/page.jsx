'use client';
import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils';
import { AccordionSections, ReviewsSection } from '@/components/storefront/ProductDetailSections';
import {
  ChevronLeft, Heart, Star, ChevronDown, Clock, Truck,
  ArrowRight, MessageSquare, HelpCircle, Flag
} from 'lucide-react';

// Cookie helpers
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}
function setCookie(name, value, maxAgeSec) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSec}; SameSite=Lax`;
}

const TIMER_DURATION = 60 * 60; // 1 hour in seconds

export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [activeImg, setActiveImg] = useState(0);
  const [openSections, setOpenSections] = useState(['details']);
  const [wishlisted, setWishlisted] = useState(false);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [countdown, setCountdown] = useState(TIMER_DURATION);
  const timerRef = useRef(null);

  const toggleSection = (s) =>
    setOpenSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  // Initialize countdown from cookie
  useEffect(() => {
    const cookieKey = `discount_timer_${id}`;
    const saved = getCookie(cookieKey);
    let startTime;

    if (saved) {
      startTime = parseInt(saved, 10);
    } else {
      startTime = Math.floor(Date.now() / 1000);
      setCookie(cookieKey, String(startTime), TIMER_DURATION);
    }

    const tick = () => {
      const elapsed = Math.floor(Date.now() / 1000) - startTime;
      const remaining = TIMER_DURATION - elapsed;
      if (remaining <= 0) {
        // Reset timer
        startTime = Math.floor(Date.now() / 1000);
        setCookie(cookieKey, String(startTime), TIMER_DURATION);
        setCountdown(TIMER_DURATION);
      } else {
        setCountdown(remaining);
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [id]);

  useEffect(() => {
    const run = async () => {
      const cid = await storage.getCartClientId();
      if (!cid) return;
      const p = await storage.getProduct(cid, id);
      if (p) {
        setProduct(p);
        await storage.updateProduct(cid, id, { views: p.views + 1 });
        const defaults = {};
        p.variants.forEach(v => { if (v.options.length > 0) defaults[v.type] = v.options[0]; });
        setSelectedVariants(defaults);

        // Fetch all products for related sort
        const allProds = await storage.getProducts(cid);
        const active = allProds.filter(x => x.status === 'active' && x.id !== p.id);

        // Sort: same category first, then by views desc, then in-stock first
        active.sort((a, b) => {
          const aCat = a.category === p.category ? 0 : 1;
          const bCat = b.category === p.category ? 0 : 1;
          if (aCat !== bCat) return aCat - bCat;
          const viewDiff = (b.views || 0) - (a.views || 0);
          if (viewDiff !== 0) return viewDiff;
          const aStock = (a.inventory || 0) > 0 ? 1 : 0;
          const bStock = (b.inventory || 0) > 0 ? 1 : 0;
          return bStock - aStock;
        });

        setRelated(active.slice(0, 6));

        // Fetch reviews for this product
        const allReviews = await storage.getReviews(cid);
        setReviews(allReviews.filter(r => r.productId === id));
      }
    };
    run();
  }, [id]);

  if (!product) return (
    <div className="min-h-screen bg-sf-bg-primary flex items-center justify-center font-sf-sans text-sf-primary-light text-lg">Loading product…</div>
  );

  // Always show 20% fake discount: display basePrice as the actual price, inflate by 25% for strikethrough
  const actualPrice = product.basePrice;
  const fakeOriginal = Math.round(product.basePrice * 1.25);
  const images = product.images.length > 0 ? product.images : [];
  const hasImages = images.length > 0;

  // Format countdown as H:MM:SS
  const hrs = Math.floor(countdown / 3600);
  const mins = Math.floor((countdown % 3600) / 60);
  const secs = countdown % 60;
  const countdownStr = hrs > 0
    ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    : `${mins}:${secs.toString().padStart(2, '0')}`;

  const handleAdd = async () => {
    addItem({ productId: product.id, productName: product.name, image: product.images[0], price: actualPrice, quantity, variant: selectedVariants });
    const cid = await storage.getCartClientId();
    if (cid) await storage.updateProduct(cid, product.id, { addToCartCount: product.addToCartCount + 1 });
    setAdded(true);
    // Redirect to cart after animation
    setTimeout(() => {
      router.push('/cart');
    }, 1500);
  };

  const navImg = (dir) => { if (hasImages) setActiveImg(p => (p + dir + images.length) % images.length); };

  return (
    <div className="min-h-screen bg-sf-bg-primary font-sf-sans text-sf-primary antialiased">
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
            <ReviewsSection reviews={reviews} />
          </div>

          {/* RIGHT: Sidebar */}
          <aside className="space-y-8">
            <div className="space-y-5">
              {/* Countdown Timer */}
              <p className="text-[13px] font-bold text-sf-accent-red flex items-center gap-2 bg-sf-accent-red/5 p-3 rounded-sm">
                <Clock className="w-4 h-4" />Discount ends in <span className="font-mono text-[15px] ml-1">{countdownStr}</span>
              </p>

              {/* Price — always 20% fake discount */}
              <div className="flex items-baseline gap-4">
                <span className="text-[34px] font-bold tracking-tight">{formatCurrency(actualPrice)}</span>
                <span className="text-xl text-sf-primary-light line-through decoration-sf-primary opacity-60">{formatCurrency(fakeOriginal)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-sf-accent-green/10 text-sf-accent-green px-2.5 py-1 rounded-sm font-bold">20% off</span>
                <span className="text-sf-accent-green font-bold">• Limited time sale</span>
              </div>
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

              {/* Add to Cart Button with celebration animation */}
              <button onClick={handleAdd} disabled={product.inventory === 0 || added}
                className={`relative w-full h-14 rounded-full font-bold text-[16px] transition-all shadow-md mt-4 ${
                  added ? 'bg-sf-accent-green text-white scale-[1.05] shadow-lg shadow-green-200'
                  : product.inventory === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-sf-primary text-white hover:scale-[1.01] active:scale-[0.98]'
                }`}
                style={added ? { animation: 'cart-celebrate 0.6s ease-out' } : {}}
              >
                {added ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-white/30 rounded-full" style={{ animation: 'cart-check-pop 0.4s ease-out' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </span>
                    <span className="text-lg">Added to Cart!</span>
                  </span>
                ) : (
                  product.inventory === 0 ? 'Out of Stock' : `Add to cart — ${formatCurrency(actualPrice * quantity)}`
                )}
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
                const rPrice = p.basePrice;
                const rFake = Math.round(p.basePrice * 1.25);
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
                      <span className="text-[13px] text-sf-primary-light line-through decoration-sf-primary opacity-40">{formatCurrency(rFake)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Cart celebration animation keyframes */}
      <style jsx global>{`
        @keyframes cart-celebrate {
          0% { transform: scale(1); }
          30% { transform: scale(1.08); }
          60% { transform: scale(0.97); }
          100% { transform: scale(1.05); }
        }
        @keyframes cart-check-pop {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          60% { transform: scale(1.3) rotate(0deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
