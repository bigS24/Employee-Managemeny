import { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Plus, Clock, CheckCircle, XCircle, Edit, Eye, Trash2, Calendar } from 'lucide-react'
import { LeaveFormDrawer } from '../forms/LeaveFormDrawer'
import { toast } from 'sonner'
import Confirm from '../ui/Confirm'

interface Leave {
  id: number
  employee_id: number
  employee_name: string
  leave_type: 'سنوية' | 'مرضية' | 'طارئة' | 'بدون راتب' | 'أمومة' | 'أبوة' | 'أخرى'
  reason?: string
  from_date: string
  to_date: string
  days_count: number
  status: 'في الانتظار' | 'معتمد' | 'مرفوض'
  created_at: string
  updated_at: string
}

interface LeaveStats {
  totals: {
    total: number
    approved: number
    pending: number
    rejected: number
  }
  byType: Array<{ type: string; c: number }>
  recent: Array<{
    id: number
    employee_name: string
    leave_type: string
    status: string
    from_date: string
    to_date: string
    days_count: number
  }>
}

export function LeavePage() {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [stats, setStats] = useState<LeaveStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Modal states
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editRow, setEditRow] = useState<Leave | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewRow, setViewRow] = useState<Leave | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  async function refetch() {
    try {
      setLoading(true)
      const [leavesList, leavesStats] = await Promise.all([
        window.electronAPI.invoke('leaves:list'),
        window.electronAPI.invoke('leaves:stats')
      ])

      setLeaves(leavesList)
      setStats(leavesStats)
    } catch (error) {
      console.error('Failed to load leaves data:', error)
      toast.error('فشل في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refetch()
  }, [])

  const onAdd = () => {
    setEditRow(null)
    setDrawerOpen(true)
  }

  const onEdit = (leave: Leave) => {
    setEditRow(leave)
    setDrawerOpen(true)
  }

  const onView = (leave: Leave) => {
    setViewRow(leave)
    setViewOpen(true)
  }

  const onDelete = (leave: Leave) => {
    setConfirmDeleteId(leave.id)
  }

  const handleSave = () => {
    setDrawerOpen(false)
    setEditRow(null)
    refetch()
  }

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return

    try {
      await window.electronAPI.invoke('leaves:delete', confirmDeleteId)
      toast.success('تم حذف طلب الإجازة')
      setConfirmDeleteId(null)
      refetch()
    } catch (error) {
      console.error('Failed to delete leave:', error)
      toast.error('فشل في حذف طلب الإجازة')
    }
  }

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'سنوية': return 'bg-blue-100 text-blue-800'
      case 'مرضية': return 'bg-red-100 text-red-800'
      case 'طارئة': return 'bg-orange-100 text-orange-800'
      case 'أمومة': return 'bg-pink-100 text-pink-800'
      case 'أبوة': return 'bg-purple-100 text-purple-800'
      case 'بدون راتب': return 'bg-gray-100 text-gray-800'
      case 'أخرى': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'في الانتظار': return 'bg-yellow-100 text-yellow-800'
      case 'معتمد': return 'bg-green-100 text-green-800'
      case 'مرفوض': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'معتمد': return <CheckCircle className="w-4 h-4" />
      case 'مرفوض': return <XCircle className="w-4 h-4" />
      case 'في الانتظار': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">طلبات الإجازات</h1>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-gray-500">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">طلبات الإجازات</h1>
        <Button
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          طلب إجازة جديد +
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="mr-4">
              <h3 className="text-sm font-medium text-gray-500">إجمالي الطلبات</h3>
              <p className="text-2xl font-bold text-gray-900">{stats?.totals?.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="mr-4">
              <h3 className="text-sm font-medium text-gray-500">معتمد</h3>
              <p className="text-2xl font-bold text-green-600">{stats?.totals?.approved || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="mr-4">
              <h3 className="text-sm font-medium text-gray-500">في الانتظار</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats?.totals?.pending || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="mr-4">
              <h3 className="text-sm font-medium text-gray-500">مرفوض</h3>
              <p className="text-2xl font-bold text-red-600">{stats?.totals?.rejected || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">طلبات الإجازات</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الموظف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نوع الإجازة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  فترة الإجازة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  عدد الأيام
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  السبب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    لا توجد طلبات إجازات مسجلة
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {leave.employee_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        طلب في: {new Date(leave.created_at).toLocaleDateString('ar')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeColor(leave.leave_type)}`}>
                        {leave.leave_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>من: {leave.from_date ? new Date(leave.from_date).toLocaleDateString('ar') : '-'}</div>
                        <div>إلى: {leave.to_date ? new Date(leave.to_date).toLocaleDateString('ar') : '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-gray-900">{leave.days_count}</span>
                      <span className="text-sm text-gray-500 mr-1">يوم</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={leave.reason}>
                        {leave.reason || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                        <span className="mr-1">{getStatusIcon(leave.status)}</span>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          title="تعديل"
                          onClick={(e) => { e.stopPropagation(); onEdit(leave); }}
                          className="text-blue-600 hover:text-blue-800 text-lg"
                        >
                          ✏️
                        </button>
                        <button
                          title="عرض"
                          onClick={(e) => { e.stopPropagation(); onView(leave); }}
                          className="text-gray-600 hover:text-gray-800 text-lg"
                        >
                          👁️
                        </button>
                        <button
                          title="حذف"
                          onClick={(e) => { e.stopPropagation(); onDelete(leave); }}
                          className="text-red-600 hover:text-red-800 text-lg"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع الإجازات حسب النوع</h3>
          <div className="space-y-4">
            {stats?.byType?.map(({ type, c }) => {
              const percentage = stats.totals.total > 0 ? (c / stats.totals.total) * 100 : 0

              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeColor(type)}`}>
                      {type}
                    </span>
                    <span className="mr-2 text-sm text-gray-600">({c})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-left">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              )
            }) || (
                <p className="text-gray-500 text-center">لا توجد بيانات للعرض</p>
              )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">الطلبات الأخيرة</h3>
          <div className="space-y-3">
            {stats?.recent?.length ? (
              stats.recent.map(request => (
                <div key={request.id} className={`p-3 rounded-lg border-l-4 ${request.status === 'معتمد' ? 'bg-green-50 border-green-400' :
                  request.status === 'في الانتظار' ? 'bg-yellow-50 border-yellow-400' :
                    request.status === 'مرفوض' ? 'bg-red-50 border-red-400' :
                      'bg-gray-50 border-gray-400'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{request.employee_name}</p>
                      <p className="text-sm text-gray-600">{request.leave_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{request.days_count} أيام</p>
                      <p className="text-xs text-gray-500">
                        {new Date(request.from_date).toLocaleDateString('ar')} - {new Date(request.to_date).toLocaleDateString('ar')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">لا توجد طلبات حديثة</p>
            )}
          </div>
        </div>
      </div>

      {/* Leave Form Drawer */}
      <LeaveFormDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setEditRow(null)
        }}
        onSaved={handleSave}
        initial={editRow}
      />

      {/* View Leave Modal */}
      {viewOpen && viewRow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[90vw] max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">تفاصيل طلب الإجازة</h2>
              <button
                onClick={() => setViewOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4" dir="rtl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">الموظف</label>
                  <p className="mt-1 text-sm text-gray-900">{viewRow.employee_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">نوع الإجازة</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeColor(viewRow.leave_type)} mt-1`}>
                    {viewRow.leave_type}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">تاريخ البداية</label>
                  <p className="mt-1 text-sm text-gray-900">{viewRow.from_date ? new Date(viewRow.from_date).toLocaleDateString('ar') : '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">تاريخ النهاية</label>
                  <p className="mt-1 text-sm text-gray-900">{viewRow.to_date ? new Date(viewRow.to_date).toLocaleDateString('ar') : '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">عدد الأيام</label>
                  <p className="mt-1 text-sm text-gray-900 font-bold">{viewRow.days_count} يوم</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">الحالة</label>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewRow.status)} mt-1`}>
                    <span className="mr-1">{getStatusIcon(viewRow.status)}</span>
                    {viewRow.status}
                  </span>
                </div>
              </div>

              {viewRow.reason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">السبب</label>
                  <p className="mt-1 text-sm text-gray-900">{viewRow.reason}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t flex justify-end">
              <Button variant="outline" onClick={() => setViewOpen(false)}>
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Form Drawer */}
      <LeaveFormDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setEditRow(null)
        }}
        initial={editRow}
        onSaved={handleSave}
      />

      {/* Confirm Delete Modal */}
      <Confirm
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="حذف طلب الإجازة"
        message="هل أنت متأكد من حذف طلب الإجازة هذا؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
      />
    </div>
  )
}
