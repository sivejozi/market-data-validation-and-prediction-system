package com.sive.validation.prediction.system.service.market.rates.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class MlWebClientService {

    private static final Logger logger =
            LoggerFactory.getLogger(MlWebClientService.class);

    private final WebClient webClient;

    @Value("${services.ml.url:http://localhost:8000}")
    private String mlServiceUrl;

    public MlWebClientService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public <T> T post(String path, Object body, Class<T> responseType) {
        logger.info("[ML] Calling {} {}", mlServiceUrl, path);
        return webClient.post()
                .uri(mlServiceUrl + path)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(error -> {
                                    logger.error("[ML] Error from {}: {}",
                                            path, error);
                                    return Mono.error(
                                            new RuntimeException(
                                                    "ML service error: " + error));
                                }))
                .bodyToMono(responseType)
                .block();
    }

    public byte[] postForBytes(String path, Object body) {
        logger.info("[ML] Calling {} {} for plot", mlServiceUrl, path);
        return webClient.post()
                .uri(mlServiceUrl + path)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(error -> Mono.error(
                                        new RuntimeException(
                                                "ML service error: " + error))))
                .bodyToMono(byte[].class)
                .block();
    }

    public double toDouble(Object val) {
        if (val == null) return 0.0;
        if (val instanceof Double d) return d;
        if (val instanceof Integer i) return i.doubleValue();
        if (val instanceof Number n) return n.doubleValue();
        return 0.0;
    }
}
