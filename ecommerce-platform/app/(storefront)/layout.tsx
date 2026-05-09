'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { storage } from '@/lib/storage';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/shared/Toast';
import { formatCurrency } from '@/lib/utils';
import Chatbot from '@/components/storefront/Chatbot';
import { seedData } from '@/lib/seed';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { itemCount, subtotal } = useCart();
  const { toasts, removeToast } = useToast();
  const [storeName, setStoreName] = useState('Store');
  const [tagline, setTagline] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    seedData();
    const cid = storage.getCartClientId();
    if (!cid) return;
    const client = storage.getClient(cid);
    if (client?.storefrontSettings) {
      setStoreName(client.storefrontSettings.storeName);
      setTagline(client.storefrontSettings.tagline);
      setPrimaryColor(client.storefrontSettings.primaryColor);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <div className="bg-gray-900 text-gray-300 text-xs py-1.5 px-4 text-center">
        Free shipping on orders over ৳1,000 • {tagline}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold" style={{ color: primaryColor }}>{storeName}</Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={`text-sm font-medium ${pathname === '/' ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}`}>Home</Link>
            <Link href="/products" className={`text-sm font-medium ${pathname.startsWith('/products') ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}`}>Products</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
              {itemCount > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center" style={{ backgroundColor: primaryColor }}>{itemCount}</span>}
              <span className="hidden sm:inline text-sm font-medium">{formatCurrency(subtotal)}</span>
            </Link>
            <button className="md:hidden text-gray-600" onClick={() => setMobileMenu(!mobileMenu)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
        {mobileMenu && <div className="md:hidden border-t px-4 py-3 space-y-2 bg-white">
          <Link href="/" onClick={() => setMobileMenu(false)} className="block py-2 text-sm">Home</Link>
          <Link href="/products" onClick={() => setMobileMenu(false)} className="block py-2 text-sm">Products</Link>
        </div>}
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div><h3 className="text-white font-bold text-lg mb-3">{storeName}</h3><p className="text-sm">{tagline}</p></div>
          <div><h4 className="text-white font-medium mb-3">Quick Links</h4><div className="space-y-2 text-sm"><Link href="/" className="block hover:text-white">Home</Link><Link href="/products" className="block hover:text-white">Products</Link><Link href="/cart" className="block hover:text-white">Cart</Link></div></div>
          <div><h4 className="text-white font-medium mb-3">Contact</h4><p className="text-sm">Email: support@store.com</p><p className="text-sm">Phone: 01700-000000</p></div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-xs">© {new Date().getFullYear()} {storeName}. All rights reserved.</div>
      </footer>

      <Chatbot />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
