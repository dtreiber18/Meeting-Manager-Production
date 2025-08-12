import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MeetingService } from './meetings/meeting.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let mockMeetingService: jasmine.SpyObj<MeetingService>;

  beforeEach(async () => {
    // Create a spy object for MeetingService
    mockMeetingService = jasmine.createSpyObj('MeetingService', ['getMeetings']);
    mockMeetingService.getMeetings.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: MeetingService, useValue: mockMeetingService }
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
