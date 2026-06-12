import { User, Department, Position, ExpenseRequest, ApprovalLog, Category, CategoryApprovalConfig, D365SyncLog, Notification } from './models';

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'd1', nameTh: 'ปฏิบัติการ',           nameEn: 'Operations', isActive: true },
  { id: 'd2', nameTh: 'การเงิน',               nameEn: 'Finance',    isActive: true },
  { id: 'd3', nameTh: 'ทรัพยากรบุคคล',         nameEn: 'HR',         isActive: true },
  { id: 'd4', nameTh: 'เทคโนโลยีสารสนเทศ',     nameEn: 'IT',         isActive: true },
  { id: 'd5', nameTh: 'ผู้บริหาร',             nameEn: 'Executive',  isActive: true },
  { id: 'd6', nameTh: 'ฝ่ายขาย',               nameEn: 'Sales',      isActive: true },
];

export const MOCK_POSITIONS: Position[] = [
  { id: 'p1', nameTh: 'พนักงาน',            nameEn: 'Staff',               canApprove: false, approvalLimit: null,   isActive: true },
  { id: 'p2', nameTh: 'ผู้จัดการ',           nameEn: 'Manager',             canApprove: true,  approvalLimit: 99999,  isActive: true },
  { id: 'p3', nameTh: 'กรรมการผู้จัดการ',   nameEn: 'Managing Director',   canApprove: true,  approvalLimit: 499999, isActive: true },
  { id: 'p4', nameTh: 'ประธานบริษัท',        nameEn: 'President',           canApprove: true,  approvalLimit: null,   isActive: true },
  { id: 'p5', nameTh: 'นักบัญชี',            nameEn: 'Accountant',          canApprove: false, approvalLimit: null,   isActive: true },
  { id: 'p6', nameTh: 'ผู้ดูแลระบบ',         nameEn: 'System Administrator',canApprove: false, approvalLimit: null,   isActive: true },
];

const systemApproval: CategoryApprovalConfig = {
  mode: 'system',
  autoApproveLimit: 0,
  tiers: [
    { role: 'manager',   label: 'ผู้จัดการ',           minAmount: 0,      maxAmount: 99999  },
    { role: 'md',        label: 'กรรมการผู้จัดการ',    minAmount: 100000, maxAmount: 499999 },
    { role: 'president', label: 'ประธานบริษัท',        minAmount: 500000, maxAmount: null   },
  ],
};

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'สมชาย ใจดี',     email: 'somchai@company.th', departmentId: 'd1', positionId: 'p1', role: 'employee',     isActive: true },
  { id: 'u2', name: 'สมศักดิ์ มั่นคง',email: 'somsak@company.th',  departmentId: 'd1', positionId: 'p2', role: 'employee',     isActive: true },
  { id: 'u3', name: 'วิภา รักงาน',    email: 'wipa@company.th',    departmentId: 'd2', positionId: 'p5', role: 'finance_admin',isActive: true },
  { id: 'u4', name: 'ประยุทธ์ ผู้นำ',  email: 'prayuth@company.th', departmentId: 'd5', positionId: 'p3', role: 'employee',     isActive: true },
  { id: 'u5', name: 'สุดา มีสุข',     email: 'suda@company.th',    departmentId: 'd3', positionId: 'p1', role: 'employee',     isActive: true },
  { id: 'u6', name: 'Admin ระบบ',     email: 'admin@company.th',   departmentId: 'd4', positionId: 'p6', role: 'system_admin', isActive: true },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: 'c01', nameTh: 'เงินสดย่อย',             nameEn: 'Petty Cash',              glAccount: '6101', isActive: true,
    approval: { mode: 'custom', autoApproveLimit: 3000, tiers: [
      { role: 'manager', label: 'ผู้จัดการ', minAmount: 3001, maxAmount: 50000 },
      { role: 'md',      label: 'กรรมการผู้จัดการ', minAmount: 50001, maxAmount: null },
    ]}},
  { id: 'c02', nameTh: 'เดินทาง',                nameEn: 'Business Trip',           glAccount: '6201', isActive: true, approval: { ...systemApproval } },
  { id: 'c03', nameTh: 'ที่พัก',                 nameEn: 'Accommodation',           glAccount: '6202', isActive: true, approval: { ...systemApproval } },
  { id: 'c04', nameTh: 'อาหาร/ต้อนรับ',         nameEn: 'Meal / Entertainment',    glAccount: '6301', isActive: true, approval: { ...systemApproval } },
  { id: 'c05', nameTh: 'อบรม',                  nameEn: 'Training',                glAccount: '6401', isActive: true, approval: { ...systemApproval } },
  { id: 'c06', nameTh: 'ค่ารักษาพยาบาล',        nameEn: 'Medical',                 glAccount: '6501', isActive: true,
    approval: { mode: 'custom', autoApproveLimit: 5000, tiers: [
      { role: 'manager', label: 'ผู้จัดการ', minAmount: 5001, maxAmount: 99999 },
      { role: 'md',      label: 'กรรมการผู้จัดการ', minAmount: 100000, maxAmount: null },
    ]}},
  { id: 'c07', nameTh: 'โทรศัพท์/อินเทอร์เน็ต', nameEn: 'Telephone / Internet',    glAccount: '6601', isActive: true,
    approval: { mode: 'custom', autoApproveLimit: 2000, tiers: [
      { role: 'manager', label: 'ผู้จัดการ', minAmount: 2001, maxAmount: null },
    ]}},
  { id: 'c08', nameTh: 'เครื่องเขียน',           nameEn: 'Office Supplies',         glAccount: '6701', isActive: true, approval: { ...systemApproval } },
  { id: 'c09', nameTh: 'ยานพาหนะ',              nameEn: 'Vehicle / Transportation', glAccount: '6801', isActive: true, approval: { ...systemApproval } },
  { id: 'c10', nameTh: 'ซ่อมบำรุง',             nameEn: 'Maintenance',             glAccount: '6901', isActive: true, approval: { ...systemApproval } },
  { id: 'c11', nameTh: 'โฆษณา/การตลาด',        nameEn: 'Advertising / Marketing', glAccount: '7001', isActive: true, approval: { ...systemApproval } },
  { id: 'c12', nameTh: 'ค่าวิชาชีพ/กฎหมาย',    nameEn: 'Legal / Professional Fee', glAccount: '7101', isActive: true, approval: { ...systemApproval } },
  { id: 'c13', nameTh: 'ประกันภัย',              nameEn: 'Insurance',               glAccount: '7201', isActive: true, approval: { ...systemApproval } },
  { id: 'c14', nameTh: 'สาธารณูปโภค',           nameEn: 'Utilities',               glAccount: '7301', isActive: true, approval: { ...systemApproval } },
  { id: 'c15', nameTh: 'อื่นๆ',                 nameEn: 'Other',                   glAccount: '6999', isActive: true, approval: { ...systemApproval } },
  { id: 'c16', nameTh: 'กำหนดเอง',              nameEn: 'Custom',                  glAccount: '9999', isActive: true, approval: { ...systemApproval } },
];

