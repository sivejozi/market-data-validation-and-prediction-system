package com.sive.validation.prediction.system.controller.markets.fx;

import com.sive.validation.prediction.system.service.markets.fx.rates.impl.MarketRatePredictionServiceImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/market-rates/prediction")
@Tag(name = "Market Rate Prediction", description = "Market Rate prediction endpoints")
public class MarketRatePredictionController {

    private final MarketRatePredictionServiceImpl predictionService;

    @Autowired
    public MarketRatePredictionController(MarketRatePredictionServiceImpl predictionService) {
        this.predictionService = predictionService;
    }

    // Needs auth
    @GetMapping("/linear-regression/{instrument}")
    public ResponseEntity<?> predictByInstrument(
            @PathVariable String instrument,
            @RequestParam(defaultValue = "20") int numDays) {
        return ResponseEntity.ok(predictionService.predict(instrument, numDays));
    }

    // Needs auth
    @GetMapping("/linear-regression/{instrument}/plot")
    public ResponseEntity<byte[]> plotByInstrument(
            @PathVariable String instrument,
            @RequestParam(defaultValue = "20") int numDays) {
        byte[] plot = predictionService.plot(instrument, numDays);
        return ResponseEntity.ok()
                .header("Content-Type", "image/png")
                .body(plot);
    }
}
