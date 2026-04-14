package com.sive.validation.prediction.system.dto.markets.fx;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketRateAutoencoderRequest {
    private String              instrument;
    private List<MarketRateDTO> rates;
    private int                 epochs                     = 50;
    private int                 batchSize                  = 16;
    private double              anomalyThresholdMultiplier = 2.0;
}