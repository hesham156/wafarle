'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiSave, FiX, FiSearch } from 'react-icons/fi'
import Modal from '@/components/UI/Modal'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  is_active: boolean
  created_at: string
}

interface ProductFormData {
  name: string
  description: string
  price: number
  category: string
  image_url: string
  is_active: boolean
}

const CATEGORIES = [
  'برامج التصميم',
  'برامج التطوير',
  'برامج الفيديو',
  'برامج الإنتاجية',
  'أدوات التصميم',
  'أدوات التطوير'
]

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0.00,
    category: CATEGORIES[0],
    image_url: '',
    is_active: true
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        // إذا كان الجدول غير موجود، اعرض رسالة واضحة
        if (error.code === '42P01') {
          setError('جدول المنتجات غير موجود. يرجى تشغيل DATABASE_SETUP.sql أولاً')
        } else {
          setError(`خطأ في جلب المنتجات: ${error.message}`)
        }
        return
      }
      setProducts(data || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('خطأ في جلب المنتجات. تأكد من إنشاء قاعدة البيانات أولاً.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // التحقق من صحة البيانات
    if (!formData.name.trim()) {
      setError('يرجى إدخال اسم المنتج')
      return
    }
    
    if (!formData.description.trim()) {
      setError('يرجى إدخال وصف المنتج')
      return
    }
    
    if (isNaN(formData.price) || formData.price <= 0) {
      setError('يرجى إدخال سعر صحيح')
      return
    }
    
    if (!formData.category) {
      setError('يرجى اختيار فئة المنتج')
      return
    }
    
    try {
      setSaving(true)
      
      if (editingProduct) {
        // تحديث منتج موجود
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', editingProduct.id)

        if (error) {
          console.error('Supabase update error:', error)
          setError(`خطأ في تحديث المنتج: ${error.message}`)
          return
        }
      } else {
        // إضافة منتج جديد
        const { error } = await supabase
          .from('products')
          .insert([formData])

        if (error) {
          console.error('Supabase insert error:', error)
          setError(`خطأ في إضافة المنتج: ${error.message}`)
          return
        }
      }

      // إعادة تعيين النموذج
      setFormData({
        name: '',
        description: '',
        price: 0.00,
        category: CATEGORIES[0],
        image_url: '',
        is_active: true
      })
      setShowForm(false)
      setEditingProduct(null)
      fetchProducts()
      
      // إظهار رسالة نجاح
      setSuccessMessage(editingProduct ? 'تم تحديث المنتج بنجاح!' : 'تم إضافة المنتج بنجاح!')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error saving product:', error)
      setError('خطأ في حفظ المنتج. يرجى المحاولة مرة أخرى.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: isNaN(product.price) ? 0.00 : product.price,
      category: product.category,
      image_url: product.image_url || '',
      is_active: product.is_active
    })
    setShowForm(true)
  }

  function handleDeleteClick(productId: string) {
    setProductToDelete(productId)
    setShowDeleteModal(true)
  }

  const handleDelete = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) {
        console.error('Supabase delete error:', error)
        setError(`خطأ في حذف المنتج: ${error.message}`)
        return
      }
      
      fetchProducts()
      
      // إظهار رسالة نجاح
      setSuccessMessage('تم حذف المنتج بنجاح!')
      setShowSuccessModal(true)
      
      // إغلاق modal الحذف
      setShowDeleteModal(false)
      setProductToDelete(null)
    } catch (error) {
      console.error('Error deleting product:', error)
      setError('خطأ في حذف المنتج. يرجى المحاولة مرة أخرى.')
    }
  }

  const toggleProductStatus = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id)

      if (error) {
        console.error('Supabase status update error:', error)
        setError(`خطأ في تحديث حالة المنتج: ${error.message}`)
        return
      }
      
      fetchProducts()
      
      // إظهار رسالة نجاح
      setStatusMessage(`تم تحديث حالة المنتج إلى: ${!product.is_active ? 'نشط' : 'غير نشط'}`)
      setShowStatusModal(true)
    } catch (error) {
      console.error('Error updating product status:', error)
      setError('خطأ في تحديث حالة المنتج. يرجى المحاولة مرة أخرى.')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0.00,
      category: CATEGORIES[0],
      image_url: '',
      is_active: true
    })
    setEditingProduct(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري تحميل المنتجات...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">إدارة المنتجات</h2>
            <p className="text-gray-600">إضافة وتعديل وحذف منتجات المتجر</p>
          </div>
        </div>

        {/* Error Message */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">خطأ في قاعدة البيانات</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="bg-red-100 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">لحل المشكلة:</h4>
                <ol className="list-decimal list-inside text-red-700 space-y-1 text-sm">
                  <li>اذهب إلى <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">لوحة تحكم Supabase</a></li>
                  <li>اختر مشروعك: <code className="bg-red-200 px-2 py-1 rounded">tpvnaizaiyyajuxfwqqa</code></li>
                  <li>اذهب إلى <strong>SQL Editor</strong></li>
                  <li>انسخ محتوى ملف <code className="bg-red-200 px-2 py-1 rounded">DATABASE_SETUP.sql</code></li>
                  <li>الصق الكود واضغط <strong>Run</strong></li>
                  <li>أعد تحميل الصفحة</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة المنتجات</h2>
          <p className="text-gray-600">إضافة وتعديل وحذف منتجات المتجر</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiPlus />
          إضافة منتج جديد
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في المنتجات..."
              className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الفئات</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الأسعار</option>
              <option value="0-50">0 - 50 ريال</option>
              <option value="50-100">50 - 100 ريال</option>
              <option value="100-200">100 - 200 ريال</option>
              <option value="200+">200+ ريال</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div>
            <button
              className="w-full px-4 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>
      </div>

      {/* Product Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المنتج *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل اسم المنتج"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === '' ? 0 : parseFloat(value);
                    if (!isNaN(numValue)) {
                      setFormData({ ...formData, price: numValue });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الصورة
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف المنتج *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل وصف المنتج"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">منتج نشط</span>
              </label>
            </div>

                                    <div className="flex gap-3 pt-4">
                          <button
                            type="submit"
                            disabled={saving}
                            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                              saving
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                            } text-white`}
                          >
                            {saving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                {editingProduct ? 'جاري التحديث...' : 'جاري الإضافة...'}
                              </>
                            ) : (
                              <>
                                <FiSave />
                                {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={resetForm}
                            disabled={saving}
                            className={`px-6 py-2 rounded-lg transition-colors ${
                              saving
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gray-500 hover:bg-gray-600'
                            } text-white`}
                          >
                            إلغاء
                          </button>
                        </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            المنتجات ({products.length})
          </h3>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد منتجات حالياً</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المنتج
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الفئة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    السعر
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.description.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.price.toFixed(2)} ريال
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleProductStatus(product)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                          product.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {product.is_active ? 'نشط' : 'غير نشط'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="تعديل"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="حذف"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => productToDelete && handleDelete(productToDelete)}
        type="confirm"
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف المنتج "${editingProduct?.name || productToDelete}"? هذه العملية غير قابلة للتراجع.`}
        confirmText="حذف"
        cancelText="إلغاء"
      />

      {/* Success Message Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title={successMessage.includes('تم تحديث') ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح'}
        message={successMessage}
      />

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        type="success"
        title="تحديث الحالة"
        message={statusMessage}
      />
    </div>
  )
}
