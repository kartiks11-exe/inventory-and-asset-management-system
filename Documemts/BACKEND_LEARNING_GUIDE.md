# Backend Learning Guide: From "Naive" to "Pro"

Welcome! This guide is designed to take you on a journey through the backend we just built. We will assume zero prior knowledge of ASP.NET Core and explain *why* we did things broadly, then zoom in to the specific code.

---

## 1. The Architecture: The Restaurant Analogy

We structured our project into 4 separate folders (Projects). Why? Why not just put everything in one file?

Think of our application as a **High-End Restaurant**.

### The Layers
1.  **InventorySystem.Api (The Waiter)**
    *   **Role**: The Waiter stands at the front. They talk to the customer (The Frontend/User).
    *   **Job**: They take the order (HTTP Request), check if it makes sense ("We don't sell cars here"), and hand it to the kitchen.
    *   **Rule**: Waiters **never** cook. Controllers never contain business logic.
    *   *Code Reference*: `Controllers/InventoryController.cs`

2.  **InventorySystem.Services (The Chef)**
    *   **Role**: The Chef runs the kitchen. They know the recipes (Business Logic).
    *   **Job**: They receive the order from the waiter. They verify if ingredients are fresh (Logics like "Is stock low?"). They coordinate everything.
    *   **Rule**: Chefs don't go to the farm to pick carrots. They ask the Pantry for ingredients.
    *   *Code Reference*: `Services/StockService.cs`

3.  **InventorySystem.Infrastructure (The Pantry/Supplier)**
    *   **Role**: The storage handling.
    *   **Job**: They deal with the messy details of where things are kept (The Database).
    *   **Rule**: They don't ask *why* you need 50 carrots, they just retrieve them.
    *   *Code Reference*: `Repositories/InventoryRepository.cs`

4.  **InventorySystem.Core (The Menu & Ingredients)**
    *   **Role**: The common language.
    *   **Content**: Definitions of what a "Carrot" (Entity) is, and what the "Dinner Menu" (DTO) looks like. Everyone (Waiter, Chef, Pantry) reads from this.
    *   *Code Reference*: `Entities/InventoryItem.cs`, `DTOs/DTOs.cs`

---

## 2. Deep Dive: Key .NET Concepts

### Dependency Injection (DI) - "Hiring the Staff"
In `Program.cs`, you see lines like:
```csharp
builder.Services.AddScoped<IInventoryService, InventoryService>();
```
**Concept**: In the old days, a Waiter would have to go hire a Chef every time a customer walked in (`new InventoryService()`). That's inefficient.
**In .NET**: We "hire" everyone at the start (in `Program.cs`). We put them in a container. When a Request comes in, .NET automatically hands the existing Chef to the Waiter.
*   **Scoped**: Means "Create a fresh Chef for this specific customer order, reuse him for the salad and the steak, then let him go."

### Middleware - "The Security Guard"
In `Program.cs`, we have `app.UseMiddleware<ExceptionMiddleware>();`.
**Concept**: Before the Waiter even says "Hello", the request goes through a hallway. Middleware stands in that hallway.
*   **ExceptionMiddleware**: It acts like a safety net. If the Chef accidentally sets the kitchen on fire (Code Crash), this middleware catches the error and politely tells the customer "We are experiencing technical difficulties" (JSON Error) instead of showing them the burning kitchen.

---

## 3. Database Magic: Entity Framework Core (EF Core)

We didn't write a single line of SQL (`SELECT * FROM...`). Why?

### ORM (Object-Relational Mapper)
EF Core is our Translator. We speak C# Objects (`new InventoryItem`). The Database speaks SQL Tables. EF Core translates C# to SQL automatically.

### Repositories
In `InventoryRepository.cs`, we wrapped EF Core.
*   **Why?**: If we decide tomorrow to switch from SQL Server to a text file system, we only change the *Pantry* (Repository). The Chef (Service) doesn't care where the carrots come from, as long as he gets carrots.

### Atomicity: The "Stock In" Logic
In `StockService.cs`, we used a **Transaction**:
```csharp
using var transaction = _inventoryRepo.BeginTransaction();
// 1. Update Inventory (+10 items)
// 2. Add Log Card ("Added 10 items")
await transaction.CommitAsync();
```
**Concept**: Imagine you pay for a burger, but the power goes out before they give it to you. You lost money, gained nothing. Bad.
**Atomicity** ensures:
*   Either **BOTH** happen (Stock Updated AND Log Created).
*   Or **NEITHER** happens (If Log fails, the Stock Update acts like it never happened).
This guarantees our data is never "corrupted" or "half-done".

---

## 4. API Concepts

### DTOs (Data Transfer Objects) - "The Menu vs The Recipes"
*   **Entity (`InventoryItem`)**: Has an internal ID, maybe database secrets, relationships. This is the **Recipe**.
*   **DTO (`InventoryItemResponseDto`)**: What we show the customer. Contains `IsLowStock`.
*   **Why separate them?**:
    1.  **Security**: Don't show internal DB columns.
    2.  **Logic**: We calculated `IsLowStock` on the fly. It doesn't exist in the DB. The DTO allows us to send this calculated info.

### REST Status Codes - "The Waiter's Language"
The Waiter doesn't just say "Here". He communicates with signals:
*   **200 OK**: "Here is exactly what you asked for."
*   **201 Created**: "I have successfully written that down and started it."
*   **204 No Content**: "Done. (e.g., Delete). I have nothing to hand you back, but it's done."
*   **400 Bad Request**: "You asked for 'Purple Rain'. We don't serve that." (Validation Error).

---

## What's Next?
You now understand the "Brain" of the operation.
*   The **Controller** listens.
*   The **Service** thinks (Atomic logic).
*   The **Repository** remembers (Database).

Next, we will build the **Frontend**—the beautiful menu and dining room that connects the customer to this powerful kitchen.
