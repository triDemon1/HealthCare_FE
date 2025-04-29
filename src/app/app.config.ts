import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ErrorInterceptor } from './app/error/error.interceptor'
import { routes } from './app.routes';
import * as appRoute from './app.routes';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CredentialsInterceptor } from './app/auth/credentials.interceptors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoute.routes),
    provideHttpClient(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    // *** Đăng ký CredentialsInterceptor ***
    {
      provide: HTTP_INTERCEPTORS, // Token để đăng ký Interceptor
      useClass: CredentialsInterceptor, // Lớp Interceptor của bạn
      multi: true // Rất quan trọng: Cho phép nhiều Interceptor cùng tồn tại
    },
    ErrorInterceptor
  ],
};
