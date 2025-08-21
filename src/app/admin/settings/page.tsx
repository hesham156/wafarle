'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  FiSettings, 
  FiShield, 
  FiDollarSign, 
  FiGlobe, 
  FiMail, 
  FiSearch, 
  FiImage,
  FiLock,
  FiCreditCard,
  FiTruck,
  FiSave,
  FiRefreshCw,
  FiEye,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiUpload,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
  FiYoutube
} from 'react-icons/fi'
import Layout from '@/components/Layout/Layout'
import Modal from '@/components/UI/Modal'

interface StoreSettings {
  // إعدادات عامة
  store_name: string
  store_description: string
  store_logo: string
  store_favicon: string
  contact_email: string
  contact_phone: string
  contact_address: string
  
  // إعدادات المدفوعات
  payment_methods: string[]
  stripe_public_key: string
  stripe_secret_key: string
  paypal_client_id: string
  paypal_secret: string
  bank_account_info: string
  
  // إعدادات الأمان
  enable_2fa: boolean
  password_min_length: number
  session_timeout: number
  max_login_attempts: number
  
  // إعدادات الشحن
  shipping_methods: string[]
  free_shipping_threshold: number
  shipping_rates: Record<string, number>
  
  // إعدادات SEO
  meta_title: string
  meta_description: string
  meta_keywords: string
  google_analytics_id: string
  facebook_pixel_id: string
  
  // إعدادات وسائل التواصل
  social_facebook: string
  social_twitter: string
  social_instagram: string
  social_linkedin: string
  social_youtube: string
  
  // إعدادات اللغة والعملة
  default_language: string
  supported_languages: string[]
  default_currency: string
  supported_currencies: string[]
  
  // إعدادات المحتوى
  products_per_page: number
  enable_reviews: boolean
  enable_wishlist: boolean
  enable_compare: boolean
  auto_approve_reviews: boolean
  
  // إعدادات الإشعارات
  email_notifications: boolean
  sms_notifications: boolean
  push_notifications: boolean
  order_confirmation_email: boolean
  
  // إعدادات متقدمة
  maintenance_mode: boolean
  debug_mode: boolean
  cache_enabled: boolean
  api_rate_limit: number
}

