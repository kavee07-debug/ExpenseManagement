import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { MOCK_POSITIONS } from '../../../core/mock-data';
import { Position } from '../../../core/models';

@Component({
  selector: 'app-positions',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="page-header">
      <h2>จัดการตำแหน่งงาน</h2>
      <button class="btn btn-primary" (click)="openAdd()">➕ เพิ่มตำแหน่งใหม่</button>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>ชื่อตำแหน่ง (ไทย)</th>
              <th>Position Name (EN)</th>
              <th>อนุมัติคำขอได้</th>
              <th>วงเงินอนุมัติ (฿)</th>
              <th>สถานะ</th>
              <th>แก้ไข</th>
            </tr>
          </thead>
          <tbody>
            @for (p of positions(); track p.id; let i = $index) {
              <tr>
                <td class="text-muted text-sm">{{ i + 1 }}</td>
                <td class="fw-600">{{ p.nameTh }}</td>
                <td>{{ p.nameEn }}</td>
                <td>
                  @if (p.canApprove) {
                    <span class="badge badge-approved">✅ อนุมัติได้</span>
                  } @else {
                    <span class="badge badge-draft">— ไม่มีสิทธิ์</span>
                  }
                </td>
                <td>
                  @if (p.canApprove) {
                    {{ p.approvalLimit !== null ? (p.approvalLimit | number:'1.0-0') + ' ฿' : 'ไม่จำกัด' }}
                  } @else {
                    <span class="text-muted">—</span>
                  }
                </td>
                <td>
                  @if (p.isActive) { <span class="badge badge-approved">🟢 Active</span> }
                  @else { <span class="badge badge-cancelled">🔴 Inactive</span> }
                </td>
                <td style="white-space:nowrap">
                  <button class="btn btn-ghost btn-sm" (click)="openEdit(p)">✏️</button>
                  <button class="btn btn-ghost btn-sm" style="margin-left:4px" (click)="toggleActive(p)">
                    {{ p.isActive ? '🔴' : '🟢' }}
                  </button>
                </td>
              </tr>
            } @empty {
              <tr class="no-hover"><td colspan="7">
                <div class="empty-state"><div class="empty-icon">💼</div><p>ไม่มีตำแหน่ง</p></div>
              </td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    @if (modal()) {
      <div class="modal-overlay" (click)="modal.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editing() ? 'แก้ไขตำแหน่ง' : 'เพิ่มตำแหน่งใหม่' }}</h3>
            <button class="btn btn-icon btn-ghost" (click)="modal.set(false)">✕</button>
          </div>
          <div class="modal-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md)">
              <div class="form-group">
                <label class="form-label required">ชื่อตำแหน่ง (ไทย)</label>
                <input type="text" class="form-control" [(ngModel)]="form.nameTh" placeholder="ชื่อภาษาไทย" />
              </div>
              <div class="form-group">
                <label class="form-label required">Position Name (EN)</label>
                <input type="text" class="form-control" [(ngModel)]="form.nameEn" placeholder="English name" />
              </div>
            </div>

            <div class="form-group">
              <label style="display:flex;align-items:center;gap:var(--space-sm);cursor:pointer">
                <label class="toggle">
                  <input type="checkbox" [(ngModel)]="form.canApprove" (change)="onCanApproveChange()" />
                  <span class="slider"></span>
                </label>
                <span class="form-label" style="margin:0">มีสิทธิ์อนุมัติคำขอ</span>
              </label>
            </div>

            @if (form.canApprove) {
              <div class="form-group" style="animation:fadeIn 0.15s ease">
                <label class="form-label">วงเงินอนุมัติสูงสุด (฿)</label>
                <div style="display:flex;align-items:center;gap:var(--space-sm)">
                  <input type="number" class="form-control" style="width:220px"
                    [ngModel]="form.approvalLimit ?? ''"
                    (ngModelChange)="form.approvalLimit = $event === '' ? null : +$event"
                    placeholder="เว้นว่าง = ไม่จำกัด" min="0" />
                  <span class="text-sm text-muted">เว้นว่าง = ไม่จำกัดวงเงิน</span>
                </div>
              </div>
            }

            <div class="form-group">
              <label style="display:flex;align-items:center;gap:var(--space-sm);cursor:pointer">
                <label class="toggle">
                  <input type="checkbox" [(ngModel)]="form.isActive" />
                  <span class="slider"></span>
                </label>
                <span class="form-label" style="margin:0">เปิดใช้งาน</span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="modal.set(false)">ยกเลิก</button>
            <button class="btn btn-primary" (click)="save()">💾 บันทึก</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }`]
})
export class PositionsComponent {
  positions = signal<Position[]>(JSON.parse(JSON.stringify(MOCK_POSITIONS)));
  modal     = signal(false);
  editing   = signal<Position | null>(null);
  form      = { nameTh: '', nameEn: '', canApprove: false, approvalLimit: null as number | null, isActive: true };

  openAdd(): void {
    this.editing.set(null);
    this.form = { nameTh: '', nameEn: '', canApprove: false, approvalLimit: null, isActive: true };
    this.modal.set(true);
  }

  openEdit(p: Position): void {
    this.editing.set(p);
    this.form = { nameTh: p.nameTh, nameEn: p.nameEn, canApprove: p.canApprove, approvalLimit: p.approvalLimit, isActive: p.isActive };
    this.modal.set(true);
  }

  onCanApproveChange(): void {
    if (!this.form.canApprove) this.form.approvalLimit = null;
  }

  save(): void {
    if (!this.form.nameTh || !this.form.nameEn) { alert('กรุณากรอกชื่อตำแหน่ง'); return; }
    const ed = this.editing();
    if (ed) {
      this.positions.update(list => list.map(p => p.id === ed.id ? { ...p, ...this.form } : p));
    } else {
      this.positions.update(list => [...list, { id: `p${Date.now()}`, ...this.form }]);
    }
    this.modal.set(false);
  }

  toggleActive(p: Position): void {
    this.positions.update(list => list.map(x => x.id === p.id ? { ...x, isActive: !x.isActive } : x));
  }
}
