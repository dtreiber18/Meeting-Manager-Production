package your.blueprint.hub.controller; // UPDATE: Change to your package

import your.blueprint.hub.service.ChatService; // UPDATE: Change to your package
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "*") // UPDATE: Configure for your domains
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
        
        // Blueprint Hub specific fallback responses
        if (lowerMessage.contains("project") || lowerMessage.contains("create")) {
            return "To create a new project, click the 'New Project' button. You can start from scratch or use one of our blueprint templates to accelerate development.";
        }
        
        if (lowerMessage.contains("blueprint") || lowerMessage.contains("template")) {
            return "Blueprints are reusable project templates. Browse the blueprint library to find templates for your technology stack and use cases.";
        }
        
        if (lowerMessage.contains("search") || lowerMessage.contains("find")) {
            return "You can search for projects and blueprints using the search bar. It searches through project names, descriptions, tags, and blueprint content.";
        }
        
        if (lowerMessage.contains("deploy") || lowerMessage.contains("build")) {
            return "Use the deployment section to set up CI/CD pipelines, configure environments, and manage builds for your projects.";
        }
        
        if (lowerMessage.contains("help") || lowerMessage.contains("how")) {
            return "I can help you with creating projects, using blueprints, deploying applications, team collaboration, and navigating Blueprint Hub features.";
        }
        
        return "Hello! I'm here to help you with Blueprint Hub. You can ask me about creating projects, using blueprints, deploying applications, or any other features you'd like to learn about.";
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