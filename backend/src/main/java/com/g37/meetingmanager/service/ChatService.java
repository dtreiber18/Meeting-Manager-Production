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
        this.client = new OpenAIClientBuilder()
                .endpoint(endpoint)
                .credential(new AzureKeyCredential(apiKey))
                .buildClient();
    }
    
    public String generateResponse(String userMessage, String pageContext) {
        try {
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
            e.printStackTrace();
            return "I'm experiencing technical difficulties. Please try again later.";
        }
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
