import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Select a role to continue
          </p>
        </div>
        <div class="mt-8 space-y-4">
          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="mt-1">
              <input type="password" id="password" [(ngModel)]="password"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Required for Manager access">
            </div>
            @if (error()) {
              <p class="mt-2 text-sm text-red-600" id="email-error">{{ error() }}</p>
            }
          </div>

          <button (click)="loginAsManager()" 
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors">
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </span>
            Login as Store Manager
            <span class="block text-indigo-200 text-xs mt-0.5 ml-2 font-normal opacity-80">(Full Access)</span>
          </button>

          <button (click)="loginAsViewer()"
            class="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors">
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-gray-400 group-hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 12.943.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
            </span>
            Login as Viewer
            <span class="block text-gray-500 text-xs mt-0.5 ml-2 font-normal opacity-80">(Read Only)</span>
          </button>
        </div>
        
        <div class="text-center text-xs text-gray-400 mt-8">
          Inventory System Demo v1.0
        </div>
      </div>
    </div>
  `
})
export class AuthComponent {
  private authService = inject(AuthService);

  protected password = '';
  protected error = signal<string>('');

  loginAsManager() {
    this.error.set('');
    // Ensure we are passing 2 args and expecting a boolean
    const success = this.authService.login('manager', this.password);
    if (!success) {
      this.error.set('Invalid password. Hint: admin123');
    }
  }

  loginAsViewer() {
    this.authService.login('viewer');
  }
}
