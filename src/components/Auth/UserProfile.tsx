'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserRole, ROLES, UserWithRole } from '@/types/roles'
import { FiUser, FiMail, FiShield, FiSettings, FiLogOut, FiEdit2 } from 'react-icons/fi'

export default function UserProfile() {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { getCurrentUser } = await import('@/lib/auth-utils')
        
        const currentUser = await getCurrentUser()
        
        if (currentUser) {
          setUser(currentUser)
        } else {
          // لا يوجد مستخدم، إعادة توجيه إلى تسجيل الدخول
          router.push('/auth/login')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ في جلب بيانات المستخدم')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error

      // إعادة توجيه المستخدم إلى تسجيل الدخول
      router.push('/auth/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تسجيل الخروج')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">خطأ</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            العودة لتسجيل الدخول
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const roleInfo = ROLES[user.role]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-4xl font-bold">
                  {user.user_metadata.full_name?.[0] || user.email[0].toUpperCase()}
                </span>
              </div>
              {/* Role Badge */}
              <div className={`absolute -bottom-2 -right-2 ${roleInfo.color} text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg`}>
                {roleInfo.displayName}
              </div>
            </div>
            <div className="text-center md:text-right flex-1">
              <h1 className="text-4xl font-bold mb-2">
                {user.user_metadata.full_name || 'المستخدم'}
              </h1>
              <p className="text-white/90 text-lg mb-3">{user.email}</p>
              <p className="text-white/70 text-sm">{roleInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Account Information */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <FiUser className="text-blue-500 text-2xl" />
                <h2 className="text-xl font-semibold text-gray-800">معلومات الحساب</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <FiMail className="text-gray-400" />
                    <span className="text-gray-600">البريد الإلكتروني:</span>
                  </div>
                  <span className="text-gray-800 font-medium">{user.email}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <FiUser className="text-gray-400" />
                    <span className="text-gray-600">الاسم الكامل:</span>
                  </div>
                  <span className="text-gray-800 font-medium">
                    {user.user_metadata.full_name || 'غير محدد'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <FiShield className="text-gray-400" />
                    <span className="text-gray-600">الدور:</span>
                  </div>
                  <span className={`${roleInfo.color} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                    {roleInfo.displayName}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600">تاريخ الإنشاء:</span>
                  <span className="text-gray-800 font-medium">
                    {new Date(user.created_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <FiSettings className="text-purple-500 text-2xl" />
                <h2 className="text-xl font-semibold text-gray-800">إعدادات الحساب</h2>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/auth/reset-password')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FiEdit2 />
                  تغيير كلمة المرور
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FiLogOut />
                  تسجيل الخروج
                </button>
              </div>

              {/* Permissions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">الصلاحيات</h3>
                <div className="space-y-2">
                  {roleInfo.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {permission === 'all' ? 'جميع الصلاحيات' : permission}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <Link
              href="/"
              className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
            >
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
