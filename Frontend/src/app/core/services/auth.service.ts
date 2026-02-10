import { Injectable, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';

export type UserRole = 'manager' | 'viewer' | null;

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly STORAGE_KEY = 'inventory_app_role';

    // State
    private roleSignal = signal<UserRole>(this.getStoredRole());

    // Selectors
    readonly currentRole = this.roleSignal.asReadonly();
    readonly isManager = computed(() => this.roleSignal() === 'manager');
    readonly isLoggedIn = computed(() => this.roleSignal() !== null);

    constructor(private router: Router) {
        // Persistence effect
        effect(() => {
            const role = this.roleSignal();
            if (role) {
                localStorage.setItem(this.STORAGE_KEY, role);
            } else {
                localStorage.removeItem(this.STORAGE_KEY);
            }
        });
    }

    login(role: UserRole, password?: string): boolean {
        if (role === 'manager') {
            if (password !== 'admin123') {
                return false;
            }
        }

        this.roleSignal.set(role);
        if (role === 'manager') {
            this.router.navigate(['/inventory']);
        } else {
            this.router.navigate(['/dashboard']);
        }
        return true;
    }

    logout() {
        this.roleSignal.set(null);
        this.router.navigate(['/auth']);
    }

    private getStoredRole(): UserRole {
        return localStorage.getItem(this.STORAGE_KEY) as UserRole;
    }
}
