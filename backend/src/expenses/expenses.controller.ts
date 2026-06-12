import { Controller, Get, Post, Patch, Body, Param, Query, Headers } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtService } from '@nestjs/jwt';

@Controller('expenses')
export class ExpensesController {
  constructor(
    private expSvc: ExpensesService,
    private jwtSvc: JwtService,
  ) {}

  private decode(auth: string) {
    try { return this.jwtSvc.verify(auth?.replace('Bearer ', '') ?? ''); } catch { return null; }
  }

  @Get()
  findAll(@Headers('authorization') auth: string) {
    const p = this.decode(auth);
    return this.expSvc.findAll(p?.sub, p?.role);
  }

  @Get('pending')
  getPending() { return this.expSvc.getPending(); }

  @Get('approved')
  getApproved() { return this.expSvc.getApproved(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.expSvc.findOne(id); }

  @Post()
  create(@Body() dto: any, @Headers('authorization') auth: string) {
    const p = this.decode(auth);
    return this.expSvc.create(dto, p?.sub ?? '');
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) { return this.expSvc.update(id, dto); }

  @Post(':id/submit')
  submit(@Param('id') id: string, @Body('actorName') actorName: string) {
    return this.expSvc.submit(id, actorName);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() body: any, @Headers('authorization') auth: string) {
    const p = this.decode(auth);
    return this.expSvc.approve(id, p?.sub ?? '', body.actorName, body.comment ?? '');
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() body: any) {
    return this.expSvc.reject(id, body.actorName, body.comment ?? '');
  }

  @Post(':id/pay')
  pay(@Param('id') id: string, @Body('actorName') actorName: string) {
    return this.expSvc.pay(id, actorName);
  }
}