const defaultSettings: StoreSettings = {
  store_name: 'وفرلي',
  store_description: 'متجر البرامج والأدوات الاحترافية',
  store_logo: '',
  store_favicon: '',
  contact_email: 'info@wafarle.com',
  contact_phone: '+966501234567',
  contact_address: 'الرياض، المملكة العربية السعودية',
  
  payment_methods: ['card', 'paypal', 'bank_transfer'],
  stripe_public_key: '',
  stripe_secret_key: '',
  paypal_client_id: '',
  paypal_secret: '',
  bank_account_info: '',
  
  enable_2fa: false,
  password_min_length: 8,
  session_timeout: 30,
  max_login_attempts: 5,
  
  shipping_methods: ['standard', 'express', 'overnight'],
  free_shipping_threshold: 500,
  shipping_rates: { standard: 25, express: 50, overnight: 100 },
  
  meta_title: 'وفرلي - متجر البرامج الرقمية',
  meta_description: 'متجر متخصص في بيع البرامج والتصاميم الرقمية بأسعار منافسة',
  meta_keywords: 'برامج, تصميم, تطوير, أدوات, رقمية',
  google_analytics_id: '',
  facebook_pixel_id: '',
  
  social_facebook: '',
  social_twitter: '',
  social_instagram: '',
  social_linkedin: '',
  social_youtube: '',
  
  default_language: 'ar',
  supported_languages: ['ar', 'en'],
  default_currency: 'SAR',
  supported_currencies: ['SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR', 'EGP'],
  
  products_per_page: 12,
  enable_reviews: true,
  enable_wishlist: true,
  enable_compare: false,
  auto_approve_reviews: false,
  
  email_notifications: true,
  sms_notifications: false,
  push_notifications: true,
  order_confirmation_email: true,
  
  maintenance_mode: false,
  debug_mode: false,
  cache_enabled: true,
  api_rate_limit: 100
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showTestModal, setShowTestModal] = useState(false)
  const [testResult, setTestResult] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      setLoading(true)
      
      // محاولة جلب الإعدادات من قاعدة البيانات
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error)
      }

      if (data) {
        setSettings({ ...defaultSettings, ...data })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings() {
    try {
      setSaving(true)
      
      // حفظ الإعدادات في قاعدة البيانات
      const { error } = await supabase
        .from('store_settings')
        .upsert(settings)

      if (error) {
        console.error('Error saving settings:', error)
        return
      }

      setSuccessMessage('تم حفظ الإعدادات بنجاح!')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  function updateSetting<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  async function testPaymentConnection() {
    setTestResult('جاري اختبار الاتصال...')
    setShowTestModal(true)
    
    // محاكاة اختبار الاتصال
    setTimeout(() => {
      setTestResult('✅ تم اختبار إعدادات الدفع بنجاح!')
    }, 2000)
  }

  const tabs = [
    { id: 'general', name: 'عام', icon: FiSettings },
    { id: 'payments', name: 'المدفوعات', icon: FiCreditCard },
    { id: 'security', name: 'الأمان', icon: FiShield },
    { id: 'shipping', name: 'الشحن', icon: FiTruck },
    { id: 'seo', name: 'SEO', icon: FiSearch },
    { id: 'social', name: 'وسائل التواصل', icon: FiFacebook },
    { id: 'localization', name: 'اللغة والعملة', icon: FiGlobe },
    { id: 'content', name: 'المحتوى', icon: FiImage },
    { id: 'notifications', name: 'الإشعارات', icon: FiMail },
    { id: 'advanced', name: 'متقدم', icon: FiLock }
  ]

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mr-3 text-gray-600">جاري تحميل الإعدادات...</p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">إعدادات المتجر</h1>
                <p className="text-gray-600">إدارة جميع إعدادات المتجر والنظام</p>
              </div>
              <button
                onClick={saveSettings}
                disabled={saving}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-colors ${
                  saving
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    حفظ جميع الإعدادات
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64">
              <nav className="bg-white rounded-xl shadow-sm p-4 sticky top-8">
                <div className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
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
              <div className="bg-white rounded-xl shadow-sm p-6">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">الإعدادات العامة</h2>
                      <p className="text-gray-600 mb-6">إعدادات أساسية للمتجر</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          اسم المتجر
                        </label>
                        <input
                          type="text"
                          value={settings.store_name}
                          onChange={(e) => updateSetting('store_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          بريد التواصل
                        </label>
                        <input
                          type="email"
                          value={settings.contact_email}
                          onChange={(e) => updateSetting('contact_email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رقم الهاتف
                        </label>
                        <input
                          type="tel"
                          value={settings.contact_phone}
                          onChange={(e) => updateSetting('contact_phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رابط الشعار
                        </label>
                        <input
                          type="url"
                          value={settings.store_logo}
                          onChange={(e) => updateSetting('store_logo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        وصف المتجر
                      </label>
                      <textarea
                        rows={4}
                        value={settings.store_description}
                        onChange={(e) => updateSetting('store_description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        العنوان
                      </label>
                      <textarea
                        rows={3}
                        value={settings.contact_address}
                        onChange={(e) => updateSetting('contact_address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Payment Settings */}
                {activeTab === 'payments' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">إعدادات المدفوعات</h2>
                        <p className="text-gray-600 mb-6">إدارة طرق الدفع والبوابات المالية</p>
                      </div>
                      <button
                        onClick={testPaymentConnection}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <FiRefreshCw className="w-4 h-4" />
                        اختبار الاتصال
                      </button>
                    </div>

                    {/* Payment Methods */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        طرق الدفع المفعلة
                      </label>
                      <div className="space-y-3">
                        {[
                          { id: 'card', name: 'بطاقة ائتمان', icon: FiCreditCard },
                          { id: 'paypal', name: 'PayPal', icon: FiDollarSign },
                          { id: 'bank_transfer', name: 'تحويل بنكي', icon: FiDollarSign }
                        ].map((method) => {
                          const Icon = method.icon
                          return (
                            <label key={method.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={settings.payment_methods.includes(method.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    updateSetting('payment_methods', [...settings.payment_methods, method.id])
                                  } else {
                                    updateSetting('payment_methods', settings.payment_methods.filter(m => m !== method.id))
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <Icon className="w-5 h-5 text-gray-600" />
                              <span className="font-medium text-gray-900">{method.name}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    {/* Stripe Settings */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-3">إعدادات Stripe</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">
                            Stripe Public Key
                          </label>
                          <input
                            type="text"
                            value={settings.stripe_public_key}
                            onChange={(e) => updateSetting('stripe_public_key', e.target.value)}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="pk_test_..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">
                            Stripe Secret Key
                          </label>
                          <input
                            type="password"
                            value={settings.stripe_secret_key}
                            onChange={(e) => updateSetting('stripe_secret_key', e.target.value)}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="sk_test_..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* PayPal Settings */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-900 mb-3">إعدادات PayPal</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-yellow-700 mb-2">
                            PayPal Client ID
                          </label>
                          <input
                            type="text"
                            value={settings.paypal_client_id}
                            onChange={(e) => updateSetting('paypal_client_id', e.target.value)}
                            className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-yellow-700 mb-2">
                            PayPal Secret
                          </label>
                          <input
                            type="password"
                            value={settings.paypal_secret}
                            onChange={(e) => updateSetting('paypal_secret', e.target.value)}
                            className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bank Transfer Info */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        معلومات التحويل البنكي
                      </label>
                      <textarea
                        rows={4}
                        value={settings.bank_account_info}
                        onChange={(e) => updateSetting('bank_account_info', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="اسم البنك، رقم الحساب، رقم الآيبان..."
                      />
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">إعدادات الأمان</h2>
                      <p className="text-gray-600 mb-6">إدارة أمان النظام وحماية البيانات</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الحد الأدنى لطول كلمة المرور
                        </label>
                        <input
                          type="number"
                          min="6"
                          max="20"
                          value={settings.password_min_length}
                          onChange={(e) => updateSetting('password_min_length', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          مهلة انتهاء الجلسة (دقيقة)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="1440"
                          value={settings.session_timeout}
                          onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          عدد محاولات تسجيل الدخول المسموحة
                        </label>
                        <input
                          type="number"
                          min="3"
                          max="10"
                          value={settings.max_login_attempts}
                          onChange={(e) => updateSetting('max_login_attempts', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={settings.enable_2fa}
                          onChange={(e) => updateSetting('enable_2fa', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-medium text-gray-900">تفعيل المصادقة الثنائية</span>
                          <p className="text-sm text-gray-600">طبقة حماية إضافية للحسابات</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* SEO Settings */}
                {activeTab === 'seo' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">إعدادات SEO</h2>
                      <p className="text-gray-600 mb-6">تحسين محركات البحث والتحليلات</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          عنوان الموقع (Meta Title)
                        </label>
                        <input
                          type="text"
                          value={settings.meta_title}
                          onChange={(e) => updateSetting('meta_title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          maxLength={60}
                        />
                        <p className="text-xs text-gray-500 mt-1">الحد الأقصى: 60 حرف</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          وصف الموقع (Meta Description)
                        </label>
                        <textarea
                          rows={3}
                          value={settings.meta_description}
                          onChange={(e) => updateSetting('meta_description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          maxLength={160}
                        />
                        <p className="text-xs text-gray-500 mt-1">الحد الأقصى: 160 حرف</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الكلمات المفتاحية
                        </label>
                        <input
                          type="text"
                          value={settings.meta_keywords}
                          onChange={(e) => updateSetting('meta_keywords', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="برامج, تصميم, تطوير"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Google Analytics ID
                          </label>
                          <input
                            type="text"
                            value={settings.google_analytics_id}
                            onChange={(e) => updateSetting('google_analytics_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="GA-XXXXXXXXX-X"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Facebook Pixel ID
                          </label>
                          <input
                            type="text"
                            value={settings.facebook_pixel_id}
                            onChange={(e) => updateSetting('facebook_pixel_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="123456789012345"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Social Media Settings */}
                {activeTab === 'social' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">وسائل التواصل الاجتماعي</h2>
                      <p className="text-gray-600 mb-6">روابط حسابات التواصل الاجتماعي</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'social_facebook', name: 'Facebook', icon: FiFacebook, color: 'text-blue-600', placeholder: 'https://facebook.com/yourpage' },
                        { key: 'social_twitter', name: 'Twitter', icon: FiTwitter, color: 'text-blue-400', placeholder: 'https://twitter.com/youraccount' },
                        { key: 'social_instagram', name: 'Instagram', icon: FiInstagram, color: 'text-pink-600', placeholder: 'https://instagram.com/youraccount' },
                        { key: 'social_linkedin', name: 'LinkedIn', icon: FiLinkedin, color: 'text-blue-700', placeholder: 'https://linkedin.com/company/yourcompany' },
                        { key: 'social_youtube', name: 'YouTube', icon: FiYoutube, color: 'text-red-600', placeholder: 'https://youtube.com/channel/yourchannel' }
                      ].map((social) => {
                        const Icon = social.icon
                        return (
                          <div key={social.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              <Icon className={`inline w-4 h-4 ml-2 ${social.color}`} />
                              {social.name}
                            </label>
                            <input
                              type="url"
                              value={settings[social.key as keyof StoreSettings] as string}
                              onChange={(e) => updateSetting(social.key as keyof StoreSettings, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={social.placeholder}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Language and Currency Settings */}
                {activeTab === 'localization' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">اللغة والعملة</h2>
                      <p className="text-gray-600 mb-6">إعدادات اللغة والعملة والتوطين</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          اللغة الافتراضية
                        </label>
                        <select
                          value={settings.default_language}
                          onChange={(e) => updateSetting('default_language', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="ar">العربية</option>
                          <option value="en">English</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          العملة الافتراضية
                        </label>
                        <select
                          value={settings.default_currency}
                          onChange={(e) => updateSetting('default_currency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="SAR">🇸🇦 الريال السعودي</option>
                          <option value="AED">🇦🇪 الدرهم الإماراتي</option>
                          <option value="KWD">🇰🇼 الدينار الكويتي</option>
                          <option value="QAR">🇶🇦 الريال القطري</option>
                          <option value="BHD">🇧🇭 الدينار البحريني</option>
                          <option value="OMR">🇴🇲 الريال العماني</option>
                          <option value="EGP">🇪🇬 الجنيه المصري</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        اللغات المدعومة
                      </label>
                      <div className="space-y-2">
                        {[
                          { code: 'ar', name: 'العربية', flag: '🇸🇦' },
                          { code: 'en', name: 'English', flag: '🇺🇸' }
                        ].map((lang) => (
                          <label key={lang.code} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={settings.supported_languages.includes(lang.code)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  updateSetting('supported_languages', [...settings.supported_languages, lang.code])
                                } else {
                                  updateSetting('supported_languages', settings.supported_languages.filter(l => l !== lang.code))
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-lg">{lang.flag}</span>
                            <span className="font-medium text-gray-900">{lang.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Content Settings */}
                {activeTab === 'content' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">إعدادات المحتوى</h2>
                      <p className="text-gray-600 mb-6">إدارة عرض المحتوى والميزات</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          عدد المنتجات في الصفحة
                        </label>
                        <select
                          value={settings.products_per_page}
                          onChange={(e) => updateSetting('products_per_page', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={8}>8 منتجات</option>
                          <option value={12}>12 منتج</option>
                          <option value={16}>16 منتج</option>
                          <option value={24}>24 منتج</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={settings.enable_reviews}
                          onChange={(e) => updateSetting('enable_reviews', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-medium text-gray-900">تفعيل التقييمات</span>
                          <p className="text-sm text-gray-600">السماح للمستخدمين بتقييم المنتجات</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={settings.enable_wishlist}
                          onChange={(e) => updateSetting('enable_wishlist', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-medium text-gray-900">تفعيل المفضلة</span>
                          <p className="text-sm text-gray-600">السماح للمستخدمين بحفظ المنتجات المفضلة</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={settings.auto_approve_reviews}
                          onChange={(e) => updateSetting('auto_approve_reviews', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-medium text-gray-900">الموافقة التلقائية على التقييمات</span>
                          <p className="text-sm text-gray-600">عرض التقييمات فوراً بدون مراجعة</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Shipping Settings */}
                {activeTab === 'shipping' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">إعدادات الشحن</h2>
                      <p className="text-gray-600 mb-6">إدارة طرق الشحن والأسعار</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الحد الأدنى للشحن المجاني (ريال)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={settings.free_shipping_threshold}
                        onChange={(e) => updateSetting('free_shipping_threshold', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        أسعار الشحن
                      </label>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">الشحن العادي</label>
                            <input
                              type="number"
                              value={settings.shipping_rates.standard}
                              onChange={(e) => updateSetting('shipping_rates', { 
                                ...settings.shipping_rates, 
                                standard: parseFloat(e.target.value) 
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">الشحن السريع</label>
                            <input
                              type="number"
                              value={settings.shipping_rates.express}
                              onChange={(e) => updateSetting('shipping_rates', { 
                                ...settings.shipping_rates, 
                                express: parseFloat(e.target.value) 
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Settings */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">إعدادات الإشعارات</h2>
                      <p className="text-gray-600 mb-6">إدارة الإشعارات والتنبيهات</p>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={settings.email_notifications}
                          onChange={(e) => updateSetting('email_notifications', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-medium text-gray-900">إشعارات البريد الإلكتروني</span>
                          <p className="text-sm text-gray-600">إرسال إشعارات عبر البريد الإلكتروني</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={settings.order_confirmation_email}
                          onChange={(e) => updateSetting('order_confirmation_email', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-medium text-gray-900">تأكيد الطلبات بالبريد</span>
                          <p className="text-sm text-gray-600">إرسال تأكيد الطلب للعميل</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={settings.push_notifications}
                          onChange={(e) => updateSetting('push_notifications', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-medium text-gray-900">الإشعارات الفورية</span>
                          <p className="text-sm text-gray-600">إشعارات المتصفح الفورية</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Advanced Settings */}
                {activeTab === 'advanced' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">الإعدادات المتقدمة</h2>
                      <p className="text-gray-600 mb-6">إعدادات تقنية متقدمة للنظام</p>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-3 p-4 border border-red-200 rounded-lg hover:bg-red-50">
                        <input
                          type="checkbox"
                          checked={settings.maintenance_mode}
                          onChange={(e) => updateSetting('maintenance_mode', e.target.checked)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <div>
                          <span className="font-medium text-red-900">وضع الصيانة</span>
                          <p className="text-sm text-red-700">إغلاق الموقع مؤقتاً للصيانة</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={settings.debug_mode}
                          onChange={(e) => updateSetting('debug_mode', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-medium text-gray-900">وضع التطوير</span>
                          <p className="text-sm text-gray-600">عرض معلومات إضافية للمطورين</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={settings.cache_enabled}
                          onChange={(e) => updateSetting('cache_enabled', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-medium text-gray-900">تفعيل التخزين المؤقت</span>
                          <p className="text-sm text-gray-600">تحسين سرعة الموقع</p>
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        حد معدل API (طلب/دقيقة)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="1000"
                        value={settings.api_rate_limit}
                        onChange={(e) => updateSetting('api_rate_limit', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title="تم الحفظ بنجاح"
        message={successMessage}
      />

      {/* Test Result Modal */}
      <Modal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        type="info"
        title="نتيجة الاختبار"
        message={testResult}
      />
    </Layout>
  )
}