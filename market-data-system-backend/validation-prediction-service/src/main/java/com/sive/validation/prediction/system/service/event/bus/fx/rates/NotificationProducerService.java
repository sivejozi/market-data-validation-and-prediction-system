/*
package com.sive.validation.prediction.system.service.event.bus.fx.rates;

import com.sive.validation.prediction.system.dto.message.MessageDTO;
import com.sive.validation.prediction.system.exception.message.MessageNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationProducerService {

    private final KafkaTemplate<String, MessageDTO> kafkaTemplate;

    private static final Logger logger = LoggerFactory.getLogger(NotificationProducerService.class);

    @Autowired
    public NotificationProducerService(@Qualifier("kafkaTemplate") KafkaTemplate<String, MessageDTO> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishEvent(MessageDTO message) {
        if (message == null) {
            throw new MessageNotFoundException();
        }
        kafkaTemplate.send("notification-topic", message.getKey(), message);
        logger.info("notification message sent to be published");
    }
}
*/
