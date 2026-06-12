import { Module } from '@nestjs/common';
import { D365Controller } from './d365.controller';
import { D365Service } from './d365.service';

@Module({ controllers: [D365Controller], providers: [D365Service] })
export class D365Module {}
