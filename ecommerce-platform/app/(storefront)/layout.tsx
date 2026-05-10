'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useTracking } from '@/hooks/useTracking';
import { useSessionRecorder } from '@/hooks/useSessionRecorder';
import ToastContainer from '@/components/shared/Toast';
import CustomerAuthModal from '@/components/storefront/CustomerAuthModal';
import Chatbot from '@/components/storefront/Chatbot';
import './storefront-layout.css';

const SECONDARY_NAV = [
  { href: '/products', label: 'Home Favorites' },
  { href: '/products', label: 'Fashion Finds' },
  { href: '/products', label: 'Best Sellers' },
  { href: '/products', label: 'Gift Ideas' },
  { href: '/products', label: 'New Arrivals' },
];

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { toasts, removeToast } = useToast();
  const { customer, loginWithGoogle, logout, showLoginModal, setShowLoginModal } = useCustomerAuth();
  const [storeName, setStoreName] = useState('Store');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useTracking();
  useSessionRecorder();

  useEffect(() => {
    const init = async () => {
      const cid = await storage.getCartClientId();
      if (!cid) return;
      const client = await storage.getClient(cid);
      if (client?.storefrontSettings) {
        setStoreName(client.storefrontSettings.storeName);
      }
    };
    init().catch(console.error);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { setMobileMenu(false); }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="sf-layout">

      {/* ===== HEADER ===== */}
      <header className="sf-header" role="banner">
        <div className="sf-header__inner">

          {/* Hamburger (mobile) */}
          <button
            className={`sf-header__hamburger${mobileMenu ? ' sf-header__hamburger--open' : ''}`}
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-expanded={mobileMenu}
            aria-label="Toggle navigation menu"
          >
            <span /><span /><span />
          </button>

          {/* Logo */}
          <Link href="/" className="sf-header__logo" aria-label="Homepage">
            {storeName}
          </Link>

          {/* Categories */}
          <Link href="/products" className="sf-header__categories" aria-label="Browse categories">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            <span>Categories</span>
          </Link>

          {/* Search bar */}
          <form className="sf-header__search" role="search" onSubmit={handleSearch}>
            <label htmlFor="sf-search" className="sr-only" style={{position:'absolute',width:'1px',height:'1px',overflow:'hidden',clip:'rect(0,0,0,0)'}}>
              Search for anything
            </label>
            <input
              className="sf-header__search-input"
              id="sf-search"
              type="search"
              placeholder="Search for anything"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search for anything"
            />
            <button className="sf-header__search-btn" type="submit" aria-label="Submit search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
          </form>

          {/* Actions */}
          <nav className="sf-header__actions" aria-label="User actions">

            {/* Sign in / Profile */}
            {customer ? (
              <div className="sf-header__profile" ref={dropdownRef}>
                <button
                  className="sf-header__profile-btn"
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  aria-label="Account menu"
                >
                  {customer.photo ? (
                    <img src={customer.photo} alt="" className="sf-header__profile-avatar" />
                  ) : (
                    <span className="sf-header__profile-initial">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>

                {profileDropdown && (
                  <div className="sf-header__dropdown">
                    <div className="sf-header__dropdown-header">
                      <div className="sf-header__dropdown-name">{customer.name}</div>
                      <div className="sf-header__dropdown-email">{customer.email}</div>
                    </div>
                    <Link href="/account" onClick={() => setProfileDropdown(false)} className="sf-header__dropdown-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      My Account
                    </Link>
                    <Link href="/account/orders" onClick={() => setProfileDropdown(false)} className="sf-header__dropdown-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
                      My Orders
                    </Link>
                    <div className="sf-header__dropdown-divider" />
                    <button onClick={() => { logout(); setProfileDropdown(false); }} className="sf-header__dropdown-item sf-header__dropdown-item--danger">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="sf-header__sign-in" onClick={() => setShowLoginModal(true)}>
                Sign in
              </button>
            )}

            {/* Favorites */}
            <Link href="/products" className="sf-header__icon" aria-label="Favorites">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="sf-header__icon sf-header__icon--cart" aria-label="Cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {itemCount > 0 && <span className="sf-header__cart-badge">{itemCount}</span>}
            </Link>

          </nav>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <nav className={`sf-mobile-nav${mobileMenu ? ' sf-mobile-nav--open' : ''}`} aria-label="Main navigation">
        <ul className="sf-mobile-nav__list">
          <li className="sf-mobile-nav__item"><Link href="/">Home</Link></li>
          <li className="sf-mobile-nav__item"><Link href="/products">All Products</Link></li>
          {SECONDARY_NAV.map(item => (
            <li key={item.label} className="sf-mobile-nav__item">
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
          {customer ? (
            <>
              <li className="sf-mobile-nav__item"><Link href="/account">My Account</Link></li>
              <li className="sf-mobile-nav__item"><Link href="/account/orders">My Orders</Link></li>
              <li className="sf-mobile-nav__item">
                <a href="#" onClick={e => { e.preventDefault(); logout(); }} style={{ color: '#c7102f' }}>Sign Out</a>
              </li>
            </>
          ) : (
            <li className="sf-mobile-nav__item">
              <a href="#" onClick={e => { e.preventDefault(); setMobileMenu(false); setShowLoginModal(true); }}>Sign In</a>
            </li>
          )}
        </ul>
      </nav>

      {/* ===== SECONDARY NAV ===== */}
      <nav className="sf-secondary-nav" aria-label="Category navigation">
        <div className="sf-secondary-nav__inner">
          <Link href="/products" className="sf-secondary-nav__item sf-secondary-nav__item--icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
            All Products
          </Link>
          {SECONDARY_NAV.map(item => (
            <Link key={item.label} href={item.href} className="sf-secondary-nav__item">
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="sf-main">{children}</main>

      {/* ===== FOOTER ===== */}
      <footer className="sf-footer" role="contentinfo">

        {/* Newsletter */}
        <div className="sf-newsletter">
          <p className="sf-newsletter__text">
            Yes! Send me exclusive offers, unique gift ideas, and personalized tips for shopping and selling on Etsy.
          </p>
          <form className="sf-newsletter__form" action="#" method="post" aria-label="Email subscription" onSubmit={e => e.preventDefault()}>
            <label htmlFor="sf-newsletter-email" style={{position:'absolute',width:'1px',height:'1px',overflow:'hidden',clip:'rect(0,0,0,0)'}}>
              Enter your email
            </label>
            <input className="sf-newsletter__input" id="sf-newsletter-email" type="email" placeholder="Enter your email" autoComplete="email" />
            <button className="sf-newsletter__btn" type="submit">Subscribe</button>
          </form>
        </div>

        {/* Renewable energy banner */}
        <div className="sf-renewable">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
          <span className="sf-renewable__text">Etsy is powered by 100% renewable electricity.</span>
        </div>

        {/* Footer columns */}
        <div className="sf-footer-content">
          <aside className="sf-footer-app" aria-label="Download app">
            <div className="sf-footer-app__icon">🛍️</div>
            <Link href="#" className="sf-footer-app__btn">Download the Etsy App</Link>
          </aside>

          <nav className="sf-footer-nav" aria-label="Footer navigation">
            <div>
              <h3 className="sf-footer-col__heading">Shop</h3>
              <ul className="sf-footer-col__list">
                <li className="sf-footer-col__item"><Link href="#">Gift cards</Link></li>
                <li className="sf-footer-col__item"><Link href="#">Etsy Registry</Link></li>
                <li className="sf-footer-col__item"><Link href="#">Sitemap</Link></li>
                <li className="sf-footer-col__item"><Link href="#">Etsy blog</Link></li>
                <li className="sf-footer-col__item"><Link href="#">Etsy United Kingdom</Link></li>
                <li className="sf-footer-col__item"><Link href="#">Etsy Germany</Link></li>
                <li className="sf-footer-col__item"><Link href="#">Etsy Canada</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="sf-footer-col__heading">Sell</h3>
              <ul className="sf-footer-col__list">
                <li className="sf-footer-col__item"><Link href="#">Sell on Etsy</Link></li>
                <li className="sf-footer-col__item"><Link href="#">Teams</Link></li>
                <li className="sf-footer-col__item"><Link href="#">Forums</Link></li>
                <li className="sf-footer-col__item"><Link href="#">Affiliates &amp; Creators</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="sf-footer-col__heading">About</h3>
              <ul className="sf-footer-col__list">
                <li className="sf-footer-col__item"><Link href="#">Etsy, Inc.</Link></li>
                <li className="sf-footer-col__item"><Link href="#">Policies</Link></li>
                <li className="sf-footer-col__item"><Link href="#">Investors</Link></li>
                <li className="sf-footer-col__item"><Link href="#">Careers</Link></li>
                <li className="sf-footer-col__item"><Link href="#">Press</Link></li>
                <li className="sf-footer-col__item"><Link href="#">Impact</Link></li>
                <li className="sf-footer-col__item"><Link href="#">Legal imprint</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="sf-footer-col__heading">Help</h3>
              <ul className="sf-footer-col__list">
                <li className="sf-footer-col__item"><Link href="#">Help Center</Link></li>
                <li className="sf-footer-col__item"><Link href="#">Privacy settings</Link></li>
              </ul>
              <div className="sf-footer-social" aria-label="Social media links">
                <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg></a>
                <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
                <a href="#" aria-label="Pinterest"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0a12 12 0 0 0-4.37 23.17c-.07-.94-.13-2.4.03-3.44l1.14-4.86s-.29-.58-.29-1.44c0-1.35.78-2.36 1.76-2.36.83 0 1.23.62 1.23 1.37 0 .84-.53 2.09-.81 3.25-.23.97.49 1.76 1.45 1.76 1.74 0 3.07-1.83 3.07-4.48 0-2.34-1.68-3.98-4.08-3.98-2.78 0-4.41 2.08-4.41 4.24 0 .84.32 1.74.73 2.23.08.1.09.18.07.28l-.27 1.11c-.04.18-.15.22-.34.13-1.26-.59-2.05-2.42-2.05-3.9 0-3.17 2.3-6.08 6.65-6.08 3.49 0 6.2 2.49 6.2 5.81 0 3.47-2.19 6.26-5.22 6.26-1.02 0-1.98-.53-2.31-1.16l-.63 2.4c-.23.88-.84 1.98-1.26 2.65A12 12 0 1 0 12 0z"/></svg></a>
                <a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.75 31.75 0 0 0 0 12a31.75 31.75 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.75 31.75 0 0 0 24 12a31.75 31.75 0 0 0-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg></a>
              </div>
            </div>
          </nav>
        </div>

        {/* Footer bottom bar */}
        <div className="sf-footer-bottom">
          <div className="sf-footer-bottom__inner">
            <div className="sf-footer-bottom__region">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              Bangladesh &nbsp;|&nbsp; English (US) &nbsp;|&nbsp; $ (USD)
            </div>
            <span className="sf-footer-bottom__copyright">© 2026 Etsy, Inc.</span>
            <nav className="sf-footer-bottom__links" aria-label="Legal links">
              <a href="#" className="sf-footer-bottom__link">Terms of Use</a>
              <a href="#" className="sf-footer-bottom__link">Privacy</a>
              <a href="#" className="sf-footer-bottom__link">Interest-based ads</a>
              <a href="#" className="sf-footer-bottom__link">Local Shops</a>
              <a href="#" className="sf-footer-bottom__link">Regions</a>
            </nav>
          </div>
        </div>

      </footer>

      {/* Modals & Overlays */}
      <CustomerAuthModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onGoogleLogin={loginWithGoogle}
      />
      <Chatbot />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
