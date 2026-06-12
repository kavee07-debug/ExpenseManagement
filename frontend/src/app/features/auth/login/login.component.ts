import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card card">
        <div class="login-logo">💼</div>
        <h2 class="login-title">ระบบเบิกค่าใช้จ่าย</h2>
        <p class="text-muted" style="text-align:center;margin-bottom:var(--space-lg)">Expense Management Application</p>

        <button class="btn btn-primary w-100 ms-btn" (click)="loginMs()">
          <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
            <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
            <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
          </svg>
          เข้าสู่ระบบด้วย Microsoft Account
        </button>

        <div class="divider" style="margin:var(--space-md) 0">หรือ</div>

        @if (error()) {
          <div class="alert alert-error">{{ error() }}</div>
        }

        <form (ngSubmit)="loginLocal()">
          <div class="form-group">
            <label class="form-label">อีเมล</label>
            <input type="email" class="form-control" [(ngModel)]="email" name="email" placeholder="email@company.th" />
          </div>
          <div class="form-group">
            <label class="form-label">รหัสผ่าน</label>
            <input type="password" class="form-control" [(ngModel)]="password" name="password" placeholder="••••••••" />
          </div>
          <button type="submit" class="btn btn-secondary w-100">เข้าสู่ระบบ</button>
        </form>

        <div class="demo-section">
          <p class="text-xs text-muted" style="text-align:center;margin-bottom:var(--space-sm)">Demo — เข้าสู่ระบบเป็น:</p>
          <div class="demo-btns">
            @for (r of demoUsers; track r.userId) {
              <button class="btn btn-ghost btn-sm" (click)="auth.loginAsUser(r.userId)">{{ r.label }}</button>
            }
          </div>
        </div>

        <p class="text-xs text-muted" style="text-align:center;margin-top:var(--space-lg)">v1.0 | © 2026 EMA</p>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: var(--color-bg); padding: var(--space-md);
    }
    .login-card { width: 100%; max-width: 420px; }
    .login-logo { font-size: 48px; text-align: center; margin-bottom: var(--space-sm); }
    .login-title { text-align: center; margin-bottom: 0; }
    .ms-btn { gap: var(--space-sm); justify-content: center; }
    .demo-section { margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--color-border); }
    .demo-btns { display: flex; flex-wrap: wrap; gap: var(--space-sm); justify-content: center; }
  `]
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);

  email = '';
  password = '';
  error = signal('');

  demoUsers: { userId: string; label: string }[] = [
    { userId: 'u1', label: 'พนักงาน (สมชาย)' },
    { userId: 'u2', label: 'ผู้จัดการ (สมศักดิ์)' },
    { userId: 'u4', label: 'กรรมการ (ประยุทธ์)' },
    { userId: 'u3', label: 'การเงิน (วิภา)' },
    { userId: 'u6', label: 'System Admin' },
  ];

  loginMs(): void {
    this.auth.loginAsUser('u1');
  }

  loginLocal(): void {
    if (!this.email) { this.error.set('กรุณากรอกอีเมล'); return; }
    const ok = this.auth.login(this.email, this.password);
    if (ok) { this.router.navigate(['/dashboard']); }
    else { this.error.set('อีเมลหรือรหัสผ่านไม่ถูกต้อง'); }
  }
}
