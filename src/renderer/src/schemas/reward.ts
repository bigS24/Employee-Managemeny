import { z } from 'zod'

const toNum = () =>
  z.preprocess((v) => {
    const s = (v ?? '').toString().trim().replace(',', '.')
    return s === '' ? undefined : Number(s)
  }, z.number().optional())

export const rewardInputSchema = z.object({
  employee_id: z.preprocess((v) => Number(v), z.number().min(1, 'اختر الموظف')),
  title: z.string().min(2, 'اكتب عنواناً مناسباً'),
  description: z.string().optional(),
  kind: z.enum(['مكافأة', 'تقدير', 'إنجاز', 'ابتكار', 'خاص'], {
    errorMap: () => ({ message: 'اختر نوع المكافأة' })
  }),
  category: z.enum(['شهري', 'سنوي', 'ربع سنوي', 'خاص'], {
    errorMap: () => ({ message: 'اختر فئة المكافأة' })
  }),
  amount_usd: toNum(), // اختياري
  reward_date: z.string().min(4, 'اختر التاريخ'),
  status: z.enum(['مدفوع', 'في الانتظار', 'معتمد'], {
    errorMap: () => ({ message: 'اختر حالة المكافأة' })
  }),
})

export type RewardInput = z.infer<typeof rewardInputSchema>

// Legacy schema for compatibility
export const rewardSchema = rewardInputSchema