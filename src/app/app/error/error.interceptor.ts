
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Log thông tin request trước khi gửi
    console.log('Request:', {
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: request.body
    });

    return next.handle(request).pipe(
      // Log response nếu thành công
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          console.log('Response:', {
            status: event.status,
            body: event.body,
            headers: event.headers
          });
        }
      }),
      // Bắt lỗi và log chi tiết
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error:', {
          status: error.status,
          message: error.message,
          url: error.url,
          error: error.error  // Response body từ server (nếu có)
        });

        // Phân loại lỗi cụ thể
        if (error.status === 0) {
          console.error('Lỗi kết nối: Backend không phản hồi hoặc bị chặn CORS.');
        } else if (error.status === 401) {
          console.error('Lỗi xác thực: Sai token hoặc không có quyền.');
        }

        // Chuyển tiếp lỗi để xử lý ở component
        return throwError(() => error);
      })
    );
  }
}