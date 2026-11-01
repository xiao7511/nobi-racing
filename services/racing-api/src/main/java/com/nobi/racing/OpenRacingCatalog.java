package com.nobi.racing;

import java.net.URI;
import java.time.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.JsonNode;

/** Wikidata structured item metadata is CC0, unlike publisher articles or photographs. */
@Service
public class OpenRacingCatalog {
    static final List<String> IDS = List.of("Q173365", "Q9673", "Q2239218");
    static final URI ENDPOINT = URI.create("https://www.wikidata.org/w/api.php?action=wbgetentities&ids=Q173365%7CQ9673%7CQ2239218&props=labels%7Cdescriptions%7Cinfo&languages=en%7Cmul%7Czh%7Czh-hans&format=json");
    public record Entry(String id, String name, String nameZh, String description, String descriptionZh, String sourceUrl, String sourceUpdatedAt, long revision) {}
    public record View(String status, String license, String licenseUrl, String syncedAt, String expiresAt, List<Entry> items) {}
    private final Clock clock; private final ObjectMapper mapper; private final OfficialNews.Fetcher fetcher; private final boolean enabled;
    private List<Entry> items = List.of(); private Instant synced; private Instant attempted; private boolean failed;
    @org.springframework.beans.factory.annotation.Autowired
    public OpenRacingCatalog(ObjectMapper mapper, Clock clock, @Value("${nobi.open-catalog.enabled:true}") boolean enabled) {
        this(mapper, clock, enabled, uri -> OfficialNews.download(uri,"json"));
    }
    OpenRacingCatalog(ObjectMapper mapper, Clock clock, boolean enabled, OfficialNews.Fetcher fetcher) { this.mapper=mapper; this.clock=clock; this.enabled=enabled; this.fetcher=fetcher; }
    @Scheduled(initialDelay=1500, fixedDelay=60000)
    public synchronized void sync() {
        if (!enabled || attempted != null && clock.instant().isBefore(attempted.plus(failed ? Duration.ofMinutes(15) : Duration.ofHours(6)))) return;
        attempted=clock.instant();
        try { items=parse(mapper,fetcher.fetch(ENDPOINT)); synced=clock.instant(); failed=false; }
        catch (Exception error) { items=List.of(); synced=null; failed=true; }
    }
    public synchronized View read() {
        boolean ready=enabled && synced!=null && clock.instant().isBefore(synced.plus(Duration.ofHours(6)));
        return new View(!enabled?"disabled":ready?"ready":failed?"upstream_error":"pending", "CC0 1.0", "https://creativecommons.org/publicdomain/zero/1.0/", ready?synced.toString():null, ready?synced.plus(Duration.ofHours(6)).toString():null, ready?items:List.of());
    }
    static List<Entry> parse(ObjectMapper mapper, byte[] bytes) {
        if (bytes.length>65536) throw new IllegalArgumentException("Catalog too large");
        JsonNode root=mapper.readTree(bytes);
        if (root.path("success").asInt()!=1) throw new IllegalArgumentException("Invalid catalog");
        List<Entry> entries=new ArrayList<>();
        for (String id:IDS) {
            JsonNode entity=root.path("entities").path(id);
            if (!id.equals(entity.path("id").asText()) || !"item".equals(entity.path("type").asText())) throw new IllegalArgumentException("Invalid entity");
            String name=text(entity,"labels","en"); if (name.isBlank()) name=text(entity,"labels","mul");
            if (name.isBlank()) throw new IllegalArgumentException("Missing name");
            String zh=switch(id){case "Q173365"->"法拉利 F2005";case "Q9673"->"刘易斯·汉密尔顿";case "Q2239218"->"马克斯·维斯塔潘";default->"";};
            String descZh=switch(text(entity,"descriptions","en")){case "racing automobile"->"赛车";case "British racing driver"->"英国赛车手";case "Dutch and Belgian racing driver"->"荷兰及比利时赛车手";default->"";};
            String modified=entity.path("modified").asText(); Instant.parse(modified);
            long revision=entity.path("lastrevid").asLong(); if (revision<=0) throw new IllegalArgumentException("Missing revision");
            entries.add(new Entry(id,name,zh,text(entity,"descriptions","en"),descZh,"https://www.wikidata.org/wiki/"+id,modified,revision));
        }
        return List.copyOf(entries);
    }
    static String text(JsonNode entity,String field,String language) {
        String value=entity.path(field).path(language).path("value").asText("");
        if (value.length()>500 || value.matches("(?s).*[<>\\p{Cntrl}].*")) throw new IllegalArgumentException("Invalid text");
        return value;
    }
}

@RestController
class OpenRacingCatalogController {
    private final OpenRacingCatalog catalog;
    OpenRacingCatalogController(OpenRacingCatalog catalog) { this.catalog=catalog; }
    @GetMapping("/api/v1/open-catalog") OpenRacingCatalog.View read() { return catalog.read(); }
}
