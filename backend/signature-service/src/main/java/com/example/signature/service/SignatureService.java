package com.example.signature.service;

import com.example.signature.entity.Minute;
import com.example.signature.repository.MinuteRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.Signature;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class SignatureService {
    private final MinioService minioService;
    private final NotificationProducer notificationProducer;
    private final MinuteRepository minuteRepository;
    private final MeetingService meetingService;
    private final SummarizationService summarizationService;
    private final KeyPair keyPair;
    private final UserService userService;

    public SignatureService(
            MinioService minioService,
            NotificationProducer notificationProducer,
            MinuteRepository minuteRepository,
            MeetingService meetingService,
            UserService userService,
            SummarizationService summarizationService
    ) throws NoSuchAlgorithmException {
        this.minioService = minioService;
        this.notificationProducer = notificationProducer;
        this.minuteRepository = minuteRepository;
        this.meetingService = meetingService;
        this.summarizationService = summarizationService;
        this.userService = userService;
        this.keyPair = generateKeyPair();
    }

    // --- RSA KeyPair ---
    private KeyPair generateKeyPair() throws NoSuchAlgorithmException {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        return generator.generateKeyPair();
    }

    // ------------------- 1. Generate biên bản từ meeting + summary -------------------
    public Minute generateMinutePdf(String meetingId) throws Exception {
        // 1️⃣ Lấy và validate thông tin cuộc họp
        Map<String, Object> meeting = meetingService.getMeetingById(meetingId);
        if (meeting == null || meeting.isEmpty()) {
            throw new RuntimeException("Không tìm thấy thông tin cuộc họp: " + meetingId);
        }

        // 2️⃣ Lấy summary gần nhất
        Map<String, Object> summary = summarizationService.getSummaryByMeetingId(meetingId);
        if (summary == null || summary.isEmpty()) {
            throw new RuntimeException("Không tìm thấy bản tóm tắt cho cuộc họp: " + meetingId);
        }

        // 3️⃣ Chuẩn bị dữ liệu cho biên bản
        MinuteData minuteData = prepareMinuteData(meetingId, meeting, summary);

        // 4️⃣ Tạo PDF chuyên nghiệp
        byte[] pdfBytes = createProfessionalPdf(minuteData);

        // 5️⃣ Upload PDF lên MinIO
        String objectName = "minutes/" + meetingId + "/biên_bản_" + meetingId + "_" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("ddMMyyyy")) + ".pdf";
        minioService.uploadBytes(pdfBytes, objectName, "application/pdf");

        // 6️⃣ Lưu thông tin biên bản vào database
        return saveMinuteToDatabase(meetingId, objectName);
    }

    private MinuteData prepareMinuteData(String meetingId, Map<String, Object> meeting, Map<String, Object> summary) {
        MinuteData data = new MinuteData();
        
        // Thông tin cơ bản
        data.setMeetingId(meetingId);
        data.setMeetingName(Objects.toString(meeting.get("name"), "Chưa có tiêu đề"));
        data.setStartTime(formatDateTime(Objects.toString(meeting.get("startTime"), "")));
        data.setEndTime(formatDateTime(Objects.toString(meeting.get("endTime"), "")));
        data.setLocation(Objects.toString(meeting.get("location"), "Không xác định"));
        data.setChairperson(Objects.toString(meeting.get("chairperson"), "Không xác định"));
        data.setMinuteTaker(Objects.toString(meeting.get("secretary"), "Hệ thống"));
        
        // Phân loại thành viên
        List<Map<String, Object>> participants = (List<Map<String, Object>>) meeting.get("participants");
        data.setParticipants(prepareParticipants(participants));
        
        // Nội dung biên bản
        data.setSummaryContent(Objects.toString(summary.get("content"), "Chưa có nội dung tóm tắt"));
        data.setDecisions(extractDecisions(summary));
        data.setActionItems(extractActionItems(summary));
        data.setNextMeeting(Objects.toString(meeting.get("nextMeeting"), "Không có"));
        
        return data;
    }

    private List<ParticipantInfo> prepareParticipants(List<Map<String, Object>> participants) {
        List<ParticipantInfo> participantList = new ArrayList<>();
        if (participants != null) {
            for (Map<String, Object> p : participants) {
                ParticipantInfo info = new ParticipantInfo();
                info.setName(Objects.toString(p.get("name"), "N/A"));
                info.setRole(Objects.toString(p.get("role"), "N/A"));
                info.setDepartment(Objects.toString(p.get("department"), "N/A"));
                info.setStatus(Objects.toString(p.get("status"), "N/A"));
                participantList.add(info);
            }
        }
        return participantList;
    }

    private List<String> extractDecisions(Map<String, Object> summary) {
        Object decisions = summary.get("decisions");
        if (decisions instanceof List) {
            return (List<String>) decisions;
        }
        return new ArrayList<>();
    }

    private List<ActionItem> extractActionItems(Map<String, Object> summary) {
        List<ActionItem> actionItems = new ArrayList<>();
        Object items = summary.get("actionItems");
        if (items instanceof List) {
            for (Object item : (List<?>) items) {
                if (item instanceof Map) {
                    Map<?, ?> itemMap = (Map<?, ?>) item;
                    ActionItem actionItem = new ActionItem();
                    actionItem.setDescription(Objects.toString(itemMap.get("description"), ""));
                    actionItem.setAssignee(Objects.toString(itemMap.get("assignee"), ""));
                    actionItem.setDueDate(Objects.toString(itemMap.get("dueDate"), ""));
                    actionItems.add(actionItem);
                }
            }
        }
        return actionItems;
    }

   private byte[] createProfessionalPdf(MinuteData data) throws Exception {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    
    // Tạo document
    Document document = new Document(PageSize.A4);
    PdfWriter writer = PdfWriter.getInstance(document, baos);
    document.open();

    // Sử dụng font đơn giản hơn - không dùng IDENTITY_H
    Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD);
    Font subtitleFont = new Font(Font.HELVETICA, 14, Font.NORMAL);
    Font sectionFont = new Font(Font.HELVETICA, 12, Font.BOLD);
    Font normalFont = new Font(Font.HELVETICA, 10, Font.NORMAL);
    Font italicFont = new Font(Font.HELVETICA, 10, Font.ITALIC);
    Font smallFont = new Font(Font.HELVETICA, 8, Font.NORMAL);

    try {
        // Header
        addHeader(document, data, titleFont, subtitleFont);
        
        // Thông tin cuộc họp
        addMeetingInfo(document, data, sectionFont, normalFont);
        
        // Thành phần tham dự
        addParticipantsSection(document, data, sectionFont, normalFont);
        
        // Nội dung cuộc họp
        addMeetingContent(document, data, sectionFont, normalFont);
        
        // Quyết định và hành động
        addDecisionsAndActions(document, data, sectionFont, normalFont);
        
        // Phần kết thúc
        addClosingSection(document, data, italicFont, sectionFont, smallFont);
        
    } catch (Exception e) {
        throw new RuntimeException("Lỗi tạo PDF: " + e.getMessage(), e);
    } finally {
        document.close();
    }
    
    return baos.toByteArray();
}

    private void addHeader(Document document, MinuteData data, Font titleFont, Font subtitleFont) throws DocumentException {
        // Tiêu đề
        Paragraph title = new Paragraph("BIÊN BẢN CUỘC HỌP", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(10);
        document.add(title);

        Paragraph subtitle = new Paragraph(data.getMeetingName(), subtitleFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(20);
        document.add(subtitle);
    }

    private void addMeetingInfo(Document document, MinuteData data, Font sectionFont, Font normalFont) throws DocumentException {
        Paragraph sectionTitle = new Paragraph("THÔNG TIN CUỘC HỌP", sectionFont);
        sectionTitle.setSpacingAfter(8);
        document.add(sectionTitle);

        // Tạo bảng thông tin
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1, 3});

        addTableRow(table, "Mã cuộc họp:", data.getMeetingId(), normalFont);
        addTableRow(table, "Thời gian bắt đầu:", data.getStartTime(), normalFont);
        addTableRow(table, "Thời gian kết thúc:", data.getEndTime(), normalFont);
        addTableRow(table, "Địa điểm:", data.getLocation(), normalFont);
        addTableRow(table, "Chủ tọa:", data.getChairperson(), normalFont);
        addTableRow(table, "Người ghi biên bản:", data.getMinuteTaker(), normalFont);

        document.add(table);
        document.add(new Paragraph(" ")); // Khoảng cách
    }

    private void addParticipantsSection(Document document, MinuteData data, Font sectionFont, Font normalFont) throws DocumentException {
        Paragraph sectionTitle = new Paragraph("THÀNH PHẦN THAM DỰ", sectionFont);
        sectionTitle.setSpacingAfter(8);
        document.add(sectionTitle);

        // Tạo bảng thành viên
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3, 2, 2, 2});

        // Header row
        table.addCell(createCell("Họ và tên", true, normalFont));
        table.addCell(createCell("Chức vụ", true, normalFont));
        table.addCell(createCell("Phòng ban", true, normalFont));
        table.addCell(createCell("Tình trạng", true, normalFont));

        // Data rows
        for (ParticipantInfo participant : data.getParticipants()) {
            table.addCell(createCell(participant.getName(), false, normalFont));
            table.addCell(createCell(participant.getRole(), false, normalFont));
            table.addCell(createCell(participant.getDepartment(), false, normalFont));
            table.addCell(createCell(participant.getStatus(), false, normalFont));
        }

        document.add(table);
        document.add(new Paragraph(" "));
    }

    private void addMeetingContent(Document document, MinuteData data, Font sectionFont, Font normalFont) throws DocumentException {
        Paragraph sectionTitle = new Paragraph("NỘI DUNG CUỘC HỌP", sectionFont);
        sectionTitle.setSpacingAfter(8);
        document.add(sectionTitle);

        Paragraph content = new Paragraph(data.getSummaryContent(), normalFont);
        content.setAlignment(Element.ALIGN_JUSTIFIED);
        document.add(content);
        document.add(new Paragraph(" "));
    }

    private void addDecisionsAndActions(Document document, MinuteData data, Font sectionFont, Font normalFont) throws DocumentException {
        // Phần quyết định
        if (data.getDecisions() != null && !data.getDecisions().isEmpty()) {
            Paragraph decisionsTitle = new Paragraph("QUYẾT ĐỊNH/KẾT LUẬN", sectionFont);
            decisionsTitle.setSpacingAfter(8);
            document.add(decisionsTitle);

            for (int i = 0; i < data.getDecisions().size(); i++) {
                Paragraph decision = new Paragraph((i + 1) + ". " + data.getDecisions().get(i), normalFont);
                document.add(decision);
            }
            document.add(new Paragraph(" "));
        }

        // Phần hành động
        if (data.getActionItems() != null && !data.getActionItems().isEmpty()) {
            Paragraph actionsTitle = new Paragraph("CÔNG VIỆC/CÁC MỤC HÀNH ĐỘNG", sectionFont);
            actionsTitle.setSpacingAfter(8);
            document.add(actionsTitle);

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1, 3, 2, 2});

            table.addCell(createCell("STT", true, normalFont));
            table.addCell(createCell("Nội dung công việc", true, normalFont));
            table.addCell(createCell("Người phụ trách", true, normalFont));
            table.addCell(createCell("Hạn hoàn thành", true, normalFont));

            for (int i = 0; i < data.getActionItems().size(); i++) {
                ActionItem item = data.getActionItems().get(i);
                table.addCell(createCell(String.valueOf(i + 1), false, normalFont));
                table.addCell(createCell(item.getDescription(), false, normalFont));
                table.addCell(createCell(item.getAssignee(), false, normalFont));
                table.addCell(createCell(item.getDueDate(), false, normalFont));
            }

            document.add(table);
            document.add(new Paragraph(" "));
        }
    }

    private void addClosingSection(Document document, MinuteData data, Font italicFont, Font sectionFont, Font smallFont) throws DocumentException {
        Paragraph nextMeeting = new Paragraph("Cuộc họp kế tiếp: " + data.getNextMeeting(), italicFont);
        nextMeeting.setSpacingAfter(15);
        document.add(nextMeeting);

        Paragraph confirmation = new Paragraph("Biên bản đã được thông qua và xác nhận là đúng với nội dung cuộc họp.", sectionFont);
        confirmation.setSpacingAfter(20);
        document.add(confirmation);

        // Chữ ký
        PdfPTable signatureTable = new PdfPTable(2);
        signatureTable.setWidthPercentage(100);

        signatureTable.addCell(createSignatureCell("CHỦ TỌA", sectionFont));
        signatureTable.addCell(createSignatureCell("NGƯỜI GHI BIÊN BẢN", sectionFont));

        document.add(signatureTable);

        // Footer
        Paragraph footer = new Paragraph("Biên bản được tạo lúc: " + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), smallFont);
        footer.setAlignment(Element.ALIGN_RIGHT);
        footer.setSpacingBefore(20);
        document.add(footer);
    }

    // Helper methods
    private void addTableRow(PdfPTable table, String label, String value, Font font) {
        table.addCell(createCell(label, true, font));
        table.addCell(createCell(value, false, font));
    }

    private PdfPCell createCell(String content, boolean isHeader, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(content != null ? content : "", font));
        if (isHeader) {
            // Sử dụng màu xám nhạt thay vì BaseColor.LIGHT_GRAY
            cell.setGrayFill(0.9f); // Giá trị từ 0 (đen) đến 1 (trắng)
        }
        cell.setPadding(5);
        return cell;
    }

    private PdfPCell createSignatureCell(String title, Font font) {
        PdfPCell cell = new PdfPCell();
        cell.setBorderWidth(0);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        
        Paragraph p1 = new Paragraph(title, font);
        p1.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(p1);
        
        Paragraph p2 = new Paragraph("\n\n\n");
        cell.addElement(p2);
        
        Paragraph p3 = new Paragraph("(Ký và ghi rõ họ tên)", font);
        p3.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(p3);
        
        return cell;
    }

    private String formatDateTime(String dateTime) {
        if (dateTime == null || dateTime.isEmpty()) {
            return "Không xác định";
        }
        try {
            LocalDateTime dt = LocalDateTime.parse(dateTime, DateTimeFormatter.ISO_DATE_TIME);
            return dt.format(DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy"));
        } catch (Exception e) {
            return dateTime;
        }
    }

    private Minute saveMinuteToDatabase(String meetingId, String objectName) {
        Minute minute = new Minute();
        minute.setId(UUID.randomUUID().toString());
        minute.setMeetingId(meetingId);
        minute.setPdfPath(objectName);
        minute.setStatus("GENERATED");
        minute.setCreatedAt(LocalDateTime.now());
        // minute.setUpdatedAt(LocalDateTime.now()); // Bỏ comment nếu entity có trường này
        
        return minuteRepository.save(minute);
    }

    // ------------------- Các phương thức ký và xác thực -------------------
    public Minute signMinute(String minuteId) throws Exception {
        Minute minute = minuteRepository.findById(minuteId)
                .orElseThrow(() -> new RuntimeException("Minute not found"));

        if (!"GENERATED".equals(minute.getStatus())) {
            throw new RuntimeException("Chỉ có thể ký biên bản ở trạng thái GENERATED!");
        }

        File pdfFile = minioService.downloadToTemp(minute.getPdfPath());
        byte[] pdfData = Files.readAllBytes(pdfFile.toPath());

        byte[] signature = signData(pdfData);
        

        String sigObject = minute.getPdfPath() + ".sig";
        minioService.uploadBytes(signature, sigObject, "application/octet-stream");

        minute.setSigPath(sigObject);
        minute.setStatus("SIGNED");
        return minuteRepository.save(minute);
    }

    public Minute signAndStore(String meetingId, MultipartFile file) throws Exception {
        String objectName = "minutes/" + meetingId + "/" + file.getOriginalFilename();

        minioService.uploadBytes(file.getBytes(), objectName, "application/pdf");

        byte[] signature = signData(file.getBytes());
        String sigObject = objectName + ".sig";
        minioService.uploadBytes(signature, sigObject, "application/octet-stream");

        Minute minute = new Minute();
        minute.setId(UUID.randomUUID().toString());
        minute.setMeetingId(meetingId);
        minute.setPdfPath(objectName);
        minute.setSigPath(sigObject);
        minute.setStatus("SIGNED");

        return minuteRepository.save(minute);
    }

    private byte[] signData(byte[] data) throws Exception {
        Signature rsa = Signature.getInstance("SHA256withRSA");
        rsa.initSign(keyPair.getPrivate());
        rsa.update(data);
        return rsa.sign();
    }

    public boolean verify(String pdfPath, String sigPath) throws Exception {
        File pdfFile = minioService.downloadToTemp(pdfPath);
        File sigFile = minioService.downloadToTemp(sigPath);
        return verifyData(
                Files.readAllBytes(pdfFile.toPath()),
                Files.readAllBytes(sigFile.toPath())
        );
    }

    public boolean verify(MultipartFile pdfFile, MultipartFile sigFile) throws Exception {
        return verifyData(pdfFile.getBytes(), sigFile.getBytes());
    }

    private boolean verifyData(byte[] data, byte[] signature) throws Exception {
        Signature rsa = Signature.getInstance("SHA256withRSA");
        rsa.initVerify(keyPair.getPublic());
        rsa.update(data);
        return rsa.verify(signature);
    }

    public String exportPublicKey() {
        return Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());
    }

    public byte[] getFileBytes(String objectName) throws Exception {
        File file = minioService.downloadToTemp(objectName);
        return Files.readAllBytes(file.toPath());
    }

    public Minute publishMinute(String minuteId) throws Exception {
        Minute minute = minuteRepository.findById(minuteId)
                .orElseThrow(() -> new RuntimeException("Minute not found"));

        if (!"SIGNED".equals(minute.getStatus())) {
            throw new RuntimeException("Biên bản chưa được ký, không thể phát hành!");
        }

        minute.setStatus("PUBLISHED");
        minuteRepository.save(minute);

        Map<String, Object> message = new HashMap<>();
        message.put("minuteId", minute.getId());
        message.put("meetingId", minute.getMeetingId());
        message.put("pdfLink", minute.getPdfPath());
        message.put("sigLink", minute.getSigPath());
        message.put("status", "PUBLISHED");

        notificationProducer.sendSignedMinutes(message);

        return minute;
    }

    public Minute getMinuteById(String id) {
        Optional<Minute> optional = minuteRepository.findById(id);
        return optional.orElse(null);
    }

    public List<Minute> getAllMinutes() {
        return minuteRepository.findAll();
    }

    public List<Minute> getMinutesByMeeting(String meetingId) {
        return minuteRepository.findByMeetingId(meetingId);
    }
