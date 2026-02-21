import { z } from 'zod'

/**
 * Helper for converting string inputs to numbers with fallback
 * Handles empty strings, commas, and invalid numbers gracefully
 */
export const toNum = (fallback = 0) => z.preprocess(
  (v) => {
    if (typeof v === 'number') return v
    const s = String(v ?? '').trim().replace(/,/g, '')
    const n = s === '' ? fallback : Number(s)
    return isNaN(n) ? fallback : n
  },
  z.number()
)

/**
 * Validates YYYY-MM format for month inputs
 */
export const yyyyMm = z.string().regex(/^\d{4}-\d{2}$/, 'يجب أن يكون التاريخ بصيغة YYYY-MM')

/**
 * Validates YYYY-MM-DD format for date inputs
 */
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'يجب أن يكون التاريخ بصيغة YYYY-MM-DD')

/**
 * Common employee status enum
 */
export const employeeStatus = z.enum(['نشط', 'غير_فعال', 'إجازة'])

/**
 * Common validation for employee numbers (digits only)
 */
export const employeeNumber = z.string().regex(/^[0-9]+$/, 'أرقام فقط')

/**
 * Email validation that allows empty strings
 */
export const optionalEmail = z.string().email('بريد إلكتروني غير صحيح').optional().or(z.literal(''))