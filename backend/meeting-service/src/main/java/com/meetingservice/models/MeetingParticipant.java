package com.meetingservice.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.meetingservice.enums.ParticipantRole;
import com.meetingservice.enums.ParticipantStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "meeting_participants")
public class MeetingParticipant {

    // id/useid, role,meetingid, status=Pending
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(nullable = true, columnDefinition = "varchar(20) default 'TV'")
    @Enumerated(EnumType.STRING)
    private ParticipantRole role; // TV: Thành viên/ TK: Thư ký/ CT: Chủ trì

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id")
    @JsonIgnore
    private Meeting meeting;

    @Enumerated(EnumType.STRING)
    private ParticipantStatus status = ParticipantStatus.Pending;

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

    public Meeting getMeeting() {
        return meeting;
    }

    public void setMeeting(Meeting meeting) {
        this.meeting = meeting;
    }

    public ParticipantStatus getStatus() {
        return status;
    }

    public void setStatus(ParticipantStatus status) {
        this.status = status;
    }

}
