import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService, ModalConfig } from '../modal.service';

export interface ParticipantEditData {
  participant: any;
  onSave: (participant: any) => void;
}

@Component({
  selector: 'app-participant-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Edit Participant</h2>
          <button class="close-btn" (click)="cancel()">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="participantName">Name</label>
            <input 
              id="participantName"
              type="text" 
              [(ngModel)]="editData.name"
              class="form-control"
              readonly>
          </div>
          
          <div class="form-group">
            <label for="participantEmail">Email</label>
            <input 
              id="participantEmail"
              type="email" 
              [(ngModel)]="editData.email"
              class="form-control"
              readonly>
          </div>
          
          <div class="form-group">
            <label for="participantRole">Role</label>
            <select 
              id="participantRole"
              [(ngModel)]="editData.participantRole"
              class="form-control">
              <option value="Attendee">Attendee</option>
              <option value="Presenter">Presenter</option>
              <option value="Organizer">Organizer</option>
              <option value="Required">Required Attendee</option>
              <option value="Optional">Optional Attendee</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="attendanceStatus">Attendance Status</label>
            <select 
              id="attendanceStatus"
              [(ngModel)]="editData.attendanceStatus"
              class="form-control">
              <option value="attended">Attended</option>
              <option value="absent">Absent</option>
              <option value="partial">Partial Attendance</option>
            </select>
          </div>
          
          <div class="form-group" *ngIf="editData.attendanceStatus === 'attended' || editData.attendanceStatus === 'partial'">
            <label for="attendanceDuration">Attendance Duration (minutes)</label>
            <input 
              id="attendanceDuration"
              type="number" 
              [(ngModel)]="editData.attendanceDurationMinutes"
              class="form-control"
              min="0"
              placeholder="Enter duration in minutes">
          </div>
          
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                [(ngModel)]="editData.presenter">
              <span class="checkmark"></span>
              Presenter
            </label>
            
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                [(ngModel)]="editData.isRequired">
              <span class="checkmark"></span>
              Required Attendee
            </label>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="cancel()">Cancel</button>
          <button class="btn btn-primary" (click)="save()">Save Changes</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./participant-edit-modal.component.scss']
})
export class ParticipantEditModalComponent implements OnInit {
  @Input() participant: any;
  @Input() config?: ModalConfig;
  @Input() modalService?: ModalService;
  @Input() onSave?: (participant: any) => void;

  editData: any = {};

  ngOnInit() {
    // Create a copy of the participant data for editing
    if (this.participant) {
      this.editData = { ...this.participant };
      
      // Set attended flag based on attendance status
      this.editData.attended = this.editData.attendanceStatus === 'attended';
    }
  }

  onOverlayClick(event: Event) {
    if (!this.config?.disableClose) {
      this.cancel();
    }
  }

  save() {
    // Update attended flag based on attendance status
    this.editData.attended = this.editData.attendanceStatus === 'attended';
    
    // Update timestamps
    this.editData.updatedAt = new Date().toISOString();
    
    if (this.onSave) {
      this.onSave(this.editData);
    }
    
    if (this.modalService) {
      this.modalService.saveModal(this.editData);
    }
  }

  cancel() {
    if (this.modalService) {
      this.modalService.cancelModal();
    }
  }
}
