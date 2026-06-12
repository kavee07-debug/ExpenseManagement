import { Component, inject, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExpenseService } from '../../../core/expense.service';
import { MOCK_D365_LOGS } from '../../../core/mock-data';

@Component({
  selector: 'app-reconciliation',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  template: `
    <div class="page-header">
      <h2>Reconciliation Report</h2>
      <button class="btn btn-secondary">📤 Export Excel</button>
    </div>

    <!-- Summary cards -->
    <div class="grid-3 mb-md">
      <div class="stat-card" style="border-left-color:#276749">
        <div class="stat-value" style="color:#276749">{{ paid().length }}</div>
        <div class="stat-label">รายการจ่ายแล้ว</div>
      </div>
      <div class="stat-card" style="border-left-color:#2B6CB0">
        <div class="stat-value" style="color:#2B6CB0">{{ synced().length }}</div>
        <div class="stat-label">Sync D365 สำเร็จ</div>
      </div>
      <div class="stat-card" style="border-left-color:#C53030">
        <div class="stat-value" style="color:#C53030">{{ failed().length }}</div>
        <div class="stat-label">Sync ล้มเหลว</div>
      </div>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <div style="padding:var(--space-md) var(--space-lg);border-bottom:1px solid var(--color-border)">
        <h3>รายการ Reconciliation</h3>
      </div>
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>เลขที่คำขอ</th>
              <th>AP Invoice</th>
              <th>วันที่จ่าย</th>
              <th style="text-align:right">จำนวนเงิน</th>
              <th>วันที่ Sync</th>
              <th>สถานะ D365</th>
              <th>ดู</th>
            </tr>
          </thead>
          <tbody>
            @for (d of d365Logs; track d.id) {
              <tr>
                <td class="fw-600">{{ d.referenceNo }}</td>
                <td>{{ d.apInvoiceNo || '—' }}</td>
                <td class="text-sm">{{ d.paidDate || '—' }}</td>
                <td style="text-align:right">{{ d.amount | number:'1.2-2' }} ฿</td>
                <td class="text-sm">{{ d.syncedAt ? (d.syncedAt | date:'dd/MM/yyyy HH:mm') : '—' }}</td>
                <td>
                  @if (d.syncStatus === 'success') { <span class="badge badge-approved">✅ Success</span> }
                  @if (d.syncStatus === 'error')   { <span class="badge badge-rejected">❌ Error</span> }
                  @if (d.syncStatus === 'pending') { <span class="badge badge-pending">⏳ Pending</span> }
                </td>
                <td><a [routerLink]="'/expenses/' + d.requestId" class="btn btn-ghost btn-sm">ดู</a></td>
              </tr>
            } @empty {
              <tr class="no-hover"><td colspan="7">
                <div class="empty-state"><div class="empty-icon">📈</div><p>ไม่มีข้อมูล Reconciliation</p></div>
              </td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ReconciliationComponent {
  expSvc = inject(ExpenseService);
  d365Logs = MOCK_D365_LOGS;

  paid   = computed(() => this.expSvc.getAll().filter(e => e.status === 'paid'));
  synced = computed(() => this.d365Logs.filter(d => d.syncStatus === 'success'));
  failed = computed(() => this.d365Logs.filter(d => d.syncStatus === 'error'));
}
