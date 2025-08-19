// أنواع الأدوار في النظام
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user'
}

// معلومات الدور
export interface RoleInfo {
  name: string
  displayName: string
  description: string
  color: string
  permissions: string[]
}

// خريطة الأدوار
export const ROLES: Record<UserRole, RoleInfo> = {
  [UserRole.SUPER_ADMIN]: {
    name: 'super_admin',
    displayName: 'مدير عام',
    description: 'صلاحيات كاملة على النظام',
    color: 'bg-red-500',
    permissions: ['all']
  },
  [UserRole.ADMIN]: {
    name: 'admin',
    displayName: 'مدير',
    description: 'إدارة المستخدمين والمحتوى',
    color: 'bg-purple-500',
    permissions: ['manage_users', 'manage_content', 'view_analytics']
  },
  [UserRole.USER]: {
    name: 'user',
    displayName: 'مستخدم',
    description: 'صلاحيات أساسية',
    color: 'bg-blue-500',
    permissions: ['view_content', 'edit_profile']
  }
}

// واجهة المستخدم مع الدور
export interface UserWithRole {
  id: string
  email: string
  role: UserRole
  user_metadata: {
    full_name?: string
    avatar_url?: string
    role?: UserRole
  }
  created_at: string
  is_active: boolean
}

// دالة التحقق من الصلاحيات
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const role = ROLES[userRole]
  return role.permissions.includes('all') || role.permissions.includes(permission)
}

// دالة التحقق من دور أعلى
export function hasHigherRole(userRole: UserRole, targetRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.USER]: 1,
    [UserRole.ADMIN]: 2,
    [UserRole.SUPER_ADMIN]: 3
  }
  
  return roleHierarchy[userRole] > roleHierarchy[targetRole]
}
