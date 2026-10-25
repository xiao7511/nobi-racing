package com.nobi.racing;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

@Service
public class RedisSupport {
    private static final DefaultRedisScript<Long> LIMIT = new DefaultRedisScript<>("local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]) end; return n",Long.class);
    private final StringRedisTemplate redis;
    private final boolean enabled;
    private final ConcurrentHashMap<String,long[]> fallback=new ConcurrentHashMap<>();
    public RedisSupport(StringRedisTemplate redis,@Value("${nobi.cache.enabled}") boolean enabled) { this.redis=redis; this.enabled=enabled; }
    public String get(String key) { if (!enabled) return null; try { return redis.opsForValue().get(key); } catch (RuntimeException error) { return null; } }
    public void put(String key,String value,Duration ttl) { if(enabled && ttl.toMillis()>0) try { redis.opsForValue().set(key,value,ttl); } catch(RuntimeException ignored) { /* DB remains authoritative. */ } }
    public boolean healthy() { if(!enabled) return true; try(var connection=redis.getConnectionFactory().getConnection()) { return "PONG".equals(connection.ping()); } catch(RuntimeException error) { return false; } }
    public boolean enabled() { return enabled; }
    public boolean acquire(String key,int limit,Duration window) {
        if(enabled) try { Long count=redis.execute(LIMIT,List.of("nobi:p2:rate:"+Crypto.digest(key)),Long.toString(window.toMillis())); return count!=null && count<=limit; } catch(RuntimeException ignored) { /* Bounded process-local degradation. */ }
        synchronized(fallback) {
            long now=System.nanoTime();
            fallback.entrySet().removeIf(e -> now-e.getValue()[0]>=window.toNanos());
            if(!fallback.containsKey(key) && fallback.size()>=1024) return false;
            long[] state=fallback.computeIfAbsent(key,k -> new long[]{now,0});
            return ++state[1]<=limit;
        }
    }
}
