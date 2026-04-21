-- ============================================================
-- Orbit Tech — Initial Schema
-- Multi-tenant library management SaaS for South African schools
-- Architecture Document: TA_TechDoc_OrbitTech_Architecture_V1_Apr2026
-- ============================================================

-- Helper: auto-update updated_at on any table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================
-- TABLE: institutions
-- Top-level tenant. Every row of every other table is scoped
-- to an institution_id that references this table.
-- ============================================================
CREATE TABLE institutions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  slug                 TEXT UNIQUE NOT NULL,           -- e.g. tshiamiso-astronauts
  tier                 SMALLINT NOT NULL,              -- 1=Private, 2=Corporate CSI, 3=No-fee Public
  type                 TEXT NOT NULL,                  -- school | library | corporate | community_centre
  province             TEXT NOT NULL,
  district             TEXT,                           -- DBE district (Tier 3 required)
  emis_number          TEXT UNIQUE,                    -- DBE EMIS number (public schools)
  address              JSONB,                          -- { street, suburb, city, postal_code }
  contact_email        TEXT NOT NULL,
  contact_phone        TEXT,
  subscription_status  TEXT NOT NULL DEFAULT 'trial',  -- active | trial | suspended | free
  subscription_ends_at TIMESTAMPTZ,                    -- NULL for Tier 3 (permanent free)
  max_books            INTEGER DEFAULT 500,
  max_members          INTEGER DEFAULT 200,
  settings             JSONB DEFAULT '{}',
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER institutions_updated_at
  BEFORE UPDATE ON institutions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================
