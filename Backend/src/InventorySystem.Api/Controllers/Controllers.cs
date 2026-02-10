using System.Threading.Tasks;
using InventorySystem.Core.DTOs;
using InventorySystem.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InventorySystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _service;

        public InventoryController(IInventoryService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _service.GetAllItemsAsync();
            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateInventoryItemDto dto)
        {
            var created = await _service.CreateItemAsync(dto);
            return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteItemAsync(id);
            return NoContent();
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class StockController : ControllerBase
    {
        private readonly IStockService _service;

        public StockController(IStockService service)
        {
            _service = service;
        }

        [HttpPost("in")]
        public async Task<IActionResult> StockIn(StockOperationDto dto)
        {
            var newQuantity = await _service.StockInAsync(dto);
            return Ok(newQuantity);
        }

        [HttpPost("out")]
        public async Task<IActionResult> StockOut(StockOperationDto dto)
        {
            var newQuantity = await _service.StockOutAsync(dto);
            return Ok(newQuantity);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _service;

        public DashboardController(IDashboardService service)
        {
            _service = service;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var summary = await _service.GetSummaryAsync();
            return Ok(summary);
        }
    }
}
