import { Injectable, NotFoundException } from '@nestjs/common';
import { CATEGORIES } from '../data/mock-data';

@Injectable()
export class CategoriesService {
  private cats = JSON.parse(JSON.stringify(CATEGORIES));

  findAll()      { return { data: this.cats }; }
  findActive()   { return { data: this.cats.filter(c => c.isActive) }; }
  findOne(id: string) {
    const c = this.cats.find(c => c.id === id);
    if (!c) throw new NotFoundException();
    return { data: c };
  }
  create(dto: any) {
    const c = { id: `c${Date.now()}`, ...dto };
    this.cats.push(c);
    return { data: c };
  }
  update(id: string, dto: any) {
    const idx = this.cats.findIndex(c => c.id === id);
    if (idx === -1) throw new NotFoundException();
    this.cats[idx] = { ...this.cats[idx], ...dto };
    return { data: this.cats[idx] };
  }
}
