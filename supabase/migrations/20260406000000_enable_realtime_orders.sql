-- Enable realtime for the orders table
-- Run this in Supabase SQL Editor or via supabase db push
-- This is the ROOT CAUSE fix for kitchen panel not receiving new orders in realtime

-- Add orders table to the supabase_realtime publication
-- Use DO block to handle "already exists" gracefully
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  RAISE NOTICE 'orders table added to supabase_realtime publication';
EXCEPTION WHEN duplicate_table THEN
  RAISE NOTICE 'orders table already in supabase_realtime publication';
END $$;

-- Also ensure other tables are published (from previous migration)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE courier_assignments;
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE order_status_history;
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- Verify: run this query to confirm orders is published:
-- SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
