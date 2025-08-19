'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FcGoogle } from 'react-icons/fc'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      setMessage('تم تسجيل الدخول بنجاح!')
      
      // إعادة توجيه المستخدم إلى الملف الشخصي
      setTimeout(() => {
        router.push('/profile')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      setMessage('جاري التوجيه إلى Google...')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تسجيل الدخول بـ Google')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiLock className="text-white text-3xl" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          مرحباً بعودتك
        </h2>
        <p className="text-gray-600">سجل دخولك للوصول إلى حسابك</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="أدخل بريدك الإلكتروني"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            كلمة المرور
          </label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="أدخل كلمة المرور"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition-all transform hover:scale-105 disabled:scale-100 shadow-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              جاري تسجيل الدخول...
            </div>
          ) : (
            'تسجيل الدخول'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-sm text-gray-500 bg-white">أو</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Google Login */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3"
      >
        <FcGoogle className="text-2xl" />
        تسجيل الدخول بـ Google
      </button>

      {/* Messages */}
      {message && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl text-green-800 flex items-center gap-2">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          {message}
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl text-red-800 flex items-center gap-2">
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div>
            <strong>خطأ:</strong> {error}
          </div>
        </div>
      )}

      {/* Footer Links */}
      <div className="mt-8 space-y-4">
        <div className="text-center">
          <a 
            href="/auth/forgot-password" 
            className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
          >
            نسيت كلمة المرور؟
          </a>
        </div>
        
        <div className="text-center text-gray-600">
          ليس لديك حساب؟{' '}
          <a 
            href="/auth/register" 
            className="text-blue-500 hover:text-blue-600 font-semibold transition-colors"
          >
            إنشاء حساب جديد
          </a>
        </div>
      </div>
    </div>
  )
}
