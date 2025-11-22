package com.example.user.DTO;
import java.time.LocalDate;

import com.example.user.entity.Role;

public class UserInfoDTO {
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String address;
    private String phoneNumber;
    private LocalDate birthday;
    private String idCard;
    private String username;
    private String password;
    private String status;
    private Role role;
    
    // Constructor, getters, and setters
    public UserInfoDTO(Long userId, String email, String firstName, String lastName, String address, 
                       String phoneNumber, LocalDate birthday, String idCard, String username, 
                       String password, String status, Role role) {
        this.userId = userId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.birthday = birthday;
        this.idCard = idCard;
        this.username = username;
        this.password = password;
        this.status = status;
        this.role = role;
    }
   
 // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public LocalDate getBirthday() {
        return birthday;
    }

    public void setBirthday(LocalDate birthday) {
        this.birthday = birthday;
    }

    public String getIdCard() {
        return idCard;
    }

    public void setIdCard(String idCard) {
        this.idCard = idCard;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
    // Getters and setters omitted for brevity
}
