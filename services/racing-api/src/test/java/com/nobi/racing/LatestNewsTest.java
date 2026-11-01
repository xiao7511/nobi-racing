package com.nobi.racing;
import org.junit.jupiter.api.Test;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.*;
class LatestNewsTest {
    final Instant now = Instant.parse("2026-11-01T05:00:00Z");
    byte[] feed(String items) { return ("<rss><channel><title>BBC Sport</title><lastBuildDate>Sun, 01 Nov 2026 04:59:00 GMT</lastBuildDate>"+items+"</channel></rss>").getBytes(StandardCharsets.UTF_8); }
    String item(String title, String url, String date) { return "<item><title><![CDATA["+title+"]]></title><link>"+url.replace("&","&amp;")+"</link><pubDate>"+date+"</pubDate><description>RSS short summary</description><articleBody>BODY_NOT_FOR_COPY</articleBody></item>"; }
    byte[] sample() { return feed(item("Original test headline", "https://www.bbc.co.uk/sport/formula1/articles/abc123?at_medium=RSS&at_campaign=rss", "Sun, 01 Nov 2026 04:00:00 GMT")); }
    @Test void personalModeAndLoopbackAreBothRequiredBeforeAnyFetch() {
        for (var config : List.of(List.of("disabled","127.0.0.1"),List.of("commercial","127.0.0.1"),List.of("personal","0.0.0.0"),List.of("personal","localhost"))) {
            AtomicInteger calls = new AtomicInteger();
            var service = new LatestNews(Clock.fixed(now,ZoneOffset.UTC),config.get(0),config.get(1),uri->{calls.incrementAndGet();return sample();});
            service.sync(); assertEquals(0,calls.get()); assertEquals("disabled",service.read().status()); assertTrue(service.read().items().isEmpty());
        }
    }
    @Test void usesScheduledCacheAndHidesExpiredOrFailedNewsWithoutFallback() {
        var clock = new OfficialNewsTest.MutableClock(now); AtomicInteger calls = new AtomicInteger();
        var service = new LatestNews(clock,"personal","127.0.0.1",uri->{assertEquals(LatestNews.FEED,uri);if(calls.incrementAndGet()>1)throw new Exception("sensitive upstream detail");return sample();});
        assertEquals("pending",service.read().status()); assertEquals(0,calls.get());
        service.sync(); assertEquals("ready",service.read().status());
        var item = service.read().items().getFirst(); assertEquals("Original test headline",item.title());
        assertEquals("2026-11-01T04:00:00Z",service.read().newestPublishedAt()); assertEquals("2026-11-01T04:59:00Z",service.read().sourceUpdatedAt());
        assertTrue(item.url().endsWith("?at_medium=RSS&at_campaign=rss"));
        service.sync(); service.read(); assertEquals(1,calls.get());
        clock.value = now.plusSeconds(900); assertTrue(service.read().items().isEmpty()); assertNull(service.read().syncedAt());
        service.sync(); assertEquals(2,calls.get()); assertEquals("upstream_error",service.read().status()); assertTrue(service.read().items().isEmpty());
    }
    @Test void parsesOnlyRacingTitlesPreservesLinksSortsDatesAndDeduplicates() throws Exception {
        String path="https://www.bbc.co.uk/sport/formula1/articles/abc123";
        var parsed=LatestNews.parse(feed(item("First & original",path,"Sun, 01 Nov 2026 01:00:00 GMT")
            +item("Duplicate",path+"?at_medium=RSS&at_campaign=rss","Sun, 01 Nov 2026 02:00:00 GMT")
            +item("Newest","https://www.bbc.com/sport/formula1/articles/def456","Sun, 01 Nov 2026 04:00:00 GMT")
            +item("Missing date","https://www.bbc.co.uk/sport/formula1/123456","invalid")
            +item("Promotion","https://www.bbc.co.uk/iplayer/episode/x","Sun, 01 Nov 2026 03:00:00 GMT")
            +item("Future","https://www.bbc.co.uk/sport/formula1/articles/future","Mon, 02 Nov 2026 03:00:00 GMT")),now);
        assertEquals(3,parsed.items().size()); assertEquals("Newest",parsed.items().getFirst().title());
        assertEquals("First & original",parsed.items().get(1).title()); assertNull(parsed.items().getLast().publishedAt());
        assertFalse(parsed.toString().contains("BODY_NOT_FOR_COPY"));
    }
    @Test void rejectsWrongPublisherXxeMarkupOversizeAndUnsafeLinks() {
        assertThrows(Exception.class,()->LatestNews.parse("<!DOCTYPE rss [<!ENTITY e SYSTEM 'file:///etc/passwd'>]><rss>&e;</rss>".getBytes(StandardCharsets.UTF_8),now));
        assertThrows(Exception.class,()->LatestNews.parse(new byte[OfficialNews.MAX_BYTES+1],now));
        assertThrows(Exception.class,()->LatestNews.parse("<rss><channel><title>Other</title></channel></rss>".getBytes(StandardCharsets.UTF_8),now));
        assertThrows(Exception.class,()->LatestNews.parse(feed(item("<script>","https://www.bbc.co.uk/sport/formula1/articles/abc123","")),now));
        for(String bad:List.of("https://www.bbc.co.uk.evil.test/sport/formula1/articles/abc123","javascript:alert(1)","https://user@www.bbc.co.uk/sport/formula1/articles/abc123","https://www.bbc.co.uk/sport/formula1/articles/abc123?next=https://evil.test","https://www.bbc.co.uk/sport/formula1/articles/%2e%2e","http://www.bbc.co.uk/sport/formula1/articles/abc123")) assertFalse(LatestNews.safeLink(bad));
    }
    @Test void controllerDoesNotExposePersonalReaderToNonLoopbackClients() {
        var service=new LatestNews(Clock.fixed(now,ZoneOffset.UTC),"personal","127.0.0.1",uri->sample());
        var request=new org.springframework.mock.web.MockHttpServletRequest(); request.setRemoteAddr("203.0.113.1");
        var controller=new LatestNewsController(service); assertThrows(ApiFailure.class,()->controller.read(request));
        request.setRemoteAddr("127.0.0.1"); assertEquals("pending",controller.read(request).status());
    }
}
