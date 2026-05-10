import { useState } from 'react';
import { 
  ChevronLeft, 
  Heart, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Clock, 
  Truck, 
  ShieldCheck, 
  Leaf, 
  Flag, 
  ArrowRight,
  MessageSquare,
  Play,
  HelpCircle,
  Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeThumbnail, setActiveThumbnail] = useState(0);
  const [openSections, setOpenSections] = useState<string[]>(['details']);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  const thumbnails = [
    "https://www.figma.com/api/mcp/asset/0df73dca-fccd-409e-8abf-70334c8766cb",
    "video",
    "https://placehold.co/600x600/9d9d9d/white?text=Img+2",
    "https://placehold.co/600x600/cec9c9/312b36?text=Img+3",
    "https://placehold.co/600x600/cccccc/312b36?text=Img+4",
    "https://placehold.co/600x600/eeeeee/312b36?text=Img+5",
    "https://placehold.co/600x600/dddddd/312b36?text=Img+6",
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="py-4 md:py-6">
          <a href="#" className="flex items-center gap-1 text-primary-light hover:text-primary font-bold text-[13.1px] tracking-tight transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to search results
          </a>
        </header>

        {/* Main Product Section */}
        <main className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-8 md:gap-12 mt-4 md:mt-8 pb-20">
          
          {/* Left Column: Gallery + Reviews */}
          <div className="space-y-12">
            {/* Gallery Section */}
            <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
              {/* Thumbnails */}
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
                {thumbnails.map((thumb, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveThumbnail(idx)}
                    className={`relative w-15 h-15 rounded-sm overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-all ${
                      activeThumbnail === idx ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-80'
                    }`}
                  >
                    {thumb === 'video' ? (
                      <div className="w-full h-full bg-bg-secondary flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary fill-primary" />
                      </div>
                    ) : (
                      <img src={thumb} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="relative flex-1 aspect-square bg-black/5 rounded-sm overflow-hidden group">
                <div className="absolute top-4 left-4 z-10 bg-accent-yellow px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                  <span className="text-[13px] font-bold text-primary">Bestseller</span>
                </div>
                
                <button className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6 text-primary transition-colors hover:fill-accent-red hover:text-accent-red" />
                </button>

                <div className="w-full h-full flex items-center justify-center">
                  {thumbnails[activeThumbnail] === 'video' ? (
                    <div className="w-full h-full bg-bg-secondary flex items-center justify-center relative">
                       <Play className="w-20 h-20 text-primary opacity-20" />
                       <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                          <button className="bg-white/90 hover:bg-white px-8 py-4 rounded-full text-[15px] font-bold shadow-xl flex items-center gap-2 transition-all">
                             <Play className="w-5 h-5 fill-primary" /> Watch Video
                          </button>
                       </div>
                    </div>
                  ) : (
                    <img src={thumbnails[activeThumbnail]} alt="Main product" className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md hover:bg-gray-50 active:scale-95 transition-all">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md hover:bg-gray-50 active:scale-95 transition-all">
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Reviews Section */}
            <section className="hidden lg:block pt-12 border-t border-border-light">
              <h2 className="text-2xl font-serif tracking-tight mb-4 text-primary">Reviews for this item</h2>
              
              <div className="bg-bg-primary py-4 mb-8">
                <p className="text-[14px] text-primary leading-relaxed">
                  <span className="font-bold">Buyer highlights, summarised by AI:</span>{' '}
                  Beautiful · Very pretty · Looks great · Great quality · Fast delivery · As described · Excellent communication
                </p>
              </div>

              <div className="flex items-center gap-12 mb-8">
                <div className="flex items-baseline gap-4">
                  <div className="text-[48px] font-serif tracking-tight">4.7</div>
                  <div className="space-y-1">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4.5 h-4.5 text-primary fill-primary`} />
                      ))}
                    </div>
                    <div className="text-[14px] underline cursor-pointer hover:opacity-70 transition-opacity">Item average</div>
                    <div className="text-[13px] text-primary-lighter">(21 reviews)</div>
                  </div>
                </div>

                <div className="flex gap-8 lg:gap-12 flex-wrap">
                  {[
                    { label: 'Item quality', val: '4.7' },
                    { label: 'Delivery', val: '4.8' },
                    { label: 'Customer service', val: '5.0' },
                    { label: 'Buyers recommend', val: '100%' },
                  ].map((metric, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                       <span className="text-[12px] text-center leading-tight text-primary-light" dangerouslySetInnerHTML={{ __html: metric.label.replace(' ', '<br/>') }} />
                       <span className="bg-bg-secondary px-4 py-1.5 rounded-full text-[14px] font-bold">{metric.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2.5 mb-8">
                <button className="px-5 py-2.5 bg-black/5 rounded-full text-[13.5px] font-bold shadow-sm hover:bg-black/10 transition-colors">Appearance (11)</button>
                <button className="px-5 py-2.5 bg-black/5 rounded-full text-[13.5px] font-bold hover:bg-black/10 transition-colors">Description accuracy (3)</button>
                <button className="px-5 py-2.5 bg-black/5 rounded-full text-[13.5px] font-bold hover:bg-black/10 transition-colors">Delivery & Packaging (3)</button>
                <button className="px-5 py-2.5 bg-black/5 rounded-full text-[13.5px] font-bold hover:bg-black/10 transition-colors">Quality (2)</button>
              </div>

              {/* Reviews List */}
              <div className="space-y-10 mb-12">
                {[
                  {
                    name: 'Etsy buyer',
                    date: '08 May, 2026',
                    text: 'The stained glass was beautiful and as described. The courier lost the shipment, but the seller sent another one immediately and it arrived before I needed it for a gift. Excellent customer service and communication.'
                  },
                  {
                    name: 'Michelle',
                    date: '08 May, 2026',
                    text: 'beautiful suncatcher. happy with purchase'
                  }
                ].map((review, i) => (
                  <div key={i} className="pb-8 border-b border-border-light last:border-0 hover:bg-black/[0.01] transition-colors -mx-4 px-4 rounded-lg group">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-primary fill-primary" />)}
                      </div>
                      <span className="font-bold ml-2 text-lg">5</span>
                      <span className="text-[10px] uppercase font-bold border border-border px-2 py-0.5 rounded-sm tracking-wider">This item</span>
                    </div>
                    <div className="flex items-center gap-3 text-[14px] mb-4">
                      <div className="w-5 h-5 rounded-full bg-bg-secondary flex items-center justify-center">
                         <span className="text-[10px] font-bold text-primary-light">{review.name[0]}</span>
                      </div>
                      <span className="font-bold decoration-dotted underline underline-offset-4 hover:decoration-solid cursor-pointer">{review.name}</span>
                      <span className="text-border-light font-light">|</span>
                      <span className="text-primary-light">{review.date}</span>
                    </div>
                    <p className="text-[16px] leading-relaxed text-primary max-w-2xl">{review.text}</p>
                  </div>
                ))}
              </div>
              
              <button className="px-10 py-4 border-2 border-primary rounded-full text-[14px] font-bold hover:bg-primary hover:text-white transition-all transform active:scale-[0.98]">
                View all reviews for this item
              </button>
            </section>
          </div>

          {/* Product Details Sidebar */}
          <aside className="space-y-8">
            <div className="space-y-5">
              <p className="text-[13px] font-bold text-accent-red flex items-center gap-2 bg-accent-red/5 p-3 rounded-sm">
                <Clock className="w-4 h-4" />
                In demand. 6 people bought this recently.
              </p>
              
              <div className="flex items-baseline gap-4">
                <span className="text-[34px] font-bold tracking-tight">SGD 21.66+</span>
                <span className="text-xl text-primary-light line-through decoration-primary opacity-60">SGD 43.33+</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="bg-accent-green/10 text-accent-green px-2.5 py-1 rounded-sm font-bold">50% off</span>
                <span className="text-accent-green font-bold">• Limited time sale</span>
              </div>
              
              <p className="text-[13.8px] text-primary-light border-b border-border-light pb-4">VAT included (where applicable)</p>
            </div>

            <div className="space-y-3">
              <h1 className="text-xl md:text-[22px] leading-snug font-medium">
                Abstract Rainbow Shell Spiral Suncatcher Stained Glass Coastal Beach Gift
              </h1>
              <p className="font-bold text-[15px] hover:underline cursor-pointer flex items-center gap-2">
                QuietHarborStudioArt
                <HelpCircle className="w-4 h-4 opacity-30" />
              </p>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-primary fill-primary" />)}
              </div>
            </div>

            <div className="flex items-center gap-3 text-[14px] py-1">
              <Truck className="w-5 h-5 text-primary-light" />
              <span>Returns & exchanges accepted</span>
            </div>

            {/* Customization Options */}
            <div className="space-y-5 pt-2">
              <div className="space-y-2.5">
                <label className="text-[14px] font-bold">Size</label>
                <div className="relative">
                  <select className="w-full h-12 px-4 border border-border rounded-sm appearance-none bg-transparent hover:border-primary transition-colors focus:outline-none cursor-pointer text-[15.5px]">
                    <option>Select an option</option>
                    <option>Small (10cm)</option>
                    <option>Medium (15cm)</option>
                    <option>Large (20cm)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none opacity-50" />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[14px] font-bold">Design</label>
                <div className="relative">
                  <select className="w-full h-12 px-4 border border-border rounded-sm appearance-none bg-transparent hover:border-primary transition-colors focus:outline-none cursor-pointer text-[15.5px]">
                    <option>Select an option</option>
                    <option>Swirl Pattern</option>
                    <option>Ocean Wave</option>
                    <option>Coastal Abstract</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none opacity-50" />
                </div>
              </div>

              <button className="flex items-center gap-2 text-[13.5px] font-bold py-2.5 hover:bg-black/5 px-3 -mx-3 rounded transition-colors group w-full text-left">
                <MessageSquare className="w-4.5 h-4.5 opacity-60" />
                <span className="flex-1">Add personalization <span className="font-normal text-primary-light">(optional)</span></span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <div className="space-y-2.5">
                <label className="text-[14px] font-bold">Quantity</label>
                <div className="relative">
                  <select className="w-full h-12 px-4 border border-border rounded-sm appearance-none bg-transparent hover:border-primary transition-colors focus:outline-none cursor-pointer text-[15.5px]">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n}>{n}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none opacity-50" />
                </div>
              </div>

              <button className="w-full h-14 bg-primary text-white rounded-full font-bold text-[16px] hover:scale-[1.01] active:scale-[0.98] transition-all shadow-md mt-4">
                Add to cart
              </button>
            </div>

            {/* Collapsible Sections */}
            <div className="divide-y divide-border-light border-t border-b border-border-light mt-8">
              {/* Item Details */}
              <div className="flex flex-col">
                <button 
                  onClick={() => toggleSection('details')}
                  className="w-full flex items-center justify-between py-5 hover:bg-black/[0.01] transition-colors"
                >
                  <span className="font-bold text-[15px]">Item details</span>
                  <ChevronUp className={`w-5 h-5 transition-transform duration-400 ${openSections.includes('details') ? '' : 'rotate-180'}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openSections.includes('details') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 space-y-6">
                        <div className="space-y-4">
                          <h3 className="font-bold text-[15px] opacity-80 uppercase tracking-wide text-xs">Highlights</h3>
                          <ul className="space-y-3.5 text-[15.4px]">
                            <li className="flex items-start gap-3.5">
                              <Check className="w-5 h-5 mt-0.5 text-accent-green" />
                              <span>Made by <span className="font-bold">QuietHarborStudioArt</span></span>
                            </li>
                            <li className="flex items-start gap-3.5 text-primary-light">
                              <Circle className="w-5 h-5 mt-0.5 fill-primary-light/10" />
                              <span>Materials: Hand-blown Glass</span>
                            </li>
                          </ul>
                        </div>
                        <div className="relative group">
                          <p className="text-[15.3px] leading-relaxed text-primary/80 line-clamp-4">
                            ✨ This is a flat glass suncatcher, with my original design printed on the product. Every piece of stained glass is made with patience, and a whole lot of creativity. This one-of-a-kind stained glass suncatcher isn't just a decoration, it's a way to bring warmth, color, and a touch of magic into your home every single day.
                          </p>
                          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg-primary via-bg-primary/80 to-transparent pointer-events-none" />
                          <button className="relative z-10 w-full pt-3 text-[13px] font-bold hover:underline underline-offset-4 decoration-primary/30 hover:decoration-primary">Learn more about this item</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Delivery */}
              <div className="flex flex-col">
                <button 
                  onClick={() => toggleSection('delivery')}
                  className="w-full flex items-center justify-between py-5 hover:bg-black/[0.01] transition-colors"
                >
                  <span className="font-bold text-[15px]">Delivery and return policies</span>
                  <ChevronUp className={`w-5 h-5 transition-transform duration-400 ${openSections.includes('delivery') ? '' : 'rotate-180'}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openSections.includes('delivery') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 space-y-6">
                        <ul className="space-y-4">
                          <li className="flex gap-4 text-[15.6px] items-start">
                            <Clock className="w-5 h-5 mt-1 text-primary-light" />
                            <div className="flex flex-col">
                               <span className="font-medium">Estimated arrival</span>
                               <span className="text-[14px] text-primary-light">26-27 May</span>
                            </div>
                          </li>
                          <li className="flex gap-4 text-[15.6px] items-start">
                            <Check className="w-5 h-5 mt-1 text-accent-green" />
                            <div className="flex flex-col">
                               <span className="font-medium">Returns & exchanges accepted</span>
                               <span className="text-[14px] text-primary-light">Within 30 days of delivery</span>
                            </div>
                          </li>
                          <li className="flex gap-4 text-[15.6px] items-start">
                            <Truck className="w-5 h-5 mt-1 text-primary-light" />
                            <div className="flex flex-col">
                               <span className="font-medium">Cost to deliver</span>
                               <span className="text-[14px] text-primary-light">SGD 2.89 (Standard Shipping)</span>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Protection */}
              <div className="flex flex-col">
                <button 
                  onClick={() => toggleSection('protection')}
                  className="w-full flex items-center justify-between py-5 hover:bg-black/[0.01] transition-colors"
                >
                  <span className="font-bold text-[15px]">Did you know?</span>
                  <ChevronUp className={`w-5 h-5 transition-transform duration-400 ${openSections.includes('protection') ? '' : 'rotate-180'}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openSections.includes('protection') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 space-y-6">
                        <div className="space-y-3">
                          <ShieldCheck className="w-12 h-12 text-primary opacity-80" />
                          <h4 className="font-bold text-[15px]">Etsy Purchase Protection</h4>
                          <p className="text-[14px] leading-relaxed text-primary-light">
                            Shop confidently on Etsy knowing if something goes wrong with an order, we've got your back — <a href="#" className="underline font-medium text-primary">see program terms</a>
                          </p>
                        </div>
                        <div className="bg-bg-blue/30 p-5 rounded-lg flex gap-4 border border-blue-200/50">
                          <Leaf className="w-6 h-6 text-primary flex-shrink-0 opacity-80" />
                          <p className="text-[13.7px] leading-normal font-medium">
                            Etsy invests in climate solutions like electric trucks and carbon offsets for every delivery. <a href="#" className="underline decoration-dotted hover:decoration-solid">See how</a>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button className="flex items-center gap-2 text-[13.5px] font-bold underline underline-offset-4 py-2 hover:text-accent-red transition-colors">
              <Flag className="w-4 h-4" />
              Report this item to Etsy
            </button>
          </aside>
        </main>

        {/* Similar Products Section */}
        <section className="pt-20 pb-32 border-t border-border-light mt-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
             <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">
                <h2 className="text-3xl md:text-4xl font-serif tracking-tight text-primary">You may also like</h2>
                <div className="flex items-center gap-2 bg-black/5 px-2 py-1 rounded">
                  <span className="text-[12px] font-bold text-primary-light uppercase tracking-wider">Including ads</span>
                  <HelpCircle className="w-3.5 h-3.5 opacity-30" />
                </div>
             </div>
             <button className="px-8 py-3.5 border-2 border-primary rounded-full text-sm font-bold hover:bg-primary hover:text-white transition-all transform active:scale-95">
                See more
             </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 md:gap-4">
            {[
              { color: 'bg-[#323b2a]', price: 'SGD 22.18', original: 'SGD 46.22', title: 'Ocean Wave Stained Glass Suncatcher, Beach Coastal Glass' },
              { color: 'bg-[#c5c2ae]', price: 'SGD 23.11', original: 'SGD 38.51', title: 'Rainbow Spiral Suncatcher, Mosaic Window Hanging' },
              { color: 'bg-[#dcceb7]', price: 'SGD 23.47', original: 'SGD 39.10', title: 'Scorpio Zodiac Suncatcher, Stained Glass Celestial' },
              { color: 'bg-[#433738]', price: 'SGD 33.26', original: 'SGD 60.47', title: 'Rainbow Spiral Suncatcher, Chakra Energy Decor' },
              { color: 'bg-[#abadad]', price: 'SGD 35.45', original: 'SGD 47.26', title: 'Large Suncatcher Ornament | Light Catcher Charm' },
              { color: 'bg-[#413630]', price: 'SGD 4.94', original: 'SGD 8.23', title: 'Digital Download Stained Glass Infinite loop Pattern', badge: 'Digital download' }
            ].map((prod, i) => (
              <div key={i} className="group relative cursor-pointer block">
                <div className={`aspect-square rounded-xl mb-3 overflow-hidden shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1 ${prod.color}`}>
                  {prod.badge && (
                    <div className="absolute top-2.5 left-2.5 z-10 bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                       <Check className="w-3.5 h-3.5 text-accent-green" /> {prod.badge}
                    </div>
                  )}
                  <button className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 active:scale-90">
                    <Heart className="w-5 h-5 text-primary" />
                  </button>
                </div>
                <h3 className="text-[14px] line-clamp-2 leading-relaxed mb-1.5 text-primary/90 font-medium group-hover:text-primary transition-colors">{prod.title}</h3>
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-[#406221] text-[16px]">{prod.price}</span>
                  {prod.original && <span className="text-[13px] text-primary-light line-through decoration-primary opacity-40">{prod.original}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Mobile Reviews Overlay / Expandable */}
      <section className="lg:hidden px-4 sm:px-6 py-16 bg-white border-t border-border-light shadow-inner">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-serif mb-8 text-center italic">Buyer reviews</h2>
            <div className="flex flex-col items-center text-center">
              <div className="text-6xl font-serif mb-2">4.7</div>
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-primary text-primary" />)}
              </div>
              <p className="text-[15px] text-primary-light mb-10 max-w-[280px]">
                Highly recommended by shoppers for quality and fast delivery.
              </p>
              <button className="w-full py-4 bg-primary text-white rounded-full font-bold shadow-lg hover:bg-black active:scale-95 transition-all">
                Read all reviews
              </button>
            </div>
          </div>
      </section>
    </div>
  );
}
