import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
        path: 'inventory',
        loadComponent: () => import('./features/inventory/inventory-list/inventory-list.component').then(m => m.InventoryListComponent),
        canActivate: [authGuard]
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
