package com.sive.validation.prediction.system.model.market.rates;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "model_runs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModelRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "instrument")
    private String instrument;

    @Column(name = "model")
    private String model;

    @Column(name = "model_version")
    private String modelVersion;

    @Column(name = "run_date")
    private LocalDateTime runDate;

    @Column(name = "total_rates")
    private Integer totalRates;

    @Column(name = "total_anomalies")
    private Integer totalAnomalies;

    @Column(name = "anomaly_rate")
    private Double anomalyRate;

    @Column(name = "threshold")
    private Double threshold;

    @Column(name = "is_anomaly_flagged")
    private Boolean isAnomalyFlagged;

    @Column(name = "triggered_by")
    private String triggeredBy;
}
