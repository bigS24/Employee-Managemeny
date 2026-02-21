export type Money = { TRY: number; USD: number }
export type Line = { category: string; label: string; currency: 'TRY'|'USD'; amount: number }

// Legacy types for Excel import compatibility
export interface PayrollInputs {
  base_salary_usd: number
  overtime_hours?: number
  bonus_usd?: number
  deductions_usd?: number
  admin_allowance_usd?: number
  education_allowance_usd?: number
  experience_allowance_usd?: number
  housing_allowance_usd?: number
  transportation_allowance_usd?: number
  other_allowances_usd?: number
  [key: string]: any // Allow additional properties
}

export interface PayrollOutputUSD {
  base_salary: number
  overtime_pay: number
  bonus: number
  gross_salary: number
  deductions: number
  net_salary: number
}

export interface PayrollOutputTRY {
  base_salary: number
  overtime_pay: number
  bonus: number
  gross_salary: number
  deductions: number
  net_salary: number
}

export function sumMoney(lines: Line[]): Money {
  return lines.reduce<Money>((acc, l) => {
    if (l.currency === 'TRY') acc.TRY += l.amount || 0
    else acc.USD += l.amount || 0
    return acc
  }, { TRY: 0, USD: 0 })
}

// Helper: pick subset by category or label
export function pick(lines: Line[], pred: (l: Line) => boolean): Line[] {
  return lines.filter(pred)
}

/**
 * Business rules:
 *   total_allowances = sum of:
 *      - base_min (TRY, from header)
 *      - admin_allowance (TRY)
 *      - edu_allowance (TRY)
 *      - experience_allowance (TRY) = exp_rate * years_of_exp
 *      - exceptional additions (TRY or USD)
 *      - dynamic allowances (TRY or USD)
 *
 *   indemnity_monthly = (salary / 12)
 *   gross = total_allowances + indemnity_monthly
 *   net = gross - total_deductions - indemnity_monthly
 *
 * NOTE: We will do the math **per currency**. If a component is TRY,
 * it affects TRY totals only; same for USD.
 */
export function computeTotals(
  header: { 
    base_min: number; 
    years_of_exp: number; 
    base_min_currency?: string;
    experience_allowance_amount?: number;
    experience_allowance_currency?: string;
  },
  lines: Line[],
  experienceRateTRY?: number // بدل خبرة (per year) in TRY. If you need USD too, pass two rates. (optional for backward compatibility)
) {
  // explicit mapped lines by label (these are optional)
  const baseMin: Line = { 
    category: 'allowance', 
    label: 'الحد الأدنى', 
    currency: (header.base_min_currency || 'TRY') as 'TRY' | 'USD', 
    amount: header.base_min || 0 
  }

  const adminAllowance = pick(lines, l => l.category === 'allowance' && l.label === 'بدل علاوة إدارية')
  const eduAllowance   = pick(lines, l => l.category === 'allowance' && l.label === 'بدل المؤهل العلمي')
  
  // Use new multi-currency experience allowance or fall back to legacy experienceRateTRY
  const expAmount = header.experience_allowance_amount 
    ? (header.experience_allowance_amount * (header.years_of_exp || 0))
    : ((experienceRateTRY || 0) * (header.years_of_exp || 0))
  const expCurrency = header.experience_allowance_currency || 'TRY'
  
  const expAllowance: Line = {
    category: 'allowance',
    label: 'بدل خبرة',
    currency: expCurrency as 'TRY' | 'USD',
    amount: expAmount
  }

  const exceptional    = pick(lines, l => l.category === 'exception')
  const dynAllowances  = pick(lines, l => l.category === 'allowance' && !['بدل علاوة إدارية','بدل المؤهل العلمي','بدل خبرة','الحد الأدنى'].includes(l.label))

  // breakdown & others (for reporting)
  const breakdown      = pick(lines, l => l.category === 'breakdown')          // من البنك TL, تأمين صحي TL, ضريبة TL (likely TRY)
  const cash           = pick(lines, l => l.category === 'cash')                // نقداً TL + USD
  const indemnity      = pick(lines, l => l.category === 'indemnity')          // بدل تعويض TL + USD
  const deductions     = pick(lines, l => l.category === 'deduction')          // السلفة, قرض, عقوبة, دفعات...

  const totalAllowances = sumMoney([
    baseMin,
    ...adminAllowance,
    ...eduAllowance,
    expAllowance,
    ...exceptional,
    ...dynAllowances
  ])

  // بدل تعويض نهاية الخدمة = (salary/12)
  // We'll derive monthly indemnity by splitting TRY & USD:
  // - For TRY: indemnTRY = totalAllowances.TRY / 12
  // - For USD: indemnUSD = totalAllowances.USD / 12
  const indemnMonthly: Money = {
    TRY: (totalAllowances.TRY || 0) / 12,
    USD: (totalAllowances.USD || 0) / 12,
  }

  // إجمالي الراتب = مجموع + تعويض نهاية الخدمة
  const gross: Money = {
    TRY: totalAllowances.TRY + indemnMonthly.TRY,
    USD: totalAllowances.USD + indemnMonthly.USD,
  }

  // إجمالي الخصومات = sum(deductions)
  const totalDeductions = sumMoney(deductions)

  // صافي = إجمالي - الخصومات - تعويض نهاية الخدمة
  const net: Money = {
    TRY: gross.TRY - totalDeductions.TRY - indemnMonthly.TRY,
    USD: gross.USD - totalDeductions.USD - indemnMonthly.USD,
  }

  return {
    totalAllowances,
    indemnMonthly,
    gross,
    totalDeductions,
    net,
    breakdown, 
    cash, 
    indemnity,
  }
}

// Legacy functions for Excel import compatibility
export function computePayrollUSD(inputs: PayrollInputs): PayrollOutputUSD {
  const base_salary = inputs.base_salary_usd || 0
  const overtime_pay = (inputs.overtime_hours || 0) * (base_salary / 160) * 1.5 // Assuming 160 hours/month, 1.5x overtime rate
  const bonus = inputs.bonus_usd || 0
  const gross_salary = base_salary + overtime_pay + bonus
  const deductions = inputs.deductions_usd || 0
  const net_salary = gross_salary - deductions

  return {
    base_salary,
    overtime_pay,
    bonus,
    gross_salary,
    deductions,
    net_salary
  }
}

export function withTRY(usdOutput: PayrollOutputUSD, exchangeRate: number): PayrollOutputTRY {
  return {
    base_salary: usdOutput.base_salary * exchangeRate,
    overtime_pay: usdOutput.overtime_pay * exchangeRate,
    bonus: usdOutput.bonus * exchangeRate,
    gross_salary: usdOutput.gross_salary * exchangeRate,
    deductions: usdOutput.deductions * exchangeRate,
    net_salary: usdOutput.net_salary * exchangeRate
  }
}