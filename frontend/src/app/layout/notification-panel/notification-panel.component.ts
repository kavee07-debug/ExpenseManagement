import { Component, EventEmitter, Output, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { NotificationService } from '../../core/notification.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="notif-panel">
      <div class="notif-header">
        <span class="notif-title">การแจ้งเตือน</span>
        <button class="btn btn-icon btn-ghost close-btn" (click)="close.emit()">✕</button>
      </div>

      <div class="tab-bar">
        <span class="tab" [class.active]="tab()==='all'" (click)="tab.set('all')">ทั้งหมด</span>
        <span class="tab" [class.active]="tab()==='unread'" (click)="tab.set('unread')">
          ยังไม่อ่าน ({{ unread().length }})
        </span>
      </div>

      <div class="notif-list">
        @for (n of displayed(); track n.id) {
          <a class="notif-item" [class.unread]="!n.isRead" [routerLink]="n.linkTo" (click)="markRead(n.id)">
            <span class="notif-icon">{{ iconFor(n.type) }}</span>
            <div class="notif-content">
              <div class="notif-item-title">{{ n.title }}</div>
              <div class="notif-item-msg text-muted">{{ n.message }}</div>
              <div class="notif-time text-xs">{{ n.createdAt | date:'d/M/yy HH:mm' }}</div>
            </div>
          </a>
        } @empty {
          <div class="empty-state">
            <div class="empty-icon">🔔</div>
            <p>ไม่มีการแจ้งเตือน</p>
          </div>
        }
      </div>

      <div class="notif-footer">
        <button class="btn btn-ghost btn-sm" (click)="notifSvc.markAllRead(userId())">อ่านทั้งหมด</button>
      </div>
    </div>
  `,
  styles: [`
    .notif-panel { display: flex; flex-direction: column; height: 100%; }
    .notif-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--space-md) var(--space-lg); border-bottom: 1px solid var(--color-border);
    }
    .notif-title { font-size: 16px; font-weight: 600; }
    .close-btn   { color: var(--color-text-secondary); }
    .tab-bar     { padding: 0 var(--space-md); }
    .notif-list  { flex: 1; overflow-y: auto; }
    .notif-item {
      display: flex; gap: var(--space-sm); padding: var(--space-sm) var(--space-md);
      border-bottom: 1px solid var(--color-border); text-decoration: none; color: inherit;
      transition: background 0.1s;
      &:hover { background: var(--color-accent); text-decoration: none; }
      &.unread { background: #F0F7FF; }
    }
    .notif-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
    .notif-content { flex: 1; min-width: 0; }
    .notif-item-title { font-size: 14px; font-weight: 600; }
    .notif-item-msg { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .notif-time { margin-top: 2px; }
    .notif-footer {
      padding: var(--space-sm) var(--space-md); border-top: 1px solid var(--color-border);
      display: flex; justify-content: center;
    }
  `]
})
export class NotificationPanelComponent {
  @Output() close = new EventEmitter<void>();

  private auth = inject(AuthService);
  notifSvc = inject(NotificationService);

  tab = signal<'all' | 'unread'>('all');
  userId = computed(() => this.auth.currentUser()?.id ?? '');

  unread    = computed(() => this.notifSvc.getUnread(this.userId()));
  displayed = computed(() =>
    this.tab() === 'all'
      ? this.notifSvc.getForUser(this.userId())
      : this.unread()
  );

  markRead(id: string): void { this.notifSvc.markRead(id); this.close.emit(); }

  iconFor(type: string): string {
    const map: Record<string, string> = {
      approved: '✅', rejected: '❌', submitted: '📤', paid: '💳', d365_error: '🔴', overdue: '⚠️'
    };
    return map[type] ?? '🔔';
  }
}
