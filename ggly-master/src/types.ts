export type ClientStatus = 'active' | 'inactive' | 'expired';

export interface Client {
  id: string;
  name: string;
  domain: string;
  status: ClientStatus;
  lastSync: string;
  expiryDate: string;
  envConfig: string; // The "Code Canvas" content
  colabGmail: string;
}
