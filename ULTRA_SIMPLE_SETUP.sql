-- إعداد مبسط جداً لجدول profiles
-- قم بتشغيل هذا الملف في Supabase SQL Editor

-- 1. إنشاء جدول profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT DEFAULT 'مستخدم جديد',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. إضافة المستخدمين الحاليين
INSERT INTO profiles (id, email, full_name, role, is_active, created_at)
SELECT 
  u.id,
  u.email,
  'مستخدم جديد',
  'user',
  true,
  u.created_at
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- 3. عرض المستخدمين المضافين
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM profiles 
ORDER BY created_at DESC;

-- 4. إنشاء RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- سياسة للقراءة: المستخدمون يمكنهم رؤية ملفاتهم فقط
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- سياسة للقراءة: المديرون يمكنهم رؤية الجميع
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- سياسة للتحديث: المستخدمون يمكنهم تحديث ملفاتهم فقط
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- سياسة للتحديث: المديرون يمكنهم تحديث الجميع
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 5. منح الصلاحيات
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- 6. التحقق من النتيجة
SELECT 
  'Total users in auth.users' as info,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Total users in profiles' as info,
  COUNT(*) as count
FROM profiles;

-- 7. تعيين دور admin لأحد المستخدمين (اختياري)
-- UPDATE profiles SET role = 'admin', full_name = 'مدير النظام' WHERE email = 'your@email.com';
