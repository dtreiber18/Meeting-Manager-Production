import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MeetingFormComponent } from './meeting-form.component';
import { MeetingService } from '../meeting.service';
import { Meeting } from '../meeting.model';
import { of, Subject } from 'rxjs';

describe('MeetingFormComponent', () => {
  let component: MeetingFormComponent;
  let fixture: ComponentFixture<MeetingFormComponent>;
  let mockActivatedRoute: Partial<ActivatedRoute>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockMeetingService: jasmine.SpyObj<MeetingService>;

  const createMockMeeting = (id = 1): Meeting => ({
    id,
    title: 'Test Meeting',
    description: 'Test Description',
    startTime: '2024-01-01T10:00:00Z',
    endTime: '2024-01-01T11:00:00Z',
    meetingType: 'team',
    status: 'scheduled',
    priority: 'medium',
    isRecurring: false,
    isPublic: false,
    requiresApproval: false,
    allowRecording: true,
    autoTranscription: false,
    aiAnalysisEnabled: false,
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-01T09:00:00Z',
    organization: {
      id: 1,
      name: 'Test Org',
      domain: 'test.com',
      timezone: 'UTC',
      isActive: true,
      maxUsers: 100,
      maxMeetings: 1000,
      subscriptionTier: 'basic',
      currentUserCount: 10,
      currentMeetingCount: 5,
      createdAt: '2024-01-01T08:00:00Z',
      updatedAt: '2024-01-01T08:00:00Z'
    },
    organizer: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      isActive: true,
      emailNotifications: true,
      pushNotifications: true,
      timezone: 'UTC',
      language: 'en',
      displayName: 'John Doe',
      fullName: 'John Doe',
      roles: [],
      createdAt: '2024-01-01T07:00:00Z',
      updatedAt: '2024-01-01T07:00:00Z'
    },
    participants: [],
    actionItems: [],
    notes: [],
    attachments: [],
    details: 'Test details',
    durationInMinutes: 60,
    upcoming: true,
    inProgress: false,
    subject: 'Test Meeting',
    type: 'team'
  });

  beforeEach(async () => {
    // Create mock objects
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    } as unknown as ActivatedRoute;
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockMeetingService = jasmine.createSpyObj('MeetingService', ['getMeeting', 'createMeeting', 'updateMeeting']);
    mockMeetingService.getMeeting.and.returnValue(of(createMockMeeting()));
    mockMeetingService.createMeeting.and.returnValue(of(createMockMeeting()));
    mockMeetingService.updateMeeting.and.returnValue(of(createMockMeeting()));
    
    // Add the meetingsUpdated$ observable that components subscribe to
    mockMeetingService.meetingsUpdated$ = new Subject<boolean>().asObservable();

    await TestBed.configureTestingModule({
      imports: [MeetingFormComponent, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: MeetingService, useValue: mockMeetingService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeetingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
