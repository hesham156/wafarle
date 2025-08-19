'use client'

import { useCurrency } from '@/contexts/CurrencyContext'

interface PriceDisplayProps {
  price: number
  originalPrice?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showDiscount?: boolean
  className?: string
}

export default function PriceDisplay({ 
  price, 
  originalPrice, 
  size = 'md', 
  showDiscount = true,
  className = ''
}: PriceDisplayProps) {
  const { formatPrice } = useCurrency()
  
  const hasDiscount = originalPrice && originalPrice > price
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice! - price) / originalPrice!) * 100) 
    : 0

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {hasDiscount && showDiscount ? (
        <>
          <div className={`font-bold text-blue-600 ${sizeClasses[size]}`}>
            {formatPrice(price)}
          </div>
          <div className={`text-gray-400 line-through ${sizeClasses[size === 'xl' ? 'lg' : 'md']}`}>
            {formatPrice(originalPrice!)}
          </div>
          <div className="text-sm text-green-600">
            وفرت {discountPercentage}%
          </div>
        </>
      ) : (
        <div className={`font-bold text-blue-600 ${sizeClasses[size]}`}>
          {formatPrice(price)}
        </div>
      )}
    </div>
  )
}

// مكون مبسط لعرض السعر
export function SimplePrice({ 
  price, 
  size = 'md', 
  className = '' 
}: { 
  price: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const { formatPrice } = useCurrency()
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  return (
    <span className={`font-medium text-blue-600 ${sizeClasses[size]} ${className}`}>
      {formatPrice(price)}
    </span>
  )
}

// مكون لعرض السعر مع العلم
export function PriceWithFlag({ 
  price, 
  size = 'md', 
  className = '' 
}: { 
  price: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const { formatPriceWithFlag } = useCurrency()
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  return (
    <span className={`font-medium text-blue-600 ${sizeClasses[size]} ${className}`}>
      {formatPriceWithFlag(price)}
    </span>
  )
}
