import { db } from './firebase';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch, query, where
} from 'firebase/firestore';
import type {
  Product, Order, Customer, Lead, Message, AutoResponse, Supplier,
  InventoryItem, AccountingEntry, DeliveryTracking, ProductReview, Category, Client
} from './types';

// ============================================
// Helper: get all docs from a subcollection
// ============================================
async function getAll<T>(path: string): Promise<T[]> {
  const snap = await getDocs(collection(db, path));
  return snap.docs.map(d => ({ ...d.data() } as T));
}

// Helper: get all docs from a subcollection under a client
async function getClientCol<T>(clientId: string, col: string): Promise<T[]> {
  return getAll<T>(`clients/${clientId}/${col}`);
}

// Helper: set a doc in a subcollection (uses item.id as doc ID)
async function setItem(clientId: string, col: string, item: { id: string;[key: string]: unknown }) {
  await setDoc(doc(db, `clients/${clientId}/${col}`, item.id), item);
}

// Helper: update a doc
async function patchItem(clientId: string, col: string, id: string, updates: Record<string, unknown>) {
  await updateDoc(doc(db, `clients/${clientId}/${col}`, id), updates);
}

// Helper: delete a doc
async function removeItem(clientId: string, col: string, id: string) {
  await deleteDoc(doc(db, `clients/${clientId}/${col}`, id));
}

// Helper: save an entire array as individual docs (batch write)
async function saveAll(clientId: string, col: string, items: { id: string;[key: string]: unknown }[]) {
  // Delete existing docs first, then write new ones
  const existing = await getDocs(collection(db, `clients/${clientId}/${col}`));
  const batch1 = writeBatch(db);
  existing.docs.forEach(d => batch1.delete(d.ref));
  await batch1.commit();

  // Write new docs in batches of 500 (Firestore limit)
  for (let i = 0; i < items.length; i += 500) {
    const batch = writeBatch(db);
    items.slice(i, i + 500).forEach(item => {
      batch.set(doc(db, `clients/${clientId}/${col}`, item.id), item);
    });
    await batch.commit();
  }
}

// Helper: get a single session ID for cart/spin (stored in localStorage)
function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let sid = localStorage.getItem('session_id');
  if (!sid) {
    sid = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('session_id', sid);
  }
  return sid;
}

