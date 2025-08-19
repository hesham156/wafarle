'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FiCheckCircle, FiDownload, FiPackage, FiMail, FiPhone, FiCalendar, FiDollarSign } from 'react-icons/fi'
import Link from 'next/link'
import Layout from '@/components/Layout/Layout'

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    description: string
    image_url: string
    category: string
  }
}

interface Order {
  id: string
  total_amount: number
  status: string
  payment_method: string
  contact_info: {
    full_name: string
    email: string
    phone: string
  }
  created_at: string
  order_items: OrderItem[]
}

function CheckoutSuccessPageContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  async function fetchOrder() {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('User not authenticated')
        return
      }

      // جلب الطلب مع عناصره
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single()

      if (orderError) {
        console.error('Error fetching order:', orderError)
        return
      }

      setOrder(orderData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function getPaymentMethodLabel(method: string) {
    switch (method) {
      case 'card':
        return 'بطاقة ائتمان'
      case 'paypal':
        return 'PayPal'
      case 'bank_transfer':
        return 'تحويل بنكي'
      default:
        return method
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              <p className="mr-3 text-gray-600">جاري تحميل تفاصيل الطلب...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!order) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="text-red-400 text-6xl mb-4">❌</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">لم يتم العثور على الطلب</h3>
              <p className="text-gray-600 mb-6">الطلب المطلوب غير موجود أو لا يمكن الوصول إليه</p>
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                عرض طلباتي
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
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تم إتمام الطلب بنجاح! 🎉</h1>
          <p className="text-gray-600">شكراً لك على طلبك. سيتم إرسال رابط التحميل لبريدك الإلكتروني قريباً</p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ملخص الطلب</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">معلومات الطلب</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FiPackage className="w-4 h-4" />
                    <span>رقم الطلب: {order.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    <span>تاريخ الطلب: {formatDate(order.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="w-4 h-4" />
                    <span>طريقة الدفع: {getPaymentMethodLabel(order.payment_method)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="w-4 h-4" />
                    <span>إجمالي المبلغ: {order.total_amount.toFixed(2)} ريال</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">معلومات الاتصال</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FiMail className="w-4 h-4" />
                    <span>الاسم: {order.contact_info.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMail className="w-4 h-4" />
                    <span>البريد: {order.contact_info.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiPhone className="w-4 h-4" />
                    <span>الهاتف: {order.contact_info.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">المنتجات المطلوبة</h3>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <FiPackage className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm">{item.product.name}</h4>
                    <p className="text-sm text-gray-500">{item.product.category}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>الكمية: {item.quantity}</span>
                      <span>السعر: {item.price.toFixed(2)} ريال</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {(item.price * item.quantity).toFixed(2)} ريال
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">الخطوات التالية</h3>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">تأكيد الدفع</p>
                <p className="text-sm text-blue-700">سيتم مراجعة الدفع وتأكيده خلال 24 ساعة</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium">إرسال رابط التحميل</p>
                <p className="text-sm text-blue-700">سيتم إرسال رابط التحميل لبريدك الإلكتروني</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium">تحميل المنتجات</p>
                <p className="text-sm text-blue-700">قم بتحميل المنتجات واستمتع بها</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <FiPackage className="w-5 h-5" />
            عرض طلباتي
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <FiDownload className="w-5 h-5" />
            تصفح المزيد من المنتجات
          </Link>
        </div>

        {/* Support Info */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>هل لديك أسئلة؟ تواصل معنا على support@wafarle.com</p>
        </div>
      </div>
    </div>
    </Layout>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutSuccessPageContent />
    </Suspense>
  )
}
