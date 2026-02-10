using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InventorySystem.Core.DTOs;
using InventorySystem.Core.Entities;
using InventorySystem.Core.Exceptions;
using InventorySystem.Core.Interfaces;

namespace InventorySystem.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly IInventoryRepository _repository;

        public InventoryService(IInventoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<InventoryItemResponseDto>> GetAllItemsAsync()
        {
            var items = await _repository.GetAllAsync();
            return items.Select(MapToResponse);
        }

        public async Task<InventoryItemResponseDto> CreateItemAsync(CreateInventoryItemDto dto)
        {
            var item = new InventoryItem
            {
                Name = dto.Name,
                Description = dto.Description,
                LowStockThreshold = dto.LowStockThreshold,
                Quantity = 0, // Initial quantity is 0
                LastUpdated = DateTime.UtcNow
            };

            var created = await _repository.AddAsync(item);
            return MapToResponse(created);
        }

        public async Task DeleteItemAsync(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            if (item == null)
            {
                throw new NotFoundException($"Inventory item with ID {id} not found.");
            }

            if (item.Quantity > 0)
            {
                throw new DomainException("Cannot delete inventory item with remaining quantity. Stock must be 0.");
            }

            await _repository.DeleteAsync(item);
        }

        private static InventoryItemResponseDto MapToResponse(InventoryItem item)
        {
            return new InventoryItemResponseDto
            {
                Id = item.Id,
                Name = item.Name,
                Description = item.Description,
                Quantity = item.Quantity,
                LowStockThreshold = item.LowStockThreshold
            };
        }
    }

    public class StockService : IStockService
    {
        private readonly IInventoryRepository _inventoryRepo;
        private readonly IStockRepository _stockRepo;

        public StockService(IInventoryRepository inventoryRepo, IStockRepository stockRepo)
        {
            _inventoryRepo = inventoryRepo;
            _stockRepo = stockRepo;
        }

        public async Task<int> StockInAsync(StockOperationDto dto)
        {
            using var transaction = _inventoryRepo.BeginTransaction();
            try
            {
                var item = await _inventoryRepo.GetByIdAsync(dto.ItemId);
                if (item == null) throw new NotFoundException($"Item {dto.ItemId} not found.");

                item.Quantity += dto.Quantity;
                item.LastUpdated = DateTime.UtcNow;
                await _inventoryRepo.UpdateAsync(item);

                var log = new StockTransaction
                {
                    ItemId = dto.ItemId,
                    TransactionType = "IN",
                    Quantity = dto.Quantity,
                    Notes = dto.Notes,
                    TransactionDate = DateTime.UtcNow
                };
                await _stockRepo.AddAsync(log);

                // Commit both changes
                await _inventoryRepo.SaveChangesAsync();
                await transaction.CommitAsync();

                return item.Quantity;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<int> StockOutAsync(StockOperationDto dto)
        {
            using var transaction = _inventoryRepo.BeginTransaction();
            try
            {
                var item = await _inventoryRepo.GetByIdAsync(dto.ItemId);
                if (item == null) throw new NotFoundException($"Item {dto.ItemId} not found.");

                if (item.Quantity < dto.Quantity)
                {
                    throw new DomainException($"Insufficient stock. Current: {item.Quantity}, Requested: {dto.Quantity}");
                }

                item.Quantity -= dto.Quantity;
                item.LastUpdated = DateTime.UtcNow;
                await _inventoryRepo.UpdateAsync(item);

                var log = new StockTransaction
                {
                    ItemId = dto.ItemId,
                    TransactionType = "OUT",
                    Quantity = dto.Quantity,
                    Notes = dto.Notes,
                    TransactionDate = DateTime.UtcNow
                };
                await _stockRepo.AddAsync(log);

                await _inventoryRepo.SaveChangesAsync();
                await transaction.CommitAsync();

                return item.Quantity;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

    public class DashboardService : IDashboardService
    {
        private readonly IInventoryRepository _inventoryRepo;
        private readonly IStockRepository _stockRepo;

        public DashboardService(IInventoryRepository inventoryRepo, IStockRepository stockRepo)
        {
            _inventoryRepo = inventoryRepo;
            _stockRepo = stockRepo;
        }

        public async Task<DashboardSummaryDto> GetSummaryAsync()
        {
            var items = await _inventoryRepo.GetAllAsync();
            var totalItems = items.Count();
            
            // Logic derived from IsLowStock property concept
            var lowStockCount = items.Count(i => i.Quantity <= i.LowStockThreshold);

            var recentTransactions = await _stockRepo.GetRecentAsync(5);
            var recentDtos = recentTransactions.Select(t => new StockTransactionDto
            {
                Id = t.Id,
                ItemId = t.ItemId,
                ItemName = t.Item?.Name ?? "Unknown",
                TransactionType = t.TransactionType,
                Quantity = t.Quantity,
                TransactionDate = t.TransactionDate
            });

            return new DashboardSummaryDto
            {
                TotalItems = totalItems,
                LowStockCount = lowStockCount,
                RecentTransactions = recentDtos
            };
        }
    }
}
