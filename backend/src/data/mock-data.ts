export const USERS = [
  { id: 'u1', name: 'สมชาย ใจดี',    email: 'somchai@company.th',  passwordHash: '$2b$10$mock', department: 'Operations', role: 'employee',  isActive: true },
  { id: 'u2', name: 'สมศักดิ์ มั่นคง', email: 'somsak@company.th',   passwordHash: '$2b$10$mock', department: 'Operations', role: 'manager',   isActive: true },
  { id: 'u3', name: 'วิภา รักงาน',   email: 'wipa@company.th',     passwordHash: '$2b$10$mock', department: 'Finance',    role: 'finance',   isActive: true },
  { id: 'u4', name: 'ประยุทธ์ ผู้นำ',  email: 'prayuth@company.th',  passwordHash: '$2b$10$mock', department: 'Executive',  role: 'md',        isActive: true },
  { id: 'u5', name: 'สุดา มีสุข',    email: 'suda@company.th',     passwordHash: '$2b$10$mock', department: 'HR',         role: 'employee',  isActive: true },
  { id: 'u6', name: 'Admin ระบบ',    email: 'admin@company.th',    passwordHash: '$2b$10$mock', department: 'IT',         role: 'admin',     isActive: true },
];

export const CATEGORIES = [
  { id: 'c01', nameTh: 'เงินสดย่อย',           nameEn: 'Petty Cash',              glAccount: '6101', isActive: true },
  { id: 'c02', nameTh: 'เดินทาง',              nameEn: 'Business Trip',           glAccount: '6201', isActive: true },
  { id: 'c03', nameTh: 'ที่พัก',               nameEn: 'Accommodation',           glAccount: '6202', isActive: true },
  { id: 'c04', nameTh: 'อาหาร/ต้อนรับ',       nameEn: 'Meal / Entertainment',    glAccount: '6301', isActive: true },
  { id: 'c05', nameTh: 'อบรม',                nameEn: 'Training',                glAccount: '6401', isActive: true },
  { id: 'c06', nameTh: 'ค่ารักษาพยาบาล',      nameEn: 'Medical',                 glAccount: '6501', isActive: true },
  { id: 'c07', nameTh: 'โทรศัพท์/อินเทอร์เน็ต',nameEn: 'Telephone / Internet',   glAccount: '6601', isActive: true },
  { id: 'c08', nameTh: 'เครื่องเขียน',         nameEn: 'Office Supplies',         glAccount: '6701', isActive: true },
  { id: 'c09', nameTh: 'ยานพาหนะ',            nameEn: 'Vehicle / Transportation', glAccount: '6801', isActive: true },
  { id: 'c10', nameTh: 'ซ่อมบำรุง',           nameEn: 'Maintenance',             glAccount: '6901', isActive: true },
  { id: 'c11', nameTh: 'โฆษณา/การตลาด',      nameEn: 'Advertising / Marketing', glAccount: '7001', isActive: true },
  { id: 'c12', nameTh: 'ค่าวิชาชีพ/กฎหมาย',  nameEn: 'Legal / Professional Fee', glAccount: '7101', isActive: true },
  { id: 'c13', nameTh: 'ประกันภัย',            nameEn: 'Insurance',               glAccount: '7201', isActive: true },
  { id: 'c14', nameTh: 'สาธารณูปโภค',         nameEn: 'Utilities',               glAccount: '7301', isActive: true },
  { id: 'c15', nameTh: 'อื่นๆ',               nameEn: 'Other',                   glAccount: '6999', isActive: true },
  { id: 'c16', nameTh: 'กำหนดเอง',            nameEn: 'Custom',                  glAccount: '9999', isActive: false },
];

