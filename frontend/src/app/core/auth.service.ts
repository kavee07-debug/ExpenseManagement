import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole, Position, Department } from './models';
import { MOCK_USERS, MOCK_POSITIONS, MOCK_DEPARTMENTS } from './mock-data';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<User | null>(null);

  readonly currentPosition = computed<Position | null>(() => {
    const user = this.currentUser();
    if (!user) return null;
    return MOCK_POSITIONS.find(p => p.id === user.positionId) ?? null;
  });

  readonly currentDepartment = computed<Department | null>(() => {
    const user = this.currentUser();
    if (!user) return null;
    return MOCK_DEPARTMENTS.find(d => d.id === user.departmentId) ?? null;
  });

  constructor(private router: Router) {
    const saved = localStorage.getItem('ema_user');
    if (saved) {
      const user = JSON.parse(saved) as User;
      // Migration: clear stale user objects from old schema (missing departmentId)
      if (!user.departmentId) {
        localStorage.removeItem('ema_user');
      } else {
        this.currentUser.set(user);
      }
    }
  }

  login(email: string, _password: string): boolean {
    const user = MOCK_USERS.find(u => u.email === email && u.isActive);
    if (!user) return false;
    this.currentUser.set(user);
    localStorage.setItem('ema_user', JSON.stringify(user));
    return true;
  }

  loginAs(role: UserRole): void {
    const user = MOCK_USERS.find(u => u.role === role && u.isActive);
    if (!user) return;
    this.currentUser.set(user);
    localStorage.setItem('ema_user', JSON.stringify(user));
    this.router.navigate(['/dashboard']);
  }

  loginAsUser(userId: string): void {
    const user = MOCK_USERS.find(u => u.id === userId && u.isActive);
    if (!user) return;
    this.currentUser.set(user);
    localStorage.setItem('ema_user', JSON.stringify(user));
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('ema_user');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean { return !!this.currentUser(); }

  hasRole(...roles: UserRole[]): boolean {
    const user = this.currentUser();
    return !!user && roles.includes(user.role);
  }

  canApprove(): boolean {
    return this.currentUser()?.role === 'employee'
      && (this.currentPosition()?.canApprove ?? false);
  }
}
