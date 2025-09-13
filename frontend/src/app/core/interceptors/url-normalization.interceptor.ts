import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApiConfigService } from '../services/api-config.service';

/**
 * HTTP Interceptor that automatically detects and fixes relative API URLs
 * This acts as a safety net to catch any relative URLs that slip through
 */
export const urlNormalizationInterceptor: HttpInterceptorFn = (req, next) => {
  const apiConfig = inject(ApiConfigService);
  
  let modifiedUrl = req.url;
  
  // Check if this is a relative API URL that needs to be normalized
  if (apiConfig.isRelativeApiUrl(req.url)) {
    modifiedUrl = apiConfig.normalizeUrl(req.url);
    
    console.warn(`🔧 URL Normalization Interceptor: Fixed relative URL
    Original: ${req.url}
    Fixed: ${modifiedUrl}
    
    ⚠️ DEVELOPMENT NOTICE: A service is still using a relative URL. 
    Please update the service to use ApiConfigService.getApiUrl() instead.`);
    
    // Clone the request with the corrected URL
    const modifiedReq = req.clone({
      url: modifiedUrl
    });
    
    return next(modifiedReq);
  }
  
  return next(req);
};