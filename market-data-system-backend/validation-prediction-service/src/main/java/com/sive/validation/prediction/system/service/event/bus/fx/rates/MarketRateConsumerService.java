package com.sive.validation.prediction.system.service.event.bus.fx.rates;

import com.sive.validation.prediction.system.dto.markets.fx.MarketRateDTO;
import com.sive.validation.prediction.system.dto.message.MessageDTO;
import com.sive.validation.prediction.system.exception.markets.fx.MarketRatePersistenceException;
import com.sive.validation.prediction.system.service.markets.fx.rates.MarketRateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class MarketRateConsumerService {

    private static final Logger logger = LoggerFactory.getLogger(MarketRateConsumerService.class);

    private final MarketRateService marketRateService;

    @Autowired
    public MarketRateConsumerService(MarketRateService marketRateService) {
        this.marketRateService = marketRateService;
    }

    @KafkaListener(topics = "market.rates.clean", groupId = "validation-prediction-group")
    public void consumeEvent(MessageDTO message) {
        logger.info("[KAFKA] Received message: key={}, source={}",
                message.getKey(), message.getSource());
        persistMarketRate(message);
    }

    private void persistMarketRate(MessageDTO message) {
        MarketRateDTO dto = message.getData().getMarketRateDTO();
        try {
            marketRateService.saveMarketRate(dto);
            logger.info("[PERSIST] Saved Market rate: {} - {}",
                    dto.getInstrument(), dto.getDate());
        } catch (MarketRatePersistenceException e) {
            logger.error("[PERSIST] Failed to save Market rate: {} - {} | Reason: {}",
                    e.getInstrument(), e.getDate(), e.getMessage());
        } catch (Exception e) {
            logger.error("[PERSIST] Unexpected error saving Market rate: {} - {} | Reason: {}",
                    dto.getInstrument(), dto.getDate(), e.getMessage(), e);
            throw new MarketRatePersistenceException(
                    dto.getInstrument(),
                    dto.getDate().toString(),
                    e
            );
        }
    }
}

