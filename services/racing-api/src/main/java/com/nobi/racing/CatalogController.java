package com.nobi.racing;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import static com.nobi.racing.CatalogRepository.Resource;

@RestController
@RequestMapping("/api/v1")
public class CatalogController {
    private final CatalogService service;
    public CatalogController(CatalogService service) { this.service=service; }
    private Resource resource(String name) { return switch(name) { case "seasons" -> Resource.SEASONS;case "circuits" -> Resource.CIRCUITS;case "races" -> Resource.RACES;case "drivers" -> Resource.DRIVERS;case "teams" -> Resource.TEAMS;default -> throw new ApiFailure(404,"RESOURCE_NOT_FOUND"); }; }
    @GetMapping({"/seasons","/circuits","/races","/drivers","/teams"})
    public Map<String,Object> list(HttpServletRequest request,@RequestParam MultiValueMap<String,String> query) {
        String name=request.getRequestURI().substring(request.getRequestURI().lastIndexOf('/')+1); return page(resource(name),query,Map.of());
    }
    @GetMapping({"/seasons/{id}","/circuits/{id}","/races/{id}","/drivers/{id}","/teams/{id}"})
    public Map<String,Object> detail(HttpServletRequest request,@PathVariable UUID id,@RequestParam MultiValueMap<String,String> query) {
        validate(query,Set.of("locale"));String name=request.getRequestURI().split("/")[3];return service.detail(resource(name),id,locale(query));
    }
    @GetMapping("/races/{id}/sessions")
    public Map<String,Object> sessions(@PathVariable UUID id,@RequestParam MultiValueMap<String,String> query) { return page(Resource.SESSIONS,query,Map.of("raceId",id.toString())); }
    @GetMapping("/sessions/{id}/results")
    public Map<String,Object> results(@PathVariable UUID id,@RequestParam MultiValueMap<String,String> query) { return page(Resource.RESULTS,query,Map.of("sessionId",id.toString())); }
    @GetMapping("/seasons/{id}/entries")
    public Map<String,Object> entries(@PathVariable UUID id,@RequestParam MultiValueMap<String,String> query) { return page(Resource.ENTRIES,query,Map.of("seasonId",id.toString())); }
    @GetMapping("/standings")
    public Map<String,Object> standings(@RequestParam MultiValueMap<String,String> query) {
        String type=query.getFirst("type");if(type!=null && !Set.of("driver","team").contains(type)) throw ApiFailure.validation();
        if(query.getFirst("seasonId")==null) throw ApiFailure.validation();
        return page("team".equals(type)?Resource.TEAM_STANDINGS:Resource.DRIVER_STANDINGS,query,Map.of());
    }
    private Map<String,Object> page(Resource resource,MultiValueMap<String,String> query,Map<String,String> parent) {
        var allowed=new java.util.HashSet<>(Set.of("locale","limit","cursor"));
        switch(resource) {
            case SEASONS -> allowed.addAll(Set.of("year","seriesCode"));
            case RACES -> allowed.addAll(Set.of("seasonId","status","from","to"));
            case DRIVER_STANDINGS,TEAM_STANDINGS -> allowed.addAll(Set.of("seasonId","type","snapshotId"));
            default -> { }
        }
        validate(query,allowed); String locale=locale(query);
        int limit=query.getFirst("limit")==null?20:Integer.parseInt(query.getFirst("limit"));if(limit<1||limit>100) throw ApiFailure.validation();
        String cursor=query.getFirst("cursor");if(cursor!=null && (cursor.isBlank()||cursor.length()>512)) throw ApiFailure.validation();
        Map<String,String> filters=new HashMap<>(parent);
        for(var item:query.entrySet()) if(!Set.of("locale","limit","cursor","type").contains(item.getKey())) filters.put(item.getKey(),item.getValue().getFirst());
        for(String key:Set.of("seasonId","snapshotId")) if(filters.containsKey(key)) UUID.fromString(filters.get(key));
        if(filters.containsKey("status") && !Set.of("scheduled","completed","cancelled").contains(filters.get("status"))) throw ApiFailure.validation();
        if(filters.containsKey("year")) { int year=Integer.parseInt(filters.get("year"));if(year<1900||year>2200) throw ApiFailure.validation(); }
        if(filters.containsKey("seriesCode") && !filters.get("seriesCode").matches("[A-Z][A-Z0-9_]{0,31}")) throw ApiFailure.validation();
        for(String key:Set.of("from","to")) if(filters.containsKey(key)) try { Instant.parse(filters.get(key)); } catch(java.time.DateTimeException error) { throw ApiFailure.validation(); }
        if(filters.containsKey("from") && filters.containsKey("to") && !Instant.parse(filters.get("from")).isBefore(Instant.parse(filters.get("to")))) throw ApiFailure.validation();
        return service.list(resource,locale,limit,cursor,filters);
    }
    private String locale(MultiValueMap<String,String> query) { String value=query.getFirst("locale");if(value==null) return "en-US";if(!Set.of("en-US","zh-CN").contains(value)) throw ApiFailure.validation();return value; }
    private void validate(MultiValueMap<String,String> query,Set<String> allowed) {
        for(var item:query.entrySet()) if(!allowed.contains(item.getKey()) || item.getValue().size()!=1 || item.getValue().getFirst().length()>512) throw ApiFailure.validation();
    }
}
