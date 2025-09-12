import { Injectable, ComponentRef, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';

export interface ModalConfig {
  title: string;
  component?: any;
  data?: any;
  width?: string;
  height?: string;
  disableClose?: boolean;
}

export interface ModalResult {
  action: 'save' | 'cancel';
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalContainer?: ViewContainerRef;
  private activeModal?: ComponentRef<any>;
  private modalResult = new Subject<ModalResult>();

  setModalContainer(container: ViewContainerRef) {
    this.modalContainer = container;
  }

  openModal(config: ModalConfig): Promise<ModalResult> {
    if (!this.modalContainer) {
      throw new Error('Modal container not set');
    }

    // Clear any existing modal
    this.closeModal();

    // Create modal component dynamically
    if (config.component) {
      this.activeModal = this.modalContainer.createComponent(config.component);
      
      // Pass data to modal
      if (config.data && this.activeModal.instance) {
        Object.assign(this.activeModal.instance, config.data);
      }

      // Set up modal configuration
      if (this.activeModal.instance) {
        this.activeModal.instance.config = config;
        this.activeModal.instance.modalService = this;
      }
    }

    return new Promise((resolve) => {
      const subscription = this.modalResult.subscribe((result) => {
        resolve(result);
        subscription.unsubscribe();
      });
    });
  }

  closeModal(result?: ModalResult) {
    if (this.activeModal) {
      this.activeModal.destroy();
      this.activeModal = undefined;
    }

    this.modalResult.next(result || { action: 'cancel' });
  }

  saveModal(data?: any) {
    this.closeModal({ action: 'save', data });
  }

  cancelModal() {
    this.closeModal({ action: 'cancel' });
  }
}
