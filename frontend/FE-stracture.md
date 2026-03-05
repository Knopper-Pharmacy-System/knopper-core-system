# Frontend — Folder Structure Guide

This document describes the structure and purpose of every directory and key file in the `frontend/` source tree. The frontend is a **React + Vite PWA** that supports both online and offline (brownout) operation.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI library |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing with role-based guards |
| Dexie.js (IndexedDB) | Offline-first local database for POS brownout mode |
| Axios | HTTP client with auth interceptors |
| Vite PWA Plugin | Service worker generation, offline caching |

---

## Role Overview

| Role | Accessible Modules |
|---|---|
| 👤 **Cashier / Staff** | POS |
| 📦 **Manager / Admin** | POS, Inventory, Procurement |
| 📊 **Owner / Admin** | Analytics, all Manager views |

---

## Directory Tree

```
frontend/
├── public/                   # Static assets served at root (logo, manifest, icons)
│
├── src/
│   │
│   ├── api/                  # All data-access logic — HTTP and offline DB
│   │   ├── db.js             # Dexie.js schema — local IndexedDB for offline POS / brownout mode
│   │   ├── syncUtils.js      # Syncs queued offline sales to the backend when connectivity is restored
│   │   └── axiosClient.js    # Pre-configured Axios instance with base URL, auth token interceptors, and error handling
│   │
│   ├── assets/               # Shared static resources
│   │                         #   → images, SVG icons, global stylesheet overrides
│   │
│   ├── components/           # Generic, reusable UI components (no business logic)
│   │   ├── layout/           # Role-aware page shells
│   │   │   ├── POSLayout.jsx       # Minimal layout for cashier POS screen
│   │   │   └── AdminLayout.jsx     # Sidebar + header shell for manager/owner views
│   │   └── ui/               # Atomic UI elements: buttons, modals, badges, toasts, etc.
│   │
│   ├── features/             # Feature modules — each maps to a business domain and user role
│   │   │
│   │   ├── auth/             # 🔐 Authentication (all roles)
│   │   │   ├── LoginPage.jsx       # Login form with credential validation
│   │   │   └── components/         # Supporting auth UI (role redirect, session timeout modal)
│   │   │
│   │   ├── pos/              # 🛒 Point of Sale — CASHIER / STAFF role
│   │   │   ├── POSPage.jsx         # Main POS view — detects network state and switches to offline mode
│   │   │   └── components/         # Quick-sale panel, product search, barcode scanner mockup, cart summary
│   │   │
│   │   ├── inventory/        # 📦 Inventory Management — MANAGER / ADMIN role
│   │   │   ├── InventoryDashboard.jsx   # Overview of all stock levels across locations
│   │   │   └── components/         # Stock tables, low-stock alerts, item detail drawer
│   │   │
│   │   ├── procurement/      # 📝 Procurement — MANAGER / ADMIN role
│   │   │   ├── ProcurementDashboard.jsx # Purchase order management and supplier tracking
│   │   │   └── components/         # Supplier directory, PO creation form, order status timeline
│   │   │
│   │   └── analytics/        # 📊 Analytics & Reports — OWNER role / ADMIN role
│   │       ├── ReportsDashboard.jsx     # High-level sales and revenue overview
│   │       └── components/         # Charts, date range pickers, branch comparison tables
│   │
│   ├── hooks/                # Custom React hooks (shared across features)
│   │   ├── useAuth.js              # Returns current user, role, and auth helpers
│   │   └── useNetworkStatus.js     # Detects online/offline state, triggers sync on reconnect
│   │
│   ├── context/              # React context providers (global state)
│   │   ├── AuthProvider.jsx        # Manages auth session, token storage, and role propagation
│   │   └── CartProvider.jsx        # POS cart state — persists to IndexedDB in offline mode
│   │
│   ├── App.jsx               # Root component — React Router setup with role-protected routes
│   └── main.jsx              # Application entry point — mounts React root, registers service worker
│
├── index.html                # Vite HTML template (root mount point)
├── vite.config.js            # Vite + PWA plugin configuration (caching strategies, SW settings)
└── package.json              # Frontend dependencies and scripts
```

---

## Key Patterns

### Offline / Brownout POS
The POS feature is designed to work without a backend connection. Sales are saved to IndexedDB via `api/db.js` and queued for upload. The `useNetworkStatus` hook watches connectivity and triggers `syncUtils.js` to flush the queue when the connection is restored.

### Role-Based Routing
`App.jsx` wraps routes in a role guard that reads from `AuthProvider`. Attempting to access a route above your role level redirects to the appropriate fallback page.

### Feature Module Convention
Each feature under `features/` follows the same pattern:
```
features/<domain>/
├── <Domain>Page.jsx      # Route-level page component
└── components/           # Domain-specific sub-components (not shared globally)
```
Shared, reusable components live in `components/ui/` or `components/layout/` instead.