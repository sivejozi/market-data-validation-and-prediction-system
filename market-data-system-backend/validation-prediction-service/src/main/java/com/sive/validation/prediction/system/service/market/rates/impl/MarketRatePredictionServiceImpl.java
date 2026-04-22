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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    public MarketRatePredictionResult predictGBR(
            String instrument, int numDays) {

        List<MarketRateDTO> rates =
                marketRateService.findByInstrument(instrument);

        if (rates == null || rates.isEmpty())
            throw new RuntimeException(
                    "No rates found for instrument: " + instrument);

        logger.info("[PREDICTION] Calling GBR for {}", instrument);

        Map<String, Object> request = new HashMap<>();
        request.put("instrument", instrument);
        request.put("rates", toRateMapList(rates));
        request.put("numDays", numDays);
        request.put("nEstimators", 200);
        request.put("maxDepth", 3);
        request.put("learningRate", 0.1);

        return webClient.post()
                .uri(mlServiceUrl +
                        "/gradient-boosting-regressor/predict-instrument")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError, r ->
                        r.bodyToMono(String.class)
                                .flatMap(e -> Mono.error(
                                        new RuntimeException("GBR error: " + e))))
                .bodyToMono(MarketRatePredictionResult.class)
                .block();
    }

    public MarketRatePredictionResult predictRFR(
            String instrument, int numDays) {

        List<MarketRateDTO> rates =
                marketRateService.findByInstrument(instrument);

        if (rates == null || rates.isEmpty())
            throw new RuntimeException(
                    "No rates found for instrument: " + instrument);

        logger.info("[PREDICTION] Calling RFR for {}", instrument);

        Map<String, Object> request = new HashMap<>();
        request.put("instrument", instrument);
        request.put("rates", toRateMapList(rates));
        request.put("numDays", numDays);
        request.put("nEstimators", 200);
        request.put("randomState", 42);

        return webClient.post()
                .uri(mlServiceUrl +
                        "/random-forest-regressor/predict-instrument")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError, r ->
                        r.bodyToMono(String.class)
                                .flatMap(e -> Mono.error(
                                        new RuntimeException("RFR error: " + e))))
                .bodyToMono(MarketRatePredictionResult.class)
                .block();
    }

    public byte[] plotGBR(String instrument, int numDays) {
        List<MarketRateDTO> rates =
                marketRateService.findByInstrument(instrument);
        if (rates == null || rates.isEmpty())
            throw new RuntimeException(
                    "No rates found for: " + instrument);

        Map<String, Object> request = new HashMap<>();
        request.put("instrument", instrument);
        request.put("rates", toRateMapList(rates));
        request.put("numDays", numDays);
        request.put("nEstimators", 200);
        request.put("maxDepth", 3);
        request.put("learningRate", 0.1);

        return webClient.post()
                .uri(mlServiceUrl +
                        "/gradient-boosting-regressor/predict-instrument-plot")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError, r ->
                        r.bodyToMono(String.class)
                                .flatMap(e -> Mono.error(
                                        new RuntimeException("GBR plot error: " + e))))
                .bodyToMono(byte[].class)
                .block();
    }

    public byte[] plotRFR(String instrument, int numDays) {
        List<MarketRateDTO> rates =
                marketRateService.findByInstrument(instrument);
        if (rates == null || rates.isEmpty())
            throw new RuntimeException(
                    "No rates found for: " + instrument);

        Map<String, Object> request = new HashMap<>();
        request.put("instrument", instrument);
        request.put("rates", toRateMapList(rates));
        request.put("numDays", numDays);
        request.put("nEstimators", 200);
        request.put("randomState", 42);

        return webClient.post()
                .uri(mlServiceUrl +
                        "/random-forest-regressor/predict-instrument-plot")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError, r ->
                        r.bodyToMono(String.class)
                                .flatMap(e -> Mono.error(
                                        new RuntimeException("RFR plot error: " + e))))
                .bodyToMono(byte[].class)
                .block();
    }

    // ── Also fix LR to use correct endpoint ──────────────────────
    public MarketRatePredictionResult predict(
            String instrument, int numDays) {

        List<MarketRateDTO> rates =
                marketRateService.findByInstrument(instrument);

        if (rates == null || rates.isEmpty())
            throw new RuntimeException(
                    "No rates found for instrument: " + instrument);

        logger.info("[PREDICTION] Calling LR for {}", instrument);

        Map<String, Object> request = new HashMap<>();
        request.put("instrument", instrument);
        request.put("rates", toRateMapList(rates));
        request.put("numDays", numDays);

        return webClient.post()
                .uri(mlServiceUrl +
                        "/linear-regression/predict-instrument")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::isError, r ->
                        r.bodyToMono(String.class)
                                .flatMap(e -> Mono.error(
                                        new RuntimeException("LR error: " + e))))
                .bodyToMono(MarketRatePredictionResult.class)
                .block();
    }

    // ── toRateMapList helper ──────────────────────────────────────
    private List<Map<String, Object>> toRateMapList(
            List<MarketRateDTO> rates) {
        return rates.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("instrument", r.getInstrument());
            map.put("date", r.getDate() != null
                    ? r.getDate().toString().replace("T", " ") : "");
            map.put("rate", r.getRate());
            map.put("lag1", r.getLag1() != null ? r.getLag1() : 0.0);
            map.put("lag7", r.getLag7() != null ? r.getLag7() : 0.0);
            map.put("rollingMean7", r.getRollingMean7() != null ? r.getRollingMean7() : 0.0);
            map.put("rollingStd7", r.getRollingStd7() != null ? r.getRollingStd7() : 0.0);
            map.put("rateScaled", r.getRateScaled() != null ? r.getRateScaled() : 0.0);
            return map;
        }).toList();
    }

    // ── plots ──────────────────────────────────────
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
                .uri(mlServiceUrl + "/linear-regression/predict-instrument-plot")
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
