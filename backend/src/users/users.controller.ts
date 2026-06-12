import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private svc: UsersService) {}
  @Get()        findAll()                                                    { return this.svc.findAll(); }
  @Get(':id')   findOne(@Param('id') id: string)                             { return this.svc.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: any)            { return this.svc.update(id, dto); }
}
