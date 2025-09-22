import { Injectable, ComponentRef, ViewContainerRef, Type } from '@angular/core';
import { Subject } from 'rxjs';

export interface ModalData {
  [key: string]: unknown;
}

export interface ModalConfig<T = ModalData> {
  title: string;
  component?: Type<unknown>;
  data?: T;
  width?: string;
  height?: string;
  disableClose?: boolean;
}

export interface ModalResult<T = ModalData> {
  action: 'save' | 'cancel';
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalContainer?: ViewContainerRef;
  private activeModal?: ComponentRef<unknown>;
  private readonly modalResult = new Subject<ModalResult<unknown>>();

  setModalContainer(container: ViewContainerRef) {
    this.modalContainer = container;
  }

  openModal<T = ModalData>(config: ModalConfig<T>): Promise<ModalResult<T>> {
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
        (this.activeModal.instance as ModalData)['config'] = config;
        (this.activeModal.instance as ModalData)['modalService'] = this;
      }
    }

    return new Promise((resolve) => {
      const subscription = this.modalResult.subscribe((result) => {
        resolve(result as ModalResult<T>);
        subscription.unsubscribe();
      });
    });
  }

  closeModal<T = ModalData>(result?: ModalResult<T>) {
    if (this.activeModal) {
      this.activeModal.destroy();
      this.activeModal = undefined;
    }

    this.modalResult.next((result || { action: 'cancel' }) as ModalResult<unknown>);
  }

  saveModal<T = ModalData>(data?: T) {
    this.closeModal({ action: 'save', data });
  }

  cancelModal() {
    this.closeModal({ action: 'cancel' });
  }
}
