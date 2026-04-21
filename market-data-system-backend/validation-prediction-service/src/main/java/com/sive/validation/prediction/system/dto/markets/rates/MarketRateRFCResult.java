package com.sive.validation.prediction.system.dto.markets.rates;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketRateRFCResult {
    private String              instrument;
    private Integer             totalRates;
    private Double              kMeansThreshold;
    private Integer             kMeansAnomalies;
    private Integer             classifierAnomalies;
    private RFCMetrics          metrics;
    private List<AnomalyDTO>    anomalies;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RFCMetrics {
        private Double          accuracy;
        private Double          precision;
        private Double          recall;
        private Double          f1Score;
        private List<List<Integer>> confusionMatrix;
    }
}
