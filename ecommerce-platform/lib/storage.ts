import type { Product, Order, Customer, Lead, Message, AutoResponse, Supplier, InventoryItem, AccountingEntry, DeliveryTracking, ProductReview, Category, Client } from './types';

function get<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : null; } catch { return null; }
}
function set(key: string, value: unknown) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* full */ } }

export const storage = {
  // CLIENTS
  getClients: (): Client[] => get<Client[]>('clients') || [],
  saveClients: (c: Client[]) => set('clients', c),
  getClient: (id: string): Client | undefined => (get<Client[]>('clients') || []).find(c => c.id === id),

  // PRODUCTS
  getProducts: (clientId: string): Product[] => get<Product[]>(`products_${clientId}`) || [],
  saveProducts: (clientId: string, p: Product[]) => set(`products_${clientId}`, p),
  getProduct: (clientId: string, id: string) => (get<Product[]>(`products_${clientId}`) || []).find(p => p.id === id),
  addProduct: (clientId: string, p: Product) => { const all = get<Product[]>(`products_${clientId}`) || []; all.push(p); set(`products_${clientId}`, all); },
  updateProduct: (clientId: string, id: string, u: Partial<Product>) => { const all = get<Product[]>(`products_${clientId}`) || []; const i = all.findIndex(p => p.id === id); if (i !== -1) { all[i] = { ...all[i], ...u, updatedAt: new Date().toISOString() }; set(`products_${clientId}`, all); } },
  deleteProduct: (clientId: string, id: string) => { const all = (get<Product[]>(`products_${clientId}`) || []).filter(p => p.id !== id); set(`products_${clientId}`, all); },

  // CATEGORIES
  getCategories: (clientId: string): Category[] => get<Category[]>(`categories_${clientId}`) || [],
  saveCategories: (clientId: string, c: Category[]) => set(`categories_${clientId}`, c),
  addCategory: (clientId: string, c: Category) => { const all = get<Category[]>(`categories_${clientId}`) || []; all.push(c); set(`categories_${clientId}`, all); },
  updateCategory: (clientId: string, id: string, u: Partial<Category>) => { const all = get<Category[]>(`categories_${clientId}`) || []; const i = all.findIndex(c => c.id === id); if (i !== -1) { all[i] = { ...all[i], ...u }; set(`categories_${clientId}`, all); } },
  deleteCategory: (clientId: string, id: string) => { set(`categories_${clientId}`, (get<Category[]>(`categories_${clientId}`) || []).filter(c => c.id !== id)); },

  // ORDERS
  getOrders: (clientId: string): Order[] => get<Order[]>(`orders_${clientId}`) || [],
  saveOrders: (clientId: string, o: Order[]) => set(`orders_${clientId}`, o),
  getOrder: (clientId: string, id: string) => (get<Order[]>(`orders_${clientId}`) || []).find(o => o.id === id),
  addOrder: (clientId: string, o: Order) => { const all = get<Order[]>(`orders_${clientId}`) || []; all.unshift(o); set(`orders_${clientId}`, all); },
  updateOrder: (clientId: string, id: string, u: Partial<Order>) => { const all = get<Order[]>(`orders_${clientId}`) || []; const i = all.findIndex(o => o.id === id); if (i !== -1) { all[i] = { ...all[i], ...u, updatedAt: new Date().toISOString() }; set(`orders_${clientId}`, all); } },

  // CUSTOMERS
  getCustomers: (clientId: string): Customer[] => get<Customer[]>(`customers_${clientId}`) || [],
  saveCustomers: (clientId: string, c: Customer[]) => set(`customers_${clientId}`, c),
  addCustomer: (clientId: string, c: Customer) => { const all = get<Customer[]>(`customers_${clientId}`) || []; all.push(c); set(`customers_${clientId}`, all); },
  updateCustomer: (clientId: string, id: string, u: Partial<Customer>) => { const all = get<Customer[]>(`customers_${clientId}`) || []; const i = all.findIndex(c => c.id === id); if (i !== -1) { all[i] = { ...all[i], ...u, updatedAt: new Date().toISOString() }; set(`customers_${clientId}`, all); } },

  // LEADS
  getLeads: (clientId: string): Lead[] => get<Lead[]>(`leads_${clientId}`) || [],
  saveLeads: (clientId: string, l: Lead[]) => set(`leads_${clientId}`, l),
  addLead: (clientId: string, l: Lead) => { const all = get<Lead[]>(`leads_${clientId}`) || []; all.push(l); set(`leads_${clientId}`, all); },
  updateLead: (clientId: string, id: string, u: Partial<Lead>) => { const all = get<Lead[]>(`leads_${clientId}`) || []; const i = all.findIndex(l => l.id === id); if (i !== -1) { all[i] = { ...all[i], ...u }; set(`leads_${clientId}`, all); } },

  // MESSAGES
  getMessages: (clientId: string): Message[] => get<Message[]>(`messages_${clientId}`) || [],
  saveMessages: (clientId: string, m: Message[]) => set(`messages_${clientId}`, m),
  addMessage: (clientId: string, m: Message) => { const all = get<Message[]>(`messages_${clientId}`) || []; all.unshift(m); set(`messages_${clientId}`, all); },
  markMessageRead: (clientId: string, id: string) => { const all = get<Message[]>(`messages_${clientId}`) || []; const m = all.find(x => x.id === id); if (m) { m.status = 'read'; m.readAt = new Date().toISOString(); set(`messages_${clientId}`, all); } },

  // AUTO RESPONSES
  getAutoResponses: (clientId: string): AutoResponse[] => get<AutoResponse[]>(`auto_responses_${clientId}`) || [],
  saveAutoResponses: (clientId: string, a: AutoResponse[]) => set(`auto_responses_${clientId}`, a),
  addAutoResponse: (clientId: string, a: AutoResponse) => { const all = get<AutoResponse[]>(`auto_responses_${clientId}`) || []; all.push(a); set(`auto_responses_${clientId}`, all); },

  // SUPPLIERS
  getSuppliers: (clientId: string): Supplier[] => get<Supplier[]>(`suppliers_${clientId}`) || [],
  saveSuppliers: (clientId: string, s: Supplier[]) => set(`suppliers_${clientId}`, s),
  addSupplier: (clientId: string, s: Supplier) => { const all = get<Supplier[]>(`suppliers_${clientId}`) || []; all.push(s); set(`suppliers_${clientId}`, all); },
  updateSupplier: (clientId: string, id: string, u: Partial<Supplier>) => { const all = get<Supplier[]>(`suppliers_${clientId}`) || []; const i = all.findIndex(s => s.id === id); if (i !== -1) { all[i] = { ...all[i], ...u }; set(`suppliers_${clientId}`, all); } },
  deleteSupplier: (clientId: string, id: string) => { set(`suppliers_${clientId}`, (get<Supplier[]>(`suppliers_${clientId}`) || []).filter(s => s.id !== id)); },

  // INVENTORY
  getInventory: (clientId: string): InventoryItem[] => get<InventoryItem[]>(`inventory_${clientId}`) || [],
  saveInventory: (clientId: string, inv: InventoryItem[]) => set(`inventory_${clientId}`, inv),
  addInventoryItem: (clientId: string, item: InventoryItem) => { const all = get<InventoryItem[]>(`inventory_${clientId}`) || []; all.push(item); set(`inventory_${clientId}`, all); },
  updateInventoryItem: (clientId: string, id: string, u: Partial<InventoryItem>) => { const all = get<InventoryItem[]>(`inventory_${clientId}`) || []; const i = all.findIndex(x => x.id === id); if (i !== -1) { all[i] = { ...all[i], ...u, updatedAt: new Date().toISOString() }; set(`inventory_${clientId}`, all); } },

  // ACCOUNTING
  getAccountingEntries: (clientId: string): AccountingEntry[] => get<AccountingEntry[]>(`accounting_${clientId}`) || [],
  saveAccountingEntries: (clientId: string, e: AccountingEntry[]) => set(`accounting_${clientId}`, e),
  addAccountingEntry: (clientId: string, e: AccountingEntry) => { const all = get<AccountingEntry[]>(`accounting_${clientId}`) || []; all.unshift(e); set(`accounting_${clientId}`, all); },
  deleteAccountingEntry: (clientId: string, id: string) => { set(`accounting_${clientId}`, (get<AccountingEntry[]>(`accounting_${clientId}`) || []).filter(e => e.id !== id)); },

  // DELIVERY TRACKING
  getDeliveryTrackings: (clientId: string): DeliveryTracking[] => get<DeliveryTracking[]>(`delivery_${clientId}`) || [],
  saveDeliveryTrackings: (clientId: string, d: DeliveryTracking[]) => set(`delivery_${clientId}`, d),
  addDeliveryTracking: (clientId: string, d: DeliveryTracking) => { const all = get<DeliveryTracking[]>(`delivery_${clientId}`) || []; all.push(d); set(`delivery_${clientId}`, all); },
  updateDeliveryTracking: (clientId: string, id: string, u: Partial<DeliveryTracking>) => { const all = get<DeliveryTracking[]>(`delivery_${clientId}`) || []; const i = all.findIndex(d => d.id === id); if (i !== -1) { all[i] = { ...all[i], ...u, updatedAt: new Date().toISOString() }; set(`delivery_${clientId}`, all); } },

  // REVIEWS
  getReviews: (clientId: string): ProductReview[] => get<ProductReview[]>(`reviews_${clientId}`) || [],
  saveReviews: (clientId: string, r: ProductReview[]) => set(`reviews_${clientId}`, r),
  addReview: (clientId: string, r: ProductReview) => { const all = get<ProductReview[]>(`reviews_${clientId}`) || []; all.unshift(r); set(`reviews_${clientId}`, all); },

  // CART (storefront)
  getCartClientId: (): string => get<string>('storefront_client_id') || '',
  setCartClientId: (id: string) => set('storefront_client_id', id),

  // SPIN WHEEL
  getSpinShown: (): boolean => get<boolean>('spin_wheel_shown') || false,
  setSpinShown: () => set('spin_wheel_shown', true),
  getSpinDiscount: () => get<{ discount: number; type: string; expiresAt: number }>('spin_discount'),
  setSpinDiscount: (d: { discount: number; type: string; expiresAt: number }) => set('spin_discount', d),
  clearSpinDiscount: () => { try { localStorage.removeItem('spin_discount'); } catch {/* */} },

  // UTILITY
  clearAll: () => { if (typeof window !== 'undefined') localStorage.clear(); },
  exportAll: (): string => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) { try { data[k] = JSON.parse(localStorage.getItem(k)!); } catch { data[k] = localStorage.getItem(k); } }
    }
    return JSON.stringify(data, null, 2);
  },
  importAll: (json: string) => {
    const data = JSON.parse(json);
    Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)));
  },
};
