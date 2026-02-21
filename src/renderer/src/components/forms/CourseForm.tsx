import React, { useState, useEffect, useRef } from 'react'
import { Button } from '../ui/Button'
import { X, Upload, Paperclip, Trash2 } from 'lucide-react'

interface CourseFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  initialData?: any
  employees: any[]
}

export function CourseForm({ isOpen, onClose, onSave, initialData, employees }: CourseFormProps) {
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    employee_id: initialData?.employee_id ?? '',
    course_name: initialData?.course_name ?? '',
    provider: initialData?.provider ?? '',
    start_date: initialData?.start_date ?? '',
    end_date: initialData?.end_date ?? '',
    result: initialData?.result ?? '',
    grade: initialData?.grade ?? '',
    status: initialData?.status ?? 'planned',
    attachment_name: initialData?.attachment_name ?? '',
    attachment_path: initialData?.attachment_path ?? '',
    attachment_size: initialData?.attachment_size ?? 0,
  })

  useEffect(() => {
    if (initialData) {
      setForm({
        employee_id: initialData.employee_id ?? '',
        course_name: initialData.course_name ?? '',
        provider: initialData.provider ?? '',
        start_date: initialData.start_date ?? '',
        end_date: initialData.end_date ?? '',
        result: initialData.result ?? '',
        grade: initialData.grade ?? '',
        status: initialData.status ?? 'planned',
        attachment_name: initialData.attachment_name ?? '',
        attachment_path: initialData.attachment_path ?? '',
        attachment_size: initialData.attachment_size ?? 0,
      })
    }
  }, [initialData])

  const handleSave = async () => {
    try {
      setLoading(true)
      const data = {
        ...form,
        employee_id: Number(form.employee_id),
        grade: form.grade ? Number(form.grade) : null,
      }
      console.log('💾 Saving course data:', data)
      await onSave(data)
      console.log('✅ Course saved successfully')
      onClose()
    } catch (error) {
      console.error('❌ Save error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePickAttachment = async () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('📄 File selected:', file.name)
    try {
      setLoading(true)

      // In Electron, File objects have a .path property with the file system path
      const filePath = (file as any).path

      if (!filePath || typeof filePath !== 'string') {
        console.error('File path not available:', file)
        alert('فشل في الحصول على مسار الملف')
        return
      }

      // Pass as a single object to match preload API signature: save(data)
      const result = await window.api.files.save({
        entityType: 'course',
        entityId: 0, // Temporary ID, will be updated when course is saved
        fileName: file.name,
        filePath,
        size: file.size
      })

      if (result.success && result.attachment) {
        setForm(prev => ({
          ...prev,
          attachment_name: result.attachment.name || file.name,
          attachment_path: result.attachment.path || '',
          attachment_size: result.attachment.size || file.size,
        }))
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (err) {
      console.error("Upload failed", err)
      alert("فشل في رفع الملف")
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  const handleRemoveAttachment = async () => {
    try {
      if (form.attachment_path && window.api?.removeCourseAttachment) {
        await window.api.removeCourseAttachment(form.attachment_path)
      }
      setForm(prev => ({
        ...prev,
        attachment_name: '',
        attachment_path: '',
        attachment_size: 0,
      }))
    } catch (error) {
      console.error('Remove attachment error:', error)
    }
  }

  const handleOpenAttachment = () => {
    if (form.attachment_path && window.api?.openPath) {
      window.api.openPath(form.attachment_path)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[90vw] max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {initialData ? 'تعديل الدورة' : 'إضافة دورة جديدة'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-6">
            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الموظف *
              </label>
              <select
                value={form.employee_id}
                onChange={(e) => setForm(prev => ({ ...prev, employee_id: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">اختر الموظف</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_no} - {emp.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الدورة *
              </label>
              <input
                type="text"
                value={form.course_name}
                onChange={(e) => setForm(prev => ({ ...prev, course_name: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: React المتقدم"
                required
              />
            </div>

            {/* Provider */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الجهة المنفذة *
              </label>
              <input
                type="text"
                value={form.provider}
                onChange={(e) => setForm(prev => ({ ...prev, provider: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: معهد التقنية"
                required
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ البداية *
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ النهاية *
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الدرجة %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.grade}
                onChange={(e) => setForm(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="85"
              />
            </div>

            {/* Result */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                النتيجة
              </label>
              <select
                value={form.result}
                onChange={(e) => setForm(prev => ({ ...prev, result: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر النتيجة</option>
                <option value="ممتاز">ممتاز</option>
                <option value="جيد جداً">جيد جداً</option>
                <option value="جيد">جيد</option>
                <option value="مقبول">مقبول</option>
                <option value="في التقدم">في التقدم</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة *
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="planned">مخطط</option>
                <option value="ongoing">جاري</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>
          </div>

          {/* Attachment Section */}
          <div className="mt-6 border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              إرفاق شهادة (PDF/صورة)
            </label>

            {/* Hidden file input for fallback */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handleFileInputChange}
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePickAttachment}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                اختيار ملف
              </button>

              {form.attachment_name ? (
                <>
                  <span
                    className="text-sm truncate max-w-[240px] cursor-pointer hover:text-blue-600"
                    title={form.attachment_name}
                    onClick={handleOpenAttachment}
                  >
                    {form.attachment_name}
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenAttachment}
                    className="text-blue-600 hover:text-blue-800"
                    title="فتح الملف"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    className="text-red-600 hover:text-red-800"
                    title="إزالة الملف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <span className="text-xs text-gray-400">لا يوجد ملف</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !form.course_name || !form.provider || !form.employee_id}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </div>
      </div>
    </div>
  )
}
