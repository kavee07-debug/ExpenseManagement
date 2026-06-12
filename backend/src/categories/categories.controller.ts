import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private svc: CategoriesService) {}
  @Get()           findAll()                            { return this.svc.findAll(); }
  @Get('active')   findActive()                         { return this.svc.findActive(); }
  @Get(':id')      findOne(@Param('id') id: string)     { return this.svc.findOne(id); }
  @Post()          create(@Body() dto: any)              { return this.svc.create(dto); }
  @Patch(':id')    update(@Param('id') id: string, @Body() dto: any) { return this.svc.update(id, dto); }
}
