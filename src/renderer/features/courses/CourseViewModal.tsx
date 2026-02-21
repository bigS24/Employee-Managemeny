import React, { useEffect } from 'react'

interface CourseViewModalProps {
  course: any
  onClose: () => void
}

export default function CourseViewModal({ onClose, course }: CourseViewModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!course) return null

  return (
    <div className="fixed inset-0 z-[1100]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none" dir="rtl">
        <div className="pointer-events-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">تفاصيل الدورة</h3>
            <button 
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onClose}
              aria-label="إغلاق النافذة"
            >
              إغلاق
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">اسم الدورة:</span> {course.course_name || course.title}
            </div>
            <div>
              <span className="text-gray-500">مقدم التدريب:</span> {course.provider}
            </div>
            <div>
              <span className="text-gray-500">الموظف:</span> {course.employee_name}
            </div>
            <div>
              <span className="text-gray-500">الفترة:</span> {course.start_date} — {course.end_date}
            </div>
            <div>
              <span className="text-gray-500">النتيجة:</span> {course.result || '—'}
            </div>
            <div>
              <span className="text-gray-500">الدرجة:</span> {course.grade ? `${course.grade}%` : course.score ? `${course.score}%` : '—'}
            </div>
            <div>
              <span className="text-gray-500">الحالة:</span> {course.status}
            </div>
            <div>
              <span className="text-gray-500">تاريخ الإنشاء:</span> {course.created_at ? new Date(course.created_at).toLocaleDateString('ar-SA') : '—'}
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">ملاحظات:</span> {course.notes || course.description || '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}