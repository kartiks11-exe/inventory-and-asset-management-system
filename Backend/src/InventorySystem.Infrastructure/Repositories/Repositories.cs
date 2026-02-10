using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InventorySystem.Core.Entities;
using InventorySystem.Core.Interfaces;
using InventorySystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace InventorySystem.Infrastructure.Repositories
{
    public class InventoryRepository : IInventoryRepository
    {
        private readonly InventoryDbContext _context;

        public InventoryRepository(InventoryDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<InventoryItem>> GetAllAsync()
        {
            return await _context.InventoryItems.AsNoTracking().ToListAsync();
        }

        public async Task<InventoryItem?> GetByIdAsync(int id)
        {
             // For updates, we need tracking
            return await _context.InventoryItems.FindAsync(id);
        }

        public async Task<InventoryItem> AddAsync(InventoryItem item)
        {
            _context.InventoryItems.Add(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task UpdateAsync(InventoryItem item)
        {
            _context.InventoryItems.Update(item);
            // We do NOT save here if we want to batch with stock log in service?
            // The Interface has "SaveChangesAsync". The Guide shows "await _repo.SaveChangesAsync()" manually in service.
            // So these methods should probably NOT save.
            // BUT for single operations (Update Item Details), we want to save.
            // Compromise: Add a flag or just Save. If inside transaction, SaveChanges is fine.
            await _context.SaveChangesAsync(); 
        }

        public async Task DeleteAsync(InventoryItem item)
        {
            _context.InventoryItems.Remove(item);
            await _context.SaveChangesAsync();
        }

        public IDbContextTransaction BeginTransaction()
        {
            return _context.Database.BeginTransaction();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }

    public class StockRepository : IStockRepository
    {
        private readonly InventoryDbContext _context;

        public StockRepository(InventoryDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(StockTransaction transaction)
        {
            _context.StockTransactions.Add(transaction);
            // We expect the Service to call SaveChangesAsync for the atomic integrity,
            // but if used standalone, we might want it.
            // However, StockTransactions are ALWAYS part of a flow.
            // Let's NOT save here to allow the Service to coordinate the Save.
        }

        public async Task<IEnumerable<StockTransaction>> GetRecentAsync(int count)
        {
            return await _context.StockTransactions
                .Include(t => t.Item)
                .OrderByDescending(t => t.TransactionDate)
                .Take(count)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
