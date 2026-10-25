package com.nobi.racing;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ApiFilter extends OncePerRequestFilter {
    private final RedisSupport redis; private final Problems problems; private final int limit; private final int seconds;
    public ApiFilter(RedisSupport redis, Problems problems,@Value("${nobi.api.limit}") int limit,@Value("${nobi.api.window-seconds}") int seconds) { this.redis=redis;this.problems=problems;this.limit=limit;this.seconds=seconds; }
    @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain) throws IOException,ServletException {
        String supplied=request.getHeader("X-Request-ID");
        String trace=supplied!=null && supplied.matches("[A-Za-z0-9-]{1,64}")?supplied:UUID.randomUUID().toString();
        request.setAttribute("nobi.trace",trace); response.setHeader("X-Request-ID",trace);
        response.setHeader("Cache-Control","no-store"); response.setHeader("X-Content-Type-Options","nosniff");
        if(request.getRequestURI().startsWith("/api/v1/") && !request.getRequestURI().equals("/api/v1/readiness") && !redis.acquire("api:"+request.getRemoteAddr(),limit,Duration.ofSeconds(seconds))) {
            response.setHeader("Retry-After",Integer.toString(seconds)); problems.write(request,response,429,"RATE_LIMITED"); return;
        }
        chain.doFilter(request,response);
    }
}
