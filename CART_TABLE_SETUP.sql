-- إنشاء جدول السلة (Cart)
CREATE TABLE IF NOT EXISTS cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product_id ON cart(product_id);

-- إنشاء trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cart_updated_at
  BEFORE UPDATE ON cart
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_updated_at();

-- تمكين Row Level Security (RLS)
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للسلة
-- المستخدم يمكنه رؤية سلة التسوق الخاصة به فقط
CREATE POLICY "Users can view their own cart" ON cart
  FOR SELECT USING (auth.uid() = user_id);

-- المستخدم يمكنه إضافة منتجات إلى سلة التسوق الخاصة به
CREATE POLICY "Users can insert into their own cart" ON cart
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- المستخدم يمكنه تحديث سلة التسوق الخاصة به
CREATE POLICY "Users can update their own cart" ON cart
  FOR UPDATE USING (auth.uid() = user_id);

-- المستخدم يمكنه حذف من سلة التسوق الخاصة به
CREATE POLICY "Users can delete from their own cart" ON cart
  FOR DELETE USING (auth.uid() = user_id);

-- إضافة تعليقات للجدول
COMMENT ON TABLE cart IS 'جدول سلة التسوق للمستخدمين';
COMMENT ON COLUMN cart.id IS 'معرف فريد للعنصر في السلة';
COMMENT ON COLUMN cart.user_id IS 'معرف المستخدم صاحب السلة';
COMMENT ON COLUMN cart.product_id IS 'معرف المنتج المضاف للسلة';
COMMENT ON COLUMN cart.quantity IS 'كمية المنتج في السلة';
COMMENT ON COLUMN cart.created_at IS 'تاريخ إضافة المنتج للسلة';
COMMENT ON COLUMN cart.updated_at IS 'تاريخ آخر تحديث للعنصر';
