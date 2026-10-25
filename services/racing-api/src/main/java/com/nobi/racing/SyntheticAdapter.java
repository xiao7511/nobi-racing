package com.nobi.racing;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import static com.nobi.racing.SourceAdapter.Kind.*;

/** Original fixtures only. No supplier URL or network fallback exists. */
@Component
public final class SyntheticAdapter implements SourceAdapter {
    public String code() { return "NOBI_SYNTHETIC"; }
    public String mode() { return "mock"; }
    static Map<String,Object> fields(Object... pairs) {
        Map<String,Object> result=new LinkedHashMap<>(); for(int i=0;i<pairs.length;i+=2) result.put((String)pairs[i],pairs[i+1]); return result;
    }
    private static Datum datum(Kind kind,String id,Object... fields) { return new Datum(kind,id,fields(fields)); }
    private static Ref ref(Kind kind,String id) { return new Ref(kind,id); }
    public Batch fetch() {
        List<Datum> data=new ArrayList<>();
        data.add(datum(SERIES,"series","code","NOBI_MOCK","name","NOBI fictional championship · MOCK"));
        data.add(datum(SEASON,"2026","series_id",ref(SERIES,"series"),"year",2026));
        data.add(datum(CIRCUIT,"harbor","name","Harbor Street Circuit","name_zh","港湾街道赛道","country_code","GB","time_zone","Europe/London","length_km",new BigDecimal("5.240"),"turns",19));
        data.add(datum(CIRCUIT,"desert","name","Dune International Circuit","name_zh","沙丘国际赛道","country_code","AE","time_zone","Asia/Dubai","length_km",new BigDecimal("5.100"),"turns",16));
        String[] names={"Alex Rowan","Mei Chen","Luca Moretti","Noah Vega"};
        String[] ids={"alex","mei","luca","noah"}; String[] countries={"GB","CN","IT","ES"}; int[] numbers={27,18,41,6};
        for(int i=0;i<ids.length;i++) data.add(datum(DRIVER,ids[i],"display_name",names[i],"country_code",countries[i],"car_number",numbers[i],"biography","A fictional driver. All career information is synthetic.","biography_zh","虚构车手，全部生涯资料均为合成示例。"));
        data.add(datum(TEAM,"aurora","name","Aurora Racing","country_code","GB"));
        data.add(datum(TEAM,"vertex","name","Vertex Motorsport","country_code","CN"));
        data.add(datum(TEAM,"cobalt","name","Cobalt GP","country_code","ES"));
        String[] raceIds={"harbor","desert"};
        for(int i=0;i<2;i++) {
            String id=raceIds[i]; Instant starts=Instant.parse(i==0?"2026-11-08T18:00:00Z":"2026-11-22T15:00:00Z");
            data.add(datum(RACE,id,"season_id",ref(SEASON,"2026"),"circuit_id",ref(CIRCUIT,id),"round",18+i,"name",i==0?"Harbor Grand Prix":"Desert Grand Prix","name_zh",i==0?"港湾大奖赛":"沙漠大奖赛","starts_at",starts,"status","scheduled","laps",56+i));
            for(int s=0;s<3;s++) data.add(datum(SESSION,id+"-"+s,"race_id",ref(RACE,id),"kind",List.of("practice","qualifying","race").get(s),"sequence",1,"starts_at",starts.minusSeconds((2L-s)*86400),"ends_at",starts.minusSeconds((2L-s)*86400).plusSeconds(7200)));
            for(int d=0;d<ids.length;d++) data.add(datum(RACE_ENTRY,id+"-"+ids[d],"race_id",ref(RACE,id),"driver_id",ref(DRIVER,ids[d]),"team_id",ref(TEAM,d==0||d==2?"aurora":d==1?"vertex":"cobalt"),"car_number",numbers[d]));
        }
        for(int d=0;d<ids.length;d++) {
            data.add(datum(SEASON_ENTRY,"2026-"+ids[d],"season_id",ref(SEASON,"2026"),"driver_id",ref(DRIVER,ids[d]),"team_id",ref(TEAM,d==0||d==2?"aurora":d==1?"vertex":"cobalt"),"from_round",1,"to_round",null,"car_number",numbers[d]));
        }
        // A separate completed synthetic round provides results and snapshot provenance.
        Instant completed=Instant.parse("2026-10-18T14:00:00Z");
        data.add(datum(RACE,"coast","season_id",ref(SEASON,"2026"),"circuit_id",ref(CIRCUIT,"harbor"),"round",17,"name","Coastal Grand Prix","name_zh","海岸大奖赛","starts_at",completed,"status","completed","laps",62));
        data.add(datum(SESSION,"coast-race","race_id",ref(RACE,"coast"),"kind","race","sequence",1,"starts_at",completed,"ends_at",completed.plusSeconds(7200)));
        for(int d=0;d<ids.length;d++) {
            data.add(datum(RACE_ENTRY,"coast-"+ids[d],"race_id",ref(RACE,"coast"),"driver_id",ref(DRIVER,ids[d]),"team_id",ref(TEAM,d==0||d==2?"aurora":d==1?"vertex":"cobalt"),"car_number",numbers[d]));
            data.add(datum(RESULT,"coast-"+ids[d],"session_id",ref(SESSION,"coast-race"),"entry_id",ref(RACE_ENTRY,"coast-"+ids[d]),"race_id",ref(RACE,"coast"),"position",d==3?null:d+1,"result_status",d==3?"dnf":"classified","points",new BigDecimal(List.of("25","18","15","0").get(d)),"elapsed_ms",d==3?null:5400000L+d*1000L));
        }
        var driverRanks=List.of(new Rank("alex",1,new BigDecimal("286.5"),6),new Rank("mei",2,new BigDecimal("274"),5),new Rank("luca",3,new BigDecimal("231"),3),new Rank("noah",4,new BigDecimal("198"),2));
        var teamRanks=List.of(new Rank("aurora",1,new BigDecimal("517.5"),9),new Rank("vertex",2,new BigDecimal("274"),5),new Rank("cobalt",3,new BigDecimal("198"),2));
        return new Batch(Instant.parse("2026-10-25T00:00:00Z"),data,List.of(new Snapshot("2026-r17-v1","2026","coast",Instant.parse("2026-10-18T17:00:00Z"),true,driverRanks,teamRanks)));
    }
}
