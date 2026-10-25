package com.nobi.racing;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;

@Configuration
@org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication
public class SecurityConfiguration {
    @Bean UserDetailsService users() { return new InMemoryUserDetailsManager(); }

    @Bean SecurityFilterChain security(HttpSecurity http, Problems problems) throws Exception {
        return http.authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET,"/api/v1/readiness","/api/v1/seasons/**","/api/v1/circuits/**","/api/v1/races/**","/api/v1/sessions/**","/api/v1/drivers/**","/api/v1/teams/**","/api/v1/standings").permitAll()
                .anyRequest().denyAll())
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.STATELESS))
            .requestCache(cache -> cache.disable())
            .exceptionHandling(errors -> errors.authenticationEntryPoint((request,response,exception) -> problems.write(request,response,401,"AUTH_REQUIRED"))
                .accessDeniedHandler((request,response,exception) -> problems.write(request,response,403,"AUTH_FORBIDDEN")))
            .build();
    }
}
