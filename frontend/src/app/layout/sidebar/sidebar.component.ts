import { Component, Input, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ExpenseService } from '../../core/expense.service';

interface NavItem  { icon: string; label: string; route: string; badge?: number; }
interface NavGroup { section: string; items: NavItem[]; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar" [class.collapsed]="collapsed">
      <!-- Profile block -->
      <div class="profile-block">
        <div class="profile-avatar">{{ userInitial() }}</div>
        @if (!collapsed) {
          <div class="profile-info">
            <span class="profile-name">{{ userName() }}</span>
            <span class="profile-role">{{ roleLabel() }}</span>
          </div>
          <button class="profile-chevron">⌄</button>
        }
      </div>

      <!-- Nav groups -->
      @if (!collapsed) {
        <div class="nav-scroll">
          @for (group of navGroups(); track group.section) {
            <div class="nav-group">
              <div class="nav-section-label">{{ group.section }}</div>
              @for (item of group.items; track item.route) {
                <a class="nav-item" [routerLink]="item.route" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                  <span class="nav-icon">{{ item.icon }}</span>
                  <span class="nav-label">{{ item.label }}</span>
                  @if (item.badge) {
                    <span class="nav-badge">{{ item.badge }}</span>
                  }
                </a>
              }
            </div>
          }
        </div>

        <!-- Bottom card -->
        <div class="sidebar-footer">
          <div class="help-card">
            <div class="help-title">ต้องการความช่วยเหลือ?</div>
            <div class="help-sub">ติดต่อทีม IT Support</div>
            <button class="help-btn">📧 ส่งข้อความ</button>
          </div>
        </div>
      }

      <!-- Collapsed: icon-only nav -->
      @if (collapsed) {
        <div class="nav-scroll">
          @for (group of navGroups(); track group.section) {
            @for (item of group.items; track item.route) {
              <a class="nav-item nav-icon-only" [routerLink]="item.route" routerLinkActive="active" [title]="item.label">
                <span class="nav-icon">{{ item.icon }}</span>
                @if (item.badge) {
                  <span class="nav-badge-dot"></span>
                }
              </a>
            }
          }
        </div>
      }
    </nav>
  `,
  styles: [`
    .sidebar {
      background: var(--color-surface);
      width: var(--sidebar-width);
      height: 100%;
      display: flex; flex-direction: column;
      border-right: 1px solid var(--color-border);
      overflow: hidden;
      transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
    }

    /* ── Profile ── */
    .profile-block {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 12px 10px;
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
    }
    .profile-avatar {
      width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
      background: var(--gradient-primary);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 13px;
    }
    .profile-info { flex: 1; min-width: 0; }
    .profile-name {
      display: block; font-size: 13px; font-weight: 600;
      color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .profile-role { font-size: 11px; color: var(--color-text-muted); }
    .profile-chevron {
      background: none; border: none; cursor: pointer;
      color: var(--color-text-muted); font-size: 12px; padding: 2px;
    }

    /* ── Nav ── */
    .nav-scroll { flex: 1; overflow-y: auto; padding: 8px 8px 0; }

    .nav-group { margin-bottom: 4px; }
    .nav-section-label {
      padding: 8px 10px 4px;
      font-size: 10px; font-weight: 700;
      color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.08em;
    }

    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 10px; border-radius: 10px;
      color: var(--color-text-secondary); font-size: 13px; font-weight: 500;
      text-decoration: none; white-space: nowrap; overflow: hidden;
      transition: all 0.14s; margin-bottom: 2px;
      &:hover { background: var(--color-accent); color: var(--color-primary); text-decoration: none; }
      &.active {
        background: var(--gradient-primary);
        color: #fff; font-weight: 600;
        box-shadow: 0 2px 8px rgba(79,70,229,0.2);
      }
    }
    .nav-icon-only { justify-content: center; padding: 9px 0; }

    .nav-icon  { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
    .nav-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }

