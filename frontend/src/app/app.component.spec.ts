import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MeetingService } from './meetings/meeting.service';
import { AuthService } from './auth/auth.service';
import { of, Subject, BehaviorSubject } from 'rxjs';

describe('AppComponent', () => {
  let mockMeetingService: jasmine.SpyObj<MeetingService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    // Create a spy object for MeetingService
    mockMeetingService = jasmine.createSpyObj('MeetingService', ['getMeetings']);
    mockMeetingService.getMeetings.and.returnValue(of([]));
    
    // Add the meetingsUpdated$ observable that components subscribe to
    mockMeetingService.meetingsUpdated$ = new Subject<boolean>().asObservable();
    
    // Create a spy object for AuthService
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'login', 'logout', 'getCurrentUser', 'isAuthenticated', 'hasPermission', 'hasRole'
    ]);
    
    // Add the observables that components subscribe to
    mockAuthService.currentUser$ = new BehaviorSubject(null).asObservable();
    mockAuthService.isAuthenticated$ = new BehaviorSubject(false).asObservable();
    
    // Set default return values
    mockAuthService.getCurrentUser.and.returnValue(null);
    mockAuthService.isAuthenticated.and.returnValue(false);
    mockAuthService.hasPermission.and.returnValue(false);
    mockAuthService.hasRole.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: MeetingService, useValue: mockMeetingService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'Meeting Manager - Enterprise Application' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Meeting Manager - Enterprise Application');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // Check if the component renders without crashing - the exact title location may vary
    expect(compiled.textContent).toContain('Meeting Manager');
  });
});
