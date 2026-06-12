import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AuthService } from '../../../core/auth.service';
import { ExpenseService } from '../../../core/expense.service';

@Component({
  selector: 'app-expense-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe],
  template: `
    @if (exp()) {
      <div class="page-header">
        <div>
          <h2>{{ exp()!.referenceNo }}</h2>
          <span class="badge badge-{{ exp()!.status }}" style="margin-top:4px">{{ statusLabel(exp()!.status) }}</span>
        </div>
        @if (canEdit()) {
          <a [routerLink]="'/expenses/' + exp()!.id + '/edit'" class="btn btn-secondary">✏️ แก้ไข</a>
        }
      </div>

      <!-- Approver Action Panel -->
      @if (canApprove()) {
        <div class="card alert-info" style="margin-bottom:var(--space-md)">
          <h3 style="margin-bottom:var(--space-sm)">การดำเนินการ</h3>
          <div class="form-group">
            <label class="form-label">หมายเหตุ</label>
            <input type="text" class="form-control" [(ngModel)]="comment" placeholder="ระบุหมายเหตุ (ถ้ามี)" />
          </div>
          <div style="display:flex;gap:var(--space-sm)">
            <button class="btn btn-success" (click)="doApprove()">✅ อนุมัติ</button>
            <button class="btn btn-danger"  (click)="doReject()">❌ ปฏิเสธ</button>
            <button class="btn btn-ghost"   (click)="doReturn()">↩ ส่งคืนแก้ไข</button>
          </div>
        </div>
      }

      <!-- Finance Pay Panel -->
      @if (canPay()) {
        <div class="card" style="margin-bottom:var(--space-md);border-left:4px solid var(--color-secondary)">
          <h3 style="margin-bottom:var(--space-sm)">การจ่ายเงิน</h3>
          <button class="btn btn-primary" (click)="payModal.set(true)">💳 จ่ายเงิน</button>
        </div>
      }

      <div class="grid-2" style="align-items:start">
        <!-- Request Info -->
        <div class="card">
          <h3 style="margin-bottom:var(--space-md)">ข้อมูลคำขอ</h3>
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            @for (row of infoRows(); track row.label) {
              <tr>
                <td style="padding:6px 0;color:var(--color-text-secondary);width:40%">{{ row.label }}</td>
                <td style="padding:6px 0;font-weight:500">{{ row.value }}</td>
              </tr>
            }
          </table>
        </div>

        <!-- Workflow Timeline -->
        <div class="card">
          <h3 style="margin-bottom:var(--space-md)">ไทม์ไลน์ Workflow</h3>
          <div class="timeline">
            @for (step of workflowSteps(); track step.label) {
              <div class="timeline-item">
                <div class="timeline-dot" [class]="step.dotClass"></div>
                <div class="timeline-content">
                  <div class="title">{{ step.label }}</div>
                  @if (step.meta) { <div class="meta">{{ step.meta }}</div> }
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Attachments -->
      @if (exp()!.attachments.length > 0) {
        <div class="card mt-md">
          <h3 style="margin-bottom:var(--space-md)">เอกสารแนบ</h3>
          <div style="display:flex;flex-wrap:wrap;gap:var(--space-sm)">
            @for (a of exp()!.attachments; track a.id) {
              <a href="#" class="btn btn-ghost btn-sm">
                {{ a.type.includes('pdf') ? '📄' : '🖼' }} {{ a.name }}
              </a>
            }
          </div>
        </div>
      }

      <!-- Audit Log -->
      <div class="card mt-md">
        <h3 style="margin-bottom:var(--space-md)">ประวัติการดำเนินการ</h3>
        <div style="overflow-x:auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>วันที่/เวลา</th>
                <th>ผู้ดำเนินการ</th>
                <th>การกระทำ</th>
                <th>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              @for (log of logs(); track log.id) {
                <tr>
                  <td class="text-sm">{{ log.timestamp | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ log.actorName }}</td>
                  <td><span class="badge badge-{{ actionBadge(log.action) }}">{{ actionLabel(log.action) }}</span></td>
                  <td class="text-muted">{{ log.comment || '—' }}</td>
                </tr>
              } @empty {
                <tr class="no-hover"><td colspan="4" style="text-align:center;color:var(--color-text-muted);padding:var(--space-lg)">ไม่มีประวัติ</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pay Modal -->
      @if (payModal()) {
        <div class="modal-overlay" (click)="payModal.set(false)">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>ยืนยันการจ่ายเงิน</h3>
              <button class="btn btn-icon btn-ghost" (click)="payModal.set(false)">✕</button>
            </div>
            <div class="modal-body">
              <p>ยืนยันการจ่ายเงินสำหรับ <strong>{{ exp()!.referenceNo }}</strong></p>
              <p class="mt-md">จำนวน: <strong>{{ exp()!.amount | number:'1.2-2' }} ฿</strong></p>
              <div class="form-group mt-md">
                <label class="form-label">วิธีชำระเงิน</label>
                <select class="form-control" [(ngModel)]="payMethod">
                  <option value="transfer">โอนเงินธนาคาร</option>
                  <option value="cash">เงินสด</option>
                  <option value="cheque">เช็ค</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" (click)="payModal.set(false)">ยกเลิก</button>
              <button class="btn btn-primary" (click)="confirmPay()">✅ ยืนยันจ่ายเงิน</button>
            </div>
          </div>
        </div>
      }

    } @else {
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p>ไม่พบคำขอ</p>
        <a routerLink="/expenses" class="btn btn-primary btn-sm">กลับรายการ</a>
      </div>
    }
  `
})
export class ExpenseDetailComponent implements OnInit {
  auth   = inject(AuthService);
  expSvc = inject(ExpenseService);
  route  = inject(ActivatedRoute);
  router = inject(Router);

