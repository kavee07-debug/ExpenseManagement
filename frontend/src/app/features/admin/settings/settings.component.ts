import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-header">
      <h2>ตั้งค่าระบบ</h2>
      <button class="btn btn-primary" (click)="save()">💾 บันทึก</button>
    </div>

    <div style="display:flex;flex-direction:column;gap:var(--space-lg);max-width:720px">

      <!-- D365 Connection -->
      <div class="card">
        <h3 style="margin-bottom:var(--space-md)">🔗 การเชื่อมต่อ D365 F&O</h3>
        <div class="form-group">
          <label class="form-label">D365 URL</label>
          <input type="url" class="form-control" [(ngModel)]="cfg.d365Url" placeholder="https://xxx.operations.dynamics.com" />
        </div>
        <div class="form-group">
          <label class="form-label">Client ID (Azure AD)</label>
          <input type="text" class="form-control" [(ngModel)]="cfg.clientId" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
        </div>
        <div class="form-group">
          <label class="form-label">Tenant ID</label>
          <input type="text" class="form-control" [(ngModel)]="cfg.tenantId" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
        </div>
        <button class="btn btn-secondary btn-sm" (click)="testConnection()">🔌 ทดสอบการเชื่อมต่อ</button>
        @if (connectionResult()) {
          <span class="badge badge-{{ connectionResult() === 'ok' ? 'approved' : 'rejected' }}" style="margin-left:8px">
            {{ connectionResult() === 'ok' ? '✅ เชื่อมต่อสำเร็จ' : '❌ เชื่อมต่อล้มเหลว' }}
          </span>
        }
      </div>

      <!-- Notification -->
      <div class="card">
        <h3 style="margin-bottom:var(--space-md)">🔔 การแจ้งเตือน</h3>
        <div style="display:flex;flex-direction:column;gap:var(--space-md)">
          @for (n of notifications; track n.key) {
            <label style="display:flex;align-items:center;justify-content:space-between;cursor:pointer">
              <div>
                <div style="font-size:14px;font-weight:500">{{ n.label }}</div>
                <div style="font-size:12px;color:var(--color-text-muted)">{{ n.desc }}</div>
              </div>
              <label class="toggle">
                <input type="checkbox" [(ngModel)]="n.enabled" />
                <span class="slider"></span>
              </label>
            </label>
          }
        </div>
      </div>

    </div>
  `
})
export class SettingsComponent {
  connectionResult = signal<'ok' | 'fail' | null>(null);

  cfg = {
    d365Url: 'https://demo.operations.dynamics.com',
    clientId: '',
    tenantId: '',
  };

  notifications = [
    { key: 'submit',   label: 'ส่งคำขอใหม่',           desc: 'แจ้ง Approver เมื่อมีคำขอใหม่',         enabled: true },
    { key: 'approve',  label: 'อนุมัติแล้ว',             desc: 'แจ้งผู้ขอเมื่อได้รับการอนุมัติ',         enabled: true },
    { key: 'reject',   label: 'ปฏิเสธ',                  desc: 'แจ้งผู้ขอเมื่อถูกปฏิเสธ',               enabled: true },
    { key: 'paid',     label: 'จ่ายเงินแล้ว',            desc: 'แจ้งผู้ขอเมื่อได้รับเงิน',              enabled: true },
    { key: 'overdue',  label: 'รออนุมัติเกิน 3 วัน',    desc: 'แจ้ง Approver เมื่อรายการใกล้หมดเวลา',  enabled: true },
    { key: 'd365fail', label: 'D365 Sync ล้มเหลว',      desc: 'แจ้งทีม Finance เมื่อ Sync ผิดพลาด',     enabled: true },
  ];

  testConnection(): void {
    this.connectionResult.set(this.cfg.d365Url ? 'ok' : 'fail');
    setTimeout(() => this.connectionResult.set(null), 3000);
  }

  save(): void {
    alert('บันทึกการตั้งค่าสำเร็จ');
  }
}
