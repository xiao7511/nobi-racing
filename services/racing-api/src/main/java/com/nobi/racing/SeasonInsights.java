package com.nobi.racing;

import java.math.BigDecimal;
import java.net.URI;
import java.time.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** Completed-session reference only. Never queries the subscription-only live window. */
@Service
public class SeasonInsights {
    static final int YEAR=2026;
    static final Duration TTL=Duration.ofHours(6), REFRESH=Duration.ofHours(1);
    static final URI SESSIONS=URI.create("https://api.openf1.org/v1/sessions?year=2026&session_name=Race");
    public record Entry(String id,String name,String team,String color,int position,Integer positionStart,String points,String pointsStart) {}
    public record Round(int id,int meetingId,String circuit,String circuitZh,String endsAt,List<Entry> drivers,List<Entry> teams) {}
    public record View(String status,int year,String source,String sourceUrl,String license,String licenseUrl,String syncedAt,String expiresAt,List<Round> rounds) {}
    record Session(int id,int meeting,String circuit,String endsAt) {}
    record Snapshot(Instant synced,List<Round> rounds) {}
    private final ObjectMapper mapper;private final Clock clock;private final boolean enabled;private final OfficialNews.Fetcher fetcher;
    private final AtomicBoolean running=new AtomicBoolean();private volatile Snapshot snapshot;private volatile Instant attempted;private volatile boolean failed;
    @org.springframework.beans.factory.annotation.Autowired
    public SeasonInsights(ObjectMapper mapper,Clock clock,@Value("${nobi.season-insights.mode:disabled}") String mode,@Value("${server.address:}") String binding) {
        this(mapper,clock,"personal".equals(mode)&&Set.of("127.0.0.1","::1").contains(binding),OpenF1History::download);
    }
    SeasonInsights(ObjectMapper mapper,Clock clock,boolean enabled,OfficialNews.Fetcher fetcher) {this.mapper=mapper;this.clock=clock;this.enabled=enabled;this.fetcher=fetcher;}
    @Scheduled(initialDelay=8000,fixedDelay=60000)
    public void sync() {
        if(!enabled||!running.compareAndSet(false,true))return;
        try {
            if(attempted!=null&&clock.instant().isBefore(attempted.plus(failed?Duration.ofMinutes(15):REFRESH)))return;
            attempted=clock.instant();
            try {
                var sessions=completed(mapper,fetcher.fetch(SESSIONS),clock.instant());
                if(sessions.isEmpty()){snapshot=new Snapshot(clock.instant(),List.of());failed=false;return;}
                // IDs need not follow date order after venue changes. Select only explicitly completed races.
                String range="?"+String.join("&",sessions.stream().map(session->"session_key="+session.id()).toList());
                var drivers=fetcher.fetch(URI.create("https://api.openf1.org/v1/championship_drivers"+range));
                var teams=fetcher.fetch(URI.create("https://api.openf1.org/v1/championship_teams"+range));
                var names=fetcher.fetch(URI.create("https://api.openf1.org/v1/drivers"+range));
                snapshot=new Snapshot(clock.instant(),join(mapper,sessions,drivers,teams,names));failed=false;
            }catch(Exception invalid){snapshot=null;failed=true;}
        }finally{running.set(false);}
    }
    public View read() {
        var current=snapshot;boolean ready=enabled&&current!=null&&clock.instant().isBefore(current.synced().plus(TTL));
        return new View(!enabled?"disabled":ready?(current.rounds().isEmpty()?"empty":"ready"):failed?"upstream_error":"pending",YEAR,"OpenF1","https://openf1.org/","CC BY-NC-SA 4.0","https://creativecommons.org/licenses/by-nc-sa/4.0/",ready?current.synced().toString():null,ready?current.synced().plus(TTL).toString():null,ready?current.rounds():List.of());
    }
    static JsonNode array(ObjectMapper mapper,byte[] bytes,int max) throws Exception {
        if(bytes.length>OfficialNews.MAX_BYTES)throw new IllegalArgumentException("Source size");
        var result=mapper.readTree(bytes);if(!result.isArray()||result.size()>max)throw new IllegalArgumentException("Source array");return result;
    }
    static List<Session> completed(ObjectMapper mapper,byte[] bytes,Instant now) throws Exception {
        List<Session> sessions=new ArrayList<>();Set<Integer> ids=new HashSet<>(),meetings=new HashSet<>();
        for(var item:array(mapper,bytes,40)) {
            int id=RaceWeekends.positive(item,"session_key"),meeting=RaceWeekends.positive(item,"meeting_key");
            if(!ids.add(id)||!meetings.add(meeting)||item.path("year").asInt()!=YEAR||!item.path("session_name").asText().equals("Race"))throw new IllegalArgumentException("Session identity");
            var start=Instant.parse(RaceWeekends.time(item,"date_start"));var end=Instant.parse(RaceWeekends.time(item,"date_end"));
            if(!end.isAfter(start))throw new IllegalArgumentException("Session order");
            if(!end.plus(Duration.ofMinutes(30)).isAfter(now))sessions.add(new Session(id,meeting,RaceWeekends.text(item,"circuit_short_name"),end.toString()));
        }
        return sessions.stream().sorted(Comparator.comparing(Session::endsAt)).toList();
    }
    static List<Round> join(ObjectMapper mapper,List<Session> sessions,byte[] drivers,byte[] teams,byte[] names) throws Exception {
        Map<String,JsonNode> people=new HashMap<>();Map<String,String> colors=new HashMap<>();
        Map<Integer,String> dates=new HashMap<>();for(var session:sessions)dates.put(session.id(),session.endsAt());
        for(var item:array(mapper,names,1200)) {
            int sessionId=RaceWeekends.positive(item,"session_key");if(!dates.containsKey(sessionId))throw new IllegalArgumentException("Driver session");
            String number=String.valueOf(RaceWeekends.positive(item,"driver_number"));
            if(people.putIfAbsent(number+":"+sessionId,item)!=null)throw new IllegalArgumentException("Duplicate driver");
            var previous=people.get(number);if(previous==null||dates.get(previous.path("session_key").asInt()).compareTo(dates.get(sessionId))<0)people.put(number,item);
            String color=item.path("team_colour").asText("");if(color.matches("[a-fA-F0-9]{6}"))colors.put(RaceWeekends.text(item,"team_name"),color.toUpperCase(Locale.ROOT));
        }
        var driverGroups=group(array(mapper,drivers,2000));var teamGroups=group(array(mapper,teams,1000));List<Round> rounds=new ArrayList<>();JsonNode labels;
        try(var input=SeasonInsights.class.getResourceAsStream("/content/weekend-zh.json")){labels=mapper.readTree(input);}
        for(var session:sessions) {
            var ds=driverGroups.getOrDefault(session.id(),List.of());var ts=teamGroups.getOrDefault(session.id(),List.of());
            if(ds.isEmpty()||ts.isEmpty()) {if(session.equals(sessions.getLast()))throw new IllegalArgumentException("Latest standings unavailable");continue;}
            var d=entries(ds,session,true,people,colors);var t=entries(ts,session,false,people,colors);
            rounds.add(new Round(session.id(),session.meeting(),session.circuit(),labels.path(session.circuit()).asText(""),session.endsAt(),d,t));
        }
        return List.copyOf(rounds);
    }
    static Map<Integer,List<JsonNode>> group(JsonNode array) {
        Map<Integer,List<JsonNode>> groups=new HashMap<>();for(var item:array)groups.computeIfAbsent(RaceWeekends.positive(item,"session_key"),key->new ArrayList<>()).add(item);return groups;
    }
    static List<Entry> entries(List<JsonNode> rows,Session session,boolean driver,Map<String,JsonNode> people,Map<String,String> colors) {
        if(rows.size()>40)throw new IllegalArgumentException("Standings size");List<Entry> result=new ArrayList<>();Set<String> ids=new HashSet<>();Set<Integer> ranks=new HashSet<>();
        for(var item:rows) {
            if(item.path("meeting_key").asInt()!=session.meeting())throw new IllegalArgumentException("Wrong meeting");
            String id=driver?String.valueOf(RaceWeekends.positive(item,"driver_number")):RaceWeekends.text(item,"team_name");
            int position=rank(item,"position_current");if(!ids.add(id)||!ranks.add(position))throw new IllegalArgumentException("Duplicate standing");
            var person=people.getOrDefault(id+":"+session.id(),people.get(id));String name=driver?(person==null?"#"+id:RaceWeekends.text(person,"full_name")):id;
            // A substitute's historical team cannot be inferred from the latest entry list.
            String team=driver?(person!=null&&person.path("session_key").asInt()==session.id()?RaceWeekends.text(person,"team_name"):""):id;
            int before=item.path("position_start").isNull()?0:item.path("position_start").asInt(-1);if(before<0||before>40)throw new IllegalArgumentException("Starting rank");
            result.add(new Entry(id,name,team,colors.getOrDefault(team,"8290A1"),position,before==0?null:before,points(item,"points_current"),points(item,"points_start")));
        }
        result.sort(Comparator.comparingInt(Entry::position));
        for(int i=1;i<result.size();i++)if(new BigDecimal(result.get(i).points()).compareTo(new BigDecimal(result.get(i-1).points()))>0)throw new IllegalArgumentException("Points order");
        return List.copyOf(result);
    }
    static int rank(JsonNode item,String key){if(!item.path(key).isIntegralNumber())throw new IllegalArgumentException("Rank");int value=item.path(key).asInt();if(value<1||value>40)throw new IllegalArgumentException("Rank");return value;}
    static String points(JsonNode item,String key){var node=item.path(key);if(!node.isNumber())throw new IllegalArgumentException("Points");var value=node.decimalValue();if(value.signum()<0||value.compareTo(BigDecimal.valueOf(5000))>0||value.scale()>3)throw new IllegalArgumentException("Points range");return value.stripTrailingZeros().toPlainString();}
}

@RestController
class SeasonInsightsController {
    private final SeasonInsights insights;SeasonInsightsController(SeasonInsights insights){this.insights=insights;}
    @GetMapping("/api/v1/season-insights") SeasonInsights.View read(){return insights.read();}
}
