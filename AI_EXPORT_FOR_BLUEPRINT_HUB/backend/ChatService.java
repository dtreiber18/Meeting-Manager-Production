package your.blueprint.hub.service; // UPDATE: Change to your package

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
        
        // Blueprint Hub specific fallback responses
        if (lowerMessage.contains("project") || lowerMessage.contains("create")) {
            return "To create a new project, click the 'New Project' button. You can start from scratch or use one of our blueprint templates to accelerate development with proven architectures.";
        }
        
        if (lowerMessage.contains("blueprint") || lowerMessage.contains("template")) {
            return "Blueprints are reusable project templates that include pre-configured code, documentation, and best practices. Browse the blueprint library to find templates for your technology stack.";
        }
        
        if (lowerMessage.contains("search") || lowerMessage.contains("find")) {
            return "You can search for projects and blueprints using the search bar. It searches through project names, descriptions, tags, and blueprint content.";
        }
        
        if (lowerMessage.contains("deploy") || lowerMessage.contains("build")) {
            return "Use the deployment section to set up CI/CD pipelines, configure environments, and manage builds. Each project can have multiple deployment targets.";
        }
        
        if (lowerMessage.contains("collaborate") || lowerMessage.contains("team")) {
            return "Projects support team collaboration with role-based access, shared resources, and integrated communication tools. Invite team members and assign appropriate permissions.";
        }
        
        return "Hello! I'm here to help you with Blueprint Hub. You can ask me about creating projects, using blueprints, deploying applications, team collaboration, or any other features you'd like to learn about.";
    }
    
    private String buildSystemPrompt(String pageContext) {
        String basePrompt = "You are an AI assistant for Blueprint Hub, a platform for managing software projects and reusable blueprints. " +
                "You help users with project management, blueprint usage, deployment, collaboration, and platform navigation. " +
                "Be helpful, concise, and professional in your responses.";
        
        switch (pageContext.toLowerCase()) {
            case "home":
            case "dashboard":
                return basePrompt + " The user is currently on the main dashboard where they can see " +
                        "their projects overview, recent activity, and quick actions. Help them understand " +
                        "dashboard features, project summaries, and navigation options.";
                        
            case "projects":
                return basePrompt + " The user is on the projects page where they can view, search, " +
                        "and filter their projects. Help them with project management, filtering options, " +
                        "project status, and team collaboration features.";
                        
            case "blueprints":
                return basePrompt + " The user is browsing the blueprint library where they can find " +
                        "and use project templates. Help them understand blueprint categories, " +
                        "customization options, and how to apply blueprints to new projects.";
                        
            case "detail":
                return basePrompt + " The user is viewing a specific project's details page. Help them " +
                        "understand project information, resources, deployment options, team members, " +
                        "and available actions for this project.";
                        
            case "settings":
                return basePrompt + " The user is on the settings page where they can configure their " +
                        "preferences, integrations, and account settings. Help them with configuration " +
                        "options, API integrations, and feature explanations.";
                        
            default:
                return basePrompt + " Provide general help about the Blueprint Hub platform.";
        }
    }
}