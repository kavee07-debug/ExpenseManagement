# CLAUDE.md — Expense Management Application (EMA)

## Project Overview

**Application Name:** Expense Management Application (EMA)  
**Type:** Web Application (Responsive — works on Desktop & Mobile Browser)  
**Stack:** Angular (Frontend) · Node.js/NestJS (Backend) · PostgreSQL (Database)  
**Auth:** Azure AD Single Sign-On (SSO)  
**Integration:** Microsoft Dynamics 365 Finance & Operations (D365 F&O)  
**Language:** Thai (Primary UI) + English (Field labels / System terms)  
**Purpose:** Replace legacy K2 Workflow + SAP expense system with a modern digital platform

---

## Design System

### Color Palette
```
Primary Blue      #1F3864   (Dark navy — header, sidebar, primary buttons)
Secondary Blue    #2E75B6   (Mid blue — section headers, links, active states)
Accent Blue       #D9E2F3   (Light blue — table headers alt row, chip bg)
Background        #F5F7FA   (Page background)
Surface White     #FFFFFF   (Cards, modals, forms)
Border            #E2E8F0   (Dividers, card borders)
Text Primary      #1A202C   (Main text)
Text Secondary    #718096   (Labels, placeholders, metadata)
Text Muted        #A0AEC0   (Disabled, hints)

Status Colors:
  Draft           #718096 / bg #EDF2F7
  Pending         #D69E2E / bg #FFFFF0
  Approved        #276749 / bg #F0FFF4
  Rejected        #C53030 / bg #FFF5F5
  Cancelled       #A0AEC0 / bg #EDF2F7
  Paid            #2B6CB0 / bg #EBF8FF
```

### Typography
```
Font Family: "Sarabun" (Google Fonts — Thai support) with system fallback
Heading 1:  28px / Bold   — Page titles
Heading 2:  22px / SemiBold — Section titles
Heading 3:  18px / SemiBold — Card titles, form group labels
Body:       16px / Regular — Default
Small:      14px / Regular — Metadata, timestamps, helper text
Caption:    12px / Regular — Table footnotes, labels
```

### Spacing
```
Base unit: 4px
xs: 4px  |  sm: 8px  |  md: 16px  |  lg: 24px  |  xl: 32px  |  2xl: 48px
```

