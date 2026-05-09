'use client';
import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/lib/storage';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import type { Customer } from '@/lib/types';
import { generateId } from '@/lib/utils';

const CUSTOMER_SESSION_KEY = 'customer_session';

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
}

/**
 * useCustomerAuth — Auth hook for STOREFRONT customers (buyers).
 * Separate from useAuth which is for ADMIN (store owners).
 * Customers sign in via Google on the storefront navbar.
 * Their data is stored as Customer documents under the store's clientId.
 */
export function useCustomerAuth() {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (typeof window === 'undefined') { setLoading(false); return; }
      const sessionData = localStorage.getItem(CUSTOMER_SESSION_KEY);
      if (sessionData) {
        try {
          setCustomer(JSON.parse(sessionData));
        } catch { /* ignore */ }
      }
      setLoading(false);
    };
    init();
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const email = user.email || '';
      const name = user.displayName || 'Customer';
      const photo = user.photoURL || undefined;

      // Get the store's client ID (the admin's store)
      const cid = await storage.getCartClientId();
      if (!cid) return { success: false, error: 'Store not configured' };

      // Check if customer already exists for this store
      const customers = await storage.getCustomers(cid);
      const existing = customers.find(c => c.email === email);

      let customerUser: CustomerUser;

      if (existing) {
        customerUser = {
          id: existing.id,
          name: existing.name,
          email: existing.email || email,
          phone: existing.phone || '',
          photo,
        };
      } else {
        // Create new customer under the store's clientId
        const newCustomer: Customer = {
          id: generateId(),
          clientId: cid,
          name,
          phone: '',
          email,
          addresses: [],
          totalOrders: 0,
          totalSpent: 0,
          loyaltyPoints: 0,
          loyaltyHistory: [],
          tags: ['Google Sign-In'],
          notes: `Signed up via Google on ${new Date().toLocaleDateString()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await storage.addCustomer(cid, newCustomer);

        customerUser = {
          id: newCustomer.id,
          name,
          email,
          phone: '',
          photo,
        };
      }

      localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(customerUser));
      setCustomer(customerUser);
      setShowLoginModal(false);
      return { success: true };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Sign-in failed';
      console.error('Customer Google sign-in error:', error);
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(CUSTOMER_SESSION_KEY);
    setCustomer(null);
    try { await firebaseSignOut(auth); } catch { /* ignore */ }
  }, []);

  return {
    customer,
    loading,
    loginWithGoogle,
    logout,
    showLoginModal,
    setShowLoginModal,
  };
}
