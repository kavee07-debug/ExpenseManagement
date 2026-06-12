import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ExpenseService } from '../../../core/expense.service';
import { MOCK_D365_LOGS } from '../../../core/mock-data';
import { ExpenseRequest } from '../../../core/models';

@Component({
  selector: 'app-payment-queue',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe, RouterLink],
  template: `
    <div class="page-header">
      <h2>รออนุมัติจ่าย</h2>
    </div>

    <!-- Pending Payment -->
    <div class="card" style="margin-bottom:var(--space-lg);padding:0;overflow:hidden">
      <div style="padding:var(--space-md) var(--space-lg);border-bottom:1px solid var(--color-border)">
        <h3>รายการรอจ่ายเงิน <span class="badge badge-pending" style="margin-left:8px">{{ pending().length }} รายการ</span></h3>
      </div>
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr><th>เลขที่</th><th>พนักงาน</th><th>หมวด</th><th style="text-align:right">จำนวนเงิน</th><th>การดำเนินการ</th></tr>
          </thead>
          <tbody>
            @for (e of pending(); track e.id) {
              <tr>
                <td class="fw-600">{{ e.referenceNo }}</td>
                <td>{{ e.createdByName }}</td>
                <td>{{ e.categoryName }}</td>
                <td style="text-align:right">{{ e.amount | number:'1.2-2' }} ฿</td>
                <td>
                  <button class="btn btn-primary btn-sm" (click)="openPay(e)">💳 จ่ายเงิน</button>
                  <a [routerLink]="'/expenses/' + e.id" class="btn btn-ghost btn-sm" style="margin-left:4px">ดู</a>
                </td>
              </tr>
            } @empty {
              <tr class="no-hover"><td colspan="5">
                <div class="empty-state" style="padding:var(--space-lg)">
                  <div class="empty-icon">💳</div><p>ไม่มีรายการรอจ่ายเงิน</p>
                </div>
              </td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- D365 Synced -->
    <div class="card" style="padding:0;overflow:hidden">
      <div style="padding:var(--space-md) var(--space-lg);border-bottom:1px solid var(--color-border)">
        <h3>รายการที่ Sync D365 แล้ว</h3>
      </div>
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr><th>เลขที่</th><th>AP Invoice</th><th>วันที่ Sync</th><th style="text-align:right">จำนวนเงิน</th><th>สถานะ D365</th></tr>
          </thead>
          <tbody>
            @for (d of d365Logs; track d.id) {
              <tr>
                <td class="fw-600">{{ d.referenceNo }}</td>
                <td>{{ d.apInvoiceNo || '—' }}</td>
                <td class="text-sm">{{ d.syncedAt ? (d.syncedAt | date:'dd/MM/yyyy HH:mm') : '—' }}</td>
                <td style="text-align:right">{{ d.amount | number:'1.2-2' }} ฿</td>
                <td>
                  @if (d.syncStatus === 'success') { <span class="badge badge-approved">✅ Success</span> }
                  @if (d.syncStatus === 'error')   { <span class="badge badge-rejected">❌ Error</span> }
                  @if (d.syncStatus === 'pending') { <span class="badge badge-pending">⏳ Pending</span> }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pay Modal -->
    @if (payTarget()) {
      <div class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3>ยืนยันการจ่ายเงิน</h3>
            <button class="btn btn-icon btn-ghost" (click)="payTarget.set(null)">✕</button>
          </div>
          <div class="modal-body">
            <p>ยืนยันการจ่ายเงินสำหรับ <strong>{{ payTarget()!.referenceNo }}</strong></p>
            <p>พนักงาน: <strong>{{ payTarget()!.createdByName }}</strong></p>
            <p>จำนวน: <strong>{{ payTarget()!.amount | number:'1.2-2' }} ฿</strong></p>
            <div class="form-group mt-md">
              <label class="form-label">วิธีชำระเงิน</label>
              <select class="form-control" [(ngModel)]="payMethod">
                <option value="transfer">โอนเงินธนาคาร</option>
                <option value="cash">เงินสด</option>
                <option value="cheque">เช็ค</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">เลขที่บัญชี / อ้างอิง</label>
              <input type="text" class="form-control" [(ngModel)]="payRef" placeholder="xxx-x-xxxxx-x" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="payTarget.set(null)">ยกเลิก</button>
            <button class="btn btn-primary" (click)="confirmPay()">✅ ยืนยันจ่ายเงิน</button>
          </div>
        </div>
      </div>
    }
  `
})
export class PaymentQueueComponent {
  auth   = inject(AuthService);
  expSvc = inject(ExpenseService);

  d365Logs = MOCK_D365_LOGS;
  payTarget = signal<ExpenseRequest | null>(null);
  payMethod = 'transfer';
  payRef = '';

  pending = computed(() => this.expSvc.getAll().filter(e => e.status === 'approved'));

  openPay(e: ExpenseRequest): void { this.payTarget.set(e); this.payRef = ''; }

  confirmPay(): void {
    const e = this.payTarget();
    if (!e) return;
    this.expSvc.pay(e.id, this.auth.currentUser()!.name);
    this.payTarget.set(null);
  }
}
