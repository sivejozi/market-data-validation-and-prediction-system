package com.sive.validation.prediction.system.service.markets.fx.rates.impl;

import com.sive.validation.prediction.system.dto.markets.fx.MarketRateClusterRequest;
import com.sive.validation.prediction.system.dto.markets.fx.MarketRateClusterResult;
import com.sive.validation.prediction.system.dto.markets.fx.MarketRateDTO;
import com.sive.validation.prediction.system.service.markets.fx.rates.MarketRateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class MarketRateAnomalyServiceImpl {

    private static final Logger logger = LoggerFactory.getLogger(MarketRateAnomalyServiceImpl.class);

    private final MarketRateService marketRateService;
    private final WebClient webClient;

    @Value("${services.ml.url:http://localhost:8000}")
    private String mlServiceUrl;

    @Autowired
    public MarketRateAnomalyServiceImpl(MarketRateService marketRateService, WebClient.Builder webClientBuilder) {
        this.marketRateService = marketRateService;
        this.webClient = webClientBuilder.build();
    }

    public MarketRateClusterResult detectAnomalies(String instrument, int numClusters,
                                                   double threshold) {
        // 1. Fetch clean rates from DB
        List<MarketRateDTO> rates = marketRateService.findByInstrument(instrument);

        if (rates == null || rates.isEmpty()) {
            logger.warn("[ANOMALY] No rates found for {}", instrument);
            throw new RuntimeException("No rates found for instrument: " + instrument);
        }

        logger.info("[ANOMALY] Fetched {} rates for {}", rates.size(), instrument);

        // 2. Build request
        MarketRateClusterRequest request = new MarketRateClusterRequest(
                instrument, rates, numClusters, threshold
        );

        // 3. Call Python ML service
        logger.info("[ANOMALY] Calling Python K-Means service for {}", instrument);
        MarketRateClusterResult result = webClient.post()
                .uri(mlServiceUrl + "/kmeans/detect-anomalies")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(error -> {
                                    logger.error("[ANOMALY] ML service error: {}", error);
                                    return Mono.error(new RuntimeException("ML service error: " + error));
                                })
                )
                .bodyToMono(MarketRateClusterResult.class)
                .block();

        assert result != null;
        logger.info("[ANOMALY] Detected {} anomalies for {}",
                result.getTotalAnomalies(), instrument);
        return result;
    }

    public byte[] detectAnomaliesPlot(String instrument, int numClusters,
                                      double threshold) {
        List<MarketRateDTO> rates = marketRateService.findByInstrument(instrument);

        if (rates == null || rates.isEmpty()) {
            throw new RuntimeException("No rates found for instrument: " + instrument);
        }

        MarketRateClusterRequest request = new MarketRateClusterRequest(
                instrument, rates, numClusters, threshold
        );

        logger.info("[ANOMALY PLOT] Calling Python K-Means plot service for {}", instrument);
        byte[] plot = webClient.post()
                .uri(mlServiceUrl + "/kmeans/detect-anomalies-plot")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(error -> Mono.error(
                                        new RuntimeException("ML service error: " + error)))
                )
                .bodyToMono(byte[].class)
                .block();

        logger.info("[ANOMALY PLOT] Received plot for {}", instrument);
        return plot;
    }
}
