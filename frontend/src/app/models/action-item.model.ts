export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  fullName?: string;
}

export interface Meeting {
  id: number;
  title: string;
}

export interface Organization {
  id: number;
  name: string;
}

export enum ActionItemStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ActionItemPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum ActionItemType {
  TASK = 'TASK',
  FOLLOW_UP = 'FOLLOW_UP',
  DECISION = 'DECISION',
  RESEARCH = 'RESEARCH',
  APPROVAL = 'APPROVAL',
  DOCUMENTATION = 'DOCUMENTATION',
  MEETING = 'MEETING'
}

export interface ActionItem {
  id: number;
  title: string;
  description?: string;
  status: ActionItemStatus;
  priority: ActionItemPriority;
  type: ActionItemType;
  dueDate?: Date;
  startDate?: Date;
  completedAt?: Date;
  completed: boolean;
  isRecurring: boolean;
  recurringPattern?: string;
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
  completionNotes?: string;
  tags?: string;
  createdAt: Date;
  updatedAt: Date;
  lastReminderSent?: Date;
  
  // Relationships
  meeting?: Meeting;
  assignee?: User;
  reporter?: User;
  organization?: Organization;
  subTasks?: ActionItem[];
  parentActionItem?: ActionItem;
  
  // Helper properties
  assignedTo?: string; // Legacy compatibility
}

export interface CreateActionItemRequest {
  title: string;
  description?: string;
  priority?: ActionItemPriority;
  type?: ActionItemType;
  dueDate?: Date;
  startDate?: Date;
  estimatedHours?: number;
  notes?: string;
  tags?: string;
  assigneeId?: number;
  meetingId?: number;
  isRecurring?: boolean;
  recurringPattern?: string;
}

export interface UpdateActionItemRequest {
  title?: string;
  description?: string;
  status?: ActionItemStatus;
  priority?: ActionItemPriority;
  type?: ActionItemType;
  dueDate?: Date;
  startDate?: Date;
  completed?: boolean;
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
  completionNotes?: string;
  tags?: string;
  assigneeId?: number;
  isRecurring?: boolean;
  recurringPattern?: string;
}

export interface ActionItemFilter {
  status?: ActionItemStatus[];
  priority?: ActionItemPriority[];
  type?: ActionItemType[];
  assigneeId?: number;
  reporterId?: number;
  meetingId?: number;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  completed?: boolean;
  overdue?: boolean;
  dueSoon?: boolean; // Due within X days
  search?: string;
  tags?: string[];
}

export interface ActionItemSummary {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  overdue: number;
  dueSoon: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  byType: {
    task: number;
    followUp: number;
    decision: number;
    research: number;
    approval: number;
    documentation: number;
    meeting: number;
  };
}

// Helper functions
export function getActionItemStatusColor(status: ActionItemStatus): string {
  switch (status) {
    case ActionItemStatus.OPEN:
      return 'text-blue-600';
    case ActionItemStatus.IN_PROGRESS:
      return 'text-yellow-600';
    case ActionItemStatus.BLOCKED:
      return 'text-red-600';
    case ActionItemStatus.COMPLETED:
      return 'text-green-600';
    case ActionItemStatus.CANCELLED:
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
}

export function getActionItemPriorityColor(priority: ActionItemPriority): string {
  switch (priority) {
    case ActionItemPriority.LOW:
      return 'text-green-600';
    case ActionItemPriority.MEDIUM:
      return 'text-yellow-600';
    case ActionItemPriority.HIGH:
      return 'text-orange-600';
    case ActionItemPriority.URGENT:
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

export function getActionItemStatusIcon(status: ActionItemStatus): string {
  switch (status) {
    case ActionItemStatus.OPEN:
      return 'radio_button_unchecked';
    case ActionItemStatus.IN_PROGRESS:
      return 'pending';
    case ActionItemStatus.BLOCKED:
      return 'block';
    case ActionItemStatus.COMPLETED:
      return 'check_circle';
    case ActionItemStatus.CANCELLED:
      return 'cancel';
    default:
      return 'help_outline';
  }
}

export function getActionItemPriorityIcon(priority: ActionItemPriority): string {
  switch (priority) {
    case ActionItemPriority.LOW:
      return 'keyboard_arrow_down';
    case ActionItemPriority.MEDIUM:
      return 'remove';
    case ActionItemPriority.HIGH:
      return 'keyboard_arrow_up';
    case ActionItemPriority.URGENT:
      return 'priority_high';
    default:
      return 'help_outline';
  }
}

export function isActionItemOverdue(actionItem: ActionItem): boolean {
  return actionItem.dueDate != null && 
         !actionItem.completed && 
         new Date() > new Date(actionItem.dueDate);
}

export function isActionItemDueSoon(actionItem: ActionItem, days: number = 3): boolean {
  if (!actionItem.dueDate || actionItem.completed) {
    return false;
  }
  
  const today = new Date();
  const dueDate = new Date(actionItem.dueDate);
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  
  return daysUntilDue >= 0 && daysUntilDue <= days;
}

export function getActionItemProgressPercentage(actionItem: ActionItem): number {
  if (actionItem.completed) return 100;
  
  if (!actionItem.subTasks || actionItem.subTasks.length === 0) {
    switch (actionItem.status) {
      case ActionItemStatus.OPEN:
        return 0;
      case ActionItemStatus.IN_PROGRESS:
        return 50;
      case ActionItemStatus.BLOCKED:
        return 25;
      case ActionItemStatus.COMPLETED:
        return 100;
      case ActionItemStatus.CANCELLED:
        return 0;
      default:
        return 0;
    }
  }
  
  // Calculate based on subtasks
  const completedSubtasks = actionItem.subTasks.filter(st => st.completed).length;
  return Math.round((completedSubtasks * 100) / actionItem.subTasks.length);
}

export function formatActionItemDueDate(dueDate: Date | undefined): string {
  if (!dueDate) return 'No due date';
  
  const date = new Date(dueDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString();
  }
}