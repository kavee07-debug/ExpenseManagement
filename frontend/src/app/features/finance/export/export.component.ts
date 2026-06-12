import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ExpenseService } from '../../../core/expense.service';

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="page-header">
      <h2>Export ข้อมูล</h2>
    </div>

    <div class="grid-2" style="align-items:start">
      <!-- Export options -->
      <div class="card">
        <h3 style="margin-bottom:var(--space-md)">ตัวเลือก Export</h3>

        <div class="form-group">
          <label class="form-label">ช่วงวันที่</label>
          <div style="display:flex;gap:var(--space-sm)">
            <input type="date" class="form-control" [(ngModel)]="dateFrom" />
            <span style="align-self:center;color:var(--color-text-muted)">—</span>
            <input type="date" class="form-control" [(ngModel)]="dateTo" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">สถานะ</label>
          <select class="form-control" [(ngModel)]="statusFilter">
            <option value="">ทั้งหมด</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">รูปแบบไฟล์</label>
          <div style="display:flex;gap:var(--space-md);margin-top:4px">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
              <input type="radio" [(ngModel)]="format" value="excel" /> Excel (.xlsx)
            </label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
              <input type="radio" [(ngModel)]="format" value="csv" /> CSV (.csv)
            </label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
              <input type="radio" [(ngModel)]="format" value="pdf" /> PDF
            </label>
          </div>
        </div>

        <div style="margin-top:var(--space-md);padding-top:var(--space-md);border-top:1px solid var(--color-border)">
          <button class="btn btn-primary" (click)="doExport()">
            📤 Export {{ preview().length }} รายการ
          </button>
        </div>
      </div>

      <!-- Preview -->
      <div class="card" style="padding:0;overflow:hidden">
        <div style="padding:var(--space-md) var(--space-lg);border-bottom:1px solid var(--color-border)">
          <h3>ตัวอย่างข้อมูล ({{ preview().length }} รายการ)</h3>
        </div>
        <div style="overflow-x:auto;max-height:400px;overflow-y:auto">
          <table class="data-table">
            <thead>
              <tr><th>เลขที่</th><th>หมวด</th><th style="text-align:right">จำนวน</th><th>สถานะ</th></tr>
            </thead>
            <tbody>
              @for (e of preview().slice(0,20); track e.id) {
                <tr>
                  <td class="fw-600 text-sm">{{ e.referenceNo }}</td>
                  <td class="text-sm">{{ e.categoryName }}</td>
                  <td style="text-align:right" class="text-sm">{{ e.amount | number:'1.2-2' }} ฿</td>
                  <td><span class="badge badge-{{ e.status }}">{{ e.status }}</span></td>
                </tr>
              } @empty {
                <tr class="no-hover"><td colspan="4">
                  <div class="empty-state" style="padding:var(--space-lg)">
                    <div class="empty-icon">📊</div><p>ไม่มีข้อมูลตามเงื่อนไข</p>
                  </div>
                </td></tr>
              }
            </tbody>
          </table>
        </div>
        @if (preview().length > 20) {
          <div style="padding:var(--space-sm) var(--space-md);color:var(--color-text-muted);font-size:13px">
            แสดง 20 จาก {{ preview().length }} รายการ
          </div>
        }
      </div>
    </div>
  `
})
export class ExportComponent {
  expSvc = inject(ExpenseService);

  dateFrom = '';
  dateTo = '';
  statusFilter = '';
  format = 'excel';

  preview = computed(() => {
    let list = this.expSvc.getAll();
    if (this.statusFilter) list = list.filter(e => e.status === this.statusFilter);
    if (this.dateFrom) list = list.filter(e => e.expenseDate >= this.dateFrom);
    if (this.dateTo)   list = list.filter(e => e.expenseDate <= this.dateTo);
    return list;
  });

  doExport(): void {
    const count = this.preview().length;
    if (count === 0) { alert('ไม่มีข้อมูลที่จะ Export'); return; }
    alert(`Export ${count} รายการ เป็นไฟล์ ${this.format.toUpperCase()} สำเร็จ\n(Demo mode — ไฟล์จริงจะ download เมื่อเชื่อมต่อ backend)`);
  }
}
