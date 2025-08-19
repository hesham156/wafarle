import { supabase } from './supabase'

export interface CartItem {
  id: string
  product_id: string
  user_id?: string
  quantity: number
  product: {
    id: string
    name: string
    description: string
    price: number
    original_price?: number
    image_url: string
    category: string
  }
}

export interface Product {
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

// دالة لإرسال حدث تحديث السلة
function dispatchCartUpdateEvent() {
  if (typeof window !== 'undefined') {
    try {
      console.log('📡 Dispatching cartUpdated event...')
      const event = new CustomEvent('cartUpdated', {
        detail: { timestamp: Date.now() }
      })
      window.dispatchEvent(event)
      console.log('✅ cartUpdated event dispatched successfully')
    } catch (error) {
      console.error('❌ Error dispatching cartUpdated event:', error)
    }
  }
}

// إضافة منتج إلى السلة
export async function addToCart(product: Product, quantity: number = 1) {
  try {
    console.log('🚀 addToCart called with:', { product: product.name, quantity })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('❌ Auth error:', authError)
      throw authError
    }
    
    console.log('👤 User status:', user ? 'Logged in' : 'Guest')
    
    if (!user) {
      // مستخدم غير مسجل - استخدم localStorage
      console.log('📱 Using localStorage for guest user')
      return addToLocalCart(product, quantity)
    } else {
      // مستخدم مسجل - استخدم قاعدة البيانات
      console.log('🗄️ Using database for logged in user:', user.id)
      return addToDatabaseCart(product, quantity, user.id)
    }
  } catch (error) {
    console.error('❌ Error in addToCart:', error)
    throw error
  }
}

// إضافة إلى localStorage للمستخدمين غير المسجلين
function addToLocalCart(product: Product, quantity: number) {
  try {
    console.log('📱 addToLocalCart started for:', product.name)
    
    const existingCart = localStorage.getItem('wafarle_cart')
    console.log('📋 Existing cart data:', existingCart)
    
    const cart = existingCart ? JSON.parse(existingCart) : { items: [] }
    console.log('🔍 Parsed cart structure:', cart)
    
    // البحث عن المنتج في السلة
    const existingItemIndex = cart.items.findIndex((item: CartItem) => item.product_id === product.id)
    console.log('🔍 Existing item index:', existingItemIndex)
    
    if (existingItemIndex >= 0) {
      // تحديث الكمية إذا كان المنتج موجود
      console.log('📝 Updating existing item quantity')
      cart.items[existingItemIndex].quantity += quantity
    } else {
      // إضافة منتج جديد
      console.log('➕ Adding new item to cart')
      const newItem: CartItem = {
        id: `local_${Date.now()}_${Math.random()}`,
        product_id: product.id,
        quantity,
        product
      }
      cart.items.push(newItem)
    }
    
    console.log('💾 Final cart structure:', cart)
    localStorage.setItem('wafarle_cart', JSON.stringify(cart))
    console.log('✅ Cart saved to localStorage')
    
    // إرسال حدث تحديث السلة
    console.log('📡 About to dispatch cartUpdated event...')
    dispatchCartUpdateEvent()
    
    return { success: true, message: 'تم إضافة المنتج إلى السلة' }
  } catch (error) {
    console.error('❌ Error in addToLocalCart:', error)
    throw error
  }
}

// إضافة إلى قاعدة البيانات للمستخدمين المسجلين
async function addToDatabaseCart(product: Product, quantity: number, userId: string) {
  try {
    // التحقق من وجود المنتج في السلة
    const { data: existingItem } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', product.id)
      .single()

    if (existingItem) {
      // تحديث الكمية إذا كان المنتج موجود
      const { error } = await supabase
        .from('cart')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)

      if (error) throw error
    } else {
      // إضافة منتج جديد
      const { error } = await supabase
        .from('cart')
        .insert({
          user_id: userId,
          product_id: product.id,
          quantity
        })

      if (error) throw error
    }

    // إرسال حدث تحديث السلة
    dispatchCartUpdateEvent()

    return { success: true, message: 'تم إضافة المنتج إلى السلة' }
  } catch (error) {
    console.error('Error adding to database cart:', error)
    throw error
  }
}

// جلب عناصر السلة
export async function getCartItems(): Promise<CartItem[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // مستخدم غير مسجل - استخدم localStorage
      const localCart = localStorage.getItem('wafarle_cart')
      const cart = localCart ? JSON.parse(localCart) : { items: [] }
      return cart.items || []
    } else {
      // مستخدم مسجل - استخدم قاعدة البيانات
      const { data, error } = await supabase
        .from('cart')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id)

      if (error) throw error
      return data || []
    }
  } catch (error) {
    console.error('Error fetching cart items:', error)
    return []
  }
}

// تحديث كمية منتج في السلة
export async function updateCartItemQuantity(itemId: string, newQuantity: number) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // تحديث localStorage
      const localCart = localStorage.getItem('wafarle_cart')
      if (localCart) {
        const cart = JSON.parse(localCart)
        const updatedItems = cart.items.map((item: CartItem) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
        cart.items = updatedItems
        localStorage.setItem('wafarle_cart', JSON.stringify(cart))
        
        // إرسال حدث تحديث السلة
        dispatchCartUpdateEvent()
      }
      return { success: true }
    } else {
      // تحديث قاعدة البيانات
      const { error } = await supabase
        .from('cart')
        .update({ quantity: newQuantity })
        .eq('id', itemId)

      if (error) throw error
      
      // إرسال حدث تحديث السلة
      dispatchCartUpdateEvent()
      
      return { success: true }
    }
  } catch (error) {
    console.error('Error updating cart item quantity:', error)
    throw error
  }
}

// حذف منتج من السلة
export async function removeFromCart(itemId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // حذف من localStorage
      const localCart = localStorage.getItem('wafarle_cart')
      if (localCart) {
        const cart = JSON.parse(localCart)
        const updatedItems = cart.items.filter((item: CartItem) => item.id !== itemId)
        cart.items = updatedItems
        localStorage.setItem('wafarle_cart', JSON.stringify(cart))
        
        // إرسال حدث تحديث السلة
        dispatchCartUpdateEvent()
      }
      return { success: true }
    } else {
      // حذف من قاعدة البيانات
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      
      // إرسال حدث تحديث السلة
      dispatchCartUpdateEvent()
      
      return { success: true }
    }
  } catch (error) {
    console.error('Error removing from cart:', error)
    throw error
  }
}

// مسح السلة
export async function clearCart() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // مسح localStorage
      localStorage.removeItem('wafarle_cart')
      
      // إرسال حدث تحديث السلة
      dispatchCartUpdateEvent()
      
      return { success: true }
    } else {
      // مسح قاعدة البيانات
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
      
      // إرسال حدث تحديث السلة
      dispatchCartUpdateEvent()
      
      return { success: true }
    }
  } catch (error) {
    console.error('Error clearing cart:', error)
    throw error
  }
}

// حساب إجمالي السلة
export function calculateCartTotal(cartItems: CartItem[]) {
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.product.price * item.quantity)
  }, 0)

  // يمكن إضافة الضرائب والخصومات هنا
  const tax = subtotal * 0.15 // 15% ضريبة
  const total = subtotal + tax

  return {
    subtotal,
    tax,
    total
  }
}
