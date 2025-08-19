'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCartItems, clearCart, calculateCartTotal, CartItem } from '@/lib/cart'
import { useCurrency } from '@/contexts/CurrencyContext'
import { FiCreditCard, FiLock, FiUser, FiMail, FiPhone, FiArrowLeft, FiCheck, FiShield, FiDownload } from 'react-icons/fi'
import Link from 'next/link'
import Layout from '@/components/Layout/Layout'
import Modal from '@/components/UI/Modal'

interface CheckoutForm {
  fullName: string
  email: string
  phone: string
  paymentMethod: 'card' | 'paypal' | 'bank_transfer'
}

export default function CheckoutPage() {
  const { formatPrice } = useCurrency()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CheckoutForm>({
    fullName: '',
    email: '',
    phone: '',
    paymentMethod: 'card'
  })
  const [error, setError] = useState<string | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

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

  function handleInputChange(field: keyof CheckoutForm, value: string) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  function validateStep1(): boolean {
    return formData.fullName.trim() !== '' && 
           formData.email.trim() !== '' && 
           formData.phone.trim() !== ''
  }

  function validateStep2(): boolean {
    return formData.paymentMethod !== undefined
  }

  function nextStep() {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  async function handleSubmit() {
    if (!validateStep1() || !validateStep2()) return

    try {
      setSubmitting(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setShowLoginModal(true)
        return
      }

      // حساب إجمالي الطلب
      const { total } = calculateCartTotal(cartItems)

      // إنشاء الطلب
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'pending',
          payment_method: formData.paymentMethod,
          contact_info: {
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone
          }
        })
        .select()
        .single()

      if (orderError) {
        console.error('Error creating order:', orderError)
        if (orderError.code === '42P01') {
          throw new Error('جدول الطلبات غير موجود. يرجى تشغيل ORDERS_TABLES_SETUP.sql في Supabase أولاً.')
        }
        throw new Error(`خطأ في إنشاء الطلب: ${orderError.message}`)
      }

      if (!order) {
        throw new Error('فشل في إنشاء الطلب')
      }

      // إنشاء عناصر الطلب
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Error creating order items:', itemsError)
        if (itemsError.code === '42P01') {
          throw new Error('جدول عناصر الطلبات غير موجود. يرجى تشغيل ORDERS_TABLES_SETUP.sql في Supabase أولاً.')
        }
        throw new Error(`خطأ في إنشاء عناصر الطلب: ${itemsError.message}`)
      }

      // مسح السلة
      await clearCart()

      // التوجيه لصفحة النجاح
      router.push(`/checkout/success?orderId=${order.id}`)
    } catch (error) {
      console.error('Error creating order:', error)
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير معروف أثناء إنشاء الطلب'
      // إظهار الخطأ في الواجهة بدلاً من alert
      setError(errorMessage)
    } finally {
      setSubmitting(false)
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
              <p className="mr-3 text-gray-600">جاري تحميل الطلب...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">إتمام الطلب</h1>
              <p className="text-gray-600">أدخل معلوماتك لإتمام عملية الشراء</p>
            </div>
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              العودة للسلة
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Progress Steps */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {currentStep > 1 ? <FiCheck className="w-4 h-4" /> : '1'}
                    </div>
                    <span className={`text-sm ${currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                      معلومات الاتصال
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {currentStep > 2 ? <FiCheck className="w-4 h-4" /> : '2'}
                    </div>
                    <span className={`text-sm ${currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                      طريقة الدفع
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 1: Contact Information */}
              {currentStep === 1 && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">معلومات الاتصال</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الاسم الكامل <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiUser className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="أدخل اسمك الكامل"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        البريد الإلكتروني <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiMail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="أدخل بريدك الإلكتروني"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم الهاتف <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiPhone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="أدخل رقم هاتفك"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={nextStep}
                      disabled={!validateStep1()}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                    >
                      التالي: طريقة الدفع
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 2 && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">اختر طريقة الدفع</h2>
                  
                  <div className="space-y-4">
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="mr-3">
                        <div className="font-medium text-gray-900">بطاقة ائتمان</div>
                        <div className="text-sm text-gray-500">Visa, Mastercard, American Express</div>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={formData.paymentMethod === 'paypal'}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="mr-3">
                        <div className="font-medium text-gray-900">PayPal</div>
                        <div className="text-sm text-gray-500">الدفع عبر PayPal</div>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={formData.paymentMethod === 'bank_transfer'}
                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="mr-3">
                        <div className="font-medium text-gray-900">تحويل بنكي</div>
                        <div className="text-sm text-gray-500">التحويل المباشر للبنك</div>
                      </div>
                    </label>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button
                      onClick={prevStep}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-medium transition-colors"
                    >
                      السابق
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!validateStep2() || submitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                          جاري إنشاء الطلب...
                        </>
                      ) : (
                        'إتمام الطلب'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ملخص الطلب</h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FiDownload className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">الكمية: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
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

              {/* Digital Product Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <FiDownload className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 text-sm">منتجات رقمية</h4>
                    <p className="text-blue-700 text-xs mt-1">
                      سيتم إرسال رابط التحميل لبريدك الإلكتروني بعد إتمام الدفع
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <FiShield className="w-4 h-4" />
                  <span>معلوماتك محمية ومشفرة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Login Required Modal */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onConfirm={() => router.push('/login')}
        type="confirm"
        title="تسجيل الدخول مطلوب"
        message="يجب تسجيل الدخول لإتمام الطلب. هل تريد تسجيل الدخول أو إنشاء حساب جديد؟"
        confirmText="تسجيل الدخول"
        cancelText="إنشاء حساب"
      />
    </Layout>
  )
}
