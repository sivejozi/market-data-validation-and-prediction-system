package com.sive.validation.prediction.system.service.market.rates;

import com.sive.validation.prediction.system.dto.markets.rates.MarketRateDTO;

import java.util.List;

public interface MarketRateService {
    List<MarketRateDTO> findAll();

    MarketRateDTO saveMarketRate(MarketRateDTO MarketRateDTO);

    MarketRateDTO updateMarketRate(Long id, MarketRateDTO MarketRateDTO);

    void deleteMarketRate(Long id);

    MarketRateDTO findById(Long id);

    List<MarketRateDTO> findByInstrument(String instrument);
}

