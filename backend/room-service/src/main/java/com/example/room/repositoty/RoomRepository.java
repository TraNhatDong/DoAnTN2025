package com.example.room.repositoty;

import com.example.room.entity.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Rooms, Integer> {
    Optional<Rooms> findByRoomId(Integer roomId);

    List<Rooms> findByStatus(RoomStatus status);
}
