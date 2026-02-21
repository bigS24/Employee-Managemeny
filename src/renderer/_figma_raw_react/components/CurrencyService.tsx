import React, { createContext, useContext, useState, useEffect } from 'react';

// Currency types and interfaces
export interface ExchangeRate {
  id: number;
  base_currency: string;
  target_currency: string;
  rate: number;
  effective_from: string;
  is_active: boolean;
  note?: string;
  created_at: string;
  created_by?: string;
}

export interface CurrencyFormatOptions {
  currency: 'USD' | 'TRY';
  locale?: string;
  showSymbol?: boolean;
}

// Mock data for offline exchange rates
const mockExchangeRates: ExchangeRate[] = [
  {
    id: 1,
    base_currency: 'USD',
    target_currency: 'TRY',
    rate: 36.50,
    effective_from: '2024-09-24',
    is_active: true,
    note: 'Rate updated based on market conditions',
    created_at: '2024-09-24T10:00:00Z',
    created_by: 'Admin'
  },
  {
    id: 2,
    base_currency: 'USD', 
    target_currency: 'TRY',
    rate: 35.80,
    effective_from: '2024-09-15',
    is_active: false,
    note: 'Previous rate',
    created_at: '2024-09-15T10:00:00Z',
    created_by: 'Admin'
  }
];

// Currency service class
class CurrencyServiceClass {
  private rates: ExchangeRate[] = [...mockExchangeRates];

  // Get active exchange rate
  getActiveRate(): ExchangeRate | null {
    return this.rates.find(rate => rate.is_active) || null;
  }

  // Get all rates for history
  getAllRates(): ExchangeRate[] {
    return this.rates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Set new active rate
  setActiveRate(rate: number, effectiveFrom: string, note?: string): void {
    // Deactivate current active rate
    this.rates = this.rates.map(r => ({ ...r, is_active: false }));
    
    // Add new active rate
    const newRate: ExchangeRate = {
      id: Date.now(),
      base_currency: 'USD',
      target_currency: 'TRY',
      rate,
      effective_from: effectiveFrom,
      is_active: true,
      note,
      created_at: new Date().toISOString(),
      created_by: 'Current User'
    };
    
    this.rates.unshift(newRate);
  }

  // Convert USD to TRY
  convertUsdToTry(amountUsd: number, rateOverride?: number): number {
    const rate = rateOverride || this.getActiveRate()?.rate || 36.50;
    return amountUsd * rate;
  }

  // Convert TRY to USD
  convertTryToUsd(amountTry: number, rateOverride?: number): number {
    const rate = rateOverride || this.getActiveRate()?.rate || 36.50;
    return amountTry / rate;
  }

  // Format currency amounts
  formatCurrency(amount: number, options: CurrencyFormatOptions): string {
    const { currency, locale = 'en-US', showSymbol = true } = options;
    
    if (currency === 'USD') {
      return new Intl.NumberFormat(locale, {
        style: showSymbol ? 'currency' : 'decimal',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } else if (currency === 'TRY') {
      return new Intl.NumberFormat('tr-TR', {
        style: showSymbol ? 'currency' : 'decimal',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    }
    
    return amount.toFixed(2);
  }

  // Archive a rate
  archiveRate(rateId: number): void {
    this.rates = this.rates.map(r => 
      r.id === rateId ? { ...r, is_active: false } : r
    );
  }
}

// Create singleton instance
export const currencyService = new CurrencyServiceClass();

// Context for currency preferences
interface CurrencyContextType {
  displayCurrency: 'USD' | 'TRY';
  setDisplayCurrency: (currency: 'USD' | 'TRY') => void;
  activeRate: ExchangeRate | null;
  refreshActiveRate: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Currency provider component
export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'TRY'>('USD');
  const [activeRate, setActiveRate] = useState<ExchangeRate | null>(null);

  const refreshActiveRate = () => {
    setActiveRate(currencyService.getActiveRate());
  };

  useEffect(() => {
    refreshActiveRate();
  }, []);

  return (
    <CurrencyContext.Provider value={{
      displayCurrency,
      setDisplayCurrency,
      activeRate,
      refreshActiveRate
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

// Hook to use currency context
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

// Utility functions for formatting
export const formatUSD = (amount: number): string => {
  return currencyService.formatCurrency(amount, { currency: 'USD' });
};

export const formatTRY = (amount: number): string => {
  return currencyService.formatCurrency(amount, { currency: 'TRY' });
};

export const formatUSDPlain = (amount: number): string => {
  return currencyService.formatCurrency(amount, { currency: 'USD', showSymbol: false });
};

export const formatTRYPlain = (amount: number): string => {
  return currencyService.formatCurrency(amount, { currency: 'TRY', showSymbol: false });
};