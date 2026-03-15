package com.sive.validation.prediction.system.service.event.bus.fx.rates;

import com.sive.validation.prediction.system.dto.markets.fx.FXRateDTO;
import com.sive.validation.prediction.system.dto.message.MessageDTO;
import com.sive.validation.prediction.system.exception.markets.fx.FXRatePersistenceException;
import com.sive.validation.prediction.system.service.markets.fx.rates.FXRateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class FxRateConsumerService {

    private static final Logger logger = LoggerFactory.getLogger(FxRateConsumerService.class);

    private final FXRateService fxRateService;

    @Autowired
    public FxRateConsumerService(FXRateService fxRateService) {
        this.fxRateService = fxRateService;
    }

    @KafkaListener(topics = "fx.rates.clean", groupId = "validation-prediction-group")
    public void consumeEvent(MessageDTO message) {
        logger.info("[KAFKA] Received message: key={}, source={}",
                message.getKey(), message.getSource());
        persistFXRate(message);
    }

    private void persistFXRate(MessageDTO message) {
        FXRateDTO dto = message.getData().getFxRateDTO();
        try {
            fxRateService.saveFXRate(dto);
            logger.info("[PERSIST] Saved FX rate: {} - {}",
                    dto.getCurrencyPair(), dto.getDate());
        } catch (FXRatePersistenceException e) {
            logger.error("[PERSIST] Failed to save FX rate: {} - {} | Reason: {}",
                    e.getCurrencyPair(), e.getDate(), e.getMessage());
        } catch (Exception e) {
            logger.error("[PERSIST] Unexpected error saving FX rate: {} - {} | Reason: {}",
                    dto.getCurrencyPair(), dto.getDate(), e.getMessage(), e);
            throw new FXRatePersistenceException(
                    dto.getCurrencyPair(),
                    dto.getDate().toString(),
                    e
            );
        }
    }
}

