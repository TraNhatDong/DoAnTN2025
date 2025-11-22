package com.example.signature.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class UserService {
    private final RestTemplate restTemplate;

    public UserService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> getUserById(String userId) {
        return restTemplate.getForObject(
                "http://user-service/users/userDetail/" + userId,
                Map.class
        );
    }
}