    .nav-badge {
      background: #EF4444; color: #fff; border-radius: 999px;
      font-size: 10px; font-weight: 700; min-width: 18px; height: 18px;
      display: flex; align-items: center; justify-content: center; padding: 0 5px;
      box-shadow: 0 1px 4px rgba(239,68,68,0.35); flex-shrink: 0;
    }
    .nav-badge-dot {
      position: absolute; top: 6px; right: 6px;
      width: 7px; height: 7px; background: #EF4444; border-radius: 50%;
      border: 2px solid var(--color-surface);
    }

    /* ── Footer help card ── */
    .sidebar-footer { padding: 8px; flex-shrink: 0; border-top: 1px solid var(--color-border); }
    .help-card {
      padding: 12px; border-radius: 12px;
      background: linear-gradient(135deg, #EEF2FF, #F5F3FF);
      border: 1px solid #C7D2FE;
    }
    .help-title { font-size: 12px; font-weight: 700; color: #3730A3; margin-bottom: 2px; }
    .help-sub   { font-size: 11px; color: #6366F1; margin-bottom: 8px; }
    .help-btn {
      width: 100%; padding: 7px 0; border-radius: 8px;
      border: none; font-family: inherit; font-size: 12px; font-weight: 600;
      color: #fff; cursor: pointer; background: var(--gradient-primary);
      transition: opacity 0.15s;
      &:hover { opacity: 0.9; }
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;

  private auth = inject(AuthService);
  private expSvc = inject(ExpenseService);

  userName    = computed(() => this.auth.currentUser()?.name ?? '');
  userInitial = computed(() => this.auth.currentUser()?.name?.charAt(0) ?? '?');
  roleLabel   = computed(() => {
    const map: Record<string, string> = {
      employee:     'พนักงาน',
      finance_admin:'เจ้าหน้าที่การเงิน',
      system_admin: 'ผู้ดูแลระบบ',
    };
    return map[this.auth.currentUser()?.role ?? ''] ?? '';
  });

  navGroups = computed<NavGroup[]>(() => {
    const role = this.auth.currentUser()?.role;
    const pending = this.expSvc.getPending().length;
    const canApprove = this.auth.canApprove();

    if (role === 'system_admin') {
      return [{ section: 'ระบบ', items: [
        { icon: '📁', label: 'หมวดค่าใช้จ่าย', route: '/admin/categories' },
        { icon: '👤', label: 'จัดการผู้ใช้',    route: '/admin/users' },
        { icon: '🏢', label: 'แผนก',            route: '/admin/departments' },
        { icon: '💼', label: 'ตำแหน่ง',         route: '/admin/positions' },
        { icon: '⚙️', label: 'ตั้งค่าระบบ',     route: '/admin/settings' },
      ]}];
    }

    if (role === 'finance_admin') {
      return [
        { section: 'ภาพรวม', items: [
          { icon: '🏠', label: 'หน้าหลัก', route: '/dashboard' },
        ]},
        { section: 'การเงิน', items: [
          { icon: '💳', label: 'รออนุมัติจ่าย',  route: '/finance/payment' },
          { icon: '🔄', label: 'Sync D365',      route: '/finance/d365-sync' },
          { icon: '📈', label: 'Reconciliation', route: '/finance/reconciliation' },
          { icon: '📤', label: 'Export',         route: '/finance/export' },
        ]},
      ];
    }

    // employee (with or without canApprove)
    const groups: NavGroup[] = [{ section: 'ภาพรวม', items: [
      { icon: '🏠', label: 'หน้าหลัก',      route: '/dashboard' },
      { icon: '➕', label: 'สร้างคำขอใหม่', route: '/expenses/new' },
      { icon: '📋', label: 'รายการของฉัน',  route: '/expenses' },
    ]}];

    if (canApprove) {
      groups.push({ section: 'การอนุมัติ', items: [
        { icon: '✅', label: 'รออนุมัติ',         route: '/approvals', badge: pending },
        { icon: '📊', label: 'ประวัติการอนุมัติ', route: '/approvals/history' },
        { icon: '👥', label: 'ทีมของฉัน',          route: '/team' },
      ]});
    }

    return groups;
  });
}
