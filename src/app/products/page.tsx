'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { addToCart } from '@/lib/cart'
import { useCurrency } from '@/contexts/CurrencyContext'
import { FiSearch, FiFilter, FiGrid, FiList, FiShoppingCart, FiHeart, FiCheck, FiX } from 'react-icons/fi'
import Link from 'next/link'
import Image from 'next/image'
import Layout from '@/components/Layout/Layout'
import { useSearchParams } from 'next/navigation'

interface Product {
  id: string
  name: string
  description: string
  price: number
  original_price?: number
  image_url: string
  category: string
  is_active: boolean
  created_at: string
}

function ProductsPageContent() {
  const { formatPrice, convertPrice } = useCurrency()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [cartMessage, setCartMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  
  // Multi-selection state
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [bulkAddingToCart, setBulkAddingToCart] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  // Handle search params from URL
  useEffect(() => {
    const searchFromUrl = searchParams.get('search')
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, searchTerm, categoryFilter, sortBy])

  // Update select all when filtered products change
  useEffect(() => {
    if (selectedProducts.size === 0) {
      setSelectAll(false)
    } else if (selectedProducts.size === filteredProducts.length) {
      setSelectAll(true)
    } else {
      setSelectAll(false)
    }
  }, [selectedProducts, filteredProducts])

  async function fetchProducts() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
        return
      }

      setProducts(data || [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  function filterAndSortProducts() {
    let filtered = [...products]

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // فلترة حسب الفئة
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter)
    }

    // ترتيب المنتجات
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price)
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price)
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
    }

    setFilteredProducts(filtered)
  }

  // Multi-selection functions
  function toggleProductSelection(productId: string) {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  function toggleSelectAll() {
    if (selectAll) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)))
    }
  }

  function clearSelection() {
    setSelectedProducts(new Set())
  }

  async function handleAddToCart(product: Product) {
    try {
      setAddingToCart(product.id)
      setCartMessage(null)
      
      const result = await addToCart(product, 1)
      
      if (result.success) {
        setCartMessage({ type: 'success', message: result.message })
        // إخفاء الرسالة بعد 3 ثواني
        setTimeout(() => setCartMessage(null), 3000)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      setCartMessage({ 
        type: 'error', 
        message: 'حدث خطأ أثناء إضافة المنتج إلى السلة' 
      })
      // إخفاء الرسالة بعد 3 ثواني
      setTimeout(() => setCartMessage(null), 3000)
    } finally {
      setAddingToCart(null)
    }
  }

  async function handleBulkAddToCart() {
    if (selectedProducts.size === 0) return

    try {
      setBulkAddingToCart(true)
      setCartMessage(null)

      const selectedProductObjects = filteredProducts.filter(p => selectedProducts.has(p.id))
      let successCount = 0
      let errorCount = 0

      for (const product of selectedProductObjects) {
        try {
          const result = await addToCart(product, 1)
          if (result.success) {
            successCount++
          } else {
            errorCount++
          }
        } catch (error) {
          errorCount++
        }
      }

      if (errorCount === 0) {
        setCartMessage({ 
          type: 'success', 
          message: `تم إضافة ${successCount} منتج إلى السلة بنجاح` 
        })
        clearSelection()
      } else if (successCount > 0) {
        setCartMessage({ 
          type: 'success', 
          message: `تم إضافة ${successCount} منتج إلى السلة، وفشل إضافة ${errorCount} منتج` 
        })
        clearSelection()
      } else {
        setCartMessage({ 
          type: 'error', 
          message: 'فشل في إضافة جميع المنتجات المحددة إلى السلة' 
        })
      }

      // إخفاء الرسالة بعد 5 ثواني
      setTimeout(() => setCartMessage(null), 5000)
    } catch (error) {
      console.error('Error in bulk add to cart:', error)
      setCartMessage({ 
        type: 'error', 
        message: 'حدث خطأ أثناء إضافة المنتجات إلى السلة' 
      })
      setTimeout(() => setCartMessage(null), 5000)
    } finally {
      setBulkAddingToCart(false)
    }
  }

  function addToWishlist(productId: string) {
    // سيتم تنفيذها لاحقاً
    console.log('Adding to wishlist:', productId)
  }

  const categories = ['all', 'design', 'development', 'productivity', 'creative']

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mr-3 text-gray-600">جاري تحميل المنتجات...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">المنتجات</h1>
            <p className="text-gray-600">اكتشف مجموعة متنوعة من البرامج والأدوات الاحترافية</p>
          </div>

        {/* Cart Message */}
        {cartMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            cartMessage.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {cartMessage.message}
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedProducts.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-blue-800 font-medium">
                  تم تحديد {selectedProducts.size} منتج
                </span>
                <button
                  onClick={clearSelection}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <FiX className="w-4 h-4" />
                  إلغاء التحديد
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBulkAddToCart}
                  disabled={bulkAddingToCart}
                  className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    bulkAddingToCart
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {bulkAddingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      جاري الإضافة...
                    </>
                  ) : (
                    <>
                      <FiShoppingCart className="w-4 h-4" />
                      إضافة المحدد للسلة
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Select All Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">تحديد الكل</label>
            </div>

            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في المنتجات..."
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

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">جميع الفئات</option>
                <option value="design">التصميم</option>
                <option value="development">التطوير</option>
                <option value="productivity">الإنتاجية</option>
                <option value="creative">الإبداع</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">الأحدث</option>
                <option value="price_low">السعر: من الأقل للأعلى</option>
                <option value="price_high">السعر: من الأعلى للأقل</option>
                <option value="name">الاسم: أ-ي</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            تم العثور على <span className="font-semibold text-blue-600">{filteredProducts.length}</span> منتج
            {selectedProducts.size > 0 && (
              <span className="mr-2 text-blue-600">
                • تم تحديد <span className="font-semibold">{selectedProducts.size}</span> منتج
              </span>
            )}
          </p>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-600">جرب تغيير معايير البحث أو الفلترة</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
                onAddToCart={handleAddToCart}
                onAddToWishlist={addToWishlist}
                addingToCart={addingToCart === product.id}
                isSelected={selectedProducts.has(product.id)}
                onToggleSelection={toggleProductSelection}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    </Layout>
  )
}

