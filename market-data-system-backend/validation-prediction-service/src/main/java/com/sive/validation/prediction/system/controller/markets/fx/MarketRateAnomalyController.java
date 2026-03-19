package com.sive.validation.prediction.system.controller.markets.fx;

import com.sive.validation.prediction.system.dto.markets.fx.MarketRateClusterResult;
import com.sive.validation.prediction.system.service.markets.fx.rates.impl.MarketRateAnomalyServiceImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/market-rates/anomaly")
@Tag(name = "Market Rate Anomaly Detection", description = "Market Rate anomaly detection endpoints")
public class MarketRateAnomalyController {

    private final MarketRateAnomalyServiceImpl anomalyService;

    @Autowired
    public MarketRateAnomalyController(MarketRateAnomalyServiceImpl anomalyService) {
        this.anomalyService = anomalyService;
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
}
