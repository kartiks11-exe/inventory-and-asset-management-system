using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InventorySystem.Core.Entities
{
    public class StockTransaction
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int ItemId { get; set; }

        [ForeignKey("ItemId")]
        public InventoryItem? Item { get; set; }

        [Required]
        [MaxLength(10)]
        public string TransactionType { get; set; } = string.Empty; // "IN" or "OUT"

        public int Quantity { get; set; }

        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

        [MaxLength(200)]
        public string? Notes { get; set; }
    }
}
