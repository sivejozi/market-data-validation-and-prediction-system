package com.sive.validation.prediction.system.dto.message;

import com.sive.validation.prediction.system.dto.markets.fx.MarketRateDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DataDTO {
    MarketRateDTO marketRateDTO;
    //there can be more objects here
}
