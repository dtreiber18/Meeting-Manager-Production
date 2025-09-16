export const environment = {
  production: false,
  apiUrl: '/api', // Use proxy configuration for development
  enableN8nIntegration: true,
  n8nWebhookUrl: 'https://g37-ventures1.app.n8n.cloud/webhook/operations',
  tinymceApiKey: '' // Add your TinyMCE API key here for production (leave empty for development)
};

// Debug: Log environment loading
console.log('🔧 Environment.ts loaded:', {
  production: false,
  apiUrl: '/api'
});
