-- =====================================================================================
-- SEED DATA FILE - TAWA SHAWARMA RESTAURANT CMS
-- =====================================================================================
-- Run this script AFTER 01_master_schema.sql to populate the database with default 
-- settings and sample menu data so the storefront is immediately usable.
-- =====================================================================================

-- --------------------------------------------------------
-- 1. SETTINGS
-- --------------------------------------------------------
INSERT INTO settings (key, value) VALUES 
('business_info', '{
  "name": "Tawa Shawarma",
  "tagline": "Always Fresh & Delicious",
  "phone": "+91 9876543210",
  "whatsapp": "919876543210",
  "email": "contact@tawashawarma.com",
  "address": "Necklace Road, Barkat Complex, Nanded",
  "maps_link": "https://maps.google.com",
  "opening_hours": "4:00 PM - 12:00 AM",
  "facebook": "https://facebook.com",
  "instagram": "https://instagram.com"
}'::jsonb),
('delivery_settings', '{
  "delivery_charge": 40,
  "min_order": 150,
  "free_delivery_threshold": 500
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;


-- --------------------------------------------------------
-- 2. CATEGORIES
-- --------------------------------------------------------
-- Use explicit UUIDs so we can reference them in items
WITH cat_shawarma AS (
  INSERT INTO categories (id, name, description, sort_order) 
  VALUES ('a0000000-0000-0000-0000-000000000001', 'Shawarma', 'Authentic Arabic Shawarma', 1) 
  RETURNING id
),
cat_burger AS (
  INSERT INTO categories (id, name, description, sort_order) 
  VALUES ('a0000000-0000-0000-0000-000000000002', 'Burgers', 'Juicy grilled burgers', 2) 
  RETURNING id
),
cat_pizza AS (
  INSERT INTO categories (id, name, description, sort_order) 
  VALUES ('a0000000-0000-0000-0000-000000000003', 'Pizza', 'Freshly baked thin crust pizza', 3) 
  RETURNING id
)
SELECT 1;

-- --------------------------------------------------------
-- 3. MENU ITEMS & VARIANTS
-- --------------------------------------------------------
-- Shawarma Item
INSERT INTO menu_items (id, category_id, name, description, is_veg) VALUES 
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Chicken Cheese Shawarma', 'Classic roasted chicken with extra cheese and garlic sauce', false);

INSERT INTO item_variants (item_id, name, price, is_default) VALUES
('b0000000-0000-0000-0000-000000000001', 'Regular', 90, true),
('b0000000-0000-0000-0000-000000000001', 'Large (Jumbo)', 130, false);

-- Burger Item
INSERT INTO menu_items (id, category_id, name, description, is_veg) VALUES 
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Zinger Burger', 'Crispy fried chicken breast with spicy mayo', false);

INSERT INTO item_variants (item_id, name, price, is_default) VALUES
('b0000000-0000-0000-0000-000000000002', 'Standard', 110, true),
('b0000000-0000-0000-0000-000000000002', 'Double Patty', 160, false);

-- Pizza Item
INSERT INTO menu_items (id, category_id, name, description, is_veg) VALUES 
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Veggie Supreme Pizza', 'Onion, capsicum, tomato, mushrooms, and black olives', true);

INSERT INTO item_variants (item_id, name, price, is_default) VALUES
('b0000000-0000-0000-0000-000000000003', 'Small (6")', 120, false),
('b0000000-0000-0000-0000-000000000003', 'Medium (9")', 200, true),
('b0000000-0000-0000-0000-000000000003', 'Large (12")', 350, false);


-- --------------------------------------------------------
-- 4. REVIEWS
-- --------------------------------------------------------
INSERT INTO reviews (customer_name, rating, comment) VALUES 
('Rahul M.', 5, 'Best shawarma in Nanded. Fresh and tasty. I order here every weekend!'),
('Priya S.', 5, 'Great food quality and quick service. The cheese shawarma is absolutely amazing.'),
('Amit K.', 5, 'Affordable prices and delicious taste. Their peri peri fries are addictive!');
