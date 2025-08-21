-- إنشاء جدول إعدادات المتجر
-- قم بتشغيل هذا الملف في Supabase SQL Editor

/*
  # إعدادات المتجر الشاملة

  1. جدول جديد
    - `store_settings` - إعدادات شاملة للمتجر
      - `id` (integer, primary key)
      - `store_name` (text) - اسم المتجر
      - `store_description` (text) - وصف المتجر
      - `store_logo` (text) - رابط الشعار
      - `contact_email` (text) - بريد التواصل
      - `contact_phone` (text) - رقم الهاتف
      - `contact_address` (text) - العنوان
      - `payment_settings` (jsonb) - إعدادات المدفوعات
      - `security_settings` (jsonb) - إعدادات الأمان
      - `seo_settings` (jsonb) - إعدادات SEO
      - `social_settings` (jsonb) - وسائل التواصل
      - `content_settings` (jsonb) - إعدادات المحتوى
      - `notification_settings` (jsonb) - إعدادات الإشعارات
      - `advanced_settings` (jsonb) - إعدادات متقدمة
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. الأمان
    - تمكين RLS
    - سياسات للمديرين فقط
*/

-- إنشاء جدول إعدادات المتجر
CREATE TABLE IF NOT EXISTS store_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  
  -- الإعدادات العامة
  store_name TEXT NOT NULL DEFAULT 'وفرلي',
  store_description TEXT DEFAULT 'متجر البرامج والأدوات الاحترافية',
  store_logo TEXT,
  store_favicon TEXT,
  contact_email TEXT DEFAULT 'info@wafarle.com',
  contact_phone TEXT DEFAULT '+966501234567',
  contact_address TEXT DEFAULT 'الرياض، المملكة العربية السعودية',
  
  -- إعدادات المدفوعات (JSON)
  payment_settings JSONB DEFAULT '{
    "methods": ["card", "paypal", "bank_transfer"],
    "stripe": {
      "enabled": true,
      "public_key": "",
      "secret_key": "",
      "webhook_secret": ""
    },
    "paypal": {
      "enabled": true,
      "client_id": "",
      "secret": "",
      "sandbox": true
    },
    "bank_transfer": {
      "enabled": true,
      "account_info": ""
    }
  }'::jsonb,
  
  -- إعدادات الأمان (JSON)
  security_settings JSONB DEFAULT '{
    "password_min_length": 8,
    "enable_2fa": false,
    "session_timeout": 30,
    "max_login_attempts": 5,
    "ip_blocking": true,
    "rate_limiting": true
  }'::jsonb,
  
  -- إعدادات SEO (JSON)
  seo_settings JSONB DEFAULT '{
    "meta_title": "وفرلي - متجر البرامج الرقمية",
    "meta_description": "متجر متخصص في بيع البرامج والتصاميم الرقمية بأسعار منافسة",
    "meta_keywords": "برامج, تصميم, تطوير, أدوات, رقمية",
    "google_analytics_id": "",
    "facebook_pixel_id": "",
    "google_search_console": "",
    "sitemap_enabled": true,
    "robots_txt": "User-agent: *\\nAllow: /"
  }'::jsonb,
  
  -- إعدادات وسائل التواصل (JSON)
  social_settings JSONB DEFAULT '{
    "facebook": "",
    "twitter": "",
    "instagram": "",
    "linkedin": "",
    "youtube": "",
    "tiktok": "",
    "snapchat": "",
    "telegram": ""
  }'::jsonb,
  
  -- إعدادات المحتوى (JSON)
  content_settings JSONB DEFAULT '{
    "products_per_page": 12,
    "enable_reviews": true,
    "enable_wishlist": true,
    "enable_compare": false,
    "auto_approve_reviews": false,
    "show_stock_count": true,
    "enable_related_products": true,
    "max_related_products": 4
  }'::jsonb,
  
  -- إعدادات الإشعارات (JSON)
  notification_settings JSONB DEFAULT '{
    "email_notifications": true,
    "sms_notifications": false,
    "push_notifications": true,
    "order_confirmation": true,
    "order_status_updates": true,
    "marketing_emails": false,
    "newsletter": true
  }'::jsonb,
  
  -- إعدادات الشحن (JSON)
  shipping_settings JSONB DEFAULT '{
    "methods": ["standard", "express", "overnight"],
    "free_shipping_threshold": 500,
    "rates": {
      "standard": 25,
      "express": 50,
      "overnight": 100
    },
    "digital_products_only": true
  }'::jsonb,
  
  -- إعدادات اللغة والعملة (JSON)
  localization_settings JSONB DEFAULT '{
    "default_language": "ar",
    "supported_languages": ["ar", "en"],
    "default_currency": "SAR",
    "supported_currencies": ["SAR", "AED", "KWD", "QAR", "BHD", "OMR", "EGP"],
    "rtl_enabled": true,
    "date_format": "DD/MM/YYYY",
    "time_format": "24h"
  }'::jsonb,
  
  -- إعدادات متقدمة (JSON)
  advanced_settings JSONB DEFAULT '{
    "maintenance_mode": false,
    "debug_mode": false,
    "cache_enabled": true,
    "api_rate_limit": 100,
    "backup_frequency": "daily",
    "log_retention_days": 30,
    "cdn_enabled": false,
    "compression_enabled": true
  }'::jsonb,
  
  -- التواريخ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- قيد للتأكد من وجود صف واحد فقط
  CONSTRAINT single_settings_row CHECK (id = 1)
);

