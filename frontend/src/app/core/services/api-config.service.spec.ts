import { TestBed } from '@angular/core/testing';
import { ApiConfigService } from './api-config.service';
import { environment } from '../../../environments/environment';

describe('ApiConfigService', () => {
  let service: ApiConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct base API URL', () => {
    // ApiConfigService converts relative URLs to full URLs
    expect(service.getBaseApiUrl()).toContain('http://');
    expect(service.getBaseApiUrl()).toContain('/api');
  });

  it('should generate correct API URLs', () => {
    // ApiConfigService converts relative URLs to full URLs
    expect(service.getApiUrl('meetings')).toContain('http://');
    expect(service.getApiUrl('meetings')).toContain('/meetings');
    expect(service.getApiUrl('users/profile')).toContain('http://');
    expect(service.getApiUrl('users/profile')).toContain('/users/profile');
  });

  it('should handle endpoints with leading slashes', () => {
    // ApiConfigService converts relative URLs to full URLs
    expect(service.getApiUrl('/meetings')).toContain('http://');
    expect(service.getApiUrl('/meetings')).toContain('/meetings');
    expect(service.getApiUrl('/users/profile')).toContain('http://');
    expect(service.getApiUrl('/users/profile')).toContain('/users/profile');
  });

  it('should detect relative API URLs', () => {
    expect(service.isRelativeApiUrl('/api/meetings')).toBe(true);
    expect(service.isRelativeApiUrl('api/meetings')).toBe(true);
    expect(service.isRelativeApiUrl('http://localhost:8081/api/meetings')).toBe(false);
  });

  it('should normalize relative URLs', () => {
    // ApiConfigService converts relative URLs to full URLs
    expect(service.normalizeUrl('/api/meetings')).toContain('http://');
    expect(service.normalizeUrl('/api/meetings')).toContain('/meetings');
    expect(service.normalizeUrl('api/meetings')).toContain('http://');
    expect(service.normalizeUrl('api/meetings')).toContain('/meetings');
    expect(service.normalizeUrl('http://localhost:8081/api/meetings')).toBe('http://localhost:8081/api/meetings');
  });

  it('should provide predefined endpoints', () => {
    // ApiConfigService converts relative URLs to full URLs
    expect(service.endpoints.meetings()).toContain('http://');
    expect(service.endpoints.meetings()).toContain('/meetings');
    expect(service.endpoints.meeting('123')).toContain('http://');
    expect(service.endpoints.meeting('123')).toContain('/meetings/123');
    expect(service.endpoints.userProfile()).toContain('http://');
    expect(service.endpoints.userProfile()).toContain('/users/profile');
    expect(service.endpoints.notifications()).toContain('http://');
    expect(service.endpoints.notifications()).toContain('/notifications');
  });

  it('should handle invalid base URL gracefully by using fallback', () => {
    // Mock environment with invalid URL
    const originalApiUrl = environment.apiUrl;
    (environment as any).apiUrl = 'invalid-url';
    
    // Service should not throw but use fallback URL
    const service = new ApiConfigService();
    expect(service.getApiUrl('test')).toBe('http://localhost:8081/api/test');
    
    // Restore original URL
    (environment as any).apiUrl = originalApiUrl;
  });
});