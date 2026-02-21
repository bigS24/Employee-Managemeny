import React from 'react';
import { UniversalForm, FormSection } from './UniversalForm';
import { ValidationRules, commonRules } from './FormValidation';
import { User, Phone, DollarSign, FileText } from 'lucide-react';

interface EmployeeFormProps {
  onClose: () => void;
  onSave: (employee: any) => void;
  initialData?: any;
}

export function EmployeeForm({ onClose, onSave, initialData }: EmployeeFormProps) {

  const sections: FormSection[] = [
    {
      id: 'basic',
      title: 'البيانات الأساسية',
      icon: <User className="w-4 h-4" />,
      fields: [
        {
          name: 'employeeNumber',
          label: 'رقم الموظف',
          type: 'text',
          placeholder: 'EMP001',
          required: true
        },
        {
          name: 'name',
          label: 'الاسم الكامل',
          type: 'text',
          placeholder: 'أحمد محمد علي',
          required: true
        },
        {
          name: 'position',
          label: 'المنصب',
          type: 'text',
          placeholder: 'مطور أول',
          required: true
        },
        {
          name: 'department',
          label: 'القسم',
          type: 'select',
          placeholder: 'اختر القسم',
          required: true,
          options: [
            { value: 'تقنية المعلومات', label: 'تقنية المعلومات' },
            { value: 'المالية', label: 'المالية' },
            { value: 'العمليات', label: 'العمليات' },
            { value: 'الموارد البشرية', label: 'الموارد البشرية' }
          ]
        },
        {
          name: 'hireDate',
          label: 'تاريخ التعيين',
          type: 'date'
        },
        {
          name: 'grade',
          label: 'الدرجة الوظيفية',
          type: 'select',
          placeholder: 'اختر الدرجة',
          options: [
            { value: 'الدرجة الأولى', label: 'الدرجة الأولى' },
            { value: 'الدرجة الثانية', label: 'الدرجة الثانية' },
            { value: 'الدرجة الثالثة', label: 'الدرجة الثالثة' },
            { value: 'الدرجة الرابعة', label: 'الدرجة الرابعة' },
            { value: 'الدرجة الخامسة', label: 'الدرجة الخامسة' },
            { value: 'الدرجة السادسة', label: 'الدرجة السادسة' }
          ]
        }
      ]
    },
    {
      id: 'contact',
      title: 'بيانات الاتصال',
      icon: <Phone className="w-4 h-4" />,
      fields: [
        {
          name: 'phone',
          label: 'رقم الهاتف',
          type: 'tel',
          placeholder: '0501234567',
          required: true
        },
        {
          name: 'email',
          label: 'البريد الإلكتروني',
          type: 'email',
          placeholder: 'employee@company.com',
          required: true
        },
        {
          name: 'nationalId',
          label: 'رقم الهوية',
          type: 'text',
          placeholder: '1234567890',
          required: true
        },
        {
          name: 'status',
          label: 'الحالة',
          type: 'select',
          options: [
            { value: 'نشط', label: 'نشط' },
            { value: 'إجازة', label: 'إجازة' },
            { value: 'متقاعد', label: 'متقاعد' }
          ]
        },
        {
          name: 'address',
          label: 'العنوان',
          type: 'textarea',
          placeholder: 'الرياض، المملكة العربية السعودية'
        }
      ]
    },
    {
      id: 'salary',
      title: 'الراتب',
      icon: <DollarSign className="w-4 h-4" />,
      fields: [
        {
          name: 'basicSalary',
          label: 'الراتب الأساسي',
          type: 'number',
          placeholder: '15000',
          required: true,
          min: 1000
        },
        {
          name: 'allowances',
          label: 'البدلات',
          type: 'number',
          placeholder: '2000',
          min: 0
        },
        {
          name: 'housing',
          label: 'بدل السكن',
          type: 'number',
          placeholder: '1000',
          min: 0
        },
        {
          name: 'transport',
          label: 'بدل النقل',
          type: 'number',
          placeholder: '500',
          min: 0
        }
      ]
    },
    {
      id: 'documents',
      title: 'المرفقات',
      icon: <FileText className="w-4 h-4" />,
      fields: [
        {
          name: 'personalPhoto',
          label: 'الصورة الشخصية',
          type: 'attachment'
        },
        {
          name: 'documents',
          label: 'الوثائق والمستندات',
          type: 'attachment'
        }
      ]
    }
  ];

  const validationRules: ValidationRules = {
    employeeNumber: commonRules.employeeNumber,
    name: commonRules.name,
    position: commonRules.required,
    department: commonRules.required,
    phone: commonRules.phone,
    email: commonRules.email,
    nationalId: commonRules.nationalId,
    basicSalary: { ...commonRules.salary, min: 1000 }
  };

  const defaultData = {
    employeeNumber: '',
    name: '',
    position: '',
    department: '',
    hireDate: new Date().toISOString().split('T')[0],
    phone: '',
    email: '',
    status: 'نشط',
    nationalId: '',
    address: '',
    grade: 'الدرجة الأولى',
    basicSalary: 0,
    allowances: 0,
    housing: 0,
    transport: 0,
    ...initialData
  };

  const handleSave = async (formData: any) => {
    // Calculate total salary
    const totalSalary = (formData.basicSalary || 0) + (formData.allowances || 0) + 
                       (formData.housing || 0) + (formData.transport || 0);
    
    const employeeData = {
      ...formData,
      salary: totalSalary,
      photo: null
    };
    
    onSave(employeeData);
  };

  return (
    <UniversalForm
      title={initialData ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}
      sections={sections}
      validationRules={validationRules}
      initialData={defaultData}
      onSubmit={handleSave}
      onCancel={onClose}
      submitLabel={initialData ? "حفظ التغييرات" : "حفظ الموظف"}
    />
  );
}