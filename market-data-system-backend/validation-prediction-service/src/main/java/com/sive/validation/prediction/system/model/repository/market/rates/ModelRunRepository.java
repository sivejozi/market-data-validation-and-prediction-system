package com.sive.validation.prediction.system.model.repository.market.rates;

import com.sive.validation.prediction.system.model.market.rates.ModelRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModelRunRepository
        extends JpaRepository<ModelRun, Long> {

    List<ModelRun> findByInstrumentOrderByRunDateDesc(
            String instrument);

    List<ModelRun> findByModelOrderByRunDateDesc(
            String model);

    List<ModelRun> findByInstrumentAndModelOrderByRunDateDesc(
            String instrument, String model);

    List<ModelRun> findAllByOrderByRunDateDesc();
}
