package com.nobi.racing;

import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import tools.jackson.databind.json.JsonMapper;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RateLimitTest {
    @Test void fallbackRemainsBoundedWhenRedisIsUnavailable() {
        var rate=new RedisSupport(mock(StringRedisTemplate.class,invocation -> { throw new org.springframework.data.redis.RedisConnectionFailureException("unavailable"); }),true);
        assertTrue(rate.acquire("client",2,Duration.ofMinutes(1)));assertTrue(rate.acquire("client",2,Duration.ofMinutes(1)));assertFalse(rate.acquire("client",2,Duration.ofMinutes(1)));
        for(int i=0;i<1023;i++) assertTrue(rate.acquire("client-"+i,2,Duration.ofMinutes(1)));
        assertFalse(rate.acquire("overflow",2,Duration.ofMinutes(1)));
    }
    @Test void apiFilterReturnsSafe429AndSanitizesTraceInput() throws Exception {
        RedisSupport rate=mock(RedisSupport.class);
        var filter=new ApiFilter(rate,new Problems(JsonMapper.builder().build()),1,60);
        var request=new MockHttpServletRequest("GET","/api/v1/drivers");request.addHeader("X-Request-ID","bad\nvalue");
        var response=new MockHttpServletResponse();
        filter.doFilter(request,response,(req,res) -> fail("Rate limited request must not continue"));
        assertEquals(429,response.getStatus());assertEquals("60",response.getHeader("Retry-After"));
        assertTrue(response.getContentAsString().contains("RATE_LIMITED"));assertFalse(response.getHeader("X-Request-ID").contains("\n"));
    }
}
