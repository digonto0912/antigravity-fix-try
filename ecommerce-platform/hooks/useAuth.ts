'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Client } from '@/lib/types';
import { storage } from '@/lib/storage';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

const SESSION_KEY = 'auth_session';

export function useAuth() {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (typeof window === 'undefined') { setLoading(false); return; }
      const sessionId = localStorage.getItem(SESSION_KEY);
      if (sessionId) {
        const found = await storage.getClient(sessionId);
        if (found) setClient(found);
      }
      setLoading(false);
    };
    init();

    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !localStorage.getItem(SESSION_KEY)) {
        // User signed in via Google but no session — find or create client
        const clients = await storage.getClients();
        const found = clients.find(c => c.email === user.email);
        if (found) {
          localStorage.setItem(SESSION_KEY, found.id);
          setClient(found);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const clients = await storage.getClients();
    const found = clients.find(c => c.email === email && c.password === password);
    if (!found) return { success: false, error: 'Invalid email or password' };
    localStorage.setItem(SESSION_KEY, found.id);
    setClient(found);
    return { success: true };
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const email = user.email || '';

      // Check if client exists for this email
      const clients = await storage.getClients();
      const existing = clients.find(c => c.email === email);

      if (existing) {
        localStorage.setItem(SESSION_KEY, existing.id);
        setClient(existing);
        return { success: true };
      }

      // Create new client from Google profile
      const now = new Date().toISOString();
      const businessName = user.displayName || 'My Store';
      const newClient: Client = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        email,
        password: '', // No password for Google auth users
        businessName,
        subdomain: businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        plan: 'free',
        status: 'active',
        logo: user.photoURL || undefined,
        storefrontSettings: {
          storeName: businessName,
          tagline: 'Welcome to our store',
          primaryColor: '#3b82f6',
          secondaryColor: '#8b5cf6',
          currency: 'BDT',
        },
        shippingSettings: {
          flatRate: 60,
          freeShippingThreshold: 1000,
          deliveryAreas: ['Dhaka', 'Chittagong'],
          estimatedDeliveryTime: '3-5 business days',
        },
        paymentSettings: {
          cod: true,
          bkash: { enabled: false, merchantNumber: '' },
          nagad: { enabled: false, merchantNumber: '' },
          bankTransfer: { enabled: false, accountDetails: '' },
        },
        notifications: {
          emailNewOrder: true, emailLowStock: true,
          emailNewCustomer: true, emailNewMessage: true,
          smsNewOrder: false, smsLowStock: false,
          smsNewCustomer: false, smsNewMessage: false,
          notificationEmail: email,
        },
        createdAt: now, updatedAt: now,
      };
      await storage.addClient(newClient);
      localStorage.setItem(SESSION_KEY, newClient.id);
      setClient(newClient);
      return { success: true };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Google sign-in failed';
      console.error('Google sign-in error:', error);
      return { success: false, error: msg };
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, businessName: string): Promise<{ success: boolean; error?: string }> => {
    const clients = await storage.getClients();
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
    await storage.addClient(newClient);
    localStorage.setItem(SESSION_KEY, newClient.id);
    setClient(newClient);
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(SESSION_KEY);
    setClient(null);
    try { await firebaseSignOut(auth); } catch { /* ignore */ }
  }, []);

  const updateClient = useCallback(async (updates: Partial<Client>) => {
    if (!client) return;
    await storage.updateClientDoc(client.id, updates);
    const refreshed = await storage.getClient(client.id);
    if (refreshed) setClient(refreshed);
  }, [client]);

  return { client, loading, login, loginWithGoogle, signup, logout, updateClient };
}
