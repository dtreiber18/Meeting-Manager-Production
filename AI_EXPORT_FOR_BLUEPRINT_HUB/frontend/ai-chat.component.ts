import {
  Component,
  Input,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Message, PageType } from './chat.model'; // UPDATE: Adjust import path
import { ChatService } from './chat.service'; // UPDATE: Adjust import path
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <!-- Chat Toggle Button -->
    <button
      mat-fab
      color="primary"
      (click)="toggleChat()"
      class="chat-toggle-button"
      [attr.aria-label]="'AI Assistant'"
      matTooltip="AI Assistant"
    >
      <mat-icon>chat</mat-icon>
    </button>

    <!-- Chat Window -->
    <div class="chat-window" [class.chat-open]="isOpen" *ngIf="isOpen">
      <mat-card class="chat-card">
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header-content">
            <div class="chat-avatar">
              <mat-icon>smart_toy</mat-icon>
            </div>
            <div class="chat-title">
              <h3>Blueprint Hub AI</h3>
              <p>Here to help with this page</p>
            </div>
          </div>
          <button mat-icon-button (click)="closeChat()" aria-label="Close chat">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <!-- Messages -->
        <div class="chat-messages" #messagesContainer>
          <div class="message-list">
            <div
              *ngFor="let message of messages; trackBy: trackByMessageId"
              class="message-wrapper"
              [class.user-message]="message.isUser"
              [class.ai-message]="!message.isUser"
            >
              <div class="message-content">
                <div class="message-avatar">
                  <mat-icon>{{
                    message.isUser ? 'person' : 'smart_toy'
                  }}</mat-icon>
                </div>
                <div class="message-bubble">
                  <p class="message-text">{{ message.text }}</p>
                  <span class="message-timestamp">
                    {{ message.timestamp | date : 'HH:mm' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Loading indicator -->
            <div *ngIf="isLoading" class="message-wrapper ai-message">
              <div class="message-content">
                <div class="message-avatar">
                  <mat-icon>smart_toy</mat-icon>
                </div>
                <div class="message-bubble loading-bubble">
                  <div class="loading-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="chat-input-section">
          <mat-form-field appearance="outline" class="chat-input-field">
            <input
              matInput
              [(ngModel)]="inputText"
              (keydown.enter)="sendMessage()"
              placeholder="Ask me about Blueprint Hub..."
              [disabled]="isLoading"
              #messageInput
            />
          </mat-form-field>
          <button
            mat-icon-button
            color="primary"
            (click)="sendMessage()"
            [disabled]="!inputText.trim() || isLoading"
            aria-label="Send message"
          >
            <mat-icon>send</mat-icon>
          </button>
        </div>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .chat-toggle-button {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 1000;
        transition: transform 0.2s ease;
      }

      .chat-toggle-button:hover {
        transform: scale(1.05);
      }

      .chat-window {
        position: fixed;
        bottom: 96px;
        right: 24px;
        width: 384px;
        height: 480px;
        z-index: 1001;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
        pointer-events: none;
      }

      .chat-window.chat-open {
        opacity: 1;
        transform: translateY(0);
        pointer-events: all;
      }

      .chat-card {
        height: 100%;
        display: flex;
        flex-direction: column;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      }

      .chat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        background: #f5f5f5;
        border-bottom: 1px solid #e0e0e0;
      }

      .chat-header-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .chat-avatar {
        width: 32px;
        height: 32px;
        background: #1976d2;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .chat-avatar mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .chat-title h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: #212121;
      }

      .chat-title p {
        margin: 0;
        font-size: 12px;
        color: #757575;
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #fafafa;
      }

      .message-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .message-wrapper {
        display: flex;
        max-width: 80%;
      }

      .message-wrapper.user-message {
        align-self: flex-end;
        flex-direction: row-reverse;
      }

      .message-wrapper.ai-message {
        align-self: flex-start;
      }

      .message-content {
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }

      .user-message .message-content {
        flex-direction: row-reverse;
      }

      .message-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 4px;
      }

      .user-message .message-avatar {
        background: #1976d2;
        color: white;
      }

      .ai-message .message-avatar {
        background: #e0e0e0;
        color: #757575;
      }

      .message-avatar mat-icon {
        font-size: 12px;
        width: 12px;
        height: 12px;
      }

      .message-bubble {
        border-radius: 12px;
        padding: 8px 12px;
        max-width: 100%;
        word-wrap: break-word;
      }

      .user-message .message-bubble {
        background: #1976d2;
        color: white;
      }

      .ai-message .message-bubble {
        background: white;
        color: #212121;
        border: 1px solid #e0e0e0;
      }

      .message-text {
        margin: 0;
        font-size: 14px;
        line-height: 1.4;
      }

      .message-timestamp {
        font-size: 11px;
        opacity: 0.7;
        display: block;
        margin-top: 4px;
      }

      .loading-bubble {
        background: white !important;
        border: 1px solid #e0e0e0 !important;
        padding: 12px !important;
      }

      .loading-dots {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .dot {
        width: 6px;
        height: 6px;
        background: #757575;
        border-radius: 50%;
        animation: bounce 1.4s ease-in-out infinite both;
      }

      .dot:nth-child(1) {
        animation-delay: -0.32s;
      }
      .dot:nth-child(2) {
        animation-delay: -0.16s;
      }

      @keyframes bounce {
        0%,
        80%,
        100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1);
        }
      }

      .chat-input-section {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        padding: 16px;
        background: white;
        border-top: 1px solid #e0e0e0;
      }

      .chat-input-field {
        flex: 1;
        margin-bottom: -1.25em;
      }

      .chat-input-field ::ng-deep .mat-mdc-form-field-infix {
        min-height: auto;
      }

      .chat-input-field ::ng-deep .mat-mdc-text-field-wrapper {
        padding: 8px 12px;
      }

      /* Mobile responsiveness */
      @media (max-width: 640px) {
        .chat-window {
          left: 12px;
          right: 12px;
          bottom: 84px;
          width: auto;
        }

        .chat-toggle-button {
          bottom: 16px;
          right: 16px;
        }
      }
    `,
  ],
})
export class AiChatComponent implements OnDestroy, AfterViewChecked {
  @Input() context = '';
  @Input() pageType: PageType = 'home';

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isOpen = false;
  messages: Message[] = [];
  inputText = '';
  isLoading = false;
  private destroy$ = new Subject<void>();
  private shouldScrollToBottom = false;

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleChat(): void {
    if (!this.isOpen) {
      this.initializeChat();
    }
    this.isOpen = !this.isOpen;
  }

  closeChat(): void {
    this.isOpen = false;
  }

  sendMessage(): void {
    if (!this.inputText.trim() || this.isLoading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: this.inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    this.messages = [...this.messages, userMessage];
    const messageText = this.inputText.trim();
    this.inputText = '';
    this.isLoading = true;
    this.shouldScrollToBottom = true;

    this.chatService
      .generateAIResponse(messageText, this.pageType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: response,
            isUser: false,
            timestamp: new Date(),
          };
          this.messages = [...this.messages, aiMessage];
          this.isLoading = false;
          this.shouldScrollToBottom = true;
          this.cdr.detectChanges();
        },
        error: () => {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
            isUser: false,
            timestamp: new Date(),
          };
          this.messages = [...this.messages, errorMessage];
          this.isLoading = false;
          this.shouldScrollToBottom = true;
        },
      });
  }

  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }

  private initializeChat(): void {
    if (this.messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        text: this.chatService.getContextualWelcome(this.pageType),
        isUser: false,
        timestamp: new Date(),
      };
      this.messages = [welcomeMessage];
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const container = this.messagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}