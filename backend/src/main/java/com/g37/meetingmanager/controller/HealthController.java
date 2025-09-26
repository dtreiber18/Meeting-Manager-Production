package com.g37.meetingmanager.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
@CrossOrigin(origins = "*")
public class HealthController {
    
    @Value("${azure.openai.endpoint:not-configured}")
    private String openAiEndpoint;
    
    @Value("${azure.openai.api-key:not-configured}")
    private String openAiApiKey;
    
    @Value("${azure.openai.deployment-name:not-configured}")
    private String deploymentName;
    
    @GetMapping
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Meeting Manager Backend is healthy");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfiguration() {
        Map<String, Object> config = new HashMap<>();
        config.put("openai_endpoint", openAiEndpoint);
        config.put("openai_api_key_present", !openAiApiKey.equals("not-configured") && !openAiApiKey.equals("your-api-key"));
        config.put("deployment_name", deploymentName);
        config.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(config);
    }
}
