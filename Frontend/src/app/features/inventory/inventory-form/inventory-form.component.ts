import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService } from '../../../core/services/inventory.service';
import { CreateInventoryItemDto } from '../../../core/models/api.models';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-fade-in">
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900">Add New Item</h3>
        <button (click)="close.emit()" class="text-gray-400 hover:text-gray-500">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          
          <!-- Name -->
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input 
              type="text" 
              id="name" 
              formControlName="name"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="e.g. Laptop Stand">
            @if (form.get('name')?.invalid && form.get('name')?.touched) {
              <div class="mt-1 text-xs text-red-600">Product name is required.</div>
            }
          </div>

          <!-- Description -->
          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea 
              id="description" 
              formControlName="description"
              rows="3"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="Brief description..."></textarea>
          </div>

          <!-- Low Stock Threshold -->
          <div class="mb-6">
            <label for="threshold" class="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
            <input 
              type="number" 
              id="threshold" 
              formControlName="lowStockThreshold"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              min="0">
            <p class="mt-1 text-xs text-gray-500">Alert when stock falls below this number.</p>
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
                <span class="mr-2">Creating...</span>
              } @else {
                Create Item
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
export class InventoryFormComponent {
  private fb = inject(FormBuilder);
  private inventoryService = inject(InventoryService);

  @Output() close = new EventEmitter<void>();
  @Output() itemCreated = new EventEmitter<void>();



  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(255)]],
    lowStockThreshold: [10, [Validators.required, Validators.min(0)]]
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    // Explicit casting to match DTO
    const dto: CreateInventoryItemDto = {
      name: this.form.value.name!,
      description: this.form.value.description,
      lowStockThreshold: this.form.value.lowStockThreshold!
    };

    this.inventoryService.create(dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.itemCreated.emit();
      },
      error: (err) => {
        console.error('Failed to create item', err);
        this.isSubmitting.set(false);
        this.errorMessage.set('Failed to create item ' + (err.error?.title || err.message));
      }
    });
  }
}
