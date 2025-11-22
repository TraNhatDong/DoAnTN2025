package com.example.room.entity;
//import javax.persistence.*;

import jakarta.persistence.*;

@Entity
public class Rooms {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer roomId;

    @Column(nullable = false)
    private String roomName;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Integer floor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status = RoomStatus.AVAI;

    public Integer getRoomId() {
        return roomId;
    }

    public void setRoomId(Integer roomId) {
        this.roomId = roomId;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Integer getFloor() {
        return floor;
    }

    public void setFloor(Integer floor) {
        this.floor = floor;
    }

    public RoomStatus getStatus() {
        return status;
    }

    public void setStatus(RoomStatus status) {
        this.status = status;
    }

    public Rooms(Integer roomId, String roomName, Integer capacity, Integer floor, RoomStatus status) {
        this.roomId = roomId;
        this.roomName = roomName;
        this.capacity = capacity;
        this.floor = floor;
        this.status = status;
    }

    public Rooms() {
    }

}
