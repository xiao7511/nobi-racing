package com.nobi.racing;

import java.io.*;
import java.net.URI;
import java.net.http.*;
import java.nio.ByteBuffer;
import java.nio.file.*;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.*;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Element;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.ObjectMapper;

/** Public availability does not create a redistribution grant. No body or media ingestion. */
@Service
public class OfficialNews {
    record Source(String id, String name, String homepage, String feed) {}
    static final List<Source> SOURCES = List.of(
        new Source("formula1", "www.formula1.com", "https://www.formula1.com/en/latest", "https://www.formula1.com/en/latest/all.xml"),
        new Source("fia", "FIA", "https://www.fia.com/news", "https://www.fia.com/rss/news"));
    public record Grant(String sourceId, String status, String evidence, String validFrom, String validUntil,
                        List<String> territories, List<String> capabilities) {
        boolean permits(Instant now, String territory) {
            try {
                return "approved".equals(status) && evidence != null && !evidence.isBlank() && evidence.length() <= 200
                    && !now.isBefore(Instant.parse(validFrom)) && now.isBefore(Instant.parse(validUntil))
                    && territories != null && territories.contains(territory)
                    && capabilities != null && capabilities.contains("headline-link-display");
            } catch (RuntimeException invalid) { return false; }
        }
    }
    public record Item(String title, String url, String publishedAt) {}
    public record View(String id, String name, String homepage, String status, String syncedAt, String expiresAt, List<Item> items) {}
    record Snapshot(Grant grant, Instant syncedAt, Instant expiresAt, List<Item> items) {}
    interface Fetcher { byte[] fetch(URI uri) throws Exception; }
    private final ObjectMapper mapper;
    private final Path grantsPath;
    private final String territory;
    private final Clock clock;
    private final Fetcher fetcher;
    private final Map<String, Snapshot> snapshots = new HashMap<>();
    private final Map<String, Instant> attempts = new HashMap<>();
    private final Set<String> failures = new HashSet<>();
    static final int MAX_BYTES = 524288;
    static final Duration TTL = Duration.ofMinutes(15);
    @org.springframework.beans.factory.annotation.Autowired
    public OfficialNews(ObjectMapper mapper, Clock clock, @Value("${nobi.news.grants-file:}") String path,
            @Value("${nobi.territory}") String territory) {
        this(mapper, clock, path, territory, OfficialNews::download);
    }
    OfficialNews(ObjectMapper mapper, Clock clock, String path, String territory, Fetcher fetcher) {
        this.mapper = mapper; this.clock = clock; this.grantsPath = path.isBlank() ? null : Path.of(path);
        this.territory = territory; this.fetcher = fetcher;
    }
    private Map<String, Grant> grants() {
        try {
            if (grantsPath == null || Files.size(grantsPath) > 65536) return Map.of();
            Grant[] entries = mapper.readValue(Files.readString(grantsPath), Grant[].class);
            Map<String, Grant> result = new HashMap<>();
            for (Grant grant : entries) if (result.putIfAbsent(grant.sourceId(), grant) != null) return Map.of();
            return result;
        } catch (Exception invalid) { return Map.of(); }
    }
    // Visitor reads cannot amplify upstream traffic. Missing/revoked grants erase memory.
    @Scheduled(initialDelay = 1000, fixedDelay = 60000)
    public synchronized void sync() {
        var grants = grants(); Instant now = clock.instant();
        for (Source source : SOURCES) {
            Grant grant = grants.get(source.id());
            if (grant == null || !grant.permits(now, territory)) {
                snapshots.remove(source.id()); attempts.remove(source.id()); failures.remove(source.id()); continue;
            }
            if (attempts.containsKey(source.id()) && now.isBefore(attempts.get(source.id()).plus(TTL))) continue;
            attempts.put(source.id(), now);
            try {
                List<Item> items = parse(fetcher.fetch(URI.create(source.feed())), URI.create(source.homepage()).getHost());
                Instant completed = clock.instant();
                Grant current = grants().get(source.id());
                if (!grant.equals(current) || !grant.permits(completed, territory)) { snapshots.remove(source.id()); continue; }
                Instant until = completed.plus(TTL).isBefore(Instant.parse(grant.validUntil())) ? completed.plus(TTL) : Instant.parse(grant.validUntil());
                snapshots.put(source.id(), new Snapshot(grant, completed, until, items)); failures.remove(source.id());
            } catch (Exception invalid) { snapshots.remove(source.id()); failures.add(source.id()); }
        }
    }
    public synchronized List<View> read() {
        var grants = grants(); Instant now = clock.instant(); List<View> result = new ArrayList<>();
        for (Source source : SOURCES) {
            Grant grant = grants.get(source.id()); Snapshot snapshot = snapshots.get(source.id());
            boolean allowed = grant != null && grant.permits(now, territory);
            boolean ready = allowed && snapshot != null && snapshot.grant().equals(grant) && now.isBefore(snapshot.expiresAt());
            if (!ready) snapshots.remove(source.id());
            String status = !allowed ? "rights_required" : ready ? "ready" : failures.contains(source.id()) ? "upstream_error" : "pending";
            result.add(new View(source.id(), source.name(), source.homepage(), status,
                ready ? snapshot.syncedAt().toString() : null, ready ? snapshot.expiresAt().toString() : null, ready ? snapshot.items() : List.of()));
        }
        return List.copyOf(result);
    }
    static List<Item> parse(byte[] xml, String host) throws Exception {
        if (xml.length > MAX_BYTES) throw new IllegalArgumentException("Feed too large");
        var factory = DocumentBuilderFactory.newInstance();
        factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
        factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, ""); factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
        factory.setXIncludeAware(false); factory.setExpandEntityReferences(false);
        var builder = factory.newDocumentBuilder();
        builder.setErrorHandler(new org.xml.sax.helpers.DefaultHandler() {
            @Override public void fatalError(org.xml.sax.SAXParseException e) throws org.xml.sax.SAXException { throw e; }
        });
        var document = builder.parse(new ByteArrayInputStream(xml));
        if (!"rss".equals(document.getDocumentElement().getTagName())) throw new IllegalArgumentException("RSS required");
        var nodes = document.getElementsByTagName("item");
        List<Item> result = new ArrayList<>(); Set<String> seen = new HashSet<>();
        for (int i = 0; i < Math.min(nodes.getLength(), 100); i++) {
            Element item = (Element) nodes.item(i);
            String title = field(item, "title"), link = field(item, "link"), published = field(item, "pubDate");
            if (title.isBlank() || title.length() > 300 || title.matches("(?s).*[<>\\p{Cntrl}].*")) continue;
            if (!safeLink(link, host) || !seen.add(link)) continue;
            String date = null;
            try { date = ZonedDateTime.parse(published, DateTimeFormatter.RFC_1123_DATE_TIME).toInstant().toString(); } catch (RuntimeException ignored) { /* Publication dates may be absent. */ }
            result.add(new Item(title, link, date)); if (result.size() == 20) break;
        }
        return List.copyOf(result);
    }
    static String field(Element item, String tag) {
        for (var node = item.getFirstChild(); node != null; node = node.getNextSibling())
            if (node instanceof Element element && element.getTagName().equals(tag)) return element.getTextContent().strip();
        return "";
    }
    static boolean safeLink(String link, String host) {
        try {
            URI uri = URI.create(link);
            return link.length() <= 2000 && "https".equals(uri.getScheme()) && host.equals(uri.getHost())
                && uri.getPort() == -1 && uri.getUserInfo() == null && uri.getFragment() == null && uri.getRawQuery() == null
                && uri.getPath().startsWith(host.equals("www.fia.com") ? "/news/" : "/en/latest/")
                && !uri.getPath().contains("..") && !uri.getPath().contains("\\");
        } catch (RuntimeException invalid) { return false; }
    }
    private static byte[] download(URI uri) {
        return download(uri, "xml");
    }
    static byte[] download(URI uri, String expectedType) {
        var client = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).connectTimeout(Duration.ofSeconds(3)).build();
        try {
            var request = HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(8)).header("Accept", expectedType.equals("json") ? "application/json" : "application/rss+xml, application/xml").header("User-Agent", "NOBI-Racing/1.0 (racing-reference-sync)").build();
            return client.sendAsync(request, info -> {
                String type = info.headers().firstValue("Content-Type").orElse("").toLowerCase(Locale.ROOT);
                if (info.statusCode() != 200 || !type.contains(expectedType)) throw new IllegalArgumentException("Upstream unavailable");
                return new LimitedBody();
            }).orTimeout(10, TimeUnit.SECONDS).join().body();
        } finally { client.shutdownNow(); }
    }
    static final class LimitedBody implements HttpResponse.BodySubscriber<byte[]> {
        private final CompletableFuture<byte[]> body = new CompletableFuture<>();
        private final ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        private Flow.Subscription subscription;
        public CompletionStage<byte[]> getBody() { return body; }
        public void onSubscribe(Flow.Subscription value) { subscription = value; value.request(1); }
        public void onNext(List<ByteBuffer> buffers) {
            for (ByteBuffer buffer : buffers) {
                if ((long) bytes.size() + buffer.remaining() > MAX_BYTES) { subscription.cancel(); body.completeExceptionally(new IllegalArgumentException("Feed too large")); return; }
                byte[] chunk = new byte[buffer.remaining()]; buffer.get(chunk); bytes.writeBytes(chunk);
            }
            subscription.request(1);
        }
        public void onError(Throwable error) { body.completeExceptionally(error); }
        public void onComplete() { body.complete(bytes.toByteArray()); }
    }
}

@RestController
class OfficialNewsController {
    private final OfficialNews news;
    OfficialNewsController(OfficialNews news) { this.news = news; }
    @GetMapping("/api/v1/official-news") Map<String, Object> read() { return Map.of("sources", news.read()); }
}
