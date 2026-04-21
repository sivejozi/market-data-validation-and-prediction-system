package com.sive.validation.prediction.system.model.repository.market.rates;

import com.sive.validation.prediction.system.model.market.rates.MarketRateModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketRatesRepository extends JpaRepository<MarketRateModel, Long> {
    List<MarketRateModel> findByInstrument(String instrument);
}
