import React from 'react';
import { useCurrency } from './CurrencyService';
import { Button } from './ui/button';

interface CurrencyToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CurrencyToggle({ className = '', size = 'md' }: CurrencyToggleProps) {
  const { displayCurrency, setDisplayCurrency } = useCurrency();

  const sizeClasses = {
    sm: 'h-8 text-xs px-3',
    md: 'h-10 text-sm px-4',
    lg: 'h-12 text-base px-6'
  };

  return (
    <div className={`inline-flex border border-gray-200 rounded-lg p-1 bg-gray-50 ${className}`}>
      <Button
        variant={displayCurrency === 'USD' ? 'default' : 'ghost'}
        size="sm"
        className={`${sizeClasses[size]} transition-all duration-200 ${
          displayCurrency === 'USD' 
            ? 'bg-primary text-primary-foreground shadow-sm' 
            : 'bg-transparent text-gray-600 hover:bg-gray-100'
        }`}
        onClick={() => setDisplayCurrency('USD')}
      >
        USD
      </Button>
      <Button
        variant={displayCurrency === 'TRY' ? 'default' : 'ghost'}
        size="sm"
        className={`${sizeClasses[size]} transition-all duration-200 ${
          displayCurrency === 'TRY' 
            ? 'bg-primary text-primary-foreground shadow-sm' 
            : 'bg-transparent text-gray-600 hover:bg-gray-100'
        }`}
        onClick={() => setDisplayCurrency('TRY')}
      >
        TRY
      </Button>
    </div>
  );
}