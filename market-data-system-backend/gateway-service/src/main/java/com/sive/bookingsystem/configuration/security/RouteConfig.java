package com.sive.bookingsystem.configuration.security;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RouteConfig {

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("user-service", r -> r.path("/auth/**")
                        .uri("http://user-service:8081"))
                .route("booking-service", r -> r.path("/booking/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://booking-service:8080"))
                .build();
    }

}

