'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { storage } from '@/lib/storage';
import { formatCurrency, formatDate } from '@/lib/utils';
import Modal from '@/components/shared/Modal';
import { generateId } from '@/lib/utils';

export default function CustomersPage() {
  const { client } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewId, setViewId] = useState(null);
  const [pointsModal, setPointsModal] = useState(null);
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');

  const load = async () => {
    if (!client) return;
    const allCustomers = await storage.getCustomers(client.id);
    const allOrders = await storage.getOrders(client.id);
    const allLeads = await storage.getLeads(client.id);
    setOrders(allOrders);

    // Also find customers from orders who may not be in the customers collection
    // These are "window shoppers" who placed orders with just phone numbers
    const customerPhones = new Set(allCustomers.map(c => c.phone).filter(Boolean));
    const orderOnlyCustomers = [];

    allOrders.forEach(o => {
      if (o.customerPhone && !customerPhones.has(o.customerPhone)) {
        customerPhones.add(o.customerPhone); // prevent duplicates
        const existing = orderOnlyCustomers.find(c => c.phone === o.customerPhone);
        if (existing) {
          existing.totalOrders += 1;
          existing.totalSpent += o.total || 0;
        } else {
          orderOnlyCustomers.push({
            id: `order-${o.id}`,
            name: o.customerName || 'Window Shopper',
            phone: o.customerPhone,
            email: '',
            totalOrders: 1,
            totalSpent: o.total || 0,
            loyaltyPoints: 0,
            loyaltyHistory: [],
            addresses: o.shippingAddress ? [{ id: generateId(), address: `${o.shippingAddress}${o.city ? ', ' + o.city : ''}`, isDefault: true }] : [],
            tags: ['window-shopper'],
            createdAt: o.createdAt,
            updatedAt: o.createdAt,
            _isFromOrders: true,
          });
        }
      }
    });

    // Also check leads with phone numbers (newsletter phone subscribers)
    allLeads.forEach(l => {
      if (l.phone && !customerPhones.has(l.phone)) {
        customerPhones.add(l.phone);
        orderOnlyCustomers.push({
          id: `lead-${l.id}`,
          name: 'Phone Subscriber',
          phone: l.phone,
          email: '',
          totalOrders: 0,
          totalSpent: 0,
          loyaltyPoints: 0,
          loyaltyHistory: [],
          addresses: [],
          tags: ['phone-subscriber'],
          createdAt: l.createdAt || l.firstSeen || new Date().toISOString(),
          updatedAt: l.createdAt || l.firstSeen || new Date().toISOString(),
          _isFromOrders: true,
        });
      }
    });

    setCustomers([...allCustomers, ...orderOnlyCustomers]);
  };

  useEffect(() => { load(); }, [client]);

  const filtered = customers.filter(c => {
    // Type filter
    if (typeFilter === 'with_email' && !c.email) return false;
    if (typeFilter === 'phone_only' && c.email) return false;

    // Search filter
    if (!search) return true;
    const s = search.toLowerCase();
    return (c.name || '').toLowerCase().includes(s) || (c.phone || '').includes(s) || (c.email || '').toLowerCase().includes(s);
  });

  const viewCustomer = customers.find(c => c.id === viewId);
  const customerOrders = (id) => {
    // For order-derived customers, match by phone
    const cust = customers.find(c => c.id === id);
    if (cust?._isFromOrders) {
      return orders.filter(o => o.customerPhone === cust.phone);
    }
    return orders.filter(o => o.customerId === id);
  };

  const addPoints = async () => {
    if (!client || !pointsModal || !points) return;
    const cust = customers.find(c => c.id === pointsModal);
    if (!cust || cust._isFromOrders) return; // Can't add points to order-only customers
    const entry = { id: generateId(), points: Number(points), reason: reason || 'Manual adjustment', date: new Date().toISOString() };
    await storage.updateCustomer(client.id, pointsModal, { loyaltyPoints: cust.loyaltyPoints + Number(points), loyaltyHistory: [...cust.loyaltyHistory, entry] });
    setPointsModal(null); setPoints(''); setReason(''); load();
  };

  // Counts for tabs
  const totalCount = customers.length;
  const emailCount = customers.filter(c => c.email).length;
  const phoneOnlyCount = customers.filter(c => !c.email).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">All Customers</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
          <div className="text-xs text-gray-500 mt-1">Total Customers</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{emailCount}</div>
          <div className="text-xs text-gray-500 mt-1">With Email</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{phoneOnlyCount}</div>
          <div className="text-xs text-gray-500 mt-1">Phone Only (Window Shoppers)</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, email..." className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">All Customers</option>
            <option value="with_email">With Email</option>
            <option value="phone_only">Phone Only (Window Shoppers)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left text-gray-500 border-b"><th className="px-4 py-3">Name</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">Spent</th><th className="px-4 py-3">Points</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Actions</th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.phone || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email || '-'}</td>
                  <td className="px-4 py-3">
                    {c.email ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600">Registered</span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-orange-50 text-orange-600">Window Shopper</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{c.totalOrders || 0}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(c.totalSpent || 0)}</td>
                  <td className="px-4 py-3">{c.loyaltyPoints || 0}</td>
                  <td className="px-4 py-3 text-gray-400">{c.createdAt ? formatDate(c.createdAt) : '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setViewId(c.id)} className="text-xs text-blue-600 hover:underline mr-2">View</button>
                    {!c._isFromOrders && <button onClick={() => setPointsModal(c.id)} className="text-xs text-green-600 hover:underline">+Points</button>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">No customers found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details */}
      <Modal isOpen={!!viewCustomer} onClose={() => setViewId(null)} title={viewCustomer?.name || ''} size="lg">
        {viewCustomer && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">Phone</div><div className="font-medium">{viewCustomer.phone || '-'}</div></div>
              <div className="p-3 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">Email</div><div className="font-medium">{viewCustomer.email || '-'}</div></div>
              <div className="p-3 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">Type</div><div className="font-medium">{viewCustomer.email ? 'Registered' : 'Window Shopper'}</div></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">Total Spent</div><div className="font-medium">{formatCurrency(viewCustomer.totalSpent || 0)}</div></div>
              <div className="p-3 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">Loyalty Points</div><div className="font-medium">{viewCustomer.loyaltyPoints || 0}</div></div>
            </div>
            {viewCustomer.addresses && viewCustomer.addresses.length > 0 && (
              <div><h4 className="text-sm font-medium mb-2">Addresses</h4>{viewCustomer.addresses.map(a => <div key={a.id} className="text-sm text-gray-600 py-1">{a.address}{a.city ? `, ${a.city}` : ''} {a.isDefault && <span className="text-xs bg-blue-100 text-blue-700 px-2 rounded-full ml-1">Default</span>}</div>)}</div>
            )}
            {viewCustomer.tags && viewCustomer.tags.length > 0 && (
              <div><h4 className="text-sm font-medium mb-2">Tags</h4><div className="flex gap-2">{viewCustomer.tags.map(t => <span key={t} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">{t}</span>)}</div></div>
            )}
            <div><h4 className="text-sm font-medium mb-2">Order History</h4>
              <table className="w-full text-sm"><thead><tr className="border-b text-gray-500"><th className="text-left py-1">Order</th><th className="text-left py-1">Date</th><th className="text-right py-1">Total</th><th className="text-left py-1">Status</th></tr></thead>
                <tbody>{customerOrders(viewCustomer.id).map(o => <tr key={o.id} className="border-b border-gray-50"><td className="py-2">{o.orderNumber}</td><td className="py-2 text-gray-400">{formatDate(o.createdAt)}</td><td className="py-2 text-right">{formatCurrency(o.total)}</td><td className="py-2 capitalize">{o.status}</td></tr>)}
                {customerOrders(viewCustomer.id).length === 0 && <tr><td colSpan={4} className="py-4 text-center text-gray-400">No orders</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Points Modal */}
      <Modal isOpen={!!pointsModal} onClose={() => setPointsModal(null)} title="Add Loyalty Points" size="sm">
        <div className="space-y-4">
          <div><label className="text-sm text-gray-600">Points</label><input type="number" value={points} onChange={e => setPoints(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" /></div>
          <div><label className="text-sm text-gray-600">Reason</label><input value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm mt-1" placeholder="e.g. Purchase reward" /></div>
          <div className="flex justify-end gap-3"><button onClick={() => setPointsModal(null)} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">Cancel</button><button onClick={addPoints} className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg">Add Points</button></div>
        </div>
      </Modal>
    </div>
  );
}
