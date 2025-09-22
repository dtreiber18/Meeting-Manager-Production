import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, User, LoginRequest, AuthResponse } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    organizationId: 'org1',
    organizationName: 'Test Org',
    roles: ['USER'],
    permissions: ['READ'],
    isActive: true
  };

  const mockAuthResponse: AuthResponse = {
    user: mockUser,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNzI1MDEyMDAwfQ.mock-signature',
    refreshToken: 'mock.refresh.token',
    expiresIn: 3600,
    calendarAuthUrl: 'https://login.microsoftonline.com/authorize'
  };

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should authenticate user and store credentials', () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      let result: AuthResponse | undefined;

      service.login(credentials).subscribe(response => {
        result = response;
      });

      const req = httpMock.expectOne(
        'https://ca-backend-jq7rzfkj24zqy.mangoriver-904fd974.eastus.azurecontainerapps.io/api/auth/login'
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);

      req.flush(mockAuthResponse);

      expect(result).toEqual(mockAuthResponse);
      expect(localStorage.getItem('mm_auth_token')).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNzI1MDEyMDAwfQ.mock-signature');
      expect(localStorage.getItem('mm_refresh_token')).toBe('mock.refresh.token');
      expect(localStorage.getItem('mm_user')).toBe(JSON.stringify(mockUser));
    });

    it('should update authentication state on successful login', () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      let currentUser: User | null = null;
      let isAuthenticated = false;

      service.currentUser$.subscribe(user => currentUser = user);
      service.isAuthenticated$.subscribe(auth => isAuthenticated = auth);

      service.login(credentials).subscribe();

      const req = httpMock.expectOne(service['API_URL'] + '/auth/login');
      req.flush(mockAuthResponse);

      expect(currentUser).toEqual(jasmine.objectContaining(mockUser));
      expect(isAuthenticated).toBe(true);
    });

    it('should handle login errors', () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      let error: HttpErrorResponse | undefined;

      service.login(credentials).subscribe({
        next: () => fail('Should have errored'),
        error: (err) => error = err
      });

      const req = httpMock.expectOne(service['API_URL'] + '/auth/login');
      req.flush(
        { message: 'Invalid credentials' },
        { status: 401, statusText: 'Unauthorized' }
      );

      expect(error).toBeTruthy();
      expect(error?.status).toBe(401);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      // Set up authenticated state
      localStorage.setItem('mm_auth_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNzI1MDEyMDAwfQ.mock-signature');
      localStorage.setItem('mm_refresh_token', 'mock.refresh.token');
      localStorage.setItem('mm_user', JSON.stringify(mockUser));
      service['currentUserSubject'].next(mockUser);
      service['isAuthenticatedSubject'].next(true);
    });

    it('should clear authentication state and storage', () => {
      service.logout();

      expect(localStorage.getItem('mm_auth_token')).toBeNull();
      expect(localStorage.getItem('mm_refresh_token')).toBeNull();
      expect(localStorage.getItem('mm_user')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/auth']);
    });

    it('should update authentication observables', () => {
      let currentUser: User | null = mockUser;
      let isAuthenticated = true;

      service.currentUser$.subscribe(user => currentUser = user);
      service.isAuthenticated$.subscribe(auth => isAuthenticated = auth);

      service.logout();

      expect(currentUser).toBeNull();
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', () => {
      service['currentUserSubject'].next(mockUser);
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    it('should return null when no user is authenticated', () => {
      service['currentUserSubject'].next(null);
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', () => {
      service['isAuthenticatedSubject'].next(true);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when user is not authenticated', () => {
      service['isAuthenticatedSubject'].next(false);
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('hasPermission', () => {
    beforeEach(() => {
      service['currentUserSubject'].next(mockUser);
    });

    it('should return true if user has permission', () => {
      expect(service.hasPermission('READ')).toBe(true);
    });

    it('should return false if user does not have permission', () => {
      expect(service.hasPermission('WRITE')).toBe(false);
    });

    it('should return false if no user is authenticated', () => {
      service['currentUserSubject'].next(null);
      expect(service.hasPermission('READ')).toBe(false);
    });
  });

  describe('hasRole', () => {
    beforeEach(() => {
      service['currentUserSubject'].next(mockUser);
    });

    it('should return true if user has role', () => {
      expect(service.hasRole('USER')).toBe(true);
    });

    it('should return false if user does not have role', () => {
      expect(service.hasRole('ADMIN')).toBe(false);
    });

    it('should return false if no user is authenticated', () => {
      service['currentUserSubject'].next(null);
      expect(service.hasRole('USER')).toBe(false);
    });
  });

  describe('token management', () => {
    it('should generate auth headers with token', () => {
      localStorage.setItem('mm_auth_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNzI1MDEyMDAwfQ.mock-signature');
      const headers = service.getAuthHeaders();
      expect(headers.get('Authorization')).toBe('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNzI1MDEyMDAwfQ.mock-signature');
    });

    it('should detect expired tokens', () => {
      // Create an expired token (exp timestamp in the past)
      const expiredToken = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 }));
      const fullToken = `header.${expiredToken}.signature`;
      
      expect(service['isTokenExpired'](fullToken)).toBe(true);
    });

    it('should detect valid tokens', () => {
      // Create a valid token (exp timestamp in the future)
      const validToken = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
      const fullToken = `header.${validToken}.signature`;
      
      expect(service['isTokenExpired'](fullToken)).toBe(false);
    });
  });
});
