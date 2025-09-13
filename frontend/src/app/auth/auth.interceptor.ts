import { Injectable, inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);

  // Skip auth header for auth endpoints
  if (isAuthEndpoint(request.url)) {
    console.log('🔐 Skipping auth for endpoint:', request.url);
    return next(request);
  }

  // Add auth header if user is authenticated
  if (authService.isAuthenticated()) {
    console.log('🔐 Adding auth header for:', request.url);
    request = addAuthHeader(request, authService);
    console.log('🔐 Request headers:', request.headers.get('Authorization') ? 'Has Authorization' : 'Missing Authorization');
  } else {
    console.log('🔐 User not authenticated for:', request.url);
  }

  return next(request).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        console.log('🔐 401 error, attempting refresh for:', request.url);
        return handle401Error(request, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function addAuthHeader(request: HttpRequest<any>, authService: AuthService): HttpRequest<any> {
  const token = authService.getToken();
  console.log('🔐 Token from service:', token ? `${token.substring(0, 10)}...` : 'null');
  
  if (!token) {
    console.log('🔐 No token available, skipping auth header');
    return request;
  }
  
  const newRequest = request.clone({
    setHeaders: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('🔐 Added Authorization header:', newRequest.headers.has('Authorization'));
  return newRequest;
}

function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((tokenResponse) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokenResponse.token);
        return next(addAuthHeader(request, authService));
      }),
      catchError((error) => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => error);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(() => next(addAuthHeader(request, authService)))
    );
  }
}

function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/') || url.includes('/public/');
}

// Keep the class version for backward compatibility
@Injectable()
export class AuthInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: any): Observable<HttpEvent<any>> {
    return authInterceptor(request, next.handle.bind(next));
  }
}
