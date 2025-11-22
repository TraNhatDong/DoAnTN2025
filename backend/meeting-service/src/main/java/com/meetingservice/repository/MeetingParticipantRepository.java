package com.meetingservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.meetingservice.enums.ParticipantStatus;
import com.meetingservice.models.MeetingParticipant;

public interface MeetingParticipantRepository extends JpaRepository<MeetingParticipant, Long> {
    List<MeetingParticipant> findByMeetingId(Long meetingId);

    List<MeetingParticipant> findByUserId(Long userId);

    List<MeetingParticipant> findByMeetingIdAndStatus(Long meetingId, ParticipantStatus status);

    @Query("SELECT p FROM MeetingParticipant p WHERE p.meeting.id = :meetingId AND p.userId = :userId")
    MeetingParticipant findByMeetingAndUser(Long meetingId, Long userId);
}