// Move ProductCard component outside of ProductsPageContent
interface ProductCardProps {
  product: Product
  viewMode: 'grid' | 'list'
  onAddToCart: (product: Product) => void
  onAddToWishlist: (productId: string) => void
  addingToCart: boolean
  isSelected: boolean
  onToggleSelection: (productId: string) => void
}

function ProductCard({ product, viewMode, onAddToCart, onAddToWishlist, addingToCart, isSelected, onToggleSelection }: ProductCardProps) {
  const { formatPrice } = useCurrency()
  const hasDiscount = product.original_price && product.original_price > product.price
  const discountPercentage = hasDiscount ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100) : 0

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex">
          {/* Selection Checkbox */}
          <div className="flex items-center justify-center w-16 p-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(product.id)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>

          <div className="w-48 h-32 relative flex-shrink-0">
            <Image
              src={product.image_url || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover"
            />
            {hasDiscount && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                -{discountPercentage}%
              </div>
            )}
          </div>
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  <Link href={`/products/${product.id}`} className="hover:text-blue-600">
                    {product.name}
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {hasDiscount ? (
                      <>
                        <span className="text-2xl font-bold text-blue-600">{formatPrice(product.price)}</span>
                        <span className="text-sm text-gray-400 line-through">{formatPrice(product.original_price!)}</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-blue-600">{formatPrice(product.price)}</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onAddToWishlist(product.id)}
                  className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FiHeart className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onAddToCart(product)}
                  disabled={addingToCart}
                  className={`px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    addingToCart
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {addingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      جاري الإضافة...
                    </>
                  ) : (
                    <>
                      <FiShoppingCart className="w-4 h-4" />
                      إضافة للسلة
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    }`}>
      <div className="relative">
        {/* Selection Checkbox */}
        <div className="absolute top-2 right-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(product.id)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="w-full h-48 relative">
          <Image
            src={product.image_url || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover"
          />
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              -{discountPercentage}%
            </div>
          )}
        </div>
        <button
          onClick={() => onAddToWishlist(product.id)}
          className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
        >
          <FiHeart className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
          <Link href={`/products/${product.id}`} className="hover:text-blue-600">
            {product.name}
          </Link>
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
                <span className="text-sm text-gray-400 line-through">{formatPrice(product.original_price!)}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
            )}
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>
        
        <button
          onClick={() => onAddToCart(product)}
          disabled={addingToCart}
          className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
            addingToCart
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {addingToCart ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              جاري الإضافة...
            </>
          ) : (
            <>
              <FiShoppingCart className="w-4 h-4" />
              إضافة للسلة
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  )
}
