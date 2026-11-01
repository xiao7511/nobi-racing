package com.nobi.racing;

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

@Service
public class RaceWeekends {
    static final int YEAR=2026;
    static final URI MEETINGS=URI.create("https://api.openf1.org/v1/meetings?year=2026");
    static final URI SESSIONS=URI.create("https://api.openf1.org/v1/sessions?year=2026");
    static final Duration TTL=Duration.ofHours(6);
    public record Session(int id,String name,String kind,String startsAt,String endsAt) {}
    public record Weekend(int id,String name,String nameZh,String circuit,String circuitZh,String location,String locationZh,
                          String startsAt,String endsAt,String gmtOffset,boolean cancelled,boolean sprint,List<Session> sessions) {}
    public record View(String status,int year,String source,String sourceUrl,String license,String licenseUrl,String syncedAt,String expiresAt,List<Weekend> items) {}
    record Snapshot(Instant synced,List<Weekend> items) {}
    private final ObjectMapper mapper; private final Clock clock; private final boolean enabled; private final OfficialNews.Fetcher fetcher;
    private volatile Snapshot snapshot; private volatile Instant attempted; private volatile boolean failed;
    private final AtomicBoolean running=new AtomicBoolean();
    @org.springframework.beans.factory.annotation.Autowired
    public RaceWeekends(ObjectMapper mapper,Clock clock,@Value("${nobi.weekends.mode:disabled}") String mode,@Value("${server.address:}") String binding) {
        this(mapper,clock,"personal".equals(mode)&&Set.of("127.0.0.1","::1").contains(binding),OpenF1History::download);
    }
    RaceWeekends(ObjectMapper mapper,Clock clock,boolean enabled,OfficialNews.Fetcher fetcher) { this.mapper=mapper;this.clock=clock;this.enabled=enabled;this.fetcher=fetcher; }
    @Scheduled(initialDelay=2500,fixedDelay=60000)
    public void sync() {
        if (!enabled||!running.compareAndSet(false,true))return;
        try {
            Instant now=clock.instant();
            if(attempted!=null&&now.isBefore(attempted.plus(failed?Duration.ofMinutes(15):TTL)))return;
            attempted=now;
            try { var items=parse(mapper,fetcher.fetch(MEETINGS),fetcher.fetch(SESSIONS));snapshot=new Snapshot(clock.instant(),items);failed=false; }
            catch(Exception error) {snapshot=null;failed=true;}
        } finally {running.set(false);}
    }
    public View read() {
        var current=snapshot;boolean ready=enabled&&current!=null&&clock.instant().isBefore(current.synced().plus(TTL));
        return new View(!enabled?"disabled":ready?"ready":failed?"upstream_error":"pending",YEAR,"OpenF1","https://openf1.org/","CC BY-NC-SA 4.0","https://creativecommons.org/licenses/by-nc-sa/4.0/",ready?current.synced().toString():null,ready?current.synced().plus(TTL).toString():null,ready?current.items():List.of());
    }
    static List<Weekend> parse(ObjectMapper mapper,byte[] meetings,byte[] sessions) throws Exception {
        if(meetings.length>OfficialNews.MAX_BYTES||sessions.length>OfficialNews.MAX_BYTES)throw new IllegalArgumentException("Source too large");
        var ms=mapper.readTree(meetings);var ss=mapper.readTree(sessions);
        if(!ms.isArray()||ms.size()>40||!ss.isArray()||ss.size()>250)throw new IllegalArgumentException("Invalid calendar");
        JsonNode names;
        try(var input=RaceWeekends.class.getResourceAsStream("/content/weekend-zh.json")){names=mapper.readTree(input);}
        Map<Integer,List<Session>> byMeeting=new HashMap<>();Set<Integer> sessionIds=new HashSet<>();
        for(var item:ss) {
            int id=positive(item,"session_key"), meeting=positive(item,"meeting_key");if(!sessionIds.add(id))throw new IllegalArgumentException("Duplicate session");
            String name=text(item,"session_name"),kind=kind(name),start=time(item,"date_start"),end=time(item,"date_end");
            if(Instant.parse(end).isBefore(Instant.parse(start)))throw new IllegalArgumentException("Session time order");
            byMeeting.computeIfAbsent(meeting,key->new ArrayList<>()).add(new Session(id,name,kind,start,end));
        }
        Set<Integer> ids=new HashSet<>();List<Weekend> result=new ArrayList<>();
        for(var item:ms) {
            String name=text(item,"meeting_name");if(!name.endsWith("Grand Prix"))continue;
            int id=positive(item,"meeting_key");if(!ids.add(id)||item.path("year").asInt()!=YEAR)throw new IllegalArgumentException("Invalid meeting");
            String start=time(item,"date_start"),end=time(item,"date_end"),offset=text(item,"gmt_offset");
            if(Instant.parse(end).isBefore(Instant.parse(start))||!offset.matches("-?(?:0[0-9]|1[0-4]):[0-5][0-9]:00"))throw new IllegalArgumentException("Invalid weekend times");
            if(!item.path("is_cancelled").isBoolean())throw new IllegalArgumentException("Cancellation required");
            String circuit=text(item,"circuit_short_name"),location=text(item,"location");
            var list=byMeeting.getOrDefault(id,List.of()).stream().sorted(Comparator.comparing(Session::startsAt)).toList();
            for(var session:list)if(Instant.parse(session.startsAt()).isBefore(Instant.parse(start).minusSeconds(86400))||Instant.parse(session.endsAt()).isAfter(Instant.parse(end).plusSeconds(86400)))throw new IllegalArgumentException("Session outside weekend");
            result.add(new Weekend(id,name,names.path(name).asText(""),circuit,names.path(circuit).asText(""),location,names.path(location).asText(""),start,end,offset,item.path("is_cancelled").asBoolean(),list.stream().anyMatch(s->s.kind().equals("sprint")),list));
        }
        if(result.isEmpty())throw new IllegalArgumentException("Missing weekends");
        return result.stream().sorted(Comparator.comparing(Weekend::startsAt)).toList();
    }
    static String kind(String name) {return switch(name){case "Practice 1"->"practice1";case "Practice 2"->"practice2";case "Practice 3"->"practice3";case "Qualifying"->"qualifying";case "Sprint Qualifying","Sprint Shootout"->"sprintQualifying";case "Sprint"->"sprint";case "Race"->"race";default->"other";};}
    static String text(JsonNode item,String field) {String value=item.path(field).asText();if(value.isBlank()||!LocalNewsTranslation.safe(value,200))throw new IllegalArgumentException("Invalid text");return value;}
    static int positive(JsonNode item,String field){int value=item.path(field).asInt();if(value<=0)throw new IllegalArgumentException("Invalid ID");return value;}
    static String time(JsonNode item,String field){String value=Instant.parse(text(item,field)).toString();if(!value.startsWith("2026-"))throw new IllegalArgumentException("Invalid year");return value;}
}

@RestController
class RaceWeekendsController {
    private final RaceWeekends weekends;RaceWeekendsController(RaceWeekends weekends){this.weekends=weekends;}
    @GetMapping("/api/v1/weekends") RaceWeekends.View read(){return weekends.read();}
}
