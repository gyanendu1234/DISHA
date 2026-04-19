-- ============================================================
-- Disha — Quick Messages V1
-- Run AFTER 001_family_messages.sql (app_users must exist first)
-- ============================================================

CREATE TABLE IF NOT EXISTS quick_messages (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID        NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  receiver_id  UUID        NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  sender_name  TEXT        NOT NULL,
  text_en      TEXT        NOT NULL,
  text_or      TEXT        NOT NULL,
  is_read      BOOLEAN     NOT NULL DEFAULT FALSE,
  is_done      BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_qmsg_receiver ON quick_messages (receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qmsg_sender   ON quick_messages (sender_id,   created_at DESC);

-- Auto-update updated_at (reuse function from schema.sql if already created)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quick_messages_updated_at
  BEFORE UPDATE ON quick_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE quick_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "v1_quick_messages_all" ON quick_messages FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime (required for live inbox + supporter status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE quick_messages;
