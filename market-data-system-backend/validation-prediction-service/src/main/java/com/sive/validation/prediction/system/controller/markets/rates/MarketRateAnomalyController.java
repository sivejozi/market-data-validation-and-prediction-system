package com.sive.validation.prediction.system.controller.markets.rates;

import com.sive.validation.prediction.system.dto.markets.rates.MarketRateClusterResult;
import com.sive.validation.prediction.system.dto.markets.rates.MarketRateRFCResult;
import com.sive.validation.prediction.system.dto.markets.rates.ValidateRateRequest;
import com.sive.validation.prediction.system.dto.markets.rates.ValidateRateResponse;
import com.sive.validation.prediction.system.service.market.rates.impl.MarketRateAnomalyServiceImpl;
import com.sive.validation.prediction.system.service.market.rates.impl.MarketRateValidateServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/market-rates/anomaly")
@Tag(name = "Market Rate Anomaly Detection", description = "Market Rate anomaly detection endpoints")
public class MarketRateAnomalyController {

    private final MarketRateAnomalyServiceImpl anomalyService;
    private final MarketRateValidateServiceImpl validateService;

    @Autowired
    public MarketRateAnomalyController(MarketRateAnomalyServiceImpl anomalyService, MarketRateValidateServiceImpl validateService) {
        this.anomalyService = anomalyService;
        this.validateService = validateService;
    }

    // Needs auth
    @GetMapping("/kmeans/{instrument}")
    public ResponseEntity<MarketRateClusterResult> detectAnomalies(
            @PathVariable String instrument,
            @RequestParam(defaultValue = "3") int numClusters,
            @RequestParam(defaultValue = "2.0") double threshold) {

        return ResponseEntity.ok(
                anomalyService.detectAnomalies(instrument, numClusters, threshold)
        );
    }

    // Needs auth
    @GetMapping("/kmeans/{instrument}/plot")
    public ResponseEntity<byte[]> detectAnomaliesPlot(
            @PathVariable String instrument,
            @RequestParam(defaultValue = "3") int numClusters,
            @RequestParam(defaultValue = "2.0") double threshold) {

        byte[] plot = anomalyService.detectAnomaliesPlot(
                instrument, numClusters, threshold
        );
        return ResponseEntity.ok()
                .header("Content-Type", "image/png")
                .body(plot);
    }

    @PostMapping("")
    @Operation(
            summary     = "Validate a single market rate",
            description = "Validates an incoming rate against K-Means, " +
                    "Autoencoder and RFC models. Publishes to " +
                    "market.rates.alert if 2+ models flag anomaly."
    )
    public ResponseEntity<ValidateRateResponse> validateRate(
            @RequestBody ValidateRateRequest request) {
        return ResponseEntity.ok(validateService.validateRate(request));
    }

    // ── Autoencoder ──────────────────────────────────────────────
    @GetMapping("/autoencoder/{instrument}")
    public ResponseEntity<MarketRateClusterResult> detectAnomaliesAutoencoder(
            @PathVariable String instrument,
            @RequestParam(defaultValue = "50")  int epochs,
            @RequestParam(defaultValue = "16")  int batchSize,
            @RequestParam(defaultValue = "2.0") double threshold) {

        return ResponseEntity.ok(
                anomalyService.detectAnomaliesAutoencoder(
                        instrument, epochs, batchSize, threshold)
        );
    }

    @GetMapping("/autoencoder/{instrument}/plot")
    public ResponseEntity<byte[]> detectAnomaliesAutoencoderPlot(
            @PathVariable String instrument,
            @RequestParam(defaultValue = "50")  int epochs,
            @RequestParam(defaultValue = "16")  int batchSize,
            @RequestParam(defaultValue = "2.0") double threshold) {

        byte[] plot = anomalyService.detectAnomaliesAutoencoderPlot(
                instrument, epochs, batchSize, threshold
        );
        return ResponseEntity.ok()
                .header("Content-Type", "image/png")
                .body(plot);
    }

    // ── RFC ──────────────────────────────────────────────────────
    @GetMapping("/rfc/{instrument}")
    public ResponseEntity<MarketRateRFCResult> detectAnomaliesRFC(
            @PathVariable String instrument,
            @RequestParam(defaultValue = "3")   int numClusters,
            @RequestParam(defaultValue = "2.0") double threshold,
            @RequestParam(defaultValue = "200") int nEstimators,
            @RequestParam(defaultValue = "42")  int randomState,
            @RequestParam(defaultValue = "0.2") double testSize) {

        return ResponseEntity.ok(
                anomalyService.detectAnomaliesRFC(
                        instrument, numClusters, threshold,
                        nEstimators, randomState, testSize)
        );
    }

    @GetMapping("/rfc/{instrument}/plot")
    public ResponseEntity<byte[]> detectAnomaliesRFCPlot(
            @PathVariable String instrument,
            @RequestParam(defaultValue = "3")   int numClusters,
            @RequestParam(defaultValue = "2.0") double threshold,
            @RequestParam(defaultValue = "200") int nEstimators,
            @RequestParam(defaultValue = "42")  int randomState,
            @RequestParam(defaultValue = "0.2") double testSize) {

        byte[] plot = anomalyService.detectAnomaliesRFCPlot(
                instrument, numClusters, threshold,
                nEstimators, randomState, testSize
        );
        return ResponseEntity.ok()
                .header("Content-Type", "image/png")
                .body(plot);
    }
}
