/**
 * LocalStorage utilities for payroll draft persistence
 */

export interface PayrollDraft {
  employeeId: number | null
  month: string
  inputs: {
    base_salary_usd: number
    admin_allowance_usd: number
    education_allowance_usd: number
    housing_allowance_usd: number
    transport_allowance_usd: number
    col_allowance_usd: number
    children_allowance_usd: number
    special_allowance_usd: number
    fuel_allowance_usd: number
    eos_accrual_usd: number
    exceptional_additions_usd: number
    overtime_hours: number
    deduction_loan_penalty_usd: number
    deduction_payment_usd: number
    deductions_other_usd: number
  }
  lastModified: number
}

const PAYROLL_DRAFT_KEY = 'payroll_draft'

export const payrollDraftStorage = {
  save: (draft: PayrollDraft): void => {
    try {
      const draftWithTimestamp = {
        ...draft,
        lastModified: Date.now()
      }
      localStorage.setItem(PAYROLL_DRAFT_KEY, JSON.stringify(draftWithTimestamp))
    } catch (error) {
      console.warn('Failed to save payroll draft to localStorage:', error)
    }
  },

  load: (): PayrollDraft | null => {
    try {
      const stored = localStorage.getItem(PAYROLL_DRAFT_KEY)
      if (!stored) return null
      
      const draft = JSON.parse(stored) as PayrollDraft
      
      // Check if draft is older than 24 hours
      const isExpired = Date.now() - draft.lastModified > 24 * 60 * 60 * 1000
      if (isExpired) {
        payrollDraftStorage.clear()
        return null
      }
      
      return draft
    } catch (error) {
      console.warn('Failed to load payroll draft from localStorage:', error)
      return null
    }
  },

  clear: (): void => {
    try {
      localStorage.removeItem(PAYROLL_DRAFT_KEY)
    } catch (error) {
      console.warn('Failed to clear payroll draft from localStorage:', error)
    }
  },

  exists: (): boolean => {
    return payrollDraftStorage.load() !== null
  }
}