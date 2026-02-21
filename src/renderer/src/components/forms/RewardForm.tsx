import { useState, useEffect } from 'react'
import { Drawer } from '../ui/CustomDrawer'
import { Button } from '../ui/Button'
import { toast } from 'sonner'
import { rewardInputSchema } from '../../schemas/reward'
import { EmployeeSearchSelect } from './EmployeeSearchSelect'

export function RewardForm({ open, onClose, initial, onSaved }: {
  open: boolean; onClose: () => void; initial?: any; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    employee_id: initial?.employee_id?.toString() ?? '',
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    kind: initial?.kind ?? 'مكافأة',
    category: initial?.category ?? 'شهري',
    amount_usd: initial?.amount_usd?.toString() ?? '',
    reward_date: initial?.reward_date ?? '',
    status: initial?.status ?? 'مدفوع',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initial) {
      setForm({
        employee_id: initial.employee_id?.toString() ?? '',
        title: initial.title ?? '',
        description: initial.description ?? '',
        kind: initial.kind ?? 'مكافأة',
        category: initial.category ?? 'شهري',
        amount_usd: initial.amount_usd?.toString() ?? '',
        reward_date: initial.reward_date ?? '',
        status: initial.status ?? 'مدفوع',
      })
    } else {
      setForm({
        employee_id: '',
        title: '',
        description: '',
        kind: 'مكافأة',
        category: 'شهري',
        amount_usd: '',
        reward_date: '',
        status: 'مدفوع',
      })
    }
  }, [initial, open])

  async function handleSave() {
    try {
      setSaving(true)
      const parsed = rewardInputSchema.parse(form)
      if (initial?.id) {
        await window.api.updateReward(initial.id, parsed)
        toast.success('تم تحديث المكافأة بنجاح')
      } else {
        await window.api.createReward(parsed)
        toast.success('تم إضافة المكافأة بنجاح')
      }
      onSaved()
      onClose()
    } catch (e: any) {
      console.error('Reward save error:', e)
      if (e.issues) {
        // Zod validation errors
        const firstError = e.issues[0]?.message || 'البيانات غير صحيحة'
        toast.error(firstError)
      } else {
        toast.error('حدث خطأ أثناء حفظ المكافأة')
      }
    } finally {
      setSaving(false)
    }
  }

  return open ? (
    <Drawer title={initial ? 'تعديل مكافأة' : 'إضافة مكافأة جديدة'} onClose={onClose}>
      <div className="grid grid-cols-2 gap-6" dir="rtl">
        {/* الموظف */}
        <EmployeeSearchSelect
          selectedId={form.employee_id ? Number(form.employee_id) : undefined}
          onSelect={(emp: any) => setForm(p => ({ ...p, employee_id: emp?.id?.toString() ?? '' }))}
          label="الموظف *"
          placeholder="ابحث عن الموظف..."
        />

        {/* النوع */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">النوع *</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={form.kind}
            onChange={(e) => setForm(p => ({ ...p, kind: e.target.value }))}
          >
            <option value="مكافأة">مكافأة</option>
            <option value="تقدير">تقدير</option>
            <option value="إنجاز">إنجاز</option>
            <option value="ابتكار">ابتكار</option>
            <option value="خاص">خاص</option>
          </select>
        </div>

        {/* العنوان */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">العنوان *</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={form.title}
            onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="عنوان المكافأة"
          />
        </div>

        {/* الفئة */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الفئة *</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={form.category}
            onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
          >
            <option value="شهري">شهري</option>
            <option value="سنوي">سنوي</option>
            <option value="ربع سنوي">ربع سنوي</option>
            <option value="خاص">خاص</option>
          </select>
        </div>

        {/* التاريخ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ *</label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={form.reward_date}
            onChange={(e) => setForm(p => ({ ...p, reward_date: e.target.value }))}
          />
        </div>

        {/* الحالة */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">الحالة *</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={form.status}
            onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
          >
            <option value="مدفوع">مدفوع</option>
            <option value="في الانتظار">في الانتظار</option>
            <option value="معتمد">معتمد</option>
          </select>
        </div>

        {/* المبلغ (بالدولار الأمريكي) */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المبلغ (بالدولار الأمريكي USD) <span className="text-gray-500 font-normal">(اختياري)</span>
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={form.amount_usd}
            onChange={(e) => setForm(p => ({ ...p, amount_usd: e.target.value }))}
            placeholder="0.00"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 يتم تخزين المبالغ بالدولار الأمريكي. سيتم عرضها بالليرة التركية حسب سعر الصرف النشط.
            {form.amount_usd && parseFloat(form.amount_usd) > 0 && (
              <span className="block mt-1 text-blue-600 font-medium">
                ≈ {(parseFloat(form.amount_usd) * 34.0).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ليرة تركية (تقريبي)
              </span>
            )}
          </p>
        </div>

        {/* الوصف */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="وصف المكافأة (اختياري)"
            value={form.description}
            onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>إلغاء</Button>
        <Button disabled={saving} onClick={handleSave}>
          {saving ? 'جارٍ الحفظ…' : 'حفظ'}
        </Button>
      </div>
    </Drawer>
  ) : null
}
