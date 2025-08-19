'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { addToCart } from '@/lib/cart'
import { useCurrency } from '@/contexts/CurrencyContext'
import { FiShoppingCart, FiHeart, FiStar, FiShare2, FiArrowLeft, FiCheck, FiTruck, FiShield, FiRefreshCw, FiMinus, FiPlus } from 'react-icons/fi'
import Link from 'next/link'
import Image from 'next/image'
import Layout from '@/components/Layout/Layout'

interface Product {
  id: string
  name: string
  description: string
  long_description?: string
  price: number
  original_price?: number
  image_url: string
  category: string
  is_active: boolean
  created_at: string
  features?: string[]
  system_requirements?: string
  license_type?: string
  download_size?: string
  version?: string
}

interface Review {
  id: string
  user_name: string
  rating: number
  comment: string
  created_at: string
}

export default function ProductDetailPage() {
  const { formatPrice, convertPrice } = useCurrency()
  const params = useParams()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartMessage, setCartMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchReviews()
    }
  }, [productId])

  async function fetchProduct() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching product:', error)
        return
      }

      setProduct(data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchReviews() {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching reviews:', error)
        // Set empty array instead of returning early
        setReviews([])
        return
      }

      setReviews(data || [])
    } catch (err) {
      console.error('Error fetching reviews:', err)
      // Set empty array on error
      setReviews([])
    }
  }

  async function handleAddToCart() {
    if (!product) return

    try {
      setAddingToCart(true)
      setCartMessage(null)
      
      const result = await addToCart(product, quantity)
      
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
      setAddingToCart(false)
    }
  }

  function toggleWishlist() {
    setIsInWishlist(!isInWishlist)
    // سيتم تنفيذها لاحقاً
  }

  function shareProduct() {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      })
    } else {
      // نسخ الرابط للحافظة
      navigator.clipboard.writeText(window.location.href)
      // إظهار رسالة نجاح
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mr-3 text-gray-600">جاري تحميل المنتج...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">❌</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">المنتج غير موجود</h3>
              <p className="text-gray-600 mb-6">المنتج الذي تبحث عنه غير متوفر أو تم حذفه</p>
              <Link
                href="/products"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
              >
                <FiArrowLeft className="w-4 h-4" />
                العودة للمنتجات
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const hasDiscount = product.original_price && product.original_price > product.price
  const discountPercentage = hasDiscount ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100) : 0
  const averageRating = reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-blue-600">الرئيسية</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/products" className="hover:text-blue-600">المنتجات</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>

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

        {/* Product Details */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative w-full h-96 rounded-lg overflow-hidden">
                <Image
                  src={product.image_url || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {hasDiscount && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    -{discountPercentage}%
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={toggleWishlist}
                  className={`flex-1 py-3 px-4 rounded-lg border transition-colors ${
                    isInWishlist
                      ? 'border-red-300 bg-red-50 text-red-600'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  <FiHeart className={`w-5 h-5 mx-auto ${isInWishlist ? 'fill-current' : ''}`} />
                  {isInWishlist ? 'في المفضلة' : 'إضافة للمفضلة'}
                </button>
                
                <button
                  onClick={shareProduct}
                  className="py-3 px-4 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg transition-colors"
                >
                  <FiShare2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      className={`w-5 h-5 ${
                        star <= averageRating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">({reviews.length} تقييم)</span>
              </div>

              {/* Price */}
              <div className="space-y-2">
                {hasDiscount ? (
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-blue-600">{formatPrice(product.price)}</div>
                    <div className="text-xl text-gray-400 line-through">{formatPrice(product.original_price!)}</div>
                    <div className="text-sm text-green-600">وفرت {discountPercentage}%</div>
                  </div>
                ) : (
                  <div className="text-4xl font-bold text-blue-600">{formatPrice(product.price)}</div>
                )}
              </div>

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الكمية</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="w-16 text-center text-lg font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className={`w-full py-4 px-6 rounded-lg text-lg font-semibold transition-colors ${
                    addingToCart
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {addingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                      جاري الإضافة...
                    </>
                  ) : (
                    <>
                      <FiShoppingCart className="w-5 h-5 inline ml-2" />
                      إضافة للسلة
                    </>
                  )}
                </button>
              </div>

              {/* Product Features */}
              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">المميزات</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Product Info Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                {product.category && (
                  <div>
                    <span className="text-sm text-gray-500">الفئة</span>
                    <p className="font-medium">{product.category}</p>
                  </div>
                )}
                {product.license_type && (
                  <div>
                    <span className="text-sm text-gray-500">نوع الترخيص</span>
                    <p className="font-medium">{product.license_type}</p>
                  </div>
                )}
                {product.version && (
                  <div>
                    <span className="text-sm text-gray-500">الإصدار</span>
                    <p className="font-medium">{product.version}</p>
                  </div>
                )}
                {product.download_size && (
                  <div>
                    <span className="text-sm text-gray-500">حجم التحميل</span>
                    <p className="font-medium">{product.download_size}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Long Description */}
        {product.long_description && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">وصف المنتج</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {product.long_description}
              </p>
            </div>
          </div>
        )}

        {/* System Requirements */}
        {product.system_requirements && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">متطلبات النظام</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {product.system_requirements}
              </p>
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">التقييمات ({reviews.length})</h2>
          
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">⭐</div>
              <p className="text-gray-600">لا توجد تقييمات بعد</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{review.user_name}</h3>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(review.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </Layout>
  )
}
