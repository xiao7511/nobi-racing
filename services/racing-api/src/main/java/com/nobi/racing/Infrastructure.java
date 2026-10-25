package com.nobi.racing;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Infrastructure {
    @Bean Clock clock() { return Clock.systemUTC(); }
}
