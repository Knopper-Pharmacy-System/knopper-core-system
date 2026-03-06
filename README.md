# knopper-core-system

This repository contains the backend and frontend systems for the Knopper Pharmacy project.

## Recent Updates

- **Branch Synchronization**: Successfully synced the local environment with the latest main branch changes from the Project Manager and established backend_v2 as the new active feature branch.
- **Gondola-Based Inventory Tracking**: Implemented specialized logic to track product quantities at the shelf level using specific gondola codes within each branch.
- **Automated Audit Logs**: Integrated an automated system that records every stock movement (such as additions or disposals) into a STOCK_ADJUSTMENTS table with timestamps and user IDs.
- **Product Search System**: Added a new search functionality that allows staff to quickly find products by name while filtering for items only available at their current branch.
- **Near-Expiry Reporting**: Developed a proactive monitoring route that flags all inventory items set to expire or already expired within a 30-day window.
- **Admin Audit Viewer**: Created a dedicated administrative route that provides a full history of stock adjustments across the system for better inventory oversight.
- **Security and Error Handling**: Updated the admin setup process with account activation flags and implemented database transaction rollbacks to prevent data corruption during errors.
