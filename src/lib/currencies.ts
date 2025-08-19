// نظام إدارة العملات الشرق أوسطية
export interface Currency {
  code: string
  name: string
  symbol: string
  flag: string
  exchangeRate: number // نسبة التحويل من الريال السعودي
  decimalPlaces: number
  position: 'left' | 'right' // موقع الرمز
}

// العملات المدعومة
export const CURRENCIES: Record<string, Currency> = {
  SAR: {
    code: 'SAR',
    name: 'الريال السعودي',
    symbol: 'ريال',
    flag: '🇸🇦',
    exchangeRate: 1,
    decimalPlaces: 2,
    position: 'right'
  },
  AED: {
    code: 'AED',
    name: 'الدرهم الإماراتي',
    symbol: 'د.إ',
    flag: '🇦🇪',
    exchangeRate: 0.98, // 1 SAR = 0.98 AED
    decimalPlaces: 2,
    position: 'left'
  },
  KWD: {
    code: 'KWD',
    name: 'الدينار الكويتي',
    symbol: 'د.ك',
    flag: '🇰🇼',
    exchangeRate: 0.12, // 1 SAR = 0.12 KWD
    decimalPlaces: 3,
    position: 'left'
  },
  QAR: {
    code: 'QAR',
    name: 'الريال القطري',
    symbol: 'ر.ق',
    flag: '🇶🇦',
    exchangeRate: 0.98, // 1 SAR = 0.98 QAR
    decimalPlaces: 2,
    position: 'left'
  },
  BHD: {
    code: 'BHD',
    name: 'الدينار البحريني',
    symbol: 'د.ب',
    flag: '🇧🇭',
    exchangeRate: 0.10, // 1 SAR = 0.10 BHD
    decimalPlaces: 3,
    position: 'left'
  },
  OMR: {
    code: 'OMR',
    name: 'الريال العماني',
    symbol: 'ر.ع',
    flag: '🇴🇲',
    exchangeRate: 0.10, // 1 SAR = 0.10 OMR
    decimalPlaces: 3,
    position: 'left'
  },
  EGP: {
    code: 'EGP',
    name: 'الجنيه المصري',
    symbol: 'ج.م',
    flag: '🇪🇬',
    exchangeRate: 8.20, // 1 SAR = 8.20 EGP
    decimalPlaces: 2,
    position: 'left'
  }
}

// العملة الافتراضية
export const DEFAULT_CURRENCY = 'SAR'

// دالة تحويل العملة
export function convertCurrency(
  amount: number,
  fromCurrency: string = 'SAR',
  toCurrency: string = 'SAR'
): number {
  if (fromCurrency === toCurrency) return amount
  
  const from = CURRENCIES[fromCurrency]
  const to = CURRENCIES[toCurrency]
  
  if (!from || !to) return amount
  
  // تحويل من العملة المصدر إلى الريال السعودي
  const inSAR = amount / from.exchangeRate
  
  // تحويل من الريال السعودي إلى العملة المستهدفة
  const converted = inSAR * to.exchangeRate
  
  return Number(converted.toFixed(to.decimalPlaces))
}

// دالة تنسيق السعر
export function formatPrice(
  amount: number,
  currencyCode: string = 'SAR',
  showSymbol: boolean = true
): string {
  const currency = CURRENCIES[currencyCode]
  if (!currency) return `${amount.toFixed(2)} ريال`
  
  const formattedAmount = amount.toFixed(currency.decimalPlaces)
  
  if (!showSymbol) {
    return `${formattedAmount} ${currency.code}`
  }
  
  if (currency.position === 'left') {
    return `${currency.symbol} ${formattedAmount}`
  } else {
    return `${formattedAmount} ${currency.symbol}`
  }
}

// دالة تنسيق السعر مع العلم
export function formatPriceWithFlag(
  amount: number,
  currencyCode: string = 'SAR',
  showSymbol: boolean = true
): string {
  const currency = CURRENCIES[currencyCode]
  if (!currency) return `${amount.toFixed(2)} ريال`
  
  const formattedAmount = amount.toFixed(currency.decimalPlaces)
  
  if (!showSymbol) {
    return `${currency.flag} ${formattedAmount} ${currency.code}`
  }
  
  if (currency.position === 'left') {
    return `${currency.flag} ${currency.symbol} ${formattedAmount}`
  } else {
    return `${currency.flag} ${formattedAmount} ${currency.symbol}`
  }
}

// دالة الحصول على قائمة العملات
export function getCurrenciesList(): Currency[] {
  return Object.values(CURRENCIES)
}

// دالة التحقق من صحة كود العملة
export function isValidCurrency(currencyCode: string): boolean {
  return currencyCode in CURRENCIES
}

// دالة الحصول على معلومات العملة
export function getCurrency(currencyCode: string): Currency | null {
  return CURRENCIES[currencyCode] || null
}

// دالة تحديث أسعار الصرف (للاستخدام المستقبلي مع API)
export function updateExchangeRates(newRates: Record<string, number>) {
  Object.keys(newRates).forEach(code => {
    if (CURRENCIES[code]) {
      CURRENCIES[code].exchangeRate = newRates[code]
    }
  })
}

// دالة حساب الضريبة بالعملة المحددة
export function calculateTax(
  subtotal: number,
  taxRate: number = 0.15,
  currencyCode: string = 'SAR'
): number {
  const taxAmount = subtotal * taxRate
  const currency = CURRENCIES[currencyCode]
  
  if (!currency) return taxAmount
  
  return Number(taxAmount.toFixed(currency.decimalPlaces))
}

// دالة حساب الإجمالي مع الضريبة
export function calculateTotal(
  subtotal: number,
  taxRate: number = 0.15,
  currencyCode: string = 'SAR'
): number {
  const tax = calculateTax(subtotal, taxRate, currencyCode)
  const total = subtotal + tax
  
  const currency = CURRENCIES[currencyCode]
  if (!currency) return total
  
  return Number(total.toFixed(currency.decimalPlaces))
}
