package com.sive.validation.prediction.system.service.market.rates.impl;

import com.sive.validation.prediction.system.dto.markets.rates.MarketRateClusterResult;
import com.sive.validation.prediction.system.dto.markets.rates.MarketRateDTO;
import com.sive.validation.prediction.system.dto.markets.rates.MarketRateRFCResult;
import com.sive.validation.prediction.system.service.market.rates.MarketRateService;
import com.sive.validation.prediction.system.util.RateMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MarketRateAnomalyServiceImpl {

    private static final Logger logger =
            LoggerFactory.getLogger(MarketRateAnomalyServiceImpl.class);

    private final MarketRateService marketRateService;
    private final MlWebClientService mlWebClientService;
    private final ModelRunServiceImpl modelRunService;

    @Autowired
    public MarketRateAnomalyServiceImpl(
            MarketRateService marketRateService,
            MlWebClientService mlWebClientService,
            ModelRunServiceImpl modelRunService) {
        this.marketRateService = marketRateService;
        this.mlWebClientService = mlWebClientService;
        this.modelRunService = modelRunService;
    }

    @Cacheable(value = "kmeans", key = "#instrument")
    public MarketRateClusterResult detectAnomalies(
            String instrument, int numClusters, double threshold) {

        List<MarketRateDTO> rates = fetchRates(instrument);

        Map<String, Object> request = buildRequest(instrument, rates,
                Map.of("numClusters", numClusters,
                        "anomalyThresholdMultiplier", threshold));

        MarketRateClusterResult result = mlWebClientService.post(
                "/kmeans/detect-anomalies", request,
                MarketRateClusterResult.class);

        assert result != null;
        logger.info("[ANOMALY] K-Means detected {} anomalies for {}",
                result.getTotalAnomalies(), instrument);

        modelRunService.recordRun(instrument, "kmeans",
                rates.size(), result.getTotalAnomalies(),
                result.getThreshold(), result.getTotalAnomalies() > 0,
                "models-screen");

        return result;
    }

    public byte[] detectAnomaliesPlot(
            String instrument, int numClusters, double threshold) {

        List<MarketRateDTO> rates = fetchRates(instrument);
        Map<String, Object> request = buildRequest(instrument, rates,
                Map.of("numClusters", numClusters,
                        "anomalyThresholdMultiplier", threshold));

        return mlWebClientService.postForBytes(
                "/kmeans/detect-anomalies-plot", request);
    }

    @Cacheable(value = "autoencoder", key = "#instrument")
    public MarketRateClusterResult detectAnomaliesAutoencoder(
            String instrument, int epochs,
            int batchSize, double threshold) {

        List<MarketRateDTO> rates = fetchRates(instrument);
        Map<String, Object> request = buildRequest(instrument, rates,
                Map.of("epochs", epochs,
                        "batchSize", batchSize,
                        "anomalyThresholdMultiplier", threshold));

        MarketRateClusterResult result = mlWebClientService.post(
                "/autoencoder/detect-anomalies", request,
                MarketRateClusterResult.class);

        assert result != null;
        logger.info("[ANOMALY] Autoencoder detected {} anomalies for {}",
                result.getTotalAnomalies(), instrument);

        modelRunService.recordRun(instrument, "autoencoder",
                rates.size(), result.getTotalAnomalies(),
                result.getThreshold(), result.getTotalAnomalies() > 0,
                "models-screen");

        return result;
    }

    public byte[] detectAnomaliesAutoencoderPlot(
            String instrument, int epochs,
            int batchSize, double threshold) {

        List<MarketRateDTO> rates = fetchRates(instrument);
        Map<String, Object> request = buildRequest(instrument, rates,
                Map.of("epochs", epochs,
                        "batchSize", batchSize,
                        "anomalyThresholdMultiplier", threshold));

        return mlWebClientService.postForBytes(
                "/autoencoder/detect-anomalies-plot", request);
    }

    @Cacheable(value = "rfc", key = "#instrument")
    public MarketRateRFCResult detectAnomaliesRFC(
            String instrument, int numClusters, double threshold,
            int nEstimators, int randomState, double testSize) {

        List<MarketRateDTO> rates = fetchRates(instrument);
        Map<String, Object> request = buildRequest(instrument, rates,
                Map.of("numClusters", numClusters,
                        "anomalyThresholdMultiplier", threshold,
                        "nEstimators", nEstimators,
                        "randomState", randomState,
                        "testSize", testSize));

        MarketRateRFCResult result = mlWebClientService.post(
                "/random-forest-classifier/classify-anomalies",
                request, MarketRateRFCResult.class);

        assert result != null;
        logger.info("[ANOMALY] RFC detected {} anomalies for {}",
                result.getClassifierAnomalies(), instrument);

        modelRunService.recordRun(instrument, "rfc",
                rates.size(), result.getClassifierAnomalies(),
                result.getKMeansThreshold(),
                result.getClassifierAnomalies() > 0,
                "models-screen");

        return result;
    }

    public byte[] detectAnomaliesRFCPlot(
            String instrument, int numClusters, double threshold,
            int nEstimators, int randomState, double testSize) {

        List<MarketRateDTO> rates = fetchRates(instrument);
        Map<String, Object> request = buildRequest(instrument, rates,
                Map.of("numClusters", numClusters,
                        "anomalyThresholdMultiplier", threshold,
                        "nEstimators", nEstimators,
                        "randomState", randomState,
                        "testSize", testSize));

        return mlWebClientService.postForBytes(
                "/random-forest-classifier/classify-anomalies-plot",
                request);
    }

    // ── Shared helpers ────────────────────────────────────────
    private List<MarketRateDTO> fetchRates(String instrument) {
        List<MarketRateDTO> rates =
                marketRateService.findByInstrument(instrument);
        if (rates == null || rates.isEmpty())
            throw new RuntimeException(
                    "No rates found for instrument: " + instrument);
        logger.info("[ANOMALY] Fetched {} rates for {}",
                rates.size(), instrument);
        return rates;
    }

    private Map<String, Object> buildRequest(
            String instrument,
            List<MarketRateDTO> rates,
            Map<String, Object> params) {
        Map<String, Object> request = new HashMap<>();
        request.put("instrument", instrument);
        request.put("rates", RateMapper.toRateMapList(rates));
        request.putAll(params);
        return request;
    }
}