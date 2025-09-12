import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService, ModalConfig } from '../modal.service';

export interface MeetingEditData {
  meeting: any;
  field: 'description' | 'summary' | 'nextSteps';
  onSave: (field: string, value: string) => void;
}

@Component({
  selector: 'app-meeting-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Edit {{ getFieldDisplayName() }}</h2>
          <button class="close-btn" (click)="cancel()">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label [for]="'field-' + field">{{ getFieldDisplayName() }}</label>
            <textarea 
              [id]="'field-' + field"
              [(ngModel)]="editValue"
              class="form-control textarea-large"
              [placeholder]="getPlaceholder()"
              rows="8">
            </textarea>
            <div class="char-count">
              {{ (editValue && editValue.length) || 0 }} characters
            </div>
          </div>
          
          <div class="field-info">
            <div class="info-item">
              <strong>Tips for {{ getFieldDisplayName() }}:</strong>
              <ul>
                <li *ngFor="let tip of getFieldTips()">{{ tip }}</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="cancel()">Cancel</button>
          <button class="btn btn-primary" (click)="save()" [disabled]="!hasChanges()">
            Save {{ getFieldDisplayName() }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./meeting-edit-modal.component.scss']
})
export class MeetingEditModalComponent implements OnInit {
  @Input() meeting: any;
  @Input() field: 'description' | 'summary' | 'nextSteps' = 'description';
  @Input() config?: ModalConfig;
  @Input() modalService?: ModalService;
  @Input() onSave?: (field: string, value: string) => void;

  editValue: string = '';
  originalValue: string = '';

  ngOnInit() {
    // Get the current value of the field
    if (this.meeting && this.field) {
      this.originalValue = this.meeting[this.field] || '';
      this.editValue = this.originalValue;
    }
  }

  getFieldDisplayName(): string {
    switch (this.field) {
      case 'description': return 'Description';
      case 'summary': return 'Meeting Summary';
      case 'nextSteps': return 'Next Steps';
      default: return 'Field';
    }
  }

  getPlaceholder(): string {
    switch (this.field) {
      case 'description':
        return 'Enter a detailed description of the meeting purpose, objectives, and context...';
      case 'summary':
        return 'Provide a comprehensive summary of what was discussed, decisions made, and key outcomes...';
      case 'nextSteps':
        return 'List the specific actions, follow-ups, and next steps that came out of this meeting...';
      default:
        return 'Enter your content here...';
    }
  }

  getFieldTips(): string[] {
    switch (this.field) {
      case 'description':
        return [
          'Include the meeting purpose and objectives',
          'Mention key topics to be covered',
          'Add any important context or background'
        ];
      case 'summary':
        return [
          'Summarize key discussion points',
          'Document important decisions made',
          'Note any unresolved issues or questions'
        ];
      case 'nextSteps':
        return [
          'List specific actions to be taken',
          'Include responsible parties when known',
          'Add deadlines or timelines where applicable'
        ];
      default:
        return [];
    }
  }

  hasChanges(): boolean {
    return this.editValue.trim() !== this.originalValue.trim();
  }

  onOverlayClick(event: Event) {
    if (!this.config?.disableClose) {
      this.cancel();
    }
  }

  save() {
    if (this.onSave) {
      this.onSave(this.field, this.editValue.trim());
    }
    
    if (this.modalService) {
      this.modalService.saveModal({
        field: this.field,
        value: this.editValue.trim()
      });
    }
  }

  cancel() {
    if (this.modalService) {
      this.modalService.cancelModal();
    }
  }
}
