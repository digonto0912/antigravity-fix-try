import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Power, CreditCard, Database, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { getClients } from '../lib/masterStorage';
import { Client } from '../types';

const StatCard = ({ title, value, color, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, active: 0, paused: 0, expired: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const clients = await getClients();
        setStats({
          total: clients.length,
          active: clients.filter(c => c.status === 'active').length,
          paused: clients.filter(c => c.status === 'paused').length,
          expired: clients.filter(c => c.status === 'expired').length,
        });
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-500" />
      </div>
    );
  }

  const safeTotal = stats.total || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Clients" value={stats.total.toLocaleString()} color="bg-indigo-600" icon={Users} />
        <StatCard title="Active Systems" value={stats.active.toLocaleString()} color="bg-emerald-500" icon={ShieldCheck} />
        <StatCard title="Paused" value={stats.paused.toLocaleString()} color="bg-amber-500" icon={Power} />
        <StatCard title="Expired Licenses" value={stats.expired.toLocaleString()} color="bg-rose-500" icon={CreditCard} />
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Database className="w-64 h-64 rotate-12" />
        </div>
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          Cluster Distribution
        </h3>
        {stats.total > 0 ? (
          <>
            <div className="flex h-12 w-full gap-2 mb-8">
              <div className="h-full bg-emerald-500 rounded-l-lg hover:brightness-110 transition-all cursor-pointer" style={{ width: `${(stats.active / safeTotal) * 100}%` }} title="Active" />
              <div className="h-full bg-amber-500 hover:brightness-110 transition-all cursor-pointer" style={{ width: `${(stats.paused / safeTotal) * 100}%` }} title="Paused" />
              <div className="h-full bg-rose-500 rounded-r-lg hover:brightness-110 transition-all cursor-pointer" style={{ width: `${(stats.expired / safeTotal) * 100}%` }} title="Expired" />
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-emerald-500">{((stats.active / safeTotal) * 100).toFixed(1)}%</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Healthy</span>
              </div>
              <div className="flex flex-col border-l border-gray-100 pl-8">
                <span className="text-3xl font-black text-amber-500">{((stats.paused / safeTotal) * 100).toFixed(1)}%</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">On Hold</span>
              </div>
              <div className="flex flex-col border-l border-gray-100 pl-8">
                <span className="text-3xl font-black text-rose-500">{((stats.expired / safeTotal) * 100).toFixed(1)}%</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Risk Factor</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-sm">No clients yet. Add your first client from the Clients page.</p>
        )}
      </div>
    </motion.div>
  );
}
