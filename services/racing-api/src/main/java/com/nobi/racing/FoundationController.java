package com.nobi.racing;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;

@RestController
public class FoundationController {
    private final JdbcTemplate jdbc; private final RedisSupport redis;
    public FoundationController(JdbcTemplate jdbc,RedisSupport redis) { this.jdbc=jdbc;this.redis=redis; }
    @GetMapping("/api/v1/readiness")
    public ResponseEntity<?> readiness() {
        boolean database;
        try { database=Integer.valueOf(1).equals(jdbc.queryForObject("SELECT 1",Integer.class)); } catch(RuntimeException error) { database=false; }
        boolean cache=redis.healthy();
        return ResponseEntity.status(database?200:503).body(Map.of("status",database?(cache?"ready":"degraded"):"unavailable","phase","2","dataMode","mock","database",database?"up":"down","cache",!redis.enabled()?"disabled":(cache?"up":"down")));
    }
}
