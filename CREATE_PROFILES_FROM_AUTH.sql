-- إنشاء جدول profiles من المستخدمين الموجودين في auth.users
-- قم بتشغيل هذا الملف في Supabase SQL Editor

-- 1. إنشاء جدول profiles
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

-- 2. إنشاء فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_is_active_idx ON profiles(is_active);

-- 3. إنشاء دالة لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 5. نسخ المستخدمين الحاليين من auth.users إلى profiles
-- ملاحظة: user_metadata لا يمكن الوصول إليه من SQL العادي
-- سنقوم بإنشاء المستخدمين مع قيم افتراضية
INSERT INTO profiles (id, email, full_name, role, is_active, created_at)
SELECT 
  u.id,
  u.email,
  'مستخدم جديد', -- اسم افتراضي
  'user', -- دور افتراضي
  true, -- نشط افتراضياً
  u.created_at
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- 6. عرض المستخدمين المضافين
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM profiles 
ORDER BY created_at DESC;

-- 7. إنشاء RLS policies
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

-- 8. منح الصلاحيات
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- 9. التحقق من النتيجة النهائية
SELECT 
  'Total users in auth.users' as info,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Total users in profiles' as info,
  COUNT(*) as count
FROM profiles
UNION ALL
SELECT 
  'Users by role' as info,
  COUNT(*) as count
FROM profiles
WHERE role = 'user'
UNION ALL
SELECT 
  'Admins by role' as info,
  COUNT(*) as count
FROM profiles
WHERE role IN ('admin', 'super_admin');

-- 10. تعليق: بعد تشغيل هذا الملف:
-- 1. سيتم إنشاء جدول profiles
-- 2. سيتم نسخ جميع المستخدمين الحاليين
-- 3. ستظهر صفحة إدارة المستخدمين جميع المستخدمين
-- 4. يمكنك تعديل الأدوار والحالات
