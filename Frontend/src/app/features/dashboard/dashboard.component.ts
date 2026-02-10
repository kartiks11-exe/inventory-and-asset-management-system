import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardSummaryDto, InventoryItemResponseDto } from '../../core/models/api.models';
import { InventoryService } from '../../core/services/inventory.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold">Dashboard</h2>
        <span class="text-sm text-gray">Overview of your inventory</span>
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
              <button (click)="refreshData()" class="mt-2 text-sm font-medium text-red-700 hover:text-red-600 underline">
                Try Again
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Stats Cards -->
      @if (summary(); as data) {
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Total Items Card -->
        <div class="card flex flex-col gap-2">
          <span class="text-sm font-medium text-gray">Total Items</span>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-bold text-primary">{{ data.totalItems }}</span>
            <span class="text-sm text-gray">products in stock</span>
          </div>
        </div>

        <!-- Low Stock Card -->
        <div class="card flex flex-col gap-2 border-l-4" [class.border-red-500]="data.lowStockCount > 0" [class.border-green-500]="data.lowStockCount === 0">
          <span class="text-sm font-medium text-gray">Low Stock Alerts</span>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-bold" [class.text-red-500]="data.lowStockCount > 0" [class.text-green-500]="data.lowStockCount === 0">
              {{ data.lowStockCount }}
            </span>
            <span class="text-sm text-gray">items need reordering</span>
          </div>
        </div>
      </div>



      <!-- Low Stock Items Warning -->
      @if (lowStockItems().length > 0) {
      <div class="card flex flex-col gap-4 border-l-4 border-red-500 bg-red-50">
        <div class="flex items-center gap-2 text-red-700">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
           <h3 class="text-lg font-bold">Action Required: Low Stock Items</h3>
        </div>
        
        <div class="overflow-x-auto bg-white rounded-lg border border-red-100">
          <table class="w-full text-left border-collapse">
            <thead class="bg-red-50">
              <tr>
                <th class="py-2 px-4 text-xs font-semibold text-red-800 uppercase">Product</th>
                <th class="py-2 px-4 text-xs font-semibold text-red-800 uppercase text-right">Current Stock</th>
                <th class="py-2 px-4 text-xs font-semibold text-red-800 uppercase text-right">Threshold</th>
                <th class="py-2 px-4 text-xs font-semibold text-red-800 uppercase text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-red-100">
              @for (item of lowStockItems(); track item.id) {
              <tr class="hover:bg-red-50/50 transition-colors">
                <td class="py-2 px-4 text-sm font-medium text-gray-900">{{ item.name }}</td>
                <td class="py-2 px-4 text-sm font-mono text-right font-bold text-red-600">{{ item.quantity }}</td>
                <td class="py-2 px-4 text-sm font-mono text-right text-gray-500">{{ item.lowStockThreshold }}</td>
                <td class="py-2 px-4 text-center">
                   <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Critical
                   </span>
                </td>
              </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      }

      <!-- Recent Transactions -->
      <div class="card flex flex-col gap-4">
        <h3 class="text-lg font-bold">Recent Transactions</h3>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="py-3 px-4 text-sm font-medium text-gray">Date</th>
                <th class="py-3 px-4 text-sm font-medium text-gray">Type</th>
                <th class="py-3 px-4 text-sm font-medium text-gray">Item</th>
                <th class="py-3 px-4 text-sm font-medium text-gray text-right">Quantity</th>
              </tr>
            </thead>
            <tbody>
              @for (tx of data.recentTransactions; track tx.id) {
              <tr class="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                <td class="py-3 px-4 text-sm">{{ tx.transactionDate | date:'medium' }}</td>
                <td class="py-3 px-4 text-sm">
                  <span class="px-2 py-1 rounded-full text-xs font-medium"
                    [class.bg-green-100]="tx.transactionType === 'IN'"
                    [class.text-green-700]="tx.transactionType === 'IN'"
                    [class.bg-orange-100]="tx.transactionType === 'OUT'"
                    [class.text-orange-700]="tx.transactionType === 'OUT'">
                    {{ tx.transactionType === 'IN' ? 'Stock In' : 'Stock Out' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-sm font-medium">{{ tx.itemName }}</td>
                <td class="py-3 px-4 text-sm text-right font-mono">
                  {{ tx.transactionType === 'IN' ? '+' : '-' }}{{ tx.quantity }}
                </td>
              </tr>
              } @empty {
              <tr>
                <td colspan="4" class="py-8 text-center text-gray text-sm">No recent transactions found.</td>
              </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      } @else {
        <!-- Loading State -->
        <div class="flex items-center justify-center h-64">
           <div class="animate-pulse flex flex-col items-center gap-2">
             <div class="h-8 w-8 bg-indigo-200 rounded-full"></div>
             <span class="text-sm text-gray">Loading dashboard...</span>
           </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private inventoryService = inject(InventoryService);

  protected summary = signal<DashboardSummaryDto | null>(null);
  protected lowStockItems = signal<InventoryItemResponseDto[]>([]);
  protected errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.errorMessage.set(null);
    this.dashboardService.getSummary().subscribe({
      next: (data) => this.summary.set(data),
      error: (err) => {
        console.error('Failed to load dashboard', err);
        this.errorMessage.set('Failed to load dashboard data.');
      }
    });

    this.inventoryService.getAll().subscribe({
      next: (items) => {
        const low = items.filter(item => item.quantity <= item.lowStockThreshold);
        this.lowStockItems.set(low);
      },
      error: (err) => console.error('Failed to load inventory for low stock check', err)
    });
  }
}
