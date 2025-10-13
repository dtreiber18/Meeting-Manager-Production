# AI Functionality Export from Meeting Manager to Blueprint Hub

This directory contains all the AI components extracted from Meeting Manager that you can safely copy to your Blueprint Hub project.

## 📁 Directory Structure

```
AI_EXPORT_FOR_BLUEPRINT_HUB/
├── frontend/
│   ├── chat.model.ts          # TypeScript interfaces for chat
│   ├── chat.service.ts        # Angular service for AI chat
│   └── ai-chat.component.ts   # AI chat component
├── backend/
│   ├── ChatService.java       # Spring Boot service for OpenAI
│   └── ChatController.java    # REST controller for chat API
├── config/
│   └── application-ai.yml     # Configuration for Azure OpenAI
└── README.md                  # This file
```

## 🚀 Implementation Steps

### Step 1: Copy Frontend Files

1. **Copy the model file:**
   ```bash
   cp frontend/chat.model.ts /path/to/blueprint-hub/src/app/models/
   ```

2. **Copy the service:**
   ```bash
   cp frontend/chat.service.ts /path/to/blueprint-hub/src/app/services/
   ```

3. **Copy the component:**
   ```bash
   cp frontend/ai-chat.component.ts /path/to/blueprint-hub/src/app/components/
   ```

4. **Update imports in the copied files:**
   - Adjust import paths to match your Blueprint Hub structure
   - Update the API URL in chat.service.ts to point to your backend

### Step 2: Copy Backend Files

1. **Copy the service:**
   ```bash
   cp backend/ChatService.java /path/to/blueprint-hub/src/main/java/your/package/service/
   ```

2. **Copy the controller:**
   ```bash
   cp backend/ChatController.java /path/to/blueprint-hub/src/main/java/your/package/controller/
   ```

3. **Update package names:**
   - Change package declarations to match your Blueprint Hub structure
   - Update import statements accordingly

### Step 3: Add Configuration

1. **Add Azure OpenAI config to your application.yml:**
   ```yaml
   azure:
     openai:
       endpoint: ${AZURE_OPENAI_ENDPOINT:https://your-openai.openai.azure.com/}
       api-key: ${AZURE_OPENAI_API_KEY:your-api-key}
       deployment-name: ${AZURE_OPENAI_DEPLOYMENT_NAME:gpt-35-turbo}
   ```

2. **Add Maven dependency to pom.xml:**
   ```xml
   <dependency>
     <groupId>com.azure</groupId>
     <artifactId>azure-ai-openai</artifactId>
     <version>1.0.0-beta.6</version>
   </dependency>
   ```

### Step 4: Set Environment Variables

Create these environment variables in your deployment:

```bash
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-35-turbo
```

### Step 5: Add to Angular App

In your main app component template, add:

```html
<!-- Add this to your main app component -->
<app-ai-chat 
  *ngIf="isAuthenticated" 
  [pageType]="getCurrentPageType()" 
  [context]="getCurrentContext()">
</app-ai-chat>
```

Add the logic to determine page type:

```typescript
getCurrentPageType(): PageType {
  const url = this.router.url;
  if (url.includes('/projects')) return 'projects';
  if (url.includes('/blueprints')) return 'blueprints';
  if (url.includes('/settings')) return 'settings';
  if (url.includes('/detail')) return 'detail';
  return 'home';
}

getCurrentContext(): string {
  // Return context based on current page/data
  return JSON.stringify({
    page: this.getCurrentPageType(),
    // Add any relevant page data
  });
}
```

## 🔧 Customization for Blueprint Hub

### Update Chat Responses

Modify the fallback responses in both frontend and backend to match Blueprint Hub features:

**Frontend (chat.service.ts):**
- Update `getContextualWelcome()` method
- Update `getContextualResponse()` method

**Backend (ChatService.java):**
- Update `getFallbackResponse()` method
- Update `buildSystemPrompt()` method

### Update Page Types

In `chat.model.ts`, update the PageType to match your Blueprint Hub pages:

```typescript
export type PageType = 'home' | 'projects' | 'blueprints' | 'detail' | 'settings';
```

## 🛡️ Security Notes

1. **Never commit Azure OpenAI keys to git**
2. **Use environment variables for all secrets**
3. **Configure CORS appropriately for production**
4. **Consider rate limiting for the chat API**

## 🧪 Testing

1. **Test without Azure OpenAI:** The service includes fallback responses that work without Azure OpenAI configured
2. **Test with Azure OpenAI:** Set up your Azure OpenAI resource and test real AI responses
3. **Test frontend integration:** Ensure the chat component integrates properly with your Angular app

## 📋 Dependencies

### Frontend (Angular)
- Angular Material (already included in imports)
- RxJS (standard Angular dependency)
- FormsModule (for input handling)

### Backend (Spring Boot)
- Azure OpenAI SDK: `azure-ai-openai`
- Spring Web (for REST endpoints)
- Spring Boot starter

## 🔄 Migration Checklist

- [ ] Copy all files to Blueprint Hub
- [ ] Update package names and imports
- [ ] Add Azure OpenAI configuration
- [ ] Set environment variables
- [ ] Test fallback responses (without OpenAI)
- [ ] Configure Azure OpenAI resource
- [ ] Test with real AI responses
- [ ] Customize responses for Blueprint Hub
- [ ] Add to main app component
- [ ] Test end-to-end functionality

## 🤖 AI Features Included

1. **Context-aware responses** based on current page
2. **Fallback mode** when Azure OpenAI is unavailable
3. **Configurable page types** and responses
4. **Professional UI** with Material Design
5. **Error handling** and loading states
6. **Mobile responsive** design

## 📞 Support

If you encounter issues during integration:

1. Check console logs for specific errors
2. Verify all imports are correct
3. Ensure environment variables are set
4. Test fallback mode first (without Azure OpenAI)
5. Gradually enable Azure OpenAI integration

This export ensures you can implement the AI functionality in Blueprint Hub without affecting the original Meeting Manager codebase.