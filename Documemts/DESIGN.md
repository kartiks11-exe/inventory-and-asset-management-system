# Module & Design Specification (C3)

## 1. Backend API Design
The backend exposes a RESTful API to manage inventory and stock operations.

### A. Inventory Controller
**Base Route**: `/api/inventory`

*   **GET** `/`
    *   **Purpose**: Retrieve all inventory items.
    *   **Response**: `200 OK`
        ```json
        [
          {
            "id": 1,
            "name": "Laptop",
            "description": "Dell XPS 15",
            "quantity": 10,
            "lowStockThreshold": 5,
            "isLowStock": false // Computed at runtime: Quantity <= LowStockThreshold
          }
        ]
        ```

*   **POST** `/`
    *   **Purpose**: Create a new inventory item.
    *   **Request**:
        ```json
        {
          "name": "Mouse",
          "description": "Wireless Optical",
          "lowStockThreshold": 10
        }
        ```
    *   **Response**: `201 Created` (returns created Item object)

*   **PUT** `/{id}`
    *   **Purpose**: Update item details (name, description, threshold).
    *   **Response**: `200 OK`

*   **DELETE** `/{id}`
    *   **Purpose**: Delete an inventory item.
    *   **Constraint**: Item can ONLY be deleted if `Quantity == 0`.
    *   **Response**: `204 No Content`

### B. Stock Controller
**Base Route**: `/api/stock`

*   **POST** `/in`
    *   **Purpose**: Add stock to an existing item.
    *   **Request**:
        ```json
        {
          "itemId": 1,
          "quantity": 50,
          "notes": "Weekly supply"
        }
        ```
    *   **Response**: `200 OK` (returns updated Item quantity)

*   **POST** `/out`
    *   **Purpose**: Remove stock (sale/usage).
    *   **Request**:
        ```json
        {
          "itemId": 1,
          "quantity": 2,
          "notes": "Sold to Customer A"
        }
        ```
    *   **Response**: `200 OK`

### C. Dashboard Controller
**Base Route**: `/api/dashboard`

*   **GET** `/summary`
    *   **Purpose**: Get high-level stats.
    *   **Response**: `200 OK`
        ```json
        {
          "totalItems": 150,
          "lowStockCount": 3,
          "recentTransactions": [...] // Top 5 transactions ordered by TransactionDate DESC
        }
        ```

## 2. Business Logic Rules
### Stock Operations
*   **Atomic Transactions**: Any stock update (In/Out) AND the corresponding `StockTransactions` record creation MUST occur within a single atomic database transaction. If one fails, both must roll back.
*   **Stock In**:
    *   Input quantity must be > 0.
    *   Increases the `Quantity` of the target item.
*   **Stock Out**:
    *   Input quantity must be > 0.
    *   **Constraint**: Cannot process if `Input Quantity > Current Quantity` (Prevent Negative Stock).
    *   Decreases the `Quantity` of the target item.

### Alerts & Validations
*   **Low Stock Evaluation (Derived Propery)**:
    *   `IsLowStock` is NOT stored in the database.
    *   It is calculated at runtime as: `IsLowStock = Quantity <= LowStockThreshold`.
*   **Inventory Deletion**:
    *   Items cannot be deleted if they have remaining stock (Quantity > 0).
*   **Unique Names**: Inventory item names should be unique to avoid confusion.

## 3. Database Design
### Table: InventoryItems
| Field | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | INT | PK, Auto Inc | Unique identifier |
| `Name` | VARCHAR(100) | Not Null, Unique | Item name |
| `Description` | VARCHAR(255) | Nullable | Optional details |
| `Quantity` | INT | Default 0 | Current stock count |
| `LowStockThreshold` | INT | Default 5 | Alert trigger level |
| `LastUpdated` | DATETIME | Not Null | Timestamp of last change |

### Table: StockTransactions
| Field | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `Id` | INT | PK, Auto Inc | Unique identifier |
| `ItemId` | INT | FK -> InventoryItems | Related item |
| `TransactionType` | VARCHAR(10) | 'IN' or 'OUT' | Type of movement |
| `Quantity` | INT | Not Null, > 0 | Amount moved |
| `TransactionDate` | DATETIME | Default GetDate() | When it happened |
| `Notes` | VARCHAR(200) | Nullable | Reason/Context |

## 4. Frontend Design (Angular)
### Pages
1.  **Dashboard (`/dashboard`)**
    *   Displays summary cards (Total Items, Low Stock).
    *   Shows a "Recent Activity" table (Top 5 recent stock moves).
2.  **Inventory List (`/inventory`)**
    *   Data Grid showing all items.
    *   Visual highlight (Red row/icon) for items where `IsLowStock == true` (calculated field).
    *   "Add Item" button triggers a specific modal.
    *   "Delete" action available per row (disabled if Quantity > 0).

### Components
*   **`AddStockModal`**: Reusable dialog for Stock In/Out actions. Contains a switch/dropdown for transaction type and number input for quantity.
*   **`ItemFormComponent`**: Form to Create/Edit item details with validation (Name required).

### Services
*   **`InventoryService`**: Handles API calls to `/api/inventory` (including Delete).
*   **`StockService`**: Handles API calls to `/api/stock`.
*   **`DashboardService`**: Fetches stats for the home screen.
