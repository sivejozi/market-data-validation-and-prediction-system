package com.sive.validation.prediction.system.service.market.rates.impl;

import com.sive.validation.prediction.system.model.market.rates.ModelRun;
import com.sive.validation.prediction.system.model.repository.market.rates.ModelRunRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ModelRunServiceImpl {

    private static final Logger logger =
            LoggerFactory.getLogger(ModelRunServiceImpl.class);

    private final ModelRunRepository modelRunRepository;

    @Autowired
    public ModelRunServiceImpl(ModelRunRepository modelRunRepository) {
        this.modelRunRepository = modelRunRepository;
    }

    public void recordRun(String instrument, String model,
                          int totalRates, int totalAnomalies,
                          double threshold, boolean isAnomalyFlagged,
                          String triggeredBy) {
        try {
            double anomalyRate = totalRates > 0
                    ? (double) totalAnomalies / totalRates * 100
                    : 0.0;

            ModelRun run = new ModelRun();
            run.setInstrument(instrument);
            run.setModel(model);
            run.setModelVersion("1.0.0");
            run.setRunDate(LocalDateTime.now());
            run.setTotalRates(totalRates);
            run.setTotalAnomalies(totalAnomalies);
            run.setAnomalyRate(anomalyRate);
            run.setThreshold(threshold);
            run.setIsAnomalyFlagged(isAnomalyFlagged);
            run.setTriggeredBy(triggeredBy);

            modelRunRepository.save(run);

            logger.info("[MLOPS] Run recorded — instrument={} model={} anomalies={} rate={:.2f}%",
                    instrument, model,
                    totalAnomalies, anomalyRate);

        } catch (Exception e) {
            logger.error("[MLOPS] Failed to record run: {}",
                    e.getMessage());
        }
    }

    public List<ModelRun> getAllRuns() {
        return modelRunRepository.findAllByOrderByRunDateDesc();
    }

    public List<ModelRun> getRunsByInstrument(String instrument) {
        return modelRunRepository
                .findByInstrumentOrderByRunDateDesc(instrument);
    }

    public List<ModelRun> getRunsByModel(String model) {
        return modelRunRepository
                .findByModelOrderByRunDateDesc(model);
    }

    public List<ModelRun> getRunsByInstrumentAndModel(
            String instrument, String model) {
        return modelRunRepository
                .findByInstrumentAndModelOrderByRunDateDesc(
                        instrument, model);
    }
}
