'use client'

import { useState, useRef, useEffect } from 'react'
import { useCurrency } from '@/contexts/CurrencyContext'
import { FiGlobe, FiChevronDown, FiCheck } from 'react-icons/fi'

export default function CurrencySelector() {
  const { currentCurrency, setCurrentCurrency, availableCurrencies, getCurrentCurrencyInfo } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentCurrencyInfo = getCurrentCurrencyInfo()

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleCurrencyChange = (currencyCode: string) => {
    setCurrentCurrency(currencyCode)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <FiGlobe className="w-4 h-4 text-gray-500" />
        <span className="hidden sm:inline">{currentCurrencyInfo.flag}</span>
        <span className="hidden md:inline">{currentCurrencyInfo.code}</span>
        <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
              اختر العملة
            </div>
            {availableCurrencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleCurrencyChange(currency.code)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                  currentCurrency === currency.code
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-lg">{currency.flag}</span>
                  <div className="text-right">
                    <div className="font-medium">{currency.name}</div>
                    <div className="text-xs text-gray-500">{currency.code}</div>
                  </div>
                </div>
                {currentCurrency === currency.code && (
                  <FiCheck className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// مكون مبسط لاختيار العملة
export function SimpleCurrencySelector() {
  const { currentCurrency, setCurrentCurrency, availableCurrencies, getCurrentCurrencyInfo } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentCurrencyInfo = getCurrentCurrencyInfo()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span>{currentCurrencyInfo.flag}</span>
        <span>{currentCurrencyInfo.code}</span>
        <FiChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            {availableCurrencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => {
                  setCurrentCurrency(currency.code)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  currentCurrency === currency.code
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{currency.flag}</span>
                <span>{currency.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
