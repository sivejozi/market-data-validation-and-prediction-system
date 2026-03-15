package com.sive.validation.prediction.system.model.repository.markets.fx.rates;

import com.sive.validation.prediction.system.model.markets.fx.rates.FXRateModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FXRatesRepository extends JpaRepository<FXRateModel, Long> {
    List<FXRateModel> findByCurrencyPair(String currencyPair);
}
