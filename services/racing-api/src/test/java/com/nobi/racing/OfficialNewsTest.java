package com.nobi.racing;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import tools.jackson.databind.ObjectMapper;
import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.nio.ByteBuffer;
import java.util.concurrent.Flow;
import static org.junit.jupiter.api.Assertions.*;

class OfficialNewsTest {
    @TempDir Path temp;
    final Instant now = Instant.parse("2026-11-01T00:00:00Z");
    final ObjectMapper mapper = new ObjectMapper();
    OfficialNews.Grant grant() { return new OfficialNews.Grant("formula1", "approved", "contract-123", now.toString(), now.plusSeconds(3600).toString(), List.of("CN"), List.of("headline-link-display")); }
    byte[] feed() { return ("<rss><channel><item><title>Original headline</title><link>https://www.formula1.com/en/latest/article/test</link><description>NEVER COPY BODY</description></item></channel></rss>").getBytes(StandardCharsets.UTF_8); }
    @Test void requiresApprovalCapabilityTerritoryEvidenceAndBothTimeBounds() {
        var g = grant(); assertTrue(g.permits(now,"CN")); assertFalse(g.permits(now.minusSeconds(1),"CN")); assertFalse(g.permits(now.plusSeconds(3600),"CN")); assertFalse(g.permits(now,"US"));
        assertFalse(new OfficialNews.Grant("formula1","revoked",g.evidence(),g.validFrom(),g.validUntil(),g.territories(),g.capabilities()).permits(now,"CN"));
        assertFalse(new OfficialNews.Grant("formula1","approved","",g.validFrom(),g.validUntil(),g.territories(),g.capabilities()).permits(now,"CN"));
        assertFalse(new OfficialNews.Grant("formula1","approved",g.evidence(),g.validFrom(),g.validUntil(),g.territories(),List.of("body")).permits(now,"CN"));
    }
    @Test void missingRightsNeverFetchAndRevocationErasesPreviouslySyncedHeadlines() throws Exception {
        Path path = temp.resolve("grants.json"); AtomicInteger calls = new AtomicInteger();
        var service = new OfficialNews(mapper,Clock.fixed(now, ZoneOffset.UTC),path.toString(),"CN",uri -> { calls.incrementAndGet(); return feed(); });
        service.sync(); assertEquals(0,calls.get()); assertEquals("rights_required",service.read().getFirst().status());
        Files.writeString(path,mapper.writeValueAsString(List.of(grant()))); service.sync();
        assertEquals(1,calls.get()); assertEquals("ready",service.read().getFirst().status());
        assertEquals(1,service.read().getFirst().items().size()); service.sync(); assertEquals(1,calls.get());
        assertFalse(mapper.writeValueAsString(service.read()).contains("NEVER COPY BODY"));
        Files.writeString(path,"[]"); assertEquals("rights_required",service.read().getFirst().status()); assertTrue(service.read().getFirst().items().isEmpty());
    }
    @Test void expiresWithoutWaitingForSchedulerAndUpstreamFailureIsNotSampleData() throws Exception {
        Path path = temp.resolve("grants.json"); Files.writeString(path,mapper.writeValueAsString(List.of(grant())));
        var clock = new MutableClock(now);
        AtomicInteger calls = new AtomicInteger();
        var service = new OfficialNews(mapper,clock,path.toString(),"CN",uri -> { if (calls.incrementAndGet() > 1) throw new java.io.IOException("private upstream detail"); return feed(); });
        service.sync(); clock.value = now.plusSeconds(900);
        assertTrue(service.read().getFirst().items().isEmpty()); service.sync();
        assertEquals("upstream_error",service.read().getFirst().status()); assertFalse(mapper.writeValueAsString(service.read()).contains("private upstream"));
        Files.writeString(path,"invalid JSON"); assertEquals("rights_required",service.read().getFirst().status());
    }
    @Test void rejectsExternalEntitiesHtmlOversizeFeedsUnsafeLinksAndDuplicates() throws Exception {
        assertThrows(Exception.class, () -> OfficialNews.parse("<!DOCTYPE rss [<!ENTITY e SYSTEM 'file:///etc/passwd'>]><rss>&e;</rss>".getBytes(StandardCharsets.UTF_8),"www.formula1.com"));
        assertThrows(Exception.class, () -> OfficialNews.parse(new byte[OfficialNews.MAX_BYTES+1],"www.formula1.com"));
        assertThrows(Exception.class, () -> OfficialNews.parse("<html/>".getBytes(StandardCharsets.UTF_8),"www.formula1.com"));
        for (String bad : List.of("javascript:alert(1)","https://www.formula1.com.evil.test/en/latest/a","https://www.formula1.com/en/latest/a?redirect=x","https://user@www.formula1.com/en/latest/a","http://www.formula1.com/en/latest/a","https://www.formula1.com/en/latest/%2e%2e/b")) assertFalse(OfficialNews.safeLink(bad,"www.formula1.com"));
        var items = OfficialNews.parse(("<rss><channel>"+new String(feed(),StandardCharsets.UTF_8).split("<channel>")[1].split("</channel>")[0].repeat(2)+"</channel></rss>").getBytes(StandardCharsets.UTF_8),"www.formula1.com");
        assertEquals(1,items.size()); assertNull(items.getFirst().publishedAt());
    }
    @Test void boundedSubscriberCancelsOversizeStream() {
        var body = new OfficialNews.LimitedBody(); AtomicInteger cancelled = new AtomicInteger();
        body.onSubscribe(new Flow.Subscription() { public void request(long n) {} public void cancel() { cancelled.incrementAndGet(); } });
        body.onNext(List.of(ByteBuffer.wrap(new byte[OfficialNews.MAX_BYTES+1])));
        assertEquals(1,cancelled.get()); assertTrue(body.getBody().toCompletableFuture().isCompletedExceptionally());
    }
    static class MutableClock extends Clock {
        Instant value; MutableClock(Instant value) { this.value=value; }
        public ZoneId getZone() { return ZoneOffset.UTC; } public Clock withZone(ZoneId zone) { return this; } public Instant instant() { return value; }
    }
}