-- إنشاء فهارس
CREATE INDEX IF NOT EXISTS idx_store_settings_updated_at ON store_settings(updated_at);

-- إنشاء trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_store_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_store_settings_updated_at();

-- تمكين Row Level Security (RLS)
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- سياسات RLS - المديرون فقط يمكنهم الوصول
CREATE POLICY "Only admins can view store settings" ON store_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Only admins can update store settings" ON store_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Only admins can insert store settings" ON store_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- إدراج الإعدادات الافتراضية
INSERT INTO store_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- إنشاء جدول سجل التغييرات للإعدادات
CREATE TABLE IF NOT EXISTS settings_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  setting_key TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهرس لسجل التغييرات
CREATE INDEX IF NOT EXISTS idx_settings_audit_log_user_id ON settings_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_audit_log_created_at ON settings_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_settings_audit_log_setting_key ON settings_audit_log(setting_key);

-- تمكين RLS لسجل التغييرات
ALTER TABLE settings_audit_log ENABLE ROW LEVEL SECURITY;

-- سياسة RLS لسجل التغييرات - المديرون فقط
CREATE POLICY "Only admins can view audit log" ON settings_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- منح الصلاحيات
GRANT ALL ON store_settings TO authenticated;
GRANT ALL ON settings_audit_log TO authenticated;
GRANT ALL ON store_settings TO service_role;
GRANT ALL ON settings_audit_log TO service_role;

-- إضافة تعليقات
COMMENT ON TABLE store_settings IS 'جدول إعدادات المتجر الشاملة';
COMMENT ON COLUMN store_settings.id IS 'معرف الإعدادات (دائماً 1)';
COMMENT ON COLUMN store_settings.store_name IS 'اسم المتجر';
COMMENT ON COLUMN store_settings.payment_settings IS 'إعدادات المدفوعات (JSON)';
COMMENT ON COLUMN store_settings.security_settings IS 'إعدادات الأمان (JSON)';
COMMENT ON COLUMN store_settings.seo_settings IS 'إعدادات SEO (JSON)';
COMMENT ON COLUMN store_settings.social_settings IS 'وسائل التواصل (JSON)';

COMMENT ON TABLE settings_audit_log IS 'سجل تغييرات الإعدادات';
COMMENT ON COLUMN settings_audit_log.setting_key IS 'مفتاح الإعداد المُعدل';
COMMENT ON COLUMN settings_audit_log.old_value IS 'القيمة القديمة';
COMMENT ON COLUMN settings_audit_log.new_value IS 'القيمة الجديدة';

-- عرض الإعدادات المُنشأة
SELECT 
  'store_settings table created' as status,
  COUNT(*) as settings_count
FROM store_settings;

-- عرض هيكل الجدول
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'store_settings' 
ORDER BY ordinal_position;