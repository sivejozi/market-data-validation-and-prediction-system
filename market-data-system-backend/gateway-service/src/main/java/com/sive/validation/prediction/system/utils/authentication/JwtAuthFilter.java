package com.sive.validation.prediction.system.utils.authentication;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequestDecorator;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthFilter implements WebFilter {

    private final JwtUtil jwtUtil;

    @Autowired
    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getPath().value();

        // Skip public endpoints
        if (path.startsWith("/auth") ||
                path.startsWith("/swagger") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/validation/v3/api-docs") ||
                path.startsWith("/user/v3/api-docs") ||
                path.startsWith("/alerts/v3/api-docs") ||
                path.startsWith("/webjars") ||
                path.startsWith("/actuator")) {
            return chain.filter(exchange);
        }
        // Resolve and validate JWT
        String token = jwtUtil.resolveToken(exchange.getRequest());
        if (token == null || !jwtUtil.validateToken(token)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String username = jwtUtil.extractUsername(token);
        List<String> roles = jwtUtil.extractRoles(token);

        List<GrantedAuthority> authorities = roles.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        Authentication auth = new UsernamePasswordAuthenticationToken(username, null, authorities);

        ServerHttpRequestDecorator requestDecorator = new ServerHttpRequestDecorator(exchange.getRequest()) {
            @Override
            public HttpHeaders getHeaders() {
                HttpHeaders headers = new HttpHeaders();
                headers.putAll(super.getHeaders());
                headers.add("X-User-Email", username);
                headers.add("X-User-Roles", String.join(",", roles));
                return headers;
            }
        };

// Put Authentication into ReactiveSecurityContext
        return chain.filter(exchange.mutate().request(requestDecorator).build())
                .contextWrite(ReactiveSecurityContextHolder.withAuthentication(auth));
    }
}


