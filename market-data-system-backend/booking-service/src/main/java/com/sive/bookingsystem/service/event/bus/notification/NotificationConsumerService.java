package com.sive.bookingsystem.service.event.bus.notification;

import com.sive.bookingsystem.dto.message.MessageDTO;
import com.sive.bookingsystem.service.email.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationConsumerService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationConsumerService.class);

    private final EmailService emailService;

    public NotificationConsumerService(EmailService emailService) {
        this.emailService = emailService;
    }

    @KafkaListener(topics = "notification-topic", groupId = "notification-group")
    public void consumeEvent(MessageDTO message) {
        logger.info("Received message: {}", message);
        issueNotification(message);
    }

    private void issueNotification(MessageDTO message) {
        logger.info("Received message from Kafka: {}", message);

        String subject = "Appointment Confirmation: " + message.getKey();
        String body = "Dear " + message.getData().getAppointment().getCustomerName() + ",\n\n" +
                message.getData().getAppointment() + "\n\n" +
                "Thank you for booking with us.\n\n" +
                "Kind regards,\nBooking Team";

        // Simulate sending email
        emailService.sendEmail(message.getData().getAppointment().getCustomerEmail(), subject, body);
    }
}

