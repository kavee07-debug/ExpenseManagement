import { Injectable, NotFoundException } from '@nestjs/common';
import { D365_LOGS } from '../data/mock-data';

@Injectable()
export class D365Service {
  private logs = JSON.parse(JSON.stringify(D365_LOGS));

  findAll() {
    const success = this.logs.filter(l => l.syncStatus === 'success').length;
    const error   = this.logs.filter(l => l.syncStatus === 'error').length;
    const pending = this.logs.filter(l => l.syncStatus === 'pending').length;
    return { data: this.logs, meta: { success, error, pending } };
  }

  retry(id: string) {
    const idx = this.logs.findIndex(l => l.id === id);
    if (idx === -1) throw new NotFoundException();
    const log = this.logs[idx];
    if (log.retryCount >= 3) {
      return { data: { message: 'Max retries reached' } };
    }
    this.logs[idx] = {
      ...log,
      retryCount: log.retryCount + 1,
      syncStatus: log.retryCount >= 2 ? 'success' : 'error',
      syncedAt: log.retryCount >= 2 ? new Date().toISOString() : undefined,
      apInvoiceNo: log.retryCount >= 2 ? `AP-${Math.floor(Math.random() * 90000 + 10000)}` : '',
    };
    return { data: this.logs[idx] };
  }

  retryAll() {
    const errors = this.logs.filter(l => l.syncStatus === 'error');
    errors.forEach(l => this.retry(l.id));
    return { data: { message: `Retried ${errors.length} failed syncs` } };
  }
}
