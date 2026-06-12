import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { MOCK_CATEGORIES } from '../../../core/mock-data';
import { Category, CategoryApprovalConfig, ApprovalTierRule } from '../../../core/models';

const DEFAULT_TIERS: ApprovalTierRule[] = [
  { role: 'manager',   label: 'ผู้จัดการ',        minAmount: 0,      maxAmount: 99999  },
  { role: 'md',        label: 'กรรมการผู้จัดการ', minAmount: 100000, maxAmount: 499999 },
  { role: 'president', label: 'ประธานบริษัท',     minAmount: 500000, maxAmount: null   },
];

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="page-header">
      <h2>จัดการหมวดค่าใช้จ่าย</h2>
      <button class="btn btn-primary" (click)="openAdd()">➕ เพิ่มหมวดใหม่</button>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>ชื่อหมวด (TH)</th>
              <th>Category (EN)</th>
              <th>GL Account</th>
              <th>Workflow การอนุมัติ</th>
              <th>สถานะ</th>
              <th>แก้ไข</th>
            </tr>
          </thead>
          <tbody>
            @for (c of cats(); track c.id; let i = $index) {
              <tr>
                <td class="text-muted text-sm">{{ i + 1 }}</td>
                <td class="fw-600">{{ c.nameTh }}</td>
                <td>{{ c.nameEn }}</td>
                <td><code style="background:var(--color-bg);padding:2px 6px;border-radius:4px;font-size:13px">{{ c.glAccount }}</code></td>
                <td>
                  @if (c.approval.mode === 'system') {
                    <span class="badge badge-draft" style="font-size:11px">⚙️ ตามระบบ</span>
                  } @else {
                    <div style="font-size:12px;line-height:1.6">
                      @if (c.approval.autoApproveLimit > 0) {
                        <span class="badge badge-approved" style="font-size:11px;margin-right:4px">
                          อัตโนมัติ ≤ {{ c.approval.autoApproveLimit | number:'1.0-0' }} ฿
                        </span>
                      }
                      @for (t of c.approval.tiers; track t.role) {
                        <span class="badge badge-pending" style="font-size:11px;margin-right:4px">
                          {{ t.label }}: {{ t.minAmount | number:'1.0-0' }}{{ t.maxAmount ? '–' + (t.maxAmount | number:'1.0-0') : '+' }} ฿
                        </span>
                      }
                    </div>
                  }
                </td>
                <td>
                  @if (c.isActive) { <span class="badge badge-approved">🟢 Active</span> }
                  @else { <span class="badge badge-cancelled">🔴 Inactive</span> }
                </td>
                <td style="white-space:nowrap">
                  <button class="btn btn-ghost btn-sm" (click)="openEdit(c)">✏️ แก้ไข</button>
                  <button class="btn btn-ghost btn-sm" style="margin-left:4px" (click)="toggleActive(c)">
                    {{ c.isActive ? '🔴' : '🟢' }}
                  </button>
                </td>
              </tr>
            } @empty {
              <tr class="no-hover"><td colspan="7"><div class="empty-state"><div class="empty-icon">📁</div><p>ไม่มีหมวด</p></div></td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    @if (modal()) {
      <div class="modal-overlay" (click)="modal.set(false)">
        <div class="modal" style="max-width:640px;width:100%" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editing() ? 'แก้ไขหมวด — ' + editing()!.nameTh : 'เพิ่มหมวดใหม่' }}</h3>
            <button class="btn btn-icon btn-ghost" (click)="modal.set(false)">✕</button>
          </div>
          <div class="modal-body" style="max-height:70vh;overflow-y:auto">

            <!-- Basic Info -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md)">
              <div class="form-group">
                <label class="form-label required">ชื่อหมวด (TH)</label>
                <input type="text" class="form-control" [(ngModel)]="form.nameTh" placeholder="ชื่อภาษาไทย" />
              </div>
              <div class="form-group">
                <label class="form-label required">Category Name (EN)</label>
                <input type="text" class="form-control" [(ngModel)]="form.nameEn" placeholder="English name" />
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md)">
              <div class="form-group">
                <label class="form-label required">GL Account</label>
                <input type="text" class="form-control" [(ngModel)]="form.glAccount" placeholder="6xxx" />
              </div>
              <div class="form-group">
                <label style="display:flex;align-items:center;gap:var(--space-sm);cursor:pointer;padding-top:28px">
                  <label class="toggle">
                    <input type="checkbox" [(ngModel)]="form.isActive" />
                    <span class="slider"></span>
                  </label>
                  <span class="form-label" style="margin:0">เปิดใช้งาน</span>
                </label>
              </div>
            </div>

            <!-- Approval Workflow -->
            <div style="border-top:1px solid var(--color-border);margin-top:var(--space-md);padding-top:var(--space-md)">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-md)">
                <h3 style="margin:0">⚙️ Workflow การอนุมัติ</h3>
                <div style="display:flex;gap:var(--space-sm)">
                  <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px">
                    <input type="radio" name="approvalMode" [value]="'system'" [(ngModel)]="approvalForm.mode" (change)="onModeChange()" />
                    ใช้ค่าระบบ
                  </label>
                  <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px">
                    <input type="radio" name="approvalMode" [value]="'custom'" [(ngModel)]="approvalForm.mode" />
                    กำหนดเอง
                  </label>
                </div>
              </div>

              @if (approvalForm.mode === 'system') {
                <div class="alert" style="background:var(--color-accent);border:1px solid #C7D2FE;border-radius:8px;padding:var(--space-md)">
                  <div style="font-size:13px;font-weight:600;color:var(--color-primary);margin-bottom:8px">วงเงินอนุมัติตามระบบ (ค่า Default)</div>
                  <table style="width:100%;font-size:13px;border-collapse:collapse">
                    @for (t of defaultTiers; track t.role) {
                      <tr style="border-top:1px solid #C7D2FE">
                        <td style="padding:6px 0;font-weight:500">{{ t.label }}</td>
                        <td style="padding:6px 0;color:var(--color-text-secondary)">
                          {{ t.minAmount | number:'1.0-0' }} – {{ t.maxAmount ? (t.maxAmount | number:'1.0-0') : '∞' }} ฿
                        </td>
                      </tr>
                    }
                  </table>
                </div>
              }

              @if (approvalForm.mode === 'custom') {
                <!-- Auto-approve limit -->
                <div class="form-group">
                  <label class="form-label">อนุมัติอัตโนมัติ ถ้าจำนวนเงินไม่เกิน (฿)</label>
                  <div style="display:flex;align-items:center;gap:var(--space-sm)">
                    <input type="number" class="form-control" style="width:200px" [(ngModel)]="approvalForm.autoApproveLimit" min="0" placeholder="0 = ไม่มี" />
                    <span class="text-sm text-muted">0 = ปิดการอนุมัติอัตโนมัติ</span>
                  </div>
                </div>

                <!-- Tier table -->
                <div style="border:1px solid var(--color-border);border-radius:10px;overflow:hidden;margin-top:var(--space-sm)">
                  <div style="padding:10px 14px;background:var(--color-bg);border-bottom:1px solid var(--color-border);display:flex;align-items:center;justify-content:space-between">
                    <span style="font-size:13px;font-weight:600">ขั้นการอนุมัติ</span>
                    <button class="btn btn-secondary btn-sm" (click)="addTier()">➕ เพิ่ม Tier</button>
                  </div>

                  @if (approvalForm.tiers.length === 0) {
                    <div style="padding:var(--space-md);text-align:center;color:var(--color-text-muted);font-size:13px">
                      ยังไม่มีขั้นการอนุมัติ — กดเพิ่ม Tier
                    </div>
                  }

                  @for (tier of approvalForm.tiers; track $index; let i = $index) {
                    <div style="padding:12px 14px;border-top:1px solid var(--color-border);display:grid;grid-template-columns:160px 130px 130px 1fr 32px;gap:var(--space-sm);align-items:center">
                      <div>
                        <label style="font-size:11px;color:var(--color-text-muted);display:block;margin-bottom:3px">ผู้อนุมัติ</label>
                        <select class="form-control" [(ngModel)]="tier.role" (change)="onRoleChange(tier)">
                          <option value="manager">ผู้จัดการ</option>
                          <option value="md">กรรมการผู้จัดการ</option>
                          <option value="president">ประธานบริษัท</option>
                        </select>
                      </div>
                      <div>
                        <label style="font-size:11px;color:var(--color-text-muted);display:block;margin-bottom:3px">วงเงินต่ำสุด (฿)</label>
                        <input type="number" class="form-control" [(ngModel)]="tier.minAmount" min="0" placeholder="0" />
                      </div>
                      <div>
                        <label style="font-size:11px;color:var(--color-text-muted);display:block;margin-bottom:3px">วงเงินสูงสุด (฿)</label>
                        <input type="number" class="form-control" [ngModel]="tier.maxAmount ?? ''" (ngModelChange)="tier.maxAmount = $event === '' ? null : +$event" placeholder="ไม่จำกัด" />
                      </div>
                      <div>
                        <label style="font-size:11px;color:var(--color-text-muted);display:block;margin-bottom:3px">ชื่อที่แสดง</label>
                        <input type="text" class="form-control" [(ngModel)]="tier.label" placeholder="ชื่อผู้อนุมัติ" />
                      </div>
                      <button class="btn btn-danger btn-sm btn-icon" style="align-self:flex-end" (click)="removeTier(i)">✕</button>
                    </div>
                  }
                </div>

                @if (approvalForm.tiers.length > 0) {
                  <div style="margin-top:var(--space-sm);padding:var(--space-sm) var(--space-md);background:var(--color-bg);border-radius:8px;font-size:12px;color:var(--color-text-secondary)">
                    💡 ตัวอย่าง: อนุมัติอัตโนมัติ ≤ {{ approvalForm.autoApproveLimit | number:'1.0-0' }} ฿ →
                    @for (t of approvalForm.tiers; track $index; let last = $last) {
                      {{ t.label }} ({{ t.minAmount | number:'1.0-0' }}{{ t.maxAmount ? '–' + (t.maxAmount | number:'1.0-0') : '+' }} ฿){{ !last ? ' → ' : '' }}
                    }
                  </div>
                }
              }
            </div>

          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="modal.set(false)">ยกเลิก</button>
            <button class="btn btn-primary" (click)="save()">💾 บันทึก</button>
          </div>
        </div>
      </div>
    }
  `
})
export class CategoriesComponent {
  cats    = signal<Category[]>(JSON.parse(JSON.stringify(MOCK_CATEGORIES)));
  modal   = signal(false);
  editing = signal<Category | null>(null);

  defaultTiers = DEFAULT_TIERS;

  form = { nameTh: '', nameEn: '', glAccount: '', isActive: true };
  approvalForm: CategoryApprovalConfig = this.blankApproval();

  blankApproval(): CategoryApprovalConfig {
    return { mode: 'system', autoApproveLimit: 0, tiers: [] };
  }

  openAdd(): void {
    this.editing.set(null);
    this.form = { nameTh: '', nameEn: '', glAccount: '', isActive: true };
    this.approvalForm = this.blankApproval();
    this.modal.set(true);
  }

  openEdit(c: Category): void {
    this.editing.set(c);
    this.form = { nameTh: c.nameTh, nameEn: c.nameEn, glAccount: c.glAccount, isActive: c.isActive };
    this.approvalForm = JSON.parse(JSON.stringify(c.approval));
    this.modal.set(true);
  }

  onModeChange(): void {
    if (this.approvalForm.mode === 'system') {
      this.approvalForm.tiers = [];
      this.approvalForm.autoApproveLimit = 0;
    }
  }

  addTier(): void {
    const lastTier = this.approvalForm.tiers.at(-1);
    const nextMin = lastTier ? (lastTier.maxAmount ?? 0) + 1 : 0;
    this.approvalForm.tiers.push({ role: 'manager', label: 'ผู้จัดการ', minAmount: nextMin, maxAmount: null });
  }

  removeTier(i: number): void {
    this.approvalForm.tiers.splice(i, 1);
  }

  onRoleChange(tier: ApprovalTierRule): void {
    const labels: Record<string, string> = { manager: 'ผู้จัดการ', md: 'กรรมการผู้จัดการ', president: 'ประธานบริษัท' };
    tier.label = labels[tier.role] ?? tier.role;
  }

  save(): void {
    const approval = JSON.parse(JSON.stringify(this.approvalForm)) as CategoryApprovalConfig;
    const ed = this.editing();
    if (ed) {
      this.cats.update(list => list.map(c => c.id === ed.id ? { ...c, ...this.form, approval } : c));
    } else {
      const next: Category = { id: `c${Date.now()}`, ...this.form, approval };
      this.cats.update(list => [...list, next]);
    }
    this.modal.set(false);
  }

  toggleActive(c: Category): void {
    this.cats.update(list => list.map(x => x.id === c.id ? { ...x, isActive: !x.isActive } : x));
  }
}
