// src/app/interceptors/credentials.interceptor.ts
import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse,
    HttpClient 
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs'; // Import throwError, BehaviorSubject, of
import { catchError, switchMap, filter, take } from 'rxjs/operators'; // Import các operators cần thiết
import { Router } from '@angular/router'; // Import Router để chuyển hướng


@Injectable()
export class CredentialsInterceptor implements HttpInterceptor {
    private isRefreshing = false; // Cờ để theo dõi trạng thái đang refresh token
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null); // Subject để phát ra token mới sau khi refresh thành công
    constructor(private http: HttpClient,
        private router: Router ) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        // *** Thêm withCredentials: true vào yêu cầu ***
        // Clone yêu cầu ban đầu và thêm tùy chọn withCredentials
        const modifiedRequest = request.clone({
            withCredentials: true // Bật gửi cookie và thông tin xác thực khác
        });

        // Chuyển yêu cầu đã sửa đổi và xử lý response
        return next.handle(modifiedRequest).pipe(
            catchError((error: HttpErrorResponse) => {
                // Kiểm tra nếu lỗi là 401 Unauthorized
                if (error.status === 401) {
                    // Đây có thể là lỗi do Access Token hết hạn hoặc Refresh Token hết hạn
                    // Kiểm tra xem đường dẫn request có phải là endpoint refresh token không
                    // để tránh vòng lặp vô hạn
                    if (request.url.includes('/api/auth/refresh-token')) {
                        // Nếu lỗi 401 từ chính request refresh token, nghĩa là Refresh Token đã hết hạn
                        // Chuyển hướng người dùng đến trang đăng nhập
                        this.handleRefreshTokenFailure();
                        return throwError(() => error); // Ném lại lỗi
                    }

                    // Nếu lỗi 401 từ các request API khác (có thể do Access Token hết hạn)
                    return this.handle401Error(modifiedRequest, next);
                }

                // Nếu không phải lỗi 401, ném lại lỗi ban đầu
                return throwError(() => error);
            })
        );
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Nếu đang trong quá trình refresh token, đợi token mới và thử lại request gốc
        if (this.isRefreshing) {
            return this.refreshTokenSubject.pipe(
                filter(token => token !== null), // Đợi cho đến khi có token mới
                take(1), // Chỉ lấy giá trị đầu tiên sau khi refresh thành công
                switchMap(() => next.handle(request.clone({ // Thử lại request gốc với cookie đã cập nhật
                    withCredentials: true // Đảm bảo withCredentials vẫn bật cho request thử lại
                })))
            );
        }

        // Nếu chưa đang refresh token, bắt đầu quá trình refresh
        this.isRefreshing = true;
        this.refreshTokenSubject.next(null); // Reset subject

        // Gọi API refresh token
        // Vì Refresh Token nằm trong HttpOnly cookie, chỉ cần gọi endpoint /refresh-token
        // Trình duyệt sẽ tự động đính kèm cookie
        return this.http.post('https://localhost:7064/api/auth/refresh-token', {}, { withCredentials: true }).pipe(
            switchMap((response: any) => { // Giả định response thành công trả về 200 OK
                this.isRefreshing = false;
                // Không cần xử lý Access/Refresh Token từ body response vì chúng nằm trong cookie HttpOnly
                // Chỉ cần thông báo rằng token đã được làm mới thành công (bằng cách phát ra giá trị không null)
                this.refreshTokenSubject.next(response); // Phát ra giá trị bất kỳ khác null để báo hiệu refresh thành công

                // Thử lại request gốc với cookie đã cập nhật
                return next.handle(request.clone({
                    withCredentials: true // Đảm bảo withCredentials vẫn bật cho request thử lại
                }));
            }),
            catchError((refreshError) => { // Bắt lỗi trong quá trình refresh token
                this.isRefreshing = false;
                // Nếu refresh token thất bại (ví dụ: trả về 401), chuyển hướng đến trang đăng nhập
                this.handleRefreshTokenFailure();
                return throwError(() => refreshError); // Ném lại lỗi refresh
            })
        );
    }

    private handleRefreshTokenFailure(): void {
        // Xử lý khi Refresh Token không còn giá trị: xóa token khỏi client-side (nếu có)
        // và chuyển hướng người dùng về trang đăng nhập
        console.error('Refresh Token expired or invalid. Redirecting to login.');
        // Bạn có thể cần xóa thêm các trạng thái đăng nhập khác nếu có
        // Ví dụ: localStorage.removeItem('userState');
        this.router.navigate(['/login']); // Chuyển hướng đến trang /login
    }
}