public Minute getLatestMinuteByMeeting(String meetingId) {
    return minuteRepository.findTopByMeetingIdOrderByCreatedAtDesc(meetingId)
            .orElseThrow(() -> new RuntimeException("No minutes found for meeting " + meetingId));
}

    // Data classes
    public static class MinuteData {
        private String meetingId;
        private String meetingName;
        private String startTime;
        private String endTime;
        private String location;
        private String chairperson;
        private String minuteTaker;
        private List<ParticipantInfo> participants;
        private String summaryContent;
        private List<String> decisions;
        private List<ActionItem> actionItems;
        private String nextMeeting;

        public String getMeetingId() { return meetingId; }
        public void setMeetingId(String meetingId) { this.meetingId = meetingId; }
        public String getMeetingName() { return meetingName; }
        public void setMeetingName(String meetingName) { this.meetingName = meetingName; }
        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }
        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getChairperson() { return chairperson; }
        public void setChairperson(String chairperson) { this.chairperson = chairperson; }
        public String getMinuteTaker() { return minuteTaker; }
        public void setMinuteTaker(String minuteTaker) { this.minuteTaker = minuteTaker; }
        public List<ParticipantInfo> getParticipants() { return participants; }
        public void setParticipants(List<ParticipantInfo> participants) { this.participants = participants; }
        public String getSummaryContent() { return summaryContent; }
        public void setSummaryContent(String summaryContent) { this.summaryContent = summaryContent; }
        public List<String> getDecisions() { return decisions; }
        public void setDecisions(List<String> decisions) { this.decisions = decisions; }
        public List<ActionItem> getActionItems() { return actionItems; }
        public void setActionItems(List<ActionItem> actionItems) { this.actionItems = actionItems; }
        public String getNextMeeting() { return nextMeeting; }
        public void setNextMeeting(String nextMeeting) { this.nextMeeting = nextMeeting; }
    }

    public static class ParticipantInfo {
        private String name;
        private String role;
        private String department;
        private String status;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class ActionItem {
        private String description;
        private String assignee;
        private String dueDate;

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getAssignee() { return assignee; }
        public void setAssignee(String assignee) { this.assignee = assignee; }
        public String getDueDate() { return dueDate; }
        public void setDueDate(String dueDate) { this.dueDate = dueDate; }
    }
}