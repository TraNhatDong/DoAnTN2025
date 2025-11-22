package com.meetingservice.DTO;

import com.meetingservice.enums.ParticipantRole;
import com.meetingservice.enums.ParticipantStatus;
import com.meetingservice.models.MeetingParticipant;

public class MeetingParticipantDTO {
    private Long id;
    private Long userId;
    private ParticipantRole role;
    private ParticipantStatus status;

    // Constructor từ Entity
    public MeetingParticipantDTO(MeetingParticipant participant) {
        this.id = participant.getId();
        this.userId = participant.getUserId();
        this.role = participant.getRole();
        this.status = participant.getStatus();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public ParticipantRole getRole() {
        return role;
    }

    public void setRole(ParticipantRole role) {
        this.role = role;
    }

    public ParticipantStatus getStatus() {
        return status;
    }

    public void setStatus(ParticipantStatus status) {
        this.status = status;
    }

    public MeetingParticipantDTO() {
    }
}