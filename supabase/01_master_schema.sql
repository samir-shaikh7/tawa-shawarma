-- =====================================================================================
-- MASTER SCHEMA FILE - TAWA SHAWARMA RESTAURANT CMS
-- =====================================================================================
-- Use this file to set up a brand new Supabase project. 
-- It creates all tables, views, sequences, triggers, and Row Level Security policies.
-- =====================================================================================

-- --------------------------------------------------------
-- 1. DROP EXISTING CONSTRUCTS (For safe re-runs)
-- --------------------------------------------------------
DROP VIEW IF EXISTS customers_view CASCADE;
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS customer_status CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS item_variants CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- --------------------------------------------------------
-- 2. CREATE CORE CMS TABLES
-- --------------------------------------------------------
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_veg BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_out_of_stock BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE item_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------
-- 3. CREATE ORDER & CUSTOMER TABLES
-- --------------------------------------------------------
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  landmark TEXT,
  notes TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery',
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE customer_status (
  phone TEXT PRIMARY KEY,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  record_type TEXT NOT NULL,
  record_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------
-- 4. CREATE VIEWS
-- --------------------------------------------------------
CREATE VIEW customers_view AS
SELECT 
  MAX(o.customer_name) as customer_name,
  o.phone,
  COUNT(o.id) as total_orders,
  MAX(o.created_at) as last_order_date,
  SUM(o.total) as total_spent,
  COALESCE(cs.is_deleted, false) as is_deleted,
  cs.deleted_at
FROM orders o
LEFT JOIN customer_status cs ON o.phone = cs.phone
GROUP BY o.phone, cs.is_deleted, cs.deleted_at;

-- --------------------------------------------------------
-- 5. CREATE SEQUENCES & TRIGGERS
-- --------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;

CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'TS-' || nextval('order_number_seq')::TEXT;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_orders
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_number();

-- --------------------------------------------------------
-- 6. ENABLE REALTIME
-- --------------------------------------------------------
-- This must be enabled for the Admin Dashboard to receive live order notifications
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- --------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS)
-- --------------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Categories (Public Read, Admin Write)
CREATE POLICY "Public can read active categories" ON categories FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
CREATE POLICY "Admin full access categories" ON categories USING (auth.role() = 'authenticated');

-- Menu Items (Public Read, Admin Write)
CREATE POLICY "Public can read active menu items" ON menu_items FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
CREATE POLICY "Admin full access menu_items" ON menu_items USING (auth.role() = 'authenticated');

-- Variants (Public Read, Admin Write)
CREATE POLICY "Public can read active variants" ON item_variants FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
CREATE POLICY "Admin full access item_variants" ON item_variants USING (auth.role() = 'authenticated');

-- Reviews (Public Read, Admin Write)
CREATE POLICY "Public can read published reviews" ON reviews FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "Admin full access reviews" ON reviews USING (auth.role() = 'authenticated');

-- Settings (Public Read, Admin Write)
CREATE POLICY "Public can read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admin full access settings" ON settings USING (auth.role() = 'authenticated');

-- Orders (Public Create & Read, Admin Update & Delete)
CREATE POLICY "Allow public inserts on orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public tracking on orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow admin updates on orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin deletes on orders" ON orders FOR DELETE USING (auth.role() = 'authenticated');

-- Order Items
CREATE POLICY "Allow public inserts on order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public reads on order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Allow admin updates on order_items" ON order_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin deletes on order_items" ON order_items FOR DELETE USING (auth.role() = 'authenticated');

-- Customer Status (Public Read, Admin Write)
CREATE POLICY "Admin full access customer_status" ON customer_status USING (auth.role() = 'authenticated');
CREATE POLICY "Public read customer_status" ON customer_status FOR SELECT USING (true);

-- Admin Logs (Admin Only)
CREATE POLICY "Admin insert logs" ON admin_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin read logs" ON admin_logs FOR SELECT USING (auth.role() = 'authenticated');
