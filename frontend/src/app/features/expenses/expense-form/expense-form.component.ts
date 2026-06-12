import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { ExpenseService } from '../../../core/expense.service';
import { MOCK_CATEGORIES } from '../../../core/mock-data';
import { Attachment } from '../../../core/models';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-header">
      <h2>{{ editId() ? 'แก้ไขคำขอ' : 'สร้างคำขอเบิกค่าใช้จ่าย' }}</h2>
    </div>

    <div class="card" style="max-width:720px">
      @if (submitted() && errors().length > 0) {
        <div class="alert alert-error" style="margin-bottom:var(--space-md)">
          <ul style="margin:0;padding-left:16px">
            @for (e of errors(); track e) { <li>{{ e }}</li> }
          </ul>
        </div>
      }

      <h3 style="margin-bottom:var(--space-md)">ข้อมูลทั่วไป</h3>

      <div class="form-group">
        <label class="form-label required">หัวข้อ</label>
        <input type="text" class="form-control" [(ngModel)]="form.title" placeholder="ระบุหัวข้อคำขอ" />
      </div>

      <div class="grid-2">
        <div class="form-group">
          <label class="form-label required">หมวดค่าใช้จ่าย</label>
          <select class="form-control" [(ngModel)]="form.categoryId" (change)="onCategoryChange()">
            <option value="">— เลือกหมวด —</option>
            @for (c of categories; track c.id) {
              <option [value]="c.id">{{ c.nameTh }} ({{ c.nameEn }})</option>
            }
          </select>
        </div>
        <div class="form-group">
          <label class="form-label required">วันที่ใช้จ่าย</label>
          <input type="date" class="form-control" [(ngModel)]="form.expenseDate" />
        </div>
      </div>

      <div class="grid-2">
        <div class="form-group">
          <label class="form-label required">จำนวนเงิน (THB)</label>
          <input type="number" class="form-control" [(ngModel)]="form.amount" placeholder="0.00" min="0" step="0.01" (input)="autoVat()" />
        </div>
        <div class="form-group">
          <label class="form-label">ภาษีมูลค่าเพิ่ม / VAT (THB)</label>
          <input type="number" class="form-control" [(ngModel)]="form.vatAmount" placeholder="0.00" min="0" step="0.01" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">สกุลเงิน</label>
        <select class="form-control" [(ngModel)]="form.currency" style="width:160px">
          <option value="THB">THB — บาทไทย</option>
          <option value="USD">USD — ดอลลาร์สหรัฐ</option>
          <option value="EUR">EUR — ยูโร</option>
          <option value="JPY">JPY — เยน</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">รายละเอียดเพิ่มเติม</label>
        <textarea class="form-control" [(ngModel)]="form.description" placeholder="อธิบายรายละเอียดค่าใช้จ่าย..." rows="3"></textarea>
      </div>

      <h3 style="margin:var(--space-md) 0 var(--space-sm)">เอกสารแนบ</h3>
      <div class="dropzone" (click)="fileInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
        <div class="dropzone-icon">📁</div>
        <p>ลากไฟล์มาวางที่นี่ หรือ <strong>คลิกเพื่อเลือกไฟล์</strong></p>
        <p class="text-xs text-muted">รองรับ: JPG, PNG, PDF (สูงสุด 10MB ต่อไฟล์)</p>
      </div>
      <input #fileInput type="file" multiple accept=".jpg,.jpeg,.png,.pdf" style="display:none" (change)="onFileSelect($event)" />

      @if (attachments().length > 0) {
        <div class="attachment-list">
          @for (a of attachments(); track a.id) {
            <div class="attachment-item">
              <span>{{ fileIcon(a.type) }} {{ a.name }}</span>
              <span class="text-xs text-muted">{{ formatSize(a.size) }}</span>
              <button class="btn btn-icon btn-ghost btn-sm" (click)="removeAttachment(a.id)">✕</button>
            </div>
          }
        </div>
      }

      <div class="form-actions">
        <button type="button" class="btn btn-ghost" (click)="router.navigate(['/expenses'])">ยกเลิก</button>
        <button type="button" class="btn btn-secondary" (click)="save('draft')">💾 บันทึก Draft</button>
        <button type="button" class="btn btn-primary" (click)="save('submit')">ส่งคำขอ ➜</button>
      </div>
    </div>
  `,
  styles: [`
    .attachment-list { display: flex; flex-direction: column; gap: 6px; margin: var(--space-sm) 0; }
    .attachment-item {
      display: flex; align-items: center; gap: var(--space-sm);
      padding: var(--space-sm); background: var(--color-bg); border-radius: 6px; font-size: 14px;
      span:first-child { flex: 1; }
    }
    .form-actions { display: flex; gap: var(--space-sm); justify-content: flex-end; margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--color-border); }
  `]
})
export class ExpenseFormComponent implements OnInit {
  auth    = inject(AuthService);
  expSvc  = inject(ExpenseService);
  router  = inject(Router);
  route   = inject(ActivatedRoute);

  categories = MOCK_CATEGORIES.filter(c => c.isActive);
  editId  = signal<string | null>(null);
  submitted = signal(false);
  attachments = signal<Attachment[]>([]);
  errors = signal<string[]>([]);

  form = {
    title: '', categoryId: '', categoryName: '',
    expenseDate: new Date().toISOString().split('T')[0],
    amount: 0, vatAmount: 0, currency: 'THB', description: '',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.editId.set(id);
      const exp = this.expSvc.getById(id);
      if (exp) {
        Object.assign(this.form, {
          title: exp.title, categoryId: exp.categoryId, categoryName: exp.categoryName,
          expenseDate: exp.expenseDate, amount: exp.amount, vatAmount: exp.vatAmount,
          currency: exp.currency, description: exp.description,
        });
        this.attachments.set([...exp.attachments]);
      }
    }
  }

  onCategoryChange(): void {
    const cat = this.categories.find(c => c.id === this.form.categoryId);
    this.form.categoryName = cat ? `${cat.nameTh} (${cat.nameEn})` : '';
  }

  autoVat(): void {
    if (this.form.amount > 0) {
      this.form.vatAmount = Math.round(this.form.amount * 0.07 * 100) / 100;
    }
  }

  onFileSelect(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files) this.addFiles(files);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) this.addFiles(event.dataTransfer.files);
  }

  private addFiles(files: FileList): void {
    const current = this.attachments();
    const added: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.size > 10 * 1024 * 1024) continue;
      added.push({ id: `a${Date.now()}_${i}`, name: f.name, type: f.type, size: f.size, url: '#' });
    }
    this.attachments.set([...current, ...added]);
  }

  removeAttachment(id: string): void {
    this.attachments.update(list => list.filter(a => a.id !== id));
  }

  validate(): string[] {
    const errs: string[] = [];
    if (!this.form.title.trim()) errs.push('กรุณากรอกหัวข้อ');
    if (!this.form.categoryId)   errs.push('กรุณาเลือกหมวดค่าใช้จ่าย');
    if (!this.form.expenseDate)  errs.push('กรุณาระบุวันที่');
    if (!this.form.amount || this.form.amount <= 0) errs.push('กรุณากรอกจำนวนเงิน');
    return errs;
  }

  save(action: 'draft' | 'submit'): void {
    this.submitted.set(true);
    if (action === 'submit') {
      const errs = this.validate();
      this.errors.set(errs);
      if (errs.length > 0) return;
    }
    const user = this.auth.currentUser()!;
    const data = { ...this.form, createdBy: user.id, createdByName: user.name, attachments: this.attachments() };

    const id = this.editId();
    if (id) {
      this.expSvc.update(id, data);
      if (action === 'submit') this.expSvc.submit(id, user.name);
    } else {
      const exp = this.expSvc.create(data);
      if (action === 'submit') this.expSvc.submit(exp.id, user.name);
    }
    this.router.navigate(['/expenses']);
  }

  fileIcon(type: string): string {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼';
    return '📎';
  }

  formatSize(bytes: number): string {
    return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
  }
}
