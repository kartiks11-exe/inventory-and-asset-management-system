# Developer Handbook & Implementation Details

> [!NOTE]
> This document serves as the detailed "How-To" manual for developers. It complements the high-level C4 Architecture guide.

## 1. Backend Implementation Guidelines (.NET 8)
This section outlines the detailed standards for the ASP.NET Core Web API backend.

### Project Structure
```text
src/
  InventorySystem.Api/            # Controllers, Program.cs, Middleware
  InventorySystem.Core/           # Domain Entities, DTOs, Interfaces, Exceptions
  InventorySystem.Infrastructure/ # EF Core Context, Repositories, Migrations
  InventorySystem.Services/       # Business Logic Services
```

### Layer Responsibilities
*   **Controllers (`.Api`)**:
    *   **Role**: Traffic Cop. Validate specific HTTP concerns.
    *   **Rule**: NO business logic. NO direct database access.
    *   **Output**: Always return `ActionResult<T>`.
*   **Services (`.Services`)**:
    *   **Role**: Business Logic.
    *   **Rule**: Handle "Atomic Transaction" logic here.
    *   **Input**: Receive DTOs or Primitives. Return DTOs or Domain Models.
*   **Repositories (`.Infrastructure`)**:
    *   **Role**: Data Access.
    *   **Rule**: Use `IQueryable` internally but return Lists/AsyncEnumerables to Services.

### Atomic Transaction Pattern
Stock operations require dual updates. Use this exact pattern in `StockService`:

```csharp
public async Task<int> AddStockAsync(StockOperationDto op) {
    // 1. Start Transaction
    using var transaction = _repo.BeginTransaction();
    try {
        // 2. Update Inventory Quantity
        var item = await _repo.GetByIdAsync(op.ItemId);
        item.Quantity += op.Quantity;
        
        // 3. Add Transaction Log
        var log = new StockTransaction { ... };
        await _transactionRepo.AddAsync(log);
        
        // 4. Commit
        await _repo.SaveChangesAsync();
        await transaction.CommitAsync();
        
        return item.Quantity;
    } catch {
        // 5. Rollback on any error
        await transaction.RollbackAsync();
        throw;
    }
}
```

### Swagger Usage
*   Enabled in Development environment.
*   Use `[ProducesResponseType(StatusCodes.Status200OK)]` attributes for clearer client generation.

## 2. DTO and Model Definitions
Strict separation between EF Entities and API DTOs.

### DTOs
*   **CreateInventoryItemDto**
    ```csharp
    public record CreateInventoryItemDto(
        [Required] [MaxLength(100)] string Name,
        [MaxLength(255)] string? Description,
        [Range(0, int.MaxValue)] int LowStockThreshold
    );
    ```
*   **InventoryItemResponseDto**
    ```csharp
    public record InventoryItemResponseDto {
        public int Id { get; init; }
        public string Name { get; init; }
        public int Quantity { get; init; }
        public bool IsLowStock { get; init; } // Calculated: Quantity <= Threshold
    }
    ```

### Validation Rules
*   **Stock In/Out**: `Quantity` must be > 0.
*   **Names**: Must not be empty.
*   **Ids**: Must be positive integers.

## 3. Unit Testing Strategy
Atomic logic is critical and must be tested.

### Test Stack
*   **Framework**: xUnit
*   **Mocking**: Moq
*   **Assertions**: FluentAssertions (recommended) or Assert.

### Required Test Cases
1.  **StockServiceTests**:
    *   `AddStock_ShouldCommitTransaction_WhenSuccessful`: Verify `CommitAsync()` was called.
    *   `RemoveStock_ShouldRollback_WhenDbFails`: Throw exception in setup, verify `RollbackAsync()`.
    *   `RemoveStock_ShouldThrow_WhenInsufficientFunds`: Verify logic before DB touch.
2.  **InventoryServiceTests**:
    *   `Delete_ShouldThrow_WhenQuantityPositive`: Ensure constraint is enforced.

## 4. Frontend Implementation Guidelines (Angular)
### Feature-Based Structure
```text
src/app/
  features/
    dashboard/
      dashboard.component.ts    # Smart
      dashboard-stats/          # Dumb
      recent-activity/          # Dumb
    inventory/
      pages/
        inventory-list/         # Smart
      components/
        item-form/              # Dumb
        stock-modal/            # Dumb
```

### Strict TypeScript Typing
Do not use `any`. Define interfaces in `core/models`.

```typescript
// core/models/inventory-item.model.ts
export interface InventoryItem {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  lowStockThreshold: number;
  isLowStock: boolean; // Read-only from API
}
```

### Service Integration
*   Usage in Smart Components only.
*   Use `AsyncPipe` in templates where possible to manage subscriptions automatically.

## 5. Coding Standards
### Naming
*   **Interfaces**: `IInventoryService` (C#), `InventoryItem` (TS - no I prefix).
*   **Async**: Method names end in `Async` in C# (e.g., `GetAllAsync`).
*   **Observables**: End with `$` in TS (e.g., `items$`).

### Do's and Don'ts
*   **DO** use Record types for DTOs in C# (immutable, concise).
*   **DO** use strict mode in Angular.
*   **DON'T** put business logic (like calculating IsLowStock) in the UI. Use the API property.
*   **DON'T** use `console.log` in production code.
