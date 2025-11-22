package com.meetingservice.services;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class NotificationProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${notification.exchange}")
    private String exchange;

    @Value("${notification.key}")
    private String routingKey;

    public NotificationProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendNewParticipantsNotification(Long meetingId, int count) {
        Map<String, Object> payload = Map.of(
            "type", "ADD_PARTICIPATION", // để NotificationListener xử lý theo luồng mặc định
            "meetingId", meetingId.toString(),
            "subject", "🧑‍🤝‍🧑 Thông báo thêm thành viên mới",
            "body", "Đã thêm " + count + " thành viên mới vào cuộc họp ID: " + meetingId
        );

        rabbitTemplate.convertAndSend(exchange, routingKey, payload);
        System.out.println("📤 [MeetingService] Sent new participants message: " + payload);
    }
    public void sendNotification(Long meetingId) {
        Map<String, Object> payload = Map.of(
            "type", "ADD_PARTICIPATION", // để NotificationListener xử lý theo luồng mặc định
            "meetingId", meetingId.toString(),
            "subject", "🧑‍🤝‍🧑 Thông báo mời tham gia"
            
        );

        rabbitTemplate.convertAndSend(exchange, routingKey, payload);
        System.out.println("📤 [MeetingService] Sent new participants message: " + payload);
    }
         public void sendMeetingCancelledNotification(Long meetingId, String reason) {
        Map<String, Object> payload = Map.of(
            "type", "CANCEL_MEETING",
            "meetingId", meetingId.toString(),
            "subject", "❌ Cuộc họp đã bị hủy",
            "message", "Cuộc họp ID " + meetingId + " đã bị hủy. Lý do: " + reason
        );
        rabbitTemplate.convertAndSend(exchange, routingKey, payload);
        System.out.println("📤 [MeetingService] Sent new participants message: " + payload);
    }
    
}
