import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Settings as SettingsIcon, ChevronLeft, ChevronRight,
  ShieldCheck, LogOut, Phone
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Client } from '../types';
import Dashboard from './Dashboard';
import ClientsList from './ClientsList';
import ClientDetails from './ClientDetails';
import SettingsView from './SettingsView';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ViewType = 'dashboard' | 'clients' | 'details' | 'settings';

export { cn };

export default function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleOpenDetails = (clientId: string) => {
    setSelectedClientId(clientId);
    setCurrentView('details');
  };

  const handleBackToClients = () => {
    setSelectedClientId(null);
    setCurrentView('clients');
  };

  const navItems = [
    { key: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
    { key: 'clients' as ViewType, label: 'Clients (6.1k)', icon: Users },
    { key: 'settings' as ViewType, label: 'Settings', icon: SettingsIcon },
  ];

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
              <span className="text-[10px] text-gray-400 font-mono">v2.0.0 PREMIUM</span>
            </div>
          )}
        </div>

        <nav className="flex-1 w-full px-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setCurrentView(item.key)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-colors group",
                (currentView === item.key || (item.key === 'clients' && currentView === 'details'))
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:bg-zinc-800"
              )}
            >
              <item.icon className="w-5 h-5" />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
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
                onClick={handleBackToClients}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 mr-2"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <h2 className="text-xl font-bold text-gray-800 capitalize">
              {currentView === 'dashboard' ? 'Platform Overview' :
                currentView === 'clients' ? 'Client Fleet Control' :
                  currentView === 'settings' ? 'Master Settings' :
                    'Client Details'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
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
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'clients' && (
            <ClientsList
              onOpenDetails={handleOpenDetails}
              search={search}
              setSearch={setSearch}
            />
          )}
          {currentView === 'details' && selectedClientId && (
            <ClientDetails
              clientId={selectedClientId}
              onBack={handleBackToClients}
            />
          )}
          {currentView === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
}
