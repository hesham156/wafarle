-- إنشاء جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الطلبات
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول تفاصيل الطلبات
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المفضلة
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- إنشاء جدول سلة المشتريات
CREATE TABLE IF NOT EXISTS cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);

-- إنشاء دالة لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء triggers لتحديث updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إدخال بيانات تجريبية للمنتجات
INSERT INTO products (name, description, price, category, image_url, is_active) VALUES
('Adobe Photoshop', 'برنامج التصميم الاحترافي الأكثر شهرة في العالم', 299.99, 'برامج التصميم', 'https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Photoshop', true),
('Adobe Illustrator', 'برنامج الرسم المتجهي الاحترافي', 249.99, 'برامج التصميم', 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Illustrator', true),
('Adobe Premiere Pro', 'برنامج تحرير الفيديو الاحترافي', 399.99, 'برامج الفيديو', 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Premiere+Pro', true),
('Adobe After Effects', 'برنامج التأثيرات البصرية والرسوم المتحركة', 349.99, 'برامج الفيديو', 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=After+Effects', true),
('Figma Pro', 'أداة التصميم التعاوني للفرق', 199.99, 'أدوات التصميم', 'https://via.placeholder.com/300x200/EF4444/FFFFFF?text=Figma+Pro', true),
('JetBrains IntelliJ IDEA', 'بيئة التطوير المتكاملة لـ Java', 299.99, 'برامج التطوير', 'https://via.placeholder.com/300x200/06B6D4/FFFFFF?text=IntelliJ+IDEA', true),
('Visual Studio Code Pro', 'محرر الكود المتقدم مع الميزات الاحترافية', 99.99, 'برامج التطوير', 'https://via.placeholder.com/300x200/7C3AED/FFFFFF?text=VS+Code+Pro', true),
('Microsoft Office 365', 'حزمة المكتب المتكاملة مع التخزين السحابي', 199.99, 'برامج الإنتاجية', 'https://via.placeholder.com/300x200/DC2626/FFFFFF?text=Office+365', true),
('Notion Pro', 'أداة إدارة المعرفة والمشاريع', 149.99, 'برامج الإنتاجية', 'https://via.placeholder.com/300x200/000000/FFFFFF?text=Notion+Pro', true),
('Slack Pro', 'منصة التواصل والتعاون للفرق', 179.99, 'برامج الإنتاجية', 'https://via.placeholder.com/300x200/4A154B/FFFFFF?text=Slack+Pro', true);

-- منح الصلاحيات للمستخدمين
GRANT ALL ON products TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_items TO authenticated;
GRANT ALL ON wishlist TO authenticated;
GRANT ALL ON cart TO authenticated;

-- منح الصلاحيات للمشرفين
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
