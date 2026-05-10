'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/lib/types';
import './storefront-home.css';

const INTEREST_CARDS = [
  { id: 'goblincore', name: 'Goblincore', sub: 'Forest-themed finds', modifier: 'interest-card--goblincore' },
  { id: 'sayyes', name: 'Say Yes!', sub: 'In just their style', modifier: 'interest-card--sayyes', selected: true },
  { id: 'cherry', name: 'Cherry Picked', sub: 'Adorable fruit finds', modifier: 'interest-card--cherry' },
  { id: 'inky', name: 'Inky Blue Hues', sub: 'All twilight tones', modifier: 'interest-card--inky' },
];

const SPRING_CARDS = [
  { label: 'Y2K Revival', bg: '#b8bdb8' },
  { label: 'Outdoor Entertaining', bg: '#c4c8c0' },
  { label: 'Special Wedding Gifts', bg: '#cbc8c2' },
  { label: 'May Birthstone Finds', bg: '#bfc4be' },
  { label: 'Learn a New Skill', bg: '#c2c5bf' },
];

const EID_CARDS = [
  { label: "Kids' Tasbih", bg: '#7a8a7a' },
  { label: 'Handmade Pottery', bg: '#8a9a8a' },
  { label: 'Arabic Name Necklaces', bg: '#9aaa9a' },
];

const PRODUCT_CARD_COLORS = ['#521c11', '#6d8797', '#1b7f6d', '#aaadad', '#d6d0c9', '#e4d4c3'];

export default function StorefrontHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeName, setStoreName] = useState('Store');
  const { addItem } = useCart();
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    const _run = async () => {
      const cid = await storage.getCartClientId();
      if (!cid) return;
      const client = await storage.getClient(cid);
      if (client?.storefrontSettings) {
        setStoreName(client.storefrontSettings.storeName);
      }
      const allProds = await storage.getProducts(cid);
      setProducts(allProds.filter(p => p.status === 'active').slice(0, 12));
    };
    _run();
  }, []);

  const handleAdd = (p: Product) => {
    addItem({ productId: p.id, productName: p.name, image: p.images[0], price: p.salePrice || p.basePrice, quantity: 1 });
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1500);
  };

  const displayProducts = products.slice(0, 6);

  return (
    <div className="etsy-home">

      {/* ===== HERO SECTION ===== */}
      <section className="hero" aria-label="Featured promotions">
        <div className="hero__inner">
          <div className="hero__grid">

            {/* Left: Quick creative gifts for Mom */}
            <article className="hero__left">
              <div className="hero__left-content">
                <h1 className="hero__heading">Quick, creative gifts for Mom</h1>
                <Link href="/products" className="hero__cta">Shop for downloads</Link>
              </div>
              <div className="hero__left-img">
                <img
                  src="https://www.figma.com/api/mcp/asset/fcd17ee8-328f-4f09-bcc2-e9a38d7e6b4c"
                  alt="Printable Mom questionnaire gift idea"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </article>

            {/* Right: Rising sellers */}
            <article className="hero__right">
              <div className="hero__right-content">
                <h2 className="hero__right-title">Rising sellers you&apos;ll want to get to know</h2>
                <Link href="/products" className="hero__right-link">Shop now</Link>
              </div>
            </article>

          </div>
        </div>
      </section>

      {/* ===== FEATURED INTERESTS ===== */}
      <section className="featured-interests" aria-labelledby="featured-heading">
        <div className="featured-interests__inner">
          <h2 className="section-heading" id="featured-heading">Jump into featured interests</h2>
          <ul className="interests-grid">
            {INTEREST_CARDS.map(card => (
              <li key={card.id}>
                <Link
                  href="/products"
                  className={`interest-card ${card.modifier}${card.selected ? ' interest-card--selected' : ''}`}
                  aria-label={`${card.name} - ${card.sub}`}
                >
                  <div className="interest-card__image" />
                  <div className="interest-card__footer">
                    <div className="interest-card__name">{card.name}</div>
                    <div className="interest-card__sub">{card.sub}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== SPRING 2026 SECTION ===== */}
      <section className="spring-section" aria-labelledby="spring-heading">
        <div className="spring-section__inner">
          <h2 className="section-heading" id="spring-heading">Discover our best of spring 2026</h2>
          <ul className="spring-grid">
            {SPRING_CARDS.map(card => (
              <li key={card.label}>
                <Link href="/products" className="spring-card" aria-label={card.label}>
                  <div className="spring-card__image" style={{ background: card.bg }} />
                  <div className="spring-card__label">{card.label}</div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== EID GIFTS SECTION ===== */}
      <section className="eid-section" aria-labelledby="eid-heading">
        <div className="eid-section__inner">
          <div className="eid-section__left">
            <h2 className="eid-section__title" id="eid-heading">Etsy-special gifts for Eid</h2>
            <Link href="/products" className="eid-section__btn">Get inspired</Link>
          </div>
          <div className="eid-section__right">
            <ul className="eid-cards-grid">
              {EID_CARDS.map(card => (
                <li key={card.label}>
                  <Link href="/products" className="eid-card" aria-label={card.label}>
                    <div className="eid-card__bg" style={{ background: card.bg }} />
                    <div className="eid-card__label">{card.label}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== PRODUCT CARDS ===== */}
      <section className="products-section" aria-label="Featured products">
        <div className="products-section__inner">
          <ul className="products-grid">
            {displayProducts.length > 0
              ? displayProducts.map((p, i) => {
                  const bgColor = PRODUCT_CARD_COLORS[i % PRODUCT_CARD_COLORS.length];
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/products/${p.id}`}
                        className={`product-card product-card--${i + 1}`}
                        aria-label={`${p.name} – ${formatCurrency(p.salePrice || p.basePrice)}`}
                      >
                        <div className="product-card__bg" style={{ background: bgColor }} />
                        <div className="product-card__img-placeholder" />
                        <div className="product-card__price">
                          {formatCurrency(p.salePrice || p.basePrice)}
                          {p.salePrice && (
                            <span className="product-card__price-original">
                              {formatCurrency(p.basePrice)}
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })
              : /* Static placeholder cards when no products loaded */
                [
                  { price: 'USD 280.00' },
                  { price: 'USD 20.31' },
                  { price: 'USD 11.39' },
                  { price: 'USD 50.70' },
                  { price: 'USD 40.00', original: 'USD 50.00' },
                  { price: 'USD 7.47', original: 'USD 9.96' },
                ].map((item, i) => (
                  <li key={i}>
                    <Link
                      href="/products"
                      className={`product-card product-card--${i + 1}`}
                      aria-label={item.price}
                    >
                      <div className="product-card__bg" />
                      <div className="product-card__img-placeholder" />
                      <div className="product-card__price">
                        {item.price}
                        {item.original && (
                          <span className="product-card__price-original">{item.original}</span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))
            }
          </ul>
        </div>
      </section>

    </div>
  );
}
