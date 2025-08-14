package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.service.ChatService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/chat")
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
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ChatResponse("I'm sorry, I'm experiencing technical difficulties. Please try again later.", false));
        }
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
