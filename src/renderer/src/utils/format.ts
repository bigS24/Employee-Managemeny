import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

export function formatGregorian(input?: string | Date | null, pattern = 'yyyy/MM/dd') {
  if (!input) return '-';
  const d = new Date(input);
  if (isNaN(d.getTime())) return '-';
  return format(d, pattern, { locale: arSA });
}

export function formatISODate(date: string | Date | null | undefined) {
  if (!date) return '-'
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return '-'
    return d.toISOString().split('T')[0]
  } catch {
    return '-'
  }
}

