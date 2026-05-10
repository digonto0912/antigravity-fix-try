'use client';
import { Check, Clock, Truck, ShieldCheck, Leaf, ChevronUp, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccordionProps {
  openSections: string[];
  toggleSection: (s: string) => void;
  description: string;
  category: string;
  sku: string;
}

export function AccordionSections({ openSections, toggleSection, description, category, sku }: AccordionProps) {
  return (
    <div className="divide-y divide-sf-border-light border-t border-b border-sf-border-light mt-8">
      {/* Item Details */}
      <div className="flex flex-col">
        <button onClick={() => toggleSection('details')} className="w-full flex items-center justify-between py-5 hover:bg-black/[0.01] transition-colors">
          <span className="font-bold text-[15px]">Item details</span>
          <ChevronUp className={`w-5 h-5 transition-transform duration-300 ${openSections.includes('details') ? '' : 'rotate-180'}`} />
        </button>
        <AnimatePresence initial={false}>
          {openSections.includes('details') && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="pb-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-[15px] opacity-80 uppercase tracking-wide text-xs">Highlights</h3>
                  <ul className="space-y-3.5 text-[15.4px]">
                    <li className="flex items-start gap-3.5">
                      <Check className="w-5 h-5 mt-0.5 text-sf-accent-green" />
                      <span>Category: <span className="font-bold">{category}</span></span>
                    </li>
                    <li className="flex items-start gap-3.5 text-sf-primary-light">
                      <Circle className="w-5 h-5 mt-0.5 fill-sf-primary-light/10" />
                      <span>SKU: {sku}</span>
                    </li>
                  </ul>
                </div>
                <div className="relative group">
                  <p className="text-[15.3px] leading-relaxed text-sf-primary/80 line-clamp-4">{description}</p>
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-sf-bg-primary via-sf-bg-primary/80 to-transparent pointer-events-none" />
                  <button className="relative z-10 w-full pt-3 text-[13px] font-bold hover:underline underline-offset-4 decoration-sf-primary/30 hover:decoration-sf-primary">Learn more about this item</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delivery */}
      <div className="flex flex-col">
        <button onClick={() => toggleSection('delivery')} className="w-full flex items-center justify-between py-5 hover:bg-black/[0.01] transition-colors">
          <span className="font-bold text-[15px]">Delivery and return policies</span>
          <ChevronUp className={`w-5 h-5 transition-transform duration-300 ${openSections.includes('delivery') ? '' : 'rotate-180'}`} />
        </button>
        <AnimatePresence initial={false}>
          {openSections.includes('delivery') && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="pb-8 space-y-6">
                <ul className="space-y-4">
                  <li className="flex gap-4 text-[15.6px] items-start">
                    <Clock className="w-5 h-5 mt-1 text-sf-primary-light" />
                    <div className="flex flex-col"><span className="font-medium">Estimated arrival</span><span className="text-[14px] text-sf-primary-light">3-5 business days</span></div>
                  </li>
                  <li className="flex gap-4 text-[15.6px] items-start">
                    <Check className="w-5 h-5 mt-1 text-sf-accent-green" />
                    <div className="flex flex-col"><span className="font-medium">Returns &amp; exchanges accepted</span><span className="text-[14px] text-sf-primary-light">Within 7 days of delivery</span></div>
                  </li>
                  <li className="flex gap-4 text-[15.6px] items-start">
                    <Truck className="w-5 h-5 mt-1 text-sf-primary-light" />
                    <div className="flex flex-col"><span className="font-medium">Free shipping</span><span className="text-[14px] text-sf-primary-light">On orders over ৳1,000</span></div>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Did you know */}
      <div className="flex flex-col">
        <button onClick={() => toggleSection('protection')} className="w-full flex items-center justify-between py-5 hover:bg-black/[0.01] transition-colors">
          <span className="font-bold text-[15px]">Did you know?</span>
          <ChevronUp className={`w-5 h-5 transition-transform duration-300 ${openSections.includes('protection') ? '' : 'rotate-180'}`} />
        </button>
        <AnimatePresence initial={false}>
          {openSections.includes('protection') && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="pb-8 space-y-6">
                <div className="space-y-3">
                  <ShieldCheck className="w-12 h-12 text-sf-primary opacity-80" />
                  <h4 className="font-bold text-[15px]">Purchase Protection</h4>
                  <p className="text-[14px] leading-relaxed text-sf-primary-light">
                    Shop confidently knowing if something goes wrong with an order, we&apos;ve got your back — <a href="#" className="underline font-medium text-sf-primary">see program terms</a>
                  </p>
                </div>
                <div className="bg-sf-bg-blue/30 p-5 rounded-lg flex gap-4 border border-blue-200/50">
                  <Leaf className="w-6 h-6 text-sf-primary flex-shrink-0 opacity-80" />
                  <p className="text-[13.7px] leading-normal font-medium">We invest in quality packaging and carbon-neutral shipping for every delivery.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ReviewsSection() {
  const reviews = [
    { name: 'Happy buyer', date: '08 May, 2026', text: 'The product was beautiful and as described. Excellent customer service and communication. Would buy again!' },
    { name: 'Sarah', date: '05 May, 2026', text: 'Great quality, very happy with my purchase. Fast delivery too.' },
  ];

  return (
    <>
      {/* Desktop Reviews */}
      <section className="hidden lg:block pt-12 border-t border-sf-border-light">
        <h2 className="text-2xl font-sf-serif tracking-tight mb-4 text-sf-primary">Reviews for this item</h2>
        <div className="bg-sf-bg-primary py-4 mb-8">
          <p className="text-[14px] text-sf-primary leading-relaxed">
            <span className="font-bold">Buyer highlights, summarised by AI:</span>{' '}
            Beautiful · Very pretty · Looks great · Great quality · Fast delivery · As described · Excellent communication
          </p>
        </div>
        <div className="flex items-center gap-12 mb-8">
          <div className="flex items-baseline gap-4">
            <div className="text-[48px] font-sf-serif tracking-tight">4.7</div>
            <div className="space-y-1">
              <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <StarIcon key={i} />)}</div>
              <div className="text-[14px] underline cursor-pointer hover:opacity-70 transition-opacity">Item average</div>
              <div className="text-[13px] text-sf-primary-lighter">(21 reviews)</div>
            </div>
          </div>
          <div className="flex gap-8 lg:gap-12 flex-wrap">
            {[{ label: 'Item quality', val: '4.7' }, { label: 'Delivery', val: '4.8' }, { label: 'Customer service', val: '5.0' }, { label: 'Buyers recommend', val: '100%' }].map((m, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-[12px] text-center leading-tight text-sf-primary-light" dangerouslySetInnerHTML={{ __html: m.label.replace(' ', '<br/>') }} />
                <span className="bg-sf-bg-secondary px-4 py-1.5 rounded-full text-[14px] font-bold">{m.val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5 mb-8">
          {['Appearance (11)', 'Description accuracy (3)', 'Delivery & Packaging (3)', 'Quality (2)'].map((f, i) => (
            <button key={i} className="px-5 py-2.5 bg-black/5 rounded-full text-[13.5px] font-bold hover:bg-black/10 transition-colors">{f}</button>
          ))}
        </div>
        <div className="space-y-10 mb-12">
          {reviews.map((review, i) => (
            <div key={i} className="pb-8 border-b border-sf-border-light last:border-0 hover:bg-black/[0.01] transition-colors -mx-4 px-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-0.5">{[...Array(5)].map((_, j) => <StarIcon key={j} />)}</div>
                <span className="font-bold ml-2 text-lg">5</span>
                <span className="text-[10px] uppercase font-bold border border-sf-border px-2 py-0.5 rounded-sm tracking-wider">This item</span>
              </div>
              <div className="flex items-center gap-3 text-[14px] mb-4">
                <div className="w-5 h-5 rounded-full bg-sf-bg-secondary flex items-center justify-center">
                  <span className="text-[10px] font-bold text-sf-primary-light">{review.name[0]}</span>
                </div>
                <span className="font-bold decoration-dotted underline underline-offset-4 hover:decoration-solid cursor-pointer">{review.name}</span>
                <span className="text-sf-border-light font-light">|</span>
                <span className="text-sf-primary-light">{review.date}</span>
              </div>
              <p className="text-[16px] leading-relaxed text-sf-primary max-w-2xl">{review.text}</p>
            </div>
          ))}
        </div>
        <button className="px-10 py-4 border-2 border-sf-primary rounded-full text-[14px] font-bold hover:bg-sf-primary hover:text-white transition-all transform active:scale-[0.98]">
          View all reviews for this item
        </button>
      </section>

      {/* Mobile Reviews */}
      <section className="lg:hidden px-4 sm:px-6 py-16 bg-white border-t border-sf-border-light shadow-inner">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-sf-serif mb-8 text-center italic">Buyer reviews</h2>
          <div className="flex flex-col items-center text-center">
            <div className="text-6xl font-sf-serif mb-2">4.7</div>
            <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <StarIcon key={i} size={24} />)}</div>
            <p className="text-[15px] text-sf-primary-light mb-10 max-w-[280px]">Highly recommended by shoppers for quality and fast delivery.</p>
            <button className="w-full py-4 bg-sf-primary text-white rounded-full font-bold shadow-lg hover:bg-black active:scale-95 transition-all">Read all reviews</button>
          </div>
        </div>
      </section>
    </>
  );
}

function StarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sf-primary">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
