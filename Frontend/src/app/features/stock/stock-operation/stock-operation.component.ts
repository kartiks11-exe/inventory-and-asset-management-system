/**
 * Component for handling stock items (In/Out operations)
 */
import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StockService } from '../../../core/services/stock.service';
import { InventoryItemResponseDto, StockOperationDto } from '../../../core/models/api.models';

@Component({
  selector: 'app-stock-operation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-fade-in">
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900">
          Adjust Stock: <span class="text-primary">{{ item?.name }}</span>
        </h3>
        <button (click)="close.emit()" class="text-gray-400 hover:text-gray-500">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Operation Type Toggle -->
          <div class="flex rounded-md shadow-sm mb-6" role="group">
            <button type="button" 
              (click)="setOperation('in')"
              [class.bg-green-600]="operationType() === 'in'"
              [class.text-white]="operationType() === 'in'"
              [class.bg-white]="operationType() !== 'in'"
              [class.text-gray-700]="operationType() !== 'in'"
              class="px-4 py-2 text-sm font-medium border border-gray-200 rounded-l-lg hover:bg-green-50 focus:z-10 focus:ring-2 focus:ring-green-500 focus:text-green-700 flex-1 transition-colors">
              Stock In (+)
            </button>
            <button type="button" 
              (click)="setOperation('out')"
              [class.bg-red-600]="operationType() === 'out'"
              [class.text-white]="operationType() === 'out'"
              [class.bg-white]="operationType() !== 'out'"
              [class.text-gray-700]="operationType() !== 'out'"
              class="px-4 py-2 text-sm font-medium border border-gray-200 rounded-r-lg hover:bg-red-50 focus:z-10 focus:ring-2 focus:ring-red-500 focus:text-red-700 flex-1 transition-colors">
              Stock Out (-)
            </button>
          </div>

          <!-- Quantity Input -->
          <div class="mb-4">
            <label for="quantity" class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input 
              type="number" 
              id="quantity" 
              formControlName="quantity"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="0"
              min="1">
            @if (form.get('quantity')?.invalid && form.get('quantity')?.touched) {
              <p class="mt-1 text-xs text-red-600">Quantity must be a positive number.</p>
            }
          </div>

          <!-- Notes Input -->
          <div class="mb-6">
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea 
              id="notes" 
              formControlName="notes"
              rows="3"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="Reason for adjustment..."></textarea>
          </div>
          
          <!-- Error Message -->
          @if (errorMessage()) {
            <div class="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
              {{ errorMessage() }}
            </div>
          }

          <!-- Actions -->
          <div class="flex justify-end gap-3">
            <button type="button" (click)="close.emit()" class="btn btn-secondary">Cancel</button>
            <button type="submit" [disabled]="form.invalid || isSubmitting()" class="btn btn-primary disabled:opacity-50">
              @if (isSubmitting()) {
                <span class="mr-2">Processing...</span>
              } @else {
                Confirm Adjustment
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: contents; }
  `]
})
export class StockOperationComponent {
  private fb = inject(FormBuilder);
  private stockService = inject(StockService);

  @Input() item: InventoryItemResponseDto | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() operationSuccess = new EventEmitter<void>();

  operationType = signal<'in' | 'out'>('in');
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    quantity: [1, [Validators.required, Validators.min(1)]],
    notes: ['']
  });

  setOperation(type: 'in' | 'out') {
    this.operationType.set(type);
    this.errorMessage.set(null);
  }

  onSubmit() {
    if (this.form.invalid || !this.item) return;


    this.errorMessage.set(null);

    // Confirmation for Stock Out
    if (this.operationType() === 'out') {
      const quantity = this.form.value.quantity;
      if (!confirm(`Are you sure you want to REMOVE ${quantity} items from stock?`)) {
        return;
      }
    }

    this.isSubmitting.set(true);

    const dto: StockOperationDto = {
      itemId: this.item.id,
      quantity: this.form.value.quantity,
      notes: this.form.value.notes
    };

    const operation$ = this.operationType() === 'in'
      ? this.stockService.stockIn(dto)
      : this.stockService.stockOut(dto);

    operation$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.operationSuccess.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        // Handle backend error (e.g. "Insufficient stock")
        this.errorMessage.set(err.error?.message || 'Operation failed. Please check stock levels.');
      }
    });
  }
}
