package com.nobi.racing;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.*;
class SeasonInsightsTest {
    final ObjectMapper mapper=new ObjectMapper();final Instant now=Instant.parse("2026-11-01T06:00:00Z");
    byte[] bytes(String value){return value.getBytes(StandardCharsets.UTF_8);}
    byte[] sessions(){return bytes("[{\"session_key\":10,\"meeting_key\":1,\"year\":2026,\"session_name\":\"Race\",\"circuit_short_name\":\"Austin\",\"date_start\":\"2026-10-25T19:00:00Z\",\"date_end\":\"2026-10-25T21:00:00Z\"},{\"session_key\":20,\"meeting_key\":2,\"year\":2026,\"session_name\":\"Race\",\"circuit_short_name\":\"Mexico City\",\"date_start\":\"2026-11-02T19:00:00Z\",\"date_end\":\"2026-11-02T21:00:00Z\"}]");}
    byte[] standings(boolean driver){return bytes("[{\"session_key\":10,\"meeting_key\":1,"+(driver?"\"driver_number\":12":"\"team_name\":\"Mercedes\"")+",\"position_current\":1,\"position_start\":2,\"points_current\":100.5,\"points_start\":75.5}]");}
    byte[] names(){return bytes("[{\"session_key\":10,\"driver_number\":12,\"full_name\":\"Kimi ANTONELLI\",\"team_name\":\"Mercedes\",\"team_colour\":\"00d7b6\"}]");}
    @Test void excludesFutureAndTheThirtyMinuteLiveWindow() throws Exception {
        var done=SeasonInsights.completed(mapper,sessions(),now);assertEquals(1,done.size());
        assertTrue(SeasonInsights.completed(mapper,sessions(),Instant.parse("2026-10-25T21:29:59Z")).isEmpty());
        assertEquals(1,SeasonInsights.completed(mapper,sessions(),Instant.parse("2026-10-25T21:30:00Z")).size());
    }
    @Test void joinsSourcePointsAndRanksWithoutSummingDriversOrInventingWins() throws Exception {
        var rounds=SeasonInsights.join(mapper,SeasonInsights.completed(mapper,sessions(),now),standings(true),standings(false),names());
        var round=rounds.getFirst();assertEquals("奥斯汀",round.circuitZh());assertEquals("100.5",round.drivers().getFirst().points());assertEquals("75.5",round.drivers().getFirst().pointsStart());assertEquals("Mercedes",round.drivers().getFirst().team());assertEquals("00D7B6",round.drivers().getFirst().color());assertEquals("100.5",round.teams().getFirst().points());
    }
    @Test void rejectsCrossSessionRowsDuplicatesAndNegativePoints() throws Exception {
        var done=SeasonInsights.completed(mapper,sessions(),now);
        assertThrows(Exception.class,()->SeasonInsights.join(mapper,done,bytes(new String(standings(true),StandardCharsets.UTF_8).replace("100.5","-1")),standings(false),names()));
        assertThrows(Exception.class,()->SeasonInsights.join(mapper,done,bytes(new String(standings(true),StandardCharsets.UTF_8).replace("\"meeting_key\":1","\"meeting_key\":2")),standings(false),names()));
        String row=new String(standings(true),StandardCharsets.UTF_8);assertThrows(Exception.class,()->SeasonInsights.join(mapper,done,bytes(row.substring(0,row.length()-1)+","+row.substring(1)),standings(false),names()));
        assertThrows(Exception.class,()->SeasonInsights.join(mapper,done,standings(true),bytes("[]"),names()));
    }
    @Test void neverInfersHistoricalTeamFromLatestMetadataAndOmitsMissingRounds() throws Exception {
        var done=List.of(new SeasonInsights.Session(9,9,"Shanghai","2026-03-15T09:00:00Z"),new SeasonInsights.Session(10,1,"Austin","2026-10-25T21:00:00Z"));
        assertEquals(1,SeasonInsights.join(mapper,done,standings(true),standings(false),names()).size());
        var earlier=new SeasonInsights.Session(9,1,"Shanghai","2026-03-15T09:00:00Z");
        var historical=mapper.readTree(new String(standings(true),StandardCharsets.UTF_8).replace("\"session_key\":10","\"session_key\":9")).get(0);
        assertEquals("",SeasonInsights.entries(List.of(historical),earlier,true,Map.of("12",mapper.readTree(names()).get(0)),Map.of()).getFirst().team());
    }
    @Test void scheduledSnapshotIsAtomicExpiresAndReadsDoNotFetch() {
        var clock=new OfficialNewsTest.MutableClock(now);var calls=new AtomicInteger();
        var source=new SeasonInsights(mapper,clock,true,uri->{calls.incrementAndGet();if(clock.instant().isAfter(now))throw new Exception("unavailable");String path=uri.getPath();if(path.contains("championship"))assertEquals("session_key=10",uri.getQuery());return path.endsWith("/sessions")?sessions():path.endsWith("/championship_drivers")?standings(true):path.endsWith("/championship_teams")?standings(false):names();});
        assertEquals("pending",source.read().status());assertEquals(0,calls.get());source.sync();assertEquals("ready",source.read().status());assertEquals(4,calls.get());source.read();source.sync();assertEquals(4,calls.get());
        clock.value=now.plusSeconds(21600);assertTrue(source.read().rounds().isEmpty());source.sync();assertEquals("upstream_error",source.read().status());assertTrue(source.read().rounds().isEmpty());
    }
    @Test void generalDeploymentAndNonLoopbackModeStayDisabled() {
        var source=new SeasonInsights(mapper,Clock.systemUTC(),false,uri->{fail("No network");return null;});source.sync();assertEquals("disabled",source.read().status());
        var publicBinding=new SeasonInsights(mapper,Clock.systemUTC(),"personal","0.0.0.0");assertEquals("disabled",publicBinding.read().status());
    }
}
