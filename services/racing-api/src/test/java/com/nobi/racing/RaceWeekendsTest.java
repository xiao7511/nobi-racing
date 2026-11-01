package com.nobi.racing;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.*;
class RaceWeekendsTest {
    final ObjectMapper mapper=new ObjectMapper();
    byte[] meetings(){return "[{\"meeting_key\":1,\"meeting_name\":\"Mexico City Grand Prix\",\"year\":2026,\"date_start\":\"2026-10-30T18:00:00Z\",\"date_end\":\"2026-11-01T22:00:00Z\",\"gmt_offset\":\"-06:00:00\",\"is_cancelled\":false,\"circuit_short_name\":\"Mexico City\",\"location\":\"Mexico City\"},{\"meeting_key\":2,\"meeting_name\":\"Bahrain Grand Prix\",\"year\":2026,\"date_start\":\"2026-04-10T18:00:00Z\",\"date_end\":\"2026-04-12T22:00:00Z\",\"gmt_offset\":\"03:00:00\",\"is_cancelled\":true,\"circuit_short_name\":\"Sakhir\",\"location\":\"Sakhir\"}]".getBytes(StandardCharsets.UTF_8);}
    byte[] sessions(){return "[{\"session_key\":11,\"meeting_key\":1,\"session_name\":\"Sprint\",\"date_start\":\"2026-10-31T18:00:00Z\",\"date_end\":\"2026-10-31T19:00:00Z\"},{\"session_key\":12,\"meeting_key\":1,\"session_name\":\"Race\",\"date_start\":\"2026-11-01T18:00:00Z\",\"date_end\":\"2026-11-01T20:00:00Z\"}]".getBytes(StandardCharsets.UTF_8);}
    @Test void joinsOnlyRealSourceSessionsAndPreservesCancellationWithReviewedChineseNames() throws Exception {
        var result=RaceWeekends.parse(mapper,meetings(),sessions());assertEquals(2,result.size());assertTrue(result.getFirst().cancelled());
        var mexico=result.getLast();assertEquals("墨西哥城大奖赛",mexico.nameZh());assertEquals("墨西哥城",mexico.circuitZh());assertTrue(mexico.sprint());assertEquals(2,mexico.sessions().size());assertEquals("sprint",mexico.sessions().getFirst().kind());
    }
    @Test void atomicallyHidesExpiredAndFailedWeekendsWithoutMakingSourceCallsOnRead() {
        var clock=new OfficialNewsTest.MutableClock(Instant.parse("2026-11-01T00:00:00Z"));AtomicInteger calls=new AtomicInteger();
        var source=new RaceWeekends(mapper,clock,true,uri->{if(calls.incrementAndGet()>2)throw new Exception("private");return uri.equals(RaceWeekends.MEETINGS)?meetings():sessions();});
        assertEquals("pending",source.read().status());assertEquals(0,calls.get());source.sync();assertEquals("ready",source.read().status());source.sync();assertEquals(2,calls.get());
        clock.value=clock.value.plusSeconds(21600);assertTrue(source.read().items().isEmpty());source.sync();assertEquals("upstream_error",source.read().status());assertTrue(source.read().items().isEmpty());
    }
    @Test void disabledSourceNeverCallsNetwork() {var source=new RaceWeekends(mapper,Clock.systemUTC(),false,uri->{fail("Must not fetch");return null;});source.sync();assertEquals("disabled",source.read().status());}
    @Test void rejectsBadYearsDuplicateSessionsReversedTimesAndLargeResponses() {
        assertThrows(Exception.class,()->RaceWeekends.parse(mapper,new String(meetings(),StandardCharsets.UTF_8).replace("2026","2027").getBytes(StandardCharsets.UTF_8),sessions()));
        assertThrows(Exception.class,()->RaceWeekends.parse(mapper,meetings(),new String(sessions(),StandardCharsets.UTF_8).replace("12","11").getBytes(StandardCharsets.UTF_8)));
        assertThrows(Exception.class,()->RaceWeekends.parse(mapper,meetings(),new String(sessions(),StandardCharsets.UTF_8).replace("2026-11-01T20:00:00Z","2026-10-01T20:00:00Z").getBytes(StandardCharsets.UTF_8)));
        assertThrows(Exception.class,()->RaceWeekends.parse(mapper,new byte[OfficialNews.MAX_BYTES+1],sessions()));
    }
}
