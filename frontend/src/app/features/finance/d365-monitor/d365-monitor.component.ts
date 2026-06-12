import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MOCK_D365_LOGS } from '../../../core/mock-data';
import { D365SyncLog } from '../../../core/models';

@Component({
  selector: 'app-d365-monitor',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="page-header">
      <h2>D365 Integration Monitor</h2>
      <div style="display:flex;gap:var(--space-sm)">
        <button class="btn btn-secondary btn-sm" (click)="retryAll()">🔄 Retry Failed</button>
        <button class="btn btn-ghost btn-sm">📤 Export Excel</button>
      </div>
    </div>

    <!-- Summary Bar -->
    <div class="grid-3" style="margin-bottom:var(--space-lg)">
      <div class="stat-card" style="border-left-color:#276749">
        <div class="stat-value" style="color:#276749">{{ successCount() }}</div>
        <div class="stat-label">✅ สำเร็จ</div>
      </div>
      <div class="stat-card" style="border-left-color:#C53030">
        <div class="stat-value" style="color:#C53030">{{ errorCount() }}</div>
        <div class="stat-label">❌ ล้มเหลว</div>
      </div>
      <div class="stat-card" style="border-left-color:#D69E2E">
        <div class="stat-value" style="color:#D69E2E">{{ pendingCount() }}</div>
        <div class="stat-label">⏳ รอ</div>
      </div>
    </div>

    <!-- Filter -->
    <div class="filter-bar">
      <div class="search-wrap">
        <i class="search-icon">🔍</i>
        <input type="text" class="form-control" style="width:220px" [(ngModel)]="search" placeholder="ค้นหา EXP..." />
      </div>
      <select class="form-control" style="width:150px" [(ngModel)]="filterStatus">
        <option value="">ทุกสถานะ</option>
        <option value="success">Success</option>
        <option value="error">Error</option>
        <option value="pending">Pending</option>
      </select>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr><th>เลขที่ EXP</th><th>วันที่จ่าย</th><th>AP Invoice</th><th style="text-align:right">จำนวนเงิน</th><th>สถานะ Sync</th><th>การดำเนินการ</th></tr>
          </thead>
          <tbody>
            @for (d of filtered(); track d.id) {
              <tr>
                <td class="fw-600">{{ d.referenceNo }}</td>
                <td class="text-sm">{{ d.paidDate | date:'dd/MM/yyyy' }}</td>
                <td>{{ d.apInvoiceNo || '—' }}</td>
                <td style="text-align:right">{{ d.amount | number:'1.2-2' }} ฿</td>
                <td>
                  @if (d.syncStatus === 'success') { <span class="badge badge-approved">✅ Success</span> }
                  @if (d.syncStatus === 'error')   { <span class="badge badge-rejected">❌ Error</span> }
                  @if (d.syncStatus === 'pending') { <span class="badge badge-pending">⏳ Pending</span> }
                </td>
                <td>
                  @if (d.syncStatus === 'error') {
                    <button class="btn btn-secondary btn-sm" (click)="retry(d)">🔄 Retry</button>
                    <button class="btn btn-ghost btn-sm" style="margin-left:4px" (click)="toggleError(d.id)">ดู Error</button>
                  }
                </td>
              </tr>
              @if (expandedError() === d.id && d.errorMessage) {
                <tr class="no-hover">
                  <td colspan="6" style="background:#FFF5F5;padding:var(--space-sm) var(--space-lg)">
                    <code style="font-size:13px;color:#C53030">
                      ❌ {{ d.errorMessage }}<br/>
                      Retry count: {{ d.retryCount }}/3
                    </code>
                  </td>
                </tr>
              }
            } @empty {
              <tr class="no-hover"><td colspan="6">
                <div class="empty-state"><div class="empty-icon">🔄</div><p>ไม่มีข้อมูล</p></div>
              </td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class D365MonitorComponent {
  logs = signal<D365SyncLog[]>(JSON.parse(JSON.stringify(MOCK_D365_LOGS)));
  search = '';
  filterStatus = '';
  expandedError = signal<string | null>(null);

  successCount = () => this.logs().filter(d => d.syncStatus === 'success').length;
  errorCount   = () => this.logs().filter(d => d.syncStatus === 'error').length;
  pendingCount = () => this.logs().filter(d => d.syncStatus === 'pending').length;

  filtered(): D365SyncLog[] {
    let list = this.logs();
    const s = this.search.toLowerCase();
    if (s) list = list.filter(d => d.referenceNo.toLowerCase().includes(s));
    if (this.filterStatus) list = list.filter(d => d.syncStatus === this.filterStatus as any);
    return list;
  }

  retry(d: D365SyncLog): void {
    this.logs.update(list => list.map(l =>
      l.id === d.id ? { ...l, retryCount: l.retryCount + 1, syncStatus: l.retryCount >= 2 ? 'success' : 'error' } : l
    ));
  }

  retryAll(): void {
    this.logs().filter(d => d.syncStatus === 'error').forEach(d => this.retry(d));
  }

  toggleError(id: string): void {
    this.expandedError.update(v => v === id ? null : id);
  }
}
