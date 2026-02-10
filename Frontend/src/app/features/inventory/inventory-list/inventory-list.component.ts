import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory.service';
import { InventoryItemResponseDto } from '../../../core/models/api.models';
import { StockOperationComponent } from '../../stock/stock-operation/stock-operation.component';
import { InventoryFormComponent } from '../inventory-form/inventory-form.component';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, StockOperationComponent, InventoryFormComponent],
  template: `
    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold">Inventory</h2>
          <p class="text-sm text-gray">Manage your products and stock levels</p>
        </div>
        <button (click)="openAddModal()" class="btn btn-primary shadow-sm" [disabled]="isLoading()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Add Item
        </button>
      </div>

      <!-- Error Message -->
      @if (errorMessage()) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex justify-between items-start animate-fade-in">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ errorMessage() }}</p>
            </div>
          </div>
          <button (click)="errorMessage.set(null)" class="ml-auto pl-3">
            <svg class="h-5 w-5 text-red-400 hover:text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      }

      <!-- Inventory Table -->
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="py-3 px-4 text-xs font-semibold text-gray uppercase tracking-wider">ID</th>
                <th class="py-3 px-4 text-xs font-semibold text-gray uppercase tracking-wider">Product</th>
                <th class="py-3 px-4 text-xs font-semibold text-gray uppercase tracking-wider">Description</th>
                <th class="py-3 px-4 text-xs font-semibold text-gray uppercase tracking-wider text-right">Stock</th>
                <th class="py-3 px-4 text-xs font-semibold text-gray uppercase tracking-wider text-right">Threshold</th>
                <th class="py-3 px-4 text-xs font-semibold text-gray uppercase tracking-wider text-center">Status</th>
                <th class="py-3 px-4 text-xs font-semibold text-gray uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-100">
              @if (isLoading()) {
                <tr>
                  <td colspan="7">
                    <div class="flex justify-center items-center py-12">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <span class="ml-2 text-gray-500">Loading inventory...</span>
                    </div>
                  </td>
                </tr>
              } @else {
              @for (item of items(); track item.id) {
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="py-3 px-4 text-sm text-gray">{{ item.id }}</td>
                <td class="py-3 px-4 text-sm font-medium text-gray-900">{{ item.name }}</td>
                <td class="py-3 px-4 text-sm text-gray truncate max-w-xs">{{ item.description || '-' }}</td>
                <td class="py-3 px-4 text-sm font-mono text-right font-medium">{{ item.quantity }}</td>
                <td class="py-3 px-4 text-sm font-mono text-right text-gray">{{ item.lowStockThreshold }}</td>
                <td class="py-3 px-4 text-center">
                  @if (item.isLowStock) {
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Low Stock
                    </span>
                  } @else {
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      In Stock
                    </span>
                  }
                </td>
                <td class="py-3 px-4 text-sm text-right space-x-2">
                  <button (click)="openStockModal(item)" class="text-indigo-600 hover:text-indigo-900 font-medium">Adjust Stock</button>
                  <button 
                    (click)="deleteItem(item)" 
                    [disabled]="item.quantity > 0"
                    class="text-red-600 hover:text-red-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Cannot delete items with stock > 0">
                    Delete
                  </button>
                </td>
              </tr>
              } @empty {
              <tr>
                <td colspan="7" class="py-8 text-center text-gray">
                  No inventory items found. Start by adding a new product.
                </td>
              </tr>
              }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modals (Overlay) -->
    @if (showStockModal()) {
      <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <app-stock-operation 
            [item]="selectedItem()" 
            (close)="closeStockModal()" 
            (operationSuccess)="onOperationSuccess()">
        </app-stock-operation>
      </div>
    }

    @if (showAddModal()) {
      <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <app-inventory-form 
            (close)="closeAddModal()" 
            (itemCreated)="onItemCreated()">
        </app-inventory-form>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class InventoryListComponent implements OnInit {
  private inventoryService = inject(InventoryService);

  protected items = signal<InventoryItemResponseDto[]>([]);
  protected showStockModal = signal(false);
  protected showAddModal = signal(false);
  protected selectedItem = signal<InventoryItemResponseDto | null>(null);
  protected isLoading = signal(false);
  protected errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.inventoryService.getAll().subscribe({
      next: (data) => {
        this.items.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching inventory:', err);
        this.errorMessage.set('Failed to load inventory. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  deleteItem(item: InventoryItemResponseDto) {
    if (item.quantity > 0) return;
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    this.inventoryService.delete(item.id).subscribe({
      next: () => this.refreshList(),
      error: (err) => {
        this.errorMessage.set('Failed to delete item: ' + (err.error?.message || err.message));
        // Clear error after 5 seconds
        setTimeout(() => this.errorMessage.set(null), 5000);
      }
    });
  }

  openStockModal(item: InventoryItemResponseDto) {
    this.selectedItem.set(item);
    this.showStockModal.set(true);
  }

  closeStockModal() {
    this.showStockModal.set(false);
    this.selectedItem.set(null);
  }

  onOperationSuccess() {
    this.closeStockModal();
    this.refreshList();
  }

  openAddModal() {
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  onItemCreated() {
    this.closeAddModal();
    this.refreshList();
  }
}
