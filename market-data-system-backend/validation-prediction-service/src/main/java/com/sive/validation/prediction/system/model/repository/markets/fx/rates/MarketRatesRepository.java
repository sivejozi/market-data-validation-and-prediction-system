package com.sive.validation.prediction.system.model.repository.markets.fx.rates;

import com.sive.validation.prediction.system.model.markets.fx.rates.MarketRateModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketRatesRepository extends JpaRepository<MarketRateModel, Long> {
    List<MarketRateModel> findByInstrument(String instrument);
}
