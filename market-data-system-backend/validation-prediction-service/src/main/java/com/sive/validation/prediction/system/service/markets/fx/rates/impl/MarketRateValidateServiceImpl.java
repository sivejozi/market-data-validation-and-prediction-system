package com.sive.validation.prediction.system.service.markets.fx.rates.impl;

import com.sive.validation.prediction.system.dto.markets.fx.*;
import com.sive.validation.prediction.system.dto.message.DataDTO;
import com.sive.validation.prediction.system.dto.message.MessageDTO;
import com.sive.validation.prediction.system.service.markets.fx.rates.MarketRateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.text.ParseException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class MarketRateValidateServiceImpl {

    private static final Logger logger =
            LoggerFactory.getLogger(MarketRateValidateServiceImpl.class);

    private static final String ALERT_TOPIC = "market.rates.alert";
    private static final int CONSENSUS_THRESHOLD = 2;
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final MarketRateService marketRateService;
    private final WebClient webClient;
    private final KafkaTemplate<String, MessageDTO> kafkaTemplate;

    @Value("${services.ml.url:http://localhost:8000}")
    private String mlServiceUrl;

    @Autowired
    public MarketRateValidateServiceImpl(
            MarketRateService marketRateService,
            WebClient.Builder webClientBuilder,
            KafkaTemplate<String, MessageDTO> kafkaTemplate) {
        this.marketRateService = marketRateService;
        this.webClient = webClientBuilder.build();
        this.kafkaTemplate = kafkaTemplate;
    }

    public ValidateRateResponse validateRate(ValidateRateRequest request) {
        String instrument = request.getInstrument();

        // 1. Fetch full history from DB
        List<MarketRateDTO> historicalRates =
                marketRateService.findByInstrument(instrument);

        if (historicalRates == null || historicalRates.isEmpty()) {
            throw new RuntimeException(
                    "No historical rates found for instrument: " + instrument);
        }

        logger.info("[VALIDATE] Fetched {} historical rates for {}",
                historicalRates.size(), instrument);

        // 2. Compute features from historical data
        int size = historicalRates.size();

        double lag1 = historicalRates.get(size - 1).getRate();
        double lag7 = historicalRates.get(Math.max(0, size - 7)).getRate();

        double rollingMean7 = historicalRates.subList(
                        Math.max(0, size - 7), size)
                .stream()
                .mapToDouble(MarketRateDTO::getRate)
                .average()
                .orElse(request.getRate());

        double rollingStd7 = computeStd(
                historicalRates.subList(Math.max(0, size - 7), size)
                        .stream()
                        .mapToDouble(MarketRateDTO::getRate)
                        .toArray(),
                rollingMean7
        );

        double minRate = historicalRates.stream()
                .mapToDouble(MarketRateDTO::getRate).min().orElse(0);
        double maxRate = historicalRates.stream()
                .mapToDouble(MarketRateDTO::getRate).max().orElse(1);
        double rateScaled = (maxRate - minRate) == 0 ? 0 :
                (request.getRate() - minRate) / (maxRate - minRate);

        logger.info("[VALIDATE] Computed features — lag1={} lag7={} " +
                        "mean7={} std7={} scaled={}",
                lag1, lag7, rollingMean7, rollingStd7, rateScaled);

        // 3. Build new rate DTO
        MarketRateDTO newRate = new MarketRateDTO();
        newRate.setInstrument(instrument);
        newRate.setDate(parseDate(request.getDate()));
        newRate.setRate(request.getRate());
        newRate.setLag1(lag1);
        newRate.setLag7(lag7);
        newRate.setRollingMean7(rollingMean7);
        newRate.setRollingStd7(rollingStd7);
        newRate.setRateScaled(rateScaled);

        // 4. Append new rate as last item
        List<MarketRateDTO> allRates = new ArrayList<>(historicalRates);
        allRates.add(newRate);

        // 4. Call all 3 Python ML endpoints
        ModelValidationResult kmeansResult = callKMeans(instrument, allRates);
        ModelValidationResult autoencoderResult = callAutoencoder(instrument, allRates);
        ModelValidationResult rfcResult = callRFC(instrument, allRates);

        List<ModelValidationResult> modelResults = List.of(
                kmeansResult, autoencoderResult, rfcResult
        );

        // 5. Count anomaly flags
        long flagCount = modelResults.stream()
                .filter(ModelValidationResult::isAnomaly)
                .count();

        boolean isAnomaly = flagCount >= CONSENSUS_THRESHOLD;

        // 6. Publish to Kafka if consensus anomaly
        boolean alertPublished = false;
        if (isAnomaly) {
            logger.warn("[VALIDATE] ANOMALY DETECTED — {}/{} models flagged {} on {}",
                    flagCount, modelResults.size(), request.getRate(), instrument);
            publishAlert(request, flagCount, modelResults);
            alertPublished = true;
        } else {
            logger.info("[VALIDATE] Rate validated as normal — {}/{} models flagged",
                    flagCount, modelResults.size());
        }

        // 7. Build response
        ValidateRateResponse response = new ValidateRateResponse();
        response.setInstrument(instrument);
        response.setDate(request.getDate());
        response.setRate(request.getRate());
        response.setAnomaly(isAnomaly);
        response.setModelsAgreed((int) flagCount);
        response.setTotalModels(modelResults.size());
        response.setConsensus(buildConsensusLabel(flagCount, modelResults.size()));
        response.setAlertPublished(alertPublished);
        response.setModelResults(modelResults);

        return response;
    }

    // ── K-Means ──────────────────────────────────────────────
    private ModelValidationResult callKMeans(String instrument,
                                             List<MarketRateDTO> rates) {
        logger.info("[VALIDATE] Calling K-Means for {}", instrument);
        try {
            MarketRateClusterRequest req = new MarketRateClusterRequest(
                    instrument, rates, 3, 2.0
            );
            Map result = webClient.post()
                    .uri(mlServiceUrl + "/kmeans/validate-rate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(req)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, r ->
                            r.bodyToMono(String.class)
                                    .flatMap(e -> Mono.error(
                                            new RuntimeException("KMeans error: " + e))))
                    .bodyToMono(Map.class)
                    .block();

            return new ModelValidationResult(
                    "kmeans",
                    Boolean.TRUE.equals(result.get("isAnomaly")),
                    toDouble(result.get("anomalyScore")),
                    toDouble(result.get("threshold"))
            );
        } catch (Exception e) {
            logger.error("[VALIDATE] K-Means failed: {}", e.getMessage());
            return new ModelValidationResult("kmeans", false, 0.0, 0.0);
        }
    }

    // ── Autoencoder ──────────────────────────────────────────
    private ModelValidationResult callAutoencoder(String instrument,
                                                  List<MarketRateDTO> rates) {
        logger.info("[VALIDATE] Calling Autoencoder for {}", instrument);
        try {
            MarketRateAutoencoderRequest req = new MarketRateAutoencoderRequest(
                    instrument, rates, 50, 16, 2.0
            );
            Map result = webClient.post()
                    .uri(mlServiceUrl + "/autoencoder/validate-rate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(req)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, r ->
                            r.bodyToMono(String.class)
                                    .flatMap(e -> Mono.error(
                                            new RuntimeException("Autoencoder error: " + e))))
                    .bodyToMono(Map.class)
                    .block();

            return new ModelValidationResult(
                    "autoencoder",
                    Boolean.TRUE.equals(result.get("isAnomaly")),
                    toDouble(result.get("anomalyScore")),
                    toDouble(result.get("threshold"))
            );
        } catch (Exception e) {
            logger.error("[VALIDATE] Autoencoder failed: {}", e.getMessage());
            return new ModelValidationResult("autoencoder", false, 0.0, 0.0);
        }
    }

    // ── RFC ──────────────────────────────────────────────────
    private ModelValidationResult callRFC(String instrument,
                                          List<MarketRateDTO> rates) {
        logger.info("[VALIDATE] Calling RFC for {}", instrument);
        try {
            MarketRateRFClassifierRequest req = new MarketRateRFClassifierRequest(
                    instrument, rates, 3, 2.0, 200, 42, 0.2
            );
            Map result = webClient.post()
                    .uri(mlServiceUrl + "/random-forest-classifier/validate-rate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(req)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, r ->
                            r.bodyToMono(String.class)
                                    .flatMap(e -> Mono.error(
                                            new RuntimeException("RFC error: " + e))))
                    .bodyToMono(Map.class)
                    .block();

            return new ModelValidationResult(
                    "rfc",
                    Boolean.TRUE.equals(result.get("isAnomaly")),
                    toDouble(result.get("anomalyScore")),
                    toDouble(result.get("threshold"))
            );
        } catch (Exception e) {
            logger.error("[VALIDATE] RFC failed: {}", e.getMessage());
            return new ModelValidationResult("rfc", false, 0.0, 0.0);
        }
    }

    // ── Kafka alert publisher ─────────────────────────────────
    private void publishAlert(ValidateRateRequest request,
                              long flagCount,
                              List<ModelValidationResult> modelResults) {
        if (kafkaTemplate == null) {
            logger.warn("[VALIDATE] Kafka not configured — alert not published");
            return;
        }
        try {
            List<String> flaggedModels = modelResults.stream()
                    .filter(ModelValidationResult::isAnomaly)
                    .map(ModelValidationResult::getModel)
                    .toList();

            ValidationAlertDTO alert = new ValidationAlertDTO();
            alert.setInstrument(request.getInstrument());
            alert.setDate(parseDate(request.getDate()));
            alert.setRate(request.getRate());
            alert.setFlaggedModels(flaggedModels);
            alert.setTotalModels(modelResults.size());
            alert.setFlagCount(flagCount);
            alert.setSeverity(flagCount == 3 ? "HIGH" :
                    flagCount == 2 ? "MED" : "LOW");

            MessageDTO message = new MessageDTO();
            message.setId("ALERT-" + System.currentTimeMillis());
            message.setKey("anomaly-detection-alert");
            message.setSource("validation-prediction-service");
            message.setTarget("alerting-service");
            message.setDescription("Anomaly detected by " + flagCount + " models");
            message.setTimestamp(LocalDateTime.now());

            DataDTO data = new DataDTO();
            data.setValidationAlertDTO(alert);
            message.setData(data);

            kafkaTemplate.send(ALERT_TOPIC, request.getInstrument(), message);

            logger.info("[VALIDATE] Alert published to {} — instrument={} severity={}",
                    ALERT_TOPIC, request.getInstrument(), alert.getSeverity());

        } catch (Exception e) {
            logger.error("[VALIDATE] Failed to publish alert: {}", e.getMessage());
        }
    }

    // ── Helpers ───────────────────────────────────────────────
    private String buildConsensusLabel(long flagCount, int total) {
        if (flagCount == total) return "HIGH CONFIDENCE ANOMALY";
        if (flagCount >= CONSENSUS_THRESHOLD) return "PROBABLE ANOMALY";
        return "VALID";
    }

    private double toDouble(Object val) {
        if (val == null) return 0.0;
        if (val instanceof Double d) return d;
        if (val instanceof Integer i) return i.doubleValue();
        if (val instanceof Number n) return n.doubleValue();
        return 0.0;
    }

    private double computeStd(double[] values, double mean) {
        if (values.length == 0) return 0.0;
        double variance = Arrays.stream(values)
                .map(v -> Math.pow(v - mean, 2))
                .average()
                .orElse(0.0);
        return Math.sqrt(variance);
    }

    private LocalDateTime parseDate(String date) {
        if (date == null || date.isBlank()) return LocalDateTime.now();

        List<DateTimeFormatter> formatters = List.of(
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd")
                        .withResolverStyle(ResolverStyle.SMART)
        );

        String cleaned = date.trim();

        for (DateTimeFormatter fmt : formatters) {
            try {
                if (fmt.toString().contains("HH")) {
                    return LocalDateTime.parse(cleaned, fmt);
                } else {
                    return LocalDate.parse(cleaned, fmt).atStartOfDay();
                }
            } catch (DateTimeParseException ignored) {

            }
        }

        logger.warn("[VALIDATE] Could not parse date '{}' — defaulting to now", date);
        return LocalDateTime.now();
    }
}