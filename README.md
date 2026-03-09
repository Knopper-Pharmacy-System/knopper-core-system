**Knopper POS & Inventory Management System (Backend)**

https://web-production-2c7737.up.railway.app

A robust, enterprise-grade RESTful API designed to power the Knopper POS & Inventory Management System. This backend handles complex inventory tracking, branch-to-branch transfers, procurement workflows, and secure Point-of-Sale (POS) transactions.

**Key Features**
- **Security & User Management**
    Role-Based Access Control (RBAC): Distinct permissions for Admin, Manager, and Staff.
    JWT Authentication: Secure stateless authentication using flask-jwt-extended.
    Bcrypt Hashing: Industry-standard password encryption.
- **Inventory & Product Tracking**
    Multi-Branch Support: Tracks stock levels across different geographical locations.
    Shelf Management: Organize products by Gondola/Shelf codes.
    Expiry Monitoring: Automated tracking of near-expiry products (30-day window).
    Audit Logging: Comprehensive logs for every stock movement.
- **Procurement Workflow**
    Purchase Order Lifecycle: Manage POs from DRAFT → APPROVED → SENT → RECEIVED or CANCELLED.
    Auto-Fulfillment: Smart delivery recording with automatic item fetching and status validation.
    Vendor Tracking: centralized management of suppliers and costs.
- **Point of Sale (POS)**
    Real-time Checkout: Seamless transaction processing with automatic stock deduction.
    Transaction History: Secure storage of sales data for reporting.
