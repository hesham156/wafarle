-- إعادة إنشاء جداول الطلبات من الصفر
-- تحذير: هذا سيحذف جميع البيانات الموجودة في الجداول

-- حذف الجداول الموجودة (إذا كانت موجودة)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- حذف الدوال والـ triggers (إذا كانت موجودة)
DROP FUNCTION IF EXISTS update_orders_updated_at() CASCADE;

-- إنشاء جدول الطلبات (Orders) من جديد
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'completed', 'cancelled')),
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('card', 'paypal', 'bank_transfer')),
  contact_info JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول عناصر الطلبات (Order Items) من جديد
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- إنشاء trigger لتحديث updated_at في جدول الطلبات
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- تمكين Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للطلبات
-- المستخدم يمكنه رؤية طلباته فقط
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- المستخدم يمكنه إنشاء طلبات جديدة
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- المستخدم يمكنه تحديث طلباته
CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

-- سياسات RLS لعناصر الطلبات
-- المستخدم يمكنه رؤية عناصر طلباته فقط
CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- المستخدم يمكنه إنشاء عناصر طلبات جديدة
CREATE POLICY "Users can create order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- إضافة تعليقات للجداول
COMMENT ON TABLE orders IS 'جدول الطلبات الرئيسية';
COMMENT ON COLUMN orders.id IS 'معرف فريد للطلب';
COMMENT ON COLUMN orders.user_id IS 'معرف المستخدم صاحب الطلب';
COMMENT ON COLUMN orders.total_amount IS 'إجمالي مبلغ الطلب';
COMMENT ON COLUMN orders.status IS 'حالة الطلب (pending, paid, completed, cancelled)';
COMMENT ON COLUMN orders.payment_method IS 'طريقة الدفع المستخدمة';
COMMENT ON COLUMN orders.contact_info IS 'معلومات الاتصال بالعميل (JSON)';
COMMENT ON COLUMN orders.created_at IS 'تاريخ إنشاء الطلب';
COMMENT ON COLUMN orders.updated_at IS 'تاريخ آخر تحديث للطلب';

COMMENT ON TABLE order_items IS 'جدول عناصر الطلبات';
COMMENT ON COLUMN order_items.id IS 'معرف فريد لعنصر الطلب';
COMMENT ON COLUMN order_items.order_id IS 'معرف الطلب الذي ينتمي إليه العنصر';
COMMENT ON COLUMN order_items.product_id IS 'معرف المنتج';
COMMENT ON COLUMN order_items.quantity IS 'كمية المنتج المطلوبة';
COMMENT ON COLUMN order_items.price IS 'سعر المنتج وقت الطلب';
COMMENT ON COLUMN order_items.created_at IS 'تاريخ إنشاء عنصر الطلب';

-- التحقق من إنشاء الجداول
SELECT 'orders' as table_name, count(*) as row_count FROM orders
UNION ALL
SELECT 'order_items' as table_name, count(*) as row_count FROM order_items;

-- إظهار هيكل الجداول
\d orders
\d order_items