// ============================================
// STORAGE — Async Firestore-backed
// ============================================
export const storage = {
  // ---- CLIENTS ----
  getClients: async (): Promise<Client[]> => {
    return getAll<Client>('clients');
  },
  saveClients: async (clients: Client[]) => {
    const batch = writeBatch(db);
    // Clear existing
    const snap = await getDocs(collection(db, 'clients'));
    snap.docs.forEach(d => batch.delete(d.ref));
    clients.forEach(c => batch.set(doc(db, 'clients', c.id), c));
    await batch.commit();
  },
  getClient: async (id: string): Promise<Client | undefined> => {
    const snap = await getDoc(doc(db, 'clients', id));
    return snap.exists() ? (snap.data() as Client) : undefined;
  },
  addClient: async (client: Client) => {
    await setDoc(doc(db, 'clients', client.id), client);
  },
  updateClientDoc: async (id: string, updates: Partial<Client>) => {
    await updateDoc(doc(db, 'clients', id), { ...updates, updatedAt: new Date().toISOString() });
  },

  // ---- PRODUCTS ----
  getProducts: async (clientId: string): Promise<Product[]> => {
    return getClientCol<Product>(clientId, 'products');
  },
  saveProducts: async (clientId: string, p: Product[]) => {
    await saveAll(clientId, 'products', p as unknown as { id: string;[key: string]: unknown }[]);
  },
  getProduct: async (clientId: string, id: string): Promise<Product | undefined> => {
    const snap = await getDoc(doc(db, `clients/${clientId}/products`, id));
    return snap.exists() ? (snap.data() as Product) : undefined;
  },
  addProduct: async (clientId: string, p: Product) => {
    await setItem(clientId, 'products', p as unknown as { id: string;[key: string]: unknown });
  },
  updateProduct: async (clientId: string, id: string, u: Partial<Product>) => {
    await patchItem(clientId, 'products', id, { ...u, updatedAt: new Date().toISOString() });
  },
  deleteProduct: async (clientId: string, id: string) => {
    await removeItem(clientId, 'products', id);
  },

  // ---- CATEGORIES ----
  getCategories: async (clientId: string): Promise<Category[]> => {
    return getClientCol<Category>(clientId, 'categories');
  },
  saveCategories: async (clientId: string, c: Category[]) => {
    await saveAll(clientId, 'categories', c as unknown as { id: string;[key: string]: unknown }[]);
  },
  addCategory: async (clientId: string, c: Category) => {
    await setItem(clientId, 'categories', c as unknown as { id: string;[key: string]: unknown });
  },
  updateCategory: async (clientId: string, id: string, u: Partial<Category>) => {
    await patchItem(clientId, 'categories', id, u);
  },
  deleteCategory: async (clientId: string, id: string) => {
    await removeItem(clientId, 'categories', id);
  },

  // ---- ORDERS ----
  getOrders: async (clientId: string): Promise<Order[]> => {
    return getClientCol<Order>(clientId, 'orders');
  },
  saveOrders: async (clientId: string, o: Order[]) => {
    await saveAll(clientId, 'orders', o as unknown as { id: string;[key: string]: unknown }[]);
  },
  getOrder: async (clientId: string, id: string): Promise<Order | undefined> => {
    const snap = await getDoc(doc(db, `clients/${clientId}/orders`, id));
    return snap.exists() ? (snap.data() as Order) : undefined;
  },
  addOrder: async (clientId: string, o: Order) => {
    await setItem(clientId, 'orders', o as unknown as { id: string;[key: string]: unknown });
  },
  updateOrder: async (clientId: string, id: string, u: Partial<Order>) => {
    await patchItem(clientId, 'orders', id, { ...u, updatedAt: new Date().toISOString() });
  },

  // ---- CUSTOMERS ----
  getCustomers: async (clientId: string): Promise<Customer[]> => {
    return getClientCol<Customer>(clientId, 'customers');
  },
  saveCustomers: async (clientId: string, c: Customer[]) => {
    await saveAll(clientId, 'customers', c as unknown as { id: string;[key: string]: unknown }[]);
  },
  addCustomer: async (clientId: string, c: Customer) => {
    await setItem(clientId, 'customers', c as unknown as { id: string;[key: string]: unknown });
  },
  updateCustomer: async (clientId: string, id: string, u: Partial<Customer>) => {
    await patchItem(clientId, 'customers', id, { ...u, updatedAt: new Date().toISOString() });
  },

  // ---- LEADS ----
  getLeads: async (clientId: string): Promise<Lead[]> => {
    return getClientCol<Lead>(clientId, 'leads');
  },
  saveLeads: async (clientId: string, l: Lead[]) => {
    await saveAll(clientId, 'leads', l as unknown as { id: string;[key: string]: unknown }[]);
  },
  addLead: async (clientId: string, l: Lead) => {
    await setItem(clientId, 'leads', l as unknown as { id: string;[key: string]: unknown });
  },
  updateLead: async (clientId: string, id: string, u: Partial<Lead>) => {
    await patchItem(clientId, 'leads', id, u);
  },

  // ---- MESSAGES ----
  getMessages: async (clientId: string): Promise<Message[]> => {
    return getClientCol<Message>(clientId, 'messages');
  },
  saveMessages: async (clientId: string, m: Message[]) => {
    await saveAll(clientId, 'messages', m as unknown as { id: string;[key: string]: unknown }[]);
  },
  addMessage: async (clientId: string, m: Message) => {
    await setItem(clientId, 'messages', m as unknown as { id: string;[key: string]: unknown });
  },
  markMessageRead: async (clientId: string, id: string) => {
    await patchItem(clientId, 'messages', id, { status: 'read', readAt: new Date().toISOString() });
  },

  // ---- AUTO RESPONSES ----
  getAutoResponses: async (clientId: string): Promise<AutoResponse[]> => {
    return getClientCol<AutoResponse>(clientId, 'autoResponses');
  },
  saveAutoResponses: async (clientId: string, a: AutoResponse[]) => {
    await saveAll(clientId, 'autoResponses', a as unknown as { id: string;[key: string]: unknown }[]);
  },
  addAutoResponse: async (clientId: string, a: AutoResponse) => {
    await setItem(clientId, 'autoResponses', a as unknown as { id: string;[key: string]: unknown });
  },

  // ---- SUPPLIERS ----
  getSuppliers: async (clientId: string): Promise<Supplier[]> => {
    return getClientCol<Supplier>(clientId, 'suppliers');
  },
  saveSuppliers: async (clientId: string, s: Supplier[]) => {
    await saveAll(clientId, 'suppliers', s as unknown as { id: string;[key: string]: unknown }[]);
  },
  addSupplier: async (clientId: string, s: Supplier) => {
    await setItem(clientId, 'suppliers', s as unknown as { id: string;[key: string]: unknown });
  },
  updateSupplier: async (clientId: string, id: string, u: Partial<Supplier>) => {
    await patchItem(clientId, 'suppliers', id, u);
  },
  deleteSupplier: async (clientId: string, id: string) => {
    await removeItem(clientId, 'suppliers', id);
  },

  // ---- INVENTORY ----
  getInventory: async (clientId: string): Promise<InventoryItem[]> => {
    return getClientCol<InventoryItem>(clientId, 'inventory');
  },
  saveInventory: async (clientId: string, inv: InventoryItem[]) => {
    await saveAll(clientId, 'inventory', inv as unknown as { id: string;[key: string]: unknown }[]);
  },
  addInventoryItem: async (clientId: string, item: InventoryItem) => {
    await setItem(clientId, 'inventory', item as unknown as { id: string;[key: string]: unknown });
  },
  updateInventoryItem: async (clientId: string, id: string, u: Partial<InventoryItem>) => {
    await patchItem(clientId, 'inventory', id, { ...u, updatedAt: new Date().toISOString() });
  },

  // ---- ACCOUNTING ----
  getAccountingEntries: async (clientId: string): Promise<AccountingEntry[]> => {
    return getClientCol<AccountingEntry>(clientId, 'accounting');
  },
  saveAccountingEntries: async (clientId: string, e: AccountingEntry[]) => {
    await saveAll(clientId, 'accounting', e as unknown as { id: string;[key: string]: unknown }[]);
  },
  addAccountingEntry: async (clientId: string, e: AccountingEntry) => {
    await setItem(clientId, 'accounting', e as unknown as { id: string;[key: string]: unknown });
  },
  deleteAccountingEntry: async (clientId: string, id: string) => {
    await removeItem(clientId, 'accounting', id);
  },

  // ---- DELIVERY TRACKING ----
  getDeliveryTrackings: async (clientId: string): Promise<DeliveryTracking[]> => {
    return getClientCol<DeliveryTracking>(clientId, 'delivery');
  },
  saveDeliveryTrackings: async (clientId: string, d: DeliveryTracking[]) => {
    await saveAll(clientId, 'delivery', d as unknown as { id: string;[key: string]: unknown }[]);
  },
  addDeliveryTracking: async (clientId: string, d: DeliveryTracking) => {
    await setItem(clientId, 'delivery', d as unknown as { id: string;[key: string]: unknown });
  },
  updateDeliveryTracking: async (clientId: string, id: string, u: Partial<DeliveryTracking>) => {
    await patchItem(clientId, 'delivery', id, { ...u, updatedAt: new Date().toISOString() });
  },

  // ---- REVIEWS ----
  getReviews: async (clientId: string): Promise<ProductReview[]> => {
    return getClientCol<ProductReview>(clientId, 'reviews');
  },
  saveReviews: async (clientId: string, r: ProductReview[]) => {
    await saveAll(clientId, 'reviews', r as unknown as { id: string;[key: string]: unknown }[]);
  },
  addReview: async (clientId: string, r: ProductReview) => {
    await setItem(clientId, 'reviews', r as unknown as { id: string;[key: string]: unknown });
  },

  // ---- CART (Firestore-backed, keyed by session) ----
  getCartItems: async (clientId: string): Promise<{ productId: string; productName: string; image?: string; variant?: Record<string, string>; price: number; quantity: number }[]> => {
    const sid = getSessionId();
    const snap = await getDoc(doc(db, `clients/${clientId}/carts`, sid));
    return snap.exists() ? (snap.data().items || []) : [];
  },
  saveCartItems: async (clientId: string, items: unknown[]) => {
    const sid = getSessionId();
    await setDoc(doc(db, `clients/${clientId}/carts`, sid), { items, updatedAt: new Date().toISOString() });
  },
  clearCartItems: async (clientId: string) => {
    const sid = getSessionId();
    await deleteDoc(doc(db, `clients/${clientId}/carts`, sid));
  },

  // ---- STOREFRONT CLIENT ID (Firestore) ----
  getCartClientId: async (): Promise<string> => {
    const snap = await getDoc(doc(db, 'storefrontConfig', 'default'));
    return snap.exists() ? (snap.data().clientId || '') : '';
  },
  setCartClientId: async (id: string) => {
    await setDoc(doc(db, 'storefrontConfig', 'default'), { clientId: id });
  },

  // ---- SPIN WHEEL (Firestore-backed, keyed by session) ----
  getSpinShown: async (clientId: string): Promise<boolean> => {
    const sid = getSessionId();
    const snap = await getDoc(doc(db, `clients/${clientId}/spinWheel`, sid));
    return snap.exists() ? (snap.data().played || false) : false;
  },
  setSpinShown: async (clientId: string) => {
    const sid = getSessionId();
    await setDoc(doc(db, `clients/${clientId}/spinWheel`, sid), { played: true, timestamp: new Date().toISOString() }, { merge: true });
  },
  getSpinDiscount: async (clientId: string): Promise<{ discount: number; type: string; expiresAt: number } | null> => {
    const sid = getSessionId();
    const snap = await getDoc(doc(db, `clients/${clientId}/spinWheel`, sid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return data.discountData || null;
  },
  setSpinDiscount: async (clientId: string, d: { discount: number; type: string; expiresAt: number }) => {
    const sid = getSessionId();
    await setDoc(doc(db, `clients/${clientId}/spinWheel`, sid), { discountData: d, played: true }, { merge: true });
  },
  clearSpinDiscount: async (clientId: string) => {
    const sid = getSessionId();
    await setDoc(doc(db, `clients/${clientId}/spinWheel`, sid), { discountData: null }, { merge: true });
  },

  // ---- UTILITY ----
  clearAll: async () => {
    // No-op for Firestore — don't accidentally wipe the database
  },
  exportAll: async (): Promise<string> => {
    // Export all clients and their subcollections
    const clients = await getAll<Client>('clients');
    const data: Record<string, unknown> = { clients };
    for (const c of clients) {
      const cid = c.id;
      data[`products_${cid}`] = await getClientCol(cid, 'products');
      data[`orders_${cid}`] = await getClientCol(cid, 'orders');
    }
    return JSON.stringify(data, null, 2);
  },
  importAll: async (_json: string) => {
    // Not implemented for Firestore — use Firebase console
  },
};
