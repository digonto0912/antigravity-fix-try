'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { storage } from '@/lib/storage';
import { formatCurrency, formatDate, getStatusColor, generateId } from '@/lib/utils';
import type { Lead } from '@/lib/types';
import Badge from '@/components/shared/Badge';

export default function LeadsPage() {
  const { client } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => { if (client) setLeads(await storage.getLeads(client.id)); };
  useEffect(() => { load(); }, [client]);

  const filtered = leads.filter(l => {
    if (search && !(l.name || '').toLowerCase().includes(search.toLowerCase()) && !(l.phone || '').includes(search)) return false;
    if (statusFilter !== 'all' && l.leadStatus !== statusFilter) return false;
    return true;
  });

  const stats = { total: leads.length, hot: leads.filter(l => l.leadStatus === 'hot').length, warm: leads.filter(l => l.leadStatus === 'warm').length, cold: leads.filter(l => l.leadStatus === 'cold').length, converted: leads.filter(l => l.leadStatus === 'converted').length };
  const convRate = stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0;

  const updateStatus = async (id: string, status: Lead['leadStatus']) => { if (client) { await storage.updateLead(client.id, id, { leadStatus: status }); load(); } };

  const convertToCustomer = async (lead: Lead) => {
    if (!client || !lead.name) return;
    await storage.addCustomer(client.id, { id: generateId(), clientId: client.id, name: lead.name || 'Unknown', phone: lead.phone || '', email: lead.email, addresses: [], totalOrders: 0, totalSpent: 0, loyaltyPoints: 0, loyaltyHistory: [], tags: ['From Lead'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await storage.updateLead(client.id, lead.id, { leadStatus: 'converted' });
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Lead Tracker</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-gray-50' },
          { label: 'Hot 🔥', value: stats.hot, color: 'bg-red-50' },
          { label: 'Warm', value: stats.warm, color: 'bg-orange-50' },
          { label: 'Cold', value: stats.cold, color: 'bg-blue-50' },
          { label: 'Conversion', value: `${convRate}%`, color: 'bg-green-50' },
        ].map(s => <div key={s.label} className={`${s.color} rounded-xl p-4`}><div className="text-xs text-gray-500">{s.label}</div><div className="text-2xl font-bold mt-1">{s.value}</div></div>)}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm"><option value="all">All</option><option value="hot">Hot</option><option value="warm">Warm</option><option value="cold">Cold</option><option value="converted">Converted</option></select>
      </div>

      <div className="space-y-3">
        {filtered.map(l => (
          <div key={l.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 cursor-pointer" onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}>
              <div><div className="font-medium">{l.name || l.phone || 'Anonymous'}</div><div className="text-xs text-gray-400">{l.phone} • Last: {formatDate(l.lastVisit)} • {l.totalVisits} visits</div></div>
              <div className="flex items-center gap-3">
                {l.cartAbandoned && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">🛒 {formatCurrency(l.abandonedCartValue)}</span>}
                <Badge label={l.leadStatus} className={getStatusColor(l.leadStatus)} />
                <select value={l.leadStatus} onChange={e => { e.stopPropagation(); updateStatus(l.id, e.target.value as Lead['leadStatus']); }} onClick={e => e.stopPropagation()} className="text-xs border rounded px-2 py-1"><option value="hot">Hot</option><option value="warm">Warm</option><option value="cold">Cold</option></select>
              </div>
            </div>
            {expandedId === l.id && (
              <div className="mt-4 pt-4 border-t space-y-3">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div><span className="text-gray-500">Pages viewed:</span> {l.pagesViewed.length}</div>
                  <div><span className="text-gray-500">Products viewed:</span> {l.productsViewed.length}</div>
                  <div><span className="text-gray-500">Time on site:</span> {Math.round(l.timeOnSite / 60)}min</div>
                </div>
                {l.pagesViewed.length > 0 && <div><h4 className="text-xs font-medium text-gray-500 mb-1">Pages</h4><div className="flex flex-wrap gap-1">{l.pagesViewed.map((p, i) => <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{p}</span>)}</div></div>}
                {l.cartAbandoned && l.abandonedCartItems.length > 0 && <div><h4 className="text-xs font-medium text-gray-500 mb-1">Abandoned Cart</h4>{l.abandonedCartItems.map((item, i) => <div key={i} className="text-sm">{item.productName} ×{item.quantity} = {formatCurrency(item.price * item.quantity)}</div>)}</div>}
                {l.tags.length > 0 && <div className="flex gap-1">{l.tags.map(t => <span key={t} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">{t}</span>)}</div>}
                {l.leadStatus !== 'converted' && l.name && <button onClick={() => convertToCustomer(l)} className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600">Convert to Customer</button>}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="bg-white rounded-xl border p-12 text-center text-gray-400">No leads found</div>}
      </div>
    </div>
  );
}
