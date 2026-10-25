package com.nobi.racing;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PolicyTest {
    private final Instant now=Instant.parse("2026-10-25T08:00:00Z");
    private final UUID author=UUID.randomUUID(),reviewer=UUID.randomUUID();
    private RightsPolicy.Grant grant(boolean enabled,String status,boolean verified,boolean active,UUID approver,Instant from,Instant until,Set<String> capabilities,Set<String> territories) {
        return new RightsPolicy.Grant(enabled,status,verified,active,author,approver,from,until,capabilities,territories);
    }
    private RightsPolicy.Grant approved() { return grant(true,"approved",true,true,reviewer,now.minusSeconds(1),now.plusSeconds(1),Set.of("schedule","redistribution"),Set.of("LOCAL")); }
    @Test void grantChecksAllRightsAndHalfOpenValidity() {
        var good=approved();assertTrue(RightsPolicy.permits(good,"schedule","LOCAL",now,true));
        for(var bad:java.util.List.of(
            grant(false,"approved",true,true,reviewer,good.from(),good.until(),good.capabilities(),good.territories()),
            grant(true,"pending",true,true,reviewer,good.from(),good.until(),good.capabilities(),good.territories()),
            grant(true,"revoked",true,true,reviewer,good.from(),good.until(),good.capabilities(),good.territories()),
            grant(true,"approved",false,true,reviewer,good.from(),good.until(),good.capabilities(),good.territories()),
            grant(true,"approved",true,false,reviewer,good.from(),good.until(),good.capabilities(),good.territories()),
            grant(true,"approved",true,true,author,good.from(),good.until(),good.capabilities(),good.territories()),
            grant(true,"approved",true,true,null,good.from(),good.until(),good.capabilities(),good.territories())
        )) assertFalse(RightsPolicy.permits(bad,"schedule","LOCAL",now,true));
        assertTrue(RightsPolicy.permits(good,"schedule","LOCAL",good.from(),true));
        assertFalse(RightsPolicy.permits(good,"schedule","LOCAL",good.until(),true));
        assertFalse(RightsPolicy.permits(good,"results","LOCAL",now,true));assertFalse(RightsPolicy.permits(good,"schedule","CN",now,true));
    }
    @Test void readingRequiresRedistributionIndependentlyOfIngestion() {
        var g=approved();var ingestOnly=grant(true,"approved",true,true,reviewer,g.from(),g.until(),Set.of("schedule"),g.territories());
        assertTrue(RightsPolicy.permits(ingestOnly,"schedule","LOCAL",now,false));assertFalse(RightsPolicy.permits(ingestOnly,"schedule","LOCAL",now,true));
    }
    @Test void cursorsRejectTamperingAndCrossQueryOrRevisionReuse() {
        var signer=new SignedCursor("");String cursor=signer.encode("sort:uuid","filter-and-authority");
        assertEquals("sort:uuid",signer.decode(cursor,"filter-and-authority"));
        assertEquals(409,assertThrows(ApiFailure.class,() -> signer.decode(cursor,"another-grant-revision")).status());
        assertThrows(ApiFailure.class,() -> signer.decode("A"+cursor,"filter-and-authority"));
        assertThrows(ApiFailure.class,() -> signer.decode("x".repeat(513),"filter-and-authority"));
        assertThrows(ApiFailure.class,() -> new SignedCursor("").decode(cursor,"filter-and-authority"));
    }
    @Test void retryRechecksRightsForEveryAttemptAndDoesNotRetryUnauthorizedResponses() {
        AtomicInteger checks=new AtomicInteger(),calls=new AtomicInteger();var sleeps=new java.util.ArrayList<java.time.Duration>();
        assertEquals("ok",RetryPolicy.execute(3,1,checks::incrementAndGet,() -> { if(calls.incrementAndGet()<3) throw new SourceAdapter.Failure(503,2); return "ok"; },sleeps::add));
        assertEquals(3,checks.get());assertEquals(2,sleeps.size());
        calls.set(0);
        assertThrows(ApiFailure.class,() -> RetryPolicy.execute(3,1,() -> {},() -> { calls.incrementAndGet();throw new SourceAdapter.Failure(401,0); },sleeps::add));assertEquals(1,calls.get());
        calls.set(0);checks.set(0);
        assertThrows(ApiFailure.class,() -> RetryPolicy.execute(3,1,() -> { if(checks.incrementAndGet()==2) throw new ApiFailure(403,"SOURCE_NOT_AUTHORIZED"); },() -> { calls.incrementAndGet();throw new SourceAdapter.Failure(429,0); },sleeps::add));assertEquals(1,calls.get());
    }
}
