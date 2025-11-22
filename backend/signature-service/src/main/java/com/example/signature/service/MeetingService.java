package com.example.signature.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class MeetingService {
    private final RestTemplate restTemplate;

    public MeetingService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> getMeetingById(String meetingId) {
        return restTemplate.getForObject(
                "http://meeting-service/meetings/" + meetingId,
                Map.class
        );
    }
}
