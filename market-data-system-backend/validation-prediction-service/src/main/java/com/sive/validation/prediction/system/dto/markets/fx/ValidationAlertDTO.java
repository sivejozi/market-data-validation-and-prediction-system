package com.sive.validation.prediction.system.dto.markets.fx;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidationAlertDTO {
    private String instrument;
    private LocalDateTime date;
    private double rate;
    private List<String> flaggedModels;
    private long flagCount;
    private int totalModels;
    private String severity;
}
