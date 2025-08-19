# إعداد Supabase

## ✅ تم إعداد Supabase بنجاح!

### البيانات المُستخدمة:
- **Project URL**: `https://tpvnaizaiyyajuxfwqqa.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwdm5haXphaXl5YWp1eGZ3cXFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTM2NjEsImV4cCI6MjA3MTAyOTY2MX0.uDjXJiv2NOSrcyNwvkJUi-V61AhScXvLHdIv5fpKaEY`

## الخطوات المطلوبة:

### 1. إنشاء ملف البيئة
أنشئ ملف `.env.local` في مجلد المشروع وأضف:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tpvnaizaiyyajuxfwqqa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwdm5haXphaXl5YWp1eGZ3cXFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTM2NjEsImV4cCI6MjA3MTAyOTY2MX0.uDjXJiv2NOSrcyNwvkJUi-V61AhScXvLHdIv5fpKaEY
```

### 2. إنشاء جداول في Supabase
اذهب إلى لوحة تحكم Supabase وأنشئ الجداول المطلوبة.

### 3. استخدام Supabase في الكود
```typescript
import { supabase } from '@/lib/supabase'

// مثال على استعلام
const { data, error } = await supabase
  .from('your_table')
  .select('*')
```

## الملفات المُنشأة:
- `src/lib/supabase.ts` - إعداد Supabase client
- `src/types/supabase.ts` - أنواع TypeScript
- `src/components/SupabaseExample.tsx` - مكون مثال
- `SUPABASE_SETUP.md` - هذا الملف

## الملفات المطلوبة:
- `.env.local` - متغيرات البيئة (أنشئه يدوياً)
