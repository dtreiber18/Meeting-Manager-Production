import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MeetingService } from '../../meetings/meeting.service';
import { ChatService } from '../../services/chat.service';
import { NotificationService } from '../../shared/services/notification.service';
import { SettingsService } from '../../services/settings.service';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';

/**
 * Integration tests to ensure all services use correct API URLs
 * This catches the common mistake of services using relative URLs
 */
describe('Service API URL Validation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MeetingService,
        ChatService,
        NotificationService,
        SettingsService,
        UserService
      ]
    });
  });

  it('should verify MeetingService uses correct base URL', () => {
    const service = TestBed.inject(MeetingService);
    
    // Use reflection to check private apiUrl property
    const apiUrl = (service as any).apiUrl;
    expect(apiUrl).toBe(`${environment.apiUrl}/meetings`);
    expect(apiUrl).toContain('http://'); // Must be full URL, not relative
    expect(apiUrl).not.toMatch(/^\/api\//); // Must not start with relative path
  });

  it('should verify ChatService uses correct base URL', () => {
    const service = TestBed.inject(ChatService);
    
    const apiUrl = (service as any).apiUrl;
    expect(apiUrl).toContain('http://'); // Must be full URL, not relative
    expect(apiUrl).not.toMatch(/^\/api\//); // Must not start with relative path
    expect(apiUrl).toContain('/chat'); // Should contain chat endpoint
  });

  it('should verify NotificationService uses correct base URL', () => {
    const service = TestBed.inject(NotificationService);
    
    const apiUrl = (service as any).apiUrl;
    expect(apiUrl).toBe(`${environment.apiUrl}/notifications`);
    expect(apiUrl).toContain('http://'); // Must be full URL, not relative
    expect(apiUrl).not.toMatch(/^\/api\//); // Must not start with relative path
  });

  it('should verify SettingsService uses correct base URL', () => {
    const service = TestBed.inject(SettingsService);
    
    const apiUrl = (service as any).API_URL;
    expect(apiUrl).toBe(`${environment.apiUrl}/settings`);
    expect(apiUrl).toContain('http://'); // Must be full URL, not relative
    expect(apiUrl).not.toMatch(/^\/api\//); // Must not start with relative path
  });

  it('should verify UserService uses correct base URL', () => {
    const service = TestBed.inject(UserService);
    
    const apiUrl = (service as any).API_URL;
    expect(apiUrl).toBe(`${environment.apiUrl}/users`);
    expect(apiUrl).toContain('http://'); // Must be full URL, not relative
    expect(apiUrl).not.toMatch(/^\/api\//); // Must not start with relative path
  });

  it('should verify environment.apiUrl is properly configured', () => {
    expect(environment.apiUrl).toBeDefined();
    expect(environment.apiUrl).toContain('http://');
    expect(environment.apiUrl).not.toMatch(/^\/api/);
    expect(environment.apiUrl).toContain('8081'); // Should point to backend port
  });

  /**
   * This test will fail if any service introduces relative URLs
   * It scans all injectable services for potential issues
   */
  it('should not have any services with relative API URLs', () => {
    const services = [
      TestBed.inject(MeetingService),
      TestBed.inject(ChatService),
      TestBed.inject(NotificationService),
      TestBed.inject(SettingsService),
      TestBed.inject(UserService)
    ];

    services.forEach((service: any, index) => {
      const serviceName = service.constructor.name;
      
      // Check all properties that might contain URLs
      Object.getOwnPropertyNames(service).forEach(prop => {
        const value = (service as any)[prop];
        if (typeof value === 'string' && (value.includes('/api/') || value.includes('api/'))) {
          if (value.startsWith('/api/') || value.startsWith('api/')) {
            fail(`❌ ${serviceName}.${prop} contains relative URL: ${value}. Use ApiConfigService.getApiUrl() instead!`);
          }
        }
      });
    });
  });
});