/**
 * Dynamic Firebase connections to individual client Firestores.
 * Master admin uses each client's stored Firebase config to initialize
 * a temporary Firebase app instance and write license data directly.
 */
import { initializeApp, deleteApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Firestore } from 'firebase/firestore';

export interface ClientFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  databaseURL?: string;
  measurementId?: string;
}

export interface LicenseData {
  paused: boolean;
  expiryDate: string;
  contactPhone: string;
  updatedAt: string;
}

// Cache of initialized client Firebase apps to avoid re-initialization
const clientApps: Map<string, FirebaseApp> = new Map();

/**
 * Parse env-style text into a Firebase config object.
 * Accepts lines like:
 *   FIREBASE_API_KEY=AIzaSyXXX
 *   FIREBASE_AUTH_DOMAIN=myapp.firebaseapp.com
 *   FIREBASE_PROJECT_ID=myapp-12345
 *   etc.
 * Also accepts NEXT_PUBLIC_ prefixed versions.
 */
export function parseFirebaseEnv(envText: string): ClientFirebaseConfig | null {
  const lines = envText.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  const vars: Record<string, string> = {};
  
  for (const line of lines) {
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;
    const key = line.substring(0, eqIndex).trim();
    let value = line.substring(eqIndex + 1).trim();
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }

  // Try multiple key formats
  const get = (keys: string[]): string => {
    for (const k of keys) {
      if (vars[k]) return vars[k];
    }
    return '';
  };

  const apiKey = get(['FIREBASE_API_KEY', 'NEXT_PUBLIC_FIREBASE_API_KEY', 'REACT_APP_FIREBASE_API_KEY']);
  const authDomain = get(['FIREBASE_AUTH_DOMAIN', 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'REACT_APP_FIREBASE_AUTH_DOMAIN']);
  const projectId = get(['FIREBASE_PROJECT_ID', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'REACT_APP_FIREBASE_PROJECT_ID']);
  const appId = get(['FIREBASE_APP_ID', 'NEXT_PUBLIC_FIREBASE_APP_ID', 'REACT_APP_FIREBASE_APP_ID']);

  if (!apiKey || !projectId) return null;

  return {
    apiKey,
    authDomain: authDomain || `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: get(['FIREBASE_STORAGE_BUCKET', 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'REACT_APP_FIREBASE_STORAGE_BUCKET']),
    messagingSenderId: get(['FIREBASE_MESSAGING_SENDER_ID', 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', 'REACT_APP_FIREBASE_MESSAGING_SENDER_ID']),
    appId,
    databaseURL: get(['FIREBASE_DATABASE_URL', 'NEXT_PUBLIC_FIREBASE_DATABASE_URL', 'REACT_APP_FIREBASE_DATABASE_URL']),
    measurementId: get(['FIREBASE_MEASUREMENT_ID', 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', 'REACT_APP_FIREBASE_MEASUREMENT_ID']),
  };
}

/**
 * Get or create a Firebase app instance for a specific client.
 */
function getClientApp(clientId: string, config: ClientFirebaseConfig): FirebaseApp {
  const appName = `client_${clientId}`;
  
  // Check our cache
  if (clientApps.has(appName)) {
    return clientApps.get(appName)!;
  }

  // Check if Firebase already has this app
  const existing = getApps().find(a => a.name === appName);
  if (existing) {
    clientApps.set(appName, existing);
    return existing;
  }

  // Initialize new app
  const app = initializeApp(config, appName);
  clientApps.set(appName, app);
  return app;
}

/**
 * Get a Firestore instance for a specific client.
 */
function getClientFirestore(clientId: string, config: ClientFirebaseConfig): Firestore {
  const app = getClientApp(clientId, config);
  return getFirestore(app);
}

/**
 * Write license/status data directly into a client's own Firestore.
 * Writes to: _ggly_license/status
 */
export async function writeClientLicense(
  clientId: string,
  config: ClientFirebaseConfig,
  data: LicenseData
): Promise<void> {
  const clientDb = getClientFirestore(clientId, config);
  await setDoc(doc(clientDb, '_ggly_license', 'status'), data);
}

/**
 * Clean up a client's Firebase app instance from cache.
 */
export async function cleanupClientApp(clientId: string): Promise<void> {
  const appName = `client_${clientId}`;
  const app = clientApps.get(appName);
  if (app) {
    await deleteApp(app);
    clientApps.delete(appName);
  }
}
