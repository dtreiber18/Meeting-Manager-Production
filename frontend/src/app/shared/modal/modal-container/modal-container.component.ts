import { Component, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../modal.service';

@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container #modalContainer></ng-container>
  `,
  styles: []
})
export class ModalContainerComponent implements AfterViewInit {
  @ViewChild('modalContainer', { read: ViewContainerRef, static: true }) 
  modalContainer!: ViewContainerRef;

  constructor(private readonly modalService: ModalService) {}

  ngAfterViewInit() {
    this.modalService.setModalContainer(this.modalContainer);
  }
}
