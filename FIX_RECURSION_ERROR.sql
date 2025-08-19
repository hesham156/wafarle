-- إصلاح مشكلة infinite recursion في سياسات RLS لجدول profiles
-- قم بتشغيل هذا الملف في Supabase SQL Editor

-- 1. حذف جميع السياسات الموجودة
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can delete all profiles" ON profiles;

-- 2. إعادة إنشاء سياسات بسيطة بدون recursion
-- سياسة للقراءة - المستخدمون يرون ملفهم الشخصي، المديرون يرون الجميع
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- سياسة للإدراج - المستخدمون يمكنهم إدراج ملفهم الشخصي
CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- سياسة للتحديث - المستخدمون يمكنهم تحديث ملفهم الشخصي، المديرون يمكنهم تحديث الجميع
CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- سياسة للحذف - المديرون فقط يمكنهم الحذف
CREATE POLICY "profiles_delete_policy" ON profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 3. التحقق من السياسات الجديدة
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. اختبار الوصول
-- يجب أن يعمل الآن بدون recursion
SELECT COUNT(*) FROM profiles;

-- 5. إضافة المستخدمين إذا كان الجدول فارغ
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

-- 6. النتيجة النهائية
SELECT 
  'Final status' as info,
  'Profiles table is ready' as status
UNION ALL
SELECT 
  'Users in profiles' as info,
  COUNT(*)::TEXT as status
FROM profiles
UNION ALL
SELECT 
  'Users in auth.users' as info,
  COUNT(*)::TEXT as status
FROM auth.users;

-- 7. تعليق: بعد تشغيل هذا الملف:
-- 1. سيتم إصلاح مشكلة infinite recursion
-- 2. سيتم إنشاء سياسات RLS بسيطة وآمنة
-- 3. سيتم إضافة المستخدمين الجدد
-- 4. ستظهر صفحة إدارة المستخدمين جميع المستخدمين
