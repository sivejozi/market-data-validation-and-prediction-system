package com.sive.validation.prediction.system.service.markets.fx.rates;

import com.sive.validation.prediction.system.dto.markets.fx.FXRateDTO;

import java.util.List;

public interface FXRateService {
    List<FXRateDTO> findAll();
    FXRateDTO saveFXRate(FXRateDTO fxRateDTO);
    FXRateDTO updateFXRate(Long id, FXRateDTO fxRateDTO);
    void deleteFXRate(Long id);
    FXRateDTO findById(Long id);
    List<FXRateDTO> findByCurrencyPair(String currencyPair);
}

