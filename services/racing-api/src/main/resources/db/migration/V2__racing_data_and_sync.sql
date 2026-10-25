-- Forward-only expansion of the V1 foundation. Never rewrite V1 checksums.
ALTER TABLE season RENAME TO seasons;
ALTER TABLE circuit RENAME TO circuits;
ALTER TABLE race RENAME TO race_events;
ALTER TABLE race_session RENAME TO race_sessions;
ALTER TABLE driver RENAME TO drivers;
ALTER TABLE team RENAME TO teams;
ALTER TABLE race_entry RENAME TO race_entries;
ALTER TABLE session_result RENAME TO session_results;
ALTER TABLE standing_snapshot RENAME TO standing_snapshots;
ALTER TABLE source_record RENAME TO provider_entity_map;
ALTER TABLE provider_entity_map DROP CONSTRAINT source_record_entity_kind_check;
ALTER TABLE provider_entity_map ADD CHECK (entity_kind IN ('series','season','circuit','race','session','driver','team','season_entry','race_entry','article','result','standing'));
ALTER TABLE data_source ADD COLUMN time_zone text NOT NULL DEFAULT 'UTC',
  ADD COLUMN data_revision bigint NOT NULL DEFAULT 0 CHECK (data_revision >= 0),
  ADD COLUMN last_checksum varchar(64), ADD COLUMN last_synced_at timestamptz;
ALTER TABLE source_grant ADD COLUMN evidence_verified boolean NOT NULL DEFAULT false;
ALTER TABLE seasons ADD COLUMN source_id uuid, ADD COLUMN data_mode varchar(16),
  ADD COLUMN fetched_at timestamptz, ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN data_status varchar(16),
  ADD FOREIGN KEY (source_id, data_mode) REFERENCES data_source(id,mode),
  ADD CHECK ((source_id IS NULL AND data_mode IS NULL AND fetched_at IS NULL AND data_status IS NULL)
    OR (source_id IS NOT NULL AND data_mode IS NOT NULL AND fetched_at IS NOT NULL AND data_status IN ('synthetic','current','stale','corrected'))),
  ADD CHECK (data_mode IS NULL OR ((data_mode = 'mock') = (data_status = 'synthetic'))),
  ADD UNIQUE (id,source_id);
ALTER TABLE circuits ADD COLUMN name_zh text, ADD COLUMN length_km numeric(8,3) CHECK(length_km>0), ADD COLUMN turns integer CHECK(turns>0);
ALTER TABLE race_events ADD COLUMN name_zh text, ADD COLUMN laps integer CHECK(laps>0);
ALTER TABLE drivers ADD COLUMN car_number integer CHECK(car_number BETWEEN 0 AND 999), ADD COLUMN biography text, ADD COLUMN biography_zh text;
ALTER TABLE teams ADD COLUMN country_code char(2);
ALTER TABLE session_results ADD COLUMN id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE;
DO $$
DECLARE tab text;
BEGIN
  FOREACH tab IN ARRAY ARRAY['circuits','race_events','race_sessions','drivers','teams','race_entries','session_results','standing_snapshots'] LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN data_status varchar(16), ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now()',tab);
    EXECUTE format('UPDATE %I SET data_status=CASE WHEN data_mode=''mock'' THEN ''synthetic'' ELSE ''current'' END',tab);
    EXECUTE format('ALTER TABLE %I ALTER COLUMN data_status SET NOT NULL, ADD CHECK(data_status IN (''synthetic'',''current'',''stale'',''corrected'')), ADD CHECK((data_mode=''mock'')=(data_status=''synthetic''))',tab);
  END LOOP;
  FOREACH tab IN ARRAY ARRAY['circuits','race_events','race_sessions','drivers','teams','race_entries','standing_snapshots'] LOOP
    EXECUTE format('ALTER TABLE %I ADD UNIQUE(id,source_id)',tab);
  END LOOP;
