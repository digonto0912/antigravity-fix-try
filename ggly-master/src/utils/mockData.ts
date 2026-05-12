import { Client, ClientStatus } from '../types';

const STATUSES: ClientStatus[] = ['active', 'active', 'active', 'inactive', 'expired'];

export const generateMockClients = (count: number): Client[] => {
  return Array.from({ length: count }, (_, i) => {
    const id = `cli_${i + 1}`;
    const name = `Client ${i + 1}`;
    const domain = `client${i + 1}.com`;
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const gmail = `user${i + 1}@gmail.com`;
    const envConfig = `# Environment Config for ${domain}
FIREBASE_API_KEY=AIzaSy${Math.random().toString(36).substring(7)}
MONGODB_URI=mongodb+srv://user${i + 1}:pass${i + 1}@cluster0.mongodb.net
IMAGE_DB_KEY=img_${Math.random().toString(36).substring(7)}
GITHUB_REPO=github.com/user${i + 1}/site
VERCEL_URL=project-${i + 1}.vercel.app
APP_STATUS=true`;

    return {
      id,
      name,
      domain,
      status,
      lastSync: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      expiryDate: new Date(Date.now() + (Math.random() * 365 * 86400000)).toISOString().split('T')[0],
      envConfig,
      colabGmail: gmail,
    };
  });
};
