# 🚀 بدء سريع - Next.js + Supabase

## ⚡ الخطوات السريعة:

### 1. إنشاء ملف البيئة
أنشئ ملف `.env.local` في مجلد المشروع وأضف:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tpvnaizaiyyajuxfwqqa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwdm5haXphaXl5YWp1eGZ3cXFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTM2NjEsImV4cCI6MjA3MTAyOTY2MX0.uDjXJiv2NOSrcyNwvkJUi-V61AhScXvLHdIv5fpKaEY
```

### 2. بدء التطبيق
```bash
npm run dev
```

### 3. فتح المتصفح
اذهب إلى: http://localhost:3000

### 4. اختبار Supabase
- اضغط "اختبار الاتصال" للتأكد من عمل Supabase
- أدخل اسم الجدول الذي تريد استعلامه
- اضغط "جلب البيانات"

## 📁 الملفات المهمة:
- `.env.local` - متغيرات البيئة (أنشئه يدوياً)
- `src/lib/supabase.ts` - إعداد Supabase
- `src/components/SupabaseExample.tsx` - مكون الاختبار

## 🔧 إعداد قاعدة البيانات:
1. اذهب إلى [لوحة تحكم Supabase](https://supabase.com/dashboard)
2. اختر مشروعك: `tpvnaizaiyyajuxfwqqa`
3. اذهب إلى Table Editor
4. أنشئ الجداول المطلوبة

## 📚 أمثلة على الاستخدام:
```typescript
import { supabase } from '@/lib/supabase'

// جلب بيانات
const { data, error } = await supabase
  .from('users')
  .select('*')

// إضافة بيانات
const { data, error } = await supabase
  .from('users')
  .insert([{ name: 'أحمد', email: 'ahmed@example.com' }])

// تحديث بيانات
const { data, error } = await supabase
  .from('users')
  .update({ name: 'محمد' })
  .eq('id', 1)
```

## 🆘 المساعدة:
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
