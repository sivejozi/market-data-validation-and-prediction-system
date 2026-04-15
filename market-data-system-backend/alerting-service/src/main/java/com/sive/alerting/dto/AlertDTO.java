package com.sive.alerting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertDTO {
    private Long          id;
    private String        instrument;
    private String        date;
    private Double        rate;
    private String        severity;
    private Integer       modelsAgreed;
    private Integer       totalModels;
    private String        flaggedModels;
    private String        consensus;
    private LocalDateTime receivedAt;
}