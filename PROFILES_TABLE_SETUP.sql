-- إنشاء جدول profiles لإدارة المستخدمين والأدوار
-- قم بتشغيل هذا الملف في Supabase SQL Editor

-- إنشاء جدول profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_is_active_idx ON profiles(is_active);

-- إنشاء دالة لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- إنشاء RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- سياسة للقراءة: المستخدمون يمكنهم رؤية ملفاتهم فقط، المديرون يمكنهم رؤية الجميع
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- سياسة للتحديث: المستخدمون يمكنهم تحديث ملفاتهم فقط، المديرون يمكنهم تحديث الجميع
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- سياسة للإدراج: المديرون فقط يمكنهم إدراج ملفات جديدة
CREATE POLICY "Only admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- سياسة للحذف: المديرون فقط يمكنهم حذف الملفات
CREATE POLICY "Only admins can delete profiles" ON profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- إدراج بيانات تجريبية (اختياري)
INSERT INTO profiles (id, email, full_name, role, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@wafarle.com', 'مدير النظام', 'super_admin', true),
  ('00000000-0000-0000-0000-000000000002', 'manager@wafarle.com', 'مدير المحتوى', 'admin', true),
  ('00000000-0000-0000-0000-000000000003', 'user@wafarle.com', 'مستخدم عادي', 'user', true)
ON CONFLICT (id) DO NOTHING;

-- منح الصلاحيات
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- تعليق: بعد إنشاء هذا الجدول، يمكنك:
-- 1. إضافة المستخدمين الحاليين إليه
-- 2. استخدامه في صفحة إدارة المستخدمين
-- 3. ربطه مع نظام المصادقة
