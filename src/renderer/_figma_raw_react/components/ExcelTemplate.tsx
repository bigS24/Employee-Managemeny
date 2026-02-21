// Excel Template Generator for Employee Import
// This would be used to generate and download Excel templates

export const TEMPLATE_HEADERS = [
  'الاسم الثلاثي',
  'رقم الموظف', 
  'المنصب',
  'القسم',
  'تاريخ التعيين',
  'رقم الهاتف',
  'البريد الإلكتروني',
  'الراتب الأساسي',
  'رقم الهوية',
  'العنوان',
  'الدرجة الوظيفية'
];

export const SAMPLE_TEMPLATE_DATA = [
  [
    'أحمد محمد علي',
    'EMP001',
    'مطور أول',
    'تقنية المعلومات',
    '2020-01-15',
    '0501234567',
    'ahmed@company.com',
    '15000',
    '1234567890',
    'الرياض، المملكة العربية السعودية',
    'الدرجة الخامسة'
  ],
  [
    'فاطمة عبد الله',
    'EMP002',
    'محاسبة',
    'المالية',
    '2019-03-20',
    '0509876543',
    'fatima@company.com',
    '12000',
    '0987654321',
    'جدة، المملكة العربية السعودية',
    'الدرجة الرابعة'
  ]
];

export function generateExcelTemplate() {
  // In a real implementation, this would use a library like xlsx or exceljs
  // to generate an actual Excel file with proper formatting, data validation, etc.
  
  const csvContent = [
    TEMPLATE_HEADERS.join(','),
    ...SAMPLE_TEMPLATE_DATA.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'employee_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function validateEmployeeData(data: any[], mappings: {[key: string]: string}) {
  const errors: any[] = [];
  const requiredFields = ['name', 'employeeNumber', 'position', 'department', 'hireDate'];
  
  data.forEach((row, index) => {
    const rowErrors: string[] = [];
    
    // Check required fields
    requiredFields.forEach(field => {
      const columnIndex = parseInt(mappings[field]?.replace('column_', '') || '-1');
      if (columnIndex === -1 || !row[columnIndex] || row[columnIndex].toString().trim() === '') {
        const fieldLabels: {[key: string]: string} = {
          name: 'الاسم الثلاثي',
          employeeNumber: 'رقم الموظف',
          position: 'المنصب',
          department: 'القسم',
          hireDate: 'تاريخ التعيين'
        };
        rowErrors.push(`${fieldLabels[field]} مطلوب`);
      }
    });
    
    // Validate email format if provided
    const emailColumnIndex = parseInt(mappings['email']?.replace('column_', '') || '-1');
    if (emailColumnIndex !== -1 && row[emailColumnIndex] && 
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row[emailColumnIndex].toString())) {
      rowErrors.push('تنسيق البريد الإلكتروني غير صحيح');
    }
    
    // Validate phone format if provided (Saudi format)
    const phoneColumnIndex = parseInt(mappings['phone']?.replace('column_', '') || '-1');
    if (phoneColumnIndex !== -1 && row[phoneColumnIndex]) {
      const phone = row[phoneColumnIndex].toString().replace(/\s/g, '');
      if (!/^(05|٠٥)\d{8}$/.test(phone) && !/^\+966\d{9}$/.test(phone)) {
        rowErrors.push('تنسيق رقم الهاتف غير صحيح (مثال: 0501234567)');
      }
    }
    
    // Validate date format
    const dateColumnIndex = parseInt(mappings['hireDate']?.replace('column_', '') || '-1');
    if (dateColumnIndex !== -1 && row[dateColumnIndex]) {
      const dateStr = row[dateColumnIndex].toString();
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        rowErrors.push('تنسيق التاريخ غير صحيح (استخدم YYYY-MM-DD)');
      }
    }
    
    // Validate salary if provided
    const salaryColumnIndex = parseInt(mappings['salary']?.replace('column_', '') || '-1');
    if (salaryColumnIndex !== -1 && row[salaryColumnIndex]) {
      const salary = parseFloat(row[salaryColumnIndex].toString().replace(/,/g, ''));
      if (isNaN(salary) || salary < 0) {
        rowErrors.push('الراتب يجب أن يكون رقم موجب');
      }
    }
    
    if (rowErrors.length > 0) {
      errors.push({
        rowIndex: index + 2, // +2 because Excel starts from 1 and we skip header
        errors: rowErrors,
        data: row
      });
    }
  });
  
  return errors;
}