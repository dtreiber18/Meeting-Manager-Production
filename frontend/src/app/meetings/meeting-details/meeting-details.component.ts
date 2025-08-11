import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MeetingService } from '../meeting.service';
import { Meeting } from '../meeting.model';

@Component({
  selector: 'app-meeting-details',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './meeting-details.component.html',
  styleUrl: './meeting-details.component.scss'
})
export class MeetingDetailsComponent {
  meeting?: Meeting;
  constructor(private route: ActivatedRoute, private meetingService: MeetingService) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.meetingService.getMeeting(id).subscribe(data => this.meeting = data);
    }
  }
}
