import { useState, useEffect } from 'react'
import { Plus, Star, Users, TrendingUp, Calendar } from 'lucide-react'
import { Button } from '../ui/Button'
import ActionsBar from '../table/ActionsBar'
import Modal from '../ui/Modal'
import CreateEntityModal from '../form/CreateEntityModal'
import { evaluationSchema } from '../../schemas/evaluation'
import { formatISODate } from '../../utils/format'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { OperationalPlansTab } from '../features/performance/OperationalPlansTab'
import { KPIsTab } from '../features/performance/KPIsTab'

interface Evaluation {
  id: number
  employee_id: number
  employee_name: string
  evaluator_id: number
  evaluator_name: string
  period: string
  overall_score: number
  rating: string
  goals_percent: number
  status: string
  evaluation_date: string
}

const getEvaluationFields = () => [
  {
    type: 'employee-search' as const,
    name: 'employee_id',
    label: 'الموظف الرقم الوظيفي والاسم',
    required: true,
    placeholder: 'ابحث عن الموظف...'
  },
  {
    type: 'employee-search' as const,
    name: 'evaluator_id',
    label: 'المقيم',
    required: true,
    placeholder: 'ابحث عن المقيم...'
  },
  { type: 'text' as const, name: 'period', label: 'الفترة', required: true, placeholder: '2025 - النصف الأول' },
  { type: 'date' as const, name: 'evaluation_date', label: 'تاريخ التقييم', required: true },
  { type: 'number' as const, name: 'overall_score', label: 'النتيجة (0-100)', required: true, placeholder: '85' },
  {
    type: 'select' as const,
    name: 'rating',
    label: 'التقييم',
    required: true,
    options: [
      { label: 'ممتاز', value: 'ممتاز' },
      { label: 'جيد', value: 'جيد' },
      { label: 'مقبول', value: 'مقبول' },
      { label: 'يحتاج تحسين', value: 'يحتاج تحسين' },
      { label: 'ضعيف', value: 'ضعيف' }
    ]
  },
  {
    type: 'select' as const,
    name: 'status',
    label: 'الحالة',
    required: true,
    options: [
      { label: 'قيد المراجعة', value: 'قيد المراجعة' },
      { label: 'معتمد', value: 'معتمد' },
      { label: 'مرفوض', value: 'مرفوض' }
    ]
  },
  { type: 'number' as const, name: 'goals_percent', label: 'نسبة تحقيق الأهداف (%)', placeholder: '90' },
  { type: 'textarea' as const, name: 'notes', label: 'ملاحظات', placeholder: 'اذكر الملاحظات والتوصيات...', rows: 3 },
]

export function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRow, setEditingRow] = useState<Evaluation | null>(null)
  const [viewRow, setViewRow] = useState<Evaluation | null>(null)

  const [stats, setStats] = useState<{ totals: any, dist: any[] }>({
    totals: { total: 0, avg_score: 0, approved_count: 0, excellent_count: 0 },
    dist: []
  })

  const refetch = async () => {
    setLoading(true)
    try {
      const [list, s] = await Promise.all([
        window.electronAPI.invoke('evaluations:list'),
        window.electronAPI.invoke('evaluations:stats')
      ])
      setEvaluations(list)
      setStats(s)
    } catch (error) {
      console.error('Failed to load evaluations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refetch()
    const sub = window.events?.on('evaluations:refresh', refetch)
    return () => { if (sub) sub() }
  }, [])

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'ممتاز': return 'bg-green-100 text-green-800'
      case 'جيد': return 'bg-blue-100 text-blue-800'
      case 'مقبول': return 'bg-yellow-100 text-yellow-800'
      case 'يحتاج تحسين': return 'bg-orange-100 text-orange-800'
      case 'ضعيف': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'قيد المراجعة': return 'bg-yellow-100 text-yellow-800'
      case 'معتمد': return 'bg-green-100 text-green-800'
      case 'مرفوض': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">تقييمات الأداء</h1>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-gray-500 text-right">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">تقييمات الأداء</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          إضافة تقييم جديد
        </Button>
      </div>

      <Tabs defaultValue="evaluations" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px] mb-6">
          <TabsTrigger value="evaluations">تقييمات الأداء</TabsTrigger>
          <TabsTrigger value="kpis">مؤشرات الأداء التنفيذي</TabsTrigger>
          <TabsTrigger value="operational">الخطة التشغيلية</TabsTrigger>
        </TabsList>

        <TabsContent value="evaluations" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" dir="rtl">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="mr-4 text-right">
                  <h3 className="text-sm font-medium text-gray-500">إجمالي التقييمات</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.totals.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div className="mr-4 text-right">
                  <h3 className="text-sm font-medium text-gray-500">متوسط الدرجات</h3>
                  <p className="text-2xl font-bold text-green-600">{Math.round(stats.totals.avg_score || 0)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-purple-600" />
                <div className="mr-4 text-right">
                  <h3 className="text-sm font-medium text-gray-500">التقييمات المعتمدة</h3>
                  <p className="text-2xl font-bold text-purple-600">{stats.totals.approved_count}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Star className="w-8 h-8 text-yellow-600" />
                <div className="mr-4 text-right">
                  <h3 className="text-sm font-medium text-gray-500">التقييمات الممتازة</h3>
                  <p className="text-2xl font-bold text-yellow-600">{stats.totals.excellent_count}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 text-right">سجل التقييمات</h3>
            </div>

            <div className="overflow-x-auto" dir="rtl">
              <table className="w-full text-right hover">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">الموظف</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">المقيم</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">الفترة</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">النتيجة</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">التقييم</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {evaluations.map((ev) => (
                    <tr key={ev.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ev.employee_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ev.evaluator_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ev.period}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold">{ev.overall_score}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRatingColor(ev.rating)}`}>
                          {ev.rating}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ev.status)}`}>
                          {ev.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <ActionsBar
                          onEdit={() => {
                            setEditingRow(ev)
                            setShowCreateModal(true)
                          }}
                          onView={() => setViewRow(ev)}
                          onDelete={async () => {
                            if (window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
                              try {
                                await window.electronAPI.invoke('evaluations:delete', ev.id)
                                window.toast?.success?.('تم الحذف بنجاح')
                                refetch()
                              } catch (e) {
                                window.toast?.error?.('فشل الحذف')
                              }
                            }
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="kpis">
          <KPIsTab />
        </TabsContent>

        <TabsContent value="operational">
          <OperationalPlansTab />
        </TabsContent>
      </Tabs>

      <CreateEntityModal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setEditingRow(null)
        }}
        title={editingRow ? "تعديل تقييم" : "إضافة تقييم جديد"}
        entity="evaluations"
        schema={evaluationSchema}
        fields={getEvaluationFields()}
        defaults={editingRow || {}}
        recordId={editingRow?.id}
        onSuccess={refetch}
      />

      {viewRow && (
        <Modal open={!!viewRow} onClose={() => setViewRow(null)} className="max-w-2xl">
          <div className="p-6 text-right" dir="rtl">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">تفاصيل التقييم</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">الموظف</label>
                <p className="font-bold">{viewRow.employee_name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">المقيم</label>
                <p className="font-bold">{viewRow.evaluator_name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">الفترة</label>
                <p>{viewRow.period}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">تاريخ التقييم</label>
                <p>{formatISODate(viewRow.evaluation_date)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">النتيجة</label>
                <p className="text-xl font-bold text-blue-600">{viewRow.overall_score}%</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">التقييم</label>
                <p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRatingColor(viewRow.rating)}`}>
                    {viewRow.rating}
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setViewRow(null)}>إغلاق</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
