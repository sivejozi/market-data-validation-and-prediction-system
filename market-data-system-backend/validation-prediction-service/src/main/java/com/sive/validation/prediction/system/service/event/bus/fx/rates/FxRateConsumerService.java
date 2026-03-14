package com.sive.validation.prediction.system.service.event.bus.fx.rates;

import com.sive.validation.prediction.system.dto.message.MessageDTO;
import com.sive.validation.prediction.system.service.email.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class FxRateConsumerService {

    private static final Logger logger = LoggerFactory.getLogger(FxRateConsumerService.class);

    private final EmailService emailService;

    public FxRateConsumerService(EmailService emailService) {
        this.emailService = emailService;
    }

    @KafkaListener(topics = "fx.rates.clean", groupId = "validation-prediction-group")
    public void consumeEvent(MessageDTO message) {
        logger.info("Received message: {}", message);
        persistFXRate(message);
    }

    private void persistFXRate(MessageDTO message) {
        logger.info("Received message from Kafka: {}", message);

        message.getData();
    }
}

