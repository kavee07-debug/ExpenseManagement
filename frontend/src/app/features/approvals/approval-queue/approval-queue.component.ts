import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { AuthService } from '../../../core/auth.service';
import { ExpenseService } from '../../../core/expense.service';
import { ExpenseRequest } from '../../../core/models';

@Component({
  selector: 'app-approval-queue',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe],
  template: `
    <div class="page-header">
      <h2>{{ isHistory() ? 'ประวัติการอนุมัติ' : 'รออนุมัติ' }}
        <span class="badge badge-{{ isHistory() ? 'approved' : 'rejected' }}" style="font-size:14px;margin-left:8px">{{ items().length }} รายการ</span>
      </h2>
    </div>

    @if (!isHistory() && overdue().length > 0) {
      <div class="alert alert-warning">
        ⚠️ มีรายการรออนุมัติเกิน 3 วัน — {{ overdue().length }} รายการ
      </div>
    }

    @if (!isHistory() && selected().length > 0) {
      <div class="card" style="margin-bottom:var(--space-md);background:var(--color-accent);display:flex;align-items:center;gap:var(--space-md)">
        <span>เลือก {{ selected().length }} รายการ</span>
        <button class="btn btn-success btn-sm" (click)="bulkApprove()">✅ อนุมัติที่เลือก</button>
        <button class="btn btn-ghost btn-sm" (click)="selected.set([])">ยกเลิกการเลือก</button>
      </div>
    }

    <div style="margin-bottom:var(--space-md);display:flex;gap:var(--space-sm)">
      <input type="text" class="form-control" style="width:220px" [ngModel]="search()" (ngModelChange)="search.set($event)" placeholder="🔍 ค้นหา..." />
      <select class="form-control" style="width:180px" [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)">
        <option value="date">เรียงตาม: วันที่ส่ง</option>
        <option value="amount">เรียงตาม: จำนวนเงิน</option>
        <option value="days">เรียงตาม: วันที่รอ</option>
      </select>
    </div>

    <div class="approval-list">
      @for (exp of filtered(); track exp.id) {
        <div class="approval-card card" [class.overdue-card]="daysWaiting(exp) >= 3">
          <div class="approval-card-header">
            <label style="display:flex;align-items:center;gap:var(--space-sm);cursor:pointer">
              <input type="checkbox" [checked]="isSelected(exp.id)" (change)="toggleSelect(exp.id)" />
              <span class="fw-600">{{ exp.referenceNo }}</span>
            </label>
            <div class="waiting-badge" [class.overdue]="daysWaiting(exp) >= 3">
              {{ daysWaiting(exp) >= 3 ? '⚠️' : '⏱' }}
              รอ {{ daysWaiting(exp) }} วัน
              {{ daysWaiting(exp) >= 3 ? '(ใกล้ครบกำหนด)' : '' }}
            </div>
          </div>

          <div class="approval-card-body">
            <div>
              <div class="fw-600">{{ exp.createdByName }}</div>
              <div class="text-sm text-muted">{{ exp.title }}</div>
              <div class="text-sm">{{ exp.categoryName }} · <strong>{{ exp.amount | number:'1.2-2' }} ฿</strong></div>
            </div>
            <div class="approval-actions">
              <a [routerLink]="'/expenses/' + exp.id" class="btn btn-ghost btn-sm">ดูรายละเอียด</a>
              @if (!isHistory()) {
                <button class="btn btn-success btn-sm" (click)="approve(exp, '')">✅ อนุมัติ</button>
                <button class="btn btn-danger btn-sm"  (click)="openReject(exp)">❌</button>
              } @else {
                <span class="badge badge-{{ exp.status }}">{{ statusLabel(exp.status) }}</span>
              }
            </div>
          </div>
        </div>
      } @empty {
        <div class="empty-state">
          <div class="empty-icon">✅</div>
          <p>ไม่มีรายการรออนุมัติ</p>
        </div>
      }
    </div>

    <!-- Reject Modal -->
    @if (rejectTarget()) {
      <div class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3>ปฏิเสธคำขอ</h3>
            <button class="btn btn-icon btn-ghost" (click)="rejectTarget.set(null)">✕</button>
          </div>
          <div class="modal-body">
            <p style="margin-bottom:var(--space-sm)">กรุณาระบุเหตุผลในการปฏิเสธ <strong>{{ rejectTarget()!.referenceNo }}</strong></p>
            <textarea class="form-control" [(ngModel)]="rejectComment" placeholder="ระบุเหตุผล..." rows="3"></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="rejectTarget.set(null)">ยกเลิก</button>
            <button class="btn btn-danger" (click)="confirmReject()">❌ ยืนยันการปฏิเสธ</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .approval-list { display: flex; flex-direction: column; gap: var(--space-md); }
    .approval-card { padding: var(--space-md) var(--space-lg); }
    .overdue-card  { border-left: 4px solid #F6AD55; }
    .approval-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-sm); }
    .approval-card-body   { display: flex; align-items: center; justify-content: space-between; gap: var(--space-md); flex-wrap: wrap; }
    .approval-actions     { display: flex; gap: var(--space-sm); flex-shrink: 0; }
    .waiting-badge { font-size: 13px; color: var(--color-text-secondary); &.overdue { color: #D69E2E; font-weight: 600; } }
  `]
})
export class ApprovalQueueComponent {
  auth   = inject(AuthService);
  expSvc = inject(ExpenseService);
  private route = inject(ActivatedRoute);

