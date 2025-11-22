package com.example.notification.config;

import org.springframework.amqp.core.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${notification.queue}")
    private String queueName;

    @Value("${notification.exchange}")
    private String exchangeName;

    @Value("${notification.routingKey}")
    private String routingKey;

    @Bean
    public Queue notificationQueue() {
        return new Queue(queueName, true); // durable = true
    }

    @Bean
    public DirectExchange notificationExchange() {
        return new DirectExchange(exchangeName);
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, DirectExchange notificationExchange) {
        return BindingBuilder
                .bind(notificationQueue)
                .to(notificationExchange)
                .with(routingKey);
    }
}
