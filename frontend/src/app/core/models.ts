export type UserRole = 'employee' | 'finance_admin' | 'system_admin';

export interface Department {
  id: string;
  nameTh: string;
  nameEn: string;
  isActive: boolean;
}

export interface Position {
  id: string;
  nameTh: string;
  nameEn: string;
  canApprove: boolean;
  approvalLimit: number | null;
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  positionId: string;
  role: UserRole;
  isActive: boolean;
  delegateTo?: string;
  delegateFrom?: string;
  delegateUntil?: string;
}

export type ExpenseStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'paid';

export interface ExpenseRequest {
  id: string;
  referenceNo: string;
  title: string;
  categoryId: string;
  categoryName: string;
  expenseDate: string;
  amount: number;
  vatAmount: number;
  currency: string;
  description: string;
  status: ExpenseStatus;
  createdBy: string;
  createdByName: string;
  currentTier: number;
  currentApprover?: string;
  currentApproverName?: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  paidAt?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface ApprovalLog {
  id: string;
  requestId: string;
  tier: number;
  action: 'submitted' | 'approved' | 'rejected' | 'delegated' | 'escalated' | 'returned' | 'paid';
  actorId: string;
  actorName: string;
  comment: string;
  timestamp: string;
}

export interface ApprovalTierRule {
  role: 'manager' | 'md' | 'president';
  label: string;
  minAmount: number;
  maxAmount: number | null;
}

export interface CategoryApprovalConfig {
  mode: 'system' | 'custom';
  autoApproveLimit: number;
  tiers: ApprovalTierRule[];
}

export interface Category {
  id: string;
  nameTh: string;
  nameEn: string;
  glAccount: string;
  isActive: boolean;
  approval: CategoryApprovalConfig;
}

export interface D365SyncLog {
  id: string;
  requestId: string;
  referenceNo: string;
  paidDate: string;
  apInvoiceNo: string;
  amount: number;
  syncStatus: 'success' | 'error' | 'pending';
  errorMessage?: string;
  retryCount: number;
  syncedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'approved' | 'rejected' | 'submitted' | 'paid' | 'd365_error' | 'overdue';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  linkTo?: string;
}
