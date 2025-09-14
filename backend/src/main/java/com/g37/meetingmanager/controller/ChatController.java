package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.service.ChatService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {
    
    private final ChatService chatService;
    
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }
    
    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(@RequestBody ChatRequest request) {
        try {
            String response = chatService.generateResponse(request.getMessage(), request.getPageContext());
            return ResponseEntity.ok(new ChatResponse(response, true));
        } catch (Exception e) {
            System.err.println("Chat controller error: " + e.getMessage());
            // Fallback response
            String fallbackResponse = getFallbackResponse(request.getMessage());
            return ResponseEntity.ok(new ChatResponse(fallbackResponse, true));
        }
    }
    
    private String getFallbackResponse(String message) {
        String lowerMessage = message.toLowerCase();
        
        if (lowerMessage.contains("meeting") || lowerMessage.contains("create")) {
            return "To create a new meeting, click the 'Create Meeting' button on the dashboard. You can set the title, description, date, time, and various settings like recording options.";
        }
        
        if (lowerMessage.contains("search") || lowerMessage.contains("find")) {
            return "You can search for meetings using the search bar at the top. It searches through meeting titles, descriptions, participants, and action items.";
        }
        
        if (lowerMessage.contains("filter")) {
            return "Use the Filter button to narrow down meetings by date range, type, participants, or other criteria.";
        }
        
        if (lowerMessage.contains("help") || lowerMessage.contains("how")) {
            return "I can help you with creating meetings, searching and filtering your meetings, understanding the dashboard, and navigating the application features.";
        }
        
        return "Hello! I'm here to help you with the Meeting Manager application. You can ask me about creating meetings, searching, filtering, or any other features you'd like to learn about.";
    }
    
    public static class ChatRequest {
        private String message;
        private String pageContext;
        
        public ChatRequest() {}
        
        public ChatRequest(String message, String pageContext) {
            this.message = message;
            this.pageContext = pageContext;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
        
        public String getPageContext() {
            return pageContext;
        }
        
        public void setPageContext(String pageContext) {
            this.pageContext = pageContext;
        }
    }
    
    public static class ChatResponse {
        private String response;
        private boolean success;
        
        public ChatResponse() {}
        
        public ChatResponse(String response, boolean success) {
            this.response = response;
            this.success = success;
        }
        
        public String getResponse() {
            return response;
        }
        
        public void setResponse(String response) {
            this.response = response;
        }
        
        public boolean isSuccess() {
            return success;
        }
        
        public void setSuccess(boolean success) {
            this.success = success;
        }
    }
}
