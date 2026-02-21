import { z } from 'zod'
import { toNum } from './common'

/**
 * Zod schema for payroll inputs validation
 * Uses the shared toNum helper for consistent number validation
 * Handles empty strings, commas, and invalid numbers gracefully
 */
export const payrollInputsSchema = z.object({
  base_salary_usd: z.preprocess(
    (v) => {
      if (typeof v === 'number') return v
      const s = String(v ?? '').trim().replace(/,/g, '')
      const n = s === '' ? 0.01 : Number(s)
      return isNaN(n) ? 0.01 : n
    },
    z.number().min(0.01, 'الراتب الأساسي مطلوب')
  ),
  admin_allowance_usd: z.preprocess(
    (v) => {
      if (typeof v === 'number') return v
      const s = String(v ?? '').trim().replace(/,/g, '')
      const n = s === '' ? 0 : Number(s)
      return isNaN(n) ? 0 : n
    },
    z.number().nonnegative()
  ),
  education_allowance_usd: z.preprocess(
    (v) => {
      if (typeof v === 'number') return v
      const s = String(v ?? '').trim().replace(/,/g, '')
      const n = s === '' ? 0 : Number(s)
      return isNaN(n) ? 0 : n
    },
    z.number().nonnegative()
  ),
  housing_allowance_usd: z.preprocess(
    (v) => {
      if (typeof v === 'number') return v
      const s = String(v ?? '').trim().replace(/,/g, '')
      const n = s === '' ? 0 : Number(s)
      return isNaN(n) ? 0 : n
    },
    z.number().nonnegative()
  ),
  transport_allowance_usd: z.preprocess(
    (v) => {
      if (typeof v === 'number') return v
      const s = String(v ?? '').trim().replace(/,/g, '')
      const n = s === '' ? 0 : Number(s)
      return isNaN(n) ? 0 : n
    },
    z.number().nonnegative()
  ),
  col_allowance_usd: z.preprocess(
    (v) => {
      if (typeof v === 'number') return v
      const s = String(v ?? '').trim().replace(/,/g, '')
      const n = s === '' ? 0 : Number(s)
      return isNaN(n) ? 0 : n
    },
    z.number().nonnegative()
  ),
  children_allowance_usd: z.preprocess(
    (v) => {
      if (typeof v === 'number') return v
      const s = String(v ?? '').trim().replace(/,/g, '')
      const n = s === '' ? 0 : Number(s)
      return isNaN(n) ? 0 : n
    },
    z.number().nonnegative()
  ),
  special_allowance_usd: z.preprocess(
    (v) => {
      if (typeof v === 'number') return v
      const s = String(v ?? '').trim().replace(/,/g, '')
      const n = s === '' ? 0 : Number(s)
      return isNaN(n) ? 0 : n
    },
    z.number().nonnegative()
  ),
  fuel_allowance_usd: z.preprocess(
    (v) => {
      if (typeof v === 'number') return v
      const s = String(v ?? '').trim().replace(/,/g, '')
      const n = s === '' ? 0 : Number(s)
      return isNaN(n) ? 0 : n
    },
    z.number().nonnegative()
  ),
  eos_accrual_usd: z.preprocess(
    (v) => {
      if (typeof v === 'number') return v
      const s = String(v ?? '').trim().replace(/,/g, '')
      const n = s === '' ? 0 : Number(s)
      return isNaN(n) ? 0 : n
    },
    z.number().nonnegative()
  ),
  exceptional_additions_usd: z.preprocess(
    (v) => {
      if (typeof v === 'number') return v
      const s = String(v ?? '').trim().replace(/,/g, '')
      const n = s === '' ? 0 : Number(s)
      return isNaN(n) ? 0 : n
    },
    z.number().nonnegative()
  ),
  overtime_hours: z.preprocess(
    (v) => {
      if (typeof v === 'number') return v
      const s = String(v ?? '').trim().replace(/,/g, '')
      const n = s === '' ? 0 : Number(s)
      return isNaN(n) ? 0 : n
    },
    z.number().nonnegative()
  ),
  deduction_loan_penalty_usd: z.preprocess(
    (v) => {
      if (typeof v === 'number') return v
      const s = String(v ?? '').trim().replace(/,/g, '')
      const n = s === '' ? 0 : Number(s)
      return isNaN(n) ? 0 : n
    },
    z.number().nonnegative()
  ),
  deduction_payment_usd: z.preprocess(
    (v) => {
      if (typeof v === 'number') return v
      const s = String(v ?? '').trim().replace(/,/g, '')
      const n = s === '' ? 0 : Number(s)
      return isNaN(n) ? 0 : n
    },
    z.number().nonnegative()
  ),
  deductions_other_usd: z.preprocess(
    (v) => {
      if (typeof v === 'number') return v
      const s = String(v ?? '').trim().replace(/,/g, '')
      const n = s === '' ? 0 : Number(s)
      return isNaN(n) ? 0 : n
    },
    z.number().nonnegative()
  ),
})

export type PayrollInputs = z.infer<typeof payrollInputsSchema>