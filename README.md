# Inventory & Asset Management System

A full-stack Inventory and Asset Management application built for hackathon use, focusing on clean architecture, data consistency, and a modern user experience.

---

## 🚀 Features

- Inventory CRUD (Create, View, Delete)
- Stock In / Stock Out with **atomic transactions**
- Low-stock alerts and dashboard insights
- Recent transaction history
- Frontend role-based authorization (Store Manager)
- Clean UX with Angular standalone components

---

## 🧱 Tech Stack

### Backend
- ASP.NET Core (.NET 8)
- Entity Framework Core
- SQLite (hackathon-scale persistence)
- Repository & Service Layer architecture
- Swagger API documentation
- xUnit + Moq (unit testing)

### Frontend
- Angular (Standalone Components)
- Signals for state management
- Vanilla CSS (custom design system)
- Route-based authorization (frontend only)

---

## 🏗 Architecture Overview

- **Controllers** handle HTTP requests only
- **Services** contain business logic (atomic stock updates)
- **Repositories** handle data access
- **DTOs** separate API contracts from database entities

---

## ▶️ Running the Project Locally

### Backend
```bash
cd Backend
dotnet run
