package com.sive.validation.prediction.system.dto.markets.fx;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidateRateResponse {
    private String instrument;
    private String date;
    private double rate;
    @JsonProperty("isAnomaly")
    private boolean isAnomaly;
    private int modelsAgreed;
    private int totalModels;
    private String consensus;
    private boolean alertPublished;
    private List<ModelValidationResult> modelResults;
}