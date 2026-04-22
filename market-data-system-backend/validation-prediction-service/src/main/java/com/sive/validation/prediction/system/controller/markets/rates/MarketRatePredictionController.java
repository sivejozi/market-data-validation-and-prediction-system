package com.sive.validation.prediction.system.controller.markets.rates;

import com.sive.validation.prediction.system.service.market.rates.impl.MarketRatePredictionServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/market-rates/prediction")
@Tag(name = "Market Rate Prediction",
        description = "Market Rate prediction endpoints")
public class MarketRatePredictionController {

    private final MarketRatePredictionServiceImpl predictionService;

    @Autowired
    public MarketRatePredictionController(
            MarketRatePredictionServiceImpl predictionService) {
        this.predictionService = predictionService;
    }

    // ── Linear Regression ─────────────────────────────────────
    @GetMapping("/linear-regression/{instrument}")
    @Operation(summary = "Predict rates using Linear Regression")
    public ResponseEntity<?> predictLR(
            @PathVariable String instrument,
            @RequestParam(defaultValue = "50") int numDays) {
        return ResponseEntity.ok(
                predictionService.predict(instrument, numDays));
    }

    @GetMapping("/linear-regression/{instrument}/plot")
    @Operation(summary = "Plot LR prediction")
    public ResponseEntity<byte[]> plotLR(
            @PathVariable String instrument,
            @RequestParam(defaultValue = "50") int numDays) {
        return ResponseEntity.ok()
                .header("Content-Type", "image/png")
                .body(predictionService.plot(instrument, numDays));
    }

    // ── Gradient Boosting ─────────────────────────────────────
    @GetMapping("/gradient-boosting/{instrument}")
    @Operation(summary = "Predict rates using Gradient Boosting")
    public ResponseEntity<?> predictGBR(
            @PathVariable String instrument,
            @RequestParam(defaultValue = "50") int numDays) {
        return ResponseEntity.ok(
                predictionService.predictGBR(instrument, numDays));
    }

    @GetMapping("/gradient-boosting/{instrument}/plot")
    @Operation(summary = "Plot GBR prediction")
    public ResponseEntity<byte[]> plotGBR(
            @PathVariable String instrument,
            @RequestParam(defaultValue = "50") int numDays) {
        return ResponseEntity.ok()
                .header("Content-Type", "image/png")
                .body(predictionService.plotGBR(instrument, numDays));
    }

    // ── Random Forest Regressor ───────────────────────────────
    @GetMapping("/random-forest/{instrument}")
    @Operation(summary = "Predict rates using Random Forest Regressor")
    public ResponseEntity<?> predictRFR(
            @PathVariable String instrument,
            @RequestParam(defaultValue = "50") int numDays) {
        return ResponseEntity.ok(
                predictionService.predictRFR(instrument, numDays));
    }

    @GetMapping("/random-forest/{instrument}/plot")
    @Operation(summary = "Plot RFR prediction")
    public ResponseEntity<byte[]> plotRFR(
            @PathVariable String instrument,
            @RequestParam(defaultValue = "50") int numDays) {
        return ResponseEntity.ok()
                .header("Content-Type", "image/png")
                .body(predictionService.plotRFR(instrument, numDays));
    }

    // ── All 3 models in one call ──────────────────────────────
    @GetMapping("/all/{instrument}")
    @Operation(summary = "Predict using all 3 models")
    public ResponseEntity<Map<String, Object>> predictAll(
            @PathVariable String instrument,
            @RequestParam(defaultValue = "50") int numDays) {

        Map<String, Object> results = new HashMap<>();

        try {
            results.put("lr", predictionService.predict(
                    instrument, numDays));
        } catch (Exception e) {
            results.put("lr", Map.of("error", e.getMessage()));
        }
        try {
            results.put("gbr", predictionService.predictGBR(
                    instrument, numDays));
        } catch (Exception e) {
            results.put("gbr", Map.of("error", e.getMessage()));
        }
        try {
            results.put("rfr", predictionService.predictRFR(
                    instrument, numDays));
        } catch (Exception e) {
            results.put("rfr", Map.of("error", e.getMessage()));
        }

        return ResponseEntity.ok(results);
    }
}