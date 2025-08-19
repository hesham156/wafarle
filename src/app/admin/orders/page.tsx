'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FiPackage, FiClock, FiCheckCircle, FiXCircle, FiEye, FiEdit, FiTrash2, FiSearch, FiFilter, FiCalendar, FiDollarSign, FiUser, FiX } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout/Layout'
import Modal from '@/components/UI/Modal'

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
  user_id: string
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

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter])

  async function fetchOrders() {
    try {
      setLoading(true)
      
      // جلب الطلبات مع عناصرها ومعلومات المستخدم
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
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

  function filterOrders() {
    let filtered = orders

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.contact_info.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.contact_info.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // فلترة حسب الحالة
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  async function updateOrderStatus(orderId: string, newStatus: Order['status']) {
    try {
      setUpdating(orderId)
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) {
        console.error('Error updating order status:', error)
        return
      }

      // تحديث الحالة في الواجهة
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))

      // إظهار رسالة نجاح
      setSuccessMessage('تم تحديث حالة الطلب بنجاح')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setUpdating(null)
    }
  }

  function handleDeleteClick(orderId: string) {
    setOrderToDelete(orderId)
    setShowDeleteModal(true)
  }

  async function deleteOrder(orderId: string) {
    try {
      setUpdating(orderId)
      
      // حذف عناصر الطلب أولاً
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId)

      if (itemsError) {
        console.error('Error deleting order items:', itemsError)
        return
      }

      // حذف الطلب
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (orderError) {
        console.error('Error deleting order:', orderError)
        return
      }

      // إزالة الطلب من الواجهة
      setOrders(prev => prev.filter(order => order.id !== orderId))
      
      // إظهار رسالة نجاح
      setSuccessMessage('تم حذف الطلب بنجاح')
      setShowSuccessModal(true)
      
      // إغلاق modal الحذف
      setShowDeleteModal(false)
      setOrderToDelete(null)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setUpdating(null)
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الطلبات</h1>
          <p className="text-gray-600">إدارة جميع طلبات المستخدمين وتحديث حالاتها</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
                <div className="text-sm text-gray-500">إجمالي الطلبات</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiClock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-500">في الانتظار</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-500">مكتملة</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {orders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">إجمالي المبيعات (ريال)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            {/* Date Range Filter */}
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">جميع التواريخ</option>
                <option value="today">اليوم</option>
                <option value="week">هذا الأسبوع</option>
                <option value="month">هذا الشهر</option>
                <option value="year">هذا العام</option>
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
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {order.total_amount.toFixed(2)} ريال
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          disabled={updating === order.id}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">في الانتظار</option>
                          <option value="paid">مدفوع</option>
                          <option value="completed">مكتمل</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          disabled={order.status === 'completed' || updating === order.id}
                          className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                          title="إكمال الطلب"
                        >
                          {updating === order.id ? '...' : '✓'}
                        </button>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            disabled={updating === order.id}
                            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                            title="إلغاء الطلب"
                          >
                            {updating === order.id ? '...' : '✕'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(order.id)}
                          disabled={updating === order.id}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {updating === order.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <FiTrash2 className="w-4 h-4" />
                          )}
                        </button>
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
                        <h4 className="font-medium text-gray-900 mb-3">معلومات العميل</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <FiUser className="w-4 h-4" />
                            <span>الاسم: {order.contact_info.full_name}</span>
                          </div>
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات</h3>
            <p className="text-gray-600">لا توجد طلبات تطابق معايير البحث</p>
          </div>
        )}
      </div>
    </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title="نجاح"
        message={successMessage}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => orderToDelete && deleteOrder(orderToDelete)}
        type="confirm"
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذا الطلب؟ سيتم حذف جميع عناصره ولا يمكن التراجع عنه."
        confirmText="حذف"
        cancelText="إلغاء"
      />
    </Layout>
  )
}
