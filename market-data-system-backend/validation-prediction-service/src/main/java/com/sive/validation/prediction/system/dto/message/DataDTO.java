package com.sive.validation.prediction.system.dto.message;

import com.sive.validation.prediction.system.dto.markets.rates.MarketRateDTO;
import com.sive.validation.prediction.system.dto.markets.rates.ValidationAlertDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DataDTO {
    MarketRateDTO marketRateDTO;
    ValidationAlertDTO validationAlertDTO;
    //there can be more objects here
}
