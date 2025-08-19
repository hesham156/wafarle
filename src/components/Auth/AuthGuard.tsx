'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, isAuthenticated } from '@/lib/auth-utils'
import { UserWithRole, UserRole } from '@/types/roles'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredRole?: UserRole
  redirectTo?: string
}

export default function AuthGuard({ 
  children, 
  requireAuth = false, 
  requiredRole,
  redirectTo = '/auth/login' 
}: AuthGuardProps) {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If no auth required, allow access
        if (!requireAuth) {
          setHasAccess(true)
          setLoading(false)
          return
        }

        // Check if user is authenticated
        const isAuth = await isAuthenticated()
        
        if (!isAuth) {
          router.push(redirectTo)
          return
        }

        // Get user details if role check is needed
        if (requiredRole) {
          const currentUser = await getCurrentUser()
          
          if (!currentUser) {
            router.push(redirectTo)
            return
          }

          setUser(currentUser)

          // Check if user has required role
          const roleHierarchy = {
            [UserRole.USER]: 1,
            [UserRole.ADMIN]: 2,
            [UserRole.SUPER_ADMIN]: 3
          }

          const userLevel = roleHierarchy[currentUser.role] || 0
          const requiredLevel = roleHierarchy[requiredRole] || 0

          if (userLevel < requiredLevel) {
            router.push('/') // Redirect to home if insufficient permissions
            return
          }
        }

        setHasAccess(true)
      } catch (error) {
        console.error('Auth guard error:', error)
        router.push(redirectTo)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [requireAuth, requiredRole, redirectTo, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">غير مصرح لك</h3>
          <p className="text-red-600">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
