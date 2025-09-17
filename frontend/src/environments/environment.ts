export const environment = {
  production: false,
  apiUrl: '/api', // Use proxy configuration for development
  enableN8nIntegration: true,
  n8nWebhookUrl: 'https://g37-ventures1.app.n8n.cloud/webhook/operations'
  // Note: Quill Editor is completely free - no API keys required!
};

// Debug: Log environment loading
console.log('🔧 Environment.ts loaded:', {
  production: false,
  apiUrl: '/api'
});
