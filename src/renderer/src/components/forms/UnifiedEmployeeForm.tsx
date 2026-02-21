import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../ui/Button'
import { EmployeeAttachmentsList } from '../attachments/EmployeeAttachmentsList'
import { toast } from 'sonner'
import { X, Save } from 'lucide-react'

const employeeSchema = z.object({
  employee_no: z.string().min(1, 'رقم الموظف مطلوب'),
  full_name: z.string().min(1, 'الاسم الكامل مطلوب'),
  phone: z.string().optional(),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  department: z.string().min(1, 'القسم مطلوب'),
  unit: z.string().optional(),
  job_title: z.string().min(1, 'المسمى الوظيفي مطلوب'),
  education_degree: z.string().optional(),
  hire_date: z.string().min(1, 'تاريخ التوظيف مطلوب'),
  category: z.string().optional(),
  grade: z.string().optional(),
  status: z.enum(['active', 'inactive', 'leave']).default('active'),
})

type EmployeeFormData = z.infer<typeof employeeSchema>

interface UnifiedEmployeeFormProps {
  initialData?: any
  onSuccess: () => void
  onCancel: () => void
}

export function UnifiedEmployeeForm({ initialData, onSuccess, onCancel }: UnifiedEmployeeFormProps) {
  const isEdit = !!initialData?.id

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      status: 'active',
      ...initialData
    }
  })

  useEffect(() => {
    if (initialData) {
      reset(initialData)
    }
  }, [initialData, reset])

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      if (isEdit) {
        await window.api.updateRecord('employees', initialData.id, data)
        toast.success('تم تحديث بيانات الموظف بنجاح')
      } else {
        await window.api.createRecord('employees', data)
        toast.success('تم إضافة الموظف بنجاح')
      }
      onSuccess()
    } catch (error: any) {
      console.error('Failed to save employee:', error)
      toast.error(error.message || 'فشل حفظ البيانات')
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800">
          {isEdit ? 'تعديل بيانات موظف' : 'إضافة موظف جديد'}
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <form id="employee-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Basic Info */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-blue-800 border-b pb-2">المعلومات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">رقم الموظف <span className="text-red-500">*</span></label>
                <input
                  {...register('employee_no')}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: 101"
                />
                {errors.employee_no && <p className="text-red-500 text-sm">{errors.employee_no.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">اسم الموظف <span className="text-red-500">*</span></label>
                <input
                  {...register('full_name')}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="الاسم الكامل"
                />
                {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">رقم الهاتف</label>
                <input
                  {...register('phone')}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="05xxxxxxxx"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">البريد الإلكتروني</label>
                <input
                  {...register('email')}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>
            </div>
          </section>

          {/* Section 2: Job Info */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-blue-800 border-b pb-2">معلومات الوظيفة</h3>
            <div className="space-y-6">
              {/* Row 1: Department + Unit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">القسم <span className="text-red-500">*</span></label>
                  <input
                    {...register('department')}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 text-base"
                    placeholder="مثال: الموارد البشرية"
                  />
                  {errors.department && <p className="text-red-500 text-sm">{errors.department.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">الوحدة</label>
                  <input
                    {...register('unit')}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 text-base"
                    placeholder="مثال: وحدة التوظيف"
                  />
                </div>
              </div>

              {/* Row 2: Job Title + Education */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">المسمى الوظيفي <span className="text-red-500">*</span></label>
                  <input
                    {...register('job_title')}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 text-base"
                    placeholder="مثال: مدير موارد بشرية"
                  />
                  {errors.job_title && <p className="text-red-500 text-sm">{errors.job_title.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">المؤهل العلمي</label>
                  <input
                    {...register('education_degree')}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 text-base"
                    placeholder="مثال: بكالوريوس إدارة أعمال"
                  />
                </div>
              </div>

              {/* Row 3: Other fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">تاريخ التوظيف <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    {...register('hire_date')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.hire_date && <p className="text-red-500 text-sm">{errors.hire_date.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">الفئة</label>
                  <input
                    {...register('category')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: إداري"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">الدرجة</label>
                  <input
                    {...register('grade')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: 5"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">الحالة</label>
                  <select
                    {...register('status')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير فعّال</option>
                    <option value="leave">إجازة</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        </form>

        {/* Section 3: Attachments (Only for Edit) */}
        {isEdit && (
          <section className="mt-8 pt-6 border-t">
            <EmployeeAttachmentsList employeeId={initialData.id} />
          </section>
        )}
        {!isEdit && (
          <div className="mt-8 pt-6 border-t text-gray-500 text-sm text-center">
            يمكنك إضافة المرفقات بعد حفظ الموظف.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
        <Button variant="outline" onClick={onCancel} type="button">
          إلغاء
        </Button>
        <Button type="submit" form="employee-form" disabled={isSubmitting}>
          <Save className="w-4 h-4 ml-2" />
          {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
        </Button>
      </div>
    </div>
  )
}
