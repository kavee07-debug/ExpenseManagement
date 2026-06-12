import { Controller, Get, Post, Param } from '@nestjs/common';
import { D365Service } from './d365.service';

@Controller('d365')
export class D365Controller {
  constructor(private svc: D365Service) {}
  @Get()              findAll()                        { return this.svc.findAll(); }
  @Post('retry-all')  retryAll()                       { return this.svc.retryAll(); }
  @Post('retry/:id')  retry(@Param('id') id: string)   { return this.svc.retry(id); }
}
