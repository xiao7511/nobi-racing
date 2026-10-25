package com.nobi.racing;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class CatalogRepository {
    public enum Resource {
        SEASONS("catalog"), CIRCUITS("catalog"), RACES("schedule"), SESSIONS("schedule"), DRIVERS("catalog"), TEAMS("catalog"), ENTRIES("catalog"), RESULTS("results"), DRIVER_STANDINGS("standings"), TEAM_STANDINGS("standings");
        public final String capability; Resource(String capability) { this.capability=capability; }
    }
    private final JdbcTemplate jdbc;
    public CatalogRepository(JdbcTemplate jdbc) { this.jdbc=jdbc; }
    static String marks(int count) { return String.join(",",java.util.Collections.nCopies(count,"?")); }
    public UUID latestSnapshot(UUID season,List<RightsPolicy.Permit> permits) {
        if(permits.isEmpty()) return null;
        List<Object> args=new ArrayList<>();args.add(season);permits.forEach(p -> args.add(p.sourceId()));
        var ids=jdbc.queryForList("SELECT id FROM standing_snapshots WHERE season_id=? AND complete AND source_id IN ("+marks(permits.size())+") ORDER BY captured_at DESC,revision DESC,id DESC LIMIT 1",UUID.class,args.toArray());
        return ids.isEmpty()?null:ids.getFirst();
    }
    public List<Map<String,Object>> query(Resource resource,String locale,Map<String,String> filters,List<RightsPolicy.Permit> permits,String after,int limit,UUID detail) {
        if(permits.isEmpty()) return List.of();
        String name=locale.equals("zh-CN")?"COALESCE(e.name_zh,e.name)":"e.name";
        String fields,from,sort="e.id::text";
        switch(resource) {
            case SEASONS -> { fields="e.id,e.year,z.code AS \"seriesCode\",z.name AS \"seriesName\""; from="seasons e JOIN series z ON z.id=e.series_id"; }
            case CIRCUITS -> { fields="e.id,"+name+" AS name,e.country_code AS \"countryCode\",e.time_zone AS \"timeZone\",e.length_km AS \"lengthKm\",e.turns";from="circuits e"; }
            case RACES -> { fields="e.id,"+name+" AS name,e.season_id AS \"seasonId\",e.circuit_id AS \"circuitId\",e.round,e.starts_at AS \"startsAt\",e.status,e.laps,e.revision,c.time_zone AS \"timeZone\"";from="race_events e JOIN circuits c ON c.id=e.circuit_id";sort="to_char(e.starts_at AT TIME ZONE 'UTC','YYYYMMDDHH24MISS.US')||':'||e.id::text"; }
            case SESSIONS -> { fields="e.id,e.race_id AS \"raceId\",e.kind,e.sequence,e.starts_at AS \"startsAt\",e.ends_at AS \"endsAt\"";from="race_sessions e";sort="to_char(e.starts_at AT TIME ZONE 'UTC','YYYYMMDDHH24MISS.US')||':'||e.id::text"; }
            case DRIVERS -> { fields="e.id,e.display_name AS name,e.country_code AS \"countryCode\",e.car_number AS \"carNumber\","+(locale.equals("zh-CN")?"COALESCE(e.biography_zh,e.biography)":"e.biography")+" AS biography";from="drivers e"; }
            case TEAMS -> { fields="e.id,e.name,e.country_code AS \"countryCode\"";from="teams e"; }
            case ENTRIES -> { fields="e.id,e.season_id AS \"seasonId\",e.driver_id AS \"driverId\",e.team_id AS \"teamId\",e.car_number AS \"carNumber\",e.from_round AS \"fromRound\",e.to_round AS \"toRound\",d.display_name AS \"driverName\",t.name AS \"teamName\"";from="season_entries e JOIN drivers d ON d.id=e.driver_id JOIN teams t ON t.id=e.team_id"; }
            case RESULTS -> { fields="e.id,e.session_id AS \"sessionId\",e.race_id AS \"raceId\",r.driver_id AS \"driverId\",r.team_id AS \"teamId\",e.position,e.result_status AS \"resultStatus\",e.points,e.elapsed_ms AS \"elapsedMs\"";from="session_results e JOIN race_entries r ON r.id=e.entry_id";sort="lpad(COALESCE(e.position,99999)::text,6,'0')||':'||e.id::text"; }
            case DRIVER_STANDINGS,TEAM_STANDINGS -> {
                boolean driver=resource==Resource.DRIVER_STANDINGS;
                String entity=driver?"driver":"team";
                fields="v."+entity+"_id AS id,e.id AS \"snapshotId\",e.season_id AS \"seasonId\",e.after_race_id AS \"afterRaceId\",e.captured_at AS \"capturedAt\",e.revision AS \"snapshotRevision\",v.position,v.points,v.wins,d."+(driver?"display_name":"name")+" AS name";
                from="standing_snapshots e JOIN "+entity+"_standings v ON v.snapshot_id=e.id JOIN "+(driver?"drivers":"teams")+" d ON d.id=v."+entity+"_id";
                sort="lpad(v.position::text,6,'0')||':'||v."+entity+"_id::text";
            }
            default -> throw new IllegalStateException("Unsupported resource");
        }
        StringBuilder sql=new StringBuilder("SELECT "+fields+","+sort+" AS _sort,e.source_id AS _source_id,e.data_mode AS _mode,e.fetched_at AS _fetched,e.updated_at AS _updated,e.data_status AS _status,s.code AS _source_code,s.attribution AS _attribution,s.time_zone AS _source_zone FROM "+from+" JOIN data_source s ON s.id=e.source_id WHERE e.source_id IN ("+marks(permits.size())+")");
        List<Object> args=new ArrayList<>();permits.forEach(p -> args.add(p.sourceId()));
        if(detail!=null) { sql.append(" AND e.id=?");args.add(detail); }
        for(var filter:filters.entrySet()) {
            String key=filter.getKey(),value=filter.getValue();
            switch(key) {
                case "year" -> { sql.append(" AND e.year=?");args.add(Integer.valueOf(value)); }
                case "seriesCode" -> { sql.append(" AND z.code=?");args.add(value); }
                case "seasonId" -> { sql.append(" AND e.season_id=?");args.add(UUID.fromString(value)); }
                case "raceId" -> { sql.append(" AND e.race_id=?");args.add(UUID.fromString(value)); }
                case "sessionId" -> { sql.append(" AND e.session_id=?");args.add(UUID.fromString(value)); }
                case "status" -> { sql.append(" AND e.status=?");args.add(value); }
                case "from" -> { sql.append(" AND e.starts_at>=?");args.add(Timestamp.from(Instant.parse(value))); }
                case "to" -> { sql.append(" AND e.starts_at<?");args.add(Timestamp.from(Instant.parse(value))); }
                case "snapshotId" -> { sql.append(" AND e.id=? AND e.complete");args.add(UUID.fromString(value)); }
                default -> throw ApiFailure.validation();
            }
        }
        String finalSql="SELECT * FROM ("+sql+") q WHERE _sort>? ORDER BY _sort LIMIT ?";args.add(after==null?"":after);args.add(limit);
        return jdbc.query(finalSql,CatalogRepository::row,args.toArray());
    }
    private static Map<String,Object> row(ResultSet row,int index) throws SQLException {
        Map<String,Object> result=new LinkedHashMap<>(); var metadata=row.getMetaData();
        for(int c=1;c<=metadata.getColumnCount();c++) {
            String name=metadata.getColumnLabel(c); if(name.startsWith("_") && !name.equals("_sort")) continue;
            Object value=row.getObject(c);
            if(value instanceof UUID uuid) value=uuid.toString(); else if(value instanceof Timestamp timestamp) value=timestamp.toInstant().toString(); else if(value instanceof java.time.OffsetDateTime time) value=time.toInstant().toString(); else if(value instanceof BigDecimal decimal) value=decimal.stripTrailingZeros().toPlainString();
            result.put(name,value);
        }
        result.put("dataStatus",row.getString("_status"));result.put("updatedAt",row.getTimestamp("_updated").toInstant().toString());
        result.put("provenance",Map.of("sourceId",row.getString("_source_id"),"sourceCode",row.getString("_source_code"),"mode",row.getString("_mode"),"fetchedAt",row.getTimestamp("_fetched").toInstant().toString(),"attribution",row.getString("_attribution"),"timeZone",row.getString("_source_zone")));
        return result;
    }
}
