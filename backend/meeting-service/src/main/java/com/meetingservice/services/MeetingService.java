package com.meetingservice.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

import com.meetingservice.DTO.CreateMeetingRequest;
import com.meetingservice.DTO.CreateParticipantRequest;
import com.meetingservice.DTO.MeetingDTO;
import com.meetingservice.DTO.MeetingParticipantDTO;
import com.meetingservice.enums.MeetingStatus;
import com.meetingservice.enums.ParticipantStatus;
import com.meetingservice.exception.MeetingNotFoundException;
import com.meetingservice.models.Meeting;
import com.meetingservice.models.MeetingParticipant;
import com.meetingservice.repository.MeetingRepository;

import jakarta.persistence.EntityNotFoundException; // ✅ thêm import

@Service
@Transactional
public class MeetingService {

    private final MeetingRepository meetingRepository;

    @Autowired
    private NotificationProducer notificationProducer;

    public MeetingService(MeetingRepository meetingRepository) {
        this.meetingRepository = meetingRepository;
    }

    // ================= CREATE / UPDATE =================

    public MeetingDTO createMeetingWithParticipants(CreateMeetingRequest request) {
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        Meeting meeting = new Meeting();
        meeting.setName(request.getName());
        meeting.setDescription(request.getDescription());
        meeting.setStartTime(request.getStartTime());
        meeting.setEndTime(request.getEndTime());
        meeting.setRoomId(request.getRoomId());
        meeting.setStatus(MeetingStatus.DRAFT);

        Meeting savedMeeting = meetingRepository.save(meeting);

        if (request.getParticipants() != null && !request.getParticipants().isEmpty()) {
            List<MeetingParticipant> participants = request.getParticipants().stream()
                    .map(p -> {
                        MeetingParticipant participant = new MeetingParticipant();
                        participant.setUserId(p.getUserId());
                        participant.setRole(p.getRole());
                        participant.setStatus(ParticipantStatus.Pending);
                        participant.setMeeting(savedMeeting);
                        return participant;
                    }).collect(Collectors.toList());

            savedMeeting.getParticipants().addAll(participants);
        }

        return new MeetingDTO(savedMeeting);
    }

    public MeetingDTO updateMeetingWithParticipants(Long id, CreateMeetingRequest request) {
        Meeting existingMeeting = meetingRepository.findById(id)
                .orElseThrow(() -> new MeetingNotFoundException("Meeting not found with id: " + id));

        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        existingMeeting.setName(request.getName());
        existingMeeting.setDescription(request.getDescription());
        existingMeeting.setStartTime(request.getStartTime());
        existingMeeting.setEndTime(request.getEndTime());
        existingMeeting.setRoomId(request.getRoomId());

        if (request.getParticipants() != null) {
            existingMeeting.getParticipants().clear();
            List<MeetingParticipant> newParticipants = request.getParticipants().stream()
                    .map(p -> {
                        MeetingParticipant participant = new MeetingParticipant();
                        participant.setUserId(p.getUserId());
                        participant.setRole(p.getRole());
                        participant.setStatus(ParticipantStatus.Pending);
                        participant.setMeeting(existingMeeting);
                        return participant;
                    }).collect(Collectors.toList());
            existingMeeting.getParticipants().addAll(newParticipants);
        }

        Meeting updatedMeeting = meetingRepository.save(existingMeeting);
        return new MeetingDTO(updatedMeeting);
    }

    // ================= CANCEL / DELETE =================

