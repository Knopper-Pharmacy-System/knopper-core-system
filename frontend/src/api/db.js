import Dexie from 'dexie';

// Define the local database for Knopper Pharmacy
export const db = new Dexie('KnopperOfflineDB');

// Structure: ++id (auto-increment), item name, quantity, and sync status
db.version(1).stores({
  inventory: '++id, name, qty, sync_status, timestamp'
});