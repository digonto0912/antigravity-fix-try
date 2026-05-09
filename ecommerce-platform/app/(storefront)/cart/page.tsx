'use client';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCart();
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [shippingRate, setShippingRate] = useState(60);
  const [freeThreshold, setFreeThreshold] = useState(1000);

  useEffect(() => {
    const cid = storage.getCartClientId();
    if (!cid) return;
    const client = storage.getClient(cid);
    if (client?.storefrontSettings) setPrimaryColor(client.storefrontSettings.primaryColor);
    if (client?.shippingSettings) { setShippingRate(client.shippingSettings.flatRate); setFreeThreshold(client.shippingSettings.freeShippingThreshold); }
  }, []);

  const shipping = subtotal >= freeThreshold ? 0 : shippingRate;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <span className="text-6xl block mb-4">🛒</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Browse our products and add items to your cart</p>
        <Link href="/products" className="inline-block px-6 py-3 text-white rounded-xl font-semibold" style={{ backgroundColor: primaryColor }}>Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({itemCount} items)</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={`${item.productId}-${JSON.stringify(item.variant)}`} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0"><span className="text-3xl">🛍️</span></div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.productId}`} className="font-semibold text-gray-900 hover:text-blue-600">{item.productName}</Link>
                {item.variant && <p className="text-xs text-gray-400 mt-1">{Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(' • ')}</p>}
                <p className="text-sm font-bold mt-1" style={{ color: primaryColor }}>{formatCurrency(item.price)}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button onClick={() => removeItem(item.productId)} className="text-xs text-red-500 hover:text-red-700">✕ Remove</button>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-3 py-1 text-gray-500 hover:bg-gray-50">−</button>
                  <span className="px-3 py-1 text-sm font-medium border-x">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-3 py-1 text-gray-500 hover:bg-gray-50">+</button>
                </div>
                <span className="text-sm font-bold">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24 space-y-4">
            <h3 className="font-bold text-lg">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : formatCurrency(shipping)}</span></div>
              {subtotal < freeThreshold && <p className="text-xs text-blue-600">Add {formatCurrency(freeThreshold - subtotal)} more for free shipping!</p>}
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-4"><span>Total</span><span>{formatCurrency(total)}</span></div>
            <Link href="/checkout" className="block w-full py-3 text-center text-white rounded-xl font-semibold transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>Proceed to Checkout</Link>
            <Link href="/products" className="block w-full py-3 text-center text-gray-600 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
