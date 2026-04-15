package com.sive.alerting.consumer;

import com.sive.alerting.service.AlertService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

@Component
public class AlertKafkaConsumer {

    private static final Logger logger =
            LoggerFactory.getLogger(AlertKafkaConsumer.class);

    private final AlertService alertService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public AlertKafkaConsumer(AlertService alertService) {
        this.alertService = alertService;
    }

    @KafkaListener(
            topics  = "market.rates.alert",
            groupId = "alerting-service-group"
    )
    public void consume(String payload) {
        logger.info("[CONSUMER] Received alert: {}", payload);
        try {
            Map<String, Object> map = objectMapper.readValue(
                    payload, new TypeReference<Map<String, Object>>() {}
            );
            alertService.saveAlert(map);
        } catch (Exception e) {
            logger.error("[CONSUMER] Failed to parse payload: {}",
                    e.getMessage());
        }
    }
}