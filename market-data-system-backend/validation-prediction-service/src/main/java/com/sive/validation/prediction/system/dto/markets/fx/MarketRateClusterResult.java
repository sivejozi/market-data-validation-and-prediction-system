package com.sive.validation.prediction.system.dto.markets.fx;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketRateClusterResult {
    private String instrument;
    private Integer totalRates;
    private Integer numClusters;
    private Double threshold;
    private Integer totalAnomalies;
    private List<AnomalyDTO> anomalies;
    private List<List<Double>> clusterCentres;
}
