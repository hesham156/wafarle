'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CURRENCIES, DEFAULT_CURRENCY, Currency, convertCurrency } from '@/lib/currencies'

interface CurrencyContextType {
  currentCurrency: string
  setCurrentCurrency: (currency: string) => void
  convertPrice: (price: number, fromCurrency?: string) => number
  formatPrice: (price: number, showSymbol?: boolean) => string
  formatPriceWithFlag: (price: number, showSymbol?: boolean) => string
  getCurrentCurrencyInfo: () => Currency
  availableCurrencies: Currency[]
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

interface CurrencyProviderProps {
  children: ReactNode
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currentCurrency, setCurrentCurrencyState] = useState<string>(DEFAULT_CURRENCY)

  // تحميل العملة المحفوظة من localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency')
    if (savedCurrency && CURRENCIES[savedCurrency]) {
      setCurrentCurrencyState(savedCurrency)
    }
  }, [])

  // حفظ العملة في localStorage
  const setCurrentCurrency = (currency: string) => {
    if (CURRENCIES[currency]) {
      setCurrentCurrencyState(currency)
      localStorage.setItem('selectedCurrency', currency)
    }
  }

  // تحويل السعر من العملة الحالية
  const convertPrice = (price: number, fromCurrency: string = 'SAR'): number => {
    return convertCurrency(price, fromCurrency, currentCurrency)
  }

  // تنسيق السعر بالعملة الحالية
  const formatPrice = (price: number, showSymbol: boolean = true): string => {
    // تحويل السعر أولاً من الريال السعودي إلى العملة الحالية
    const convertedPrice = convertPrice(price, 'SAR')
    
    const currency = CURRENCIES[currentCurrency]
    if (!currency) return `${convertedPrice.toFixed(2)} ريال`
    
    const formattedAmount = convertedPrice.toFixed(currency.decimalPlaces)
    
    if (!showSymbol) {
      return `${formattedAmount} ${currency.code}`
    }
    
    if (currency.position === 'left') {
      return `${currency.symbol} ${formattedAmount}`
    } else {
      return `${formattedAmount} ${currency.symbol}`
    }
  }

  // تنسيق السعر مع العلم
  const formatPriceWithFlag = (price: number, showSymbol: boolean = true): string => {
    // تحويل السعر أولاً من الريال السعودي إلى العملة الحالية
    const convertedPrice = convertPrice(price, 'SAR')
    
    const currency = CURRENCIES[currentCurrency]
    if (!currency) return `${convertedPrice.toFixed(2)} ريال`
    
    const formattedAmount = convertedPrice.toFixed(currency.decimalPlaces)
    
    if (!showSymbol) {
      return `${currency.flag} ${formattedAmount} ${currency.code}`
    }
    
    if (currency.position === 'left') {
      return `${currency.flag} ${currency.symbol} ${formattedAmount}`
    } else {
      return `${currency.flag} ${formattedAmount} ${currency.symbol}`
    }
  }

  // الحصول على معلومات العملة الحالية
  const getCurrentCurrencyInfo = (): Currency => {
    return CURRENCIES[currentCurrency] || CURRENCIES[DEFAULT_CURRENCY]
  }

  // قائمة العملات المتاحة
  const availableCurrencies = Object.values(CURRENCIES)

  const value: CurrencyContextType = {
    currentCurrency,
    setCurrentCurrency,
    convertPrice,
    formatPrice,
    formatPriceWithFlag,
    getCurrentCurrencyInfo,
    availableCurrencies
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

// Hook لاستخدام Context العملة
export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
