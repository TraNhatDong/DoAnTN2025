package com.example.user.service;

import com.example.user.DTO.UserDetailsResponse;
import com.example.user.DTO.UserInfoDTO;
import com.example.user.entity.*;
import com.example.user.repository.UserAccountRepository;
import com.example.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class UserService {

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private UserRepository usersRepository;
    
    public UserAccount getAccountByUsername(String username) {
        UserAccount account = userAccountRepository.findByUsername(username);
        if (account == null) {
            throw new RuntimeException("Account not found for username: " + username);
        }
        return account;
    }

    public Users createUser(Users user) {
        return usersRepository.save(user);
    }

    public Users getUserById(Long id) {
        return usersRepository.findById(id).orElse(null);  // Trả về null nếu không tìm thấy
    }
    public UserInfoDTO getUserInfoAndAccountByAccountId(Long accountId) {
        UserAccount userAccount = userAccountRepository.findByAccountId(accountId);  // Tìm tài khoản bằng username

        if (userAccount == null) {
            throw new RuntimeException("Account not found");
        }

        Users user = userAccount.getUser();  // Lấy user từ UserAccount

        // Trả về thông tin kết hợp
        return new UserInfoDTO(
            user.getUserId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getAddress(),
            user.getPhoneNumber(),
            user.getBirthday(),
            user.getIdCard(),
            userAccount.getUsername(),
            userAccount.getPassword(),
            userAccount.getStatus().toString(),
            userAccount.getRole()
        );
    }
    public List<UserDetailsResponse> getAllActiveUsers() {
        List<Users> activeUsers = usersRepository.findByStatus(Users.Status.ACTIVE);
        List<UserAccount> activeAccounts = userAccountRepository.findByStatus(UserAccount.Status.ACTIVE);

        List<UserDetailsResponse> userDetailsList = new ArrayList<>();

        for (Users user : activeUsers) {
            Optional<UserAccount> userAccountOpt = activeAccounts.stream()
                    .filter(account -> account.getUser().getUserId().equals(user.getUserId()))
                    .findFirst();

            if (userAccountOpt.isPresent()) {
                UserAccount userAccount = userAccountOpt.get();
                UserDetailsResponse response = new UserDetailsResponse(user, userAccount);
                userDetailsList.add(response);
            }
        }

        return userDetailsList;
    }
    

}