export const EXPENSES = [
  { id: 'e001', referenceNo: 'EXP-2026-0042', title: 'ค่าเดินทางประชุมต่างจังหวัด', categoryId: 'c02', categoryName: 'Business Trip', expenseDate: '2026-06-10', amount: 12000, vatAmount: 840, currency: 'THB', description: 'เดินทางไปประชุมที่เชียงใหม่', status: 'pending', createdBy: 'u1', createdByName: 'สมชาย ใจดี', currentTier: 1, currentApprover: 'u2', createdAt: '2026-06-10T09:00:00Z', updatedAt: '2026-06-10T09:01:00Z', submittedAt: '2026-06-10T09:01:00Z' },
  { id: 'e002', referenceNo: 'EXP-2026-0041', title: 'อบรมหลักสูตร Leadership', categoryId: 'c05', categoryName: 'Training', expenseDate: '2026-06-05', amount: 25000, vatAmount: 1750, currency: 'THB', description: '', status: 'pending', createdBy: 'u5', createdByName: 'สุดา มีสุข', currentTier: 1, currentApprover: 'u2', createdAt: '2026-06-05T10:00:00Z', updatedAt: '2026-06-05T10:05:00Z', submittedAt: '2026-06-05T10:05:00Z' },
  { id: 'e003', referenceNo: 'EXP-2026-0040', title: 'ค่าซื้ออุปกรณ์สำนักงาน', categoryId: 'c08', categoryName: 'Office Supplies', expenseDate: '2026-06-01', amount: 3500, vatAmount: 245, currency: 'THB', description: 'กระดาษ A4', status: 'paid', createdBy: 'u1', createdByName: 'สมชาย ใจดี', currentTier: 1, createdAt: '2026-06-01T08:00:00Z', updatedAt: '2026-06-09T14:00:00Z', submittedAt: '2026-06-01T08:30:00Z', paidAt: '2026-06-09T14:00:00Z' },
  { id: 'e004', referenceNo: 'EXP-2026-0039', title: 'ค่ารักษาพยาบาล', categoryId: 'c06', categoryName: 'Medical', expenseDate: '2026-05-28', amount: 8200, vatAmount: 0, currency: 'THB', description: '', status: 'rejected', createdBy: 'u1', createdByName: 'สมชาย ใจดี', currentTier: 1, createdAt: '2026-05-28T11:00:00Z', updatedAt: '2026-05-30T09:00:00Z', submittedAt: '2026-05-28T11:30:00Z' },
  { id: 'e005', referenceNo: 'EXP-2026-0038', title: 'ค่าโทรศัพท์', categoryId: 'c07', categoryName: 'Telephone / Internet', expenseDate: '2026-06-01', amount: 1500, vatAmount: 105, currency: 'THB', description: '', status: 'approved', createdBy: 'u5', createdByName: 'สุดา มีสุข', currentTier: 1, createdAt: '2026-06-02T09:00:00Z', updatedAt: '2026-06-03T10:00:00Z' },
];

export const APPROVAL_LOGS = [
  { id: 'l1', requestId: 'e001', tier: 1, action: 'submitted', actorId: 'u1', actorName: 'สมชาย ใจดี',     comment: '', timestamp: '2026-06-10T09:01:00Z' },
  { id: 'l2', requestId: 'e003', tier: 1, action: 'approved',  actorId: 'u2', actorName: 'สมศักดิ์ มั่นคง', comment: 'อนุมัติ', timestamp: '2026-06-02T10:00:00Z' },
  { id: 'l3', requestId: 'e003', tier: 0, action: 'paid',      actorId: 'u3', actorName: 'วิภา รักงาน',    comment: 'โอนเงินแล้ว', timestamp: '2026-06-09T14:00:00Z' },
  { id: 'l4', requestId: 'e004', tier: 1, action: 'rejected',  actorId: 'u2', actorName: 'สมศักดิ์ มั่นคง', comment: 'เอกสารไม่ครบ', timestamp: '2026-05-30T09:00:00Z' },
];

export const D365_LOGS = [
  { id: 'd1', requestId: 'e003', referenceNo: 'EXP-2026-0040', paidDate: '2026-06-09', apInvoiceNo: 'AP-00123', amount: 3500,  syncStatus: 'success', retryCount: 0, syncedAt: '2026-06-09T08:00:00Z' },
  { id: 'd2', requestId: 'e004', referenceNo: 'EXP-2026-0039', paidDate: '2026-06-08', apInvoiceNo: '',          amount: 8200,  syncStatus: 'error',   retryCount: 2, errorMessage: 'Vendor not found in D365 — Employee ID: EMP-0042' },
  { id: 'd3', requestId: 'e005', referenceNo: 'EXP-2026-0038', paidDate: '2026-06-10', apInvoiceNo: '',          amount: 1500,  syncStatus: 'pending', retryCount: 0 },
];