  isHistory = computed(() => this.route.snapshot.url[1]?.path === 'history');

  search   = signal('');
  sortBy   = signal('date');
  selected = signal<string[]>([]);
  rejectTarget = signal<ExpenseRequest | null>(null);
  rejectComment = '';

  items = computed(() => this.isHistory()
    ? this.expSvc.getAll().filter(e => ['approved','rejected','paid'].includes(e.status))
    : this.expSvc.getPending()
  );
  overdue = computed(() => this.items().filter(e => this.daysWaiting(e) >= 3));

  filtered = computed(() => {
    let list = this.items();
    const s = this.search().toLowerCase();
    if (s) list = list.filter(e => e.referenceNo.toLowerCase().includes(s) || e.createdByName.toLowerCase().includes(s));
    if (this.sortBy() === 'amount') list = [...list].sort((a,b) => b.amount - a.amount);
    else if (this.sortBy() === 'days') list = [...list].sort((a,b) => this.daysWaiting(b) - this.daysWaiting(a));
    return list;
  });

  daysWaiting(e: ExpenseRequest): number {
    if (!e.submittedAt) return 0;
    return Math.floor((Date.now() - new Date(e.submittedAt).getTime()) / 86400000);
  }

  isSelected(id: string) { return this.selected().includes(id); }
  toggleSelect(id: string) {
    this.selected.update(list => list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  }

  approve(exp: ExpenseRequest, comment: string): void {
    const user = this.auth.currentUser()!;
    this.expSvc.approve(exp.id, user.id, user.name, comment);
  }

  bulkApprove(): void {
    const user = this.auth.currentUser()!;
    this.selected().forEach(id => {
      const e = this.expSvc.getById(id);
      if (e) this.expSvc.approve(id, user.id, user.name, 'อนุมัติกลุ่ม');
    });
    this.selected.set([]);
  }

  openReject(exp: ExpenseRequest): void {
    this.rejectTarget.set(exp);
    this.rejectComment = '';
  }

  confirmReject(): void {
    const e = this.rejectTarget();
    if (!e || !this.rejectComment.trim()) { alert('กรุณาระบุเหตุผล'); return; }
    this.expSvc.reject(e.id, this.auth.currentUser()!.name, this.rejectComment);
    this.rejectTarget.set(null);
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = { approved: 'Approved', rejected: 'Rejected', paid: 'Paid' };
    return m[s] ?? s;
  }
}
