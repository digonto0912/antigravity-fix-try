import { ClientFirebaseConfig } from './lib/clientFirebase';

export type ClientStatus = 'active' | 'paused' | 'expired';

export interface Client {
  id: string;
  name: string;
  domain: string;
  colabGmail: string;
  envConfig: string;           // Raw env text (the code canvas content)
  firebaseConfig: ClientFirebaseConfig | null; // Parsed from envConfig
  status: ClientStatus;
  expiryDate: string;          // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface MasterSettings {
  contactPhone: string;
  updatedAt: string;
}
