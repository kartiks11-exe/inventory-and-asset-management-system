using System.Threading.Tasks;
using InventorySystem.Core.DTOs;
using InventorySystem.Core.Entities;
using InventorySystem.Core.Exceptions;
using InventorySystem.Core.Interfaces;
using InventorySystem.Services;
using Moq;
using Xunit;

namespace InventorySystem.UnitTests.Services
{
    public class InventoryServiceTests
    {
        private readonly Mock<IInventoryRepository> _mockRepo;
        private readonly InventoryService _service;

        public InventoryServiceTests()
        {
            _mockRepo = new Mock<IInventoryRepository>();
            _service = new InventoryService(_mockRepo.Object);
        }

        [Fact]
        public async Task DeleteItem_Should_Throw_When_Quantity_Positive()
        {
            // Arrange
            var item = new InventoryItem { Id = 1, Quantity = 5 }; // Positive quantity
            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(item);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<DomainException>(() => _service.DeleteItemAsync(1));
            Assert.Contains("remaining quantity", ex.Message);
            
            // Verify Delete was NEVER called
            _mockRepo.Verify(r => r.DeleteAsync(It.IsAny<InventoryItem>()), Times.Never);
        }

        [Fact]
        public async Task DeleteItem_Should_Succeed_When_Quantity_Zero()
        {
            // Arrange
            var item = new InventoryItem { Id = 1, Quantity = 0 };
            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(item);

            // Act
            await _service.DeleteItemAsync(1);

            // Verify Delete WAS called
            _mockRepo.Verify(r => r.DeleteAsync(item), Times.Once);
        }

        [Fact]
        public async Task CreateItem_Should_Initialize_Quantity_Zero()
        {
            // Arrange
            var dto = new CreateInventoryItemDto("Test Item", "Desc", 5);
            
            // Capture the item passed to repository
            InventoryItem capturedItem = null;
            _mockRepo.Setup(r => r.AddAsync(It.IsAny<InventoryItem>()))
                .Callback<InventoryItem>(i => capturedItem = i)
                .ReturnsAsync((InventoryItem i) => { i.Id = 1; return i; });

            // Act
            await _service.CreateItemAsync(dto);

            // Assert
            Assert.NotNull(capturedItem);
            Assert.Equal(0, capturedItem.Quantity);
            Assert.Equal("Test Item", capturedItem.Name);
        }
    }
}
