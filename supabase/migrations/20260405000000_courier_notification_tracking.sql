-- Migration: Add courier, notification, and tracking tables
-- Run this in Supabase SQL Editor

-- ============================================
-- COURIER ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS courier_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  courier_id TEXT NOT NULL,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'on_the_way', 'delivered', 'cancelled')),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  priority INT DEFAULT 0,
  sequence_no INT,
  earnings_amount NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courier_assignments_order ON courier_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_courier_assignments_courier ON courier_assignments(courier_id);
CREATE INDEX IF NOT EXISTS idx_courier_assignments_status ON courier_assignments(status);

-- ============================================
-- COURIER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS courier_profiles (
  id TEXT PRIMARY KEY,
  is_online BOOLEAN DEFAULT false,
  current_latitude DOUBLE PRECISION,
  current_longitude DOUBLE PRECISION,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- COURIER DAILY STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS courier_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  courier_id TEXT NOT NULL,
  stat_date DATE NOT NULL,
  delivered_count INT DEFAULT 0,
  cancelled_count INT DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(courier_id, stat_date)
);

CREATE INDEX IF NOT EXISTS idx_courier_daily_stats_courier ON courier_daily_stats(courier_id);
CREATE INDEX IF NOT EXISTS idx_courier_daily_stats_date ON courier_daily_stats(stat_date);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type TEXT NOT NULL CHECK (user_type IN ('courier', 'customer', 'admin', 'kitchen')),
  user_ref TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_type, user_ref);
CREATE INDEX IF NOT EXISTS idx_notifications_order ON notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_type, user_ref, is_read) WHERE is_read = false;

-- ============================================
-- ORDER STATUS HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created ON order_status_history(created_at);

-- ============================================
-- ADD TIMESTAMP COLUMNS TO ORDERS IF NOT EXISTS
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'accepted_at') THEN
    ALTER TABLE orders ADD COLUMN accepted_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'preparing_at') THEN
    ALTER TABLE orders ADD COLUMN preparing_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'ready_at') THEN
    ALTER TABLE orders ADD COLUMN ready_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'on_the_way_at') THEN
    ALTER TABLE orders ADD COLUMN on_the_way_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivered_at') THEN
    ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'courier_latitude') THEN
    ALTER TABLE orders ADD COLUMN courier_latitude DOUBLE PRECISION;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'courier_longitude') THEN
    ALTER TABLE orders ADD COLUMN courier_longitude DOUBLE PRECISION;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'estimated_delivery_at') THEN
    ALTER TABLE orders ADD COLUMN estimated_delivery_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'delivery_fee') THEN
    ALTER TABLE orders ADD COLUMN delivery_fee NUMERIC DEFAULT 15000;
  END IF;
END $$;

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE courier_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courier_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courier_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Allow public read on courier assignments
CREATE POLICY "Public can read courier assignments" ON courier_assignments FOR SELECT USING (true);
CREATE POLICY "Service role can all on courier assignments" ON courier_assignments FOR ALL USING (auth.role() = 'service_role');

-- Allow public read on notifications (filtered by user)
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Service role can all on notifications" ON notifications FOR ALL USING (auth.role() = 'service_role');

-- Allow public read on order status history
CREATE POLICY "Public can read order status history" ON order_status_history FOR SELECT USING (true);
CREATE POLICY "Service role can all on order status history" ON order_status_history FOR ALL USING (auth.role() = 'service_role');

-- Allow courier profiles read
CREATE POLICY "Public can read courier profiles" ON courier_profiles FOR SELECT USING (true);
CREATE POLICY "Public can update own courier profile" ON courier_profiles FOR UPDATE USING (true);

-- Allow courier daily stats read for own stats
CREATE POLICY "Couriers can read own stats" ON courier_daily_stats FOR SELECT USING (true);
CREATE POLICY "Service role can all on courier daily stats" ON courier_daily_stats FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================
-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE courier_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE order_status_history;

-- ============================================
-- SCHEMA CACHE REFRESH
-- ============================================
NOTIFY pgrst, 'reload schema';
