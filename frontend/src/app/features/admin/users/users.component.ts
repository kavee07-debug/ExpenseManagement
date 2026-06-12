import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MOCK_USERS, MOCK_DEPARTMENTS, MOCK_POSITIONS } from '../../../core/mock-data';
import { User, UserRole, Department, Position } from '../../../core/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-header">
      <h2>จัดการผู้ใช้งาน</h2>
      <button class="btn btn-primary" (click)="openAdd()">➕ เพิ่มผู้ใช้ใหม่</button>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>ชื่อ-นามสกุล</th>
              <th>อีเมล</th>
              <th>แผนก</th>
              <th>ตำแหน่ง</th>
              <th>Role</th>
              <th>สถานะ</th>
              <th>แก้ไข</th>
            </tr>
          </thead>
          <tbody>
            @for (u of users(); track u.id) {
              <tr>
                <td class="fw-600">{{ u.name }}</td>
                <td class="text-sm">{{ u.email }}</td>
                <td>{{ getDeptName(u.departmentId) }}</td>
                <td>
                  {{ getPosName(u.positionId) }}
                  @if (canApprovePos(u.positionId)) {
                    <span class="badge badge-approved" style="font-size:10px;margin-left:4px">✅ อนุมัติได้</span>
                  }
                </td>
                <td><span class="badge badge-{{ roleBadge(u.role) }}">{{ roleLabel(u.role) }}</span></td>
                <td>
                  @if (u.isActive) { <span class="badge badge-approved">Active</span> }
                  @else { <span class="badge badge-cancelled">Inactive</span> }
                </td>
                <td>
                  <button class="btn btn-ghost btn-sm" (click)="openEdit(u)">✏️ แก้ไข</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    @if (modal()) {
      <div class="modal-overlay" (click)="modal.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editing() ? 'แก้ไขผู้ใช้: ' + editing()!.name : 'เพิ่มผู้ใช้ใหม่' }}</h3>
            <button class="btn btn-icon btn-ghost" (click)="modal.set(false)">✕</button>
          </div>
          <div class="modal-body">

            @if (!editing()) {
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md)">
                <div class="form-group">
                  <label class="form-label required">ชื่อ-นามสกุล</label>
                  <input type="text" class="form-control" [(ngModel)]="form.name" placeholder="ชื่อ นามสกุล" />
                </div>
                <div class="form-group">
                  <label class="form-label required">อีเมล</label>
                  <input type="email" class="form-control" [(ngModel)]="form.email" placeholder="email@company.th" />
                </div>
              </div>
            }

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md)">
              <div class="form-group">
                <label class="form-label required">แผนก</label>
                <select class="form-control" [(ngModel)]="form.departmentId">
                  <option value="">— เลือกแผนก —</option>
                  @for (d of departments(); track d.id) {
                    <option [value]="d.id">{{ d.nameTh }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label required">ตำแหน่ง</label>
                <select class="form-control" [(ngModel)]="form.positionId">
                  <option value="">— เลือกตำแหน่ง —</option>
                  @for (p of positions(); track p.id) {
                    <option [value]="p.id">{{ p.nameTh }}</option>
                  }
                </select>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md)">
              <div class="form-group">
                <label class="form-label required">Role ในระบบ</label>
                <select class="form-control" [(ngModel)]="form.role">
                  <option value="employee">พนักงาน (Employee)</option>
                  <option value="finance_admin">เจ้าหน้าที่การเงิน (Finance Admin)</option>
                  <option value="system_admin">ผู้ดูแลระบบ (System Admin)</option>
                </select>
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

            @if (form.positionId && canApprovePos(form.positionId)) {
              <div class="alert" style="background:#F0FFF4;border:1px solid #9AE6B4;border-radius:8px;padding:var(--space-sm) var(--space-md);font-size:13px;color:#276749">
                ✅ ตำแหน่งนี้มีสิทธิ์อนุมัติคำขอ (วงเงิน: {{ getApprovalLimit(form.positionId) }})
              </div>
            }

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
export class UsersComponent {
  users       = signal<User[]>(JSON.parse(JSON.stringify(MOCK_USERS)));
  departments = signal<Department[]>(JSON.parse(JSON.stringify(MOCK_DEPARTMENTS)));
  positions   = signal<Position[]>(JSON.parse(JSON.stringify(MOCK_POSITIONS)));
  modal   = signal(false);
  editing = signal<User | null>(null);

  form = {
    name: '', email: '',
    departmentId: '', positionId: '',
    role: 'employee' as UserRole, isActive: true,
  };

  openAdd(): void {
    this.editing.set(null);
    this.form = { name: '', email: '', departmentId: '', positionId: '', role: 'employee', isActive: true };
    this.modal.set(true);
  }

  openEdit(u: User): void {
    this.editing.set(u);
    this.form = {
      name: u.name, email: u.email,
      departmentId: u.departmentId, positionId: u.positionId,
      role: u.role, isActive: u.isActive,
    };
    this.modal.set(true);
  }

  save(): void {
    const ed = this.editing();
    if (ed) {
      this.users.update(list => list.map(u => u.id === ed.id
        ? { ...u, departmentId: this.form.departmentId, positionId: this.form.positionId, role: this.form.role, isActive: this.form.isActive }
        : u));
    } else {
      if (!this.form.name || !this.form.email) { alert('กรุณากรอกชื่อและอีเมล'); return; }
      const next: User = {
        id: `u${Date.now()}`,
        name: this.form.name, email: this.form.email,
        departmentId: this.form.departmentId, positionId: this.form.positionId,
        role: this.form.role, isActive: this.form.isActive,
      };
      this.users.update(list => [...list, next]);
    }
    this.modal.set(false);
  }

  getDeptName(id: string): string {
    return this.departments().find(d => d.id === id)?.nameTh ?? id;
  }
  getPosName(id: string): string {
    return this.positions().find(p => p.id === id)?.nameTh ?? id;
  }
  canApprovePos(posId: string): boolean {
    return this.positions().find(p => p.id === posId)?.canApprove ?? false;
  }
  getApprovalLimit(posId: string): string {
    const pos = this.positions().find(p => p.id === posId);
    if (!pos) return '—';
    return pos.approvalLimit !== null
      ? pos.approvalLimit.toLocaleString('th-TH') + ' ฿'
      : 'ไม่จำกัด';
  }

  roleLabel(r: UserRole): string {
    const m: Record<string, string> = {
      employee: 'พนักงาน', finance_admin: 'การเงิน', system_admin: 'Admin'
    };
    return m[r] ?? r;
  }
  roleBadge(r: UserRole): string {
    const m: Record<string, string> = { employee: 'draft', finance_admin: 'approved', system_admin: 'pending' };
    return m[r] ?? 'draft';
  }
}
