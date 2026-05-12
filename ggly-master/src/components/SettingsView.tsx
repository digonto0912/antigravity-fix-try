import React, { useState, useEffect } from 'react';
import { Phone, Save, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { getSettings, updateSettings, getClients } from '../lib/masterStorage';
import { writeClientLicense, parseFirebaseEnv } from '../lib/clientFirebase';
import { MasterSettings } from '../types';

export default function SettingsView() {
  const [settings, setSettings] = useState<MasterSettings>({ contactPhone: '', updatedAt: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await getSettings();
        setSettings(s);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ contactPhone: settings.contactPhone });
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePushPhoneToAll = async () => {
    if (!settings.contactPhone.trim()) return;
    setPushing(true);
    setPushResult(null);
    try {
      const clients = await getClients();
      let success = 0;
      let failed = 0;
      for (const client of clients) {
        if (!client.firebaseConfig) {
          // Try parsing from envConfig
          const parsed = client.envConfig ? parseFirebaseEnv(client.envConfig) : null;
          if (!parsed) { failed++; continue; }
          client.firebaseConfig = parsed;
        }
        try {
          const today = new Date().toISOString().split('T')[0];
          await writeClientLicense(client.id, client.firebaseConfig, {
            paused: client.status === 'paused',
            expiryDate: client.expiryDate,
            contactPhone: settings.contactPhone,
            updatedAt: new Date().toISOString(),
          });
          success++;
        } catch {
          failed++;
        }
      }
      setPushResult(`Done! Updated ${success} clients. ${failed > 0 ? `${failed} failed (no valid Firebase config).` : ''}`);
    } catch (err) {
      console.error('Push failed:', err);
      setPushResult('Push failed. Check console.');
    } finally {
      setPushing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl space-y-8"
    >
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl space-y-6">
        <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
          <Phone className="w-5 h-5 text-indigo-600" />
          Global Contact Phone
        </h3>
        <p className="text-sm text-gray-500">
          This phone number will appear on the "Construct with MOREX" popup when a client site is paused or expired.
          It is pushed into each client's own Firestore.
        </p>

        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Phone Number</label>
          <input
            type="tel"
            value={settings.contactPhone}
            onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="+880 1XXXXXXXXX"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>

          <button
            onClick={handlePushPhoneToAll}
            disabled={pushing || !settings.contactPhone.trim()}
            className="flex-1 py-3 bg-zinc-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 ${pushing ? 'animate-spin' : ''}`} />
            {pushing ? 'Pushing...' : 'Push to All Clients'}
          </button>
        </div>

        {pushResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
            {pushResult}
          </div>
        )}
      </div>
    </motion.div>
  );
}