-- TABLE: profiles
-- One row per authenticated user. id matches auth.users.id.
-- ============================================================
CREATE TABLE profiles (
  id             UUID PRIMARY KEY,                     -- matches auth.users.id
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  email          TEXT NOT NULL,
  full_name      TEXT NOT NULL,
  role           TEXT NOT NULL,                        -- super_admin | admin | librarian | teacher | viewer
  phone          TEXT,
  avatar_url     TEXT,
  is_active      BOOLEAN DEFAULT TRUE,
  last_login_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: books
-- Physical book copies held by an institution.
-- ============================================================
CREATE TABLE books (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id     UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  isbn_13            TEXT NOT NULL,
  isbn_10            TEXT,
  title              TEXT NOT NULL,
  subtitle           TEXT,
  authors            TEXT[] NOT NULL DEFAULT '{}',
  publisher          TEXT,
  published_year     SMALLINT,
  language           TEXT DEFAULT 'en',
  subject_area       TEXT,
  grade_level        TEXT[],
  cover_url          TEXT,
  description        TEXT,
  dewey_decimal      TEXT,
  location_shelf     TEXT,
  condition          TEXT DEFAULT 'good',              -- new | good | fair | poor | withdrawn
  total_copies       SMALLINT DEFAULT 1,
  available_copies   SMALLINT DEFAULT 1,
  is_reference_only  BOOLEAN DEFAULT FALSE,
  acquisition_date   DATE,
  acquisition_source TEXT,                             -- donation | purchased | DBE_supply
  acquisition_cost   NUMERIC(10,2),
  barcode            TEXT,
  tags               TEXT[],
  created_by         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX books_institution_id_idx ON books(institution_id);
CREATE INDEX books_isbn_13_idx ON books(isbn_13);

CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================
-- TABLE: members
-- Learners and other library patrons at an institution.
-- ============================================================
CREATE TABLE members (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id   UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  member_number    TEXT NOT NULL,                      -- e.g. ORB-0042
  full_name        TEXT NOT NULL,
  member_type      TEXT NOT NULL,                      -- learner | teacher | staff | community
  grade            TEXT,
  class_name       TEXT,
  date_of_birth    DATE,
  guardian_name    TEXT,
  contact_phone    TEXT,
  contact_email    TEXT,
  max_loans        SMALLINT DEFAULT 3,
  loan_period_days SMALLINT DEFAULT 14,
  is_active        BOOLEAN DEFAULT TRUE,
  notes            TEXT,
  joined_at        DATE DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX members_institution_id_idx ON members(institution_id);
CREATE UNIQUE INDEX members_number_institution_idx ON members(institution_id, member_number);

-- ============================================================
-- TABLE: loans
-- Each checkout/return transaction.
-- ============================================================
CREATE TABLE loans (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id       UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  book_id              UUID NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
  member_id            UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  checked_out_by       UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  checked_in_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  checked_out_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date             DATE NOT NULL,
  returned_at          TIMESTAMPTZ,
  status               TEXT NOT NULL DEFAULT 'active', -- active | returned | overdue | lost
  renewal_count        SMALLINT DEFAULT 0,
  condition_on_return  TEXT,                           -- good | damaged | lost
  fine_amount          NUMERIC(8,2) DEFAULT 0,
  fine_paid            BOOLEAN DEFAULT FALSE,
  notes                TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX loans_institution_id_idx ON loans(institution_id);
CREATE INDEX loans_book_id_idx ON loans(book_id);
CREATE INDEX loans_member_id_idx ON loans(member_id);
CREATE INDEX loans_status_idx ON loans(status);
CREATE INDEX loans_due_date_idx ON loans(due_date);

-- ============================================================
-- TABLE: sms_alerts
-- Log of all SMS notifications sent via Panacea Mobile.
-- ============================================================
CREATE TABLE sms_alerts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id      UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  loan_id             UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  member_id           UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  phone_number        TEXT NOT NULL,
  message             TEXT NOT NULL,
  alert_type          TEXT NOT NULL,                   -- due_tomorrow | overdue_1d | overdue_7d | overdue_14d
  status              TEXT NOT NULL DEFAULT 'pending', -- pending | sent | delivered | failed
  panacea_message_id  TEXT,
  sent_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: isbn_cache
-- Shared across all institutions — avoids re-fetching Open Library.
-- ============================================================
CREATE TABLE isbn_cache (
  isbn_13       TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  authors       TEXT[],
  publisher     TEXT,
  published_year SMALLINT,
  cover_url     TEXT,
  description   TEXT,
  raw_data      JSONB,
  fetched_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: dbe_reports
-- DBE-required compliance reports (stock-take, assets register).
-- ============================================================
CREATE TABLE dbe_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  report_type     TEXT NOT NULL,                       -- annual_stocktake | assets_register | loans_summary
  report_year     SMALLINT NOT NULL,
  term            SMALLINT,                            -- school term 1-4
  generated_by    UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status          TEXT NOT NULL DEFAULT 'draft',       -- draft | submitted | approved
  file_url        TEXT,
  data_snapshot   JSONB,
  submitted_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: audit_log
-- Immutable record of all create/update/delete operations.
-- ============================================================
CREATE TABLE audit_log (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  performed_by   UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  action         TEXT NOT NULL,   -- book_added | book_deleted | loan_created | member_added | etc.
  table_name     TEXT NOT NULL,
  record_id      UUID,
  old_values     JSONB,
  new_values     JSONB,
  ip_address     INET,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX audit_log_institution_id_idx ON audit_log(institution_id);
CREATE INDEX audit_log_performed_by_idx ON audit_log(performed_by);

-- ============================================================
-- ROW LEVEL SECURITY
-- Every table is restricted to the authenticated user's
-- institution_id (injected into JWT via custom auth hook).
-- ============================================================

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE books        ENABLE ROW LEVEL SECURITY;
ALTER TABLE members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_alerts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE isbn_cache   ENABLE ROW LEVEL SECURITY;
ALTER TABLE dbe_reports  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log    ENABLE ROW LEVEL SECURITY;

-- Helper: read institution_id from JWT claims
CREATE OR REPLACE FUNCTION auth_institution_id() RETURNS UUID AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'institution_id')::uuid,
    NULL
  );
$$ LANGUAGE sql STABLE;

-- Helper: read role from JWT claims
CREATE OR REPLACE FUNCTION auth_role() RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::jsonb ->> 'role',
    'viewer'
  );
$$ LANGUAGE sql STABLE;

-- institutions: each user sees only their own institution
CREATE POLICY "Users see own institution"
  ON institutions FOR SELECT
  USING (id = auth_institution_id());

CREATE POLICY "Super admins manage institutions"
  ON institutions FOR ALL
  USING (auth_role() = 'super_admin');

-- profiles: users see only profiles within their institution
CREATE POLICY "Users see own institution profiles"
  ON profiles FOR SELECT
  USING (institution_id = auth_institution_id());

CREATE POLICY "Admins manage profiles"
  ON profiles FOR ALL
  USING (institution_id = auth_institution_id() AND auth_role() IN ('super_admin', 'admin'));

-- books: institution-scoped
CREATE POLICY "Users see own institution books"
  ON books FOR SELECT
  USING (institution_id = auth_institution_id());

CREATE POLICY "Librarians manage books"
  ON books FOR ALL
  USING (institution_id = auth_institution_id() AND auth_role() IN ('super_admin', 'admin', 'librarian'));

-- members: institution-scoped
CREATE POLICY "Users see own institution members"
  ON members FOR SELECT
  USING (institution_id = auth_institution_id());

CREATE POLICY "Librarians manage members"
  ON members FOR ALL
  USING (institution_id = auth_institution_id() AND auth_role() IN ('super_admin', 'admin', 'librarian'));

-- loans: institution-scoped
CREATE POLICY "Users see own institution loans"
  ON loans FOR SELECT
  USING (institution_id = auth_institution_id());

CREATE POLICY "Librarians manage loans"
  ON loans FOR ALL
  USING (institution_id = auth_institution_id() AND auth_role() IN ('super_admin', 'admin', 'librarian'));

-- sms_alerts: institution-scoped read-only for non-admin
CREATE POLICY "Users see own institution sms_alerts"
  ON sms_alerts FOR SELECT
  USING (institution_id = auth_institution_id());

CREATE POLICY "Service role manages sms_alerts"
  ON sms_alerts FOR ALL
  USING (auth_role() = 'super_admin');

-- isbn_cache: public read (shared resource), service role writes
CREATE POLICY "Anyone can read isbn_cache"
  ON isbn_cache FOR SELECT
  USING (TRUE);

CREATE POLICY "Service role manages isbn_cache"
  ON isbn_cache FOR ALL
  USING (auth_role() = 'super_admin');

-- dbe_reports: institution-scoped
CREATE POLICY "Users see own institution dbe_reports"
  ON dbe_reports FOR SELECT
  USING (institution_id = auth_institution_id());

CREATE POLICY "Admins manage dbe_reports"
  ON dbe_reports FOR ALL
  USING (institution_id = auth_institution_id() AND auth_role() IN ('super_admin', 'admin', 'librarian'));

-- audit_log: read-only for all institution users, immutable
CREATE POLICY "Users see own institution audit_log"
  ON audit_log FOR SELECT
  USING (institution_id = auth_institution_id());

CREATE POLICY "Service role inserts audit_log"
  ON audit_log FOR INSERT
  WITH CHECK (TRUE);
