# Implementation & Coding Guide (C4)

## 1. Backend Implementation Guidelines (.NET 8)
This section outlines the standards for the ASP.NET Core Web API backend.

### Architecture Patterns
*   **Repository Pattern**: Isolate data access logic. Use `IInventoryRepository` and `IStockRepository`.
*   **Service Layer**: Encapsulate business logic. Controllers should **never** contain business logic.
    *   *Example*: `StockService` handles the "Atomic Transaction" rule, validating input and then calling the repository.

### Controller Standards
*   **Routing**: strict attribute routing `[Route("api/[controller]")]`.
*   **Response Types**: Use `ActionResult<T>`. Return explicit status codes:
    *   `Ok(data)` (200)
    *   `Created(uri, data)` (201)
    *   `NoContent()` (204)
    *   `BadRequest(message)` (400)
    *   `NotFound()` (404)

### Error Handling
*   **Global Exception Middleware**: Implement a middleware/filter to catch unhandled exceptions and return a standardized JSON error response.
    ```json
    {
      "error": "Internal Server Error",
      "details": "..." // Only in Development
    }
    ```

### Transaction Handling
*   **Atomicity**: Use `IDbContextTransaction` within the Service layer for Stock Operations.
    ```csharp
    using var transaction = _context.Database.BeginTransaction();
    try {
        // 1. Update Inventory Quantity
        // 2. Add Stock Transaction Log
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
    } catch {
        await transaction.RollbackAsync();
        throw;
    }
    ```

## 2. DTO and Model Definitions
Domain Models map to Database Tables. DTOs (Data Transfer Objects) are for API communication.

### InventoryItem DTOs
*   **CreateInventoryItemDto**
    ```csharp
    public class CreateInventoryItemDto {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        [StringLength(255)]
        public string Description { get; set; }

        [Range(0, int.MaxValue)]
        public int LowStockThreshold { get; set; } // Default 0
    }
    ```
*   **InventoryItemResponseDto** includes `IsLowStock` (Derived).

### StockTransaction DTOs
*   **StockOperationDto** (Used for both In and Out)
    ```csharp
    public class StockOperationDto {
        [Required]
        public int ItemId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be > 0")]
        public int Quantity { get; set; }

        public string Notes { get; set; }
    }
    ```

## 3. Unit Testing Strategy
Use **xUnit** and **Moq**.

### Key Test Cases
*   **StockServiceTests**
    *   `StockIn_ShouldIncreaseQuantity_AndLogTransaction()`: Verify repository calls.
    *   `StockOut_ShouldFail_WhenInsufficientQuantity()`: Assert that exception is thrown and **no** repo update occurs.
    *   `StockOut_ShouldTriggerLowStock_WhenThresholdBreached()`: Verify logic (though strictly backend doesn't trigger an 'event', the state change is verified).
*   **InventoryServiceTests**
    *   `Delete_ShouldFail_WhenQuantityGreaterThanZero()`: assert `BadRequest` or Domain Exception.
    *   `Delete_ShouldSucceed_WhenQuantityIsZero()`: assert repo delete call.

## 4. Frontend Implementation Guidelines (Angular)
### Project Structure
```text
src/app/
  features/
    dashboard/
    inventory/
      components/
        item-form/
        stock-modal/
      pages/
        inventory-list/
  core/
    services/
    models/
    interceptors/
```

### Component Guidelines
*   **Smart vs Dumb**:
    *   **Pages** (`InventoryListComponent`) are "Smart" (subscribe to services).
    *   **Components** (`ItemFormComponent`) are "Dumb" (Inputs/Outputs only).
*   **OnPush Strategy**: Prefer `ChangeDetectionStrategy.OnPush` for performance.

### API Integration
*   **Services**: All HTTP calls must be in `Core` services (e.g., `InventoryService`).
*   **Interfaces**: Define strict TypeScript interfaces matching Backend DTOs.
    ```typescript
    export interface InventoryItem {
        id: number;
        name: string;
        quantity: number;
        isLowStock: boolean; // Runtime calculated
    }
    ```

## 5. Coding Standards
*   **Naming**:
    *   C#: `PascalCase` for Classes/Methods, `camelCase` for local variables.
    *   TS: `camelCase` for variables/functions, `PascalCase` for classes/interfaces.
    *   Files: `kebab-case` (e.g., `inventory-list.component.ts`).
*   **Formatting**: Use Prettier (Frontend) and .editorconfig (Backend).
*   **Comments**: Documentation comments (`///`) for Public API endpoints only.
