package com.nobi.racing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RacingApplication {
    public static void main(String[] args) {
        var context=SpringApplication.run(RacingApplication.class,args);
        if(context.getEnvironment().getProperty("nobi.task",Boolean.class,false)) context.close();
    }
}
