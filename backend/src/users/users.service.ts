import { Injectable, NotFoundException } from '@nestjs/common';
import { USERS } from '../data/mock-data';

@Injectable()
export class UsersService {
  private users = JSON.parse(JSON.stringify(USERS)).map(({ passwordHash, ...u }) => u);

  findAll()   { return { data: this.users }; }
  findOne(id: string) {
    const u = this.users.find(u => u.id === id);
    if (!u) throw new NotFoundException();
    return { data: u };
  }
  update(id: string, dto: any) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) throw new NotFoundException();
    this.users[idx] = { ...this.users[idx], ...dto };
    return { data: this.users[idx] };
  }
}
