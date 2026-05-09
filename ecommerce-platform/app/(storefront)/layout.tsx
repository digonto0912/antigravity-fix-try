'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { storage } from '@/lib/storage';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useTracking } from '@/hooks/useTracking';
import { useSessionRecorder } from '@/hooks/useSessionRecorder';
import ToastContainer from '@/components/shared/Toast';
import CustomerAuthModal from '@/components/storefront/CustomerAuthModal';
import { formatCurrency } from '@/lib/utils';
import Chatbot from '@/components/storefront/Chatbot';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { itemCount, subtotal } = useCart();
  const { toasts, removeToast } = useToast();
  const { customer, loginWithGoogle, logout, showLoginModal, setShowLoginModal } = useCustomerAuth();
  const [storeName, setStoreName] = useState('Store');
  const [tagline, setTagline] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Track visitor behavior and record sessions
  useTracking();
  useSessionRecorder();

  useEffect(() => {
    const init = async () => {
      const cid = await storage.getCartClientId();
      if (!cid) return;
      const client = await storage.getClient(cid);
      if (client?.storefrontSettings) {
        setStoreName(client.storefrontSettings.storeName);
        setTagline(client.storefrontSettings.tagline);
        setPrimaryColor(client.storefrontSettings.primaryColor);
      }
    };
    init().catch(console.error);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenu(false); }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Announcement Bar */}
      <div className="bg-gray-900 text-gray-300 text-xs py-1.5 px-4 text-center">
        Free shipping on orders over ৳1,000 • {tagline}
      </div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="text-xl font-bold shrink-0 hover:opacity-80 transition-opacity" style={{ color: primaryColor }}>
            {storeName}
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  style={isActive ? { backgroundColor: primaryColor } : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {itemCount > 0 && (
                <span
                  className="absolute -top-0.5 left-6 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  {itemCount}
                </span>
              )}
              <span className="hidden sm:inline text-sm font-medium">{formatCurrency(subtotal)}</span>
            </Link>

            {/* Divider */}
            <div className="hidden md:block w-px h-6 bg-gray-200" />

            {/* User Profile / Login */}
            {customer ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {customer.photo ? (
                    <img src={customer.photo} alt="" className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:inline text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {customer.name}
                  </span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-xs text-gray-500 truncate">{customer.email}</div>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setProfileDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Account
                    </Link>

                    <Link
                      href="/account/orders"
                      onClick={() => setProfileDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      My Orders
                    </Link>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => { logout(); setProfileDropdown(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
            {navLinks.map(link => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block py-2.5 px-3 rounded-lg text-sm font-medium ${isActive ? 'text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                  style={isActive ? { backgroundColor: primaryColor } : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
            {customer ? (
              <>
                <Link href="/account" className="block py-2.5 px-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50">My Account</Link>
                <Link href="/account/orders" className="block py-2.5 px-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50">My Orders</Link>
                <button onClick={logout} className="block w-full text-left py-2.5 px-3 rounded-lg text-sm text-red-600 hover:bg-red-50">Sign Out</button>
              </>
            ) : (
              <button onClick={() => { setMobileMenu(false); setShowLoginModal(true); }} className="block w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium" style={{ color: primaryColor }}>
                Sign In
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">{storeName}</h3>
            <p className="text-sm">{tagline}</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link href="/" className="block hover:text-white transition-colors">Home</Link>
              <Link href="/products" className="block hover:text-white transition-colors">Products</Link>
              <Link href="/cart" className="block hover:text-white transition-colors">Cart</Link>
              {customer && <Link href="/account" className="block hover:text-white transition-colors">My Account</Link>}
            </div>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Contact</h4>
            <p className="text-sm">Email: support@store.com</p>
            <p className="text-sm">Phone: 01700-000000</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-xs">
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </div>
      </footer>

      {/* Customer Login Modal */}
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
