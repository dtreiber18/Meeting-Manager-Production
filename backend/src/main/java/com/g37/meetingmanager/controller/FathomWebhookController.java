package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.service.FathomWebhookService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * REST controller for receiving Fathom webhooks
 *
 * Endpoint: POST /api/webhooks/fathom
 *
 * Fathom sends webhooks when meeting content is ready:
 * - Event: newMeeting
 * - Includes: transcript, summary, action items, participants
 *
 * Webhook verification:
 * - Uses HMAC SHA-256 signature in webhook-signature header
 * - Signature format: "v1,BASE64_SIGNATURE"
 */
@RestController
@RequestMapping("/api/webhooks")
@ConditionalOnProperty(name = "fathom.enabled", havingValue = "true", matchIfMissing = false)
public class FathomWebhookController {

    private static final Logger logger = LoggerFactory.getLogger(FathomWebhookController.class);

    @Autowired
    private FathomWebhookService fathomWebhookService;

    /**
     * Receive and process Fathom webhook for new meeting
     *
     * @param signature Webhook signature header (webhook-signature)
     * @param rawPayload Raw JSON payload from Fathom
     * @return 200 OK immediately (processing happens async)
     */
    @PostMapping(value = "/fathom", consumes = "application/json", produces = "application/json")
    public ResponseEntity<Map<String, Object>> receiveFathomWebhook(
            @RequestHeader(value = "webhook-signature", required = false) String signature,
            HttpServletRequest request) {

        // Generate unique webhook ID for tracking
        String webhookId = UUID.randomUUID().toString();

        logger.info("Received Fathom webhook ID: {}", webhookId);

        // Read raw body manually to avoid Jackson deserialization
        String rawPayload;
        try {
            BufferedReader reader = request.getReader();
            rawPayload = reader.lines().collect(Collectors.joining(System.lineSeparator()));
        } catch (IOException e) {
            logger.error("Failed to read request body for webhook ID {}: {}", webhookId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "invalid_request",
                            "message", "Failed to read request body"
                    ));
        }

        logger.debug("Signature: {}, Payload length: {} bytes", signature, rawPayload.length());

        // 1. Verify webhook signature (HMAC SHA-256)
        if (signature == null || signature.isEmpty()) {
            logger.warn("Fathom webhook received without signature header - webhook ID: {}", webhookId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error", "missing_signature",
                            "message", "Webhook signature header is required"
                    ));
        }

        boolean signatureValid = fathomWebhookService.verifyWebhookSignature(signature, rawPayload);

        if (!signatureValid) {
            logger.error("Invalid Fathom webhook signature - webhook ID: {}", webhookId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error", "invalid_signature",
                            "message", "Webhook signature verification failed"
                    ));
        }

        logger.info("Fathom webhook signature verified - webhook ID: {}", webhookId);

        // 2. Return 200 OK immediately, process webhook asynchronously
        // This prevents Fathom from timing out or retrying
        fathomWebhookService.processWebhookAsync(webhookId, rawPayload);

        return ResponseEntity.ok(Map.of(
                "status", "received",
                "webhook_id", webhookId,
                "message", "Webhook received and queued for processing"
        ));
    }

    /**
     * Health check endpoint for Fathom webhook configuration
     *
     * @return 200 OK if Fathom integration is enabled
     */
    @GetMapping("/fathom/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "service", "fathom-webhook",
                "version", "1.0",
                "message", "Fathom webhook endpoint is active"
        ));
    }
}
