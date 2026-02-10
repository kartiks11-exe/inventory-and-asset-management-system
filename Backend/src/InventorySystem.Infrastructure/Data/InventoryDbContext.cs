using InventorySystem.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace InventorySystem.Infrastructure.Data
{
    public class InventoryDbContext : DbContext
    {
        public InventoryDbContext(DbContextOptions<InventoryDbContext> options) : base(options) { }

        public DbSet<InventoryItem> InventoryItems { get; set; }
        public DbSet<StockTransaction> StockTransactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<InventoryItem>()
                .HasIndex(i => i.Name)
                .IsUnique();

            modelBuilder.Entity<StockTransaction>()
                .HasOne(t => t.Item)
                .WithMany()
                .HasForeignKey(t => t.ItemId);
        }
    }
}
