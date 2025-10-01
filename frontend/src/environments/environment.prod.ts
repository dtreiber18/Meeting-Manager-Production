export const environment = {
  production: true,
  apiUrl: 'https://ca-backend-jq7rzfkj24zqy.mangoriver-904fd974.eastus.azurecontainerapps.io/api',
  enableN8nIntegration: true, // Enable n8n integration in production
  n8nWebhookUrl: 'https://g37-ventures1.app.n8n.cloud/webhook/operations'
  // Note: Quill Editor is completely free - no API keys required!
};

// Debug: Log production environment loading
console.log('🚀 Environment.prod.ts loaded:', {
  production: true,
  apiUrl: 'https://ca-backend-jq7rzfkj24zqy.mangoriver-904fd974.eastus.azurecontainerapps.io/api'
});
