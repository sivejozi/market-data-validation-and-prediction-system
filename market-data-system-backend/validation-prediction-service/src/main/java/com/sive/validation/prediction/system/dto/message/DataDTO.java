package com.sive.validation.prediction.system.dto.message;

import com.sive.validation.prediction.system.dto.markets.fx.FXRateDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DataDTO {
    FXRateDTO fxRateDTO;
    //there can be more objects here
}
