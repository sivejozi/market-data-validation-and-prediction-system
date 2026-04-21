package com.sive.validation.prediction.system.dto.markets.rates;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketRatePredictionRequest {
    private String instrument;
    private List<MarketRateDTO> rates;
    private int numDays;
}
