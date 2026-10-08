package com.sive.validation.prediction.system.dto.markets.rates;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("kMeansThreshold")
    private Double              kMeansThreshold;
    @JsonProperty("kMeansAnomalies")
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
