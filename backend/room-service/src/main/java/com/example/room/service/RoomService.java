package com.example.room.service;

import com.example.room.entity.*;
import com.example.room.repositoty.RoomRepository;
import com.example.room.repositoty.BookingRepository;
import com.example.room.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BookingRepository bookingRepository;

    // Các phương thức hiện có...
    public Rooms createRoom(Rooms room) {
        return roomRepository.save(room);
    }

    public List<Rooms> getAllRooms() {
        return roomRepository.findAll();
    }

    public Rooms getRoomById(Integer id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));
    }

    public Rooms updateRoom(Integer id, Rooms roomDetails) {
        Rooms room = getRoomById(id);
        room.setRoomName(roomDetails.getRoomName());
        room.setCapacity(roomDetails.getCapacity());
        room.setFloor(roomDetails.getFloor());
        room.setStatus(roomDetails.getStatus());
        return roomRepository.save(room);
    }

    public void deleteRoom(Integer id) {
        Rooms room = getRoomById(id);
        roomRepository.delete(room);
    }

    // public Rooms getRoomById(Integer roomId) {
    // Optional<Rooms> room = roomRepository.findByRoomId(roomId);
    // if (room.isEmpty()) {
    // throw new ResourceNotFoundException("Room with ID " + roomId + " not found");
    // }
    // return room.get();
    // }

    public List<Rooms> getAllRoomByStatus(RoomStatus status) {
        return roomRepository.findByStatus(status);
    }

    public Rooms updateRoomStatus(Integer roomId, String status) {
        Rooms rooms = getRoomById(roomId);
        rooms.setStatus(RoomStatus.valueOf(status));
        return roomRepository.save(rooms);
    }

    // PHƯƠNG THỨC MỚI: Lấy danh sách phòng rảnh
    public List<Rooms> getAvailableRooms(LocalDateTime startTime, LocalDateTime endTime) {
        // Lấy tất cả phòng có sẵn
        List<Rooms> allRooms = roomRepository.findByStatus(RoomStatus.AVAI);

        // Lọc ra các phòng không có booking trùng khung giờ
        return allRooms.stream()
                .filter(room -> isRoomAvailable(room.getRoomId(), startTime, endTime))
                .collect(Collectors.toList());
    }

    // PHƯƠNG THỨC MỚI: Kiểm tra phòng có rảnh không
    public boolean isRoomAvailable(Integer roomId, LocalDateTime startTime, LocalDateTime endTime) {
        List<Booking> conflictingBookings = bookingRepository.findConflictingBookings(
                roomId, startTime, endTime);
        return conflictingBookings.isEmpty();
    }

    // PHƯƠNG THỨC MỚI: Tạo booking mới
    public Booking bookRoom(Integer roomId, String meetingId, LocalDateTime startTime, LocalDateTime endTime) {
        // Kiểm tra phòng có tồn tại không
        Rooms room = getRoomById(roomId);

        // Kiểm tra phòng có rảnh không
        if (!isRoomAvailable(roomId, startTime, endTime)) {
            throw new RuntimeException("Room is not available for the selected time slot");
        }

        // Tạo booking mới
        Booking booking = new Booking(roomId, meetingId, startTime, endTime);
        return bookingRepository.save(booking);
    }

    // PHƯƠNG THỨC MỚI: Hủy booking
    public void cancelBooking(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }
}