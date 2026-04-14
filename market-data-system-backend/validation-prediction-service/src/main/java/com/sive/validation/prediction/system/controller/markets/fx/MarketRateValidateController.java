package com.sive.validation.prediction.system.controller.markets.fx;

import com.sive.validation.prediction.system.dto.markets.fx.ValidateRateRequest;
import com.sive.validation.prediction.system.dto.markets.fx.ValidateRateResponse;
import com.sive.validation.prediction.system.service.markets.fx.rates.impl.MarketRateValidateServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/market-rates")
@Tag(name = "Market Rate Validation",
        description = "Real-time market rate validation endpoints")
public class MarketRateValidateController {

    private final MarketRateValidateServiceImpl validateService;

    @Autowired
    public MarketRateValidateController(MarketRateValidateServiceImpl validateService) {
        this.validateService = validateService;
    }

    @PostMapping("/validate")
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
}