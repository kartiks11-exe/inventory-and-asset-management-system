using System.Collections.Generic;
using System.Threading.Tasks;
using InventorySystem.Core.DTOs;
using InventorySystem.Core.Entities;
using Microsoft.EntityFrameworkCore.Storage;

namespace InventorySystem.Core.Interfaces
{
    public interface IInventoryRepository
    {
        Task<IEnumerable<InventoryItem>> GetAllAsync();
        Task<InventoryItem?> GetByIdAsync(int id);
        Task<InventoryItem> AddAsync(InventoryItem item);
        Task UpdateAsync(InventoryItem item);
        Task DeleteAsync(InventoryItem item);
        IDbContextTransaction BeginTransaction();
        Task SaveChangesAsync();
    }

    public interface IStockRepository
    {
        Task AddAsync(StockTransaction transaction);
        Task<IEnumerable<StockTransaction>> GetRecentAsync(int count);
    }

    public interface IInventoryService
    {
        Task<IEnumerable<InventoryItemResponseDto>> GetAllItemsAsync();
        Task<InventoryItemResponseDto> CreateItemAsync(CreateInventoryItemDto dto);
        Task DeleteItemAsync(int id);
    }

    public interface IStockService
    {
        Task<int> StockInAsync(StockOperationDto dto);
        Task<int> StockOutAsync(StockOperationDto dto);
    }

    public interface IDashboardService
    {
        Task<DashboardSummaryDto> GetSummaryAsync();
    }
}
