# System Architecture (C2)

## 1. High-Level Architecture Overview
The Inventory & Asset Management System follows a classic **3-Tier Layered Architecture**. This ensures separation of concerns, maintainability, and scalability suitable for a hackathon prototype with clear paths for future enhancement.

*   **Presentation Layer (Frontend)**: Handles user interaction and UI rendering.
*   **Application Layer (Backend)**: Manages business logic, API endpoints, and data processing.
*   **Data Layer (Database)**: Stores persistent data.

## 2. Major System Components
### Frontend
*   **Technology**: Angular (v16+)
*   **Responsibilities**:
    *   Render the Dashboard and Inventory UI.
    *   Capture user inputs (forms for creating items, stock in/out).
    *   Display real-time validations and alerts.
    *   Communicate with the Backend via HTTP Client.

### Backend
*   **Technology**: .NET Web API (.NET 8/9)
*   **Responsibilities**:
    *   Expose RESTful API endpoints.
    *   Validate incoming requests.
    *   Execute core business logic (e.g., calculating low stock).
    *   Interact with the database using Entity Framework Core.

### Database
*   **Technology**: SQL Server or SQLite
*   **Responsibilities**:
    *   Store Inventory Items, Transaction History, and User data.
    *   Ensure data integrity and relationships.

## 3. Data Flow
1.  **User Action**: User submits a "Stock In" form on the Angular Frontend.
2.  **Request**: Frontend sends a JSON payload via an HTTP POST request to the Web API.
3.  **Processing**: Backend Controller receives the request, validates the data, and invokes the Service layer.
4.  **Persistence**: The Service layer updates the Entity Model and saves changes to the SQL Database via Entity Framework.
5.  **Response**: Database confirms the save; Backend sends a success status (HTTP 200) back to the Frontend.
6.  **Update**: Frontend refreshes the Dashboard view to reflect the new stock levels.

## 4. Logical Modules
### A. Inventory Module
*   **Purpose**: Manages the catalog of products/assets.
*   **Functions**: Create Item, Edit Details, List All Items.

### B. Stock Operations Module
*   **Purpose**: Handles quantity adjustments.
*   **Functions**: Stock In (Purchase), Stock Out (Sale/Usage), Adjustment History.

### C. Alerts Module
*   **Purpose**: Proactive monitoring.
*   **Functions**: Check stock vs. threshold, Generate "Low Stock" flag.

### D. Dashboard Module
*   **Purpose**: Aggregation and visualization.
*   **Functions**: Calculate Total Items, Count Low Stock Items, display recent activity feed.

## 5. Deployment Architecture (Hackathon Scale)
For the hackathon environment, the system is designed for **Local Deployment**:

*   **Host Machine**: A single developer laptop.
*   **Web Server**: Kestrel / IIS Express (hosting the .NET API).
*   **Frontend**: Angular CLI Development Server (`ng serve`).
*   **Database Engine**: Local instance of SQL Server Express or a local SQLite file.

*This setup ensures zero-latency development and demonstration without the need for cloud infrastructure.*
