import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { ExpenseService } from '../../core/expense.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="page-header">
      <h2>หน้าหลัก</h2>
      @if (auth.hasRole('employee')) {
        <a routerLink="/expenses/new" class="btn btn-primary">➕ สร้างคำขอใหม่</a>
      }
    </div>

    <!-- Overdue alert for approvers -->
    @if (auth.canApprove() && overdueItems().length > 0) {
      <div class="alert alert-warning">
        ⚠️ มีรายการรออนุมัติเกิน 3 วัน — {{ overdueItems().length }} รายการ
        <a routerLink="/approvals" style="margin-left:auto">ดูรายการ →</a>
      </div>
    }

    <!-- Stat Cards -->
    <div class="grid-3 mb-md">
      @for (card of statCards(); track card.label) {
        <div class="stat-card" [style.border-left-color]="card.color">
          <div class="stat-value" [style.color]="card.color">{{ card.value }}</div>
          <div class="stat-label">{{ card.label }}</div>
          @if (card.sub) { <div class="text-xs text-muted">{{ card.sub }}</div> }
        </div>
      }
    </div>

    <!-- Recent / Pending Table -->
    <div class="card">
      <h3 style="margin-bottom:var(--space-md)">
        {{ auth.hasRole('employee') ? 'รายการล่าสุด' : 'รออนุมัติ' }}
      </h3>
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>เลขที่คำขอ</th>
              @if (!auth.hasRole('employee')) { <th>ชื่อผู้ขอ</th> }
              <th>วันที่</th>
              <th>หมวด</th>
              <th>จำนวนเงิน</th>
              <th>สถานะ</th>
              <th>การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            @for (exp of tableItems(); track exp.id) {
              <tr>
                <td><span class="fw-600">{{ exp.referenceNo }}</span></td>
                @if (!auth.hasRole('employee')) { <td>{{ exp.createdByName }}</td> }
                <td class="text-sm">{{ exp.expenseDate | date:'dd/MM/yyyy' }}</td>
                <td>{{ exp.categoryName }}</td>
                <td>{{ exp.amount | number:'1.2-2' }} ฿</td>
                <td><span class="badge badge-{{ exp.status }}">{{ statusLabel(exp.status) }}</span></td>
                <td>
                  <a [routerLink]="'/expenses/' + exp.id" class="btn btn-sm btn-ghost">ดู</a>
                  @if (auth.canApprove() && exp.status === 'pending') {
                    <a [routerLink]="'/approvals'" class="btn btn-sm btn-success" style="margin-left:4px">อนุมัติ</a>
                  }
                </td>
              </tr>
            } @empty {
              <tr class="no-hover">
                <td colspan="7">
                  <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <p>ไม่มีรายการ</p>
                    @if (auth.hasRole('employee')) {
                      <a routerLink="/expenses/new" class="btn btn-primary btn-sm">สร้างคำขอใหม่</a>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class DashboardComponent {
  auth = inject(AuthService);
  private expSvc = inject(ExpenseService);

  private myExpenses = computed(() => {
    const user = this.auth.currentUser();
    return user ? this.expSvc.getByUser(user.id) : [];
  });

  overdueItems = computed(() => {
    const threeDaysAgo = Date.now() - 3 * 86400000;
    return this.expSvc.getPending().filter(e =>
      e.submittedAt && new Date(e.submittedAt).getTime() < threeDaysAgo
    );
  });

  statCards = computed(() => {
    const role = this.auth.currentUser()?.role;
    const my = this.myExpenses();
    const pending = this.expSvc.getPending();

    if (role === 'employee') {
      const thisMonth = my.filter(e => e.expenseDate?.startsWith('2026-06'));
      return [
        { label: 'รออนุมัติ',       value: my.filter(e => e.status === 'pending').length,  color: '#D69E2E', sub: 'รายการ' },
        { label: 'อนุมัติแล้ว',      value: my.filter(e => e.status === 'approved').length, color: '#276749', sub: 'รายการ' },
        { label: 'ยอดรวมเดือนนี้',  value: thisMonth.reduce((s,e) => s+e.amount,0).toLocaleString('th-TH') + ' ฿', color: '#2B6CB0', sub: 'บาท' },
      ];
    }
    if (this.auth.canApprove()) {
      return [
        { label: 'รออนุมัติ',     value: pending.length, color: '#C53030', sub: 'รายการ' },
        { label: 'อนุมัติวันนี้',  value: 2, color: '#276749', sub: 'รายการ' },
        { label: 'ส่งคืน',        value: 1, color: '#718096', sub: 'รายการ' },
      ];
    }
    if (role === 'finance_admin') {
      const approved = this.expSvc.getAll().filter(e => e.status === 'approved');
      const paid = this.expSvc.getAll().filter(e => e.status === 'paid');
      return [
        { label: 'รออนุมัติจ่าย',  value: approved.length, color: '#D69E2E', sub: 'รายการ' },
        { label: 'จ่ายแล้วเดือนนี้',value: paid.length,     color: '#276749', sub: 'รายการ' },
        { label: 'รายการทั้งหมด',  value: this.expSvc.getAll().length, color: '#2B6CB0', sub: 'รายการ' },
      ];
    }
    return [
      { label: 'ผู้ใช้งาน',     value: 6, color: '#2E75B6', sub: 'คน' },
      { label: 'คำขอทั้งหมด',  value: this.expSvc.getAll().length, color: '#1F3864', sub: 'รายการ' },
      { label: 'หมวดค่าใช้จ่าย', value: 16, color: '#276749', sub: 'หมวด' },
    ];
  });

  tableItems = computed(() => {
    const role = this.auth.currentUser()?.role;
    if (role === 'employee') return this.myExpenses().slice(0, 10);
    if (this.auth.canApprove()) return this.expSvc.getPending().slice(0, 10);
    return this.expSvc.getAll().slice(0, 10);
  });

  statusLabel(s: string): string {
    const m: Record<string, string> = { draft: 'Draft', pending: 'Pending', approved: 'Approved', rejected: 'Rejected', cancelled: 'Cancelled', paid: 'Paid' };
    return m[s] ?? s;
  }
}
