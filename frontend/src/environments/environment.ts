export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api', // Direct backend URL for debugging
  enableN8nIntegration: true,
  n8nWebhookUrl: 'https://g37-ventures1.app.n8n.cloud/webhook/operations'
  // Note: Quill Editor is completely free - no API keys required!
};

// Debug: Log environment loading
console.log('🔧 Environment.ts loaded:', {
  production: false,
  apiUrl: 'http://localhost:8081/api'
});
