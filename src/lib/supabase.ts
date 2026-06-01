import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// These variables must be provided in the .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export type OrderItem = {
  id?: string;
  order_id?: string;
  product_name: string;
  variant_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  landmark?: string;
  notes?: string;
  subtotal: number;
  delivery_charge: number;
  total: number;
  payment_method: string;
  status: OrderStatus;
  created_at: string;
  order_items?: OrderItem[];
};
