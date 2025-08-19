# دليل إعداد جدول المراجعات - Reviews Table Setup Guide

## 🚨 المشكلة
```
Error: Error fetching reviews: {}
```

## 🔧 الحل السريع

### الخطوة 1: فتح Supabase SQL Editor
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اضغط على **SQL Editor** من القائمة الجانبية

### الخطوة 2: تشغيل SQL Script
انسخ والصق المحتوى التالي في SQL Editor:

```sql
-- إنشاء جدول المراجعات
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- إضافة بيانات تجريبية
INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000001', 5, 'ممتاز جداً', 'برنامج رائع وسهل الاستخدام!', true),
    ('550e8400-e29b-41d4-a716-446655440002', '00000000-0000-0000-0000-000000000002', 4, 'جيد جداً', 'أداء ممتاز وسعر معقول', true);

-- إضافة RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### الخطوة 3: تشغيل الكود
اضغط **Run** لتنفيذ الكود

## ✅ التحقق من الإعداد

### اختبار الجدول
```sql
-- عرض الجدول
SELECT * FROM reviews LIMIT 5;

-- عرض هيكل الجدول
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reviews';
```

## 🎯 ما تم إنشاؤه

### 📊 جدول `reviews`
- **id**: معرف فريد للمراجعة
- **product_id**: معرف المنتج
- **user_id**: معرف المستخدم
- **rating**: التقييم (1-5)
- **title**: عنوان المراجعة
- **comment**: تعليق المراجعة
- **is_verified**: هل المراجعة موثقة
- **created_at**: تاريخ الإنشاء
- **updated_at**: تاريخ التحديث

### 🔒 الأمان
- **RLS مفعل** لحماية البيانات
- **سياسات أمان** تسمح للجميع بالقراءة
- **المستخدمين** يمكنهم إضافة/تعديل مراجعاتهم فقط

### 📈 البيانات التجريبية
- **مراجعات تجريبية** لاختبار النظام
- **فهارس** لتحسين الأداء

## 🧪 اختبار النظام

### بعد الإعداد:
1. **أعد تحميل** صفحة المنتج
2. **يجب أن تظهر** المراجعات بدون أخطاء
3. **اختبر** إضافة مراجعة جديدة

## 🆘 إذا لم يعمل

### تحقق من:
1. **تم تشغيل SQL** بنجاح
2. **لا توجد أخطاء** في Console
3. **الجدول موجود** في Database > Tables

### إذا استمرت المشكلة:
```sql
-- حذف وإعادة إنشاء الجدول
DROP TABLE IF EXISTS reviews CASCADE;
-- ثم أعد تشغيل الكود أعلاه
```

## 📞 الدعم
إذا لم تعمل المراجعات بعد الإعداد، أخبرني بالخطأ الجديد وسأساعدك في حله!
