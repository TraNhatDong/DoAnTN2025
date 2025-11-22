package com.example.signature.repository;

import com.example.signature.entity.Minute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MinuteRepository extends JpaRepository<Minute, String> {

    // 🔹 Lấy danh sách biên bản theo meetingId
    List<Minute> findByMeetingId(String meetingId);

    // 🔹 (Tuỳ chọn) Lấy danh sách biên bản theo trạng thái
    List<Minute> findByStatus(String status);
    Optional<Minute> findTopByMeetingIdOrderByCreatedAtDesc(String meetingId);

}
