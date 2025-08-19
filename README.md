# مشروع Next.js + Supabase

هذا مشروع [Next.js](https://nextjs.org/) تم إنشاؤه باستخدام [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## الميزات

- ✅ **Next.js 15** مع App Router
- ✅ **TypeScript** للتطوير الآمن
- ✅ **Tailwind CSS** لتصميم الواجهة
- ✅ **Supabase** كقاعدة بيانات
- ✅ **ESLint** لضمان جودة الكود

## البدء

أولاً، قم بتشغيل خادم التطوير:

```bash
npm run dev
# أو
yarn dev
# أو
pnpm dev
# أو
bun dev
```

افتح [http://localhost:3000](http://localhost:3000) في متصفحك لرؤية النتيجة.

## إعداد Supabase

### 1. إنشاء مشروع Supabase
- اذهب إلى [supabase.com](https://supabase.com)
- أنشئ حساب جديد أو سجل دخول
- أنشئ مشروع جديد

### 2. إعداد متغيرات البيئة
أنشئ ملف `.env.local` في مجلد المشروع وأضف:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. الحصول على البيانات المطلوبة
- من لوحة تحكم Supabase، اذهب إلى Settings > API
- انسخ:
  - Project URL
  - anon/public key

## هيكل المشروع

```
src/
├── app/                    # App Router
│   ├── page.tsx           # الصفحة الرئيسية
│   ├── layout.tsx         # التخطيط الأساسي
│   └── globals.css        # الأنماط العامة
├── components/             # المكونات
│   └── SupabaseExample.tsx
├── lib/                    # المكتبات
│   └── supabase.ts        # إعداد Supabase
└── types/                  # أنواع TypeScript
    └── supabase.ts        # أنواع Supabase
```

## استخدام Supabase

```typescript
import { supabase } from '@/lib/supabase'

// مثال على استعلام
const { data, error } = await supabase
  .from('your_table')
  .select('*')
```

## الأوامر المتاحة

- `npm run dev` - بدء خادم التطوير
- `npm run build` - بناء التطبيق للإنتاج
- `npm run start` - بدء خادم الإنتاج
- `npm run lint` - فحص جودة الكود

## تعلم المزيد

لتعلم المزيد عن Next.js:

- [Next.js Documentation](https://nextjs.org/docs) - تعلم Next.js
- [Next.js GitHub](https://github.com/vercel/next.js/) - GitHub repository

لتعلم المزيد عن Supabase:

- [Supabase Documentation](https://supabase.com/docs) - تعلم Supabase
- [Supabase GitHub](https://github.com/supabase/supabase) - GitHub repository

## النشر

أسهل طريقة لنشر تطبيق Next.js هي استخدام [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

تحقق من [Next.js deployment documentation](https://nextjs.org/docs/deployment) للمزيد من التفاصيل.
# wafarle
