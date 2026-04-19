-- ============================================================
-- Disha Family Messaging — V1 Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- User profiles (minimal — one row per device)
CREATE TABLE IF NOT EXISTS app_users (
  id               UUID        PRIMARY KEY,
  name             TEXT        NOT NULL,
  role             TEXT        NOT NULL CHECK (role IN ('supporter', 'parent')),
  link_code        TEXT        UNIQUE,                    -- 6-char code parents generate
  push_token       TEXT,                                  -- Expo push token for notifications
  linked_user_id   UUID        REFERENCES app_users(id), -- supporter's linked parent
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Family messages
CREATE TABLE IF NOT EXISTS family_messages (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID        NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  receiver_id  UUID        NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  sender_name  TEXT        NOT NULL,
  text_en      TEXT        NOT NULL,
  text_or      TEXT        NOT NULL,
  is_read      BOOLEAN     DEFAULT FALSE,
  is_done      BOOLEAN     DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast inbox / sent queries
CREATE INDEX IF NOT EXISTS idx_msg_receiver ON family_messages (receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_msg_sender   ON family_messages (sender_id,   created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_link   ON app_users (link_code);

-- Enable Row Level Security
ALTER TABLE app_users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_messages ENABLE ROW LEVEL SECURITY;

-- V1: open policies (tighten with auth in V2)
CREATE POLICY "v1_app_users_all"      ON app_users      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "v1_family_messages_all" ON family_messages FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for parent inbox live updates
ALTER PUBLICATION supabase_realtime ADD TABLE family_messages;

-- ============================================================
-- Sample seed data for testing
-- ============================================================
-- Replace UUIDs with real ones after creating users via the app.
--
-- INSERT INTO app_users (id, name, role, link_code) VALUES
--   ('11111111-0000-0000-0000-000000000001', 'Priya (Supporter)', 'supporter', NULL),
--   ('22222222-0000-0000-0000-000000000002', 'Ama (Parent)',      'parent',    'ABC123');
--
-- UPDATE app_users SET linked_user_id = '22222222-0000-0000-0000-000000000002'
--   WHERE id = '11111111-0000-0000-0000-000000000001';
--
-- INSERT INTO family_messages (sender_id, receiver_id, sender_name, text_en, text_or) VALUES
--   ('11111111-0000-0000-0000-000000000001',
--    '22222222-0000-0000-0000-000000000002',
--    'Priya',
--    'I sent you 1000 INR. Please go to ATM.',
--    'ମୁଁ ₹1000 ପଠାଇଛି। ଦୟାକରି ATM କୁ ଯାଅ।'),
--   ('11111111-0000-0000-0000-000000000001',
--    '22222222-0000-0000-0000-000000000002',
--    'Priya',
--    'Please take medicine after dinner.',
--    'ଦୟାକରି ରାତ ଖାଇବା ପରେ ଔଷଧ ଖାଅ।');
-- ============================================================
