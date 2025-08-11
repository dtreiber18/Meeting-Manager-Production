import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MeetingService } from '../meeting.service';
import { Meeting } from '../meeting.model';

@Component({
  selector: 'app-meeting-form',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './meeting-form.component.html',
  styleUrl: './meeting-form.component.scss'
})
export class MeetingFormComponent {
  meeting: Partial<Meeting> = {};
  isEdit = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meetingService: MeetingService
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.meetingService.getMeeting(id).subscribe(data => this.meeting = data);
    }
  }

  save() {
    if (this.isEdit && this.meeting.id) {
      this.meetingService.updateMeeting(this.meeting.id, this.meeting as Meeting).subscribe(() => this.router.navigate(['/meetings', this.meeting.id]));
    } else {
      this.meetingService.createMeeting(this.meeting as Meeting).subscribe((created) => this.router.navigate(['/meetings', created.id]));
    }
  }
}
