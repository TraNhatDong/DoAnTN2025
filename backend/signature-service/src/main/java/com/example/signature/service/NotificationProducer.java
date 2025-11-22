package com.example.signature.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class NotificationProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${notification.exchange}")
    private String exchange;

    @Value("${notification.routingKey}")
    private String routingKey;

    public NotificationProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendSignedMinutes(Map<String, Object> payload) {
        payload.put("type", "SIGNED_MINUTES");
        rabbitTemplate.convertAndSend(exchange, routingKey, payload);
        System.out.println("📤 Sent signed minutes to notification queue: " + payload);
    }
}