package com.nobi.racing;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import java.nio.file.*;
import java.time.*;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.*;
class OpenRacingCatalogTest {
    final ObjectMapper mapper=new ObjectMapper();
    byte[] liveEvidence() throws Exception { return Files.readAllBytes(Path.of("../../docs/verification/official-content/wikidata-live.json")); }
    @Test void realOpenResponseParsesAndSyncIsRateLimited() throws Exception {
        byte[] body=liveEvidence(); AtomicInteger calls=new AtomicInteger();
        var clock=new OfficialNewsTest.MutableClock(Instant.parse("2026-11-01T00:00:00Z"));
        var catalog=new OpenRacingCatalog(mapper,clock,true,uri->{calls.incrementAndGet();return body;});
        assertEquals("pending",catalog.read().status()); catalog.sync();
        assertEquals("ready",catalog.read().status()); assertEquals("CC0 1.0",catalog.read().license());
        assertEquals(3,catalog.read().items().size()); assertEquals("Ferrari F2005",catalog.read().items().getFirst().name());
        catalog.sync(); assertEquals(1,calls.get());
        clock.value=clock.value.plus(Duration.ofHours(6)); assertTrue(catalog.read().items().isEmpty());
    }
    @Test void disabledAndUnavailableSourcesNeverProduceFallbackFacts() {
        AtomicInteger calls=new AtomicInteger();
        var catalog=new OpenRacingCatalog(mapper,Clock.systemUTC(),false,uri->{calls.incrementAndGet();throw new Exception();});
        catalog.sync(); assertEquals(0,calls.get()); assertEquals("disabled",catalog.read().status());
        var failed=new OpenRacingCatalog(mapper,Clock.systemUTC(),true,uri->{throw new Exception("internal information");});
        failed.sync(); assertEquals("upstream_error",failed.read().status()); assertTrue(failed.read().items().isEmpty());
    }
    @Test void malformedEntitiesDoNotEnterCatalog() {
        assertThrows(Exception.class,()->OpenRacingCatalog.parse(mapper,"{\"success\":1,\"entities\":{}}".getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        assertThrows(Exception.class,()->OpenRacingCatalog.parse(mapper,new byte[65537]));
    }
}
