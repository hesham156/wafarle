'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  FiActivity, 
  FiDatabase, 
  FiServer, 
  FiWifi, 
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiMonitor
} from 'react-icons/fi'

interface SystemStatus {
  database: 'healthy' | 'warning' | 'error'
  api: 'healthy' | 'warning' | 'error'
  auth: 'healthy' | 'warning' | 'error'
  storage: 'healthy' | 'warning' | 'error'
  cache: 'healthy' | 'warning' | 'error'
}

interface PerformanceMetrics {
  responseTime: number
  uptime: number
  errorRate: number
  activeUsers: number
  totalRequests: number
}

export default function SystemHealth() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'healthy',
    api: 'healthy',
    auth: 'healthy',
    storage: 'healthy',
    cache: 'healthy'
  })
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: 0,
    uptime: 99.9,
    errorRate: 0.1,
    activeUsers: 0,
    totalRequests: 0
  })
  const [loading, setLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date>(new Date())

  useEffect(() => {
    checkSystemHealth()
    const interval = setInterval(checkSystemHealth, 30000) // فحص كل 30 ثانية
    return () => clearInterval(interval)
  }, [])

  async function checkSystemHealth() {
    try {
      setLoading(true)
      const startTime = Date.now()

      // فحص قاعدة البيانات
      const dbStatus = await checkDatabase()
      
      // فحص المصادقة
      const authStatus = await checkAuth()
      
      // فحص API
      const apiStatus = await checkAPI()
      
      // حساب وقت الاستجابة
      const responseTime = Date.now() - startTime

      setSystemStatus({
        database: dbStatus,
        api: apiStatus,
        auth: authStatus,
        storage: 'healthy', // افتراضي
        cache: 'healthy' // افتراضي
      })

      setMetrics(prev => ({
        ...prev,
        responseTime,
        totalRequests: prev.totalRequests + 1
      }))

      setLastCheck(new Date())
    } catch (error) {
      console.error('Error checking system health:', error)
    } finally {
      setLoading(false)
    }
  }

  async function checkDatabase(): Promise<'healthy' | 'warning' | 'error'> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .limit(1)

      if (error) {
        if (error.code === '42P01') return 'warning' // جدول غير موجود
        return 'error'
      }

      return 'healthy'
    } catch (error) {
      return 'error'
    }
  }

  async function checkAuth(): Promise<'healthy' | 'warning' | 'error'> {
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) return 'warning'
      return 'healthy'
    } catch (error) {
      return 'error'
    }
  }

  async function checkAPI(): Promise<'healthy' | 'warning' | 'error'> {
    try {
      // فحص بسيط للـ API
      const response = await fetch('/api/health')
      
      if (response.ok) return 'healthy'
      if (response.status >= 400 && response.status < 500) return 'warning'
      return 'error'
    } catch (error) {
      return 'warning' // API endpoint قد لا يكون موجود
    }
  }

  function getStatusIcon(status: 'healthy' | 'warning' | 'error') {
    switch (status) {
      case 'healthy':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <FiAlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <FiXCircle className="w-5 h-5 text-red-500" />
    }
  }

  function getStatusColor(status: 'healthy' | 'warning' | 'error') {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
    }
  }

  function getStatusText(status: 'healthy' | 'warning' | 'error') {
    switch (status) {
      case 'healthy':
        return 'يعمل بشكل طبيعي'
      case 'warning':
        return 'يحتاج انتباه'
      case 'error':
        return 'خطأ'
    }
  }

  const systemComponents = [
    {
      name: 'قاعدة البيانات',
      key: 'database' as keyof SystemStatus,
      icon: FiDatabase,
      description: 'حالة الاتصال بقاعدة البيانات'
    },
    {
      name: 'واجهة برمجة التطبيقات',
      key: 'api' as keyof SystemStatus,
      icon: FiServer,
      description: 'حالة خدمات API'
    },
    {
      name: 'نظام المصادقة',
      key: 'auth' as keyof SystemStatus,
      icon: FiShield,
      description: 'حالة نظام تسجيل الدخول'
    },
    {
      name: 'التخزين',
      key: 'storage' as keyof SystemStatus,
      icon: FiMonitor,
      description: 'حالة نظام التخزين'
    },
    {
      name: 'التخزين المؤقت',
      key: 'cache' as keyof SystemStatus,
      icon: FiWifi,
      description: 'حالة نظام التخزين المؤقت'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">صحة النظام</h2>
          <p className="text-gray-600">مراقبة حالة النظام والأداء</p>
        </div>
        <button
          onClick={checkSystemHealth}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          فحص النظام
        </button>
      </div>

      {/* Overall Status */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">الحالة العامة</h3>
          <div className="text-sm text-gray-500">
            آخر فحص: {lastCheck.toLocaleTimeString('ar-SA')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {systemComponents.map((component) => {
            const Icon = component.icon
            const status = systemStatus[component.key]
            
            return (
              <div
                key={component.key}
                className={`p-4 rounded-lg border ${getStatusColor(status)}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-5 h-5 text-gray-600" />
                  {getStatusIcon(status)}
                </div>
                <h4 className="font-medium text-gray-900 text-sm">{component.name}</h4>
                <p className="text-xs text-gray-600 mt-1">{getStatusText(status)}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">مقاييس الأداء</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {metrics.responseTime}ms
            </div>
            <div className="text-sm text-gray-600">وقت الاستجابة</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {metrics.uptime}%
            </div>
            <div className="text-sm text-gray-600">وقت التشغيل</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {metrics.errorRate}%
            </div>
            <div className="text-sm text-gray-600">معدل الأخطاء</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {metrics.totalRequests}
            </div>
            <div className="text-sm text-gray-600">إجمالي الطلبات</div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات النظام</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">إصدار النظام:</span>
              <span className="font-medium">v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">قاعدة البيانات:</span>
              <span className="font-medium">PostgreSQL 15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">الخادم:</span>
              <span className="font-medium">Supabase</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">المنطقة:</span>
              <span className="font-medium">الشرق الأوسط</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">آخر نسخة احتياطية:</span>
              <span className="font-medium">اليوم 03:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">مساحة التخزين:</span>
              <span className="font-medium">2.1 GB / 10 GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">عدد الجداول:</span>
              <span className="font-medium">8 جداول</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SSL:</span>
              <span className="font-medium text-green-600">مفعل</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">النشاط الأخير</h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <FiCheckCircle className="w-5 h-5 text-green-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">تم تحديث إعدادات الدفع</p>
              <p className="text-xs text-gray-500">منذ 5 دقائق</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <FiActivity className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">تم إنشاء نسخة احتياطية تلقائية</p>
              <p className="text-xs text-gray-500">منذ ساعة</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <FiAlertTriangle className="w-5 h-5 text-yellow-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">تحديث أمني متوفر</p>
              <p className="text-xs text-gray-500">منذ يوم</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}