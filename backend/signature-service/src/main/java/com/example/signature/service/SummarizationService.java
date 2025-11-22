package com.example.signature.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class SummarizationService {
    private final RestTemplate restTemplate;

    public SummarizationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> getSummaryByMeetingId(String meetingId) {
        return restTemplate.getForObject(
                "http://summary-service/summaries/" + meetingId,
                Map.class
        );
    }
}
