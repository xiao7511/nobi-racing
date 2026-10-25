package com.nobi.racing;

import java.time.Instant;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface SourceAdapter {
    String code();
    String mode();
    Batch fetch();
    enum Kind {
        SERIES("series","series","code,name"), SEASON("season","seasons","series_id,year"),
        CIRCUIT("circuit","circuits","name,name_zh,country_code,time_zone,length_km,turns"),
        DRIVER("driver","drivers","display_name,country_code,car_number,biography,biography_zh"),
        TEAM("team","teams","name,country_code"),
        RACE("race","race_events","season_id,circuit_id,round,name,name_zh,starts_at,status,laps"),
        SESSION("session","race_sessions","race_id,kind,sequence,starts_at,ends_at"),
        SEASON_ENTRY("season_entry","season_entries","season_id,driver_id,team_id,from_round,to_round,car_number"),
        RACE_ENTRY("race_entry","race_entries","race_id,driver_id,team_id,car_number"),
        RESULT("result","session_results","session_id,entry_id,race_id,position,result_status,points,elapsed_ms");
        public final String wire; public final String table; public final List<String> columns;
        Kind(String wire,String table,String columns) { this.wire=wire;this.table=table;this.columns=List.of(columns.split(",")); }
    }
    record Ref(Kind kind,String externalId) {}
    record Datum(Kind kind,String externalId,Map<String,Object> fields) {}
    record Rank(String externalId,int position,BigDecimal points,int wins) {}
    record Snapshot(String externalId,String seasonId,String afterRaceId,Instant capturedAt,boolean complete,List<Rank> drivers,List<Rank> teams) {}
    record Batch(Instant generatedAt,List<Datum> entities,List<Snapshot> snapshots) {}
    final class Failure extends RuntimeException {
        public final int status; public final long retryAfterMillis;
        public Failure(int status,long retryAfterMillis) { super("PROVIDER_FAILURE");this.status=status;this.retryAfterMillis=retryAfterMillis; }
    }
}
