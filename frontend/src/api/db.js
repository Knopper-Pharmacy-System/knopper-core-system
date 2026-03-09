import Dexie from 'dexie';

// Define the local database for Knopper Pharmacy
export const db = new Dexie('KnopperOfflineDB');

// Structure: ++id (auto-increment), item name, quantity, price, and sync status
db.version(1).stores({
  inventory: '++id, name, qty, sync_status, timestamp'
});

db.version(2).stores({
  inventory: '++id, name, qty, price, sync_status, timestamp'
});

db.version(3).stores({
  inventory: '++id, name, code, qty, price, unit, gondola, sync_status, timestamp'  //this is for search inventory on the pos screen
}).upgrade((tx) => tx.table('inventory').clear());