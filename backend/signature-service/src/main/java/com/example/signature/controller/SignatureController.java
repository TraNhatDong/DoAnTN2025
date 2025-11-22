package com.example.signature.controller;

import com.example.signature.entity.Minute;
import com.example.signature.service.SignatureService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/sign")
public class SignatureController {

    private final SignatureService signatureService;

    public SignatureController(SignatureService signatureService) {
        this.signatureService = signatureService;
    }

    // ------------------- 1. Sinh biên bản PDF từ Meeting + Summary -------------------
    @PostMapping("/generate/{meetingId}")
    public ResponseEntity<?> generateMinute(@PathVariable String meetingId) {
        try {
            Minute minute = signatureService.generateMinutePdf(meetingId);
            return ResponseEntity.ok(
                    Map.of("message", "✅ Biên bản đã được tạo!",
                           "minuteId", minute.getId(),
                           "meetingId", meetingId,
                           "status", minute.getStatus(),
                           "pdfPath", minute.getPdfPath())
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }

    // ------------------- 2. Ký biên bản đã generate -------------------
    @PostMapping("/sign/{minuteId}")
    public ResponseEntity<?> signMinute(@PathVariable String minuteId) {
        try {
            Minute minute = signatureService.signMinute(minuteId);
            return ResponseEntity.ok(
                    Map.of("message", "✅ Biên bản đã được ký!",
                           "minuteId", minute.getId(),
                           "meetingId", minute.getMeetingId(),
                           "status", minute.getStatus(),
                           "pdfPath", minute.getPdfPath(),
                           "sigPath", minute.getSigPath())
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }

    // ------------------- 3. Upload + ký ngay file PDF -------------------
    @PostMapping("/pdf")
    public ResponseEntity<Minute> signPdf(@RequestParam String meetingId,
                                          @RequestParam("file") MultipartFile file) throws Exception {
        Minute minute = signatureService.signAndStore(meetingId, file);
        return ResponseEntity.ok(minute);
    }

    // ------------------- 4. Verify từ MinIO (path) -------------------
    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam String pdfPath,
                                    @RequestParam String sigPath) throws Exception {
        boolean valid = signatureService.verify(pdfPath, sigPath);
        return ResponseEntity.ok(
                Map.of("valid", valid,
                       "pdfPath", pdfPath,
                       "sigPath", sigPath)
        );
    }

    // ------------------- 5. Verify từ upload file -------------------
    @PostMapping("/verify/upload")
    public ResponseEntity<Map<String, Object>> verifyUploadedFiles(
            @RequestParam("pdfFile") MultipartFile pdfFile,
            @RequestParam("sigFile") MultipartFile sigFile
    ) {
        try {
            boolean valid = signatureService.verify(pdfFile, sigFile);
            Map<String, Object> result = new HashMap<>();
            result.put("valid", valid);
            result.put("message", valid ? "Chữ ký hợp lệ, file chưa bị thay đổi."
                                        : "Chữ ký KHÔNG hợp lệ hoặc file đã bị chỉnh sửa.");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("valid", false);
            error.put("message", "Lỗi khi kiểm chứng: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ------------------- 6. Xuất public key -------------------
    @GetMapping("/public-key")
    public ResponseEntity<String> exportPublicKey() throws Exception {
        return ResponseEntity.ok(signatureService.exportPublicKey());
    }

    // ------------------- 7. Download file từ MinIO -------------------
    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadFile(@RequestParam String objectName) {
        try {
            byte[] fileData = signatureService.getFileBytes(objectName);
            String fileName = objectName.substring(objectName.lastIndexOf("/") + 1);

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                    .body(fileData);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(("Lỗi khi tải file: " + e.getMessage()).getBytes());
        }
    }

    // ------------------- 8. Phát hành biên bản đã ký -------------------
    @PostMapping("/release/{minuteId}")
    public ResponseEntity<?> releaseSignedMinutes(@PathVariable String minuteId) {
        try {
            Minute minute = signatureService.publishMinute(minuteId);
            return ResponseEntity.ok(
                    Map.of("message", "✅ Biên bản đã được phát hành!",
                           "minuteId", minute.getId(),
                           "meetingId", minute.getMeetingId(),
                           "status", minute.getStatus(),
                           "pdfPath", minute.getPdfPath(),
                           "sigPath", minute.getSigPath())
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }
    // ------------------- 9. Lấy thông tin 1 biên bản theo ID -------------------
@GetMapping("/{minuteId}")
public ResponseEntity<?> getMinuteById(@PathVariable String minuteId) {
    try {
        Minute minute = signatureService.getMinuteById(minuteId);
        if (minute == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Không tìm thấy biên bản với ID: " + minuteId));
        }
        return ResponseEntity.ok(minute);
    } catch (Exception e) {
        return ResponseEntity.status(500)
                .body(Map.of("error", e.getMessage()));
    }
}

// ------------------- 10. Lấy tất cả biên bản -------------------
@GetMapping
public ResponseEntity<?> getAllMinutes() {
    try {
        return ResponseEntity.ok(signatureService.getAllMinutes());
    } catch (Exception e) {
        return ResponseEntity.status(500)
                .body(Map.of("error", e.getMessage()));
    }
}

// ------------------- 11. Lấy danh sách biên bản theo meetingId -------------------
@GetMapping("/meeting/{meetingId}")
public ResponseEntity<?> getLatestMinuteByMeeting(@PathVariable String meetingId) {
    try {
        Minute latestMinute = signatureService.getLatestMinuteByMeeting(meetingId);
        return ResponseEntity.ok(latestMinute); // ✅ chỉ 1 object
    } catch (Exception e) {
        return ResponseEntity.status(500)
                .body(Map.of("error", e.getMessage()));
    }
}



}
