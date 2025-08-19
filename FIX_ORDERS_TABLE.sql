-- إصلاح جدول الطلبات - إضافة العمود المفقود
-- قم بتشغيل هذا الملف إذا كان جدول orders موجود بدون عمود payment_method

-- إضافة عمود payment_method إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50);
    END IF;
END $$;

-- تحديث القيم الموجودة (اختياري)
UPDATE orders SET payment_method = 'card' WHERE payment_method IS NULL;

-- جعل العمود إلزامي
ALTER TABLE orders ALTER COLUMN payment_method SET NOT NULL;

-- إضافة constraint للقيم المسموحة
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
CHECK (payment_method IN ('card', 'paypal', 'bank_transfer'));

-- التحقق من وجود الجدول
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- إظهار هيكل الجدول
\d orders
