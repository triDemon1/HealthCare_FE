import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi   } from '@angular/common/http';
import { ErrorInterceptor } from './app/error/error.interceptor'
import { routes } from './app.routes';
import * as appRoute from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(appRoute.routes),
    provideHttpClient(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    ErrorInterceptor
  ],
};
