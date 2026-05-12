/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Power, 
  Search, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Database,
  Globe,
  Mail,
  ShieldCheck,
  CreditCard,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generateMockClients } from './utils/mockData';
import { Client, ClientStatus } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Stats Card Component
const StatCard = ({ title, value, color, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={cn("p-3 rounded-lg", color)}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentView, setCurrentView] = useState<'dashboard' | 'clients' | 'details'>('clients');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [envEditorContent, setEnvEditorContent] = useState('');
  const [expiryValue, setExpiryValue] = useState('');

  // Load 6.1k clients
  const allClients = useMemo(() => generateMockClients(6100), []);
  const itemsPerPage = 10;

  const filteredClients = useMemo(() => {
    return allClients.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.domain.toLowerCase().includes(search.toLowerCase())
    );
  }, [allClients, search]);

  const stats = useMemo(() => {
    return {
      total: allClients.length,
      active: allClients.filter(c => c.status === 'active').length,
      inactive: allClients.filter(c => c.status === 'inactive').length,
      expired: allClients.filter(c => c.status === 'expired').length,
    };
  }, [allClients]);

  const currentClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(start, start + itemsPerPage);
  }, [filteredClients, currentPage]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  const toggleClientStatus = (id: string) => {
    console.log(`Toggling status for client ${id}`);
  };

  const handleOpenDetails = (client: Client) => {
    setSelectedClient(client);
    setEnvEditorContent(client.envConfig);
    setExpiryValue(client.expiryDate);
    setCurrentView('details');
  };

  const handleSaveDetails = () => {
    console.log('Saving ENV/Expiry for:', selectedClient?.id);
    setCurrentView('clients');
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-zinc-900 text-white flex flex-col items-center py-8 relative shadow-2xl z-20"
      >
        <div className="flex items-center gap-3 px-4 mb-12 overflow-hidden whitespace-nowrap">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight uppercase">Ggly Master</span>
              <span className="text-[10px] text-gray-400 font-mono">v1.4.2 PREMIUM</span>
            </div>
          )}
        </div>

        <nav className="flex-1 w-full px-4 space-y-2">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors group",
              currentView === 'dashboard' ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-zinc-800"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">Dashboard</span>}
          </button>
          <button 
            onClick={() => setCurrentView('clients')}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors group",
              currentView === 'clients' ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-zinc-800"
            )}
          >
            <Users className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">Clients (6.1k)</span>}
          </button>
          <div className="pt-4 pb-2">
            <div className={cn("border-t border-zinc-800 mx-2 mb-4")} />
            {isSidebarOpen && <span className="px-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Management</span>}
          </div>
          <button className="w-full flex items-center gap-3 p-3 text-gray-400 hover:bg-zinc-800 rounded-lg transition-colors">
            <RefreshCw className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">Sync All DBs</span>}
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-gray-400 hover:bg-zinc-800 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">Settings</span>}
          </button>
        </nav>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 bg-indigo-600 p-1.5 rounded-full border-4 border-gray-50 text-white shadow-lg"
        >
          {isSidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        <div className="w-full px-4 mt-auto">
          <button className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors group">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
             {currentView === 'details' && (
              <button 
                onClick={() => setCurrentView('clients')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 mr-2"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <h2 className="text-xl font-bold text-gray-800 capitalize">
              {currentView === 'dashboard' ? 'Platform Overview' : 
               currentView === 'clients' ? 'Client Fleet Control' : 
               `Editing: ${selectedClient?.name}`}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {currentView !== 'details' && (
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search domain or client name..." 
                  className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm w-80 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}
            <div className="h-8 w-[1px] bg-gray-200 mx-2" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-50 ring-offset-1">
                AD
              </div>
              <span className="text-sm font-semibold">Admin Panel</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Clients" value={stats.total.toLocaleString()} color="bg-indigo-600" icon={Users} />
                  <StatCard title="Active Systems" value={stats.active.toLocaleString()} color="bg-emerald-500" icon={ShieldCheck} />
                  <StatCard title="Suspended" value={stats.inactive.toLocaleString()} color="bg-amber-500" icon={Power} />
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
                  <div className="flex h-12 w-full gap-2 mb-8">
                    <div className="h-full bg-emerald-500 rounded-l-lg hover:brightness-110 transition-all cursor-pointer" style={{ width: `${(stats.active / stats.total) * 100}%` }} title="Active" />
                    <div className="h-full bg-amber-500 hover:brightness-110 transition-all cursor-pointer" style={{ width: `${(stats.inactive / stats.total) * 100}%` }} title="Inactive" />
                    <div className="h-full bg-rose-500 rounded-r-lg hover:brightness-110 transition-all cursor-pointer" style={{ width: `${(stats.expired / stats.total) * 100}%` }} title="Expired" />
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    <div className="flex flex-col">
                      <span className="text-3xl font-black text-emerald-500">{((stats.active / stats.total) * 100).toFixed(1)}%</span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Healthy</span>
                    </div>
                    <div className="flex flex-col border-l border-gray-100 pl-8">
                      <span className="text-3xl font-black text-amber-500">{((stats.inactive / stats.total) * 100).toFixed(1)}%</span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">On Hold</span>
                    </div>
                    <div className="flex flex-col border-l border-gray-100 pl-8">
                      <span className="text-3xl font-black text-rose-500">{((stats.expired / stats.total) * 100).toFixed(1)}%</span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Risk Factor</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentView === 'clients' && (
              <motion.div 
                key="clients"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-xs">
                      {filteredClients.length} MATCHES
                    </span>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Filter className="w-4 h-4" />
                      <span>Filter: All Regions</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 mr-4">Page {currentPage} of {totalPages}</span>
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
                        <th className="px-6 py-4">Last API Fetch</th>
                        <th className="px-6 py-4">Expiry Date</th>
                        <th className="px-6 py-4">Infrastructure</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {currentClients.map((client) => (
                        <tr key={client.id} className="hover:bg-indigo-50/30 transition-colors group">
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
                              client.status === 'inactive' ? "bg-amber-100 text-amber-700 border border-amber-200" :
                              "bg-rose-100 text-rose-700 border border-rose-200"
                            )}>
                              {client.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 tabular-nums">
                            {new Date(client.lastSync).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 tabular-nums">
                            {new Date(client.expiryDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <div title="Env Logic Loaded" className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center text-indigo-400 border border-zinc-700 shadow-sm">
                                <ShieldCheck className="w-4 h-4" />
                              </div>
                              <div title="Github Linked" className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-600 border border-gray-200 shadow-sm">
                                <Globe className="w-4 h-4" />
                              </div>
                              <div title="Email Sync Active" className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200 shadow-sm">
                                <Mail className="w-4 h-4" />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                               <button 
                                onClick={() => handleOpenDetails(client)}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="Edit Environment"
                              >
                                <Settings className="w-5 h-5" />
                              </button>
                              <button 
                                className={cn(
                                  "p-2 rounded-lg transition-all shadow-sm border",
                                  client.status === 'active' 
                                    ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100" 
                                    : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                )}
                                title={client.status === 'active' ? "DEACTIVATE CLIENT" : "ACTIVATE CLIENT"}
                                onClick={() => toggleClientStatus(client.id)}
                              >
                                <Power className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {currentView === 'details' && selectedClient && (
              <motion.div 
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-12 gap-8"
              >
                {/* Left Panel: Controls */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                  <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4">
                       <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          selectedClient.status === 'active' ? "bg-emerald-100 text-emerald-700" :
                          selectedClient.status === 'inactive' ? "bg-amber-100 text-amber-700" :
                          "bg-rose-100 text-rose-700"
                        )}>
                          {selectedClient.status}
                        </span>
                    </div>
                    <div className="mb-8">
                      <h3 className="text-3xl font-black text-gray-900 leading-tight mb-2 uppercase tracking-tighter">
                        {selectedClient.name}
                      </h3>
                      <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                        <Globe className="w-4 h-4" />
                        {selectedClient.domain}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">COLLABORATOR GMAIL</label>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-gray-200">
                            <Mail className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-semibold">{selectedClient.colabGmail}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">ACCESS EXPIRY</label>
                        <div className="relative">
                          <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input 
                            type="date" 
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={expiryValue}
                            onChange={(e) => setExpiryValue(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
                        <button 
                          className={cn(
                            "w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                            selectedClient.status === 'active' 
                              ? "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200" 
                              : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200"
                          )}
                          onClick={() => toggleClientStatus(selectedClient.id)}
                        >
                          <Power className="w-5 h-5" />
                          {selectedClient.status === 'active' ? 'KILL SYSTEM' : 'RESTORE ACCESS'}
                        </button>
                        <button 
                          onClick={handleSaveDetails}
                          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                        >
                          PROVISION UPDATES
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remote Panels */}
                   <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-700 shadow-2xl space-y-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Remote Control Center</h4>
                    <button className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl flex items-center justify-between px-6 transition-all group">
                      <span className="font-bold flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        Dedicated Admin
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </button>
                    <button className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl flex items-center justify-between px-6 transition-all group">
                      <span className="font-bold flex items-center gap-3">
                        <Database className="w-5 h-5 text-emerald-400" />
                        Direct DB Query
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </button>
                  </div>
                </div>

                {/* Right Panel: Code Canvas */}
                <div className="col-span-12 lg:col-span-8 flex flex-col min-h-[600px]">
                  <div className="bg-[#1e1e1e] rounded-3xl border border-zinc-800 shadow-2xl flex-1 flex flex-col overflow-hidden">
                    <div className="h-14 bg-[#252526] border-b border-zinc-800 flex items-center px-6 justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                        </div>
                        <div className="h-4 w-[1px] bg-zinc-700 mx-2" />
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                          <Settings className="w-3 h-3" />
                          client_environment.env
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="text-[10px] font-bold text-gray-500 bg-zinc-800 px-2 py-1 rounded">UTF-8</span>
                         <RefreshCw className="w-4 h-4 text-zinc-600 hover:text-zinc-300 cursor-pointer transition-colors" />
                      </div>
                    </div>
                    <div className="flex-1 relative p-2">
                      <div className="absolute left-0 top-0 h-full w-12 bg-[#1e1e1e] border-r border-zinc-800 flex flex-col items-center pt-4 select-none">
                        {Array.from({ length: 20 }).map((_, i) => (
                           <span key={i} className="text-[10px] font-mono text-zinc-700 leading-[1.6rem]">{i + 1}</span>
                        ))}
                      </div>
                      <textarea 
                        className="w-full h-full bg-transparent text-[#d4d4d4] font-mono text-sm p-4 pl-14 outline-none resize-none leading-[1.6rem] pb-20"
                        spellCheck={false}
                        value={envEditorContent}
                        onChange={(e) => setEnvEditorContent(e.target.value)}
                        placeholder="# Paste environment variables here..."
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center px-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      Data encrypted at rest - Deployment Sync Ready
                    </span>
                    <button 
                      onClick={handleSaveDetails}
                      className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest hover:underline"
                    >
                      Dismiss Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

