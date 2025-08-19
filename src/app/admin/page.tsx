'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { UserWithRole, UserRole, hasPermission } from '@/types/roles'
import RoleManagement from '@/components/Admin/RoleManagement'
import ProductManagement from '@/components/Admin/ProductManagement'
import DashboardStats from '@/components/Admin/DashboardStats'
import { useRouter } from 'next/navigation'
import { FiShield, FiUsers, FiBarChart, FiSettings, FiPackage, FiHome, FiShoppingCart } from 'react-icons/fi'

export default function AdminPage() {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) throw error

        if (user) {
          const userRole = (user.user_metadata.role as UserRole) || UserRole.USER
          const userWithRole: UserWithRole = {
            id: user.id,
            email: user.email || '',
            role: userRole,
            user_metadata: user.user_metadata,
            created_at: user.created_at || new Date().toISOString(),
            is_active: true
          }
          
          // التحقق من صلاحية الوصول لصفحة الإدارة
          if (!hasPermission(userRole, 'manage_users')) {
            router.push('/')
            return
          }
          
          setUser(userWithRole)
        } else {
          router.push('/auth/login')
        }
      } catch (err) {
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const tabs = [
    { id: 'dashboard', name: 'الداشبورد', icon: FiHome },
    { id: 'users', name: 'إدارة المستخدمين', icon: FiUsers },
    { id: 'products', name: 'إدارة المنتجات', icon: FiPackage },
    { id: 'orders', name: 'إدارة الطلبات', icon: FiShoppingCart },
    { id: 'analytics', name: 'التحليلات', icon: FiBarChart },
    { id: 'settings', name: 'الإعدادات', icon: FiSettings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <FiShield className="text-blue-500 text-2xl" />
              <h1 className="text-xl font-semibold text-gray-800">لوحة التحكم الإدارية</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">مرحباً، {user.user_metadata.full_name || user.email}</span>
              <button
                onClick={() => router.push('/profile')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                الملف الشخصي
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-xl shadow-lg p-4">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="text-lg" />
                      {tab.name}
                    </button>
                  )
                })}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">مرحباً بك في لوحة التحكم</h2>
                  <p className="text-gray-600">نظرة عامة على إحصائيات المتجر</p>
                </div>
                <DashboardStats />
              </div>
            )}
            
            {activeTab === 'users' && <RoleManagement currentUser={user} />}
            
            {activeTab === 'products' && <ProductManagement />}
            
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center py-12">
                  <FiShoppingCart className="text-gray-400 text-6xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">إدارة الطلبات</h3>
                  <p className="text-gray-600 mb-6">إدارة جميع طلبات المستخدمين وتحديث حالاتها</p>
                  <a
                    href="/admin/orders"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    إدارة الطلبات
                  </a>
                </div>
              </div>
            )}
            
            {activeTab === 'analytics' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center py-12">
                  <FiBarChart className="text-gray-400 text-6xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">التحليلات</h3>
                  <p className="text-gray-600">قريباً... سيتم إضافة التحليلات والإحصائيات</p>
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center py-12">
                  <FiSettings className="text-gray-400 text-6xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">إعدادات النظام</h3>
                  <p className="text-gray-600">قريباً... سيتم إضافة إعدادات النظام</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
