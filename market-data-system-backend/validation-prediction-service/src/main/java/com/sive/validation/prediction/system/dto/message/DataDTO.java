package com.sive.validation.prediction.system.dto.message;

import com.sive.validation.prediction.system.dto.markets.fx.FXRateDTO;

public class DataDTO {
    FXRateDTO fxRateDTO;
    //there can be more objects here

    public DataDTO(FXRateDTO fxRateDTO) {
        this.fxRateDTO = fxRateDTO;
    }

    public DataDTO() {
    }

    public FXRateDTO getFxRateDTO() {
        return fxRateDTO;
    }

    public void setFxRateDTO(FXRateDTO fxRateDTO) {
        this.fxRateDTO = fxRateDTO;
    }
}
