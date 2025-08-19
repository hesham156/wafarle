'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { UserWithRole, UserRole, hasPermission } from '@/types/roles'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiSearch,
  FiHeart,
  FiShield,
  FiLogOut
} from 'react-icons/fi'
import CurrencySelector from '@/components/CurrencySelector'
import { useCurrency } from '@/contexts/CurrencyContext'

// تعريف أنواع البيانات
interface CartItem {
  id: string
  quantity: number
  product?: {
    name: string
    price: number
  }
  price?: number
}

interface SearchResult {
  id: string
  type: string
  name: string
  description?: string
  category?: string
  price: number
  image_url?: string
}

export default function Header() {
  const { formatPrice } = useCurrency()
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [cartTotal, setCartTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const router = useRouter()

  // دالة بسيطة لتحديث معلومات السلة
  const updateCartInfo = () => {
    try {
      console.log('🔍 Header: updateCartInfo called')
      const cartData = localStorage.getItem('wafarle_cart')
      console.log('🔍 Header: Reading cart data:', cartData)
      
      if (!cartData) {
        console.log('📭 Header: No cart data, setting to 0')
        setCartCount(0)
        setCartTotal(0)
        return
      }

      const cart = JSON.parse(cartData)
      console.log('🔍 Header: Parsed cart:', cart)
      
      // استخراج العناصر
      let items: CartItem[] = []
      if (cart.items && Array.isArray(cart.items)) {
        items = cart.items
      } else if (Array.isArray(cart)) {
        items = cart
      } else if (cart.products && Array.isArray(cart.products)) {
        items = cart.products
      }
      
      console.log('🔍 Header: Items found:', items)
      
      // حساب العدد والإجمالي
      let count = 0
      let total = 0
      
      items.forEach((item: CartItem) => {
        const quantity = typeof item.quantity === 'string' ? parseInt(item.quantity) || 1 : item.quantity
        const price = typeof item.product?.price === 'string' ? parseFloat(item.product.price) || 0 : 
                     typeof item.price === 'string' ? parseFloat(item.price) || 0 :
                     item.product?.price || item.price || 0
        
        count += quantity
        total += price * quantity
        
        console.log(`📦 Header: Item: ${item.product?.name || 'Unknown'}, Qty: ${quantity}, Price: ${price}`)
      })
      
      console.log('🎯 Header: Final - Count:', count, 'Total:', total)
      console.log('🔄 Header: About to update state - current cartCount:', cartCount, 'new count:', count)
      
      // تحديث الحالة بطريقة قسرية
      setCartCount(count)
      setCartTotal(total)
      
      // إجبار إعادة التصيير
      setTimeout(() => {
        console.log('🔄 Header: Force re-render after state update')
        setCartCount(prev => prev) // إجبار إعادة التصيير
      }, 100)
      
      console.log('✅ Header: State updated successfully')
      
    } catch (error) {
      console.error('❌ Header: Error updating cart:', error)
      setCartCount(0)
      setCartTotal(0)
    }
  }

  // مراقبة التغييرات في السلة
  useEffect(() => {
    console.log('🔧 Header useEffect started - setting up cart listeners')
    
    // تحديث أولي
    updateCartInfo()
    
    // مراقبة الأحداث
    const handleCartUpdate = () => {
      console.log('🔄 Header: Cart update event received')
      updateCartInfo()
    }
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wafarle_cart') {
        console.log('🔄 Header: Storage change detected')
        updateCartInfo()
      }
    }
    
    // إضافة المستمعين
    console.log('📡 Header: Adding event listeners')
    window.addEventListener('cartUpdated', handleCartUpdate)
    window.addEventListener('storage', handleStorageChange)
    
    // فحص مستمر كل 2000ms للتأكد من التحديث
    const interval = setInterval(() => {
      console.log('🔍 Header: Periodic check - checking localStorage...')
      updateCartInfo()
    }, 2000)
    
    console.log('✅ Header: Event listeners and interval set up successfully')
    
    return () => {
      console.log('🧹 Header: Cleaning up event listeners and interval')
      window.removeEventListener('cartUpdated', handleCartUpdate)
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, []) // إزالة cartCount من dependencies

  // مراقبة تغييرات cartCount
  useEffect(() => {
    console.log('📊 Header: cartCount changed to:', cartCount)
  }, [cartCount])

  // مراقبة تغييرات cartTotal
  useEffect(() => {
    console.log('💰 Header: cartTotal changed to:', cartTotal)
  }, [cartTotal])

  // جلب معلومات المستخدم
  useEffect(() => {
    const getUser = async () => {
      try {
        const { getCurrentUser, onAuthStateChange } = await import('@/lib/auth-utils')
        
        // Get initial user
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        setLoading(false)

        // Listen for auth state changes
        const { data: { subscription } } = onAuthStateChange((user) => {
          setUser(user)
        })

        // Cleanup subscription on unmount
        return () => {
          subscription?.unsubscribe()
        }
      } catch (err) {
        console.error('Error setting up auth:', err)
        setLoading(false)
      }
    }

    getUser()
  }, [])

  // Global search function
  const handleGlobalSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    try {
      setSearching(true)
      setShowSearchResults(true)

      // Search in products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, description, category, price, image_url')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(5)

      if (productsError) {
        console.error('Error searching products:', productsError)
      }

      const results: SearchResult[] = [
        ...(products || []).map(p => ({ ...p, type: 'product' })),
      ]

      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearchResults(false)
      setSearchQuery('')
    }
  }

  const handleSearchResultClick = (result: SearchResult) => {
    if (result.type === 'product') {
      router.push(`/products/${result.id}`)
    }
    setShowSearchResults(false)
    setSearchQuery('')
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/')
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        {/* Main Header */}
        <div className="px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg sm:text-xl font-bold">W</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  وفرلي
                </h1>
                <p className="text-xs text-gray-500">متجر البرامج والأدوات</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                المنتجات
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                الفئات
              </Link>
              <Link href="/deals" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                العروض
              </Link>
              <Link href="/support" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                الدعم
              </Link>
            </nav>

            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-md mx-4">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      if (e.target.value.trim()) {
                        handleGlobalSearch(e.target.value)
                        setShowSearchResults(true)
                      } else {
                        setShowSearchResults(false)
                      }
                    }}
                    placeholder="ابحث عن المنتجات..."
                    className="w-full pr-10 pl-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setShowSearchResults(false)
                      }}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>

              {/* Desktop Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id || index}`}
                      onClick={() => handleSearchResultClick(result)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      {result.type === 'product' && (
                        <>
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            {result.image_url ? (
                              <img
                                src={result.image_url}
                                alt={result.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-gray-400 text-lg">📦</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{result.name}</p>
                            <p className="text-xs text-gray-500 truncate">{result.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-blue-600">
                              {formatPrice(result.price)}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <div className="p-3 bg-gray-50 border-t border-gray-200">
                    <button
                      onClick={() => {
                        router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
                        setShowSearchResults(false)
                      }}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      عرض جميع النتائج
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Currency Selector */}
              <div className="hidden sm:block">
                <CurrencySelector />
              </div>

              {/* Cart with Counter and Total */}
              <div className="flex items-center gap-1">
                <div className="relative group">
                  <Link href="/cart" className="relative">
                    <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                      <div className="relative">
                        <FiShoppingCart className="text-lg sm:text-xl" />
                        {/* Always show the counter badge */}
                        <span className={`absolute -top-1 -right-1 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-semibold ${
                          cartCount > 0 ? 'bg-blue-500' : 'bg-gray-400'
                        }`}>
                          {cartCount}
                        </span>
                      </div>
                      {/* Show total on larger screens */}
                      <span className="hidden sm:block text-sm font-medium text-gray-600">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                  </Link>

                  {/* Professional Cart Popup */}
                  {cartCount > 0 && (
                    <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-base sm:text-lg">سلة التسوق</h3>
                          <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                            {cartCount} منتج
                          </span>
                        </div>
                      </div>

                      {/* Cart Items */}
                      <div className="max-h-48 sm:max-h-64 overflow-y-auto p-3 sm:p-4">
                        <div className="space-y-2 sm:space-y-3">
                          {/* Sample cart items - you can replace this with actual cart data */}
                          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 text-base sm:text-lg font-bold">W</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate">Adobe Photoshop</h4>
                              <p className="text-gray-500 text-xs">الكمية: 1</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-blue-600 text-xs sm:text-sm">$29.99</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-green-600 text-base sm:text-lg font-bold">P</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate">Premiere Pro</h4>
                              <p className="text-gray-500 text-xs">الكمية: 1</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600 text-xs sm:text-sm">$24.99</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer with Total */}
                      <div className="border-t border-gray-100 p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <span className="text-gray-600 font-medium text-sm sm:text-base">المجموع:</span>
                          <span className="text-xl sm:text-2xl font-bold text-blue-600">{formatPrice(cartTotal)}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link 
                            href="/cart"
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-medium text-center hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 text-sm sm:text-base"
                          >
                            عرض السلة
                          </Link>
                          <Link 
                            href="/checkout"
                            className="flex-1 bg-gray-900 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-medium text-center hover:bg-gray-800 transition-all transform hover:scale-105 text-sm sm:text-base"
                          >
                            إتمام الطلب
                          </Link>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
                    {user.user_metadata.full_name?.[0] || user.email[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block font-medium text-sm">
                    {user.user_metadata.full_name || 'المستخدم'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 w-40 sm:w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-3 sm:px-4 py-2 border-b border-gray-100">
                      <p className="text-xs sm:text-sm text-gray-600">مرحباً، {user.user_metadata.full_name || 'المستخدم'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiUser className="text-gray-400 w-4 h-4" />
                      <span className="text-sm">الملف الشخصي</span>
                    </Link>
                    
                    <Link
                      href="/orders"
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiShoppingCart className="text-gray-400 w-4 h-4" />
                      <span className="text-sm">طلباتي</span>
                    </Link>
                    
                    {user.role !== 'user' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiShield className="text-gray-400 w-4 h-4" />
                        <span className="text-sm">لوحة التحكم</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-right"
                    >
                      <FiLogOut className="text-red-400 w-4 h-4" />
                      <span className="text-sm">تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/auth/login"
                  className="px-2 sm:px-4 py-1.5 sm:py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/auth/register"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 text-sm"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMobileMenuOpen ? <FiX className="text-lg sm:text-xl" /> : <FiMenu className="text-lg sm:text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 py-4">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        if (e.target.value.trim()) {
                          handleGlobalSearch(e.target.value)
                        } else {
                          setShowSearchResults(false)
                        }
                      }}
                      placeholder="ابحث عن المنتجات..."
                      className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  </div>
                </form>

                {/* Mobile Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <div
                        key={`${result.type}-${result.id || index}`}
                        onClick={() => handleSearchResultClick(result)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        {result.type === 'product' && (
                          <>
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              {result.image_url ? (
                                <img
                                  src={result.image_url}
                                  alt={result.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <span className="text-gray-400 text-lg">📦</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{result.name}</p>
                              <p className="text-xs text-gray-500 truncate">{result.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-blue-600">
                                {formatPrice(result.price)}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    <div className="p-3 bg-gray-50 border-t border-gray-200">
                      <button
                        onClick={() => {
                          router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
                          setShowSearchResults(false)
                        }}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        عرض جميع النتائج
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                <Link
                  href="/products"
                  className="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  المنتجات
                </Link>
                <Link
                  href="/categories"
                  className="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  الفئات
                </Link>
                <Link
                  href="/deals"
                  className="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  العروض
                </Link>
                <Link
                  href="/support"
                  className="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  الدعم
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
