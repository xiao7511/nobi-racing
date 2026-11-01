package com.nobi.racing;

import java.io.ByteArrayInputStream;
import java.net.URI;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Element;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

/** Personal loopback RSS reader. This is not an open-content or commercial syndication grant. */
@Service
public class LatestNews {
    static final URI FEED = URI.create("https://feeds.bbci.co.uk/sport/formula1/rss.xml");
    static final String HOME = "https://www.bbc.co.uk/sport/formula1";
    static final String TERMS = "https://www.bbc.co.uk/usingthebbc/terms-of-use/#15metadataandrssfeeds";
    static final Duration INTERVAL = Duration.ofMinutes(15);
    public record Item(String title, String url, String publishedAt, String summary, String titleZh, String summaryZh, String translationStatus) {}
    public record View(String status, String sourceName, String sourceUrl, String termsUrl, String usage,
                       String checkedAt, String syncedAt, String expiresAt, String sourceUpdatedAt, String newestPublishedAt, List<Item> items) {}
    record Parsed(String sourceUpdatedAt, List<Item> items) {}
    record Snapshot(Instant synced, Parsed parsed) {}
    private final Clock clock; private final OfficialNews.Fetcher fetcher; private final boolean enabled;
    private final AtomicBoolean running = new AtomicBoolean();
    private volatile Snapshot snapshot;
    private volatile Instant attempted;
    private volatile boolean failed;
    private LocalNewsTranslation translation;
    @org.springframework.beans.factory.annotation.Autowired
    public LatestNews(Clock clock, @Value("${nobi.latest-news.mode:disabled}") String mode,
                      @Value("${server.address:}") String bindAddress) {
        this(clock, mode, bindAddress, uri -> OfficialNews.download(uri, "xml"));
    }
    @org.springframework.beans.factory.annotation.Autowired
    void translation(LocalNewsTranslation translation) { this.translation=translation; }
    LatestNews(Clock clock, String mode, String bindAddress, OfficialNews.Fetcher fetcher) {
        this.clock = clock; this.fetcher = fetcher;
        enabled = "personal".equals(mode) && Set.of("127.0.0.1", "::1").contains(bindAddress);
    }
    @Scheduled(initialDelay = 2000, fixedDelay = 60000)
    public void sync() {
        if (!enabled || !running.compareAndSet(false, true)) return;
        try {
            Instant now = clock.instant();
            if (attempted != null && now.isBefore(attempted.plus(INTERVAL))) return;
            attempted = now;
            try {
                Parsed parsed = parse(fetcher.fetch(FEED), clock.instant());
                if (translation != null) parsed = new Parsed(parsed.sourceUpdatedAt(), translation.apply(parsed.items()));
                snapshot = new Snapshot(clock.instant(), parsed); failed = false;
            } catch (Exception error) { snapshot = null; failed = true; }
        } finally { running.set(false); }
    }
    public View read() {
        Snapshot current = snapshot; Instant now = clock.instant();
        boolean ready = enabled && current != null && now.isBefore(current.synced().plus(INTERVAL));
        String status = !enabled ? "disabled" : ready ? "ready" : failed ? "upstream_error" : "pending";
        List<Item> items = ready ? current.parsed().items() : List.of();
        String newest = items.stream().map(Item::publishedAt).filter(Objects::nonNull).max(String::compareTo).orElse(null);
        return new View(status, "BBC Sport", HOME, TERMS, "personal-local-only", attempted == null ? null : attempted.toString(),
            ready ? current.synced().toString() : null, ready ? current.synced().plus(INTERVAL).toString() : null,
            ready ? current.parsed().sourceUpdatedAt() : null, newest, items);
    }
    static Parsed parse(byte[] xml, Instant now) throws Exception {
        if (xml.length > OfficialNews.MAX_BYTES) throw new IllegalArgumentException("Feed too large");
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
        var channels = document.getDocumentElement().getElementsByTagName("channel");
        if (channels.getLength() != 1) throw new IllegalArgumentException("Invalid channel");
        Element channel = (Element) channels.item(0);
        if (!"BBC Sport".equals(OfficialNews.field(channel, "title"))) throw new IllegalArgumentException("Wrong publisher");
        var nodes = channel.getElementsByTagName("item");
        Map<String, Item> unique = new LinkedHashMap<>();
        for (int i = 0; i < Math.min(200, nodes.getLength()); i++) {
            Element element = (Element) nodes.item(i);
            String title = OfficialNews.field(element, "title"), link = OfficialNews.field(element, "link");
            if (title.isBlank() || title.length() > 300 || title.matches("(?s).*[<>\\p{Cntrl}].*")) continue;
            if (!safeLink(link)) continue;
            String published = parseDate(OfficialNews.field(element, "pubDate"));
            if (published != null && Instant.parse(published).isAfter(now.plusSeconds(300))) continue;
            String summary = OfficialNews.field(element, "description");
            if (!LocalNewsTranslation.safe(summary, 1200)) summary = "";
            unique.putIfAbsent(URI.create(link).getRawPath(), new Item(title, link, published, summary, null, null, "unavailable"));
        }
        List<Item> items = unique.values().stream().sorted(Comparator.comparing(Item::publishedAt, Comparator.nullsLast(Comparator.reverseOrder())).thenComparing(Item::url)).limit(20).toList();
        // An HTML/error page or unrelated feed must not become a successful empty update.
        if (items.isEmpty() && nodes.getLength() > 0) throw new IllegalArgumentException("No racing headlines");
        return new Parsed(parseDate(OfficialNews.field(channel, "lastBuildDate")), items);
    }
    static String parseDate(String value) {
        try { return ZonedDateTime.parse(value, DateTimeFormatter.RFC_1123_DATE_TIME).toInstant().toString(); }
        catch (RuntimeException invalid) { return null; }
    }
    static boolean safeLink(String value) {
        try {
            URI uri = URI.create(value);
            if (value.length() > 2000 || !"https".equals(uri.getScheme()) || !Set.of("www.bbc.co.uk", "www.bbc.com").contains(uri.getHost())
                || uri.getPort() != -1 || uri.getUserInfo() != null || uri.getFragment() != null
                || !uri.getRawPath().matches("/sport/formula1/(?:articles/[a-z0-9]+|[0-9]+)")) return false;
            // Preserve the publisher's exact direct link and its RSS attribution parameters.
            return uri.getRawQuery() == null || "at_medium=RSS&at_campaign=rss".equals(uri.getRawQuery());
        } catch (RuntimeException invalid) { return false; }
    }
}

@RestController
class LatestNewsController {
    private final LatestNews news;
    LatestNewsController(LatestNews news) { this.news = news; }
    @GetMapping("/api/v1/latest-news") LatestNews.View read(HttpServletRequest request) {
        if (!Set.of("127.0.0.1", "::1", "0:0:0:0:0:0:0:1").contains(request.getRemoteAddr())) throw new ApiFailure(403, "AUTH_FORBIDDEN");
        return news.read();
    }
}
