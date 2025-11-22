package com.example.notification.listener;

import com.example.notification.service.EmailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;

@Component
public class NotificationListener {

    private final EmailService emailService;
    private final ObjectMapper mapper = new ObjectMapper();
    private final RestTemplate restTemplate;

    public NotificationListener(EmailService emailService, RestTemplate restTemplate) {
        this.emailService = emailService;
        this.restTemplate = restTemplate;
    }

    @RabbitListener(queues = "${notification.queue}")
    public void handleNotification(String message) {
        try {
            Map<String, Object> payload = mapper.readValue(message, Map.class);
            String type = (String) payload.getOrDefault("type", "MEETING_MINUTES");
            String meetingId = (String) payload.get("meetingId");

            if (meetingId == null || meetingId.isEmpty()) {
                System.out.println("⚠️ No meetingId specified in message: " + message);
                return;
            }

            // Gọi Meeting-service để lấy participants
            String url = "http://meeting-service/meetings/" + meetingId + "/participants";
            List<Map<String, Object>> participants = restTemplate.getForObject(url, List.class);

            if (participants == null || participants.isEmpty()) {
                System.out.println("⚠️ No participants found for meeting " + meetingId);
                return;
            }

       // Gửi mail cho từng thành viên
for (Map<String, Object> p : participants) {
    String role = (String) p.get("role");
    String status = (String) p.get("status");
    String userId = String.valueOf(p.get("userId"));

    String url1 = "http://user-service/users/userDetail/" + userId;
    Map<String, Object> info = restTemplate.getForObject(url1, Map.class);

    if (info == null || info.isEmpty()) {
        System.out.println("⚠️ Không tìm thấy thông tin userId " + userId);
        continue;
    }

    String email = (String) info.get("email");
    if (email == null || email.isEmpty()) {
        System.out.println("⚠️ User " + userId + " không có email, bỏ qua.");
        continue;
    }

    // 🔹 Trường hợp biên bản được ký
    if ("SIGNED_MINUTES".equalsIgnoreCase(type)) {
        if ("TV".equalsIgnoreCase(role) && !"Pending".equalsIgnoreCase(status)) {
            handleSignedMinutesNotification(email, payload);
        }

    // 🔹 Trường hợp thêm thành viên mới (đang chờ duyệt)
    } else if ("ADD_PARTICIPATION".equalsIgnoreCase(type)) {
        if ("TV".equalsIgnoreCase(role) && "Pending".equalsIgnoreCase(status)) {
            handleAddParticipationNotification(email, payload);
        }

    // 🔹 Các thông báo cuộc họp khác
    } else {
        if ("TV".equalsIgnoreCase(role) && !"Pending".equalsIgnoreCase(status)) {
            handleMeetingMinutesNotification(email, payload);
        }
    }
}

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void handleSignedMinutesNotification(String to, Map<String, Object> payload) {
        String pdfLink = (String) payload.getOrDefault("pdfLink", "");
        String sigLink = (String) payload.getOrDefault("sigLink", "");


    String subject = "📄 Biên bản đã phát hành";
    StringBuilder body = new StringBuilder();
    body.append("Kính gửi Anh/Chị,\n\n");
    body.append("Biên bản họp với ID: ").append(payload.get("minuteId"))
        .append(" đã được phát hành.\n\n");

    if (pdfLink != null && !pdfLink.isEmpty()) {
        body.append("👉 Link PDF: ").append(pdfLink).append("\n");
    }
    if (sigLink != null && !sigLink.isEmpty()) {
        body.append("👉 Link file ký số: ").append(sigLink).append("\n");
    }

    body.append("\nTrân trọng,\nHệ thống quản lý cuộc họp");

    emailService.sendEmail(to, subject, body.toString());
    System.out.println("📩 Sent published minute notification to: " + to);
    }

    private void handleMeetingMinutesNotification(String to, Map<String, Object> payload) {
        String subject = (String) payload.getOrDefault("subject", "Thông báo cuộc họp");
        String body = (String) payload.getOrDefault("body", "Biên bản đã sẵn sàng.");

        emailService.sendEmail(to, subject, body);
        System.out.println("📩 Sent meeting notification to: " + to);
    }
   private void handleAddParticipationNotification(String to, Map<String, Object> payload) {
    try {
        String meetingId = (String) payload.get("meetingId");
        // 🔹 Gọi Meeting-service để lấy thông tin chi tiết cuộc họp
        String meetingUrl = "http://meeting-service/meetings/" + meetingId;
        Map<String, Object> meeting = restTemplate.getForObject(meetingUrl, Map.class);

        String meetingName = (String) meeting.getOrDefault("name", "Cuộc họp mới");
        String creator = (String) meeting.getOrDefault("creatorName", "Ban tổ chức");
        String meetingTime = (String) meeting.getOrDefault("startTime", "");
        String link = "http://meeting-portal/login";

        String subject = "📩 Thư mời tham gia cuộc họp: " + meetingName;

        StringBuilder body = new StringBuilder();
        body.append("Kính gửi Anh/Chị,\n\n");
        body.append("Anh/Chị đã được mời tham gia cuộc họp: ").append(meetingName).append(".\n");

        if (!meetingTime.isEmpty()) {
            body.append("🕒 Thời gian: ").append(meetingTime).append("\n");
        }

        body.append("👤 Người tạo: ").append(creator).append("\n\n");
        body.append("Vui lòng đăng nhập vào hệ thống để xác nhận tham gia hoặc từ chối lời mời.\n");
        body.append("👉 Truy cập: ").append(link).append("\n\n");
        body.append("Trân trọng,\nHệ thống Quản lý Cuộc họp");

        emailService.sendEmail(to, subject, body.toString());
        System.out.println("📩 Sent add participation notification to: " + to);

    } catch (Exception e) {
        System.err.println("❌ Lỗi khi gửi thông báo tham gia cuộc họp: " + e.getMessage());
    }
}


}
