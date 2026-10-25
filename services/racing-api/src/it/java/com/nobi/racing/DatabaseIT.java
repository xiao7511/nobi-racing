package com.nobi.racing;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.time.Clock;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.AfterAll;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.images.builder.Transferable;
import org.testcontainers.DockerClientFactory;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.JsonNode;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT)
class DatabaseIT {
    static final PostgreSQLContainer POSTGRES=new PostgreSQLContainer("postgres:18.6-alpine").withDatabaseName("nobi_phase2_it").withUsername("nobi_test_owner").withPassword(UUID.randomUUID().toString());
    static final String REDIS_CREDENTIAL=UUID.randomUUID().toString();
    static final GenericContainer<?> REDIS=new GenericContainer<>("redis:8.2-alpine")
        .withExposedPorts(6379).withCopyToContainer(Transferable.of("user default off\nuser nobi on #"+Crypto.digest(REDIS_CREDENTIAL)+" ~nobi:p2:* +@connection +get +set +incr +pexpire +eval +del +exists +pttl\n"),"/tmp/users.acl")
        .withCommand("redis-server","--save","","--appendonly","no","--aclfile","/tmp/users.acl");
    static { POSTGRES.start();REDIS.start(); }
    @DynamicPropertySource static void properties(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url",POSTGRES::getJdbcUrl);properties.add("spring.datasource.username",POSTGRES::getUsername);properties.add("spring.datasource.password",POSTGRES::getPassword);
        properties.add("spring.flyway.user",POSTGRES::getUsername);properties.add("spring.flyway.password",POSTGRES::getPassword);properties.add("spring.flyway.enabled",() -> true);
        properties.add("spring.data.redis.host",REDIS::getHost);properties.add("spring.data.redis.port",() -> REDIS.getMappedPort(6379));properties.add("spring.data.redis.username",() -> "nobi");properties.add("spring.data.redis.password",() -> REDIS_CREDENTIAL);
        properties.add("nobi.cache.enabled",() -> true);properties.add("nobi.api.limit",() -> 10000);properties.add("nobi.sync.limit",() -> 10000);
    }
    @LocalServerPort int port;
    @Autowired JdbcTemplate jdbc; @Autowired LocalDemo demo; @Autowired SyncService sync; @Autowired RightsPolicy rights;
    @Autowired RedisSupport cache; @Autowired StringRedisTemplate redis; @Autowired ObjectMapper mapper;
    @Autowired TransactionTemplate transactions; @Autowired Clock clock;
    private final HttpClient client=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    private static final List<Map<String,Object>> SAMPLES=new ArrayList<>();
    @BeforeEach void reset() { jdbc.execute("TRUNCATE app_user,data_source,series,audit_event,outbox_event CASCADE");demo.seed(); }
    HttpResponse<String> get(String path) throws Exception { return client.send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:"+port+"/api/v1"+path)).timeout(Duration.ofSeconds(10)).GET().build(),HttpResponse.BodyHandlers.ofString()); }
    JsonNode ok(String path,String contract) throws Exception {
        var response=get(path);assertEquals(200,response.statusCode(),response.body());
        JsonNode body=mapper.readTree(response.body());SAMPLES.add(Map.of("path",contract,"status",200,"body",body));return body;
    }
    String firstId(String resource) throws Exception { return ok("/"+resource,"/api/v1/"+resource).get("items").get(0).get("id").asText(); }
    SyncService alternate(SourceAdapter adapter) { return new SyncService(jdbc,rights,cache,transactions,mapper,clock,List.of(adapter),3,10000,60,0); }
    @AfterAll static void exportContracts() throws Exception {
        Path path=Path.of("target/phase2-contract-samples.json");Files.createDirectories(path.getParent());
        Files.writeString(path,tools.jackson.databind.json.JsonMapper.builder().build().writeValueAsString(SAMPLES));
    }
    @Test void migrationsAreRepeatableAndUpgradeV1WithoutRewritingIt() throws Exception {
        var flyway=Flyway.configure().dataSource(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword()).load();
        assertEquals(0,flyway.migrate().migrationsExecuted);flyway.validate();assertEquals(2,flyway.info().applied().length);
        String schema="upgrade_"+UUID.randomUUID().toString().replace("-","");
        var v1=Flyway.configure().dataSource(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword()).schemas(schema).defaultSchema(schema).target("1").load();assertEquals(1,v1.migrate().migrationsExecuted);
        try(var connection=DriverManager.getConnection(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword());var sql=connection.createStatement()) {
            sql.execute("SET search_path TO "+schema);sql.execute("INSERT INTO series(code,name) VALUES('LEGACY','Legacy internal catalogue')");sql.execute("INSERT INTO season(series_id,year) SELECT id,2026 FROM series");
            var upgrade=Flyway.configure().dataSource(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword()).schemas(schema).defaultSchema(schema).load();assertEquals(1,upgrade.migrate().migrationsExecuted);upgrade.validate();
            try(var rows=sql.executeQuery("SELECT count(*) FROM seasons")) { assertTrue(rows.next());assertEquals(1,rows.getInt(1)); }
        }
    }
    @Test void synchronizationIsIdempotentAndWritesTransactionalEvidence() {
        var first=sync.synchronize(LocalDemo.SOURCE);assertEquals("success",first.status());
        int mappings=jdbc.queryForObject("SELECT count(*) FROM provider_entity_map",Integer.class);
        var second=sync.synchronize(LocalDemo.SOURCE);assertEquals("unchanged",second.status());assertEquals(first.dataRevision(),second.dataRevision());
        assertEquals(mappings,jdbc.queryForObject("SELECT count(*) FROM provider_entity_map",Integer.class));assertEquals(1,jdbc.queryForObject("SELECT count(*) FROM outbox_event",Integer.class));
        assertEquals(2,jdbc.queryForObject("SELECT count(*) FROM sync_run",Integer.class));assertEquals(4,jdbc.queryForObject("SELECT count(*) FROM driver_standings",Integer.class));
        assertEquals(0,jdbc.queryForObject("SELECT count(*) FROM provider_entity_map WHERE checksum !~ '^[a-f0-9]{64}$'",Integer.class));
    }
    @Test void concurrentSyncsPublishOneVersionAndCorrectionsKeepPreviousSnapshots() throws Exception {
        try(var executor=java.util.concurrent.Executors.newFixedThreadPool(2)) {
            var first=executor.submit(() -> sync.synchronize(LocalDemo.SOURCE));var second=executor.submit(() -> sync.synchronize(LocalDemo.SOURCE));
            assertEquals(java.util.Set.of("success","unchanged"),java.util.Set.of(first.get().status(),second.get().status()));
        }
        assertEquals(1,jdbc.queryForObject("SELECT count(*) FROM outbox_event",Integer.class));
        UUID originalId=jdbc.queryForObject("SELECT id FROM standing_snapshots",UUID.class);
        var original=new SyntheticAdapter();var batch=original.fetch();var snapshot=batch.snapshots().getFirst();var ranks=new ArrayList<>(snapshot.drivers());
        var leader=ranks.getFirst();ranks.set(0,new SourceAdapter.Rank(leader.externalId(),1,new java.math.BigDecimal("286.25"),leader.wins()));
        var corrected=new SourceAdapter.Snapshot(snapshot.externalId(),snapshot.seasonId(),snapshot.afterRaceId(),snapshot.capturedAt(),true,ranks,snapshot.teams());
        SourceAdapter adapter=new SourceAdapter(){public String code(){return original.code();}public String mode(){return "mock";}public Batch fetch(){return new Batch(batch.generatedAt(),batch.entities(),List.of(corrected));}};
        assertEquals("success",alternate(adapter).synchronize(LocalDemo.SOURCE).status());assertEquals(2,jdbc.queryForObject("SELECT count(*) FROM standing_snapshots",Integer.class));
        assertEquals(new java.math.BigDecimal("286.500"),jdbc.queryForObject("SELECT points FROM driver_standings WHERE snapshot_id=? AND position=1",java.math.BigDecimal.class,originalId));
        assertEquals(2L,jdbc.queryForObject("SELECT max(revision) FROM standing_snapshots",Long.class));
    }
    @Test void publicApiReturnsBilingualProvenanceSchedulesResultsAndFullStandings() throws Exception {
        sync.synchronize(LocalDemo.SOURCE);
        String season=firstId("seasons");firstId("circuits");firstId("teams");String driver=firstId("drivers");
        ok("/drivers/"+driver,"/api/v1/drivers/{id}");ok("/teams/"+firstId("teams"),"/api/v1/teams/{id}");ok("/seasons/"+season,"/api/v1/seasons/{id}");ok("/circuits/"+firstId("circuits"),"/api/v1/circuits/{id}");
        assertEquals(4,ok("/seasons/"+season+"/entries","/api/v1/seasons/{id}/entries").get("items").size());
        var calendar=ok("/races?locale=zh-CN","/api/v1/races");assertEquals(3,calendar.get("items").size());assertTrue(calendar.get("items").toString().contains("大奖赛"));
        var race=calendar.get("items").get(0);String raceId=race.get("id").asText();
        assertEquals("mock",race.get("provenance").get("mode").asText());assertEquals("synthetic",race.get("dataStatus").asText());assertNotNull(race.get("timeZone"));
        ok("/races/"+raceId,"/api/v1/races/{id}");
        var sessions=ok("/races/"+raceId+"/sessions","/api/v1/races/{id}/sessions");assertEquals(1,sessions.get("items").size());
        String session=sessions.get("items").get(0).get("id").asText();
        var results=ok("/sessions/"+session+"/results","/api/v1/sessions/{id}/results");assertEquals(4,results.get("items").size());assertTrue(results.get("items").get(0).get("points").isString());assertTrue(results.toString().contains("dnf"));
        var standing=ok("/standings?seasonId="+season+"&type=driver","/api/v1/standings");assertEquals(4,standing.get("items").size());assertEquals("286.5",standing.get("items").get(0).get("points").asText());assertNotNull(standing.get("snapshotId"));
        var teams=ok("/standings?seasonId="+season+"&type=team","/api/v1/standings");assertEquals("517.5",teams.get("items").get(0).get("points").asText());
        ok("/readiness","/api/v1/readiness");
    }
    @Test void signedPaginationNeverMixesQueriesOrAuthorityRevisions() throws Exception {
        sync.synchronize(LocalDemo.SOURCE);
        var page=ok("/drivers?limit=2","/api/v1/drivers");String cursor=page.get("nextCursor").asText();
        var next=ok("/drivers?limit=2&cursor="+cursor,"/api/v1/drivers");assertEquals(2,next.get("items").size());assertNotEquals(page.get("items").get(0).get("id"),next.get("items").get(0).get("id"));
        assertEquals(409,get("/teams?limit=2&cursor="+cursor).statusCode());assertEquals(400,get("/drivers?limit=2&cursor=A"+cursor).statusCode());
        jdbc.update("UPDATE source_grant SET revision=revision+1 WHERE source_id=?",LocalDemo.SOURCE);
        assertEquals(409,get("/drivers?limit=2&cursor="+cursor).statusCode());
    }
    @Test void revocationExpiryAndScopeAreCheckedBeforeCacheHits() throws Exception {
        sync.synchronize(LocalDemo.SOURCE);
        var response=ok("/drivers","/api/v1/drivers");String driver=response.get("items").get(0).get("id").asText();
        String fingerprint=RightsPolicy.fingerprint(rights.allowed("catalog"));String binding=Crypto.digest("DRIVERS|en-US|20|{}|"+fingerprint);
        String key="nobi:p2:catalog:"+Crypto.digest(binding+"|null");assertNotNull(cache.get(key));
        jdbc.update("UPDATE source_grant SET status='revoked',revision=revision+1 WHERE source_id=?",LocalDemo.SOURCE);
        assertEquals(0,ok("/drivers","/api/v1/drivers").get("items").size());assertEquals(404,get("/drivers/"+driver).statusCode());
        jdbc.update("UPDATE source_grant SET status='approved',valid_until=now()-interval '1 second',valid_from=now()-interval '1 day' WHERE source_id=?",LocalDemo.SOURCE);
        assertEquals(0,ok("/drivers","/api/v1/drivers").get("items").size());
        jdbc.update("UPDATE source_grant SET valid_until=now()+interval '1 day',territories=ARRAY['CN'] WHERE source_id=?",LocalDemo.SOURCE);
        assertEquals(0,ok("/drivers","/api/v1/drivers").get("items").size());assertEquals(400,get("/drivers?territory=CN").statusCode());
    }
    @Test void deniedSyncDoesNotCallAdapterAndRechecksBeforeCommit() {
        var calls=new AtomicInteger();var original=new SyntheticAdapter();
        SourceAdapter fake=new SourceAdapter() { public String code(){return original.code();}public String mode(){return "mock";}public Batch fetch(){calls.incrementAndGet();return original.fetch();} };
        jdbc.update("UPDATE data_source SET enabled=false WHERE id=?",LocalDemo.SOURCE);
        assertEquals(403,assertThrows(ApiFailure.class,() -> alternate(fake).synchronize(LocalDemo.SOURCE)).status());assertEquals(0,calls.get());
        jdbc.update("UPDATE data_source SET enabled=true WHERE id=?",LocalDemo.SOURCE);
        SourceAdapter revokeDuringFetch=new SourceAdapter() { public String code(){return original.code();}public String mode(){return "mock";}public Batch fetch(){calls.incrementAndGet();jdbc.update("UPDATE source_grant SET status='revoked' WHERE source_id=?",LocalDemo.SOURCE);return original.fetch();} };
        assertEquals(403,assertThrows(ApiFailure.class,() -> alternate(revokeDuringFetch).synchronize(LocalDemo.SOURCE)).status());assertEquals(0,jdbc.queryForObject("SELECT count(*) FROM drivers",Integer.class));
    }
    @Test void transientFetchRetriesButGrantRevocationStopsTheNextAttempt() {
        var calls=new AtomicInteger();var original=new SyntheticAdapter();
        SourceAdapter transientAdapter=new SourceAdapter(){public String code(){return original.code();}public String mode(){return "mock";}public Batch fetch(){if(calls.incrementAndGet()<3)throw new Failure(503,0);return original.fetch();}};
        assertEquals("success",alternate(transientAdapter).synchronize(LocalDemo.SOURCE).status());assertEquals(3,calls.get());
        SourceAdapter revoked=new SourceAdapter(){public String code(){return original.code();}public String mode(){return "mock";}public Batch fetch(){jdbc.update("UPDATE source_grant SET status='revoked' WHERE source_id=?",LocalDemo.SOURCE);throw new Failure(429,0);}};
        assertEquals(403,assertThrows(ApiFailure.class,() -> alternate(revoked).synchronize(LocalDemo.SOURCE)).status());
    }
    @Test void incompleteAndForeignReferencePayloadsRollbackEveryDomainWrite() {
        var original=new SyntheticAdapter();var batch=original.fetch();var snapshot=batch.snapshots().getFirst();
        var incomplete=new SourceAdapter.Snapshot(snapshot.externalId(),snapshot.seasonId(),snapshot.afterRaceId(),snapshot.capturedAt(),true,snapshot.drivers().subList(0,2),snapshot.teams());
        SourceAdapter bad=new SourceAdapter(){public String code(){return original.code();}public String mode(){return "mock";}public Batch fetch(){return new Batch(batch.generatedAt(),batch.entities(),List.of(incomplete));}};
        assertEquals(400,assertThrows(ApiFailure.class,() -> alternate(bad).synchronize(LocalDemo.SOURCE)).status());assertEquals(0,jdbc.queryForObject("SELECT count(*) FROM provider_entity_map",Integer.class));
        var rows=new ArrayList<>(batch.entities());var row=rows.stream().filter(r -> r.kind()==SourceAdapter.Kind.RACE_ENTRY).findFirst().orElseThrow();var fields=new java.util.HashMap<>(row.fields());fields.put("driver_id",new SourceAdapter.Ref(SourceAdapter.Kind.DRIVER,"missing"));rows.set(rows.indexOf(row),new SourceAdapter.Datum(row.kind(),row.externalId(),fields));
        SourceAdapter foreign=new SourceAdapter(){public String code(){return original.code();}public String mode(){return "mock";}public Batch fetch(){return new Batch(batch.generatedAt(),rows,batch.snapshots());}};
        assertThrows(ApiFailure.class,() -> alternate(foreign).synchronize(LocalDemo.SOURCE));assertEquals(0,jdbc.queryForObject("SELECT count(*) FROM drivers",Integer.class));assertEquals(0,jdbc.queryForObject("SELECT count(*) FROM outbox_event",Integer.class));
    }
    @Test void databaseConstraintsPreventCrossSourceAndCrossRaceResults() {
        sync.synchronize(LocalDemo.SOURCE);
        UUID other=UUID.randomUUID();jdbc.update("INSERT INTO data_source(id,code,name,mode,attribution) VALUES (?,'OTHER','Other mock','mock','Original')",other);
        assertThrows(org.springframework.dao.DataIntegrityViolationException.class,() -> jdbc.update("UPDATE drivers SET source_id=?",other));
        assertThrows(org.springframework.dao.DataIntegrityViolationException.class,() -> jdbc.update("UPDATE session_results SET race_id=(SELECT id FROM race_events WHERE status='scheduled' LIMIT 1)"));
        assertThrows(org.springframework.dao.DataIntegrityViolationException.class,() -> jdbc.update("UPDATE drivers SET data_mode='licensed'"));
    }
    @Test void redisAclAndAtomicLimitsAreEnforcedAndCacheOutageFallsBackToDatabase() throws Exception {
        sync.synchronize(LocalDemo.SOURCE);assertTrue(cache.healthy());
        assertThrows(RuntimeException.class,() -> redis.opsForValue().set("outside-prefix","denied"));
        String key="test:"+UUID.randomUUID();assertTrue(cache.acquire(key,2,Duration.ofSeconds(60)));assertTrue(cache.acquire(key,2,Duration.ofSeconds(60)));assertFalse(cache.acquire(key,2,Duration.ofSeconds(60)));
        DockerClientFactory.instance().client().pauseContainerCmd(REDIS.getContainerId()).exec();
        try { assertFalse(cache.healthy());assertEquals(4,ok("/drivers","/api/v1/drivers").get("items").size());assertTrue(ok("/readiness","/api/v1/readiness").toString().contains("degraded")); }
        finally { DockerClientFactory.instance().client().unpauseContainerCmd(REDIS.getContainerId()).exec(); }
    }
    @Test void errorsStaffBoundaryAndInputValidationDoNotExposeInternals() throws Exception {
        for(String path:List.of("/drivers?limit=0","/drivers?locale=fr","/drivers?limit=1&limit=2","/races?status=live","/races?from=invalid","/drivers/not-a-uuid","/standings","/standings?seasonId="+UUID.randomUUID()+"&type=unknown")) {
            var response=get(path);assertEquals(400,response.statusCode(),path+response.body());assertTrue(response.body().contains("traceId"));assertFalse(response.body().contains("SELECT "));
            SAMPLES.add(Map.of("path","/api/v1/drivers","status",400,"body",mapper.readTree(response.body())));
        }
        assertEquals(401,get("/admin/sources").statusCode());var response=get("/drivers/"+UUID.randomUUID());assertEquals(404,response.statusCode());assertEquals("no-store",response.headers().firstValue("Cache-Control").orElse(""));
    }
    @Test void readOnlyDatabaseRoleCannotChangeSchemaOrLicensing() throws Exception {
        String role="nobi_reader_"+UUID.randomUUID().toString().replace("-","");jdbc.execute("CREATE ROLE "+role+" NOLOGIN");jdbc.execute("GRANT USAGE ON SCHEMA public TO "+role);jdbc.execute("GRANT SELECT ON ALL TABLES IN SCHEMA public TO "+role);
        try(var connection=DriverManager.getConnection(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword());var sql=connection.createStatement()) {
            sql.execute("SET ROLE "+role);assertThrows(SQLException.class,() -> sql.execute("CREATE TABLE forbidden(id integer)"));assertThrows(SQLException.class,() -> sql.execute("UPDATE source_grant SET status='approved'"));
            try(var result=sql.executeQuery("SELECT count(*) FROM drivers")){assertTrue(result.next());}
        } finally { jdbc.execute("DROP OWNED BY "+role);jdbc.execute("DROP ROLE "+role); }
    }
}
