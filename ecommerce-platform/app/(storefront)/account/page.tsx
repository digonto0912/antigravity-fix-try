'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { storage } from '@/lib/storage';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Order } from '@/lib/types';

export default function AccountPage() {
  const router = useRouter();
  const { customer, logout, setShowLoginModal } = useCustomerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (!customer) { setLoading(false); return; }
    try {
      const cid = await storage.getCartClientId();
      if (!cid) return;
      const allOrders = await storage.getOrders(cid);
      // Filter orders by this customer's email or phone
      const myOrders = allOrders.filter(o =>
        o.customerEmail === customer.email ||
        (customer.phone && o.customerPhone === customer.phone)
      );
      setOrders(myOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error('Load orders error:', err);
    }
    setLoading(false);
  }, [customer]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  if (!customer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to your account</h1>
        <p className="text-gray-600 mb-6">Track your orders, save your details, and get personalized offers.</p>
        <button
          onClick={() => setShowLoginModal(true)}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-5">
          {customer.photo ? (
            <img src={customer.photo} alt="" className="w-16 h-16 rounded-full border-2 border-white/30 object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {customer.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <p className="text-blue-200">{customer.email}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(orders.reduce((s, o) => s + o.total, 0))}
          </div>
          <div className="text-sm text-gray-600">Total Spent</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
          </div>
          <div className="text-sm text-gray-600">Active Orders</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-lg">My Orders</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 mx-auto" />
          </div>
        ) : orders.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {orders.map(order => (
              <div key={order.id} className="px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">#{order.id.slice(-8).toUpperCase()}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatDate(order.createdAt)} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{formatCurrency(order.total)}</div>
                    <div className="text-xs text-gray-500 capitalize">{order.paymentMethod.replace('_', ' ')}</div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="text-xs bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg">
                      {item.productName} ×{item.quantity}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">No orders yet</h3>
            <p className="text-sm text-gray-600">Start shopping to see your orders here!</p>
            <button
              onClick={() => router.push('/products')}
              className="mt-4 px-5 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              Browse Products
            </button>
          </div>
        )}
      </div>

      {/* Sign Out */}
      <div className="text-center">
        <button
          onClick={() => { logout(); router.push('/'); }}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
