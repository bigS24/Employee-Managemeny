import React from 'react';
import { useCurrency, currencyService, formatUSD, formatTRY } from './CurrencyService';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface DualCurrencyDisplayProps {
  amountUSD: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  rateUsed?: number; // For historical records
  effectiveDate?: string; // For historical records
}

export function DualCurrencyDisplay({ 
  amountUSD, 
  className = '', 
  size = 'md',
  showTooltip = true,
  rateUsed,
  effectiveDate
}: DualCurrencyDisplayProps) {
  const { displayCurrency, activeRate } = useCurrency();

  // Use historical rate if provided, otherwise use current active rate
  const exchangeRate = rateUsed || activeRate?.rate || 36.50;
  const rateEffectiveDate = effectiveDate || activeRate?.effective_from || new Date().toISOString().split('T')[0];
  
  const amountTRY = currencyService.convertUsdToTry(amountUSD, exchangeRate);

  const sizeClasses = {
    sm: {
      primary: 'text-sm font-medium',
      secondary: 'text-xs',
      icon: 'w-3 h-3'
    },
    md: {
      primary: 'text-base font-semibold',
      secondary: 'text-sm',
      icon: 'w-4 h-4'
    },
    lg: {
      primary: 'text-lg font-semibold',
      secondary: 'text-base',
      icon: 'w-4 h-4'
    }
  };

  if (displayCurrency === 'USD') {
    return (
      <div className={`${className}`}>
        <div className={`${sizeClasses[size].primary} text-gray-900`}>
          {formatUSD(amountUSD)}
        </div>
      </div>
    );
  }

  // TRY display with USD secondary
  return (
    <div className={`${className}`}>
      <div className={`${sizeClasses[size].primary} text-gray-900 flex items-center gap-1`}>
        {formatTRY(amountTRY)}
        {showTooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className={`${sizeClasses[size].icon} text-gray-400 hover:text-gray-600 cursor-help`} />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-64">
                <div className="text-sm">
                  <div className="font-medium">سعر الصرف المستخدم: {exchangeRate.toFixed(2)}</div>
                  <div className="text-gray-600">
                    ساري من: {new Date(rateEffectiveDate).toLocaleDateString('ar-SA')}
                  </div>
                  {rateUsed && (
                    <div className="text-amber-600 text-xs mt-1">
                      معدل محفوظ تاريخياً
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className={`${sizeClasses[size].secondary} text-gray-500 mt-0.5`}>
        {formatUSD(amountUSD)} بسعر صرف {exchangeRate.toFixed(2)}
      </div>
    </div>
  );
}

// Component for inline dual display (both currencies shown)
export function InlineDualCurrencyDisplay({ 
  amountUSD, 
  className = '',
  size = 'md',
  showTooltip = true,
  rateUsed,
  effectiveDate
}: DualCurrencyDisplayProps) {
  const { activeRate } = useCurrency();
  
  const exchangeRate = rateUsed || activeRate?.rate || 36.50;
  const rateEffectiveDate = effectiveDate || activeRate?.effective_from || new Date().toISOString().split('T')[0];
  const amountTRY = currencyService.convertUsdToTry(amountUSD, exchangeRate);

  const sizeClasses = {
    sm: {
      primary: 'text-sm font-medium',
      secondary: 'text-xs',
      icon: 'w-3 h-3'
    },
    md: {
      primary: 'text-base font-semibold', 
      secondary: 'text-sm',
      icon: 'w-4 h-4'
    },
    lg: {
      primary: 'text-lg font-semibold',
      secondary: 'text-base',
      icon: 'w-4 h-4'
    }
  };

  return (
    <div className={`${className}`}>
      <div className={`${sizeClasses[size].primary} text-gray-900 flex items-center gap-1`}>
        {formatUSD(amountUSD)}
        {showTooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className={`${sizeClasses[size].icon} text-gray-400 hover:text-gray-600 cursor-help`} />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-64">
                <div className="text-sm">
                  <div className="font-medium">سعر الصرف المستخدم: {exchangeRate.toFixed(2)}</div>
                  <div className="text-gray-600">
                    ساري من: {new Date(rateEffectiveDate).toLocaleDateString('ar-SA')}
                  </div>
                  {rateUsed && (
                    <div className="text-amber-600 text-xs mt-1">
                      معدل محفوظ تاريخياً
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className={`${sizeClasses[size].secondary} text-gray-500 mt-0.5`}>
        {formatTRY(amountTRY)} (بسعر صرف {exchangeRate.toFixed(2)})
      </div>
    </div>
  );
}