using System;
using System.Threading.Tasks;
using InventorySystem.Core.DTOs;
using InventorySystem.Core.Entities;
using InventorySystem.Core.Exceptions;
using InventorySystem.Core.Interfaces;
using InventorySystem.Services;
using Microsoft.EntityFrameworkCore.Storage;
using Moq;
using Xunit;

namespace InventorySystem.UnitTests.Services
{
    public class StockServiceTests
    {
        private readonly Mock<IInventoryRepository> _mockInventoryRepo;
        private readonly Mock<IStockRepository> _mockStockRepo;
        private readonly Mock<IDbContextTransaction> _mockTransaction;
        private readonly StockService _service;

        public StockServiceTests()
        {
            _mockInventoryRepo = new Mock<IInventoryRepository>();
            _mockStockRepo = new Mock<IStockRepository>();
            _mockTransaction = new Mock<IDbContextTransaction>();

            // Setup BeginTransaction to return our mock transaction
            _mockInventoryRepo.Setup(r => r.BeginTransaction()).Returns(_mockTransaction.Object);

            _service = new StockService(_mockInventoryRepo.Object, _mockStockRepo.Object);
        }

        [Fact]
        public async Task StockIn_Should_IncrementQuantity_And_CommitTransaction()
        {
            // Arrange
            var item = new InventoryItem { Id = 1, Quantity = 10 };
            _mockInventoryRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(item);
            
            var dto = new StockOperationDto { ItemId = 1, Quantity = 5, Notes = "Test In" };

            // Act
            var newQty = await _service.StockInAsync(dto);

            // Assert
            Assert.Equal(15, newQty);
            _mockInventoryRepo.Verify(r => r.UpdateAsync(It.Is<InventoryItem>(i => i.Quantity == 15)), Times.Once);
            _mockStockRepo.Verify(r => r.AddAsync(It.IsAny<StockTransaction>()), Times.Once);
            _mockInventoryRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
            _mockTransaction.Verify(t => t.CommitAsync(default), Times.Once);
        }

        [Fact]
        public async Task StockOut_Should_Throw_When_InsufficientQuantity()
        {
            // Arrange
            var item = new InventoryItem { Id = 1, Quantity = 2 }; // Less than requested
            _mockInventoryRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(item);

            var dto = new StockOperationDto { ItemId = 1, Quantity = 5 };

            // Act & Assert
            await Assert.ThrowsAsync<DomainException>(() => _service.StockOutAsync(dto));
            
            // Verify NO updates or commits happened
            _mockInventoryRepo.Verify(r => r.UpdateAsync(It.IsAny<InventoryItem>()), Times.Never);
            _mockTransaction.Verify(t => t.CommitAsync(default), Times.Never);
            // Verify Rollback happened (Service implementation calls Rollback on catch implies it must have caught something?)
            // Actually, if we throw BEFORE the try/catch logic or INSIDE it, we need to check flow.
            // In my implementation: 
            // The verification check "if (item.Quantity < dto.Quantity)" is INSIDE the try/catch block.
            // So it throws DomainException, which is caught by catch { await transaction.RollbackAsync(); throw; }
            _mockTransaction.Verify(t => t.RollbackAsync(default), Times.Once);
        }

        [Fact]
        public async Task StockIn_Should_Rollback_When_DbSaveFails()
        {
            // Arrange
            var item = new InventoryItem { Id = 1, Quantity = 10 };
            _mockInventoryRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(item);
            _mockInventoryRepo.Setup(r => r.SaveChangesAsync()).ThrowsAsync(new Exception("DB Error"));

            var dto = new StockOperationDto { ItemId = 1, Quantity = 5 };

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _service.StockInAsync(dto));

            // Verify Rollback
            _mockTransaction.Verify(t => t.RollbackAsync(default), Times.Once);
            _mockTransaction.Verify(t => t.CommitAsync(default), Times.Never);
        }
    }
}