export const MOCK_EXPENSES: ExpenseRequest[] = [
  {
    id: 'e001', referenceNo: 'EXP-2026-0042', title: 'ค่าเดินทางประชุมต่างจังหวัด',
    categoryId: 'c02', categoryName: 'Business Trip', expenseDate: '2026-06-10',
    amount: 12000, vatAmount: 840, currency: 'THB', description: 'เดินทางไปประชุมที่เชียงใหม่',
    status: 'pending', createdBy: 'u1', createdByName: 'สมชาย ใจดี',
    currentTier: 1, currentApprover: 'u2', currentApproverName: 'สมศักดิ์ มั่นคง',
    attachments: [{ id: 'a1', name: 'receipt_001.pdf', type: 'application/pdf', size: 204800, url: '#' }],
    createdAt: '2026-06-10T09:00:00', updatedAt: '2026-06-10T09:01:00', submittedAt: '2026-06-10T09:01:00',
  },
  {
    id: 'e002', referenceNo: 'EXP-2026-0041', title: 'อบรมหลักสูตร Leadership',
    categoryId: 'c05', categoryName: 'Training', expenseDate: '2026-06-05',
    amount: 25000, vatAmount: 1750, currency: 'THB', description: 'ลงทะเบียนอบรม Leadership Program',
    status: 'pending', createdBy: 'u5', createdByName: 'สุดา มีสุข',
    currentTier: 1, currentApprover: 'u2', currentApproverName: 'สมศักดิ์ มั่นคง',
    attachments: [],
    createdAt: '2026-06-05T10:00:00', updatedAt: '2026-06-05T10:05:00', submittedAt: '2026-06-05T10:05:00',
  },
  {
    id: 'e003', referenceNo: 'EXP-2026-0040', title: 'ค่าซื้ออุปกรณ์สำนักงาน',
    categoryId: 'c08', categoryName: 'Office Supplies', expenseDate: '2026-06-01',
    amount: 3500, vatAmount: 245, currency: 'THB', description: 'กระดาษ A4 + หมึกพิมพ์',
    status: 'paid', createdBy: 'u1', createdByName: 'สมชาย ใจดี',
    currentTier: 1, attachments: [],
    createdAt: '2026-06-01T08:00:00', updatedAt: '2026-06-09T14:00:00', submittedAt: '2026-06-01T08:30:00', paidAt: '2026-06-09T14:00:00',
  },
  {
    id: 'e004', referenceNo: 'EXP-2026-0039', title: 'ค่ารักษาพยาบาล',
    categoryId: 'c06', categoryName: 'Medical', expenseDate: '2026-05-28',
    amount: 8200, vatAmount: 0, currency: 'THB', description: 'ค่าตรวจสุขภาพประจำปี',
    status: 'rejected', createdBy: 'u1', createdByName: 'สมชาย ใจดี',
    currentTier: 1, attachments: [],
    createdAt: '2026-05-28T11:00:00', updatedAt: '2026-05-30T09:00:00', submittedAt: '2026-05-28T11:30:00',
  },
  {
    id: 'e005', referenceNo: 'EXP-2026-0038', title: 'ค่าโทรศัพท์รายเดือน',
    categoryId: 'c07', categoryName: 'Telephone / Internet', expenseDate: '2026-06-01',
    amount: 1500, vatAmount: 105, currency: 'THB', description: 'ค่าโทรศัพท์มือถือเดือนมิถุนายน',
    status: 'approved', createdBy: 'u5', createdByName: 'สุดา มีสุข',
    currentTier: 1, attachments: [],
    createdAt: '2026-06-02T09:00:00', updatedAt: '2026-06-03T10:00:00',
  },
  {
    id: 'e006', referenceNo: 'EXP-2026-0037', title: 'Draft ค่าซ่อมบำรุง',
    categoryId: 'c10', categoryName: 'Maintenance', expenseDate: '2026-06-11',
    amount: 5000, vatAmount: 350, currency: 'THB', description: '',
    status: 'draft', createdBy: 'u1', createdByName: 'สมชาย ใจดี',
    currentTier: 1, attachments: [],
    createdAt: '2026-06-11T08:00:00', updatedAt: '2026-06-11T08:00:00',
  },
];

