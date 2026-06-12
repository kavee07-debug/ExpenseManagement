import { Injectable, signal } from '@angular/core';
import { ExpenseRequest, ExpenseStatus, ApprovalLog } from './models';
import { MOCK_EXPENSES, MOCK_APPROVAL_LOGS } from './mock-data';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private expenses = signal<ExpenseRequest[]>(JSON.parse(JSON.stringify(MOCK_EXPENSES)));
  private logs = signal<ApprovalLog[]>(JSON.parse(JSON.stringify(MOCK_APPROVAL_LOGS)));

  getAll(): ExpenseRequest[]           { return this.expenses(); }
  getByUser(userId: string)            { return this.expenses().filter(e => e.createdBy === userId); }
  getById(id: string)                  { return this.expenses().find(e => e.id === id); }
  getPending()                         { return this.expenses().filter(e => e.status === 'pending'); }
  getLogsForRequest(reqId: string)     { return this.logs().filter(l => l.requestId === reqId); }

  create(exp: Partial<ExpenseRequest>): ExpenseRequest {
    const all = this.expenses();
    const next = String(all.length + 43).padStart(4, '0');
    const now = new Date().toISOString();
    const newExp: ExpenseRequest = {
      id: `e${Date.now()}`,
      referenceNo: `EXP-2026-${next}`,
      title: exp.title ?? '',
      categoryId: exp.categoryId ?? '',
      categoryName: exp.categoryName ?? '',
      expenseDate: exp.expenseDate ?? '',
      amount: exp.amount ?? 0,
      vatAmount: exp.vatAmount ?? 0,
      currency: exp.currency ?? 'THB',
      description: exp.description ?? '',
      status: 'draft',
      createdBy: exp.createdBy ?? '',
      createdByName: exp.createdByName ?? '',
      currentTier: 1,
      attachments: exp.attachments ?? [],
      createdAt: now,
      updatedAt: now,
    };
    this.expenses.update(list => [newExp, ...list]);
    return newExp;
  }

  update(id: string, patch: Partial<ExpenseRequest>): void {
    this.expenses.update(list =>
      list.map(e => e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e)
    );
  }

  submit(id: string, actorName: string): void {
    this.update(id, { status: 'pending', submittedAt: new Date().toISOString() });
    this.addLog(id, 1, 'submitted', actorName, '');
  }

  approve(id: string, actorId: string, actorName: string, comment: string): void {
    const exp = this.getById(id);
    if (!exp) return;
    this.update(id, { status: 'approved' });
    this.addLog(id, exp.currentTier, 'approved', actorName, comment);
  }

  reject(id: string, actorName: string, comment: string): void {
    const exp = this.getById(id);
    if (!exp) return;
    this.update(id, { status: 'rejected' });
    this.addLog(id, exp.currentTier, 'rejected', actorName, comment);
  }

  returnForEdit(id: string, actorName: string, comment: string): void {
    this.update(id, { status: 'draft' });
    this.addLog(id, 1, 'returned', actorName, comment);
  }

  pay(id: string, actorName: string): void {
    this.update(id, { status: 'paid', paidAt: new Date().toISOString() });
    this.addLog(id, 0, 'paid', actorName, 'โอนเงินแล้ว');
  }

  private addLog(requestId: string, tier: number, action: ApprovalLog['action'], actorName: string, comment: string): void {
    const log: ApprovalLog = {
      id: `l${Date.now()}`, requestId, tier, action,
      actorId: '', actorName, comment, timestamp: new Date().toISOString(),
    };
    this.logs.update(list => [...list, log]);
  }
}