### Component Conventions
- **Cards:** white bg, 8px border-radius, 1px border #E2E8F0, shadow `0 1px 3px rgba(0,0,0,0.08)`
- **Buttons Primary:** bg #1F3864, text white, 6px radius, 40px height
- **Buttons Secondary:** border #2E75B6, text #2E75B6, transparent bg
- **Buttons Danger:** bg #C53030, text white
- **Input Fields:** 40px height, border #E2E8F0, focus ring #2E75B6, 6px radius
- **Tables:** striped rows (odd #FFFFFF, even #F7FAFC), header bg #1F3864 text white
- **Status Badge:** colored dot + text, pill shape (rounded-full), small size
- **Sidebar width:** 240px (desktop), collapsible to 64px icon-only mode
- **Top bar height:** 64px

---

## Application Layout

### Global Shell
```
┌──────────────────────────────────────────────────────────┐
│  TOP BAR (64px)                                          │
│  [☰ Logo EMA]        [Search]    [🔔 Notifications] [👤] │
├──────────┬───────────────────────────────────────────────┤
│          │                                               │
│ SIDEBAR  │   MAIN CONTENT AREA                          │
│ (240px)  │                                               │
│          │                                               │
│ Nav Menu │                                               │
│          │                                               │
└──────────┴───────────────────────────────────────────────┘
```

### Sidebar Navigation Items (by role)

**Employee:**
- 🏠 หน้าหลัก (Dashboard)
- ➕ สร้างคำขอใหม่
- 📋 รายการของฉัน
- 📎 เอกสารของฉัน

**Manager / MD / President:**
- 🏠 หน้าหลัก (Dashboard)
- ✅ รออนุมัติ (badge with count)
- 📊 ประวัติการอนุมัติ
- 👥 ทีมของฉัน

**Finance:**
- 🏠 หน้าหลัก
- 💳 รออนุมัติจ่าย
- 🔄 รายการที่ Sync D365
- 📈 รายงาน Reconciliation
- 📤 Export

**Admin:**
- ⚙️ ตั้งค่าระบบ
- 📁 หมวดค่าใช้จ่าย
- 👤 จัดการผู้ใช้
- 🔗 ตั้งค่า D365

---

## Screens & Wireframes

---

### SCREEN 1: Login Page

**Route:** `/login`  
**Roles:** All

**Layout:** Full-page centered card (no sidebar)

```
┌─────────────────────────────────┐
│         [Company Logo]          │
│                                 │
│   Expense Management System     │
│                                 │
│  ┌───────────────────────────┐  │
│  │  🔵 เข้าสู่ระบบด้วย       │  │
│  │     Microsoft Account     │  │
│  └───────────────────────────┘  │
│                                 │
│  ─────── หรือ ─────────         │
│                                 │
│  Email: [__________________]    │
│  Password: [_______________]    │
│  [เข้าสู่ระบบ]                  │
│                                 │
│  v1.0 | © 2026                  │
└─────────────────────────────────┘
```

**Elements:**
- Company logo (top center)
- Title: "ระบบเบิกค่าใช้จ่าย" subtitle: "Expense Management Application"
- Primary CTA: "Sign in with Microsoft" button (blue, Microsoft logo icon)
- Divider "หรือ"
- Email + Password fields (fallback local login)
- Login button
- Version + copyright footer

---

### SCREEN 2: Dashboard — Employee

**Route:** `/dashboard`  
**Role:** Employee

```
┌─────────────────────────────────────────────────────┐
│  TOP BAR                                            │
├──────────┬──────────────────────────────────────────┤
│ SIDEBAR  │  หน้าหลัก                               │
│          │                                          │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│          │  │ รออนุมัติ │ │ อนุมัติแล้ว│ │  ทั้งหมด │ │
│          │  │    3     │ │    12    │ │    18    │ │
│          │  └──────────┘ └──────────┘ └──────────┘ │
│          │                                          │
│          │  [+ สร้างคำขอใหม่]                       │
│          │                                          │
│          │  รายการล่าสุด                            │
│          │  ┌────────────────────────────────────┐  │
│          │  │ # │ วันที่ │ หมวด │ จำนวน │ สถานะ  │  │
│          │  │ 1 │ 10/6  │ Petty│ 5,000 │🟡Pending│  │
│          │  │ 2 │ 8/6   │ Trip │12,000 │🟢Approved│ │
│          │  └────────────────────────────────────┘  │
└──────────┴──────────────────────────────────────────┘
```

**Stat Cards (3 columns):**
- รออนุมัติ (Pending) — yellow accent
- อนุมัติแล้ว (Approved) — green accent  
- ยอดรวมเดือนนี้ (Total this month) — blue accent

**Recent Expenses Table columns:**
`เลขที่คำขอ | วันที่ | หมวดค่าใช้จ่าย | จำนวนเงิน | สถานะ | Action`

---

### SCREEN 3: Dashboard — Approver (Manager/MD/President)

**Route:** `/dashboard`  
**Role:** Manager / MD / President

**Stat Cards:**
- รออนุมัติ (Pending approval) — red badge with count
- อนุมัติวันนี้ — green
- ส่งคืน (Rejected) — gray

**Pending Approval Table columns:**
`ชื่อผู้ขอ | หมวด | จำนวนเงิน | วันที่ส่ง | วันครบกำหนด | Action [อนุมัติ][ปฏิเสธ]`

**Alert Banner (if overdue > 3 days):**
> ⚠️ มีรายการรออนุมัติเกิน 3 วัน — 2 รายการ

---

### SCREEN 4: Create Expense Request

**Route:** `/expenses/new`  
**Role:** Employee

**Layout:** Single-column form in a card

```
┌──────────────────────────────────────────────┐
│  สร้างคำขอเบิกค่าใช้จ่าย                      │
│  ─────────────────────────────────────────── │
│  ข้อมูลทั่วไป                                 │
│                                              │
│  หัวข้อ:          [_________________________]│
│  หมวดค่าใช้จ่าย:  [▼ เลือกหมวด            ]│
│  วันที่:          [📅 DD/MM/YYYY            ]│
│  จำนวนเงิน:       [________________] THB    │
│  ภาษี (VAT):     [________________] THB    │
│  รายละเอียด:     [                         ]│
│                  [                         ]│
│                                              │
│  เอกสารแนบ                                   │
│  ┌─────────────────────────────────────────┐ │
│  │  📁 ลากไฟล์มาวางที่นี่ หรือ [Browse]   │ │
│  │  รองรับ: JPG, PNG, PDF (max 10MB)       │ │
│  └─────────────────────────────────────────┘ │
│  [preview thumbnails if uploaded]            │
│                                              │
│  [บันทึก Draft]        [ส่งคำขอ ➜]          │
└──────────────────────────────────────────────┘
```

**Form Fields:**
| Field | Type | Required |
|-------|------|----------|
| หัวข้อ (Title) | Text input | ✓ |
| หมวดค่าใช้จ่าย (Category) | Dropdown (16 options) | ✓ |
| วันที่ใช้จ่าย (Expense Date) | Date picker | ✓ |
| จำนวนเงิน (Amount) | Number input | ✓ |
| ภาษีมูลค่าเพิ่ม (VAT) | Number input | — |
| สกุลเงิน (Currency) | Dropdown (THB default) | ✓ |
| รายละเอียด (Description) | Textarea | — |
| เอกสารแนบ (Attachments) | File upload (multi) | — |

**Expense Categories Dropdown (16 items):**
1. Petty Cash (เงินสดย่อย)
2. Business Trip (เดินทาง)
3. Accommodation (ที่พัก)
4. Meal / Entertainment (อาหาร/ต้อนรับ)
5. Training (อบรม)
6. Medical (ค่ารักษาพยาบาล)
7. Telephone / Internet
8. Office Supplies (เครื่องเขียน)
9. Vehicle / Transportation
10. Maintenance (ซ่อมบำรุง)
11. Advertising / Marketing
12. Legal / Professional Fee
13. Insurance
14. Utilities
15. Other (อื่นๆ)
16. Custom (กำหนดเอง — Admin only)

**Buttons:**
- "บันทึก Draft" (secondary) — saves without submitting
- "ส่งคำขอ" (primary) — submits and triggers workflow

---

### SCREEN 5: Expense Request Detail

**Route:** `/expenses/:id`  
**Roles:** All (filtered by permission)

```
┌─────────────────────────────────────────────────────────┐
│  คำขอเบิกค่าใช้จ่าย #EXP-2026-0042          [แก้ไข]    │
│  ─────────────────────────────────────────────────────  │
│  สถานะ: 🟡 Pending Approval                             │
│                                                         │
│  ┌─────────────────────┐  ┌────────────────────────┐    │
│  │ ข้อมูลคำขอ          │  │ ไทม์ไลน์ Workflow      │    │
│  │                     │  │                        │    │
│  │ หัวข้อ: ค่าเดินทาง  │  │ ●─ ส่งคำขอ (10/6)     │    │
│  │ หมวด:  Business Trip│  │ ●─ Manager รออนุมัติ   │    │
│  │ วันที่: 10/06/2026  │  │ ○─ Finance            │    │
│  │ จำนวน: 12,000 THB  │  │                        │    │
│  │ VAT:    840 THB     │  └────────────────────────┘    │
│  │                     │                                │
│  └─────────────────────┘                                │
│                                                         │
│  เอกสารแนบ                                              │
│  [📄 receipt_001.pdf]  [🖼 photo_002.jpg]               │
│                                                         │
│  ประวัติการดำเนินการ (Audit Log)                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ วันที่/เวลา   │ ผู้ดำเนินการ │ การกระทำ │ หมายเหตุ│  │
│  │ 10/6 09:00  │ สมชาย       │ สร้าง    │ -       │  │
│  │ 10/6 09:01  │ ระบบ        │ ส่ง WF  │ -       │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**For Approver role — show action panel at top:**
```
┌──────────────────────────────────────────────────────┐
│  การดำเนินการ                                         │
│  หมายเหตุ: [___________________________________]      │
│  [✅ อนุมัติ]   [❌ ปฏิเสธ]   [↩ ส่งคืนแก้ไข]       │
└──────────────────────────────────────────────────────┘
```

---

### SCREEN 6: My Expense List

**Route:** `/expenses`  
**Role:** Employee

```
┌──────────────────────────────────────────────────────────┐
│  รายการคำขอของฉัน                    [+ สร้างคำขอใหม่]  │
│                                                          │
│  🔍 [ค้นหา...]  [▼ สถานะ]  [▼ หมวด]  [📅 ช่วงวันที่]  │
│                                                          │
│  ┌──────┬──────────┬──────────┬──────────┬──────────────┐ │
│  │ เลขที่│ วันที่   │ หมวด     │ จำนวนเงิน│ สถานะ        │ │
│  ├──────┼──────────┼──────────┼──────────┼──────────────┤ │
│  │ 0042 │ 10/06/26 │ Business │ 12,000   │ 🟡 Pending   │ │
│  │ 0041 │ 05/06/26 │ Petty    │  3,500   │ 🟢 Approved  │ │
│  │ 0040 │ 01/06/26 │ Training │ 25,000   │ 🔵 Paid      │ │
│  │ 0039 │ 28/05/26 │ Medical  │  8,200   │ 🔴 Rejected  │ │
│  └──────┴──────────┴──────────┴──────────┴──────────────┘ │
│                                                          │
│  แสดง 1–10 จาก 38 รายการ   [< 1 2 3 4 >]               │
└──────────────────────────────────────────────────────────┘
```

**Filter Bar:**
- Search (full-text by title / ref number)
- Status filter (multi-select dropdown)
- Category filter
- Date range picker

**Table Columns:**
`เลขที่คำขอ | วันที่สร้าง | หมวดค่าใช้จ่าย | จำนวนเงิน | ผู้อนุมัติปัจจุบัน | สถานะ | Action`

---

### SCREEN 7: Approval Queue (Approver)

**Route:** `/approvals`  
**Role:** Manager / MD / President

```
┌───────────────────────────────────────────────────────────┐
│  รออนุมัติ                                    3 รายการ    │
│                                                           │
│  [▼ เรียงตาม: วันที่ส่ง]  [🔍 ค้นหา]                     │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  ● EXP-2026-0042  สมชาย ใจดี                       │  │
│  │    Business Trip · 12,000 THB · ส่ง 10/06/2026     │  │
│  │    ⏱ รออนุมัติมา 1 วัน                              │  │
│  │                    [ดูรายละเอียด] [✅ อนุมัติ] [❌]  │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │  ● EXP-2026-0041  สุดา มีสุข                        │  │
│  │    Training · 25,000 THB · ส่ง 08/06/2026          │  │
│  │    ⚠️ รออนุมัติมา 3 วัน (ใกล้ครบกำหนด)              │  │
│  │                    [ดูรายละเอียด] [✅ อนุมัติ] [❌]  │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

**Bulk Actions:** Checkbox on each row + "อนุมัติที่เลือก" bulk button  
**Overdue indicator:** ⚠️ icon + orange text when > 3 days

---

### SCREEN 8: Finance — Payment Queue

**Route:** `/finance/payment`  
**Role:** Finance

```
┌──────────────────────────────────────────────────────────┐
│  รออนุมัติจ่าย                              5 รายการ    │
│                                                          │
│  ┌──────┬───────────┬──────────┬──────────┬─────────────┐ │
│  │ เลขที่│ พนักงาน   │ หมวด    │ จำนวนเงิน│ การดำเนินการ│ │
│  ├──────┼───────────┼──────────┼──────────┼─────────────┤ │
│  │ 0042 │ สมชาย    │ Business │ 12,000   │ [💳 จ่ายเงิน]│ │
│  │ 0038 │ วิภา     │ Medical  │  8,200   │ [💳 จ่ายเงิน]│ │
│  └──────┴───────────┴──────────┴──────────┴─────────────┘ │
│                                                          │
│  รายการที่ Sync D365 แล้ว                                │
│  ┌──────┬───────────┬────────────────────┬──────────────┐ │
│  │ เลขที่│ AP Invoice│ Sync Date         │ สถานะ D365   │ │
│  │ 0040 │ AP-00123  │ 09/06 08:00       │ 🟢 Success  │ │
│  │ 0039 │ AP-00120  │ 08/06 08:00       │ 🔴 Error    │ │
│  └──────┴───────────┴────────────────────┴──────────────┘ │
└──────────────────────────────────────────────────────────┘
```

**"จ่ายเงิน" modal:**
- ยืนยันจ่ายเงิน, วิธีชำระ, เลขที่บัญชี
- เมื่อยืนยัน → สถานะเปลี่ยนเป็น Paid → trigger D365 sync อัตโนมัติ

---

### SCREEN 9: D365 Integration Monitor

**Route:** `/finance/d365-sync`  
**Role:** Finance

```
┌───────────────────────────────────────────────────────────┐
│  D365 Integration Monitor                                 │
│                                                           │
│  สรุปวันนี้:  ✅ สำเร็จ 18  │  ❌ ล้มเหลว 2  │  ⏳ รอ 1 │
│                                                           │
│  [🔄 Retry Failed]  [📤 Export Excel]  [🔍 ค้นหา]        │
│                                                           │
│  ┌──────┬──────────┬────────────┬──────────┬────────────┐  │
│  │ EXP  │ Paid Date│ AP Invoice │ Amount   │ สถานะ Sync │  │
│  ├──────┼──────────┼────────────┼──────────┼────────────┤  │
│  │ 0040 │ 09/06    │ AP-00123   │ 12,000   │ ✅ Success │  │
│  │ 0039 │ 08/06    │ -          │  8,200   │ ❌ Error   │  │
│  │      │          │ [ดู Error] │          │ [🔄 Retry] │  │
│  └──────┴──────────┴────────────┴──────────┴────────────┘  │
└───────────────────────────────────────────────────────────┘
```

**Error detail expandable row:**
```
└── Error: "Vendor not found in D365 — Employee ID: EMP-0042"
    Timestamp: 08/06/2026 08:15:33 | Retry count: 2/3
```

---

### SCREEN 10: Notification Panel

**Trigger:** Bell icon (🔔) in top bar  
**Style:** Slide-in panel from right (360px wide)

```
┌──────────────────────────────────┐
│  การแจ้งเตือน                [✕] │
│  [ทั้งหมด] [ยังไม่อ่าน (3)]       │
│  ─────────────────────────────── │
│  🔔 EXP-0042 ได้รับการอนุมัติ     │
│     โดย สมศักดิ์ ·  10 นาทีที่แล้ว │
│  ─────────────────────────────── │
│  ⚠️ EXP-0041 รออนุมัติ 3 วันแล้ว │
│     ต้องการการดำเนินการ ·  3 ชม.  │
│  ─────────────────────────────── │
│  ❌ D365 Sync ล้มเหลว EXP-0039   │
│     กรุณาตรวจสอบ ·  5 ชม.        │
│  ─────────────────────────────── │
│  [ดูทั้งหมด]                      │
└──────────────────────────────────┘
```

---

### SCREEN 11: Admin — Category Management

**Route:** `/admin/categories`  
**Role:** Admin

```
┌──────────────────────────────────────────────────────┐
│  จัดการหมวดค่าใช้จ่าย              [+ เพิ่มหมวดใหม่]│
│                                                      │
│  ┌───┬──────────────────┬────────┬──────────┬──────┐ │
│  │ # │ ชื่อหมวด         │ GL Acc │ สถานะ    │ แก้ไข│ │
│  ├───┼──────────────────┼────────┼──────────┼──────┤ │
│  │ 1 │ Petty Cash       │ 6101   │ 🟢 Active│ ✏️   │ │
│  │ 2 │ Business Trip    │ 6201   │ 🟢 Active│ ✏️   │ │
│  │15 │ Other            │ 6999   │ 🟢 Active│ ✏️   │ │
│  └───┴──────────────────┴────────┴──────────┴──────┘ │
└──────────────────────────────────────────────────────┘
```

**Add/Edit Category Modal:**
- ชื่อหมวด (TH) / Category Name (EN)
- GL Account mapping
- Approval tier override
- เปิด/ปิดใช้งาน toggle

---

### SCREEN 12: Admin — User Management

**Route:** `/admin/users`  
**Role:** Admin

**Table Columns:**
`ชื่อ-นามสกุล | อีเมล | แผนก | Role | Delegate | สถานะ | แก้ไข`

**User Edit Modal:**
- กำหนด Role (Employee / Manager / MD / President / Finance / Admin)
- ตั้ง Delegate (ผู้อนุมัติแทน) + ช่วงวันที่
- เปิด/ปิดบัญชี

---

## Data Models (for mockup field reference)

### ExpenseRequest
```
id              UUID
reference_no    string          EXP-YYYY-NNNN
title           string
category_id     FK → Category
expense_date    date
amount          decimal(15,2)
vat_amount      decimal(15,2)
currency        string          THB
description     text
status          enum            draft | pending | approved | rejected | cancelled | paid
created_by      FK → User
current_tier    int             1–4
attachments     File[]
created_at      timestamp
updated_at      timestamp
```

### ApprovalLog
```
id              UUID
request_id      FK → ExpenseRequest
tier            int
action          enum            submitted | approved | rejected | delegated | escalated
actor_id        FK → User
comment         text
timestamp       timestamp
```

### D365SyncLog
```
id              UUID
request_id      FK → ExpenseRequest
ap_invoice_no   string
sync_status     enum            success | error | pending
error_message   text
retry_count     int
synced_at       timestamp
```

---

## Status Flow Diagram

```
[Draft] ──► [Pending Approval] ──► [Approved] ──► [Paid] ──► (D365 Sync)
                │                       │
                ▼                       ▼
           [Rejected]             [Cancelled]
                │
                ▼
         (back to Draft
          for resubmit)
```

---

## Approval Workflow Tiers

| Tier | Amount (THB) | Approver |
|------|-------------|----------|
| 1 | < 100,000 | Auto pass / Direct Manager |
| 2 | 100,000 – 499,999 | Manager |
| 3 | 500,000 – 999,999 | Managing Director |
| 4 | ≥ 1,000,000 | President |

Sequential: each tier must approve before moving to next.  
Reject at any tier = stops workflow, notifies requester.  
Auto Escalation: if no action after 3 days → notify again + flag overdue.

---

## Notification Triggers

| Event | Channel | Recipient |
|-------|---------|-----------|
| Request submitted | Email + Teams | Approver (Tier 1) |
| Approved (each tier) | Email + Teams + In-app | Requester + next approver |
| Rejected | Email + Teams + In-app | Requester |
| Fully approved | Email + In-app | Finance team |
| Paid | Email + In-app | Requester |
| D365 sync failed | Email + In-app | Finance |
| Overdue (> 3 days) | Email + Teams | Approver |

---

## Key UX Notes for Mockup Generation

1. **Language:** All UI labels in Thai; system/technical terms in English (e.g., "Draft", "Pending", "Approve", "Sync")
2. **Mobile Responsive:** Sidebar collapses to bottom tab bar on mobile; tables become card-list view
3. **Empty States:** Every list/table must show a friendly empty state illustration + CTA when no data
4. **Loading States:** Skeleton loaders for tables and stat cards
5. **Confirmation Dialogs:** Destructive actions (reject, cancel, delete) must show modal confirmation
6. **Status Badges:** Always use colored dot + pill label, never plain text
7. **Amounts:** Format with Thai Baht symbol and comma separators: `12,000.00 ฿`
8. **Dates:** Format as `DD/MM/YYYY` (Thai users)
9. **Pagination:** 10 rows per page default, with page size selector
10. **Action Buttons:** "อนุมัติ" (Approve) is always primary/green, "ปฏิเสธ" (Reject) is danger/red
