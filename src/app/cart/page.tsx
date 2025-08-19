'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCartItems, updateCartItemQuantity, removeFromCart, clearCart, calculateCartTotal, CartItem } from '@/lib/cart'
import { useCurrency } from '@/contexts/CurrencyContext'
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiCreditCard, FiLock } from 'react-icons/fi'
import Link from 'next/link'
import Image from 'next/image'
import Layout from '@/components/Layout/Layout'
import Modal from '@/components/UI/Modal'

export default function CartPage() {
  const { formatPrice } = useCurrency()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)

  useEffect(() => {
    fetchCartItems()
  }, [])

  async function fetchCartItems() {
    try {
      setLoading(true)
      const items = await getCartItems()
      setCartItems(items)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity < 1) return

    try {
      setUpdating(itemId)
      await updateCartItemQuantity(itemId, newQuantity)
      
      // تحديث الحالة المحلية
      setCartItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ))
    } catch (err) {
      console.error('Error updating quantity:', err)
    } finally {
      setUpdating(null)
    }
  }

  async function handleRemoveItem(itemId: string) {
    try {
      setRemoving(itemId)
      await removeFromCart(itemId)
      
      // إزالة العنصر من الحالة المحلية
      setCartItems(prev => prev.filter(item => item.id !== itemId))
    } catch (err) {
      console.error('Error removing item:', err)
    } finally {
      setRemoving(null)
    }
  }

  async function handleClearCart() {
    try {
      setClearing(true)
      await clearCart()
      setCartItems([])
      setShowClearModal(false)
    } catch (err) {
      console.error('Error clearing cart:', err)
    } finally {
      setClearing(false)
    }
  }

  const { subtotal, tax, total } = calculateCartTotal(cartItems)

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mr-3 text-gray-600">جاري تحميل السلة...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🛒</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">السلة فارغة</h3>
              <p className="text-gray-600 mb-6">لم تقم بإضافة أي منتجات إلى السلة بعد</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                تصفح المنتجات
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">سلة التسوق</h1>
              <p className="text-gray-600">مراجعة المنتجات المختارة</p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              العودة للمنتجات
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">المنتجات ({cartItems.length})</h2>
                  <button
                    onClick={() => setShowClearModal(true)}
                    disabled={clearing}
                    className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                  >
                    {clearing ? 'جاري المسح...' : 'مسح السلة'}
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                    updating={updating === item.id}
                    removing={removing === item.id}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ملخص الطلب</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">المجموع الفرعي:</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">الضريبة (15%):</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>الإجمالي:</span>
                    <span className="text-blue-600">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
              >
                <FiCreditCard className="w-4 h-4" />
                إتمام الطلب
              </Link>

              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <FiLock className="w-4 h-4" />
                  <span>معلوماتك محمية ومشفرة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Modal for clearing cart */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearCart}
        type="confirm"
        title="تأكيد مسح السلة"
        message="هل أنت متأكد من رغبتك في مسح جميع عناصر السلة؟ هذه العملية غير قابلة للتراجع."
        confirmText="مسح السلة"
        cancelText="إلغاء"
      />
    </Layout>
  )
}

interface CartItemCardProps {
  item: CartItem
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
  updating: boolean
  removing: boolean
}

function CartItemCard({ item, onUpdateQuantity, onRemove, updating, removing }: CartItemCardProps) {
  const { formatPrice } = useCurrency()
  const hasDiscount = item.product.original_price && item.product.original_price > item.product.price
  const discountPercentage = hasDiscount ? Math.round(((item.product.original_price! - item.product.price) / item.product.original_price!) * 100) : 0

  return (
    <div className="p-6">
      <div className="flex items-center gap-4">
        {/* Product Image */}
        <div className="w-20 h-20 relative flex-shrink-0">
          <Image
            src={item.product.image_url || '/placeholder-product.jpg'}
            alt={item.product.name}
            fill
            className="object-cover rounded-lg"
          />
          {hasDiscount && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              -{discountPercentage}%
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm">{item.product.name}</h3>
          <p className="text-sm text-gray-500">{item.product.category}</p>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
            <span>الكمية: {item.quantity}</span>
            <span>السعر: {formatPrice(item.product.price)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-medium text-gray-900">
            {formatPrice(item.product.price * item.quantity)}
          </div>
          {item.product.original_price && item.product.original_price > item.product.price && (
            <div className="text-sm text-gray-400 line-through">
              {formatPrice(item.product.original_price * item.quantity)}
            </div>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={updating || item.quantity <= 1}
            className="p-1 rounded-lg border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiMinus className="w-3 h-3" />
          </button>
          
          <span className="w-12 text-center font-medium">{item.quantity}</span>
          
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            disabled={updating}
            className="p-1 rounded-lg border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus className="w-3 h-3" />
          </button>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item.id)}
          disabled={removing}
          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 ml-4"
        >
          {removing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
          ) : (
            <FiTrash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}
