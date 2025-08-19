import { supabase } from './supabase'
import { UserWithRole, UserRole } from '@/types/roles'

/**
 * Safely get the current user session without throwing errors
 */
export async function getCurrentUser(): Promise<UserWithRole | null> {
  try {
    // First check if we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.warn('Session check error:', sessionError.message)
      return null
    }

    if (!session) {
      console.log('No active session found')
      return null
    }

    // Now get the user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.warn('User fetch error:', userError.message)
      return null
    }

    if (!user) {
      console.log('No user found in session')
      return null
    }

    // Convert to UserWithRole format
    const userRole = (user.user_metadata?.role as UserRole) || UserRole.USER
    const userWithRole: UserWithRole = {
      id: user.id,
      email: user.email || '',
      role: userRole,
      user_metadata: user.user_metadata || {},
      created_at: user.created_at || new Date().toISOString(),
      is_active: true
    }

    console.log('✅ User retrieved successfully:', userWithRole.email)
    return userWithRole
  } catch (error) {
    console.warn('❌ Error getting current user:', error)
    return null
  }
}

/**
 * Check if user is authenticated without throwing errors
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      if (error.message.includes('Auth session missing')) {
        console.log('ℹ️ No active auth session - user not logged in')
        return false
      }
      console.warn('Session check error:', error.message)
      return false
    }

    return !!session
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('Auth session missing')) {
      console.log('ℹ️ No active auth session - user not logged in')
      return false
    }
    console.warn('Error checking authentication:', error)
    return false
  }
}

/**
 * Get current session safely
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.warn('Session retrieval error:', error.message)
      return null
    }

    return session
  } catch (error) {
    console.warn('Error getting session:', error)
    return null
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: UserWithRole | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const userRole = (session.user.user_metadata?.role as UserRole) || UserRole.USER
      const userWithRole: UserWithRole = {
        id: session.user.id,
        email: session.user.email || '',
        role: userRole,
        user_metadata: session.user.user_metadata || {},
        created_at: session.user.created_at || new Date().toISOString(),
        is_active: true
      }
      callback(userWithRole)
    } else {
      callback(null)
    }
  })
}
