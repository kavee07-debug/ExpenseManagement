import { Component, EventEmitter, Output, inject, computed } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <button class="menu-btn" (click)="menuToggle.emit()" title="Toggle sidebar">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="1" y="3.5" width="16" height="1.5" rx="0.75" fill="currentColor"/>
            <rect x="1" y="8.25" width="11" height="1.5" rx="0.75" fill="currentColor"/>
            <rect x="1" y="13" width="16" height="1.5" rx="0.75" fill="currentColor"/>
          </svg>
        </button>
        <div class="brand">
          <span class="brand-name">ระบบเบิกค่าใช้จ่าย</span>
          <span class="brand-sep">·</span>
          <span class="brand-sub">EMA</span>
        </div>
      </div>

      <div class="topbar-right">
        <!-- Notification bell -->
        <button class="icon-btn" (click)="notifToggle.emit()" title="การแจ้งเตือน">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          @if (unreadCount() > 0) {
            <span class="notif-dot">{{ unreadCount() }}</span>
          }
        </button>

        <!-- User menu -->
        <div class="user-chip">
          <div class="user-avatar">{{ userInitial() }}</div>
          <div class="user-info">
            <span class="user-name">{{ user()?.name }}</span>
            <span class="user-role">{{ positionLabel() }}@if (deptLabel()) { · {{ deptLabel() }} }</span>
          </div>
          <button class="logout-btn" (click)="auth.logout()">ออกจากระบบ</button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      background: var(--color-surface);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 var(--space-lg);
      border-bottom: 1px solid var(--color-border);
      box-shadow: 0 1px 3px rgba(15,23,42,0.05);
      z-index: 100;
    }

    .topbar-left { display: flex; align-items: center; gap: 14px; }
    .topbar-right { display: flex; align-items: center; gap: 8px; }

    .menu-btn {
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      border: none; background: transparent; border-radius: 9px;
      color: var(--color-text-secondary); cursor: pointer; transition: all 0.15s;
      &:hover { background: var(--color-bg); color: var(--color-text); }
    }

    .brand { display: flex; align-items: center; gap: 8px; }
    .brand-name { font-size: 14px; font-weight: 700; color: var(--color-text); }
    .brand-sep  { color: var(--color-text-muted); }
    .brand-sub  { font-size: 12px; font-weight: 600; color: var(--color-primary); }

    .icon-btn {
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
      border: 1.5px solid var(--color-border-mid); border-radius: 9px;
      background: transparent; cursor: pointer;
      color: var(--color-text-secondary); position: relative; transition: all 0.15s;
      &:hover { background: var(--color-bg); color: var(--color-text); border-color: #CBD5E1; }
    }
    .notif-dot {
      position: absolute; top: 4px; right: 4px;
      background: #EF4444; color: #fff; border-radius: 999px;
      font-size: 9px; font-weight: 700; min-width: 14px; height: 14px;
      display: flex; align-items: center; justify-content: center; padding: 0 3px;
      border: 2px solid var(--color-surface);
    }

    .user-chip {
      display: flex; align-items: center; gap: 10px;
      padding: 0 8px 0 6px;
      border: 1.5px solid var(--color-border-mid);
      border-radius: 10px; height: 42px; background: var(--color-surface);
      transition: border-color 0.15s;
      &:hover { border-color: #C7D2FE; }
    }
    .user-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      background: var(--gradient-primary);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 13px; flex-shrink: 0;
    }
    .user-info { display: flex; flex-direction: column; line-height: 1.25; }
    .user-name { font-size: 13px; font-weight: 600; color: var(--color-text); }
    .user-role { font-size: 11px; color: var(--color-text-muted); }

    .logout-btn {
      height: 28px; padding: 0 10px;
      border: 1.5px solid var(--color-border-mid); border-radius: 7px;
      background: transparent; font-family: inherit;
      font-size: 12px; font-weight: 600; color: var(--color-text-secondary);
      cursor: pointer; transition: all 0.15s; white-space: nowrap;
      &:hover { background: #FEF2F2; color: #991B1B; border-color: #FCA5A5; }
    }

    @media (max-width: 640px) {
      .brand-sub, .brand-sep, .user-info, .logout-btn { display: none; }
    }
  `]
})
export class TopbarComponent {
  @Output() menuToggle = new EventEmitter<void>();
  @Output() notifToggle = new EventEmitter<void>();

  auth = inject(AuthService);
  private notifSvc = inject(NotificationService);

  user = this.auth.currentUser;
  userInitial = computed(() => this.user()?.name?.charAt(0) ?? '?');
  unreadCount = computed(() => {
    const u = this.user();
    return u ? this.notifSvc.unreadCount(u.id) : 0;
  });

  positionLabel = computed(() => this.auth.currentPosition()?.nameTh ?? '');
  deptLabel     = computed(() => this.auth.currentDepartment()?.nameTh ?? '');
}
