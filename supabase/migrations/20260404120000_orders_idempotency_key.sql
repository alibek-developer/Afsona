-- Website checkout: prevent duplicate orders / double payment when the same idempotency key is reused.
-- Run in Supabase SQL Editor or via supabase db push.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Partial unique index: multiple legacy NULLs allowed; each non-null key at most once.
CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_key_unique
  ON orders (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

COMMENT ON COLUMN orders.idempotency_key IS 'Client-generated UUID for idempotent checkout; first write wins.';
