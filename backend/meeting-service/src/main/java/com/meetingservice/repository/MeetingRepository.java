package com.meetingservice.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.meetingservice.enums.MeetingStatus;
import com.meetingservice.models.Meeting;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {

  List<Meeting> findByStatus(MeetingStatus status);

  List<Meeting> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);

  @Query("SELECT m FROM Meeting m LEFT JOIN FETCH m.participants WHERE m.id = :id")
  Optional<Meeting> findByIdWithParticipants(@Param("id") Long id);

  // For better performance, use this in service methods
  @Query("SELECT m FROM Meeting m LEFT JOIN FETCH m.participants")
  List<Meeting> findAllWithParticipants();
   @Query("SELECT DISTINCT m FROM Meeting m JOIN m.participants p WHERE p.userId = :userId")
  List<Meeting> findMeetingsByParticipantUserId(@Param("userId") Long userId);
}