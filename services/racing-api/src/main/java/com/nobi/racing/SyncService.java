package com.nobi.racing;

import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.SerializationFeature;
import static com.nobi.racing.SourceAdapter.*;

@Service
public class SyncService {
    public record Result(UUID runId,UUID sourceId,String status,int entitiesWritten,long dataRevision) {}
    private final JdbcTemplate jdbc; private final RightsPolicy rights; private final RedisSupport redis;
    private final TransactionTemplate transactions; private final ObjectMapper mapper; private final Clock clock;
    private final Map<String,SourceAdapter> adapters=new java.util.HashMap<>();
    private final int attempts,limit,window; private final long delay;
    public SyncService(JdbcTemplate jdbc,RightsPolicy rights,RedisSupport redis,TransactionTemplate transactions,ObjectMapper mapper,Clock clock,List<SourceAdapter> adapters,
        @Value("${nobi.sync.max-attempts}") int attempts,@Value("${nobi.sync.limit}") int limit,@Value("${nobi.sync.window-seconds}") int window,@Value("${nobi.sync.delay-ms}") long delay) {
        this.jdbc=jdbc;this.rights=rights;this.redis=redis;this.transactions=transactions;this.mapper=mapper;this.clock=clock;
        this.attempts=Math.max(1,Math.min(5,attempts));this.limit=limit;this.window=window;this.delay=delay;
        for(SourceAdapter adapter:adapters) { if(this.adapters.put(adapter.code(),adapter)!=null) throw new IllegalStateException("Duplicate adapter"); }
    }
    private RightsPolicy.Permit authorize(UUID source) {
        var permit=rights.require(source,"catalog");
        for(String capability:List.of("schedule","results","standings")) if(!rights.require(source,capability).grantId().equals(permit.grantId())) throw new ApiFailure(403,"SOURCE_NOT_AUTHORIZED");
        return permit;
    }
    public Result synchronize(UUID source) {
        UUID run=UUID.randomUUID(); Instant started=clock.instant(); var count=new AtomicInteger(); String checksum=null;
        try {
            var permit=authorize(source);
            SourceAdapter adapter=adapters.get(permit.code());
            if(adapter==null || !adapter.mode().equals(permit.mode())) throw new ApiFailure(403,"SOURCE_NOT_AUTHORIZED");
            Batch batch=RetryPolicy.execute(attempts,delay,() -> {
                authorize(source);
                if(!redis.acquire("sync:"+source,limit,Duration.ofSeconds(window))) throw new ApiFailure(429,"RATE_LIMITED");
                count.incrementAndGet();
            },adapter::fetch,duration -> {
                try { Thread.sleep(duration); } catch(InterruptedException interrupted) { Thread.currentThread().interrupt(); throw new ApiFailure(503,"SOURCE_UNAVAILABLE"); }
            });
            BatchValidator.validate(batch,clock.instant());
            String digest=Crypto.digest(json(batch)); checksum=digest;
            Result result=transactions.execute(status -> {
                jdbc.execute("SET LOCAL lock_timeout='2s'");
                String previous=jdbc.queryForObject("SELECT COALESCE(last_checksum,'') FROM data_source WHERE id=? FOR UPDATE",String.class,source);
                // Serialize revocation with the final authorization check and database writes.
                jdbc.queryForList("SELECT id FROM source_grant WHERE source_id=? FOR UPDATE",source);
                var current=authorize(source);
                if(digest.equals(previous)) {
                    jdbc.update("UPDATE data_source SET last_synced_at=? WHERE id=?",Timestamp.from(clock.instant()),source);
                    recordRun(run,source,"unchanged",count.get(),started,null,digest);
                    return new Result(run,source,"unchanged",0,current.dataRevision());
                }
                for(Datum row:batch.entities().stream().sorted(Comparator.comparing(Datum::kind)).toList()) write(source,current.mode(),row);
                for(Snapshot snapshot:batch.snapshots()) writeSnapshot(source,current.mode(),snapshot);
                long revision=current.dataRevision()+1;
                jdbc.update("UPDATE data_source SET last_checksum=?,last_synced_at=?,data_revision=? WHERE id=?",digest,Timestamp.from(clock.instant()),revision,source);
                jdbc.update("INSERT INTO outbox_event(aggregate_type,aggregate_id,event_type,payload) VALUES ('source',?,'SourceSnapshotImported',?::jsonb)",source,json(Map.of("dataMode",current.mode(),"revision",revision,"checksum",digest)));
                jdbc.update("INSERT INTO audit_event(action,resource_type,resource_id,trace_id,details) VALUES ('source.sync','source',?,?,?::jsonb)",source,run.toString(),json(Map.of("mode",current.mode(),"revision",revision)));
                recordRun(run,source,"success",count.get(),started,null,digest);
                return new Result(run,source,"success",batch.entities().size()+batch.snapshots().size(),revision);
            });
            return java.util.Objects.requireNonNull(result);
        } catch(RuntimeException error) {
            String code=error instanceof ApiFailure failure?failure.code():"SOURCE_UNAVAILABLE";
            try { recordRun(run,source,code.equals("SOURCE_NOT_AUTHORIZED")?"denied":"failed",count.get(),started,code,checksum); }
            catch(RuntimeException ignored) { org.slf4j.LoggerFactory.getLogger(SyncService.class).warn("Sync audit unavailable run={}",run); }
            if(error instanceof ApiFailure failure) throw failure;
            throw new ApiFailure(503,"SOURCE_UNAVAILABLE");
        }
    }
    private String json(Object value) { return mapper.writer().with(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS).writeValueAsString(value); }
    private void recordRun(UUID run,UUID source,String status,int attempts,Instant started,String error,String checksum) {
        jdbc.update("INSERT INTO sync_run(id,source_id,status,attempts,started_at,finished_at,error_code,checksum) VALUES (?,?,?,?,?,?,?,?)",run,source,status,attempts,Timestamp.from(started),Timestamp.from(clock.instant()),error,checksum);
    }
    private UUID identity(UUID source,String kind,String external,String checksum) {
        UUID id=UUID.nameUUIDFromBytes((source+":"+kind+":"+external).getBytes(StandardCharsets.UTF_8));
        jdbc.update("INSERT INTO provider_entity_map(source_id,entity_kind,external_id,internal_id,checksum,fetched_at) VALUES (?,?,?,?,?,?) ON CONFLICT(source_id,entity_kind,external_id) DO UPDATE SET checksum=excluded.checksum,fetched_at=excluded.fetched_at",source,kind,external,id,checksum,Timestamp.from(clock.instant()));
        return jdbc.queryForObject("SELECT internal_id FROM provider_entity_map WHERE source_id=? AND entity_kind=? AND external_id=?",UUID.class,source,kind,external);
    }
    private UUID reference(UUID source,Ref reference) {
        var ids=jdbc.queryForList("SELECT m.internal_id FROM provider_entity_map m JOIN "+reference.kind().table+" e ON e.id=m.internal_id WHERE m.source_id=? AND m.entity_kind=? AND m.external_id=?",UUID.class,source,reference.kind().wire,reference.externalId());
        if(ids.size()!=1) throw ApiFailure.validation(); return ids.getFirst();
    }
    private void write(UUID source,String mode,Datum row) {
        String checksum=Crypto.digest(json(row));
        var old=jdbc.queryForList("SELECT checksum FROM provider_entity_map WHERE source_id=? AND entity_kind=? AND external_id=?",String.class,source,row.kind().wire,row.externalId());
        if(!old.isEmpty() && old.getFirst().equals(checksum)) return;
        UUID id=identity(source,row.kind().wire,row.externalId(),checksum);
        Map<String,Object> values=new LinkedHashMap<>();values.put("id",id);
        for(String key:row.kind().columns) { Object value=row.fields().get(key); values.put(key,value instanceof Ref ref?reference(source,ref):value instanceof Instant instant?Timestamp.from(instant):value); }
        if(row.kind()!=Kind.SERIES) metadata(values,source,mode);
        if(row.kind()==Kind.RACE) { var revisions=jdbc.queryForList("SELECT revision FROM race_events WHERE id=?",Long.class,id);values.put("revision",revisions.isEmpty()?1L:revisions.getFirst()+1); }
        upsert(row.kind().table,values);
    }
    private void metadata(Map<String,Object> values,UUID source,String mode) {
        values.put("source_id",source);values.put("data_mode",mode);values.put("data_status",mode.equals("mock")?"synthetic":"current");
        Timestamp now=Timestamp.from(clock.instant());values.put("fetched_at",now);values.put("updated_at",now);
    }
    private void upsert(String table,Map<String,Object> values) {
        String columns=String.join(",",values.keySet());
        String update=values.keySet().stream().filter(key -> !key.equals("id")).map(key -> key+"=excluded."+key).collect(java.util.stream.Collectors.joining(","));
        // SQL identifiers come solely from the Kind enum and fixed metadata keys.
        jdbc.update("INSERT INTO "+table+" ("+columns+") VALUES ("+String.join(",",java.util.Collections.nCopies(values.size(),"?"))+") ON CONFLICT(id) DO UPDATE SET "+update,values.values().toArray());
    }
    private void writeSnapshot(UUID source,String mode,Snapshot snapshot) {
        String checksum=Crypto.digest(json(snapshot));
        var old=jdbc.queryForList("SELECT m.checksum,s.season_id,s.revision FROM provider_entity_map m JOIN standing_snapshots s ON s.id=m.internal_id WHERE m.source_id=? AND m.entity_kind='standing' AND m.external_id=?",source,snapshot.externalId());
        if(!old.isEmpty() && old.getFirst().get("checksum").equals(checksum)) return;
        UUID season=reference(source,new Ref(Kind.SEASON,snapshot.seasonId()));
        if(!old.isEmpty() && !old.getFirst().get("season_id").equals(season)) throw ApiFailure.validation();
        long revision=old.isEmpty()?1:((Number)old.getFirst().get("revision")).longValue()+1;
        UUID id=UUID.nameUUIDFromBytes((source+":standing:"+snapshot.externalId()+":"+revision+":"+checksum).getBytes(StandardCharsets.UTF_8));
        jdbc.update("INSERT INTO provider_entity_map(source_id,entity_kind,external_id,internal_id,checksum,fetched_at) VALUES (?,'standing',?,?,?,?) ON CONFLICT(source_id,entity_kind,external_id) DO UPDATE SET internal_id=excluded.internal_id,checksum=excluded.checksum,fetched_at=excluded.fetched_at",source,snapshot.externalId(),id,checksum,Timestamp.from(clock.instant()));
        Map<String,Object> values=new LinkedHashMap<>(); values.put("id",id);
        values.put("season_id",season);values.put("provider_external_id",snapshot.externalId());values.put("revision",revision);
        values.put("after_race_id",reference(source,new Ref(Kind.RACE,snapshot.afterRaceId())));
        values.put("captured_at",Timestamp.from(snapshot.capturedAt())); values.put("complete",true); metadata(values,source,mode);
        upsert("standing_snapshots",values);
        for(Rank row:snapshot.drivers()) jdbc.update("INSERT INTO driver_standings(snapshot_id,driver_id,source_id,position,points,wins) VALUES (?,?,?,?,?,?)",id,reference(source,new Ref(Kind.DRIVER,row.externalId())),source,row.position(),row.points(),row.wins());
        for(Rank row:snapshot.teams()) jdbc.update("INSERT INTO team_standings(snapshot_id,team_id,source_id,position,points,wins) VALUES (?,?,?,?,?,?)",id,reference(source,new Ref(Kind.TEAM,row.externalId())),source,row.position(),row.points(),row.wins());
    }
}
