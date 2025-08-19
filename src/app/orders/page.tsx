'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FiPackage, FiClock, FiCheckCircle, FiXCircle, FiEye, FiDownload, FiCalendar, FiDollarSign, FiSearch, FiX } from 'react-icons/fi'
import Link from 'next/link'
import Image from 'next/image'
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
  status: 'pending' | 'paid' | 'completed' | 'cancelled'
  payment_method: string
  contact_info: {
    full_name: string
    email: string
    phone: string
  }
  created_at: string
  updated_at: string
  order_items: OrderItem[]
}

const statusConfig = {
  pending: {
    label: 'في الانتظار',
    color: 'bg-yellow-100 text-yellow-800',
    icon: FiClock
  },
  paid: {
    label: 'مدفوع',
    color: 'bg-blue-100 text-blue-800',
    icon: FiCheckCircle
  },
  completed: {
    label: 'مكتمل',
    color: 'bg-green-100 text-green-800',
    icon: FiCheckCircle
  },
  cancelled: {
    label: 'ملغي',
    color: 'bg-red-100 text-red-800',
    icon: FiXCircle
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter])

  function filterOrders() {
    let filtered = orders

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.contact_info.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // فلترة حسب الحالة
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  async function fetchOrders() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('User not authenticated')
        return
      }

      // جلب الطلبات مع عناصرها
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (ordersError) {
        console.error('Error fetching orders:', ordersError)
        return
      }

      setOrders(ordersData || [])
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

  function getStatusConfig(status: keyof typeof statusConfig) {
    return statusConfig[status] || statusConfig.pending
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mr-3 text-gray-600">جاري تحميل الطلبات...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (orders.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات</h3>
              <p className="text-gray-600 mb-6">لم تقم بإجراء أي طلبات بعد</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">طلباتي</h1>
          <p className="text-gray-600">تابع حالة طلباتك وتاريخها</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في الطلبات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">في الانتظار</option>
                <option value="paid">مدفوع</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                }}
                className="w-full px-4 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                مسح الفلاتر
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            تم العثور على <span className="font-semibold text-blue-600">{filteredOrders.length}</span> طلب
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const status = getStatusConfig(order.status)
            const StatusIcon = status.icon
            
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <FiPackage className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-500">طلب رقم:</span>
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {order.id.slice(0, 8)}...
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {order.total_amount.toFixed(2)} ريال
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          {item.product.image_url ? (
                            <Image
                              src={item.product.image_url}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <FiPackage className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm">{item.product.name}</h3>
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

                  {/* Order Details */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">معلومات الاتصال</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div>الاسم: {order.contact_info.full_name}</div>
                          <div>البريد: {order.contact_info.email}</div>
                          <div>الهاتف: {order.contact_info.phone}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">تفاصيل الطلب</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <FiCalendar className="w-4 h-4" />
                            <span>تاريخ الطلب: {formatDate(order.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiDollarSign className="w-4 h-4" />
                            <span>طريقة الدفع: {order.payment_method === 'card' ? 'بطاقة ائتمان' : 
                                                  order.payment_method === 'paypal' ? 'PayPal' : 'تحويل بنكي'}</span>
                          </div>
                          {order.status === 'completed' && (
                            <div className="flex items-center gap-2 text-green-600">
                              <FiDownload className="w-4 h-4" />
                              <span>متاح للتحميل</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
    </Layout>
  )
}
