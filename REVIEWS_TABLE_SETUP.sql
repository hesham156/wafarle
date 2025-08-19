-- إنشاء جدول المراجعات (Reviews)
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

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- إنشاء جدول مراجعات المستخدمين (User Reviews)
CREATE TABLE IF NOT EXISTS user_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id) -- منع المراجعات المتعددة لنفس المنتج من نفس المستخدم
);

-- إنشاء فهارس لجدول مراجعات المستخدمين
CREATE INDEX IF NOT EXISTS idx_user_reviews_user_id ON user_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_product_id ON user_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_rating ON user_reviews(rating);

-- إضافة بيانات تجريبية للمراجعات
INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000001', 5, 'ممتاز جداً', 'برنامج رائع وسهل الاستخدام، أنصح به بشدة!', true),
    ('550e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000002', 4, 'جيد جداً', 'أداء ممتاز وسعر معقول', true),
    ('550e8400-e29b-41d4-a716-446655440002', '00000000-0000-0000-0000-000000000001', 5, 'أفضل برنامج', 'استخدمه يومياً في عملي، ممتاز!', true),
    ('550e8400-e29b-41d4-a716-446655440003', '00000000-0000-0000-0000-000000000003', 4, 'مفيد جداً', 'يساعدني كثيراً في تصميم المشاريع', true),
    ('550e8400-e29b-41d4-a716-446655440004', '00000000-0000-0000-0000-000000000002', 5, 'ممتاز', 'أفضل استثمار في البرامج', true)
ON CONFLICT (id) DO NOTHING;

-- إنشاء دالة لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء triggers لتحديث updated_at
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_reviews_updated_at BEFORE UPDATE ON user_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إضافة RLS (Row Level Security)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للمراجعات
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
    FOR DELETE USING (auth.uid() = user_id);

-- سياسات RLS لمراجعات المستخدمين
CREATE POLICY "User reviews are viewable by everyone" ON user_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews" ON user_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON user_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON user_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- إضافة عمود reviews_count إلى جدول products إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'reviews_count') THEN
        ALTER TABLE products ADD COLUMN reviews_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- إضافة عمود average_rating إلى جدول products إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'average_rating') THEN
        ALTER TABLE products ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0.00;
    END IF;
END $$;

-- دالة لتحديث إحصائيات المراجعات
CREATE OR REPLACE FUNCTION update_product_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        -- تحديث عدد المراجعات والمتوسط
        UPDATE products 
        SET 
            reviews_count = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
            ),
            average_rating = (
                SELECT COALESCE(AVG(rating), 0.00) 
                FROM reviews 
                WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
            )
        WHERE id = COALESCE(NEW.product_id, OLD.product_id);
        
        RETURN COALESCE(NEW, OLD);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger لتحديث الإحصائيات
DROP TRIGGER IF EXISTS trigger_update_product_review_stats ON reviews;
CREATE TRIGGER trigger_update_product_review_stats
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_review_stats();

-- تحديث الإحصائيات الحالية
UPDATE products 
SET 
    reviews_count = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE product_id = products.id
    ),
    average_rating = (
        SELECT COALESCE(AVG(rating), 0.00) 
        FROM reviews 
        WHERE product_id = products.id
    );

-- عرض الجداول المنشأة
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('reviews', 'user_reviews')
ORDER BY table_name, ordinal_position;

-- عرض البيانات التجريبية
SELECT 
    r.id,
    p.name as product_name,
    r.rating,
    r.title,
    r.comment,
    r.is_verified,
    r.created_at
FROM reviews r
JOIN products p ON r.product_id = p.id
ORDER BY r.created_at DESC;
