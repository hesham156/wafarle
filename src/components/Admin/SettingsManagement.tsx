'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  FiSave, 
  FiRefreshCw, 
  FiUpload, 
  FiDownload, 
  FiTrash2,
  FiEye,
  FiEdit,
  FiPlus,
  FiSettings,
  FiShield,
  FiGlobe
} from 'react-icons/fi'
import Modal from '@/components/UI/Modal'

interface SettingsCategory {
  id: string
  name: string
  description: string
  settings: SettingItem[]
}

interface SettingItem {
  key: string
  name: string
  description: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'password' | 'url' | 'email'
  value: any
  options?: { value: string; label: string }[]
  required?: boolean
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

export default function SettingsManagement() {
  const [categories, setCategories] = useState<SettingsCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeCategory, setActiveCategory] = useState('store')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [backupData, setBackupData] = useState('')

  useEffect(() => {
    initializeSettings()
  }, [])

  function initializeSettings() {
    const settingsCategories: SettingsCategory[] = [
      {
        id: 'store',
        name: 'إعدادات المتجر',
        description: 'الإعدادات الأساسية للمتجر',
        settings: [
          {
            key: 'store_name',
            name: 'اسم المتجر',
            description: 'الاسم الذي يظهر في الموقع',
            type: 'text',
            value: 'وفرلي',
            required: true
          },
          {
            key: 'store_tagline',
            name: 'شعار المتجر',
            description: 'الشعار الذي يظهر تحت اسم المتجر',
            type: 'text',
            value: 'متجر البرامج والأدوات الاحترافية'
          },
          {
            key: 'store_logo',
            name: 'شعار المتجر',
            description: 'رابط شعار المتجر',
            type: 'url',
            value: ''
          },
          {
            key: 'contact_email',
            name: 'بريد التواصل',
            description: 'البريد الإلكتروني للتواصل',
            type: 'email',
            value: 'info@wafarle.com',
            required: true
          },
          {
            key: 'contact_phone',
            name: 'رقم الهاتف',
            description: 'رقم الهاتف للتواصل',
            type: 'text',
            value: '+966501234567'
          },
          {
            key: 'maintenance_mode',
            name: 'وضع الصيانة',
            description: 'تفعيل وضع الصيانة للموقع',
            type: 'boolean',
            value: false
          }
        ]
      },
      {
        id: 'payments',
        name: 'المدفوعات',
        description: 'إعدادات بوابات الدفع',
        settings: [
          {
            key: 'stripe_enabled',
            name: 'تفعيل Stripe',
            description: 'تفعيل بوابة دفع Stripe',
            type: 'boolean',
            value: true
          },
          {
            key: 'stripe_public_key',
            name: 'Stripe Public Key',
            description: 'المفتاح العام لـ Stripe',
            type: 'text',
            value: ''
          },
          {
            key: 'stripe_secret_key',
            name: 'Stripe Secret Key',
            description: 'المفتاح السري لـ Stripe',
            type: 'password',
            value: ''
          },
          {
            key: 'paypal_enabled',
            name: 'تفعيل PayPal',
            description: 'تفعيل بوابة دفع PayPal',
            type: 'boolean',
            value: true
          },
          {
            key: 'paypal_client_id',
            name: 'PayPal Client ID',
            description: 'معرف العميل لـ PayPal',
            type: 'text',
            value: ''
          },
          {
            key: 'bank_transfer_enabled',
            name: 'تفعيل التحويل البنكي',
            description: 'تفعيل الدفع بالتحويل البنكي',
            type: 'boolean',
            value: true
          }
        ]
      },
      {
        id: 'security',
        name: 'الأمان',
        description: 'إعدادات الأمان والحماية',
        settings: [
          {
            key: 'password_min_length',
            name: 'الحد الأدنى لطول كلمة المرور',
            description: 'عدد الأحرف المطلوبة في كلمة المرور',
            type: 'number',
            value: 8,
            validation: { min: 6, max: 20 }
          },
          {
            key: 'enable_2fa',
            name: 'المصادقة الثنائية',
            description: 'تفعيل المصادقة الثنائية للحسابات',
            type: 'boolean',
            value: false
          },
          {
            key: 'session_timeout',
            name: 'مهلة انتهاء الجلسة (دقيقة)',
            description: 'المدة قبل انتهاء جلسة المستخدم',
            type: 'number',
            value: 30,
            validation: { min: 5, max: 1440 }
          },
          {
            key: 'max_login_attempts',
            name: 'عدد محاولات تسجيل الدخول',
            description: 'العدد الأقصى لمحاولات تسجيل الدخول الفاشلة',
            type: 'number',
            value: 5,
            validation: { min: 3, max: 10 }
          },
          {
            key: 'ip_blocking_enabled',
            name: 'حظر IP',
            description: 'تفعيل حظر عناوين IP المشبوهة',
            type: 'boolean',
            value: true
          }
        ]
      },
      {
        id: 'seo',
        name: 'SEO والتحليلات',
        description: 'تحسين محركات البحث',
        settings: [
          {
            key: 'meta_title',
            name: 'عنوان الموقع',
            description: 'العنوان الذي يظهر في محركات البحث',
            type: 'text',
            value: 'وفرلي - متجر البرامج الرقمية',
            validation: { max: 60 }
          },
          {
            key: 'meta_description',
            name: 'وصف الموقع',
            description: 'الوصف الذي يظهر في محركات البحث',
            type: 'textarea',
            value: 'متجر متخصص في بيع البرامج والتصاميم الرقمية بأسعار منافسة',
            validation: { max: 160 }
          },
          {
            key: 'meta_keywords',
            name: 'الكلمات المفتاحية',
            description: 'الكلمات المفتاحية للموقع',
            type: 'text',
            value: 'برامج, تصميم, تطوير, أدوات, رقمية'
          },
          {
            key: 'google_analytics_id',
            name: 'Google Analytics ID',
            description: 'معرف Google Analytics',
            type: 'text',
            value: ''
          },
          {
            key: 'google_search_console',
            name: 'Google Search Console',
            description: 'رمز التحقق من Google Search Console',
            type: 'text',
            value: ''
          },
          {
            key: 'facebook_pixel_id',
            name: 'Facebook Pixel ID',
            description: 'معرف Facebook Pixel للتتبع',
            type: 'text',
            value: ''
          }
        ]
      },
      {
        id: 'social',
        name: 'وسائل التواصل',
        description: 'روابط حسابات التواصل الاجتماعي',
        settings: [
          {
            key: 'social_facebook',
            name: 'Facebook',
            description: 'رابط صفحة Facebook',
            type: 'url',
            value: ''
          },
          {
            key: 'social_twitter',
            name: 'Twitter',
            description: 'رابط حساب Twitter',
            type: 'url',
            value: ''
          },
          {
            key: 'social_instagram',
            name: 'Instagram',
            description: 'رابط حساب Instagram',
            type: 'url',
            value: ''
          },
          {
            key: 'social_linkedin',
            name: 'LinkedIn',
            description: 'رابط صفحة LinkedIn',
            type: 'url',
            value: ''
          },
          {
            key: 'social_youtube',
            name: 'YouTube',
            description: 'رابط قناة YouTube',
            type: 'url',
            value: ''
          },
          {
            key: 'social_tiktok',
            name: 'TikTok',
            description: 'رابط حساب TikTok',
            type: 'url',
            value: ''
          }
        ]
      },
      {
        id: 'content',
        name: 'المحتوى',
        description: 'إعدادات عرض المحتوى',
        settings: [
          {
            key: 'products_per_page',
            name: 'عدد المنتجات في الصفحة',
            description: 'عدد المنتجات المعروضة في كل صفحة',
            type: 'select',
            value: 12,
            options: [
              { value: '8', label: '8 منتجات' },
              { value: '12', label: '12 منتج' },
              { value: '16', label: '16 منتج' },
              { value: '24', label: '24 منتج' }
            ]
          },
          {
            key: 'enable_reviews',
            name: 'تفعيل التقييمات',
            description: 'السماح للمستخدمين بتقييم المنتجات',
            type: 'boolean',
            value: true
          },
          {
            key: 'enable_wishlist',
            name: 'تفعيل المفضلة',
            description: 'السماح للمستخدمين بحفظ المنتجات المفضلة',
            type: 'boolean',
            value: true
          },
          {
            key: 'auto_approve_reviews',
            name: 'الموافقة التلقائية على التقييمات',
            description: 'عرض التقييمات فوراً بدون مراجعة',
            type: 'boolean',
            value: false
          },
          {
            key: 'show_stock_count',
            name: 'عرض عدد المخزون',
            description: 'عرض عدد القطع المتوفرة للمنتجات',
            type: 'boolean',
            value: true
          }
        ]
      }
    ]

    setCategories(settingsCategories)
    setLoading(false)
  }

