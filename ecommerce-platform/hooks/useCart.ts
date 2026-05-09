'use client';
import { useState, useEffect, useCallback } from 'react';
import type { CartItem } from '@/lib/types';

const CART_KEY = 'cart_items';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      setItems(saved);
    } catch { setItems([]); }
    setLoaded(true);
  }, []);

  const save = useCallback((newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem(CART_KEY, JSON.stringify(newItems));
  }, []);

  const addItem = useCallback((item: CartItem) => {
    const current = JSON.parse(localStorage.getItem(CART_KEY) || '[]') as CartItem[];
    const variantKey = item.variant ? JSON.stringify(item.variant) : '';
    const existing = current.findIndex(i => i.productId === item.productId && (i.variant ? JSON.stringify(i.variant) : '') === variantKey);
    if (existing !== -1) {
      current[existing].quantity += item.quantity;
    } else {
      current.push(item);
    }
    save(current);
  }, [save]);

  const removeItem = useCallback((productId: string, variant?: Record<string, string>) => {
    const current = JSON.parse(localStorage.getItem(CART_KEY) || '[]') as CartItem[];
    const variantKey = variant ? JSON.stringify(variant) : '';
    const filtered = current.filter(i => !(i.productId === productId && (i.variant ? JSON.stringify(i.variant) : '') === variantKey));
    save(filtered);
  }, [save]);

  const updateQuantity = useCallback((productId: string, quantity: number, variant?: Record<string, string>) => {
    const current = JSON.parse(localStorage.getItem(CART_KEY) || '[]') as CartItem[];
    const variantKey = variant ? JSON.stringify(variant) : '';
    const idx = current.findIndex(i => i.productId === productId && (i.variant ? JSON.stringify(i.variant) : '') === variantKey);
    if (idx !== -1) {
      if (quantity <= 0) { current.splice(idx, 1); }
      else { current[idx].quantity = quantity; }
    }
    save(current);
  }, [save]);

  const clearCart = useCallback(() => { save([]); }, [save]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, subtotal, itemCount, loaded };
}
