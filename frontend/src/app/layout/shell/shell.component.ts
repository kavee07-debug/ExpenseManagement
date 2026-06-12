import { Component, signal, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TopbarComponent } from '../topbar/topbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NotificationPanelComponent } from '../notification-panel/notification-panel.component';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TopbarComponent, SidebarComponent, NotificationPanelComponent],
  template: `
    <div class="shell" [class.sidebar-collapsed]="collapsed()">
      <!-- Icon Rail -->
      <nav class="icon-rail">
        <div class="rail-logo">
          <span>E</span>
        </div>
        <div class="rail-icons">
          @for (item of railItems(); track item.route) {
            <a class="rail-icon" [routerLink]="item.route" routerLinkActive="rail-active" [title]="item.label">{{ item.icon }}</a>
          }
        </div>
      </nav>

      <!-- Topbar -->
      <app-topbar
        (menuToggle)="collapsed.update(v => !v)"
        (notifToggle)="notifOpen.update(v => !v)" />

      <!-- Sidebar -->
      <app-sidebar [collapsed]="collapsed()" />

      <!-- Main content -->
      <main class="main-content">
        <router-outlet />
      </main>

      @if (notifOpen()) {
        <div class="notif-backdrop" (click)="notifOpen.set(false)"></div>
        <app-notification-panel (close)="notifOpen.set(false)" />
      }
    </div>
  `,
  styles: [`
    .shell {
      display: grid;
      grid-template-rows: var(--topbar-height) 1fr;
      grid-template-columns: var(--icon-rail-width) var(--sidebar-width) 1fr;
      height: 100vh;
      overflow: hidden;
    }
    .shell.sidebar-collapsed {
      grid-template-columns: var(--icon-rail-width) 0px 1fr;
    }

    /* ── Icon Rail ── */
    .icon-rail {
      grid-column: 1;
      grid-row: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 0 16px;
      gap: 4px;
      background: #1e1b4b;
      border-right: 1px solid rgba(255,255,255,0.06);
      z-index: 10;
    }
    .rail-logo {
      width: 32px; height: 32px;
      border-radius: 9px;
      background: linear-gradient(135deg, #4F46E5, #818CF8);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 14px; font-weight: 800;
      margin-bottom: 12px; flex-shrink: 0;
    }
    .rail-icons { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .rail-icon {
      width: 36px; height: 36px;
      border-radius: 9px; border: none;
      background: transparent; cursor: pointer; text-decoration: none;
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; color: rgba(255,255,255,0.45);
      transition: all 0.15s;
      &:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.9); }
      &.rail-active { background: rgba(255,255,255,0.15); color: #fff; }
    }

    /* ── Topbar spans across sidebar+main ── */
    app-topbar {
      grid-column: 2 / -1;
      grid-row: 1;
    }

    /* ── Sidebar ── */
    app-sidebar {
      grid-column: 2;
      grid-row: 2;
      overflow: hidden;
    }
    .shell.sidebar-collapsed app-sidebar {
      width: 0;
      overflow: hidden;
    }

    /* ── Main ── */
    .main-content {
      grid-column: 3;
      grid-row: 2;
      overflow-y: auto;
      padding: var(--space-lg);
      background: var(--color-bg);
    }

    .notif-backdrop {
      position: fixed; inset: 0; z-index: 899; background: transparent;
    }

    @media (max-width: 768px) {
      .shell { grid-template-columns: var(--icon-rail-width) 0px 1fr; }
      .main-content { grid-column: 2 / -1; }
    }
  `]
})
export class ShellComponent {
  collapsed = signal(false);
  notifOpen = signal(false);

  private auth = inject(AuthService);

  railItems = computed(() => {
    const role = this.auth.currentUser()?.role ?? 'employee';
    const base = [{ icon: '🏠', label: 'หน้าหลัก', route: '/dashboard' }];

    if (role === 'finance_admin') return [
      ...base,
      { icon: '💳', label: 'รออนุมัติจ่าย', route: '/finance/payment' },
      { icon: '🔄', label: 'Sync D365',     route: '/finance/d365-sync' },
      { icon: '📤', label: 'Export',        route: '/finance/export' },
    ];
    if (role === 'system_admin') return [
      { icon: '📁', label: 'หมวดค่าใช้จ่าย', route: '/admin/categories' },
      { icon: '👤', label: 'จัดการผู้ใช้',    route: '/admin/users' },
      { icon: '🏢', label: 'แผนก',            route: '/admin/departments' },
      { icon: '💼', label: 'ตำแหน่ง',         route: '/admin/positions' },
      { icon: '⚙️', label: 'ตั้งค่า',         route: '/admin/settings' },
    ];
    // employee
    const items = [
      ...base,
      { icon: '➕', label: 'สร้างคำขอ',    route: '/expenses/new' },
      { icon: '📋', label: 'รายการของฉัน', route: '/expenses' },
    ];
    if (this.auth.canApprove()) {
      items.push({ icon: '✅', label: 'รออนุมัติ', route: '/approvals' });
    }
    return items;
  });
}
