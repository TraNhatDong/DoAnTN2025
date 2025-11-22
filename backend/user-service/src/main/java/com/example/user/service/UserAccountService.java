package com.example.user.service;

import com.example.user.entity.*;
import com.example.user.repository.UserAccountRepository;
import com.example.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
public class UserAccountService {

    @Autowired
    private UserAccountRepository accountRepository;

    @Autowired
    private UserRepository usersRepository;

    public UserAccount createAccount(UserAccount account, Long userId) {
        Users user = usersRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        account.setUser(user);
        return accountRepository.save(account);
    }

//    public Optional<UserAccount> getByUsername(String username) {
//        return accountRepository.findByUsername(username);
//    }
}
