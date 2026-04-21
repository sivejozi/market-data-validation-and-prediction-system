package com.sive.validation.prediction.system.dto.markets.rates;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketRatePredictionResult {
    private String instrument;
    private Map<String, Double> metrics;
    private List<Map<String, Object>> predictions;
}
