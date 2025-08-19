# دليل نظام البوب أب الاحترافي - Modal System Guide

## 🎯 نظرة عامة

تم استبدال جميع رسائل التأكيد البسيطة (`alert`, `confirm`) بنظام بوب أب احترافي ومتطور يوفر تجربة مستخدم أفضل وأكثر جمالاً.

## ✨ الميزات

- **تصميم احترافي** مع ألوان متدرجة وظلال
- **أيقونات ملونة** حسب نوع الرسالة
- **أزرار تفاعلية** مع ألوان مناسبة
- **دعم لوحة المفاتيح** (ESC لإغلاق)
- **تأثيرات انتقالية** سلسة
- **تخطيط متجاوب** يعمل على جميع الأجهزة

## 🔧 أنواع البوب أب

### 1. رسائل المعلومات (Info)
```tsx
<Modal
  isOpen={showInfoModal}
  onClose={() => setShowInfoModal(false)}
  type="info"
  title="معلومات"
  message="هذه رسالة معلومات عادية"
/>
```

### 2. رسائل النجاح (Success)
```tsx
<Modal
  isOpen={showSuccessModal}
  onClose={() => setShowSuccessModal(false)}
  type="success"
  title="نجح العمل"
  message="تم تنفيذ العملية بنجاح"
/>
```

### 3. رسائل التحذير (Warning)
```tsx
<Modal
  isOpen={showWarningModal}
  onClose={() => setShowWarningModal(false)}
  type="warning"
  title="تحذير"
  message="يرجى الانتباه لهذا التحذير"
/>
```

### 4. رسائل الخطأ (Error)
```tsx
<Modal
  isOpen={showErrorModal}
  onClose={() => setShowErrorModal(false)}
  type="error"
  title="خطأ"
  message="حدث خطأ أثناء تنفيذ العملية"
/>
```

### 5. رسائل التأكيد (Confirm)
```tsx
<Modal
  isOpen={showConfirmModal}
  onClose={() => setShowConfirmModal(false)}
  onConfirm={handleConfirm}
  type="confirm"
  title="تأكيد"
  message="هل أنت متأكد من تنفيذ هذا الإجراء؟"
  confirmText="تأكيد"
  cancelText="إلغاء"
/>
```

## 📱 الاستخدام في الملفات

### صفحة السلة (Cart)
- **تأكيد مسح السلة**: بوب أب احترافي مع رسالة واضحة

### صفحة إدارة الطلبات (Admin Orders)
- **تأكيد حذف الطلب**: بوب أب مع تحذير من عدم إمكانية التراجع
- **رسائل النجاح**: عند تحديث الحالة أو الحذف

### صفحة إدارة المنتجات (Admin Products)
- **تأكيد حذف المنتج**: بوب أب مع اسم المنتج
- **رسائل النجاح**: عند الإضافة/التحديث/الحذف
- **رسائل تحديث الحالة**: عند تغيير حالة المنتج

### صفحة إتمام الطلب (Checkout)
- **طلب تسجيل الدخول**: بوب أب مع خيارات تسجيل الدخول أو إنشاء حساب

## 🎨 التخصيص

### الألوان
- **نجاح**: أخضر
- **خطأ**: أحمر
- **تحذير**: أصفر
- **معلومات**: أزرق
- **تأكيد**: أحمر (للتأكيد على الحذف)

### الأيقونات
- **نجاح**: ✓ (FiCheckCircle)
- **خطأ**: ⚠️ (FiAlertTriangle)
- **تحذير**: ⚠️ (FiAlertTriangle)
- **معلومات**: ℹ️ (FiInfo)
- **تأكيد**: 🗑️ (FiTrash2)

## ⌨️ التفاعل

### لوحة المفاتيح
- **ESC**: إغلاق البوب أب
- **Tab**: التنقل بين الأزرار

### الماوس
- **النقر خارج البوب أب**: إغلاق
- **النقر على زر الإغلاق**: إغلاق
- **النقر على زر التأكيد**: تنفيذ الإجراء

## 🔄 التحديثات المستقبلية

- [ ] إضافة دعم للرسائل المتعددة
- [ ] إضافة خيارات تخصيص إضافية
- [ ] دعم الرسائل المتراكبة
- [ ] إضافة تأثيرات صوتية (اختياري)

## 📝 أمثلة الاستخدام

### إظهار رسالة نجاح
```tsx
const [showSuccessModal, setShowSuccessModal] = useState(false)
const [successMessage, setSuccessMessage] = useState('')

// في دالة النجاح
setSuccessMessage('تم حفظ البيانات بنجاح')
setShowSuccessModal(true)

// في JSX
<Modal
  isOpen={showSuccessModal}
  onClose={() => setShowSuccessModal(false)}
  type="success"
  title="نجح العمل"
  message={successMessage}
/>
```

### تأكيد حذف
```tsx
const [showDeleteModal, setShowDeleteModal] = useState(false)
const [itemToDelete, setItemToDelete] = useState<string | null>(null)

// عند النقر على حذف
function handleDeleteClick(id: string) {
  setItemToDelete(id)
  setShowDeleteModal(true)
}

// دالة الحذف الفعلية
async function handleDelete(id: string) {
  // ... منطق الحذف
  setShowDeleteModal(false)
  setItemToDelete(null)
}

// في JSX
<Modal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
  type="confirm"
  title="تأكيد الحذف"
  message="هل أنت متأكد من حذف هذا العنصر؟"
  confirmText="حذف"
  cancelText="إلغاء"
/>
```

## 🎯 أفضل الممارسات

1. **استخدم النوع المناسب**: اختر `type` مناسب للرسالة
2. **رسائل واضحة**: اكتب رسائل مفهومة ومختصرة
3. **أزرار مناسبة**: استخدم نصوص مناسبة للأزرار
4. **إدارة الحالة**: تأكد من إغلاق البوب أب بعد تنفيذ الإجراء
5. **معالجة الأخطاء**: استخدم بوب أب الخطأ لعرض رسائل الخطأ

## 🆘 استكشاف الأخطاء

### البوب أب لا يظهر
- تأكد من أن `isOpen={true}`
- تحقق من عدم وجود أخطاء في Console
- تأكد من استيراد `Modal` بشكل صحيح

### البوب أب لا يغلق
- تأكد من أن `onClose` يعمل بشكل صحيح
- تحقق من عدم وجود أخطاء في الدالة
- تأكد من تحديث الحالة بشكل صحيح

### الأزرار لا تعمل
- تأكد من تمرير `onConfirm` للبوب أب من نوع `confirm`
- تحقق من أن الدالة `onConfirm` معرفة ومربوطة
- تأكد من عدم وجود أخطاء في الدالة

## 📞 الدعم

إذا واجهت أي مشاكل مع نظام البوب أب، يرجى:
1. التحقق من Console للأخطاء
2. التأكد من صحة props الممررة
3. مراجعة هذا الدليل
4. التواصل للحصول على المساعدة
