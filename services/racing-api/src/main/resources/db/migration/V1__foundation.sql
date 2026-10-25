-- Phase 0 schema draft. No seed or commercial data. Flyway owns this schema.
CREATE TABLE data_source (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(80) NOT NULL UNIQUE,
  name text NOT NULL,
  mode varchar(16) NOT NULL CHECK (mode IN ('mock','licensed')),
  attribution text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, mode)
);
CREATE TABLE source_grant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES data_source(id),
  status varchar(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','revoked')),
  capabilities text[] NOT NULL CHECK (cardinality(capabilities) > 0),
  territories text[] NOT NULL CHECK (cardinality(territories) > 0),
  evidence_ref text NOT NULL,
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NOT NULL,
  retention_days integer NOT NULL CHECK (retention_days > 0),
  created_by uuid NOT NULL,
  approved_by uuid,
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  CHECK (valid_until > valid_from),
  CHECK (status <> 'approved' OR (approved_by IS NOT NULL AND approved_by <> created_by))
);
CREATE INDEX source_grant_lookup ON source_grant(source_id, status, valid_until);
CREATE TABLE app_user (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issuer text NOT NULL,
  subject text NOT NULL,
  locale varchar(8) NOT NULL DEFAULT 'en' CHECK (locale IN ('en','zh-CN')),
  time_zone text NOT NULL DEFAULT 'UTC',
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (issuer, subject)
);
ALTER TABLE source_grant ADD CONSTRAINT grant_creator_fk FOREIGN KEY (created_by) REFERENCES app_user(id);
ALTER TABLE source_grant ADD CONSTRAINT grant_approver_fk FOREIGN KEY (approved_by) REFERENCES app_user(id);
CREATE TABLE user_role (
  user_id uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  role varchar(32) NOT NULL CHECK (role IN ('fan','editor','publisher','source_manager','administrator')),
  PRIMARY KEY (user_id, role)
);
CREATE TABLE series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(32) NOT NULL UNIQUE,
  name text NOT NULL
);
CREATE TABLE season (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid NOT NULL REFERENCES series(id),
  year smallint NOT NULL CHECK (year BETWEEN 1900 AND 2200),
  UNIQUE (series_id, year)
);
CREATE TABLE circuit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country_code char(2) NOT NULL,
  time_zone text NOT NULL,
  source_id uuid NOT NULL,
  data_mode varchar(16) NOT NULL,
  fetched_at timestamptz NOT NULL,
  FOREIGN KEY (source_id, data_mode) REFERENCES data_source(id, mode)
);
CREATE TABLE race (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES season(id),
  circuit_id uuid NOT NULL REFERENCES circuit(id),
  round smallint NOT NULL CHECK (round > 0),
  name text NOT NULL,
  starts_at timestamptz NOT NULL,
  status varchar(16) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
  source_id uuid NOT NULL,
  data_mode varchar(16) NOT NULL,
  fetched_at timestamptz NOT NULL,
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  FOREIGN KEY (source_id, data_mode) REFERENCES data_source(id, mode),
  UNIQUE (season_id, round),
  UNIQUE (id, season_id)
);
CREATE INDEX race_calendar ON race(starts_at, id);
CREATE TABLE race_session (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id uuid NOT NULL REFERENCES race(id),
  kind varchar(24) NOT NULL CHECK (kind IN ('practice','qualifying','sprint','race')),
  sequence smallint NOT NULL CHECK (sequence > 0),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  source_id uuid NOT NULL,
  data_mode varchar(16) NOT NULL,
  fetched_at timestamptz NOT NULL,
  FOREIGN KEY (source_id, data_mode) REFERENCES data_source(id, mode),
  CHECK (ends_at IS NULL OR ends_at >= starts_at),
  UNIQUE (race_id, kind, sequence),
  UNIQUE (id, race_id)
);
CREATE TABLE driver (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  country_code char(2),
  source_id uuid NOT NULL,
  data_mode varchar(16) NOT NULL,
  fetched_at timestamptz NOT NULL,
  FOREIGN KEY (source_id, data_mode) REFERENCES data_source(id, mode)
);
CREATE TABLE team (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  source_id uuid NOT NULL,
  data_mode varchar(16) NOT NULL,
  fetched_at timestamptz NOT NULL,
  FOREIGN KEY (source_id, data_mode) REFERENCES data_source(id, mode)
);
-- Entry snapshots permit driver transfers between races without rewriting history.
CREATE TABLE race_entry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id uuid NOT NULL REFERENCES race(id),
  driver_id uuid NOT NULL REFERENCES driver(id),
  team_id uuid NOT NULL REFERENCES team(id),
  car_number smallint CHECK (car_number BETWEEN 0 AND 999),
  source_id uuid NOT NULL,
  data_mode varchar(16) NOT NULL,
  fetched_at timestamptz NOT NULL,
  FOREIGN KEY (source_id, data_mode) REFERENCES data_source(id, mode),
  UNIQUE (race_id, driver_id),
  UNIQUE (id, race_id)
);
CREATE TABLE session_result (
  session_id uuid NOT NULL,
  entry_id uuid NOT NULL,
  race_id uuid NOT NULL,
  position smallint CHECK (position > 0),
  result_status varchar(16) NOT NULL CHECK (result_status IN ('classified','dnf','dns','dsq')),
  points numeric(8,3) NOT NULL DEFAULT 0,
  elapsed_ms bigint CHECK (elapsed_ms >= 0),
  source_id uuid NOT NULL,
  data_mode varchar(16) NOT NULL,
  fetched_at timestamptz NOT NULL,
  FOREIGN KEY (source_id, data_mode) REFERENCES data_source(id, mode),
  FOREIGN KEY (session_id, race_id) REFERENCES race_session(id, race_id),
  FOREIGN KEY (entry_id, race_id) REFERENCES race_entry(id, race_id),
  PRIMARY KEY (session_id, entry_id)
);
CREATE TABLE standing_snapshot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES season(id),
  after_race_id uuid,
  captured_at timestamptz NOT NULL,
  source_id uuid NOT NULL,
  data_mode varchar(16) NOT NULL,
  fetched_at timestamptz NOT NULL,
  FOREIGN KEY (source_id, data_mode) REFERENCES data_source(id, mode),
  FOREIGN KEY (after_race_id, season_id) REFERENCES race(id, season_id)
);
CREATE INDEX standing_latest ON standing_snapshot(season_id, captured_at DESC, id);
CREATE TABLE standing_entry (
  snapshot_id uuid NOT NULL REFERENCES standing_snapshot(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES driver(id),
  team_id uuid REFERENCES team(id),
  position smallint NOT NULL CHECK (position > 0),
  points numeric(8,3) NOT NULL,
  CHECK ((driver_id IS NOT NULL)::integer + (team_id IS NOT NULL)::integer = 1)
);
CREATE UNIQUE INDEX standing_driver ON standing_entry(snapshot_id, driver_id) WHERE driver_id IS NOT NULL;
CREATE UNIQUE INDEX standing_team ON standing_entry(snapshot_id, team_id) WHERE team_id IS NOT NULL;
CREATE TABLE article (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_url text NOT NULL CHECK (canonical_url LIKE 'https://%'),
  status varchar(16) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published','withdrawn')),
  source_id uuid NOT NULL,
  data_mode varchar(16) NOT NULL,
  fetched_at timestamptz NOT NULL,
  published_at timestamptz,
  author_id uuid REFERENCES app_user(id),
  publisher_id uuid REFERENCES app_user(id),
  revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
  FOREIGN KEY (source_id, data_mode) REFERENCES data_source(id, mode),
  CHECK (status <> 'published' OR (published_at IS NOT NULL AND publisher_id IS NOT NULL))
);
CREATE INDEX article_feed ON article(published_at DESC, id) WHERE status = 'published';
CREATE TABLE article_translation (
  article_id uuid NOT NULL REFERENCES article(id) ON DELETE CASCADE,
  locale varchar(8) NOT NULL CHECK (locale IN ('en','zh-CN')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 240),
  summary text NOT NULL CHECK (char_length(summary) <= 1000),
  PRIMARY KEY (article_id, locale)
);
CREATE TABLE source_record (
  source_id uuid NOT NULL REFERENCES data_source(id),
  entity_kind varchar(32) NOT NULL CHECK (entity_kind IN ('race','circuit','driver','team','article','result','standing')),
  external_id text NOT NULL,
  internal_id uuid NOT NULL,
  checksum varchar(64) NOT NULL,
  fetched_at timestamptz NOT NULL,
  PRIMARY KEY (source_id, entity_kind, external_id)
);
CREATE TABLE audit_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES app_user(id),
  action varchar(80) NOT NULL,
  resource_type varchar(32) NOT NULL,
  resource_id uuid,
  trace_id varchar(80) NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  details jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(details) = 'object')
);
CREATE INDEX audit_resource ON audit_event(resource_type, resource_id, occurred_at DESC);
CREATE TABLE outbox_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type varchar(32) NOT NULL,
  aggregate_id uuid NOT NULL,
  event_type varchar(80) NOT NULL,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0)
);
CREATE INDEX outbox_pending ON outbox_event(occurred_at, id) WHERE published_at IS NULL;
