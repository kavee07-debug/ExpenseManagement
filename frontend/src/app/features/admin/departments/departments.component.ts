import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MOCK_DEPARTMENTS } from '../../../core/mock-data';
import { Department } from '../../../core/models';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-header">
      <h2>จัดการแผนก</h2>
      <button class="btn btn-primary" (click)="openAdd()">➕ เพิ่มแผนกใหม่</button>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>ชื่อแผนก (ไทย)</th>
              <th>Department Name (EN)</th>
              <th>สถานะ</th>
              <th>แก้ไข</th>
            </tr>
          </thead>
          <tbody>
            @for (d of depts(); track d.id; let i = $index) {
              <tr>
                <td class="text-muted text-sm">{{ i + 1 }}</td>
                <td class="fw-600">{{ d.nameTh }}</td>
                <td>{{ d.nameEn }}</td>
                <td>
                  @if (d.isActive) { <span class="badge badge-approved">🟢 Active</span> }
                  @else { <span class="badge badge-cancelled">🔴 Inactive</span> }
                </td>
                <td style="white-space:nowrap">
                  <button class="btn btn-ghost btn-sm" (click)="openEdit(d)">✏️</button>
                  <button class="btn btn-ghost btn-sm" style="margin-left:4px" (click)="toggleActive(d)">
                    {{ d.isActive ? '🔴' : '🟢' }}
                  </button>
                </td>
              </tr>
            } @empty {
              <tr class="no-hover"><td colspan="5">
                <div class="empty-state"><div class="empty-icon">🏢</div><p>ไม่มีแผนก</p></div>
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
            <h3>{{ editing() ? 'แก้ไขแผนก' : 'เพิ่มแผนกใหม่' }}</h3>
            <button class="btn btn-icon btn-ghost" (click)="modal.set(false)">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label required">ชื่อแผนก (ไทย)</label>
              <input type="text" class="form-control" [(ngModel)]="form.nameTh" placeholder="ชื่อภาษาไทย" />
            </div>
            <div class="form-group">
              <label class="form-label required">Department Name (EN)</label>
              <input type="text" class="form-control" [(ngModel)]="form.nameEn" placeholder="English name" />
            </div>
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
  `
})
export class DepartmentsComponent {
  depts   = signal<Department[]>(JSON.parse(JSON.stringify(MOCK_DEPARTMENTS)));
  modal   = signal(false);
  editing = signal<Department | null>(null);
  form    = { nameTh: '', nameEn: '', isActive: true };

  openAdd(): void {
    this.editing.set(null);
    this.form = { nameTh: '', nameEn: '', isActive: true };
    this.modal.set(true);
  }

  openEdit(d: Department): void {
    this.editing.set(d);
    this.form = { nameTh: d.nameTh, nameEn: d.nameEn, isActive: d.isActive };
    this.modal.set(true);
  }

  save(): void {
    if (!this.form.nameTh || !this.form.nameEn) { alert('กรุณากรอกชื่อแผนก'); return; }
    const ed = this.editing();
    if (ed) {
      this.depts.update(list => list.map(d => d.id === ed.id ? { ...d, ...this.form } : d));
    } else {
      this.depts.update(list => [...list, { id: `d${Date.now()}`, ...this.form }]);
    }
    this.modal.set(false);
  }

  toggleActive(d: Department): void {
    this.depts.update(list => list.map(x => x.id === d.id ? { ...x, isActive: !x.isActive } : x));
  }
}
