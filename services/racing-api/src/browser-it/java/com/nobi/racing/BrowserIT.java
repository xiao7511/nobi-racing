package com.nobi.racing;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.images.builder.Transferable;
import tools.jackson.databind.ObjectMapper;
import static org.junit.jupiter.api.Assertions.*;

/** Only compiled with browser-it. The isolated control server is never packaged in the application. */
@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT)
class BrowserIT {
    static final PostgreSQLContainer PG=new PostgreSQLContainer("postgres:18.6-alpine").withDatabaseName("nobi_phase3_browser").withUsername("browser_owner").withPassword(UUID.randomUUID().toString());
    static final String REDIS_VALUE=UUID.randomUUID().toString();
    static final GenericContainer<?> REDIS=new GenericContainer<>("redis:8.2-alpine").withExposedPorts(6379)
        .withCopyToContainer(Transferable.of("user default off\nuser nobi on #"+Crypto.digest(REDIS_VALUE)+" ~nobi:p2:* +@connection +get +set +incr +pexpire +eval +del +exists +pttl\n"),"/tmp/users.acl")
        .withCommand("redis-server","--save","","--appendonly","no","--aclfile","/tmp/users.acl");
    static { PG.start();REDIS.start(); }
    @DynamicPropertySource static void properties(DynamicPropertyRegistry p) {
        p.add("spring.datasource.url",PG::getJdbcUrl);p.add("spring.datasource.username",PG::getUsername);p.add("spring.datasource.password",PG::getPassword);
        p.add("spring.flyway.user",PG::getUsername);p.add("spring.flyway.password",PG::getPassword);p.add("spring.flyway.enabled",() -> true);
        p.add("spring.data.redis.host",REDIS::getHost);p.add("spring.data.redis.port",() -> REDIS.getMappedPort(6379));p.add("spring.data.redis.username",() -> "nobi");p.add("spring.data.redis.password",() -> REDIS_VALUE);
        p.add("nobi.cache.enabled",() -> true);p.add("nobi.api.limit",() -> 10000);p.add("nobi.sync.limit",() -> 10000);
    }
    @LocalServerPort int port;
    @Autowired LocalDemo demo;@Autowired SyncService sync;@Autowired JdbcTemplate jdbc;@Autowired RightsPolicy rights;
    @Autowired RedisSupport redis;@Autowired TransactionTemplate transactions;@Autowired ObjectMapper mapper;@Autowired java.time.Clock clock;
    @Test void browserJourneysUseRealAuthorizedDatabaseData() throws Exception {
        demo.seed();sync.synchronize(LocalDemo.SOURCE);
        // An authorized historical catalogue entry without standings exercises genuine season empty states.
        jdbc.update("INSERT INTO seasons(id,series_id,year,source_id,data_mode,fetched_at,data_status) SELECT ?,id,2025,?,'mock',now(),'synthetic' FROM series WHERE code='NOBI_MOCK'",UUID.nameUUIDFromBytes("nobi:browser:2025".getBytes(StandardCharsets.UTF_8)),LocalDemo.SOURCE);
        Path root=Path.of("").toAbsolutePath();while(root!=null && !Files.exists(root.resolve("pnpm-workspace.yaml"))) root=root.getParent();
        assertNotNull(root,"Workspace root required");
        String entry=System.getenv("NOBI_PNPM_ENTRY");assertNotNull(entry,"Use pnpm verify:phase3 to supply the pinned pnpm executable");
        String controlKey=UUID.randomUUID().toString();
        HttpServer control=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
        control.createContext("/control",exchange -> {
            String supplied=exchange.getRequestHeaders().getFirst("X-Test-Key");
            if(!"POST".equals(exchange.getRequestMethod()) || supplied==null || !MessageDigest.isEqual(controlKey.getBytes(StandardCharsets.UTF_8),supplied.getBytes(StandardCharsets.UTF_8))) { exchange.sendResponseHeaders(403,-1);exchange.close();return; }
            try {
                switch(exchange.getRequestURI().getPath()) {
                    case "/control/revoke" -> jdbc.update("UPDATE source_grant SET status='revoked',revision=revision+1 WHERE source_id=?",LocalDemo.SOURCE);
                    case "/control/restore" -> { jdbc.update("UPDATE source_grant SET status='approved',revision=revision+1 WHERE source_id=?",LocalDemo.SOURCE);sync.synchronize(LocalDemo.SOURCE); }
                    case "/control/team-points" -> {
                        var original=new SyntheticAdapter();var batch=original.fetch();var snapshot=batch.snapshots().getFirst();var teams=new java.util.ArrayList<>(snapshot.teams());var leader=teams.getFirst();teams.set(0,new SourceAdapter.Rank(leader.externalId(),leader.position(),new java.math.BigDecimal("999.125"),leader.wins()));
                        var correction=new SourceAdapter.Snapshot(snapshot.externalId(),snapshot.seasonId(),snapshot.afterRaceId(),snapshot.capturedAt(),true,snapshot.drivers(),teams);
                        SourceAdapter adapter=new SourceAdapter(){public String code(){return original.code();}public String mode(){return "mock";}public Batch fetch(){return new Batch(batch.generatedAt(),batch.entities(),List.of(correction));}};
                        new SyncService(jdbc,rights,redis,transactions,mapper,clock,List.of(adapter),3,10000,60,0).synchronize(LocalDemo.SOURCE);
                    }
                    default -> { exchange.sendResponseHeaders(404,-1);exchange.close();return; }
                }
                exchange.sendResponseHeaders(200,-1);
            } catch(RuntimeException failure) { exchange.sendResponseHeaders(500,-1); }
            finally { exchange.close(); }
        });
        control.start();
        Path directory=root.resolve("docs/verification/phase-3");Files.createDirectories(directory);Path log=directory.resolve("backend-browser.log");
        var builder=new ProcessBuilder("node",entry,"exec","playwright","test","--config","playwright.backend.config.ts").directory(root.toFile()).redirectErrorStream(true).redirectOutput(log.toFile());
        builder.environment().put("NOBI_API_PROXY","http://127.0.0.1:"+port);
        builder.environment().put("NOBI_TEST_CONTROL_URL","http://127.0.0.1:"+control.getAddress().getPort()+"/control");
        builder.environment().put("NOBI_TEST_CONTROL_KEY",controlKey);
        Process child=null;
        try {
            child=builder.start();assertTrue(child.waitFor(240,TimeUnit.SECONDS),"Browser suite timed out; see backend-browser.log");
            assertEquals(0,child.exitValue(),"Browser tests failed; see docs/verification/phase-3/backend-browser.log");
        } finally {
            if(child!=null && child.isAlive()) { child.descendants().forEach(ProcessHandle::destroyForcibly);child.destroyForcibly(); }
            control.stop(0);
        }
    }
}
