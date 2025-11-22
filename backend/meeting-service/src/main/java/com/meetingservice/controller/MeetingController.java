package com.meetingservice.controller;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import org.springframework.http.ResponseEntity;

import com.meetingservice.DTO.CreateMeetingRequest;
import com.meetingservice.DTO.CreateParticipantRequest;
import com.meetingservice.DTO.MeetingDTO;
import com.meetingservice.DTO.MeetingParticipantDTO;
import com.meetingservice.enums.MeetingStatus;
import com.meetingservice.enums.ParticipantStatus;
import com.meetingservice.exception.MeetingNotFoundException;
import com.meetingservice.services.MeetingService;

@RestController
@RequestMapping("/meetings")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }
     @PostMapping("/send")
    public ResponseEntity<?> sendNewParticipantsNotification(
            @RequestParam Long meetingId) {

        try {
            meetingService.sendNotification(meetingId);
            return ResponseEntity.ok("Notification sent successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to send notification");
        }
    }
    // === MEETING CRUD ===
    @PostMapping
    public MeetingDTO createMeeting(@RequestBody @Valid CreateMeetingRequest request) {
        return meetingService.createMeetingWithParticipants(request);
    }

    @PutMapping("/{id}")
    public MeetingDTO updateMeeting(@PathVariable Long id, @RequestBody @Valid CreateMeetingRequest request) {
        return meetingService.updateMeetingWithParticipants(id, request);
    }
    @GetMapping("/user/{userId}")
    public List<MeetingDTO> getMeetingsByUser(@PathVariable Long userId) {
        return meetingService.getMeetingsByUser(userId);
    }
    @PutMapping("/{id}/cancel")
    public MeetingDTO cancelMeeting(@PathVariable Long id, @RequestParam String reason) {
        return meetingService.cancelMeeting(id, reason);
    }

    @DeleteMapping("/{id}")
    public void deleteMeeting(@PathVariable Long id) {
        meetingService.deleteMeeting(id);
    }

    @GetMapping
    public List<MeetingDTO> getAllMeetings() {
        return meetingService.getAllMeetings();
    }

    @GetMapping("/{id}")
    public MeetingDTO getMeeting(@PathVariable Long id) {
        return meetingService.getMeetingById(id)
                .orElseThrow(() -> new MeetingNotFoundException("Meeting not found with id: " + id));
    }

    @GetMapping("/status/{status}")
    public List<MeetingDTO> getMeetingsByStatus(@PathVariable MeetingStatus status) {
        return meetingService.getMeetingsByStatus(status);
    }
    @PutMapping("/{id}/status")
    public ResponseEntity<MeetingDTO> updateMeetingStatus(
            @PathVariable Long id,
            @RequestParam MeetingStatus status) {
        MeetingDTO updatedMeeting = meetingService.updateMeetingStatus(id, status);
        if (updatedMeeting != null) {
            return ResponseEntity.ok(updatedMeeting);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/between")
    public List<MeetingDTO> getMeetingsBetween(@RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {
        return meetingService.getMeetingsBetween(start, end);
    }

    // === PARTICIPANT MANAGEMENT ===
  @PostMapping("/{meetingId}/participants/batch")
public List<MeetingParticipantDTO> addParticipants(
        @PathVariable Long meetingId,
        @RequestBody @Valid List<CreateParticipantRequest> requests) {
    return meetingService.addParticipants(meetingId, requests);
}

    @GetMapping("/{meetingId}/participants")
    public List<MeetingParticipantDTO> getParticipants(@PathVariable Long meetingId) {
        return meetingService.getParticipants(meetingId);
    }

    @DeleteMapping("/{meetingId}/participants/{userId}")
    public void removeParticipant(@PathVariable Long meetingId, @PathVariable Long userId) {
        meetingService.removeParticipant(meetingId, userId);
    }

    @PutMapping("/{meetingId}/participants/{userId}/status")
    public MeetingParticipantDTO updateParticipantStatus(@PathVariable Long meetingId,
            @PathVariable Long userId,
            @RequestParam ParticipantStatus status) {
        return meetingService.updateParticipantStatus(meetingId, userId, status);
    }
}