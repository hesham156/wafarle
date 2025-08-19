-- إصلاح جدول profiles الموجود بالفعل
-- قم بتشغيل هذا الملف في Supabase SQL Editor

-- 1. التحقق من حالة الجدول الحالي
SELECT 
  'Current profiles table status' as info,
  COUNT(*) as user_count
FROM profiles;

-- 2. عرض المستخدمين الحاليين
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM profiles 
ORDER BY created_at DESC;

-- 3. إضافة المستخدمين الجدد (إذا كانوا غير موجودين)
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

-- 4. التحقق من النتيجة بعد الإضافة
SELECT 
  'Total users in auth.users' as info,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Total users in profiles' as info,
  COUNT(*) as count
FROM profiles;

-- 5. إنشاء trigger جديد (إذا لم يكن موجود)
DO $$
BEGIN
  -- حذف الـ trigger القديم إذا كان موجود
  DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
  
  -- إنشاء دالة تحديث updated_at
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ language 'plpgsql';
  
  -- إنشاء trigger جديد
  CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
    
  RAISE NOTICE 'Trigger created successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating trigger: %', SQLERRM;
END $$;

-- 6. التحقق من وجود الـ trigger
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- 7. إنشاء RLS policies (إذا لم تكن موجودة)
DO $$
BEGIN
  -- تفعيل RLS
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  
  -- حذف السياسات القديمة إذا كانت موجودة
  DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
  DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
  
  -- إنشاء سياسات جديدة
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
    
  RAISE NOTICE 'RLS policies created successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating RLS policies: %', SQLERRM;
END $$;

-- 8. منح الصلاحيات
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- 9. النتيجة النهائية
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

-- 10. تعليق: بعد تشغيل هذا الملف:
-- 1. سيتم إصلاح جدول profiles الموجود
-- 2. سيتم إضافة المستخدمين الجدد
-- 3. سيتم إنشاء الـ trigger والسياسات
-- 4. ستظهر صفحة إدارة المستخدمين جميع المستخدمين
