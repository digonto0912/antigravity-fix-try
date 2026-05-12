import React, { useState, useEffect } from 'react';
import {
  Globe, Mail, CreditCard, Power, ShieldCheck, Database,
  ExternalLink, Settings, RefreshCw, Save, Trash2, AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getClient, updateClient, deleteClient as deleteClientFromDb, getSettings } from '../lib/masterStorage';
import { parseFirebaseEnv, writeClientLicense, ClientFirebaseConfig } from '../lib/clientFirebase';
import { Client, ClientStatus } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  clientId: string;
  onBack: () => void;
}

export default function ClientDetails({ clientId, onBack }: Props) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushingLicense, setPushingLicense] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Editable fields
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [colabGmail, setColabGmail] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [envConfig, setEnvConfig] = useState('');
  const [firebaseEnvInput, setFirebaseEnvInput] = useState('');
  const [parsedConfig, setParsedConfig] = useState<ClientFirebaseConfig | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const c = await getClient(clientId);
        if (c) {
          setClient(c);
          setName(c.name);
          setDomain(c.domain);
          setColabGmail(c.colabGmail);
          setExpiryDate(c.expiryDate);
          setEnvConfig(c.envConfig);
          // Build firebase env display from stored config
          if (c.firebaseConfig) {
            setParsedConfig(c.firebaseConfig);
            setFirebaseEnvInput(buildFirebaseEnvText(c.firebaseConfig));
          }
        }
      } catch (err) {
        console.error('Failed to load client:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clientId]);

  const handleParseFirebaseConfig = () => {
    const parsed = parseFirebaseEnv(firebaseEnvInput);
    setParsedConfig(parsed);
    if (parsed) {
      setStatusMessage({ type: 'success', text: `Firebase config parsed! Project: ${parsed.projectId}` });
    } else {
      setStatusMessage({ type: 'error', text: 'Could not parse Firebase config. Need at least FIREBASE_API_KEY and FIREBASE_PROJECT_ID.' });
    }
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSave = async () => {
    if (!client) return;
    setSaving(true);
    try {
      const parsed = parseFirebaseEnv(firebaseEnvInput) || parsedConfig;
      await updateClient(clientId, {
        name, domain, colabGmail, expiryDate, envConfig,
        firebaseConfig: parsed,
      });
      setClient(prev => prev ? { ...prev, name, domain, colabGmail, expiryDate, envConfig, firebaseConfig: parsed } : prev);
      setParsedConfig(parsed);
      setStatusMessage({ type: 'success', text: 'Client saved successfully!' });
    } catch (err) {
      console.error('Failed to save:', err);
      setStatusMessage({ type: 'error', text: 'Failed to save. Check console.' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleToggleStatus = async () => {
    if (!client) return;
    const newStatus: ClientStatus = client.status === 'active' ? 'paused' : 'active';
    setPushingLicense(true);
    try {
      // Update master registry
      await updateClient(clientId, { status: newStatus });

      // Push license to client's own Firestore
      const config = parsedConfig || (client.firebaseConfig);
      if (config) {
        const settings = await getSettings();
        await writeClientLicense(clientId, config, {
          paused: newStatus === 'paused',
          expiryDate: expiryDate || client.expiryDate,
          contactPhone: settings.contactPhone || '',
          updatedAt: new Date().toISOString(),
        });
        setStatusMessage({ type: 'success', text: `Client ${newStatus === 'paused' ? 'PAUSED' : 'ACTIVATED'}! License pushed to client Firestore.` });
      } else {
        setStatusMessage({ type: 'error', text: `Status updated but NO Firebase config — cannot push license to client site.` });
      }
      setClient(prev => prev ? { ...prev, status: newStatus } : prev);
    } catch (err) {
      console.error('Toggle failed:', err);
      setStatusMessage({ type: 'error', text: 'Failed to toggle status. Check console.' });
    } finally {
      setPushingLicense(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handlePushLicense = async () => {
    if (!client) return;
    const config = parsedConfig || client.firebaseConfig;
    if (!config) {
      setStatusMessage({ type: 'error', text: 'No Firebase config! Paste and parse the client\'s Firebase env keys first.' });
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }
    setPushingLicense(true);
    try {
      const settings = await getSettings();
      await writeClientLicense(clientId, config, {
        paused: client.status === 'paused',
        expiryDate: expiryDate || client.expiryDate,
        contactPhone: settings.contactPhone || '',
        updatedAt: new Date().toISOString(),
      });
      setStatusMessage({ type: 'success', text: 'License data pushed to client\'s Firestore!' });
    } catch (err) {
      console.error('Push failed:', err);
      setStatusMessage({ type: 'error', text: 'Failed to push license. Check Firebase config.' });
    } finally {
      setPushingLicense(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleDelete = async () => {
    if (!client || !confirm(`Delete client "${client.name}"? This cannot be undone.`)) return;
    try {
      await deleteClientFromDb(clientId);
      onBack();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-500" />
      </div>
    );
  }

  if (!client) {
    return <div className="text-center text-gray-400 py-12">Client not found.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="grid grid-cols-12 gap-8"
    >
      {/* Status Message */}
      {statusMessage && (
        <div className="col-span-12">
          <div className={cn(
            "p-4 rounded-xl text-sm font-medium border",
            statusMessage.type === 'success'
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-rose-50 border-rose-200 text-rose-700"
          )}>
            {statusMessage.text}
          </div>
        </div>
      )}

      {/* Left Panel: Controls */}
      <div className="col-span-12 lg:col-span-4 space-y-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4">
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
              client.status === 'active' ? "bg-emerald-100 text-emerald-700" :
                client.status === 'paused' ? "bg-amber-100 text-amber-700" :
                  "bg-rose-100 text-rose-700"
            )}>
              {client.status}
            </span>
          </div>

          <div className="mb-8">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-2xl font-black text-gray-900 leading-tight mb-2 uppercase tracking-tighter bg-transparent border-b border-transparent hover:border-gray-200 focus:border-indigo-500 outline-none w-full transition-colors"
            />
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="text-sm font-bold text-indigo-600 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-indigo-500 outline-none flex-1 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">COLLABORATOR GMAIL</label>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-gray-200">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={colabGmail}
                  onChange={(e) => setColabGmail(e.target.value)}
                  className="text-sm font-semibold bg-transparent border-b border-transparent hover:border-gray-200 focus:border-indigo-500 outline-none flex-1 transition-colors"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">ACCESS EXPIRY</label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>

            {/* Firebase Config Input */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                CLIENT FIREBASE ENV KEYS
              </label>
              <textarea
                value={firebaseEnvInput}
                onChange={(e) => setFirebaseEnvInput(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                placeholder={"FIREBASE_API_KEY=AIzaSy...\nFIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com\nFIREBASE_PROJECT_ID=my-project\nFIREBASE_APP_ID=1:xxx:web:xxx"}
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={handleParseFirebaseConfig}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest"
                >
                  Parse Config
                </button>
                {parsedConfig && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {parsedConfig.projectId}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
              <button
                className={cn(
                  "w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                  client.status === 'active'
                    ? "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200"
                    : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200"
                )}
                onClick={handleToggleStatus}
                disabled={pushingLicense}
              >
                {pushingLicense ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Power className="w-5 h-5" />}
                {client.status === 'active' ? 'KILL SYSTEM' : 'RESTORE ACCESS'}
              </button>

              <button
                onClick={handlePushLicense}
                disabled={pushingLicense || !parsedConfig}
                className="w-full py-3 bg-zinc-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${pushingLicense ? 'animate-spin' : ''}`} />
                Push License to Client
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'SAVING...' : 'SAVE CHANGES'}
              </button>

              <button
                onClick={handleDelete}
                className="w-full py-3 bg-white text-rose-500 border border-rose-200 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Client
              </button>
            </div>
          </div>
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
            </div>
          </div>
          <div className="flex-1 relative p-2">
            <div className="absolute left-0 top-0 h-full w-12 bg-[#1e1e1e] border-r border-zinc-800 flex flex-col items-center pt-4 select-none">
              {Array.from({ length: 30 }).map((_, i) => (
                <span key={i} className="text-[10px] font-mono text-zinc-700 leading-[1.6rem]">{i + 1}</span>
              ))}
            </div>
            <textarea
              className="w-full h-full bg-transparent text-[#d4d4d4] font-mono text-sm p-4 pl-14 outline-none resize-none leading-[1.6rem] pb-20"
              spellCheck={false}
              value={envConfig}
              onChange={(e) => setEnvConfig(e.target.value)}
              placeholder="# Paste full environment variables here..."
            />
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center px-2">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            Data encrypted at rest - Deployment Sync Ready
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function buildFirebaseEnvText(config: ClientFirebaseConfig): string {
  const lines: string[] = [];
  if (config.apiKey) lines.push(`FIREBASE_API_KEY=${config.apiKey}`);
  if (config.authDomain) lines.push(`FIREBASE_AUTH_DOMAIN=${config.authDomain}`);
  if (config.projectId) lines.push(`FIREBASE_PROJECT_ID=${config.projectId}`);
  if (config.storageBucket) lines.push(`FIREBASE_STORAGE_BUCKET=${config.storageBucket}`);
  if (config.messagingSenderId) lines.push(`FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId}`);
  if (config.appId) lines.push(`FIREBASE_APP_ID=${config.appId}`);
  if (config.databaseURL) lines.push(`FIREBASE_DATABASE_URL=${config.databaseURL}`);
  if (config.measurementId) lines.push(`FIREBASE_MEASUREMENT_ID=${config.measurementId}`);
  return lines.join('\n');
}
