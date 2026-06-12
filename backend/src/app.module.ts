import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { D365Module } from './d365/d365.module';

@Module({
  imports: [AuthModule, ExpensesModule, CategoriesModule, UsersModule, D365Module],
})
export class AppModule {}
