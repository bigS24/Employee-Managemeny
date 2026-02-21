import { z } from 'zod';

export const leaveInputSchema = z.object({
  employee_id: z.preprocess(v => Number(v), z.number().int().min(1, 'اختر الموظف')),
  leave_type: z.enum(['سنوية','مرضية','طارئة','بدون راتب','أمومة','أبوة','أخرى'], {
    errorMap: () => ({ message: 'نوع الإجازة غير صحيح' })
  }),
  reason: z.string().optional().nullable(),
  start_date: z.string().min(8, 'تاريخ البداية مطلوب (YYYY-MM-DD)'),
  end_date: z.string().min(8, 'تاريخ النهاية مطلوب (YYYY-MM-DD)'),
  days_count: z.preprocess(v => Number(v), z.number().int().min(1, 'عدد الأيام غير صحيح')),
  status: z.enum(['في الانتظار','معتمد','مرفوض'], {
    errorMap: () => ({ message: 'حالة الإجازة غير صحيحة' })
  }),
}).refine(v => {
  // basic YYYY-MM-DD and end >= start
  const s = new Date(v.start_date);
  const e = new Date(v.end_date);
  return !isNaN(+s) && !isNaN(+e) && e.getTime() >= s.getTime();
}, { path: ['end_date'], message: 'تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية' });