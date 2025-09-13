import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  level: number; // 1 = User, 2 = Assistant, 3 = System Admin
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface UserWithRoles {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: Role[];
  displayName: string;
  fullName: string;
}

// Role constants
export const ROLES = {
  USER: 'USER',
  ASSISTANT: 'ASSISTANT', 
  SYSTEM_ADMIN: 'SYSTEM_ADMIN'
} as const;

// Permission constants
export const PERMISSIONS = {
  // Meeting permissions
  MEETING_CREATE: 'meeting:create',
  MEETING_READ: 'meeting:read',
  MEETING_UPDATE: 'meeting:update',
  MEETING_DELETE: 'meeting:delete',
  MEETING_MANAGE_ALL: 'meeting:manage_all',
  
  // User permissions
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE_ALL: 'user:manage_all',
  
  // System permissions
  SYSTEM_ADMIN: 'system:admin',
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_MONITORING: 'system:monitoring',
  
  // Organization permissions
  ORG_READ: 'organization:read',
  ORG_UPDATE: 'organization:update',
  ORG_ADMIN: 'organization:admin',
  
  // Notification permissions
  NOTIFICATION_SEND: 'notification:send',
  NOTIFICATION_MANAGE: 'notification:manage'
} as const;

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private currentUserSubject = new BehaviorSubject<UserWithRoles | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private rolesSubject = new BehaviorSubject<Role[]>([]);
  public roles$ = this.rolesSubject.asObservable();

  constructor() {
    this.initializeDefaultRoles();
  }

  private initializeDefaultRoles(): void {
    const defaultRoles: Role[] = [
      {
        id: '1',
        name: ROLES.USER,
        displayName: 'User',
        description: 'Standard user with basic meeting access',
        level: 1,
        isSystemRole: true,
        permissions: [
          {
            id: '1',
            name: PERMISSIONS.MEETING_CREATE,
            description: 'Create new meetings',
            resource: 'meeting',
            action: 'create'
          },
          {
            id: '2',
            name: PERMISSIONS.MEETING_READ,
            description: 'View meetings',
            resource: 'meeting',
            action: 'read'
          },
          {
            id: '3',
            name: PERMISSIONS.MEETING_UPDATE,
            description: 'Update own meetings',
            resource: 'meeting',
            action: 'update'
          },
          {
            id: '4',
            name: PERMISSIONS.USER_READ,
            description: 'View user profiles',
            resource: 'user',
            action: 'read'
          }
        ]
      },
      {
        id: '2',
        name: ROLES.ASSISTANT,
        displayName: 'Assistant',
        description: 'Advanced user with meeting management capabilities',
        level: 2,
        isSystemRole: true,
        permissions: [
          {
            id: '1',
            name: PERMISSIONS.MEETING_CREATE,
            description: 'Create new meetings',
            resource: 'meeting',
            action: 'create'
          },
          {
            id: '2',
            name: PERMISSIONS.MEETING_READ,
            description: 'View all meetings',
            resource: 'meeting',
            action: 'read'
          },
          {
            id: '3',
            name: PERMISSIONS.MEETING_UPDATE,
            description: 'Update any meeting',
            resource: 'meeting',
            action: 'update'
          },
          {
            id: '4',
            name: PERMISSIONS.MEETING_DELETE,
            description: 'Delete meetings',
            resource: 'meeting',
            action: 'delete'
          },
          {
            id: '5',
            name: PERMISSIONS.USER_READ,
            description: 'View user profiles',
            resource: 'user',
            action: 'read'
          },
          {
            id: '6',
            name: PERMISSIONS.USER_UPDATE,
            description: 'Update user information',
            resource: 'user',
            action: 'update'
          },
          {
            id: '7',
            name: PERMISSIONS.NOTIFICATION_SEND,
            description: 'Send notifications',
            resource: 'notification',
            action: 'send'
          }
        ]
      },
      {
        id: '3',
        name: ROLES.SYSTEM_ADMIN,
        displayName: 'System Administrator',
        description: 'Full system access with administrative capabilities',
        level: 3,
        isSystemRole: true,
        permissions: [
          {
            id: '1',
            name: PERMISSIONS.MEETING_MANAGE_ALL,
            description: 'Full meeting management access',
            resource: 'meeting',
            action: 'manage_all'
          },
          {
            id: '2',
            name: PERMISSIONS.USER_MANAGE_ALL,
            description: 'Full user management access',
            resource: 'user',
            action: 'manage_all'
          },
          {
            id: '3',
            name: PERMISSIONS.SYSTEM_ADMIN,
            description: 'System administration access',
            resource: 'system',
            action: 'admin'
          },
          {
            id: '4',
            name: PERMISSIONS.SYSTEM_SETTINGS,
            description: 'Manage system settings',
            resource: 'system',
            action: 'settings'
          },
          {
            id: '5',
            name: PERMISSIONS.SYSTEM_MONITORING,
            description: 'Access system monitoring',
            resource: 'system',
            action: 'monitoring'
          },
          {
            id: '6',
            name: PERMISSIONS.ORG_ADMIN,
            description: 'Organization administration',
            resource: 'organization',
            action: 'admin'
          },
          {
            id: '7',
            name: PERMISSIONS.NOTIFICATION_MANAGE,
            description: 'Manage notification system',
            resource: 'notification',
            action: 'manage'
          }
        ]
      }
    ];

    this.rolesSubject.next(defaultRoles);
  }

  /**
   * Set the current user
   */
  setCurrentUser(user: UserWithRoles | null): void {
    this.currentUserSubject.next(user);
  }

  /**
   * Get the current user
   */
  getCurrentUser(): UserWithRoles | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if current user has a specific role
   */
  hasRole(roleName: string): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => {
        if (!user) return false;
        return user.roles.some(role => role.name === roleName);
      })
    );
  }

  /**
   * Check if current user has a specific permission
   */
  hasPermission(permissionName: string): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => {
        if (!user) return false;
        return user.roles.some(role => 
          role.permissions.some(permission => permission.name === permissionName)
        );
      })
    );
  }

  /**
   * Check if current user has any of the specified roles
   */
  hasAnyRole(roleNames: string[]): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => {
        if (!user) return false;
        return user.roles.some(role => roleNames.includes(role.name));
      })
    );
  }

  /**
   * Check if current user has any of the specified permissions
   */
  hasAnyPermission(permissionNames: string[]): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => {
        if (!user) return false;
        return user.roles.some(role => 
          role.permissions.some(permission => permissionNames.includes(permission.name))
        );
      })
    );
  }

  /**
   * Get the highest role level for the current user
   */
  getCurrentUserLevel(): Observable<number> {
    return this.currentUser$.pipe(
      map(user => {
        if (!user || !user.roles.length) return 0;
        return Math.max(...user.roles.map(role => role.level));
      })
    );
  }

  /**
   * Check if current user is a System Admin
   */
  isSystemAdmin(): Observable<boolean> {
    return this.hasRole(ROLES.SYSTEM_ADMIN);
  }

  /**
   * Check if current user is at least an Assistant
   */
  isAssistantOrAbove(): Observable<boolean> {
    return this.hasAnyRole([ROLES.ASSISTANT, ROLES.SYSTEM_ADMIN]);
  }

  /**
   * Get role by name
   */
  getRoleByName(roleName: string): Observable<Role | undefined> {
    return this.roles$.pipe(
      map(roles => roles.find(role => role.name === roleName))
    );
  }

  /**
   * Get all available roles
   */
  getAllRoles(): Observable<Role[]> {
    return this.roles$;
  }

  /**
   * Get roles that current user can assign (must be lower level)
   */
  getAssignableRoles(): Observable<Role[]> {
    return this.getCurrentUserLevel().pipe(
      map(currentLevel => {
        const allRoles = this.rolesSubject.value;
        return allRoles.filter(role => role.level < currentLevel);
      })
    );
  }
}
