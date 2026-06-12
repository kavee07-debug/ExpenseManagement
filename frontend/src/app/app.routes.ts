import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },

      { path: 'expenses',          loadComponent: () => import('./features/expenses/expense-list/expense-list.component').then(m => m.ExpenseListComponent) },
      { path: 'expenses/new',      loadComponent: () => import('./features/expenses/expense-form/expense-form.component').then(m => m.ExpenseFormComponent) },
      { path: 'expenses/:id',      loadComponent: () => import('./features/expenses/expense-detail/expense-detail.component').then(m => m.ExpenseDetailComponent) },
      { path: 'expenses/:id/edit', loadComponent: () => import('./features/expenses/expense-form/expense-form.component').then(m => m.ExpenseFormComponent) },

      { path: 'approvals',         loadComponent: () => import('./features/approvals/approval-queue/approval-queue.component').then(m => m.ApprovalQueueComponent) },
      { path: 'approvals/history', loadComponent: () => import('./features/approvals/approval-queue/approval-queue.component').then(m => m.ApprovalQueueComponent) },

      { path: 'finance/payment',         loadComponent: () => import('./features/finance/payment-queue/payment-queue.component').then(m => m.PaymentQueueComponent) },
      { path: 'finance/d365-sync',       loadComponent: () => import('./features/finance/d365-monitor/d365-monitor.component').then(m => m.D365MonitorComponent) },
      { path: 'finance/reconciliation',  loadComponent: () => import('./features/finance/reconciliation/reconciliation.component').then(m => m.ReconciliationComponent) },
      { path: 'finance/export',          loadComponent: () => import('./features/finance/export/export.component').then(m => m.ExportComponent) },

      { path: 'admin/categories',  loadComponent: () => import('./features/admin/categories/categories.component').then(m => m.CategoriesComponent) },
      { path: 'admin/users',       loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent) },
      { path: 'admin/departments', loadComponent: () => import('./features/admin/departments/departments.component').then(m => m.DepartmentsComponent) },
      { path: 'admin/positions',   loadComponent: () => import('./features/admin/positions/positions.component').then(m => m.PositionsComponent) },
      { path: 'admin/settings',    loadComponent: () => import('./features/admin/settings/settings.component').then(m => m.SettingsComponent) },

      { path: 'team', loadComponent: () => import('./features/approvals/team/team.component').then(m => m.TeamComponent) },

      { path: '**', redirectTo: 'dashboard' },
    ]
  },
];
