package com.sive.validation.prediction.system.dto.markets.rates;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModelValidationResult {
    private String model;
    private boolean isAnomaly;
    private double anomalyScore;
    private double threshold;
}
