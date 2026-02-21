import React from 'react';
import { Info, Calendar } from 'lucide-react';
import { useCurrency } from './CurrencyService';

interface SalaryFooterInfoProps {
  rateUsed?: number;
  effectiveDate?: string;
  savedAt?: string;
  className?: string;
}

export function SalaryFooterInfo({ 
  rateUsed, 
  effectiveDate, 
  savedAt,
  className = '' 
}: SalaryFooterInfoProps) {
  const { activeRate } = useCurrency();
  
  const displayRate = rateUsed || activeRate?.rate || 36.50;
  const displayDate = effectiveDate || activeRate?.effective_from || new Date().toISOString().split('T')[0];
  const isHistorical = rateUsed && rateUsed !== activeRate?.rate;

  return (
    <div className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}>
      <Info className="w-4 h-4" />
      <span>
        تم الحفظ على سعر: {displayRate.toFixed(2)} TRY/USD 
        ({new Date(displayDate).toLocaleDateString('ar-SA')})
      </span>
      {isHistorical && (
        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">
          سعر تاريخي
        </span>
      )}
      {savedAt && (
        <span className="text-gray-500">
          • حُفظ: {new Date(savedAt).toLocaleDateString('ar-SA')}
        </span>
      )}
    </div>
  );
}