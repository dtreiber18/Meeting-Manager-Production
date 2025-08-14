package com.g37.meetingmanager.service;

import com.azure.ai.openai.OpenAIClient;
import com.azure.ai.openai.OpenAIClientBuilder;
import com.azure.ai.openai.models.*;
import com.azure.core.credential.AzureKeyCredential;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class ChatService {
    
    private final OpenAIClient client;
    private final String deploymentName;
    
    public ChatService(
            @Value("${azure.openai.endpoint}") String endpoint,
            @Value("${azure.openai.api-key}") String apiKey,
            @Value("${azure.openai.deployment-name}") String deploymentName) {
        
        this.deploymentName = deploymentName;
        this.client = initializeClient(endpoint, apiKey, deploymentName);
    }
    
    private OpenAIClient initializeClient(String endpoint, String apiKey, String deploymentName) {
        try {
            // Check if all required configuration is present
            if (endpoint == null || endpoint.equals("https://your-openai.openai.azure.com/") || 
                apiKey == null || apiKey.equals("your-api-key") ||
                deploymentName == null || deploymentName.equals("gpt-4")) {
                
                System.out.println("Azure OpenAI not properly configured, using fallback mode");
                return null;
            }
            
            OpenAIClient openAIClient = new OpenAIClientBuilder()
                    .endpoint(endpoint)
                    .credential(new AzureKeyCredential(apiKey))
                    .buildClient();
                    
            System.out.println("Azure OpenAI client initialized successfully");
            return openAIClient;
        } catch (Exception e) {
            System.err.println("Failed to initialize Azure OpenAI client: " + e.getMessage());
            return null;
        }
    }
    
    public String generateResponse(String userMessage, String pageContext) {
        try {
            // If OpenAI client is not available, use fallback response
            if (client == null) {
                return getFallbackResponse(userMessage, pageContext);
            }
            
            List<ChatRequestMessage> chatMessages = new ArrayList<>();
            
            // Add system message with context
            String systemPrompt = buildSystemPrompt(pageContext);
            chatMessages.add(new ChatRequestSystemMessage(systemPrompt));
            
            // Add user message
            chatMessages.add(new ChatRequestUserMessage(userMessage));
            
            ChatCompletionsOptions chatCompletionsOptions = new ChatCompletionsOptions(chatMessages);
            chatCompletionsOptions.setMaxTokens(500);
            chatCompletionsOptions.setTemperature(0.7);
            
            ChatCompletions chatCompletions = client.getChatCompletions(deploymentName, chatCompletionsOptions);
            
            if (chatCompletions.getChoices() != null && !chatCompletions.getChoices().isEmpty()) {
                return chatCompletions.getChoices().get(0).getMessage().getContent();
            }
            
            return "I'm sorry, I couldn't generate a response at the moment. Please try again.";
            
        } catch (Exception e) {
            System.err.println("Error calling Azure OpenAI: " + e.getMessage());
            return getFallbackResponse(userMessage, pageContext);
        }
    }
    
    private String getFallbackResponse(String userMessage, String pageContext) {
        String lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.contains("meeting") || lowerMessage.contains("create")) {
            return "To create a new meeting, click the 'Create Meeting' button on the dashboard. You can set the title, description, date, time, and various settings like recording options.";
        }
        
        if (lowerMessage.contains("search") || lowerMessage.contains("find")) {
            return "You can search for meetings using the search bar at the top. It searches through meeting titles, descriptions, participants, and action items.";
        }
        
        if (lowerMessage.contains("filter")) {
            return "Use the Filter button to narrow down meetings by date range, type, participants, or other criteria.";
        }
        
        return "Hello! I'm here to help you with the Meeting Manager application. You can ask me about creating meetings, searching, filtering, or any other features you'd like to learn about.";
    }
    
    private String buildSystemPrompt(String pageContext) {
        String basePrompt = "You are an AI assistant for the Meeting Manager application. " +
                "You help users with managing meetings, understanding features, and navigating the application. " +
                "Be helpful, concise, and professional in your responses.";
        
        switch (pageContext.toLowerCase()) {
            case "home":
            case "dashboard":
                return basePrompt + " The user is currently on the main dashboard page where they can see " +
                        "their meetings overview, recent meetings, and quick actions. Help them understand " +
                        "dashboard features, meeting summaries, and navigation options.";
                        
            case "meetings":
                return basePrompt + " The user is on the meetings list page where they can view, search, " +
                        "and filter their meetings. Help them with meeting management, filtering options, " +
                        "and understanding meeting statuses.";
                        
            case "detail":
                return basePrompt + " The user is viewing a specific meeting's details page. Help them " +
                        "understand meeting information, action items, participants, recordings, and " +
                        "available actions for this meeting.";
                        
            case "settings":
                return basePrompt + " The user is on the settings page where they can configure their " +
                        "preferences, integrations, and account settings. Help them with configuration " +
                        "options and feature explanations.";
                        
            case "new-meeting":
            case "edit-meeting":
                return basePrompt + " The user is creating or editing a meeting. Help them understand " +
                        "the form fields, meeting options, scheduling features, and best practices for " +
                        "meeting setup.";
                        
            default:
                return basePrompt + " Provide general help about the Meeting Manager application.";
        }
    }
}
