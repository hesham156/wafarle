-- التحقق من حالة قاعدة البيانات الحالية
-- قم بتشغيل هذا الملف في Supabase SQL Editor لمعرفة المشكلة

-- 1. التحقق من الجداول الموجودة
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. التحقق من جدول auth.users (المستخدمين المسجلين)
SELECT 
  id,
  email,
  created_at,
  user_metadata,
  banned_until
FROM auth.users 
ORDER BY created_at DESC;

-- 3. التحقق من جدول profiles إذا كان موجود
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM profiles 
ORDER BY created_at DESC;

-- 4. التحقق من الصلاحيات
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasinsert,
  hasselect,
  hasupdate,
  hasdelete
FROM pg_tables 
WHERE tablename IN ('profiles', 'products', 'orders');

-- 5. التحقق من RLS policies
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
WHERE tablename IN ('profiles', 'products', 'orders');

-- 6. عدد المستخدمين في كل جدول
SELECT 'auth.users' as table_name, COUNT(*) as user_count FROM auth.users
UNION ALL
SELECT 'profiles' as table_name, COUNT(*) as user_count FROM profiles
UNION ALL
SELECT 'products' as table_name, COUNT(*) as user_count FROM products;
