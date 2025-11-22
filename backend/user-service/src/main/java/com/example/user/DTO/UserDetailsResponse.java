package com.example.user.DTO;

import java.time.LocalDate;

import com.example.user.entity.UserAccount;
import com.example.user.entity.Users;

public class UserDetailsResponse {

    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String address;
    private String phoneNumber;
    private LocalDate birthday;
    private String idCard;
    private String accountUsername;
    private String accountStatus;
    private String userStatus;    // Trạng thái người dùng (User status)
    private Long accountId;       // Account ID
    private String role;  

    // Constructor cập nhật
    public UserDetailsResponse(Users user, UserAccount userAccount) {
        this.userId = user.getUserId();
        this.email = user.getEmail();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.address = user.getAddress();
        this.phoneNumber = user.getPhoneNumber();
        this.birthday = user.getBirthday();
        this.idCard = user.getIdCard();
        this.accountUsername = userAccount.getUsername();
        this.accountStatus = userAccount.getStatus().name();
        this.userStatus = user.getStatus().name(); // Lấy status của người dùng
        this.accountId = userAccount.getAccountId(); // Lấy accountId của UserAccount
        this.role = userAccount.getRole().name();
    }

    // Getters & Setters
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

    public String getAccountUsername() {
        return accountUsername;
    }

    public void setAccountUsername(String accountUsername) {
        this.accountUsername = accountUsername;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }

    public String getUserStatus() {
        return userStatus;
    }

    public void setUserStatus(String userStatus) {
        this.userStatus = userStatus;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }
    
    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
    @Override
    public String toString() {
        return "UserDetailsResponse{" +
                "userId=" + userId +
                ", email='" + email + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", address='" + address + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", birthday=" + birthday +
                ", idCard='" + idCard + '\'' +
                ", accountUsername='" + accountUsername + '\'' +
                ", accountStatus='" + accountStatus + '\'' +
                ", userStatus='" + userStatus + '\'' +
                ", accountId=" + accountId +
                ", role='" + role + '\'' +
                '}';
    }
}

