package com.example.room.controller;

import com.example.room.entity.Rooms;
import com.example.room.entity.Booking;
import com.example.room.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
// @CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/rooms")
public class RoomController {

	@Autowired
	private RoomService roomService;

	@GetMapping("/all")
	public ResponseEntity<List<Rooms>> getAllList() {
		List<Rooms> availableRooms = roomService.getAllRooms();
		return ResponseEntity.ok(availableRooms);
	}

	@PostMapping("/")
	public ResponseEntity<Rooms> createRoom(@RequestBody Rooms room) {
		Rooms createdRoom = roomService.createRoom(room);
		return ResponseEntity.status(HttpStatus.CREATED).body(createdRoom);
	}

	// Thêm các endpoint khác nếu cần
	@GetMapping("/{id}")
	public ResponseEntity<Rooms> getRoomById(@PathVariable Integer id) {
		Rooms room = roomService.getRoomById(id);
		return ResponseEntity.ok(room);
	}

	@PutMapping("/{id}")
	public ResponseEntity<Rooms> updateRoom(@PathVariable Integer id, @RequestBody Rooms room) {
		Rooms updatedRoom = roomService.updateRoom(id, room);
		return ResponseEntity.ok(updatedRoom);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteRoom(@PathVariable Integer id) {
		roomService.deleteRoom(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/")
	public ResponseEntity<List<Rooms>> getAll() {
		List<Rooms> availableRooms = roomService.getAllRooms();
		return ResponseEntity.ok(availableRooms);
	}

	// Lấy danh sách phòng rảnh
	@GetMapping("/available")
	public ResponseEntity<List<Rooms>> getAvailableRooms(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {

		List<Rooms> availableRooms = roomService.getAvailableRooms(startTime, endTime);
		return ResponseEntity.ok(availableRooms);
	}

	// Book phòng
	@PostMapping("/{roomId}/book")
	public ResponseEntity<Booking> bookRoom(
			@PathVariable Integer roomId,
			@RequestParam String meetingId,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {

		Booking booking = roomService.bookRoom(roomId, meetingId, startTime, endTime);
		return ResponseEntity.ok(booking);
	}

	// Kiểm tra phòng có rảnh không
	@GetMapping("/{roomId}/availability")
	public ResponseEntity<Boolean> checkRoomAvailability(
			@PathVariable Integer roomId,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {

		boolean isAvailable = roomService.isRoomAvailable(roomId, startTime, endTime);
		return ResponseEntity.ok(isAvailable);
	}
}