  exp    = signal<ReturnType<ExpenseService['getById']>>(undefined);
  logs   = computed(() => this.expSvc.getLogsForRequest(this.exp()?.id ?? ''));
  comment = '';
  payModal = signal(false);
  payMethod = 'transfer';

  canApprove = computed(() =>
    this.exp()?.status === 'pending' && this.auth.canApprove()
  );
  canPay = computed(() =>
    this.exp()?.status === 'approved' && this.auth.hasRole('finance_admin')
  );
  canEdit = computed(() =>
    this.exp()?.status === 'draft' && this.exp()?.createdBy === this.auth.currentUser()?.id
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.exp.set(this.expSvc.getById(id));
  }

  infoRows = computed(() => {
    const e = this.exp();
    if (!e) return [];
    return [
      { label: 'หัวข้อ',        value: e.title },
      { label: 'หมวด',          value: e.categoryName },
      { label: 'วันที่ใช้จ่าย', value: new Date(e.expenseDate).toLocaleDateString('th-TH') },
      { label: 'จำนวนเงิน',     value: `${e.amount.toLocaleString('th-TH', {minimumFractionDigits:2})} ฿` },
      { label: 'VAT',            value: e.vatAmount ? `${e.vatAmount.toLocaleString('th-TH', {minimumFractionDigits:2})} ฿` : '—' },
      { label: 'สกุลเงิน',      value: e.currency },
      { label: 'ผู้สร้าง',       value: e.createdByName },
      { label: 'รายละเอียด',    value: e.description || '—' },
    ];
  });

  workflowSteps = computed(() => {
    const e = this.exp();
    if (!e) return [];
    const submitted = e.submittedAt;
    const status = e.status;
    return [
      { label: 'สร้างคำขอ',        meta: e.createdAt ? new Date(e.createdAt).toLocaleDateString('th-TH') : '', dotClass: 'done' },
      { label: submitted ? 'ส่งคำขอแล้ว' : 'รอส่งคำขอ', meta: submitted ? new Date(submitted).toLocaleDateString('th-TH') : '', dotClass: submitted ? 'done' : '' },
      { label: 'Manager อนุมัติ', meta: '', dotClass: status === 'approved' || status === 'paid' ? 'done' : status === 'pending' ? 'active' : '' },
      { label: 'Finance จ่ายเงิน', meta: e.paidAt ? new Date(e.paidAt).toLocaleDateString('th-TH') : '', dotClass: status === 'paid' ? 'done' : '' },
    ];
  });

  doApprove(): void {
    const e = this.exp();
    if (!e) return;
    const user = this.auth.currentUser()!;
    this.expSvc.approve(e.id, user.id, user.name, this.comment);
    this.exp.set(this.expSvc.getById(e.id));
    this.comment = '';
  }

  doReject(): void {
    const e = this.exp();
    if (!e || !this.comment.trim()) { alert('กรุณาระบุเหตุผลในการปฏิเสธ'); return; }
    this.expSvc.reject(e.id, this.auth.currentUser()!.name, this.comment);
    this.exp.set(this.expSvc.getById(e.id));
    this.comment = '';
  }

  doReturn(): void {
    const e = this.exp();
    if (!e) return;
    this.expSvc.returnForEdit(e.id, this.auth.currentUser()!.name, this.comment);
    this.exp.set(this.expSvc.getById(e.id));
    this.comment = '';
  }

  confirmPay(): void {
    const e = this.exp();
    if (!e) return;
    this.expSvc.pay(e.id, this.auth.currentUser()!.name);
    this.exp.set(this.expSvc.getById(e.id));
    this.payModal.set(false);
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = { draft: 'Draft', pending: 'Pending', approved: 'Approved', rejected: 'Rejected', cancelled: 'Cancelled', paid: 'Paid' };
    return m[s] ?? s;
  }

  actionLabel(a: string): string {
    const m: Record<string, string> = { submitted: 'ส่งคำขอ', approved: 'อนุมัติ', rejected: 'ปฏิเสธ', returned: 'ส่งคืน', delegated: 'มอบหมาย', escalated: 'Escalate', paid: 'จ่ายเงิน' };
    return m[a] ?? a;
  }

  actionBadge(a: string): string {
    const m: Record<string, string> = { submitted: 'pending', approved: 'approved', rejected: 'rejected', returned: 'draft', paid: 'paid' };
    return m[a] ?? 'draft';
  }
}
