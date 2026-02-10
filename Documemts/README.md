# Inventory & Asset Management System

## Problem Statement
Small businesses often struggle to track their assets and inventory efficiently, relying on manual processes that are error-prone and time-consuming. This lack of visibility leads to stockouts, overstocking, and lost assets.

## Business Goals
*   **Efficiency**: Streamline inventory tracking to save time.
*   **Accuracy**: Reduce human error in stock counts.
*   **Visibility**: Provide real-time insights into stock levels.

## Target Users and Roles
*   **Business Owner**: View high-level insights and performance.
*   **Store Manager/Staff**: Manage day-to-day inventory, stock updates, and alerts.

## Core Features (MVP)
1.  **Inventory Management**: Add, update, and categorize inventory items.
2.  **Stock Operations**: Record Stock In (purchases/returns) and Stock Out (sales/usage) transactions.
3.  **Real-time Dashboard**: Overview of total items, low stock counts, and recent activity.
4.  **Low Stock Alerts**: Visual indicators when items fall below a defined threshold.

## Out-of-Scope Features
*   Enterprise-grade features (e.g., barcode scanning integrations, complex supply chain management).
*   Billing, Invoicing, and Payment Gateway integration.
*   Multi-warehouse or multi-location support.
*   User Role Management (RBAC) - Single generic admin/staff role assumed for MVP.

## Assumptions and Constraints
*   **Hackathon Scale**: Focused on core functionality over comprehensive edge-case handling.
*   **Manual Entry**: Data input will be primarily manual for this iteration.
*   **Single Currency**: System assumes a single currency for values.
*   **Web-Based Access**: Designed for access via standard web browsers.

## High-Level User Journey
1.  **Access**: User accesses the system dashboard to see a snapshot of current inventory health.
2.  **Item Creation**: User defines new inventory items with basic details (name, description, threshold).
3.  **Stock Management**: User records "Stock In" when supplies arrive and "Stock Out" when items are sold or used.
4.  **Monitoring**: System automatically updates counts and highlights items nearing low stock logic.
5.  **Alerts**: User sees alerts for critical items and takes action to restock.
