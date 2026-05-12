import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, ChevronLeft, ChevronRight, Globe, Mail, Power,
  Settings, ShieldCheck, Plus, X
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getClients, addClient } from '../lib/masterStorage';
import { Client, ClientStatus } from '../types';
import { parseFirebaseEnv } from '../lib/clientFirebase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  onOpenDetails: (clientId: string) => void;
  search: string;
  setSearch: (s: string) => void;
}

export default function ClientsList({ onOpenDetails, search, setSearch }: Props) {
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const itemsPerPage = 10;

  const loadClients = useCallback(async () => {
    try {
      const clients = await getClients();
      setAllClients(clients);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadClients(); }, [loadClients]);

  const filteredClients = allClients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.domain.toLowerCase().includes(search.toLowerCase()) ||
    c.colabGmail.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));
  const currentClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddClient = async (data: { name: string; domain: string; colabGmail: string; envConfig: string }) => {
    const now = new Date().toISOString();
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    const firebaseConfig = parseFirebaseEnv(data.envConfig);
    const newClient: Client = {
      id,
      name: data.name,
      domain: data.domain,
      colabGmail: data.colabGmail,
      envConfig: data.envConfig,
      firebaseConfig,
      status: 'active',
      expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      createdAt: now,
      updatedAt: now,
    };
    await addClient(newClient);
    setAllClients(prev => [newClient, ...prev]);
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-500" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-xs">
              {filteredClients.length} MATCHES
            </span>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search domain, name or email..."
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm w-72 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </button>
            <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 uppercase text-[10px] font-bold text-gray-400 tracking-widest">
                <th className="px-6 py-4">Client / Domain</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4">Gmail</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Firebase</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    {search ? 'No clients match your search.' : 'No clients yet. Click "Add Client" to get started.'}
                  </td>
                </tr>
              ) : (
                currentClients.map((client) => (
                  <tr key={client.id} className="hover:bg-indigo-50/30 transition-colors group cursor-pointer" onClick={() => onOpenDetails(client.id)}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{client.name}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                          <Globe className="w-3 h-3" />
                          {client.domain}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                        client.status === 'active' ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                          client.status === 'paused' ? "bg-amber-100 text-amber-700 border border-amber-200" :
                            "bg-rose-100 text-rose-700 border border-rose-200"
                      )}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {client.colabGmail}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 tabular-nums">
                      {client.expiryDate}
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "w-8 h-8 rounded flex items-center justify-center border shadow-sm",
                        client.firebaseConfig
                          ? "bg-emerald-100 text-emerald-600 border-emerald-200"
                          : "bg-gray-100 text-gray-400 border-gray-200"
                      )} title={client.firebaseConfig ? "Firebase Connected" : "No Firebase Config"}>
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenDetails(client.id)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Edit Client"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Client Modal */}
      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddClient}
        />
      )}
    </>
  );
}

function AddClientModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (data: { name: string; domain: string; colabGmail: string; envConfig: string }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [colabGmail, setColabGmail] = useState('');
  const [envConfig, setEnvConfig] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !domain.trim()) return;
    setSaving(true);
    await onSave({ name: name.trim(), domain: domain.trim(), colabGmail: colabGmail.trim(), envConfig });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black uppercase tracking-tight">New Client</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Client Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Fashion Hub BD" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Domain</label>
            <input type="text" value={domain} onChange={e => setDomain(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. fashionhub.com" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Collaborator Gmail</label>
            <input type="email" value={colabGmail} onChange={e => setColabGmail(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. client@gmail.com" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">ENV Config (paste all keys)</label>
            <textarea value={envConfig} onChange={e => setEnvConfig(e.target.value)} rows={6} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="FIREBASE_API_KEY=xxx&#10;FIREBASE_PROJECT_ID=xxx&#10;..." />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || !name.trim() || !domain.trim()}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-100"
        >
          {saving ? 'Creating...' : 'Create Client'}
        </button>
      </motion.div>
    </div>
  );
}
