'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { storage } from '@/lib/storage';
import { formatCurrency, generateId, BD_CITIES } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, subtotal, itemCount, clearCart } = useCart();
  const primaryColor = '#3b82f6';
  const shippingRate = 60;
  const freeThreshold = 1000;

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [errors, setErrors] = useState({});

  const shipping = subtotal >= freeThreshold ? 0 : shippingRate;
  const total = subtotal + shipping;

  // Order success screen
  if (orderId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-6" style={{ backgroundColor: primaryColor + '20' }}>✓</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-6">Order <strong>{orderId}</strong> has been placed successfully.</p>
        <div className="bg-gray-50 rounded-xl p-6 text-left text-sm space-y-2 mb-8">
          <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="text-green-600 font-medium">Confirmed</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Payment</span><span>Cash on Delivery</span></div>
        </div>
        <button onClick={() => router.push('/products')} className="px-6 py-3 text-white rounded-xl font-semibold" style={{ backgroundColor: primaryColor }}>Continue Shopping</button>
      </div>
    );
  }

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

  const validate = () => {
    const e = {};
    if (!phone.trim() || phone.length < 11) e.phone = 'Valid phone required (11 digits)';
    if (!address.trim()) e.address = 'Address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = async () => {
    if (!validate()) return;
    setPlacing(true);

    const cid = await storage.getCartClientId();
    if (!cid) { setPlacing(false); return; }

    const now = new Date().toISOString();
    const orderNum = `ORD-${Date.now().toString().slice(-5)}`;
    const custId = generateId();

    // Create or update customer
    const allCustomers = await storage.getCustomers(cid);
    const existing = allCustomers.find(c => c.phone === phone.trim());
    const customerName = existing?.name || 'Customer';

    if (!existing) {
      const cust = {
        id: custId, clientId: cid, name: customerName, phone: phone.trim(),
        addresses: [{ id: generateId(), address: address.trim(), city, isDefault: true }],
        totalOrders: 1, totalSpent: total,
        loyaltyPoints: Math.floor(total / 100),
        loyaltyHistory: [{ id: generateId(), points: Math.floor(total / 100), reason: 'Purchase', date: now }],
        tags: [], createdAt: now, updatedAt: now,
      };
      await storage.addCustomer(cid, cust);
    } else {
      await storage.updateCustomer(cid, existing.id, {
        totalOrders: existing.totalOrders + 1,
        totalSpent: existing.totalSpent + total,
        loyaltyPoints: existing.loyaltyPoints + Math.floor(total / 100),
      });
    }

    // Create order — sanitize to prevent undefined values in Firestore
    const order = {
      id: generateId(), clientId: cid, orderNumber: orderNum,
      customerId: existing?.id || custId, customerName: customerName || 'Customer',
      customerPhone: phone.trim(), shippingAddress: address.trim(), city,
      items: items.map(i => ({
        productId: i.productId, productName: i.productName,
        variant: i.variant || null, quantity: i.quantity, price: i.price,
        total: i.price * i.quantity,
      })),
      subtotal, discount: 0, shippingCost: shipping, total,
      paymentMethod: 'cod', paymentStatus: 'pending', status: 'pending',
      statusHistory: [{ status: 'pending', timestamp: now }],
      notes: '',
      createdAt: now, updatedAt: now,
    };
    await storage.addOrder(cid, order);

    // Update product stats
    for (const i of items) {
      const p = await storage.getProduct(cid, i.productId);
      if (p) await storage.updateProduct(cid, i.productId, {
        inventory: Math.max(0, p.inventory - i.quantity),
        purchaseCount: p.purchaseCount + 1,
      });
    }

    // Add accounting entry
    await storage.addAccountingEntry(cid, {
      id: generateId(), clientId: cid, type: 'income', category: 'Sales',
      amount: total, description: `Order ${orderNum}`, relatedOrderId: order.id,
      paymentMethod: 'cod', date: now, createdAt: now,
    });

    setOrderId(orderNum);
    clearCart();
    setPlacing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({itemCount} items)</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={`${item.productId}-${JSON.stringify(item.variant)}`} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.image ? <img src={item.image} alt={item.productName} className="w-full h-full object-cover" /> : <span className="text-3xl">🛍️</span>}
              </div>
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

        {/* Delivery + Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24 space-y-5">
            <h3 className="font-bold text-lg">Complete Your Order</h3>

            {/* Phone */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone Number *</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="01XXXXXXXXX" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Delivery Address *</label>
              <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} placeholder="Full address with house no., road, area..." className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">City</label>
              <select value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white">
                {BD_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Summary */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : formatCurrency(shipping)}</span></div>
              {subtotal < freeThreshold && <p className="text-xs text-blue-600">Add {formatCurrency(freeThreshold - subtotal)} more for free shipping!</p>}
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-4"><span>Total</span><span>{formatCurrency(total)}</span></div>

            {/* Cash on Delivery Button */}
            <button
              onClick={placeOrder}
              disabled={placing}
              className="w-full py-3.5 text-white rounded-xl font-semibold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              {placing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>💵 Cash on Delivery — {formatCurrency(total)}</>
              )}
            </button>

            <Link href="/products" className="block w-full py-3 text-center text-gray-600 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
