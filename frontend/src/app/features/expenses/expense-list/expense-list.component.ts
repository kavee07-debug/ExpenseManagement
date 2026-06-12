import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AuthService } from '../../../core/auth.service';
import { ExpenseService } from '../../../core/expense.service';
import { ExpenseStatus } from '../../../core/models';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="page-header">
      <h2>รายการคำขอของฉัน</h2>
      <a routerLink="/expenses/new" class="btn btn-primary">➕ สร้างคำขอใหม่</a>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="search-wrap">
        <i class="search-icon">🔍</i>
        <input type="text" class="form-control" style="width:220px" [(ngModel)]="searchText"
               placeholder="ค้นหา เลขที่ / หัวข้อ..." />
      </div>
      <select class="form-control" style="width:150px" [(ngModel)]="filterStatus">
        <option value="">ทุกสถานะ</option>
        <option value="draft">Draft</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="cancelled">Cancelled</option>
        <option value="paid">Paid</option>
      </select>
      <input type="date" class="form-control" style="width:160px" [(ngModel)]="filterDateFrom" />
      <input type="date" class="form-control" style="width:160px" [(ngModel)]="filterDateTo" />
      <button class="btn btn-ghost btn-sm" (click)="clearFilters()">ล้างตัวกรอง</button>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>เลขที่คำขอ</th>
              <th>หัวข้อ</th>
              <th>วันที่สร้าง</th>
              <th>หมวด</th>
              <th style="text-align:right">จำนวนเงิน</th>
              <th>สถานะ</th>
              <th>การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            @for (exp of paged(); track exp.id) {
              <tr>
                <td class="fw-600">{{ exp.referenceNo }}</td>
                <td>{{ exp.title }}</td>
                <td class="text-sm">{{ exp.createdAt | date:'dd/MM/yyyy' }}</td>
                <td>{{ exp.categoryName }}</td>
                <td style="text-align:right">{{ exp.amount | number:'1.2-2' }} ฿</td>
                <td><span class="badge badge-{{ exp.status }}">{{ statusLabel(exp.status) }}</span></td>
                <td style="white-space:nowrap">
                  <a [routerLink]="'/expenses/' + exp.id" class="btn btn-sm btn-ghost">ดู</a>
                  @if (exp.status === 'draft') {
                    <a [routerLink]="'/expenses/' + exp.id + '/edit'" class="btn btn-sm btn-secondary" style="margin-left:4px">แก้ไข</a>
                  }
                </td>
              </tr>
            } @empty {
              <tr class="no-hover">
                <td colspan="7">
                  <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <p>ไม่พบรายการที่ค้นหา</p>
                    <a routerLink="/expenses/new" class="btn btn-primary btn-sm">สร้างคำขอใหม่</a>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (filtered().length > 0) {
        <div class="pagination" style="padding:var(--space-md)">
          <span>แสดง {{ pageStart() }}–{{ pageEnd() }} จาก {{ filtered().length }} รายการ</span>
          <div class="pages">
            <button class="page-btn" (click)="page.update(p=>p-1)" [disabled]="page()===1">‹</button>
            @for (p of pageList(); track p) {
              <button class="page-btn" [class.active]="p===page()" (click)="page.set(p)">{{ p }}</button>
            }
            <button class="page-btn" (click)="page.update(p=>p+1)" [disabled]="page()===totalPages()">›</button>
          </div>
        </div>
      }
    </div>
  `
})
export class ExpenseListComponent {
  auth = inject(AuthService);
  private expSvc = inject(ExpenseService);

  searchText = '';
  filterStatus = '';
  filterDateFrom = '';
  filterDateTo = '';
  page = signal(1);
  pageSize = 10;

  filtered = computed(() => {
    const userId = this.auth.currentUser()?.id ?? '';
    let list = this.expSvc.getByUser(userId);
    const s = this.searchText.toLowerCase();
    if (s) list = list.filter(e => e.referenceNo.toLowerCase().includes(s) || e.title.toLowerCase().includes(s));
    if (this.filterStatus) list = list.filter(e => e.status === this.filterStatus as ExpenseStatus);
    if (this.filterDateFrom) list = list.filter(e => e.expenseDate >= this.filterDateFrom);
    if (this.filterDateTo)   list = list.filter(e => e.expenseDate <= this.filterDateTo);
    return list;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  pageList   = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  pageStart  = computed(() => Math.min((this.page() - 1) * this.pageSize + 1, this.filtered().length));
  pageEnd    = computed(() => Math.min(this.page() * this.pageSize, this.filtered().length));
  paged      = computed(() => this.filtered().slice((this.page()-1)*this.pageSize, this.page()*this.pageSize));

  clearFilters(): void { this.searchText = ''; this.filterStatus = ''; this.filterDateFrom = ''; this.filterDateTo = ''; this.page.set(1); }

  statusLabel(s: string): string {
    const m: Record<string, string> = { draft: 'Draft', pending: 'Pending', approved: 'Approved', rejected: 'Rejected', cancelled: 'Cancelled', paid: 'Paid' };
    return m[s] ?? s;
  }
}
