package com.sive.validation.prediction.system.service.market.rates.impl;

import com.sive.validation.prediction.system.dto.markets.rates.MarketRateDTO;
import com.sive.validation.prediction.system.dto.markets.rates.MarketRatePredictionRequest;
import com.sive.validation.prediction.system.dto.markets.rates.MarketRatePredictionResult;
import com.sive.validation.prediction.system.service.market.rates.MarketRateService;
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
public class MarketRatePredictionServiceImpl {

    private static final Logger logger = LoggerFactory.getLogger(MarketRatePredictionServiceImpl.class);

    private final MarketRateService marketRateService;
    private final WebClient webClient;

    @Value("${services.ml.url:http://localhost:8000}")
    private String mlServiceUrl;

    @Autowired
    public MarketRatePredictionServiceImpl(MarketRateService marketRateService, WebClient.Builder webClientBuilder) {
        this.marketRateService = marketRateService;
        this.webClient = webClientBuilder.build();
    }

    public MarketRatePredictionResult predict(String instrument, int numDays) {
        // 1. Fetch clean rates from DB
        List<MarketRateDTO> rates = marketRateService.findByInstrument(instrument);

        if (rates == null || rates.isEmpty()) {
            logger.warn("[PREDICTION] No rates found for {}", instrument);
            throw new RuntimeException("No rates found for instrument: " + instrument);
        }

        logger.info("[PREDICTION] Fetched {} rates for {}", rates.size(), instrument);

        // 2. Build request for Python ML service
        MarketRatePredictionRequest request = new MarketRatePredictionRequest(
                instrument,
                rates,
                numDays
        );

        // 3. Call Python ML service
        logger.info("[PREDICTION] Calling Python ML service for {}", instrument);
        MarketRatePredictionResult result = webClient.post()
                .uri(mlServiceUrl + "/linear-regression/predict-market")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(error -> {
                                    logger.error("[PREDICTION] ML service error: {}", error);
                                    return Mono.error(new RuntimeException("ML service error: " + error));
                                })
                )
                .bodyToMono(MarketRatePredictionResult.class)
                .block();

        logger.info("[PREDICTION] Received prediction for {}", instrument);
        return result;
    }

    public byte[] plot(String instrument, int numDays) {
        // 1. Fetch clean rates from DB
        List<MarketRateDTO> rates = marketRateService.findByInstrument(instrument);

        if (rates == null || rates.isEmpty()) {
            throw new RuntimeException("No rates found for instrument: " + instrument);
        }

        // 2. Build request
        MarketRatePredictionRequest request = new MarketRatePredictionRequest(
                instrument,
                rates,
                numDays
        );

        // 3. Call Python ML service plot endpoint
        logger.info("[PLOT] Calling Python ML service plot for {}", instrument);
        byte[] plot = webClient.post()
                .uri(mlServiceUrl + "/linear-regression/predict-market-plot")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        response.bodyToMono(String.class)
                                .flatMap(error -> Mono.error(new RuntimeException("ML service error: " + error)))
                )
                .bodyToMono(byte[].class)
                .block();

        logger.info("[PLOT] Received plot for {}", instrument);
        return plot;
    }
}