END $$;
ALTER TABLE race_events ADD FOREIGN KEY(season_id,source_id) REFERENCES seasons(id,source_id), ADD FOREIGN KEY(circuit_id,source_id) REFERENCES circuits(id,source_id);
ALTER TABLE race_sessions ADD FOREIGN KEY(race_id,source_id) REFERENCES race_events(id,source_id);
ALTER TABLE race_entries ADD FOREIGN KEY(race_id,source_id) REFERENCES race_events(id,source_id), ADD FOREIGN KEY(driver_id,source_id) REFERENCES drivers(id,source_id), ADD FOREIGN KEY(team_id,source_id) REFERENCES teams(id,source_id);
ALTER TABLE session_results ADD FOREIGN KEY(session_id,source_id) REFERENCES race_sessions(id,source_id), ADD FOREIGN KEY(entry_id,source_id) REFERENCES race_entries(id,source_id);
ALTER TABLE standing_snapshots ADD COLUMN revision bigint NOT NULL DEFAULT 1 CHECK(revision>0), ADD COLUMN complete boolean NOT NULL DEFAULT true,
  ADD COLUMN provider_external_id varchar(100), ADD UNIQUE(source_id,provider_external_id,revision),
  ADD FOREIGN KEY(season_id,source_id) REFERENCES seasons(id,source_id);
CREATE TABLE season_entries (
  id uuid PRIMARY KEY, season_id uuid NOT NULL, driver_id uuid NOT NULL, team_id uuid NOT NULL,
  from_round integer NOT NULL CHECK(from_round>0), to_round integer CHECK(to_round>=from_round),
  car_number integer CHECK(car_number BETWEEN 0 AND 999), source_id uuid NOT NULL,
  data_mode varchar(16) NOT NULL, data_status varchar(16) NOT NULL,
  fetched_at timestamptz NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY(source_id,data_mode) REFERENCES data_source(id,mode),
  FOREIGN KEY(season_id,source_id) REFERENCES seasons(id,source_id),
  FOREIGN KEY(driver_id,source_id) REFERENCES drivers(id,source_id),
  FOREIGN KEY(team_id,source_id) REFERENCES teams(id,source_id),
  CHECK(data_status IN ('synthetic','current','stale','corrected')),
  CHECK((data_mode='mock')=(data_status='synthetic')),
  UNIQUE(season_id,driver_id,from_round)
);
CREATE TABLE driver_standings (
  snapshot_id uuid NOT NULL, driver_id uuid NOT NULL, source_id uuid NOT NULL,
  position integer NOT NULL CHECK(position>0), points numeric(8,3) NOT NULL, wins integer NOT NULL DEFAULT 0 CHECK(wins>=0),
  FOREIGN KEY(snapshot_id,source_id) REFERENCES standing_snapshots(id,source_id),
  FOREIGN KEY(driver_id,source_id) REFERENCES drivers(id,source_id), PRIMARY KEY(snapshot_id,driver_id)
);
CREATE TABLE team_standings (
  snapshot_id uuid NOT NULL, team_id uuid NOT NULL, source_id uuid NOT NULL,
  position integer NOT NULL CHECK(position>0), points numeric(8,3) NOT NULL, wins integer NOT NULL DEFAULT 0 CHECK(wins>=0),
  FOREIGN KEY(snapshot_id,source_id) REFERENCES standing_snapshots(id,source_id),
  FOREIGN KEY(team_id,source_id) REFERENCES teams(id,source_id), PRIMARY KEY(snapshot_id,team_id)
);
-- Preserve existing V1 standings. The old standing_entry remains during expansion.
INSERT INTO driver_standings(snapshot_id,driver_id,source_id,position,points)
 SELECT e.snapshot_id,e.driver_id,s.source_id,e.position,e.points FROM standing_entry e JOIN standing_snapshots s ON s.id=e.snapshot_id WHERE e.driver_id IS NOT NULL;
INSERT INTO team_standings(snapshot_id,team_id,source_id,position,points)
 SELECT e.snapshot_id,e.team_id,s.source_id,e.position,e.points FROM standing_entry e JOIN standing_snapshots s ON s.id=e.snapshot_id WHERE e.team_id IS NOT NULL;
CREATE TABLE sync_run (
  id uuid PRIMARY KEY, source_id uuid NOT NULL REFERENCES data_source(id), status varchar(16) NOT NULL CHECK(status IN ('success','unchanged','failed','denied')),
  attempts integer NOT NULL, started_at timestamptz NOT NULL, finished_at timestamptz NOT NULL, error_code varchar(80), checksum varchar(64)
);
CREATE INDEX sync_run_source_time ON sync_run(source_id,started_at DESC);
CREATE INDEX sessions_calendar ON race_sessions(race_id,starts_at,id);
CREATE INDEX season_roster ON season_entries(season_id,driver_id,from_round);
