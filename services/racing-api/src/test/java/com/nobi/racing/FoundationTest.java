package com.nobi.racing;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FoundationTest {
    @Test void readinessChecksDatabaseAndReportsCacheDegradation() {
        JdbcTemplate jdbc=mock(JdbcTemplate.class);RedisSupport redis=mock(RedisSupport.class);
        when(jdbc.queryForObject("SELECT 1",Integer.class)).thenReturn(1);when(redis.enabled()).thenReturn(true);
        var response=new FoundationController(jdbc,redis).readiness();
        assertEquals(200,response.getStatusCode().value()); assertTrue(response.getBody().toString().contains("degraded"));
        when(jdbc.queryForObject("SELECT 1",Integer.class)).thenThrow(new org.springframework.dao.DataAccessResourceFailureException("internal address must not leak"));
        response=new FoundationController(jdbc,redis).readiness();assertEquals(503,response.getStatusCode().value());assertFalse(response.getBody().toString().contains("internal address"));
    }
}
