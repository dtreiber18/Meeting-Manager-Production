import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          // Check for required permissions if specified in route data
          const requiredPermissions = route.data['permissions'] as string[];
          const requiredRoles = route.data['roles'] as string[];

          if (requiredPermissions && requiredPermissions.length > 0) {
            const hasPermission = requiredPermissions.some(permission => 
              this.authService.hasPermission(permission)
            );
            if (!hasPermission) {
              this.router.navigate(['/unauthorized']);
              return false;
            }
          }

          if (requiredRoles && requiredRoles.length > 0) {
            const hasRole = requiredRoles.some(role => 
              this.authService.hasRole(role)
            );
            if (!hasRole) {
              this.router.navigate(['/unauthorized']);
              return false;
            }
          }

          return true;
        } else {
          this.router.navigate(['/auth'], { queryParams: { returnUrl: state.url } });
          return false;
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> | boolean {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          this.router.navigate(['/dashboard']);
          return false;
        }
        return true;
      })
    );
  }
}
