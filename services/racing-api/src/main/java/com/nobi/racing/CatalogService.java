package com.nobi.racing;

import java.time.Clock;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;
import static com.nobi.racing.CatalogRepository.Resource;

@Service
public class CatalogService {
    private final CatalogRepository repository; private final RightsPolicy rights; private final SignedCursor cursors;
    private final RedisSupport cache; private final ObjectMapper mapper; private final Clock clock;
    public CatalogService(CatalogRepository repository,RightsPolicy rights,SignedCursor cursors,RedisSupport cache,ObjectMapper mapper,Clock clock) { this.repository=repository;this.rights=rights;this.cursors=cursors;this.cache=cache;this.mapper=mapper;this.clock=clock; }
    public Map<String,Object> list(Resource resource,String locale,int limit,String cursor,Map<String,String> filters) {
        var permits=rights.allowed(resource.capability); // Always query authority before touching cached facts.
        filters=new TreeMap<>(filters);
        UUID snapshot=null;
        if(resource==Resource.DRIVER_STANDINGS || resource==Resource.TEAM_STANDINGS) {
            snapshot=filters.containsKey("snapshotId")?UUID.fromString(filters.get("snapshotId")):repository.latestSnapshot(UUID.fromString(filters.get("seasonId")),permits);
            if(snapshot!=null) filters.put("snapshotId",snapshot.toString());
            else permits=List.of();
        }
        String fingerprint=RightsPolicy.fingerprint(permits);
        String binding=Crypto.digest(resource+"|"+locale+"|"+limit+"|"+filters+"|"+fingerprint);
        String after=cursor==null?null:cursors.decode(cursor,binding);
        String key="nobi:p2:catalog:"+Crypto.digest(binding+"|"+after);
        boolean cacheable=!permits.isEmpty() && permits.stream().allMatch(RightsPolicy.Permit::cacheAllowed);
        if(cacheable) {
            String stored=cache.get(key);
            if(stored!=null) try { return mapper.readValue(stored,new tools.jackson.core.type.TypeReference<Map<String,Object>>() {}); } catch(RuntimeException ignored) { /* Corrupt cache is discarded, never exposed. */ }
        }
        var fetched=repository.query(resource,locale,filters,permits,after,limit+1,null);
        List<Map<String,Object>> items=new ArrayList<>(fetched.subList(0,Math.min(limit,fetched.size())));
        String next=fetched.size()>limit?cursors.encode((String)items.getLast().get("_sort"),binding):null;
        items.forEach(item -> item.remove("_sort"));
        Map<String,Object> result=new LinkedHashMap<>();result.put("items",items);result.put("nextCursor",next);result.put("snapshotVersion",fingerprint);result.put("snapshotId",snapshot==null?null:snapshot.toString());result.put("dataMode",mode(permits));
        if(cacheable) {
            Duration ttl=permits.stream().map(p -> Duration.between(clock.instant(),p.expiresAt())).min(Duration::compareTo).orElse(Duration.ZERO);
            if(ttl.compareTo(Duration.ofSeconds(30))>0) ttl=Duration.ofSeconds(30);
            cache.put(key,mapper.writeValueAsString(result),ttl);
        }
        return result;
    }
    public Map<String,Object> detail(Resource resource,UUID id,String locale) {
        var permits=rights.allowed(resource.capability);
        var items=repository.query(resource,locale,Map.of(),permits,null,1,id);
        if(items.isEmpty()) throw new ApiFailure(404,"RESOURCE_NOT_FOUND");
        var item=items.getFirst();item.remove("_sort");return Map.of("data",item,"dataMode",((Map<?,?>)item.get("provenance")).get("mode"));
    }
    private static String mode(List<RightsPolicy.Permit> permits) {
        if(permits.isEmpty()) return "empty";var modes=permits.stream().map(RightsPolicy.Permit::mode).distinct().toList();return modes.size()==1?modes.getFirst():"mixed";
    }
}
