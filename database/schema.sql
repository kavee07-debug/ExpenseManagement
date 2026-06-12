-- ============================================================
-- EMA — Expense Management Application
-- PostgreSQL Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE user_role AS ENUM ('employee','manager','md','president','finance','admin');
CREATE TYPE expense_status AS ENUM ('draft','pending','approved','rejected','cancelled','paid');
CREATE TYPE approval_action AS ENUM ('submitted','approved','rejected','delegated','escalated','returned','paid');
CREATE TYPE sync_status AS ENUM ('pending','success','error');
CREATE TYPE notif_type AS ENUM ('approved','rejected','submitted','paid','d365_error','overdue');

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(120)   NOT NULL,
  email         VARCHAR(200)   NOT NULL UNIQUE,
  password_hash VARCHAR(256),
  department    VARCHAR(100),
  role          user_role      NOT NULL DEFAULT 'employee',
  delegate_to   UUID           REFERENCES users(id),
  delegate_until DATE,
  is_active     BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_th               VARCHAR(100) NOT NULL,
  name_en               VARCHAR(100) NOT NULL,
  gl_account            VARCHAR(20)  NOT NULL,
  approval_tier_override INT,
  is_active             BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EXPENSE REQUESTS
-- ============================================================
CREATE TABLE expense_requests (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_no      VARCHAR(20)    NOT NULL UNIQUE,          -- EXP-YYYY-NNNN
  title             VARCHAR(200)   NOT NULL,
  category_id       UUID           NOT NULL REFERENCES categories(id),
  expense_date      DATE           NOT NULL,
  amount            NUMERIC(15,2)  NOT NULL,
  vat_amount        NUMERIC(15,2)  NOT NULL DEFAULT 0,
  currency          VARCHAR(10)    NOT NULL DEFAULT 'THB',
  description       TEXT,
  status            expense_status NOT NULL DEFAULT 'draft',
  created_by        UUID           NOT NULL REFERENCES users(id),
  current_tier      INT            NOT NULL DEFAULT 1,
  current_approver  UUID           REFERENCES users(id),
  submitted_at      TIMESTAMPTZ,
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX idx_expense_requests_created_by ON expense_requests(created_by);
CREATE INDEX idx_expense_requests_status     ON expense_requests(status);
CREATE INDEX idx_expense_requests_reference  ON expense_requests(reference_no);

-- ============================================================
-- ATTACHMENTS
-- ============================================================
CREATE TABLE attachments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id  UUID         NOT NULL REFERENCES expense_requests(id) ON DELETE CASCADE,
  file_name   VARCHAR(255) NOT NULL,
  file_type   VARCHAR(100),
  file_size   INT,
  storage_url VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- APPROVAL LOGS
-- ============================================================
CREATE TABLE approval_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id  UUID            NOT NULL REFERENCES expense_requests(id) ON DELETE CASCADE,
  tier        INT             NOT NULL DEFAULT 1,
  action      approval_action NOT NULL,
  actor_id    UUID            REFERENCES users(id),
  actor_name  VARCHAR(120),              -- denormalized for audit trail
  comment     TEXT,
  timestamp   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_approval_logs_request ON approval_logs(request_id);

-- ============================================================
-- D365 SYNC LOGS
-- ============================================================
CREATE TABLE d365_sync_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id    UUID        NOT NULL REFERENCES expense_requests(id),
  ap_invoice_no VARCHAR(50),
  sync_status   sync_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  retry_count   INT         NOT NULL DEFAULT 0,
  synced_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES users(id),
  type       notif_type  NOT NULL,
  title      VARCHAR(200) NOT NULL,
  message    TEXT,
  is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
  link_to    VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_expenses_updated_at
  BEFORE UPDATE ON expense_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- REFERENCE_NO SEQUENCE
-- ============================================================
CREATE SEQUENCE expense_seq START 1;

CREATE OR REPLACE FUNCTION next_reference_no()
RETURNS VARCHAR AS $$
BEGIN
  RETURN 'EXP-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(nextval('expense_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