    public MeetingDTO cancelMeeting(Long id, String reason) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new MeetingNotFoundException("Meeting not found with id: " + id));

        meeting.setStatus(MeetingStatus.CANCELLED);
        meeting.setCancelReason(reason);

        Meeting cancelledMeeting = meetingRepository.save(meeting);

        notificationProducer.sendMeetingCancelledNotification(id, reason);

        return new MeetingDTO(cancelledMeeting);
    }

    public void deleteMeeting(Long id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new MeetingNotFoundException("Meeting not found with id: " + id));
        meetingRepository.delete(meeting);
    }

    // ================= GET =================

    @Transactional(readOnly = true)
    public List<MeetingDTO> getAllMeetings() {
        return meetingRepository.findAll().stream()
                .map(MeetingDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<MeetingDTO> getMeetingById(Long id) {
        return meetingRepository.findById(id)
                .map(MeetingDTO::new);
    }

    @Transactional(readOnly = true)
    public List<MeetingDTO> getMeetingsByStatus(MeetingStatus status) {
        return meetingRepository.findByStatus(status).stream()
                .map(MeetingDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MeetingDTO> getMeetingsBetween(LocalDateTime start, LocalDateTime end) {
        return meetingRepository.findByStartTimeBetween(start, end).stream()
                .map(MeetingDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MeetingDTO> getMeetingsByUser(Long userId) {
        List<Meeting> meetings = meetingRepository.findMeetingsByParticipantUserId(userId);
        return meetings.stream()
                .map(MeetingDTO::new)
                .collect(Collectors.toList());
    }

    // ================= PARTICIPANT METHODS =================

    @Transactional
    public List<MeetingParticipantDTO> addParticipants(Long meetingId, List<CreateParticipantRequest> requests) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new MeetingNotFoundException("Meeting not found with id: " + meetingId));

        List<Long> existingUserIds = meeting.getParticipants().stream()
                .map(MeetingParticipant::getUserId)
                .toList();

        List<MeetingParticipantDTO> addedParticipants = new ArrayList<>();

        for (CreateParticipantRequest req : requests) {
            if (existingUserIds.contains(req.getUserId())) continue;

            MeetingParticipant participant = new MeetingParticipant();
            participant.setUserId(req.getUserId());
            participant.setRole(req.getRole());
            participant.setStatus(ParticipantStatus.Pending);
            participant.setMeeting(meeting);

            meeting.getParticipants().add(participant);
            addedParticipants.add(new MeetingParticipantDTO(participant));
        }

        meetingRepository.save(meeting);

        if (!addedParticipants.isEmpty()) {
            notificationProducer.sendNewParticipantsNotification(meetingId, addedParticipants.size());
        }

        return addedParticipants;
    }

    @Transactional(readOnly = true)
    public List<MeetingParticipantDTO> getParticipants(Long meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new MeetingNotFoundException("Meeting not found with id: " + meetingId));

        return meeting.getParticipants().stream()
                .map(MeetingParticipantDTO::new)
                .collect(Collectors.toList());
    }

    public void sendNotification(Long meetingId) {
        notificationProducer.sendNotification(meetingId);
    }

    public void removeParticipant(Long meetingId, Long userId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new MeetingNotFoundException("Meeting not found with id: " + meetingId));

        boolean removed = meeting.getParticipants().removeIf(
                participant -> participant.getUserId().equals(userId));

        if (!removed) {
            throw new IllegalArgumentException("Participant not found in this meeting");
        }

        meetingRepository.save(meeting);
    }

    public MeetingParticipantDTO updateParticipantStatus(Long meetingId, Long userId, ParticipantStatus status) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new MeetingNotFoundException("Meeting not found with id: " + meetingId));

        MeetingParticipant participant = meeting.getParticipants().stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Participant not found in this meeting"));

        participant.setStatus(status);
        meetingRepository.save(meeting);

        return new MeetingParticipantDTO(participant);
    }

    // ================= UPDATE MEETING STATUS =================

    public MeetingDTO updateMeetingStatus(Long id, MeetingStatus status) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Meeting not found with id " + id));

        meeting.setStatus(status);
        meeting = meetingRepository.save(meeting);

        return convertToDTO(meeting);
    }

    // ================= HELPER =================

    private MeetingDTO convertToDTO(Meeting meeting) {
        return new MeetingDTO(meeting);
    }

}
