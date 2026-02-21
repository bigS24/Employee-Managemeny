import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Calculator, RefreshCw } from 'lucide-react'
import { Button } from '../ui/Button'
import MoneyInput, { type Currency } from '../ui/MoneyInput'
import { EmployeeSearchSelect } from '../forms/EmployeeSearchSelect'
import { type PayrollLine, type PayrollHeader } from '../../schemas/payroll'
import { computeTotalsByCurrency } from '../../utils/payroll'
import { SalaryModel } from '../../types/salary'
import { EmployeeLite } from '../../types/employee'
import { toast } from 'react-hot-toast'


interface PayrollBuilderProps {
  employeeId?: number
  period: string
  initial?: { header: PayrollHeader; lines: PayrollLine[] }
  onSaved: (saved?: { period: string }) => void
  onClose?: () => void
}

export default function PayrollBuilder({
  employeeId,
  period,
  initial,
  onSaved,
  onClose
}: PayrollBuilderProps) {
  const [saving, setSaving] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeLite | null>(null)

  const [header, setHeader] = useState<PayrollHeader>({
    employee_id: employeeId || 0,
    period,
    id_number: initial?.header?.id_number ?? '',
    start_date: initial?.header?.start_date ?? '',
    admin_level: initial?.header?.admin_level ?? '',
    job_title: initial?.header?.job_title ?? '',
    edu_actual: initial?.header?.edu_actual ?? '',
    edu_required: initial?.header?.edu_required ?? '',
    base_min: initial?.header?.base_min ?? 0,
    years_of_exp: initial?.header?.years_of_exp ?? 0,
    max_experience_years: initial?.header?.max_experience_years ?? 0,
    notes: initial?.header?.notes ?? '',
  })

  // Multi-currency salary model
  const [salaryModel, setSalaryModel] = useState<SalaryModel>({
    employeeId: employeeId || 0,
    period,
    minBaseAmount: initial?.header?.base_min ?? 0,
    minBaseCurrency: ((initial?.header as any)?.base_min_currency || 'TRY') as Currency,
    experienceAllowanceAmount: (initial?.header as any)?.experience_allowance_amount ?? 0,
    experienceAllowanceCurrency: ((initial?.header as any)?.experience_allowance_currency || 'TRY') as Currency,
    yearsOfExperience: initial?.header?.years_of_exp ?? 0,
    allowances: [],
    deductions: []
  })

  const [lines, setLines] = useState<PayrollLine[]>(initial?.lines ?? [
    { category: 'allowance', label: 'بدل علاوة إدارية', currency: 'TRY', amount: 0 },
    { category: 'allowance', label: 'بدل المؤهل العلمي', currency: 'TRY', amount: 0 },
    { category: 'cash', label: 'نقداً', currency: 'TRY', amount: 0 },
    { category: 'cash', label: 'نقداً', currency: 'USD', amount: 0 },
    { category: 'indemnity', label: 'بدل تعويض', currency: 'TRY', amount: 0 },
    { category: 'indemnity', label: 'بدل تعويض', currency: 'USD', amount: 0 },
  ])

  useEffect(() => {
    const loadEmployee = async () => {
      if (!employeeId) return

      try {
        // @ts-ignore
        const emp = await window.electronAPI.getRecord('employees', employeeId)
        if (emp) {
          setSelectedEmployee({
            id: emp.id,
            full_name: emp.full_name,
            employee_no: emp.employee_no,
            job_title: emp.job_title,
            department: emp.department
          })

          // Populate header fields from employee record if not already set
          setHeader(h => ({
            ...h,
            job_title: emp.job_title || h.job_title,
            admin_level: emp.grade || h.admin_level,
            start_date: emp.hire_date || h.start_date,
            edu_actual: emp.education_degree || h.edu_actual,
            id_number: emp.employee_no || h.id_number
          }))
        }
      } catch (err) {
        console.error('Failed to load employee:', err)
      }
    }
    loadEmployee()
  }, [employeeId])

  // Update salary model when lines change
  useEffect(() => {
    const allowances = lines.filter(l => l.category === 'allowance' || l.category === 'exception')
    const deductions = lines.filter(l => l.category === 'deduction')

    setSalaryModel(prev => ({
      ...prev,
      allowances: allowances.map(l => ({
        category: l.category,
        label: l.label,
        currency: l.currency as Currency,
        amount: Number(l.amount || 0)
      })),
      deductions: deductions.map(l => ({
        category: l.category,
        label: l.label,
        currency: l.currency as Currency,
        amount: Number(l.amount || 0)
      }))
    }))
  }, [lines])

  // Calculate totals using the new multi-currency system
  const totals = computeTotalsByCurrency(salaryModel)

  const addDynamicAllowance = () => {
    setLines(ls => [...ls, { category: 'allowance', label: 'بدل إضافي', currency: 'TRY', amount: 0 }])
  }

  const addException = () => {
    setLines(ls => [...ls, { category: 'exception', label: 'إضافات استثنائية', currency: 'TRY', amount: 0 }])
  }

  const addDeduction = (label: string = 'حسم') => {
    setLines(ls => [...ls, { category: 'deduction', label, currency: 'TRY', amount: 0 }])
  }

  const removeLine = (index: number) => {
    setLines(ls => ls.filter((_, i) => i !== index))
  }

  const restoreDefaultLines = () => {
    const defaults = [
      { category: 'cash', label: 'نقداً', currency: 'TRY' },
      { category: 'cash', label: 'نقداً', currency: 'USD' },
      { category: 'indemnity', label: 'بدل تعويض', currency: 'TRY' },
      { category: 'indemnity', label: 'بدل تعويض', currency: 'USD' },
    ]

    let addedCount = 0
    setLines(prev => {
      const next = [...prev]
      defaults.forEach(def => {
        const exists = next.some(l =>
          l.category === def.category &&
          l.label === def.label &&
          l.currency === def.currency
        )
        if (!exists) {
          next.push({ ...def, amount: 0 } as PayrollLine)
          addedCount++
        }
      })
      return next
    })

    if (addedCount > 0) {
      toast.success('تم استعادة البنود الافتراضية')
    } else {
      toast('جميع البنود الافتراضية موجودة بالفعل')
    }
  }

  const updateLine = (index: number, field: keyof PayrollLine, value: any) => {
    setLines(ls => ls.map((line, i) =>
      i === index ? { ...line, [field]: value } : line
    ))
  }

  const updateHeader = (field: keyof PayrollHeader, value: any) => {
    setHeader(h => ({ ...h, [field]: value }))
  }

  const handleEmployeeSelect = async (employee: EmployeeLite | null) => {
    setSelectedEmployee(employee)
    if (employee) {
      setHeader(h => ({ ...h, employee_id: employee.id }))
      setSalaryModel(s => ({ ...s, employeeId: employee.id }))

      // Fetch full employee details to populate header
      try {
        // @ts-ignore
        const emp = await window.electronAPI.getRecord('employees', employee.id)
        if (emp) {
          setHeader(h => ({
            ...h,
            job_title: emp.job_title || '',
            admin_level: emp.grade || '',
            start_date: emp.hire_date || '',
            edu_actual: emp.education_degree || '',
            id_number: emp.employee_no || ''
          }))
        }

        // Load most recent payroll data for this employee to pre-populate salary fields
        try {
          const payrollsResult = await window.electronAPI.payrollListByEmployee(employee.id)
          console.log('[PayrollBuilder] Previous payrolls for employee:', payrollsResult)

          if (payrollsResult && payrollsResult.length > 0) {
            // Get the most recent payroll (they should be sorted by period desc)
            const mostRecent = payrollsResult[0]

            if (mostRecent?.header) {
              const prevHeader = mostRecent.header
              const prevLines = mostRecent.lines || []

              // Pre-populate salary fields from previous payroll
              setHeader(h => ({
                ...h,
                base_min: prevHeader.base_min || h.base_min,
                years_of_exp: prevHeader.years_of_exp || h.years_of_exp,
                edu_required: prevHeader.edu_required || h.edu_required,
                notes: '' // Clear notes for new period
              }))

              // Pre-populate salary model with previous currency and amounts
              setSalaryModel(s => ({
                ...s,
                minBaseAmount: prevHeader.base_min || s.minBaseAmount,
                minBaseCurrency: ((prevHeader as any).base_min_currency || 'TRY') as Currency,
                experienceAllowanceAmount: (prevHeader as any).experience_allowance_amount || s.experienceAllowanceAmount,
                experienceAllowanceCurrency: ((prevHeader as any).experience_allowance_currency || 'TRY') as Currency,
                yearsOfExperience: prevHeader.years_of_exp || s.yearsOfExperience
              }))

              // Pre-populate lines from previous payroll (excluding cash and indemnity which should start fresh)
              const previousAllowances = prevLines.filter(l =>
                l.category === 'allowance' || l.category === 'exception'
              )

              if (previousAllowances.length > 0) {
                // Keep the default structure but update amounts from previous payroll
                setLines(currentLines => {
                  const updatedLines = [...currentLines]

                  // Match previous allowances by label and update amounts
                  previousAllowances.forEach(prevLine => {
                    const existingIndex = updatedLines.findIndex(
                      l => l.label === prevLine.label && l.category === prevLine.category
                    )

                    if (existingIndex >= 0) {
                      // Update existing line
                      updatedLines[existingIndex] = {
                        ...updatedLines[existingIndex],
                        amount: prevLine.amount,
                        currency: prevLine.currency
                      }
                    } else {
                      // Add new line if it doesn't exist
                      updatedLines.push({
                        category: prevLine.category,
                        label: prevLine.label,
                        currency: prevLine.currency,
                        amount: prevLine.amount
                      })
                    }
                  })

                  return updatedLines
                })
              }

              toast.success(`تم تحميل بيانات الراتب السابقة للموظف ${employee.full_name}`)
            }
          } else {
            console.log('[PayrollBuilder] No previous payroll found for employee')
            toast(`لا توجد بيانات راتب سابقة للموظف ${employee.full_name}`)
          }
        } catch (payrollErr) {
          console.error('Failed to load previous payroll data:', payrollErr)
          // Don't show error toast - it's okay if there's no previous payroll
        }
      } catch (err) {
        console.error('Failed to fetch full employee details:', err)
      }
    } else {
      setHeader(h => ({
        ...h,
        employee_id: 0,
        job_title: '',
        admin_level: '',
        start_date: '',
        edu_actual: '',
        id_number: ''
      }))
      setSalaryModel(s => ({ ...s, employeeId: 0 }))
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Validate that an employee is selected
      if (!selectedEmployee || !selectedEmployee.id) {
        toast.error('يرجى اختيار موظف أولاً')
        return
      }

      // Ensure header has correct employee_id
      const updatedHeader = {
        ...header,
        employee_id: selectedEmployee.id
      }

      // Prepare payload with multi-currency support
      const payload = {
        header: updatedHeader,
        lines,
        salaryModel: {
          ...salaryModel,
          employeeId: selectedEmployee.id
        },
        experienceRateTRY: salaryModel.experienceAllowanceAmount // For backward compatibility
      }

      console.log('[PAYROLL/SAVE] payload ->', payload)
      const result = await window.electronAPI.payrollSave(payload)

      console.log('[PAYROLL/SAVE] result ->', result)
      toast.success('تم حفظ بيانات الراتب بنجاح')

      // Tell the parent to reload list (and ensure same normalized period)
      onSaved({ period: result.period || period })
      if (onClose) onClose()
    } catch (err: any) {
      console.error('[PAYROLL/SAVE] error ->', err)
      const msg = err?.message || err?.toString?.() || 'حدث خطأ أثناء حفظ بيانات الراتب'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const formatMoney = (amount: number) => amount.toFixed(2)

  const getCategoryLabel = (category: string) => {
    const labels = {
      allowance: 'البدلات',
      exception: 'الإضافات الاستثنائية',
      cash: 'النقدي',
      indemnity: 'بدل التعويض',
      deduction: 'الحسومات'
    }
    return labels[category as keyof typeof labels] || category
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      allowance: 'bg-green-50 border-green-200',
      exception: 'bg-blue-50 border-blue-200',
      cash: 'bg-purple-50 border-purple-200',
      indemnity: 'bg-orange-50 border-orange-200',
      deduction: 'bg-red-50 border-red-200'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-50 border-gray-200'
  }

  return (
    <div dir="rtl" className="space-y-6 max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">بناء الراتب</h2>
            <p className="text-gray-600">{selectedEmployee?.full_name || 'لم يتم اختيار موظف'} - {period}</p>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose}>إغلاق</Button>
          )}
        </div>

        {/* Employee Selection */}
        <div className="mb-6">
          <EmployeeSearchSelect
            selectedId={selectedEmployee?.id}
            onSelect={(emp) => handleEmployeeSelect(emp as any)}
            placeholder="ابحث عن الموظف بالاسم أو الرقم"
            className="max-w-md"
          />
        </div>

        {/* Header Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">المسمى الوظيفي</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              value={header.job_title || ''}
              onChange={e => updateHeader('job_title', e.target.value)}
            />
          </div>

          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">المستوى الإداري</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              value={header.admin_level || ''}
              onChange={e => updateHeader('admin_level', e.target.value)}
            />
          </div>

          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ بداية العمل</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              value={header.start_date || ''}
              onChange={e => updateHeader('start_date', e.target.value)}
            />
          </div>

          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">المؤهل العلمي</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={header.edu_actual || ''}
              onChange={e => updateHeader('edu_actual', e.target.value)}
            />
          </div>

          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">المؤهل العلمي المطلوب</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={header.edu_required || ''}
              onChange={e => updateHeader('edu_required', e.target.value)}
            />
          </div>

          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأدنى</label>
            <MoneyInput
              value={salaryModel.minBaseAmount}
              currency={salaryModel.minBaseCurrency}
              onChange={({ value, currency }) => {
                setSalaryModel(s => ({ ...s, minBaseAmount: value, minBaseCurrency: currency }))
                updateHeader('base_min', value)
              }}
              step={0.01}
              data-testid="base-min"
              className="w-full"
            />
          </div>

          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">سنوات الخبرة</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${header.max_experience_years && header.years_of_exp > header.max_experience_years
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
                  }`}
                value={salaryModel.yearsOfExperience}
                onChange={e => {
                  const years = Number(e.target.value)
                  setSalaryModel(s => ({ ...s, yearsOfExperience: years }))
                  updateHeader('years_of_exp', years)
                  if (header.max_experience_years && years > header.max_experience_years) {
                    toast.error(`تنبيه: سنوات الخبرة تتجاوز الحد الأقصى (${header.max_experience_years})`)
                  }
                }}
              />
            </div>
          </div>

          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1" title="الحد الأقصى لسنوات الخبرة المعتمدة في حساب بدل الخبرة">
              الحد الأقصى للخبرة <span className="text-gray-500 text-xs">(اختياري)</span>
            </label>
            <input
              type="number"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={header.max_experience_years || ''}
              onChange={e => updateHeader('max_experience_years', Number(e.target.value))}
              placeholder="مثال: 20"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 الحد الأقصى لسنوات الخبرة المحتسبة في البدل
            </p>
          </div>

          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">بدل خبرة (سنة)</label>
            <MoneyInput
              value={salaryModel.experienceAllowanceAmount}
              currency={salaryModel.experienceAllowanceCurrency}
              onChange={({ value, currency }) => {
                setSalaryModel(s => ({ ...s, experienceAllowanceAmount: value, experienceAllowanceCurrency: currency }))
              }}
              step={0.01}
              data-testid="experience-allowance"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              السنوات: {salaryModel.yearsOfExperience} ⇒ بدل الخبرة = {(salaryModel.experienceAllowanceAmount * salaryModel.yearsOfExperience).toFixed(2)} {salaryModel.experienceAllowanceCurrency}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={header.notes || ''}
            onChange={e => updateHeader('notes', e.target.value)}
          />
        </div>
      </div>

      {/* Lines */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
          <h3 className="text-lg font-semibold text-gray-900">بنود الراتب</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={addDynamicAllowance}>
              <Plus className="w-4 h-4 ml-1" />
              إضافة بدل
            </Button>
            <Button variant="outline" size="sm" onClick={addException}>
              <Plus className="w-4 h-4 ml-1" />
              إضافة استثنائية
            </Button>
            <div className="h-6 w-px bg-gray-300 mx-1"></div>
            <Button variant="outline" size="sm" onClick={() => addDeduction('سلفة')} className="text-red-600 border-red-200 hover:bg-red-50">
              <Plus className="w-4 h-4 ml-1" />
              سلفة
            </Button>
            <Button variant="outline" size="sm" onClick={() => addDeduction('قرض')} className="text-red-600 border-red-200 hover:bg-red-50">
              <Plus className="w-4 h-4 ml-1" />
              قرض
            </Button>
            <Button variant="outline" size="sm" onClick={() => addDeduction('عقوبة')} className="text-red-600 border-red-200 hover:bg-red-50">
              <Plus className="w-4 h-4 ml-1" />
              عقوبة
            </Button>
            <Button variant="outline" size="sm" onClick={() => addDeduction('حسم')} className="text-red-600 border-red-200 hover:bg-red-50">
              <Plus className="w-4 h-4 ml-1" />
              حسم
            </Button>
            <div className="h-6 w-px bg-gray-300 mx-1"></div>
            <Button variant="outline" size="sm" onClick={restoreDefaultLines} title="استعادة البنود الافتراضية (النقد والتعويض بالعملتين TRY و USD) إذا تم حذفها" className="hover:bg-blue-50">
              <RefreshCw className="w-4 h-4 ml-1" />
              استعادة الافتراضي
            </Button>
          </div>
        </div>

        {/* Group lines by category */}
        {['allowance', 'exception', 'cash', 'indemnity', 'deduction'].map(category => {
          const categoryLines = lines.map((line, index) => ({ line, index })).filter(({ line }) => line.category === category)
          if (categoryLines.length === 0) return null

          return (
            <div key={category} className={`mb-6 p-4 rounded-lg border-2 ${getCategoryColor(category)}`}>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-800">{getCategoryLabel(category)}</h4>
                {category === 'deduction' && (
                  <div className="text-sm font-bold text-red-600 bg-white px-3 py-1 rounded border border-red-200 shadow-sm">
                    رصيد الحسومات: {formatMoney(totals.TRY.deductions)} TRY
                    {totals.USD.deductions > 0 && ` + ${formatMoney(totals.USD.deductions)} USD`}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {categoryLines.map(({ line, index }) => (
                  <div key={index} className="flex items-center gap-3 bg-white p-3 rounded border">
                    <input
                      type="text"
                      placeholder="اسم البند"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={line.label}
                      onChange={e => updateLine(index, 'label', e.target.value)}
                    />

                    <MoneyInput
                      value={line.amount}
                      currency={line.currency as Currency}
                      onChange={({ value, currency }) => {
                        // Batch update to avoid partial states
                        setLines(ls => ls.map((l, i) =>
                          i === index ? { ...l, amount: value, currency } : l
                        ))
                      }}
                      className="w-48"
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeLine(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <Calculator className="w-5 h-5 text-green-600 ml-2" />
            <h4 className="font-bold text-lg text-green-800">TRY</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>مجموع الراتب:</span>
              <span className="font-medium">{formatMoney(totals.TRY.totalAllowances)}</span>
            </div>
            {totals.TRY.eosMonthly > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>+ بدل نهاية الخدمة/شهري:</span>
                <span>{formatMoney(totals.TRY.eosMonthly)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-100 pt-1">
              <span>إجمالي الاستحقاقات:</span>
              <span className="font-medium">{formatMoney(totals.TRY.gross)}</span>
            </div>
            <div className="flex justify-between text-red-600 bg-red-50 p-2 rounded">
              <span>الحسومات:</span>
              <span className="font-medium">-{formatMoney(totals.TRY.deductions)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold text-lg">
              <span>صافي الراتب:</span>
              <span className="text-green-600">{formatMoney(totals.TRY.net)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <Calculator className="w-5 h-5 text-blue-600 ml-2" />
            <h4 className="font-bold text-lg text-blue-800">USD</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>مجموع الراتب:</span>
              <span className="font-medium">{formatMoney(totals.USD.totalAllowances)}</span>
            </div>
            {totals.USD.eosMonthly > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>+ بدل نهاية الخدمة/شهري:</span>
                <span>{formatMoney(totals.USD.eosMonthly)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-100 pt-1">
              <span>إجمالي الاستحقاقات:</span>
              <span className="font-medium">{formatMoney(totals.USD.gross)}</span>
            </div>
            <div className="flex justify-between text-red-600 bg-red-50 p-2 rounded">
              <span>الحسومات:</span>
              <span className="font-medium">-{formatMoney(totals.USD.deductions)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold text-lg">
              <span>صافي الراتب:</span>
              <span className="text-blue-600">{formatMoney(totals.USD.net)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onClose && (
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'جاري الحفظ...' : 'حفظ'}
        </Button>
      </div>
    </div>
  )
}
