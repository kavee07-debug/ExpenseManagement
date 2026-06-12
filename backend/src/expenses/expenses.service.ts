import { Injectable, NotFoundException } from '@nestjs/common';
import { EXPENSES, APPROVAL_LOGS, USERS } from '../data/mock-data';

@Injectable()
export class ExpensesService {
  private expenses = JSON.parse(JSON.stringify(EXPENSES));
  private logs = JSON.parse(JSON.stringify(APPROVAL_LOGS));

  findAll(userId?: string, role?: string) {
    let list = this.expenses;
    if (role === 'employee') list = list.filter(e => e.createdBy === userId);
    return { data: list, meta: { total: list.length } };
  }

  findOne(id: string) {
    const exp = this.expenses.find(e => e.id === id);
    if (!exp) throw new NotFoundException(`Expense ${id} not found`);
    const logs = this.logs.filter(l => l.requestId === id);
    return { data: { ...exp, logs } };
  }

  create(dto: any, userId: string) {
    const user = USERS.find(u => u.id === userId);
    const now = new Date().toISOString();
    const newExp = {
      id: `e${Date.now()}`,
      referenceNo: `EXP-2026-${String(this.expenses.length + 43).padStart(4, '0')}`,
      ...dto,
      status: 'draft',
      createdBy: userId,
      createdByName: user?.name ?? '',
      currentTier: 1,
      attachments: dto.attachments ?? [],
      createdAt: now,
      updatedAt: now,
    };
    this.expenses.unshift(newExp);
    return { data: newExp };
  }

  update(id: string, dto: any) {
    const idx = this.expenses.findIndex(e => e.id === id);
    if (idx === -1) throw new NotFoundException();
    this.expenses[idx] = { ...this.expenses[idx], ...dto, updatedAt: new Date().toISOString() };
    return { data: this.expenses[idx] };
  }

  submit(id: string, actorName: string) {
    this.update(id, { status: 'pending', submittedAt: new Date().toISOString() });
    this.addLog(id, 1, 'submitted', actorName, '');
    return { data: { message: 'Submitted successfully' } };
  }

  approve(id: string, actorId: string, actorName: string, comment: string) {
    const exp = this.expenses.find(e => e.id === id);
    if (!exp) throw new NotFoundException();
    this.update(id, { status: 'approved' });
    this.addLog(id, exp.currentTier, 'approved', actorName, comment);
    return { data: { message: 'Approved' } };
  }

  reject(id: string, actorName: string, comment: string) {
    const exp = this.expenses.find(e => e.id === id);
    if (!exp) throw new NotFoundException();
    this.update(id, { status: 'rejected' });
    this.addLog(id, exp.currentTier, 'rejected', actorName, comment);
    return { data: { message: 'Rejected' } };
  }

  pay(id: string, actorName: string) {
    this.update(id, { status: 'paid', paidAt: new Date().toISOString() });
    this.addLog(id, 0, 'paid', actorName, 'โอนเงินแล้ว');
    return { data: { message: 'Paid' } };
  }

  getPending() {
    return { data: this.expenses.filter(e => e.status === 'pending') };
  }

  getApproved() {
    return { data: this.expenses.filter(e => e.status === 'approved') };
  }

  private addLog(requestId: string, tier: number, action: string, actorName: string, comment: string) {
    this.logs.push({ id: `l${Date.now()}`, requestId, tier, action, actorId: '', actorName, comment, timestamp: new Date().toISOString() });
  }
}
