package com.sive.validation.prediction.system.dto.markets.fx;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidateRateRequest {
    private String instrument;
    private String date;
    private double rate;
}