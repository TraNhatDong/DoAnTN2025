package com.example.room.repositoty;

import com.example.room.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {

        // Tìm các booking trùng khung giờ
        @Query("SELECT b FROM Booking b WHERE " +
                        "b.roomId = :roomId AND " +
                        "b.status = 'CONFIRMED' AND " +
                        "((b.startTime BETWEEN :startTime AND :endTime) OR " +
                        "(b.endTime BETWEEN :startTime AND :endTime) OR " +
                        "(b.startTime <= :startTime AND b.endTime >= :endTime))")
        List<Booking> findConflictingBookings(
                        @Param("roomId") Integer roomId,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        // Tìm tất cả booking của một phòng trong khoảng thời gian
        @Query("SELECT b FROM Booking b WHERE " +
                        "b.roomId = :roomId AND " +
                        "b.status = 'CONFIRMED' AND " +
                        "b.startTime >= :startTime AND " +
                        "b.endTime <= :endTime")
        List<Booking> findByRoomIdAndTimeRange(
                        @Param("roomId") Integer roomId,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);
}