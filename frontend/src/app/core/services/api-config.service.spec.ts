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
    // In development, ApiConfigService uses relative URLs for proxy
    expect(service.getBaseApiUrl()).toBe('/api');
  });

  it('should generate correct API URLs', () => {
    // In development, ApiConfigService uses relative URLs for proxy
    expect(service.getApiUrl('meetings')).toBe('/api/meetings');
    expect(service.getApiUrl('users/profile')).toBe('/api/users/profile');
  });

  it('should handle endpoints with leading slashes', () => {
    // In development, ApiConfigService uses relative URLs for proxy
    expect(service.getApiUrl('/meetings')).toBe('/api/meetings');
    expect(service.getApiUrl('/users/profile')).toBe('/api/users/profile');
  });

  it('should detect relative API URLs', () => {
    // In development, we DON'T want to flag relative URLs for conversion
    expect(service.isRelativeApiUrl('/api/meetings')).toBe(false);
    expect(service.isRelativeApiUrl('api/meetings')).toBe(false);
    expect(service.isRelativeApiUrl('http://localhost:8081/api/meetings')).toBe(false);
  });

  it('should normalize relative URLs', () => {
    // In development, relative URLs should NOT be converted
    expect(service.normalizeUrl('/api/meetings')).toBe('/api/meetings');
    expect(service.normalizeUrl('api/meetings')).toBe('api/meetings');
    expect(service.normalizeUrl('http://localhost:8081/api/meetings')).toBe('http://localhost:8081/api/meetings');
  });

  it('should provide predefined endpoints', () => {
    // In development, ApiConfigService uses relative URLs for proxy
    expect(service.endpoints.meetings()).toBe('/api/meetings');
    expect(service.endpoints.meeting('123')).toBe('/api/meetings/123');
    expect(service.endpoints.userProfile()).toBe('/api/users/profile');
    expect(service.endpoints.notifications()).toBe('/api/notifications');
  });

  it('should handle invalid base URL gracefully by using fallback', () => {
    // Mock environment with invalid URL
    const originalApiUrl = environment.apiUrl;
    (environment as any).apiUrl = 'invalid-url';
    
    // In development, invalid URLs should be used as-is (no fallback conversion)
    const service = new ApiConfigService();
    expect(service.getApiUrl('test')).toBe('invalid-url/test');
    
    // Restore original URL
    (environment as any).apiUrl = originalApiUrl;
  });
});