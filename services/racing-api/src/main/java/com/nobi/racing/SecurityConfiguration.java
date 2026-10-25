package com.nobi.racing;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfiguration {
    @Bean UserDetailsService users() { return new InMemoryUserDetailsManager(); }

    @Bean SecurityFilterChain security(HttpSecurity http) throws Exception {
        return http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/readiness").permitAll()
                .anyRequest().denyAll())
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .exceptionHandling(errors -> errors.authenticationEntryPoint((request, response, exception) -> {
                response.setStatus(401);
                response.setContentType("application/problem+json");
                response.getWriter().write("{\"type\":\"urn:nobi:error:AUTH_REQUIRED\",\"title\":\"Authentication required\",\"status\":401,\"code\":\"AUTH_REQUIRED\"}");
            }))
            .build();
    }
}
