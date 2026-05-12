/**
 * Master Admin Firestore CRUD operations.
 * Manages the master_clients registry and master_settings.
 */
import { db } from './firebase';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch, query, orderBy, limit, startAfter, where, getCountFromServer
} from 'firebase/firestore';
import { Client, ClientStatus, MasterSettings } from '../types';

const CLIENTS_COL = 'master_clients';
const SETTINGS_COL = 'master_settings';
const SETTINGS_DOC = 'global';

// ============================================
// CLIENTS CRUD
// ============================================

export async function getClients(): Promise<Client[]> {
  const snap = await getDocs(collection(db, CLIENTS_COL));
  return snap.docs.map(d => ({ ...d.data() } as Client));
}

export async function getClientsPaginated(
  pageSize: number,
  lastDoc?: any,
  searchTerm?: string,
  statusFilter?: ClientStatus | 'all'
): Promise<{ clients: Client[]; lastVisible: any }> {
  let q;
  const col = collection(db, CLIENTS_COL);

  // Basic query with ordering
  if (lastDoc) {
    q = query(col, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(pageSize));
  } else {
    q = query(col, orderBy('createdAt', 'desc'), limit(pageSize));
  }

  const snap = await getDocs(q);
  let clients = snap.docs.map(d => ({ ...d.data() } as Client));

  // Client-side filtering (Firestore doesn't support LIKE queries)
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    clients = clients.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.domain.toLowerCase().includes(term) ||
      c.colabGmail.toLowerCase().includes(term)
    );
  }

  if (statusFilter && statusFilter !== 'all') {
    clients = clients.filter(c => c.status === statusFilter);
  }

  const lastVisible = snap.docs[snap.docs.length - 1] || null;
  return { clients, lastVisible };
}

export async function getClient(id: string): Promise<Client | null> {
  const snap = await getDoc(doc(db, CLIENTS_COL, id));
  return snap.exists() ? (snap.data() as Client) : null;
}

export async function addClient(client: Client): Promise<void> {
  await setDoc(doc(db, CLIENTS_COL, client.id), client);
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<void> {
  await updateDoc(doc(db, CLIENTS_COL, id), { ...updates, updatedAt: new Date().toISOString() });
}

export async function deleteClient(id: string): Promise<void> {
  await deleteDoc(doc(db, CLIENTS_COL, id));
}

export async function getClientStats(): Promise<{ total: number; active: number; paused: number; expired: number }> {
  const clients = await getClients();
  return {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    paused: clients.filter(c => c.status === 'paused').length,
    expired: clients.filter(c => c.status === 'expired').length,
  };
}

// ============================================
// SETTINGS
// ============================================

export async function getSettings(): Promise<MasterSettings> {
  const snap = await getDoc(doc(db, SETTINGS_COL, SETTINGS_DOC));
  if (snap.exists()) return snap.data() as MasterSettings;
  // Return defaults
  return { contactPhone: '', updatedAt: new Date().toISOString() };
}

export async function updateSettings(updates: Partial<MasterSettings>): Promise<void> {
  await setDoc(doc(db, SETTINGS_COL, SETTINGS_DOC), {
    ...updates,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}
