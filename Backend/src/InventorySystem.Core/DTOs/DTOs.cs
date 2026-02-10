using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace InventorySystem.Core.DTOs
{
    public record CreateInventoryItemDto(
        [Required] [MaxLength(100)] string Name,
        [MaxLength(255)] string? Description,
        [Range(0, int.MaxValue)] int LowStockThreshold
    );

    public record InventoryItemResponseDto
    {
        public int Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string? Description { get; init; }
        public int Quantity { get; init; }
        public int LowStockThreshold { get; init; }
        
        // Runtime derived property
        public bool IsLowStock => Quantity <= LowStockThreshold;
    }

    public record StockOperationDto
    {
        [Required]
        public int ItemId { get; init; }

        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be > 0")]
        public int Quantity { get; init; }

        public string? Notes { get; init; }
    }
    
    public record DashboardSummaryDto
    {
        public int TotalItems { get; init; }
        public int LowStockCount { get; init; }
        public IEnumerable<StockTransactionDto> RecentTransactions { get; init; } = new List<StockTransactionDto>();
    }

    public record StockTransactionDto
    {
        public int Id { get; init; }
        public int ItemId { get; init; }
        public string ItemName { get; init; } = string.Empty;
        public string TransactionType { get; init; } = string.Empty;
        public int Quantity { get; init; }
        public DateTime TransactionDate { get; init; }
    }
}
