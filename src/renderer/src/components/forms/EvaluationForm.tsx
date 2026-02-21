import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { X } from 'lucide-react'
import { evaluationInputSchema } from '../../schemas/evaluation'

interface EvaluationFormProps {
  open: boolean
  onClose: () => void
  initial?: any
  onSaved: () => void
  employees: any[]
}

export function EvaluationForm({ open, onClose, initial, onSaved, employees }: EvaluationFormProps) {
  const [form, setForm] = useState({
    employee_id: initial?.employee_id?.toString() ?? '',
    evaluator_id: initial?.evaluator_id?.toString() ?? '',
    period: initial?.period ?? '',
    overall_score: initial?.overall_score?.toString() ?? '',
    rating: initial?.rating ?? 'جيد',
    goals_percent: initial?.goals_percent?.toString() ?? initial?.goals_achievement?.toString() ?? '0',
    status: initial?.status ?? 'قيد المراجعة',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initial) {
      setForm({
        employee_id: initial.employee_id?.toString() ?? '',
        evaluator_id: initial.evaluator_id?.toString() ?? '',
        period: initial.period ?? '',
        overall_score: initial.overall_score?.toString() ?? '',
        rating: initial.rating ?? 'جيد',
        goals_percent: initial.goals_percent?.toString() ?? initial.goals_achievement?.toString() ?? '0',
        status: initial.status ?? 'قيد المراجعة',
      })
    }
  }, [initial])

  const handleSave = async () => {
    try {
      setLoading(true)
      setErrors({})
      
      // Validate with Zod
      const parsed = evaluationInputSchema.parse(form)
      
      if (initial?.id) {
        await window.api.updateEvaluation(initial.id, parsed)
        if (window.toast?.success) {
          window.toast.success('تم تحديث التقييم بنجاح')
        }
      } else {
        await window.api.createEvaluation(parsed)
        if (window.toast?.success) {
          window.toast.success('تم إضافة التقييم بنجاح')
        }
      }
      
      onSaved()
      onClose()
    } catch (error: any) {
      console.error('Save error:', error)
      
      if (error.errors) {
        // Zod validation errors
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          if (err.path && err.path.length > 0) {
            fieldErrors[err.path[0]] = err.message
          }
        })
        setErrors(fieldErrors)
      }
      
      if (window.toast?.error) {
        window.toast.error('البيانات غير صحيحة')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[90vw] max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {initial ? 'تعديل التقييم' : 'إضافة تقييم جديد'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]" dir="rtl">
          <div className="grid grid-cols-2 gap-6">
            {/* الموظف */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الموظف *
              </label>
              <select
                value={form.employee_id}
                onChange={(e) => setForm(prev => ({ ...prev, employee_id: e.target.value }))}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.employee_id ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">اختر الموظف</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_no} - {emp.full_name}
                  </option>
                ))}
              </select>
              {errors.employee_id && (
                <p className="text-red-500 text-sm mt-1">{errors.employee_id}</p>
              )}
            </div>

            {/* المُقيِّم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المُقيِّم *
              </label>
              <select
                value={form.evaluator_id}
                onChange={(e) => setForm(prev => ({ ...prev, evaluator_id: e.target.value }))}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.evaluator_id ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">اختر المُقيِّم</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_no} - {emp.full_name}
                  </option>
                ))}
              </select>
              {errors.evaluator_id && (
                <p className="text-red-500 text-sm mt-1">{errors.evaluator_id}</p>
              )}
            </div>

            {/* الفترة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفترة *
              </label>
              <input
                type="text"
                value={form.period}
                onChange={(e) => setForm(prev => ({ ...prev, period: e.target.value }))}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.period ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="2025-09 أو 2025-04 — 2025-09"
                required
              />
              {errors.period && (
                <p className="text-red-500 text-sm mt-1">{errors.period}</p>
              )}
            </div>

            {/* الحالة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة *
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.status ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="قيد المراجعة">قيد المراجعة</option>
                <option value="معتمد">معتمد</option>
                <option value="مرفوض">مرفوض</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
            </div>

            {/* الدرجة الإجمالية */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الدرجة الإجمالية (0-100) *
              </label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                value={form.overall_score}
                onChange={(e) => setForm(prev => ({ ...prev, overall_score: e.target.value }))}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.overall_score ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0 - 100"
                required
              />
              {errors.overall_score && (
                <p className="text-red-500 text-sm mt-1">{errors.overall_score}</p>
              )}
            </div>

            {/* التقييم */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التقييم *
              </label>
              <select
                value={form.rating}
                onChange={(e) => setForm(prev => ({ ...prev, rating: e.target.value }))}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.rating ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="ضعيف">ضعيف</option>
                <option value="يحتاج تحسين">يحتاج تحسين</option>
                <option value="مقبول">مقبول</option>
                <option value="جيد">جيد</option>
                <option value="ممتاز">ممتاز</option>
              </select>
              {errors.rating && (
                <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
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
            disabled={loading || !form.employee_id || !form.evaluator_id || !form.period}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </div>
      </div>
    </div>
  )
}
