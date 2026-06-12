import { Component, inject, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ExpenseService } from '../../../core/expense.service';
import { MOCK_USERS, MOCK_DEPARTMENTS, MOCK_POSITIONS } from '../../../core/mock-data';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  template: `
    <div class="page-header">
      <h2>ทีมของฉัน</h2>
    </div>

    <!-- Stat row -->
    <div class="grid-3 mb-md">
      <div class="stat-card" style="border-left-color:#D69E2E">
        <div class="stat-value" style="color:#D69E2E">{{ totalPending() }}</div>
        <div class="stat-label">คำขอรออนุมัติ</div>
      </div>
      <div class="stat-card" style="border-left-color:#276749">
        <div class="stat-value" style="color:#276749">{{ employees().length }}</div>
        <div class="stat-label">สมาชิกในทีม</div>
      </div>
      <div class="stat-card" style="border-left-color:#2B6CB0">
        <div class="stat-value" style="color:#2B6CB0">{{ totalAmount() | number:'1.0-0' }} ฿</div>
        <div class="stat-label">ยอดรวมเดือนนี้</div>
      </div>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <div style="padding:var(--space-md) var(--space-lg);border-bottom:1px solid var(--color-border)">
        <h3>สมาชิกในทีม</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>ชื่อ-นามสกุล</th>
            <th>แผนก</th>
            <th>Role</th>
            <th style="text-align:right">รออนุมัติ</th>
            <th style="text-align:right">ยอดรวม (เดือนนี้)</th>
            <th>ดูคำขอ</th>
          </tr>
        </thead>
        <tbody>
          @for (u of employees(); track u.id) {
            <tr>
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div style="width:32px;height:32px;border-radius:50%;background:var(--gradient-primary);
                              color:#fff;display:flex;align-items:center;justify-content:center;
                              font-weight:700;font-size:13px;flex-shrink:0">
                    {{ u.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="fw-600" style="font-size:14px">{{ u.name }}</div>
                    <div style="font-size:12px;color:var(--color-text-muted)">{{ u.email }}</div>
                  </div>
                </div>
              </td>
              <td>{{ deptName(u.departmentId) }}</td>
              <td><span class="badge badge-pending">{{ posName(u.positionId) }}</span></td>
              <td style="text-align:right">
                @if (pendingCount(u.id) > 0) {
                  <span class="badge badge-rejected">{{ pendingCount(u.id) }}</span>
                } @else {
                  <span class="text-muted">—</span>
                }
              </td>
              <td style="text-align:right">{{ monthlyAmount(u.id) | number:'1.2-2' }} ฿</td>
              <td>
                <a routerLink="/expenses" class="btn btn-ghost btn-sm">ดู</a>
              </td>
            </tr>
          } @empty {
            <tr class="no-hover"><td colspan="6">
              <div class="empty-state"><div class="empty-icon">👥</div><p>ไม่มีสมาชิกในทีม</p></div>
            </td></tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class TeamComponent {
  auth   = inject(AuthService);
  expSvc = inject(ExpenseService);

  employees = computed(() => MOCK_USERS.filter(u => u.role === 'employee' && u.isActive));

  totalAmount = computed(() =>
    this.expSvc.getAll()
      .filter(e => e.expenseDate?.startsWith('2026-06'))
      .reduce((s, e) => s + e.amount, 0)
  );

  totalPending = computed(() =>
    this.employees().reduce((s, u) => s + this.pendingCount(u.id), 0)
  );

  pendingCount(userId: string): number {
    return this.expSvc.getByUser(userId).filter(e => e.status === 'pending').length;
  }

  monthlyAmount(userId: string): number {
    return this.expSvc.getByUser(userId)
      .filter(e => e.expenseDate?.startsWith('2026-06'))
      .reduce((s, e) => s + e.amount, 0);
  }

  deptName(id: string): string {
    return MOCK_DEPARTMENTS.find(d => d.id === id)?.nameTh ?? '—';
  }

  posName(id: string): string {
    return MOCK_POSITIONS.find(p => p.id === id)?.nameTh ?? '—';
  }
}
