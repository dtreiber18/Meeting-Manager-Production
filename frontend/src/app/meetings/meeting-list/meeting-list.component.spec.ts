import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MeetingListComponent } from './meeting-list.component';
import { MeetingService } from '../meeting.service';
import { Meeting } from '../meeting.model';
import { of, Subject } from 'rxjs';

describe('MeetingListComponent', () => {
  let component: MeetingListComponent;
  let fixture: ComponentFixture<MeetingListComponent>;
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
    mockMeetingService = jasmine.createSpyObj('MeetingService', ['getMeetings', 'deleteMeeting']);
    mockMeetingService.getMeetings.and.returnValue(of([createMockMeeting()]));
    mockMeetingService.deleteMeeting.and.returnValue(of(undefined));
    
    // Add the meetingsUpdated$ observable that components subscribe to
    mockMeetingService.meetingsUpdated$ = new Subject<boolean>().asObservable();

    await TestBed.configureTestingModule({
      imports: [MeetingListComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        { provide: MeetingService, useValue: mockMeetingService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeetingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
