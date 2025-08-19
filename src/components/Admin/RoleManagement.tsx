'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { UserRole, ROLES, UserWithRole, hasPermission, hasHigherRole } from '@/types/roles'
import { FiUsers, FiShield, FiEdit2, FiTrash2, FiPlus, FiSearch, FiFilter, FiRefreshCw, FiEye, FiMail, FiCalendar, FiUserCheck, FiX } from 'react-icons/fi'

interface RoleManagementProps {
  currentUser: UserWithRole
}

interface UserStats {
  total: number
  byRole: Record<UserRole, number>
  active: number
  inactive: number
}

export default function RoleManagement({ currentUser }: RoleManagementProps) {
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [showInactive, setShowInactive] = useState(true)
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    byRole: {
      [UserRole.USER]: 0,
      [UserRole.ADMIN]: 0,
      [UserRole.SUPER_ADMIN]: 0
    },
    active: 0,
    inactive: 0
  })

  // Move useEffect hooks to the top before any conditional returns
  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, showInactive])

  // Check permissions after hooks
  if (!hasPermission(currentUser.role, 'manage_users')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">غير مصرح لك</h3>
          <p className="text-red-600">ليس لديك صلاحية لإدارة المستخدمين</p>
        </div>
      </div>
    )
  }

  async function fetchUsers() {
    try {
      setLoading(true)
      setError('')
      
      // محاولة جلب المستخدمين من جدول profiles أولاً
      console.log('Fetching users from profiles table...')
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      console.log('Profiles query result:', { profiles, profilesError })
      
      // التحقق من وجود خطأ في الاستعلام
      if (profilesError) {
        try {
          console.error('Error fetching from profiles:', {
            code: profilesError.code || 'unknown',
            message: profilesError.message || 'unknown',
            details: profilesError.details || 'none',
            hint: profilesError.hint || 'none'
          })
        } catch (consoleErr) {
          console.error('Error logging error:', consoleErr)
        }
        
        // إذا كان الخطأ 500، فهذا يعني مشكلة في الجدول
        if (profilesError.code === '500' || profilesError.message?.includes('500')) {
          setError('خطأ في الوصول لجدول profiles. يرجى إنشاء الجدول أولاً.')
        } else if (profilesError.code === '42P17') {
          setError('مشكلة في سياسات RLS. يرجى تشغيل FIX_RECURSION_ERROR.sql في Supabase.')
        } else {
          setError(`خطأ في جلب المستخدمين: ${profilesError.message || 'خطأ غير معروف'}`)
        }
        
        // استخدام المستخدم الحالي فقط
        const currentUserFormatted: UserWithRole = {
          id: currentUser.id,
          email: currentUser.email,
          created_at: currentUser.created_at,
          user_metadata: currentUser.user_metadata,
          role: currentUser.role,
          is_active: true
        }
        setUsers([currentUserFormatted])
        calculateUserStats([currentUserFormatted])
        return
      }
      
      if (profiles && profiles.length > 0) {
        // إذا كان جدول profiles موجود ويحتوي على بيانات
        console.log('Found profiles table with data:', profiles.length, 'users')
        const formattedUsers: UserWithRole[] = profiles.map(profile => ({
          id: profile.id,
          email: profile.email || '',
          created_at: profile.created_at,
          user_metadata: profile.user_metadata || {},
          role: (profile.role as UserRole) || UserRole.USER,
          is_active: profile.is_active !== false
        }))
        setUsers(formattedUsers)
        calculateUserStats(formattedUsers)
        setError('') // مسح أي رسائل خطأ سابقة
        return
      }
      
      // إذا كان جدول profiles موجود لكن فارغ
      if (profiles && profiles.length === 0) {
        console.log('Profiles table exists but empty')
        setError('جدول profiles موجود لكن فارغ. يرجى تشغيل SQL في Supabase أولاً.')
        
        // استخدام المستخدم الحالي فقط
        const currentUserFormatted: UserWithRole = {
          id: currentUser.id,
          email: currentUser.email,
          created_at: currentUser.created_at,
          user_metadata: currentUser.user_metadata,
          role: currentUser.role,
          is_active: true
        }
        setUsers([currentUserFormatted])
        calculateUserStats([currentUserFormatted])
        return
      }
      
      // إذا لم يكن جدول profiles موجود
      console.log('Profiles table not found')
      setError('جدول profiles غير موجود. يرجى إنشاؤه أولاً.')
      
      // استخدام المستخدم الحالي فقط
      const currentUserFormatted: UserWithRole = {
        id: currentUser.id,
        email: currentUser.email,
        created_at: currentUser.created_at,
        user_metadata: currentUser.user_metadata,
        role: currentUser.role,
        is_active: true
      }
      setUsers([currentUserFormatted])
      calculateUserStats([currentUserFormatted])
      
         } catch (err) {
       try {
         console.error('Error fetching users:', {
           message: err instanceof Error ? err.message : 'Unknown error',
           stack: err instanceof Error ? err.stack : 'No stack trace',
           error: err
         })
       } catch (consoleErr) {
         console.error('Error logging error:', consoleErr)
       }
       
       // في حالة الخطأ، استخدم المستخدم الحالي فقط
       const currentUserFormatted: UserWithRole = {
         id: currentUser.id,
         email: currentUser.email,
         created_at: currentUser.created_at,
         user_metadata: currentUser.user_metadata,
         role: currentUser.role,
         is_active: true
       }
       setUsers([currentUserFormatted])
       calculateUserStats([currentUserFormatted])
       setError('حدث خطأ في جلب المستخدمين. يرجى المحاولة مرة أخرى.')
     } finally {
      setLoading(false)
    }
  }

  function calculateUserStats(users: UserWithRole[]) {
    const stats: UserStats = {
      total: users.length,
      byRole: {
        [UserRole.USER]: 0,
        [UserRole.ADMIN]: 0,
        [UserRole.SUPER_ADMIN]: 0
      },
      active: 0,
      inactive: 0
    }

    users.forEach(user => {
      stats.byRole[user.role]++
      if (user.is_active) {
        stats.active++
      } else {
        stats.inactive++
      }
    })

    setUserStats(stats)
  }

  function filterUsers() {
    let filtered = users

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.user_metadata.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // فلترة حسب الدور
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // فلترة حسب الحالة
    if (!showInactive) {
      filtered = filtered.filter(user => user.is_active)
    }

    setFilteredUsers(filtered)
  }

  async function updateUserRole(userId: string, newRole: UserRole) {
    try {
      setError('')
      setMessage('')
      setUpdating(userId)

      // التحقق من أن المستخدم الحالي يمكنه تعديل هذا الدور
      if (!hasHigherRole(currentUser.role, newRole)) {
        setError('لا يمكنك منح دور أعلى من دورك الحالي')
        return
      }

      // التحقق من أن المستخدم لا يحاول تعديل دوره
      if (userId === currentUser.id) {
        setError('لا يمكنك تعديل دورك الحالي')
        return
      }

      // تحديث دور المستخدم في جدول profiles
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user role:', error)
        setError(`حدث خطأ في تحديث الدور: ${error.message}`)
        return
      }

      setMessage('تم تحديث دور المستخدم بنجاح')
      
      // تحديث القائمة المحلية
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, role: newRole }
            : user
        )
      )
      
      // إعادة حساب الإحصائيات
      setTimeout(() => {
        calculateUserStats(users)
      }, 100)
      
    } catch (err) {
      console.error('Error updating user role:', err)
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحديث الدور')
    } finally {
      setUpdating(null)
    }
  }

  async function toggleUserStatus(userId: string, currentStatus: boolean) {
    try {
      setError('')
      setMessage('')
      setUpdating(userId)

      // التحقق من أن المستخدم لا يحاول تعديل حالته
      if (userId === currentUser.id) {
        setError('لا يمكنك تعديل حالتك الحالية')
        return
      }

      const newStatus = !currentStatus

      // تحديث حالة المستخدم في جدول profiles
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: newStatus })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user status:', error)
        setError(`حدث خطأ في تحديث حالة المستخدم: ${error.message}`)
        return
      }

      setMessage(`تم ${newStatus ? 'تفعيل' : 'إيقاف'} المستخدم بنجاح`)
      
      // تحديث القائمة المحلية
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, is_active: newStatus }
            : user
        )
      )
      
    } catch (err) {
      console.error('Error updating user status:', err)
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحديث حالة المستخدم')
    } finally {
      setUpdating(null)
    }
  }

  function clearMessages() {
    setError('')
    setMessage('')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mr-3 text-gray-600">جاري تحميل المستخدمين...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FiUsers className="text-blue-500 text-2xl" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">إدارة المستخدمين والأدوار</h2>
            <p className="text-gray-600">إدارة صلاحيات المستخدمين وأدوارهم في النظام</p>
          </div>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          تحديث
        </button>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold">{userStats.total}</p>
            </div>
            <FiUsers className="text-3xl text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">المستخدمين النشطين</p>
              <p className="text-2xl font-bold">{userStats.active}</p>
            </div>
            <FiUserCheck className="text-3xl text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">المديرين</p>
              <p className="text-2xl font-bold">{userStats.byRole[UserRole.ADMIN] + userStats.byRole[UserRole.SUPER_ADMIN]}</p>
            </div>
            <FiShield className="text-3xl text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">المستخدمين العاديين</p>
              <p className="text-2xl font-bold">{userStats.byRole[UserRole.USER]}</p>
            </div>
            <FiUsers className="text-3xl text-orange-200" />
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            {message}
          </div>
          <button onClick={clearMessages} className="text-green-600 hover:text-green-800">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <strong>خطأ:</strong> {error}
          </div>
          
                     {error.includes('جدول profiles موجود لكن فارغ') && (
             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
               <h4 className="font-semibold mb-2">🔧 خطوات الحل:</h4>
               <ol className="list-decimal list-inside space-y-1 text-sm">
                 <li>اذهب إلى <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Supabase Dashboard</a></li>
                 <li>اختر مشروعك: <code className="bg-blue-100 px-1 rounded">tpvnaizaiyyajuxfwqqa</code></li>
                 <li>اذهب إلى <strong>SQL Editor</strong></li>
                 <li>انسخ محتوى ملف <code className="bg-blue-100 px-1 rounded">FIX_EXISTING_PROFILES_V2.sql</code></li>
                 <li>الصق الكود واضغط <strong>Run</strong></li>
                 <li>عد إلى هذه الصفحة واضغط زر <strong>تحديث</strong></li>
               </ol>
             </div>
           )}
           
           {error.includes('مشكلة في سياسات RLS') && (
             <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-orange-800">
               <h4 className="font-semibold mb-2">🔧 خطوات الحل:</h4>
               <ol className="list-decimal list-inside space-y-1 text-sm">
                 <li>اذهب إلى <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:text-orange-600">Supabase Dashboard</a></li>
                 <li>اختر مشروعك: <code className="bg-orange-100 px-1 rounded">tpvnaizaiyyajuxfwqqa</code></li>
                 <li>اذهب إلى <strong>SQL Editor</strong></li>
                 <li>انسخ محتوى ملف <code className="bg-orange-100 px-1 rounded">FIX_RECURSION_ERROR.sql</code></li>
                 <li>الصق الكود واضغط <strong>Run</strong></li>
                 <li>عد إلى هذه الصفحة واضغط زر <strong>تحديث</strong></li>
               </ol>
             </div>
           )}
          
          <button onClick={clearMessages} className="mt-3 text-red-600 hover:text-red-800 text-sm">
            ✕ إغلاق
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في المستخدمين..."
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

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الأدوار</option>
              <option value={UserRole.USER}>مستخدم</option>
              <option value={UserRole.ADMIN}>مدير</option>
              <option value={UserRole.SUPER_ADMIN}>مدير عام</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={showInactive ? 'all' : 'active'}
              onChange={(e) => setShowInactive(e.target.value === 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط فقط</option>
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">الأحدث</option>
              <option value="oldest">الأقدم</option>
              <option value="name">الاسم</option>
              <option value="email">البريد الإلكتروني</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div>
            <button
              onClick={() => {
                setSearchTerm('')
                setRoleFilter('all')
                setShowInactive(true)
              }}
              className="w-full px-4 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              مسح الفلاتر
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">قائمة المستخدمين</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">المستخدم</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">البريد الإلكتروني</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">الدور الحالي</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">الحالة</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">تاريخ التسجيل</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    لا توجد نتائج للبحث
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleInfo = ROLES[user.role]
                  const isCurrentUser = user.id === currentUser.id
                  const canEdit = !isCurrentUser && hasHigherRole(currentUser.role, user.role)
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                            user.is_active ? 'bg-blue-500' : 'bg-gray-400'
                          }`}>
                            {user.user_metadata.full_name?.[0] || user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              {user.user_metadata.full_name || 'مستخدم'}
                              {isCurrentUser && <span className="text-blue-600 text-sm mr-2">(أنت)</span>}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <FiMail className="text-gray-400" />
                          <span className="text-gray-700">{user.email}</span>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <span className={`${roleInfo.color} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                          {roleInfo.displayName}
                        </span>
                      </td>
                      
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                          disabled={isCurrentUser || updating === user.id}
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                            user.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          } ${isCurrentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {updating === user.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          ) : (
                            <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          )}
                          {user.is_active ? 'نشط' : 'متوقف'}
                        </button>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiCalendar className="text-gray-400" />
                          {new Date(user.created_at).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        {canEdit ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                              disabled={updating === user.id}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                              {Object.values(UserRole).map((role) => {
                                const canAssign = hasHigherRole(currentUser.role, role)
                                return (
                                  <option key={role} value={role} disabled={!canAssign}>
                                    {ROLES[role].displayName}
                                    {!canAssign && ' (غير مصرح)'}
                                  </option>
                                )
                              })}
                            </select>
                            
                            {updating === user.id && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            {isCurrentUser ? 'لا يمكن التعديل' : 'غير مصرح'}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">معلومات الأدوار والصلاحيات</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(UserRole).map((role) => {
            const roleInfo = ROLES[role]
            const userCount = userStats.byRole[role]
            
            return (
              <div key={role} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className={`${roleInfo.color} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                    {roleInfo.displayName}
                  </span>
                  <span className="text-sm text-gray-500">{userCount} مستخدم</span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{roleInfo.description}</p>
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-700 text-sm mb-2">الصلاحيات:</h4>
                  {roleInfo.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      {permission === 'all' ? 'جميع الصلاحيات' : permission}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
