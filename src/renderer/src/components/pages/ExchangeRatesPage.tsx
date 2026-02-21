import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { useAppStore } from '@/store/appStore'
import { Plus, Check, X } from 'lucide-react'
import { toast } from 'sonner'

interface ExchangeRate {
  id: number
  from_currency: string
  to_currency: string
  rate: number
  effective_from: string
  effective_to?: string
  is_active: boolean
  note?: string
  created_by: number
  created_at: string
}

export function ExchangeRatesPage() {
  const { activeRate, setActiveRate } = useAppStore()
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    rate: '',
    effective_from: new Date().toISOString().split('T')[0],
    note: ''
  })

  // Load exchange rates from database
  const loadRates = async () => {
    try {
      setLoading(true)
      const data = await window.api.invoke('exchange-rates:history')
      if (Array.isArray(data)) {
        setRates(data)
        const active = data.find(r => r.is_active)
        if (active) setActiveRate(active)
      }
    } catch (error) {
      console.error('Failed to load exchange rates:', error)
      toast.error('فشل تحميل أسعار الصرف')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRates()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.rate || !formData.effective_from) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    const rateValue = parseFloat(formData.rate)
    if (isNaN(rateValue) || rateValue <= 0) {
      toast.error('يرجى إدخال معدل صرف صحيح')
      return
    }

    try {
      await window.api.invoke('exchange-rates:create', {
        rate: rateValue,
        effective_from: formData.effective_from,
        note: formData.note,
        is_active: true // Auto activate
      })

      toast.success('تم حفظ معدل الصرف وتفعيله بنجاح')

      setShowAddForm(false)
      setFormData({
        rate: '',
        effective_from: new Date().toISOString().split('T')[0],
        note: ''
      })
      loadRates()
    } catch (error) {
      console.error('Failed to save rate:', error)
      toast.error('فشل حفظ معدل الصرف')
    }
  }

  const activateRate = async (rate: ExchangeRate) => {
    try {
      await window.api.invoke('exchange-rates:activate', rate.id)
      toast.success('تم تفعيل معدل الصرف بنجاح')
      loadRates()
    } catch (error) {
      console.error('Failed to activate rate:', error)
      toast.error('فشل تفعيل معدل الصرف')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">إدارة أسعار الصرف</h1>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-gray-500">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">إدارة أسعار الصرف</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showAddForm ? 'إخفاء النموذج' : 'إضافة معدل جديد'}
        </Button>
      </div>

      {/* Current Active Rate */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">المعدل النشط حالياً</h2>
        {activeRate ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-600">معدل الصرف</p>
              <p className="text-2xl font-bold text-blue-900">{activeRate.rate}</p>
              <p className="text-xs text-blue-600">USD → TRY</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">تاريخ السريان</p>
              <p className="text-lg font-semibold text-blue-900">{activeRate.effective_from}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">ملاحظة</p>
              <p className="text-sm text-blue-800">{activeRate.note || 'لا توجد ملاحظات'}</p>
            </div>
          </div>
        ) : (
          <p className="text-blue-700">لم يتم تعيين معدل صرف نشط</p>
        )}
      </div>

      {/* Add New Rate Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">إضافة معدل صرف جديد</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  معدل الصرف (USD → TRY) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="36.50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ السريان *
                </label>
                <input
                  type="date"
                  value={formData.effective_from}
                  onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ملاحظة
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="ملاحظات إضافية..."
              />
            </div>

            <div className="flex items-center space-x-reverse space-x-3">
              <Button type="submit">
                <Check className="w-4 h-4 mr-2" />
                حفظ وتفعيل
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
