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
    expect(service.getBaseApiUrl()).toBe(environment.apiUrl);
  });

  it('should generate correct API URLs', () => {
    expect(service.getApiUrl('meetings')).toBe(`${environment.apiUrl}/meetings`);
    expect(service.getApiUrl('users/profile')).toBe(`${environment.apiUrl}/users/profile`);
  });

  it('should handle endpoints with leading slashes', () => {
    expect(service.getApiUrl('/meetings')).toBe(`${environment.apiUrl}/meetings`);
    expect(service.getApiUrl('/users/profile')).toBe(`${environment.apiUrl}/users/profile`);
  });

  it('should detect relative API URLs', () => {
    expect(service.isRelativeApiUrl('/api/meetings')).toBe(true);
    expect(service.isRelativeApiUrl('api/meetings')).toBe(true);
    expect(service.isRelativeApiUrl('http://localhost:8081/api/meetings')).toBe(false);
  });

  it('should normalize relative URLs', () => {
    expect(service.normalizeUrl('/api/meetings')).toBe(`${environment.apiUrl}/meetings`);
    expect(service.normalizeUrl('api/meetings')).toBe(`${environment.apiUrl}/meetings`);
    expect(service.normalizeUrl('http://localhost:8081/api/meetings')).toBe('http://localhost:8081/api/meetings');
  });

  it('should provide predefined endpoints', () => {
    expect(service.endpoints.meetings()).toBe(`${environment.apiUrl}/meetings`);
    expect(service.endpoints.meeting('123')).toBe(`${environment.apiUrl}/meetings/123`);
    expect(service.endpoints.userProfile()).toBe(`${environment.apiUrl}/users/profile`);
    expect(service.endpoints.notifications()).toBe(`${environment.apiUrl}/notifications`);
  });

  it('should throw error for invalid base URL', () => {
    // Mock environment with invalid URL
    const originalApiUrl = environment.apiUrl;
    (environment as any).apiUrl = 'invalid-url';
    
    expect(() => new ApiConfigService()).toThrowError(/Invalid API URL format/);
    
    // Restore original URL
    (environment as any).apiUrl = originalApiUrl;
  });
});