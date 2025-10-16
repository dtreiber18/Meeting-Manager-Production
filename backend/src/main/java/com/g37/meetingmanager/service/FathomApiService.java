package com.g37.meetingmanager.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.g37.meetingmanager.dto.FathomWebhookPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for fetching recordings from Fathom API (polling approach)
 */
@Service
@ConditionalOnProperty(name = "fathom.api.enabled", havingValue = "true")
public class FathomApiService {
    private static final Logger logger = LoggerFactory.getLogger(FathomApiService.class);
    
    @Value("${fathom.api.key:}")
    private String apiKey;
    
    @Value("${fathom.api.base-url:https://api.fathom.video/v1}")
    private String baseUrl;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final FathomWebhookService webhookService;
    
    @Autowired
    public FathomApiService(FathomWebhookService webhookService, ObjectMapper objectMapper) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;  // Use Spring's configured ObjectMapper with JSR310 support
        this.webhookService = webhookService;
    }
    
    /**
     * Fetch meetings from Fathom API since a given timestamp
     */
    public List<FathomWebhookPayload> fetchRecordingsSince(LocalDateTime since) {
        if (apiKey == null || apiKey.isEmpty()) {
            logger.warn("Fathom API key not configured - skipping API polling");
            return new ArrayList<>();
        }

        try {
            // Fathom API endpoint is /meetings not /recordings
            String url = baseUrl + "/meetings?limit=50";

            logger.info("Fetching meetings from Fathom API: {}", url);

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Api-Key", apiKey);  // Fathom uses X-Api-Key header
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode items = root.get("items");  // API returns "items" not "meetings"

                if (items != null && items.isArray()) {
                    logger.info("Fetched {} meetings from Fathom API", items.size());
                    List<FathomWebhookPayload> result = new ArrayList<>();

                    for (JsonNode meeting : items) {
                        try {
                            // Filter by timestamp if provided
                            if (since != null) {
                                JsonNode recordingStartNode = meeting.get("recording_start_time");
                                if (recordingStartNode != null) {
                                    // Fathom uses ISO 8601 with 'Z' suffix
                                    String timeStr = recordingStartNode.asText();
                                    LocalDateTime meetingTime = LocalDateTime.parse(
                                        timeStr.replace("Z", ""),
                                        DateTimeFormatter.ISO_DATE_TIME
                                    );
                                    if (meetingTime.isBefore(since)) {
                                        continue;  // Skip meetings older than threshold
                                    }
                                }
                            }

                            FathomWebhookPayload payload = objectMapper.treeToValue(meeting, FathomWebhookPayload.class);
                            result.add(payload);
                        } catch (Exception e) {
                            logger.error("Failed to parse meeting: {}", e.getMessage(), e);
                        }
                    }

                    return result;
                }
            } else {
                logger.error("Failed to fetch meetings from Fathom API: {} {}",
                    response.getStatusCode(), response.getBody());
            }

        } catch (Exception e) {
            logger.error("Error fetching meetings from Fathom API", e);
        }

        return new ArrayList<>();
    }
    
    /**
     * Process a recording fetched from API (converts to webhook format and processes)
     */
    public void processRecording(FathomWebhookPayload payload) {
        try {
            logger.info("Processing recording from API: {} (ID: {})",
                payload.getTitle(), payload.getRecordingId());

            // Convert payload to JSON and process through webhook service
            String jsonPayload = objectMapper.writeValueAsString(payload);
            String webhookId = "api-poll-" + payload.getRecordingId();

            // Call async processing but we're already in a background thread
            webhookService.processWebhookAsync(webhookId, jsonPayload);
        } catch (Exception e) {
            logger.error("Failed to process recording from API", e);
        }
    }
}
