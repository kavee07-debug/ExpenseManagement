import { Injectable, signal } from '@angular/core';
import { Notification } from './models';
import { MOCK_NOTIFICATIONS } from './mock-data';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private all = signal<Notification[]>(JSON.parse(JSON.stringify(MOCK_NOTIFICATIONS)));

  getForUser(userId: string) { return this.all().filter(n => n.userId === userId); }
  getUnread(userId: string)  { return this.getForUser(userId).filter(n => !n.isRead); }
  unreadCount(userId: string){ return this.getUnread(userId).length; }

  markRead(id: string): void {
    this.all.update(list => list.map(n => n.id === id ? { ...n, isRead: true } : n));
  }
  markAllRead(userId: string): void {
    this.all.update(list => list.map(n => n.userId === userId ? { ...n, isRead: true } : n));
  }
}
