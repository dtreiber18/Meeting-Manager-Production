import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { authInterceptor } from './auth/auth.interceptor';
import { urlNormalizationInterceptor } from './core/interceptors/url-normalization.interceptor';
import { QuillModule } from 'ngx-quill';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([
      urlNormalizationInterceptor, // Apply URL fixes BEFORE auth
      authInterceptor
    ])),
    importProvidersFrom(QuillModule.forRoot())
  ]
};
