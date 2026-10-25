package com.nobi.racing;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import static com.nobi.racing.SourceAdapter.*;

public final class BatchValidator {
    private BatchValidator() {}
    static void id(String id) { if(id==null || !id.matches("[A-Za-z0-9:_-]{1,100}")) throw ApiFailure.validation(); }
    public static void validate(Batch batch,Instant now) {
        if(batch==null || batch.generatedAt()==null || batch.generatedAt().isAfter(now) || batch.entities()==null || batch.entities().isEmpty() || batch.entities().size()>10000 || batch.snapshots()==null || batch.snapshots().size()>100) throw ApiFailure.validation();
        Set<String> keys=new HashSet<>();
        for(Datum row:batch.entities()) {
            if(row==null || row.kind()==null || row.fields()==null || !row.fields().keySet().equals(Set.copyOf(row.kind().columns))) throw ApiFailure.validation();
            id(row.externalId()); if(!keys.add(row.kind()+":"+row.externalId())) throw ApiFailure.validation();
            for(var field:row.fields().entrySet()) validateField(field.getKey(),field.getValue());
            if(row.kind()==Kind.SESSION && row.fields().get("ends_at") instanceof Instant end && end.isBefore((Instant)row.fields().get("starts_at"))) throw ApiFailure.validation();
            if(row.kind()==Kind.SEASON_ENTRY && row.fields().get("to_round") instanceof Number end && end.intValue()<((Number)row.fields().get("from_round")).intValue()) throw ApiFailure.validation();
            if(row.kind()==Kind.RESULT && "classified".equals(row.fields().get("result_status")) && row.fields().get("position")==null) throw ApiFailure.validation();
        }
        for(Snapshot snapshot:batch.snapshots()) {
            if(snapshot==null) throw ApiFailure.validation();
            id(snapshot.externalId()); id(snapshot.seasonId()); id(snapshot.afterRaceId());
            if(!keys.add("standing:"+snapshot.externalId()) || !snapshot.complete() || snapshot.capturedAt()==null || snapshot.capturedAt().isAfter(batch.generatedAt())) throw ApiFailure.validation();
            validateRanks(snapshot.drivers()); validateRanks(snapshot.teams());
            Datum race=batch.entities().stream().filter(e -> e.kind()==Kind.RACE && e.externalId().equals(snapshot.afterRaceId())).findFirst().orElseThrow(ApiFailure::validation);
            if(!new Ref(Kind.SEASON,snapshot.seasonId()).equals(race.fields().get("season_id")) || !"completed".equals(race.fields().get("status")) || snapshot.capturedAt().isBefore((Instant)race.fields().get("starts_at"))) throw ApiFailure.validation();
            int round=((Number)race.fields().get("round")).intValue();
            Set<String> expectedDrivers=new HashSet<>(),expectedTeams=new HashSet<>();
            for(Datum entry:batch.entities()) if(entry.kind()==Kind.SEASON_ENTRY && new Ref(Kind.SEASON,snapshot.seasonId()).equals(entry.fields().get("season_id")) && ((Number)entry.fields().get("from_round")).intValue()<=round && (entry.fields().get("to_round")==null || ((Number)entry.fields().get("to_round")).intValue()>=round)) {
                expectedDrivers.add(((Ref)entry.fields().get("driver_id")).externalId());expectedTeams.add(((Ref)entry.fields().get("team_id")).externalId());
            }
            if(!expectedDrivers.equals(snapshot.drivers().stream().map(Rank::externalId).collect(java.util.stream.Collectors.toSet())) || !expectedTeams.equals(snapshot.teams().stream().map(Rank::externalId).collect(java.util.stream.Collectors.toSet()))) throw ApiFailure.validation();
        }
    }
    private static void validateRanks(java.util.List<Rank> ranks) {
        if(ranks==null || ranks.isEmpty() || ranks.size()>1000) throw ApiFailure.validation();
        Set<String> ids=new HashSet<>(); for(Rank rank:ranks) { id(rank.externalId()); if(!ids.add(rank.externalId()) || rank.position()<1 || rank.wins()<0) throw ApiFailure.validation(); decimal(rank.points()); }
    }
    private static final Map<String,Kind> REFERENCES=Map.of("series_id",Kind.SERIES,"season_id",Kind.SEASON,"circuit_id",Kind.CIRCUIT,"race_id",Kind.RACE,"session_id",Kind.SESSION,"entry_id",Kind.RACE_ENTRY,"driver_id",Kind.DRIVER,"team_id",Kind.TEAM);
    private static void validateField(String key,Object value) {
        if(value==null) { if(!Set.of("ends_at","to_round","position","elapsed_ms").contains(key)) throw ApiFailure.validation(); return; }
        if(REFERENCES.containsKey(key)) { if(!(value instanceof Ref ref) || ref.kind()!=REFERENCES.get(key)) throw ApiFailure.validation(); id(((Ref)value).externalId()); return; }
        switch(key) {
            case "starts_at","ends_at" -> { if(!(value instanceof Instant)) throw ApiFailure.validation(); }
            case "time_zone" -> { if(!(value instanceof String)) throw ApiFailure.validation(); try { ZoneId.of((String)value); } catch(java.time.DateTimeException error) { throw ApiFailure.validation(); } }
            case "country_code" -> { if(!(value instanceof String s) || !s.matches("[A-Z]{2}")) throw ApiFailure.validation(); }
            case "code" -> { if(!(value instanceof String s) || !s.matches("[A-Z][A-Z0-9_]{0,31}")) throw ApiFailure.validation(); }
            case "status" -> { if(!Set.of("scheduled","completed","cancelled").contains(value)) throw ApiFailure.validation(); }
            case "kind" -> { if(!Set.of("practice","qualifying","sprint","race").contains(value)) throw ApiFailure.validation(); }
            case "result_status" -> { if(!Set.of("classified","dnf","dns","dsq").contains(value)) throw ApiFailure.validation(); }
            case "points","length_km" -> { if(!(value instanceof BigDecimal b)) throw ApiFailure.validation(); decimal((BigDecimal)value); if(key.equals("length_km") && ((BigDecimal)value).signum()<=0) throw ApiFailure.validation(); }
            case "year","round","sequence","laps","turns","from_round","to_round","car_number","position","elapsed_ms" -> {
                if(!(value instanceof Integer || value instanceof Long)) throw ApiFailure.validation(); long n=((Number)value).longValue();
                if(n<0 || (!Set.of("car_number","elapsed_ms").contains(key) && n==0) || (key.equals("car_number") && n>999) || (key.equals("year") && (n<1900||n>2200)) || (!key.equals("elapsed_ms") && n>10000)) throw ApiFailure.validation();
            }
            default -> { if(!(value instanceof String s) || s.isBlank() || s.length()>1000 || s.chars().anyMatch(c -> c<32)) throw ApiFailure.validation(); }
        }
    }
    private static void decimal(BigDecimal points) { if(points==null || points.scale()>3 || points.precision()>8) throw ApiFailure.validation(); }
}
