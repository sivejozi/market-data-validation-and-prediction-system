package com.sive.validation.prediction.system.dto.markets.fx;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnomalyDTO {
    private String date;
    private Double rate;
    private Integer cluster;
    private Double anomalyScore;
}