# Doc A — Employee Management App — Product Handoff (Arabic RTL)

## Table of Contents
1. [Overview](#overview)
2. [Navigation Map (RTL)](#navigation-map-rtl)
3. [Key Screens & Flows](#key-screens--flows)
4. [Forms & Validation (Unified)](#forms--validation-unified)
5. [Attachments (Universal)](#attachments-universal)
6. [Payroll Rules](#payroll-rules)
7. [Auto-Calculations](#auto-calculations)
8. [Role & Permissions](#role--permissions)
9. [Internationalization (i18n)](#internationalization-i18n)
10. [Prototype Notes](#prototype-notes)
11. [Handoff Checklist](#handoff-checklist)

---

## Overview

### App Details
- **App Name**: نظام إدارة الموظفين (Employee Management System)
- **Purpose**: Comprehensive employee data management for large corporations
- **Target Users**: HR Administrators, HR Staff, Management
- **Platform**: Electron Desktop Application (Windows optimized)

### Languages & Direction
- **Primary**: Arabic RTL (right-to-left)
- **Secondary**: English LTR (left-to-right)
- **Switch**: Global language toggle in header

### Design System

#### Typography
- **Font Family**: Noto Sans Arabic (Arabic), Noto Sans (English)
- **Base Font Size**: 16px
- **Scale**: Base typography defined in globals.css

#### Color Tokens
```css
/* Primary Colors */
--primary: #030213 (Dark Blue)
--primary-foreground: #ffffff

/* Corporate Blue/Gray Palette */
--background: #ffffff
--card: #ffffff
--secondary: oklch(0.95 0.0058 264.53) (Light Blue-Gray)
--muted: #ececf0 (Light Gray)
--accent: #e9ebef (Accent Gray)

/* Green Accents */
--chart-1: oklch(0.646 0.222 41.116) (Success Green)
--chart-4: oklch(0.828 0.189 84.429) (Light Green)

/* Status Colors */
--destructive: #d4183d (Error Red)
--muted-foreground: #717182 (Text Gray)
```

#### Spacing Scale
- **Radius**: 0.625rem (10px) base
- **Padding**: 1.5rem (24px) page containers
- **Gap**: 1rem (16px) standard, 1.5rem (24px) sections

#### Iconography
- **Library**: Lucide React
- **Size**: 20px standard, 24px headers, 16px inline
- **Style**: Outline style, consistent stroke width

### Accessibility Principles
- **Touch Targets**: Minimum 44px for interactive elements
- **Contrast**: WCAG AA compliant (4.5:1 minimum)
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and descriptions
- **RTL Support**: Complete right-to-left layout support

---

## Navigation Map (RTL)

### Sidebar Structure (Right-aligned in RTL)
```
نظام إدارة الموظفين
├── 🏠 لوحة التحكم (Dashboard)
├── 👥 الموظفون (Employees)
│   └── استيراد Excel (Excel Import)
├── 📚 الدورات (Courses)
├── 📊 التقييمات (Evaluations)
├── 📈 الترقيات (Promotions)
├── 🏆 المكافآت (Rewards)
├── 🏖️ الإجازات (Leaves)
├── ❌ الغياب (Absences)
├── 💰 الرواتب (Payroll)
├── 📅 سنوات الخدمة (Years of Service)
├── 💱 أسعار الصرف (Exchange Rates)
├── 📋 التقارير (Reports)
└── ⚙️ الإعدادات (Settings)
```

### Global Header (Right-to-Left Layout)
```
[Currency Toggle] [Language Switch] [Notifications] [Profile Menu] [App Logo] ←
USD/TRY          العربية/English    🔔              ⚪ أحمد محمد       Logo
```

### Navigation Flow
- **Post-Login**: Redirect to Dashboard
- **Profile Dropdown**: 
  - الملف الشخصي (Profile)
  - لوحة التحكم (Dashboard)
  - تسجيل الخروج (Logout)

---

## Key Screens & Flows

### 1. Employees Module

#### Employees List
```
[Header: إدارة الموظفين]
[Toolbar: إضافة موظف] [استيراد Excel] [تصدير] [بحث...]

Table (RTL aligned):
| الإجراءات | الهاتف | المسمى الوظيفي | تاريخ التعيين | الاسم الكامل | رقم الموظف |
|----------|--------|--------------|-------------|-------------|-----------|
| [👁️📝🗑️] | +966... | مطور برمج��ات | 2023-01-15 | أحمد محمد علي | EMP001 |

Row Height: 56px
Hover: Background highlight
Selection: Checkbox column (leftmost in RTL)
```

#### Add/Edit Employee Form
```
نموذج بيانات الموظف

[Personal Info Tab] [Job Details Tab] [Contact Tab]

Right-aligned labels:
رقم الموظف *        [_____________]
الاسم الكامل *       [_____________]
تاريخ التعيين *      [📅 DD/MM/YYYY]
المسمى الوظيفي *     [▼ Dropdown  ]

[Actions Section]
[حفظ] [حفظ وإرفاق لاحقاً] [إلغاء]

Validation: Real-time, Arabic error messages
Required fields: Red asterisk (*)
```

#### Employee Full Profile + Side Drawer
```
Profile Layout:
┌─ Header with photo and basic info
├─ Tabs: [البيانات الأساسية] [الدورات] [التقييمات] [المكافآت]...
├─ Content area with cards
└─ Actions: [تعديل] [طباعة] [رجوع للقائمة]

Side Drawer (overlay):
Quick actions, recent activities, related records
```

### 2. Excel Import Flow (Multi-step)

#### Step 1: Upload
```
استيراد بيانات الموظفين من Excel

┌─ Upload Zone (Drag & Drop) ─┐
│  📄 اسحب ملف Excel هنا      │
│     أو انقر لاختيار الملف    │
│                             │
│  [تحميل نموذج Excel]       │
└─────────────────────────────┘

Supported: .xlsx, .xls (Max 10MB)
```

#### Step 2: Preview & Column Mapping
```
معاينة البيانات وربط الأعمدة

Excel Columns → Database Fields
A: Employee No  → رقم الموظف
B: Full Name    → الاسم الكامل
C: Hire Date    → تاريخ التعيين
...

[Preview Table showing first 5 rows]
[Continue: متابعة] [Back: رجوع]
```

#### Step 3: Validation
```
التحقق من صحة البيانات

✅ Valid Records: 45
❌ Errors: 3
⚠️  Warnings: 2

[Error Details]
Row 12: Invalid date format
Row 25: Duplicate employee number
...

[Fix Errors] [Import Valid Only] [Cancel]
```

#### Step 4: Import Results
```
نتائج الاستيراد

✅ Successfully imported: 45 employees
❌ Failed: 3 records
📄 Download error report

[View Imported Employees] [Import Another File] [Close]
```

### 3. Other Modules Pattern

#### Promotions, Rewards, Leaves, Absences
```
Standard CRUD Layout:
- List view with filters
- Add/Edit modal forms
- Attachment support
- Bulk actions
- Export options

Common fields:
- Employee selection (dropdown with search)
- Date ranges (from/to)
- Types/Categories
- Notes (textarea)
- Attachments
```

#### Reports Module
```
التقارير

Report Categories:
├── تقارير الموظفين (Employee Reports)
├── تقارير الإجازات (Leave Reports) 
├── تقارير الرواتب (Payroll Reports)
└── تقارير مخصصة (Custom Reports)

Export Options: PDF, Excel, CSV
Print Layout: A4, header/footer, RTL formatting
```

### 4. Search, Filter, Sort Patterns

#### Global Search
```
[🔍 بحث في جميع البيانات...]
Searches: Names, Employee Numbers, Job Titles
Real-time results dropdown
```

#### Advanced Filters
```
تصفية متقدمة
├── القسم (Department)
├── تاريخ التعيين (Hire Date Range)
├── المسمى الوظيفي (Job Title)
└── الحالة (Status)

[Apply Filters: تطبيق] [Reset: إعادة تعيين]
```

#### Empty States
```
لا توجد بيانات
📄 لم يتم العثور على موظفين
[إضافة موظف جديد]

No Search Results:
🔍 لا توجد نتائج للبحث عن "أحمد"
جرب كلمات بحث مختلفة
```

#### Loading States
```
جاري التحميل...
[Skeleton loader matching table structure]
Spinner for actions
Progress bar for imports
```

#### Error/Retry States
```
❌ حدث خطأ في تحميل البيانات
[إعادة ا��محاولة] [تحديث الصفحة]

Network Error:
🌐 تحقق من اتصال الإنترنت
[إعادة المحاولة]
```

---

## Forms & Validation (Unified)

### RTL Form Layout
```css
/* Label Alignment */
.form-label {
  text-align: right;
  margin-bottom: 0.5rem;
}

/* Input Direction */
.form-input {
  direction: rtl;
  text-align: right;
}

/* Required Field Indicator */
.required::after {
  content: " *";
  color: #d4183d;
}
```

### Validation Rules

#### Required Fields
```javascript
const validationRules = {
  employee_no: { required: "رقم الموظف مطلوب" },
  full_name: { required: "الاسم الكامل مطلوب" },
  hire_date: { required: "تاريخ التعيين مطلوب" },
  // ...
}
```

#### Date Range Validation
```javascript
// Leave dates
if (fromDate > toDate) {
  error = "تاريخ البداية يجب أن يكون قبل تاريخ النهاية";
}

// Future date check
if (hireDate > today) {
  error = "تاريخ التعيين لا يمكن أن يكون في المستقبل";
}
```

#### Numeric Fields
```javascript
// Salary validation
const salaryPattern = /^\d+(\.\d{1,2})?$/;
if (!salaryPattern.test(salary)) {
  error = "الراتب يجب أن يحتوي على أرقام فقط";
}
```

### Standard Button Actions
```html
<!-- Primary Actions -->
<button class="btn-primary">حفظ</button>
<button class="btn-secondary">حفظ وإرفاق لاحقاً</button>
<button class="btn-outline">إلغاء</button>

<!-- Destructive Actions -->
<button class="btn-destructive">حذف</button>
```

### Success & Error Messages

#### Arabic Toast Messages
```javascript
// Success
toast.success("تم حفظ بيانات الموظف بنجاح");
toast.success("تم حذف السجل بنجاح");

// Error  
toast.error("حدث خطأ في حفظ البيانات");
toast.error("لا يمكن حذف هذا السجل");

// Warning
toast.warning("يوجد مرفقات مرتبطة بهذا السجل");
```

#### English Toast Messages
```javascript
// Success
toast.success("Employee data saved successfully");
toast.success("Record deleted successfully");

// Error
toast.error("Error saving data");
toast.error("Cannot delete this record");

// Warning  
toast.warning("This record has attached files");
```

---

## Attachments (Universal)

### Component Behavior States

#### Idle State
```html
<div class="attachment-upload">
  📎 اسحب الملفات هنا أو انقر للتحديد
  PDF, DOCX, XLSX, JPG, PNG - Max 5MB each
</div>
```

#### Drag Over State
```css
.attachment-upload.drag-over {
  border: 2px dashed #646cff;
  background: #f0f9ff;
}
```

#### Uploading State
```html
<div class="uploading">
  ⏳ جاري رفع الملف...
  <progress value="45" max="100">45%</progress>
</div>
```

#### Error State
```html
<div class="upload-error">
  ❌ فشل في رفع الملف
  حجم الملف كبير جداً (10MB maximum)
  [إعادة المحاولة]
</div>
```

### File Type Restrictions
```javascript
const allowedTypes = [
  'application/pdf',           // PDF
  'application/msword',        // DOC
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.ms-excel',  // XLS
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  'image/jpeg',                // JPG
  'image/png'                  // PNG
];

const maxFileSize = 5 * 1024 * 1024; // 5MB
const maxFilesPerRecord = 10;
```

### Preview Overlay
```html
<!-- PDF Preview -->
<div class="file-preview">
  <iframe src="path/to/file.pdf" width="100%" height="600px"></iframe>
  [تحميل] [إغلاق]
</div>

<!-- Image Preview -->
<div class="image-preview">
  <img src="path/to/image.jpg" alt="Preview" />
  [تحميل] [إغلاق]
</div>
```

### Download & Delete Actions
```html
<div class="attachment-item">
  📄 contract.pdf (2.3 MB)
  [👁️ معاينة] [⬇️ تحميل] [🗑️ حذف]
</div>

<!-- Delete Confirmation -->
<dialog>
  هل أنت متأكد من حذف هذا الملف؟
  contract.pdf
  [نعم، احذف] [إلغاء]
</dialog>
```

---

## Currency System

### Dual Currency Support (USD/TRY)
```javascript
// Primary currency: USD (base for all storage)
// Secondary currency: TRY (converted for display)
// Exchange rate management: Manual updates with history

const currencySystem = {
  baseCurrency: 'USD',           // All amounts stored in USD
  displayCurrency: 'USD|TRY',   // User selectable
  exchangeRate: 36.50,          // Current USD→TRY rate
  rateHistory: true,            // Historical rates preserved
  manualUpdates: true           // Admin-controlled rate updates
};
```

### Currency Toggle Component
```html
<!-- Header currency toggle (positioned right in RTL) -->
<div class="currency-toggle">
  <button class="currency-btn active">USD</button>
  <button class="currency-btn">TRY</button>
</div>

<!-- Displays amounts based on selected currency -->
```

### Dual Currency Display Component
```javascript
// Component automatically shows amount in selected currency
<DualCurrencyDisplay 
  amountUSD={1500.00}
  size="lg"
  showTooltip={true}
/>

// USD mode: shows "$1,500.00"
// TRY mode: shows "₺54,750.00" with tooltip showing exchange rate
```

### Exchange Rates Management
```html
إدارة أسعار الصرف

[Current Rate Section]
USD → TRY: 36.50
Effective from: 24/09/2024
Last updated: 2 hours ago

[Update Rate Section]
New Rate: [_____] TRY per 1 USD
Effective Date: [📅 Date Picker]
Note: [________Optional note________]
[Update Rate Button]

[Rate History Table]
| Rate | Effective Date | Status | Created By | Note |
|------|---------------|--------|------------|------|
| 36.50| 24/09/2024   | Active | Admin      | Current rate |
| 35.80| 15/09/2024   | Inactive| Admin     | Previous rate |
```

### Dashboard Currency Integration
```html
لوحة التحكم (USD) <!-- Currency shown in title -->

Stats Cards:
- إجمالي الموظفين: 1,247
- إجمالي الرواتب: $65,700 (or ₺2,398,050 based on toggle)

Charts:
- اتجاه الرواتب الشهرية (USD) <!-- Currency in chart title -->
- Tooltips show amounts in selected currency
- Y-axis labels adapt to currency format
```

---

## Payroll Rules

### Salary Calculation Formula
```javascript
// Gross Salary Calculation
const calculateGrossSalary = ({
  min_base,           // الراتب الأساسي
  admin_level,        // بدل إداري  
  degree_allowance,   // بدل شهادة
  experience_allowance, // بدل خبرة (سنوي)
  years_experience,   // سنوات الخبرة
  extra_amount       // مبلغ إضافي
}) => {
  return min_base + 
         admin_level + 
         degree_allowance + 
         (experience_allowance * years_experience) + 
         extra_amount;
};

// Net Salary Calculation  
const calculateNetSalary = (gross, deductions) => {
  const {
    advances,    // السلف
    loans,       // القروض
    deductions   // الخصومات
  } = deductions;
  
  return gross - (advances + loans + deductions);
};
```

### Currency Handling
```javascript
// Multi-currency support (USD primary, TRY secondary)
const formatUSD = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

const formatTRY = (amount) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2
  }).format(amount);
};

// Currency conversion with exchange rates
const convertUsdToTry = (amountUsd, exchangeRate = 36.50) => {
  return amountUsd * exchangeRate;
};

// Rounding rules
const roundToTwoDecimals = (num) => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};
```

### Sample Scenarios
```javascript
// Example 1: Junior Developer
const scenario1 = {
  min_base: 1370, // USD equivalent 
  admin_level: 0,
  degree_allowance: 137,
  experience_allowance: 55,
  years_experience: 2,
  extra_amount: 82,
  advances: 274,
  loans: 137,
  deductions: 55
};

// Gross: 1370 + 0 + 137 + (55 * 2) + 82 = $1,699 USD
// Net: 1699 - (274 + 137 + 55) = $1,233 USD

// Example 2: Senior Manager  
const scenario2 = {
  min_base: 3288, // USD equivalent
  admin_level: 548,
  degree_allowance: 274,
  experience_allowance: 82,
  years_experience: 8,
  extra_amount: 137,
  advances: 0,
  loans: 548,
  deductions: 41
};

// Gross: 3288 + 548 + 274 + (82 * 8) + 137 = $4,903 USD
// Net: 4903 - (0 + 548 + 41) = $4,314 USD
```

---

## Auto-Calculations

### Leave Duration Calculation
```javascript
const calculateLeaveDuration = (fromDate, toDate) => {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  // Include both start and end dates
  const diffTime = Math.abs(to - from);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return diffDays;
};

// Usage
// From: 2024-01-15, To: 2024-01-17
// Duration: (17-15) + 1 = 3 days
```

### Absence Days Calculation
```javascript
const calculateAbsenceDays = (fromDate, toDate) => {
  // Same logic as leave duration
  return calculateLeaveDuration(fromDate, toDate);
};
```

### Service Years Calculation Algorithm
```javascript
const calculateServiceYears = (hireDate, currentDate = new Date()) => {
  const hire = new Date(hireDate);
  const current = new Date(currentDate);
  
  let years = current.getFullYear() - hire.getFullYear();
  let months = current.getMonth() - hire.getMonth();
  let days = current.getDate() - hire.getDate();
  
  // Adjust for negative days
  if (days < 0) {
    months--;
    const lastMonth = new Date(current.getFullYear(), current.getMonth(), 0);
    days += lastMonth.getDate();
  }
  
  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }
  
  const totalDays = Math.floor((current - hire) / (1000 * 60 * 60 * 24));
  
  return {
    years,
    months, 
    days,
    totalDays,
    displayText: `${years} سنة و ${months} شهر و ${days} يوم`
  };
};

// Example:
// Hire: 2020-03-15, Current: 2024-09-24
// Result: 4 years, 6 months, 9 days
```

---

## Role & Permissions

### User Roles
```javascript
const userRoles = {
  HR_ADMIN: {
    name: "مدير الموارد البشرية",
    permissions: [
      'employees.create',
      'employees.read', 
      'employees.update',
      'employees.delete',
      'employees.import',
      'employees.export',
      'salaries.manage',
      'reports.all',
      'attachments.manage'
    ]
  },
  
  HR_STAFF: {
    name: "موظف الموارد البشرية", 
    permissions: [
      'employees.create',
      'employees.read',
      'employees.update',
      'employees.import',
      'courses.manage',
      'evaluations.manage',
      'leaves.manage',
      'attachments.view'
    ]
  },
  
  ADMIN: {
    name: "مدير النظام",
    permissions: ['*'] // All permissions
  },
  
  SUPER_ADMIN: {
    name: "مدير النظام الرئيسي",
    permissions: ['*'] // System administration
  }
};
```

### Permission Checks
```javascript
// Component level permission check
const CanCreateEmployee = ({ children }) => {
  const hasPermission = usePermission('employees.create');
  return hasPermission ? children : null;
};

// Usage in components
<CanCreateEmployee>
  <Button>إضافة موظف</Button>
</CanCreateEmployee>
```

### Attachment Permissions
```javascript
const attachmentPermissions = {
  view: ['HR_ADMIN', 'HR_STAFF'],
  upload: ['HR_ADMIN', 'HR_STAFF'], 
  download: ['HR_ADMIN', 'HR_STAFF'],
  delete: ['HR_ADMIN'] // Only admins can delete
};
```

---

## Internationalization (i18n)

### RTL/LTR Mirroring Rules
```css
/* Layout mirroring */
[dir="rtl"] .sidebar {
  right: 0;
  left: auto;
}

[dir="rtl"] .dropdown-menu {
  right: 0;
  left: auto;
}

/* Icon mirroring for directional icons */
[dir="rtl"] .icon-arrow-right {
  transform: scaleX(-1);
}

/* Text alignment */
[dir="rtl"] .text-content {
  text-align: right;
}

[dir="ltr"] .text-content {
  text-align: left;
}
```

### Date/Number Formats
```javascript
// Arabic locale formatting
const arabicFormatter = new Intl.DateTimeFormat('ar-SA', {
  year: 'numeric',
  month: '2-digit', 
  day: '2-digit'
});

// English locale formatting  
const englishFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

// Usage
const date = new Date('2024-09-24');
// Arabic: ٢٤/٠٩/٢٠٢٤
// English: 09/24/2024
```

### Text Expansion Notes
```javascript
// Arabic text typically 20-30% longer than English
const textExpansion = {
  buttons: 1.3,     // 30% longer
  labels: 1.25,     // 25% longer  
  messages: 1.2     // 20% longer
};

// Design for Arabic first, then adapt to English
```

---

## Prototype Notes

### Component Names
```
// Universal Components
- AttachmentUpload
- FormValidation  
- UniversalForm
- ProfessionalTable

// Currency Components
- CurrencyService
- CurrencyToggle
- DualCurrencyDisplay
- ExchangeRatesManager

// Page Components  
- EmployeesPageFixed
- CoursesPageNew
- EvaluationsPageNew
- ExchangeRatesPage
- [Module]Page

// UI Components
- ExcelImportModal
- EmployeeDetailsDrawer
- EmployeeProfile
```

### Interaction Names
```
// Navigation
- onPageChange
- onViewProfile
- onBackToEmployees

// CRUD Operations
- onCreate
- onUpdate
- onDelete
- onSave

// Excel Import
- onExcelImportOpen
- onExcelImportOpenChange

// Attachments
- onFileUpload
- onFileDelete
- onFilePreview
```

### Overlay Rules
```javascript
// Modal/Dialog behavior
const overlayRules = {
  open: 'click trigger element',
  close: [
    'click outside overlay',
    'press Escape key', 
    'click close button',
    'click cancel/save action'
  ],
  backdrop: 'semi-transparent black (0.5 opacity)',
  animation: 'fade in/out (200ms)'
};
```

### Table Master Component Specs
```css
.professional-table {
  /* Row specifications */
  .table-row {
    height: 56px;
    padding: 0 16px;
    border-bottom: 1px solid var(--border);
  }
  
  /* Header style */
  .table-header {
    background: var(--muted);
    font-weight: var(--font-weight-medium);
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  /* Column alignment (RTL) */
  .column-actions { text-align: left; }   /* Actions on left in RTL */
  .column-text { text-align: right; }     /* Text aligned right */
  .column-number { text-align: center; }  /* Numbers centered */
  .column-date { text-align: center; }    /* Dates centered */
}
```

---

## Handoff Checklist

### What Developers Need from Design

#### Design Tokens (Already in globals.css)
- ✅ Color variables with semantic names
- ✅ Typography scale and weights  
- ✅ Spacing and border radius values
- ✅ Component-specific tokens (sidebar, etc.)

#### Component Specifications
- ✅ Button variants and states
- ✅ Form input styles and validation states
- ✅ Table row heights and column alignment
- ✅ Modal/dialog sizing and positioning
- ✅ Toast notification positioning

#### Responsive Breakpoints
```css
/* Desktop-first approach (Electron app) */
@media (max-width: 1200px) { /* Small desktop */ }
@media (max-width: 992px)  { /* Tablet landscape */ }
@media (max-width: 768px)  { /* Tablet portrait */ }
@media (max-width: 576px)  { /* Mobile */ }
```

#### Assets Required
- ✅ App logo (SVG format)
- ✅ Lucide icons (already imported)
- ✅ Default avatar placeholder
- ✅ Empty state illustrations

### Export Instructions

#### PDF Export
1. Use browser print function
2. Set paper size: A4
3. Include backgrounds: Yes
4. Margins: Normal
5. Save as PDF

#### Markdown Export
1. This file is already in Markdown format
2. Copy content to `.md` file
3. Ensure code blocks are properly formatted
4. Test rendering in Markdown viewer

### Asset Naming Conventions
```
// Component files
ComponentName.tsx (PascalCase)

// Utility files  
utility-name.ts (kebab-case)

// Image assets
icon-name.svg (kebab-case)
image-description.png (kebab-case)

// Page components
[Module]Page.tsx (e.g., EmployeesPage.tsx)
```

### Development Notes
- ✅ All Arabic text should be externalized to translation files
- ✅ RTL support must be tested thoroughly
- ✅ Form validation messages in both languages
- ✅ Date/number formatting for both locales
- ✅ Keyboard navigation for accessibility
- ✅ Print styles for reports
- ✅ File upload security validation
- ✅ Database schema matches form fields

---

**Document Status**: Ready for Development Handoff
**Last Updated**: September 24, 2024
**Version**: 1.0
**Export Formats**: PDF, Markdown (.md)