package com.sive.validation.prediction.system.service.market.rates.impl;

import com.sive.validation.prediction.system.dto.markets.rates.*;
import com.sive.validation.prediction.system.dto.message.DataDTO;
import com.sive.validation.prediction.system.dto.message.MessageDTO;
import com.sive.validation.prediction.system.service.market.rates.MarketRateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

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

    private final MarketRateService marketRateService;
    private final MlWebClientService mlWebClientService;
    private final KafkaTemplate<String, MessageDTO> kafkaTemplate;
    private final ModelRunServiceImpl modelRunService;

    @Autowired
    public MarketRateValidateServiceImpl(
            MarketRateService marketRateService,
            MlWebClientService mlWebClientService,
            KafkaTemplate<String, MessageDTO> kafkaTemplate,
            ModelRunServiceImpl modelRunService) {
        this.marketRateService = marketRateService;
        this.mlWebClientService = mlWebClientService;
        this.kafkaTemplate = kafkaTemplate;
        this.modelRunService = modelRunService;
    }

    public ValidateRateResponse validateRate(ValidateRateRequest request) {
        String instrument = request.getInstrument();

        // 1. Fetch full history
        List<MarketRateDTO> historicalRates =
                marketRateService.findByInstrument(instrument);

        if (historicalRates == null || historicalRates.isEmpty())
            throw new RuntimeException(
                    "No historical rates found for: " + instrument);

        logger.info("[VALIDATE] Fetched {} rates for {}",
                historicalRates.size(), instrument);

        // 2. Compute features
        int size = historicalRates.size();
        double lag1 = historicalRates.get(size - 1).getRate();
        double lag7 = historicalRates.get(Math.max(0, size - 7)).getRate();
        double rollingMean7 = historicalRates.subList(Math.max(0, size - 7), size)
                .stream().mapToDouble(MarketRateDTO::getRate)
                .average().orElse(request.getRate());
        double rollingStd7 = computeStd(
                historicalRates.subList(Math.max(0, size - 7), size)
                        .stream().mapToDouble(MarketRateDTO::getRate).toArray(),
                rollingMean7);
        double minRate = historicalRates.stream()
                .mapToDouble(MarketRateDTO::getRate).min().orElse(0);
        double maxRate = historicalRates.stream()
                .mapToDouble(MarketRateDTO::getRate).max().orElse(1);
        double rateScaled = (maxRate - minRate) == 0 ? 0 :
                (request.getRate() - minRate) / (maxRate - minRate);

        // 3. Build new rate
        MarketRateDTO newRate = new MarketRateDTO();
        newRate.setInstrument(instrument);
        newRate.setDate(parseDate(request.getDate()));
        newRate.setRate(request.getRate());
        newRate.setLag1(lag1);
        newRate.setLag7(lag7);
        newRate.setRollingMean7(rollingMean7);
        newRate.setRollingStd7(rollingStd7);
        newRate.setRateScaled(rateScaled);

        List<MarketRateDTO> allRates = new ArrayList<>(historicalRates);
        allRates.add(newRate);

        // 4. Call ML models
        ModelValidationResult kmeansResult = callKMeans(instrument, allRates);
        ModelValidationResult autoencoderResult = callAutoencoder(instrument, allRates);
        ModelValidationResult rfcResult = callRFC(instrument, allRates);

        List<ModelValidationResult> modelResults = List.of(
                kmeansResult, autoencoderResult, rfcResult);

        // 5. Record MLOps model runs
        modelRunService.recordRun(instrument, "kmeans",
                allRates.size(), kmeansResult.isAnomaly() ? 1 : 0,
                kmeansResult.getThreshold(), kmeansResult.isAnomaly(),
                "validate-endpoint");
        modelRunService.recordRun(instrument, "autoencoder",
                allRates.size(), autoencoderResult.isAnomaly() ? 1 : 0,
                autoencoderResult.getThreshold(), autoencoderResult.isAnomaly(),
                "validate-endpoint");
        modelRunService.recordRun(instrument, "rfc",
                allRates.size(), rfcResult.isAnomaly() ? 1 : 0,
                rfcResult.getThreshold(), rfcResult.isAnomaly(),
                "validate-endpoint");

        // 6. Consensus
        long flagCount = modelResults.stream()
                .filter(ModelValidationResult::isAnomaly).count();
        boolean isAnomaly = flagCount >= CONSENSUS_THRESHOLD;
        boolean alertPublished = false;

        if (isAnomaly) {
            publishAlert(request, flagCount, modelResults);
            alertPublished = true;
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

    // ── ML calls — now use MlWebClientService ─────────────────
    private ModelValidationResult callKMeans(
            String instrument, List<MarketRateDTO> rates) {
        try {
            Map result = mlWebClientService.post(
                    "/kmeans/validate-rate",
                    new MarketRateClusterRequest(instrument, rates, 3, 2.0),
                    Map.class);
            return new ModelValidationResult("kmeans",
                    Boolean.TRUE.equals(result.get("isAnomaly")),
                    mlWebClientService.toDouble(result.get("anomalyScore")),
                    mlWebClientService.toDouble(result.get("threshold")));
        } catch (Exception e) {
            logger.error("[VALIDATE] K-Means failed: {}", e.getMessage());
            return new ModelValidationResult("kmeans", false, 0.0, 0.0);
        }
    }

    private ModelValidationResult callAutoencoder(
            String instrument, List<MarketRateDTO> rates) {
        try {
            Map result = mlWebClientService.post(
                    "/autoencoder/validate-rate",
                    new MarketRateAutoencoderRequest(
                            instrument, rates, 50, 16, 2.0),
                    Map.class);
            return new ModelValidationResult("autoencoder",
                    Boolean.TRUE.equals(result.get("isAnomaly")),
                    mlWebClientService.toDouble(result.get("anomalyScore")),
                    mlWebClientService.toDouble(result.get("threshold")));
        } catch (Exception e) {
            logger.error("[VALIDATE] Autoencoder failed: {}", e.getMessage());
            return new ModelValidationResult("autoencoder", false, 0.0, 0.0);
        }
    }

    private ModelValidationResult callRFC(
            String instrument, List<MarketRateDTO> rates) {
        try {
            Map result = mlWebClientService.post(
                    "/random-forest-classifier/validate-rate",
                    new MarketRateRFClassifierRequest(
                            instrument, rates, 3, 2.0, 200, 42, 0.2),
                    Map.class);
            return new ModelValidationResult("rfc",
                    Boolean.TRUE.equals(result.get("isAnomaly")),
                    mlWebClientService.toDouble(result.get("anomalyScore")),
                    mlWebClientService.toDouble(result.get("threshold")));
        } catch (Exception e) {
            logger.error("[VALIDATE] RFC failed: {}", e.getMessage());
            return new ModelValidationResult("rfc", false, 0.0, 0.0);
        }
    }

    // ── Unchanged helpers ─────────────────────────────────────
    private void publishAlert(ValidateRateRequest request,
                              long flagCount,
                              List<ModelValidationResult> modelResults) {
        if (kafkaTemplate == null) {
            logger.warn("[VALIDATE] Kafka not configured");
            return;
        }
        try {
            List<String> flaggedModels = modelResults.stream()
                    .filter(ModelValidationResult::isAnomaly)
                    .map(ModelValidationResult::getModel).toList();

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
            logger.info("[VALIDATE] Alert published — instrument={} severity={}",
                    request.getInstrument(), alert.getSeverity());

        } catch (Exception e) {
            logger.error("[VALIDATE] Failed to publish alert: {}",
                    e.getMessage());
        }
    }

    private String buildConsensusLabel(long flagCount, int total) {
        if (flagCount == total) return "HIGH CONFIDENCE ANOMALY";
        if (flagCount >= CONSENSUS_THRESHOLD) return "PROBABLE ANOMALY";
        return "VALID";
    }

    private double computeStd(double[] values, double mean) {
        if (values.length == 0) return 0.0;
        double variance = Arrays.stream(values)
                .map(v -> Math.pow(v - mean, 2))
                .average().orElse(0.0);
        return Math.sqrt(variance);
    }

    private LocalDateTime parseDate(String date) {
        if (date == null || date.isBlank()) return LocalDateTime.now();
        List<DateTimeFormatter> formatters = List.of(
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd")
                        .withResolverStyle(ResolverStyle.SMART));
        for (DateTimeFormatter fmt : formatters) {
            try {
                if (fmt.toString().contains("HH"))
                    return LocalDateTime.parse(date.trim(), fmt);
                else
                    return LocalDate.parse(date.trim(), fmt).atStartOfDay();
            } catch (DateTimeParseException ignored) {
            }
        }
        logger.warn("[VALIDATE] Could not parse date '{}'", date);
        return LocalDateTime.now();
    }
}