  async function saveAllSettings() {
    try {
      setSaving(true)
      
      // تحويل الإعدادات إلى كائن واحد
      const allSettings: Record<string, any> = {}
      categories.forEach(category => {
        category.settings.forEach(setting => {
          allSettings[setting.key] = setting.value
        })
      })

      // حفظ في قاعدة البيانات
      const { error } = await supabase
        .from('store_settings')
        .upsert({ id: 1, ...allSettings })

      if (error) {
        console.error('Error saving settings:', error)
        return
      }

      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  function updateSettingValue(categoryId: string, settingKey: string, value: any) {
    setCategories(prev => prev.map(category => 
      category.id === categoryId 
        ? {
            ...category,
            settings: category.settings.map(setting =>
              setting.key === settingKey ? { ...setting, value } : setting
            )
          }
        : category
    ))
  }

  function exportSettings() {
    const allSettings: Record<string, any> = {}
    categories.forEach(category => {
      category.settings.forEach(setting => {
        allSettings[setting.key] = setting.value
      })
    })

    const dataStr = JSON.stringify(allSettings, null, 2)
    setBackupData(dataStr)
    setShowBackupModal(true)
  }

  function downloadBackup() {
    const blob = new Blob([backupData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wafarle-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const currentCategory = categories.find(cat => cat.id === activeCategory)

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري تحميل الإعدادات...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة الإعدادات</h2>
          <p className="text-gray-600">إدارة شاملة لجميع إعدادات النظام</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportSettings}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            تصدير
          </button>
          <button
            onClick={saveAllSettings}
            disabled={saving}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
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
                حفظ الإعدادات
              </>
            )}
          </button>
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Form */}
      {currentCategory && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900">{currentCategory.name}</h3>
            <p className="text-gray-600">{currentCategory.description}</p>
          </div>

          <div className="space-y-6">
            {currentCategory.settings.map((setting) => (
              <div key={setting.key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {setting.name}
                  {setting.required && <span className="text-red-500 mr-1">*</span>}
                </label>
                <p className="text-xs text-gray-500">{setting.description}</p>
                
                {setting.type === 'text' && (
                  <input
                    type="text"
                    value={setting.value}
                    onChange={(e) => updateSettingValue(currentCategory.id, setting.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={setting.required}
                  />
                )}

                {setting.type === 'email' && (
                  <input
                    type="email"
                    value={setting.value}
                    onChange={(e) => updateSettingValue(currentCategory.id, setting.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={setting.required}
                  />
                )}

                {setting.type === 'url' && (
                  <input
                    type="url"
                    value={setting.value}
                    onChange={(e) => updateSettingValue(currentCategory.id, setting.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                )}

                {setting.type === 'password' && (
                  <input
                    type="password"
                    value={setting.value}
                    onChange={(e) => updateSettingValue(currentCategory.id, setting.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}

                {setting.type === 'number' && (
                  <input
                    type="number"
                    value={setting.value}
                    onChange={(e) => updateSettingValue(currentCategory.id, setting.key, parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={setting.validation?.min}
                    max={setting.validation?.max}
                  />
                )}

                {setting.type === 'textarea' && (
                  <textarea
                    rows={4}
                    value={setting.value}
                    onChange={(e) => updateSettingValue(currentCategory.id, setting.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={setting.validation?.max}
                  />
                )}

                {setting.type === 'boolean' && (
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.value}
                      onChange={(e) => updateSettingValue(currentCategory.id, setting.key, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-900">تفعيل هذا الإعداد</span>
                  </label>
                )}

                {setting.type === 'select' && setting.options && (
                  <select
                    value={setting.value}
                    onChange={(e) => updateSettingValue(currentCategory.id, setting.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {setting.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title="تم الحفظ بنجاح"
        message="تم حفظ جميع الإعدادات بنجاح!"
      />

      {/* Backup Modal */}
      <Modal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        type="info"
        title="نسخة احتياطية من الإعدادات"
        message="يمكنك نسخ البيانات أو تحميلها كملف"
      />
    </div>
  )
}