export const MOCK_APPROVAL_LOGS: ApprovalLog[] = [
  { id: 'l1', requestId: 'e001', tier: 1, action: 'submitted', actorId: 'u1', actorName: 'สมชาย ใจดี',    comment: '',              timestamp: '2026-06-10T09:01:00' },
  { id: 'l2', requestId: 'e001', tier: 1, action: 'submitted', actorId: 'sys', actorName: 'ระบบ',          comment: 'ส่ง Workflow',  timestamp: '2026-06-10T09:01:05' },
  { id: 'l3', requestId: 'e003', tier: 1, action: 'submitted', actorId: 'u1', actorName: 'สมชาย ใจดี',    comment: '',              timestamp: '2026-06-01T08:30:00' },
  { id: 'l4', requestId: 'e003', tier: 1, action: 'approved',  actorId: 'u2', actorName: 'สมศักดิ์ มั่นคง', comment: 'อนุมัติ',     timestamp: '2026-06-02T10:00:00' },
  { id: 'l5', requestId: 'e003', tier: 0, action: 'paid',      actorId: 'u3', actorName: 'วิภา รักงาน',   comment: 'โอนเงินแล้ว', timestamp: '2026-06-09T14:00:00' },
  { id: 'l6', requestId: 'e004', tier: 1, action: 'submitted', actorId: 'u1', actorName: 'สมชาย ใจดี',    comment: '',              timestamp: '2026-05-28T11:30:00' },
  { id: 'l7', requestId: 'e004', tier: 1, action: 'rejected',  actorId: 'u2', actorName: 'สมศักดิ์ มั่นคง', comment: 'เอกสารไม่ครบ', timestamp: '2026-05-30T09:00:00' },
];

export const MOCK_D365_LOGS: D365SyncLog[] = [
  { id: 'd1', requestId: 'e003', referenceNo: 'EXP-2026-0040', paidDate: '2026-06-09', apInvoiceNo: 'AP-00123', amount: 3500,  syncStatus: 'success', retryCount: 0, syncedAt: '2026-06-09T08:00:00' },
  { id: 'd2', requestId: 'e004', referenceNo: 'EXP-2026-0039', paidDate: '2026-06-08', apInvoiceNo: '',          amount: 8200,  syncStatus: 'error',   retryCount: 2, errorMessage: 'Vendor not found in D365 — Employee ID: EMP-0042' },
  { id: 'd3', requestId: 'e005', referenceNo: 'EXP-2026-0038', paidDate: '2026-06-10', apInvoiceNo: 'AP-00125', amount: 1500,  syncStatus: 'pending', retryCount: 0 },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 'u1', type: 'approved', title: 'EXP-0040 ได้รับการอนุมัติ', message: 'โดย สมศักดิ์ มั่นคง', isRead: false, createdAt: '2026-06-11T10:00:00', linkTo: '/expenses/e003' },
  { id: 'n2', userId: 'u2', type: 'overdue',  title: 'EXP-0041 รออนุมัติ 3 วันแล้ว', message: 'ต้องการการดำเนินการ', isRead: false, createdAt: '2026-06-11T08:00:00', linkTo: '/approvals' },
  { id: 'n3', userId: 'u3', type: 'd365_error', title: 'D365 Sync ล้มเหลว EXP-0039', message: 'กรุณาตรวจสอบ', isRead: false, createdAt: '2026-06-11T07:00:00', linkTo: '/finance/d365-sync' },
  { id: 'n4', userId: 'u1', type: 'rejected', title: 'EXP-0039 ถูกปฏิเสธ', message: 'โดย สมศักดิ์ มั่นคง — เอกสารไม่ครบ', isRead: true, createdAt: '2026-05-30T09:00:00', linkTo: '/expenses/e004' },
];
