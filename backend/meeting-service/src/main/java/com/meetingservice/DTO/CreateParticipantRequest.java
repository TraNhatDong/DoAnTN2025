package com.meetingservice.DTO;

import jakarta.validation.constraints.NotNull;

import com.meetingservice.enums.ParticipantRole;

public class CreateParticipantRequest {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Role is required")
    private ParticipantRole role;

    // Getters and Setters
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

    public CreateParticipantRequest() {
    }
}