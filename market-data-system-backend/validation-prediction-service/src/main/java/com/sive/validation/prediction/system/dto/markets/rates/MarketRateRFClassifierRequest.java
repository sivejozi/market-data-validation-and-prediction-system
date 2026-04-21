package com.sive.validation.prediction.system.dto.markets.rates;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketRateRFClassifierRequest {
    private String              instrument;
    private List<MarketRateDTO> rates;
    private int                 numClusters                = 3;
    private double              anomalyThresholdMultiplier = 2.0;
    private int                 nEstimators                = 200;
    private int                 randomState                = 42;
    private double              testSize                   = 0.2;
}