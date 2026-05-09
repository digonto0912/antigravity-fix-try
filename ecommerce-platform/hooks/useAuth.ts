'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Client } from '@/lib/types';

const SESSION_KEY = 'auth_session';
const CLIENTS_KEY = 'clients';

function getClients(): Client[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]');
  } catch { return []; }
}

function saveClients(clients: Client[]) {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

export function useAuth() {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = localStorage.getItem(SESSION_KEY);
    if (sessionId) {
      const clients = getClients();
      const found = clients.find(c => c.id === sessionId);
      if (found) setClient(found);
    }
    setLoading(false);
  }, []);

  const login = useCallback((email: string, password: string): { success: boolean; error?: string } => {
    const clients = getClients();
    const found = clients.find(c => c.email === email && c.password === password);
    if (!found) return { success: false, error: 'Invalid email or password' };
    localStorage.setItem(SESSION_KEY, found.id);
    setClient(found);
    return { success: true };
  }, []);

  const signup = useCallback((email: string, password: string, businessName: string): { success: boolean; error?: string } => {
    const clients = getClients();
    if (clients.find(c => c.email === email)) return { success: false, error: 'Email already exists' };
    const now = new Date().toISOString();
    const newClient: Client = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      email, password, businessName,
      subdomain: businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      plan: 'free', status: 'active',
      storefrontSettings: { storeName: businessName, tagline: 'Welcome to our store', primaryColor: '#3b82f6', secondaryColor: '#8b5cf6', currency: 'BDT' },
      shippingSettings: { flatRate: 60, freeShippingThreshold: 1000, deliveryAreas: ['Dhaka', 'Chittagong'], estimatedDeliveryTime: '3-5 business days' },
      paymentSettings: { cod: true, bkash: { enabled: false, merchantNumber: '' }, nagad: { enabled: false, merchantNumber: '' }, bankTransfer: { enabled: false, accountDetails: '' } },
      notifications: { emailNewOrder: true, emailLowStock: true, emailNewCustomer: true, emailNewMessage: true, smsNewOrder: false, smsLowStock: false, smsNewCustomer: false, smsNewMessage: false, notificationEmail: email },
      createdAt: now, updatedAt: now,
    };
    clients.push(newClient);
    saveClients(clients);
    localStorage.setItem(SESSION_KEY, newClient.id);
    setClient(newClient);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setClient(null);
  }, []);

  const updateClient = useCallback((updates: Partial<Client>) => {
    if (!client) return;
    const clients = getClients();
    const idx = clients.findIndex(c => c.id === client.id);
    if (idx !== -1) {
      clients[idx] = { ...clients[idx], ...updates, updatedAt: new Date().toISOString() };
      saveClients(clients);
      setClient(clients[idx]);
    }
  }, [client]);

  return { client, loading, login, signup, logout, updateClient };
}
