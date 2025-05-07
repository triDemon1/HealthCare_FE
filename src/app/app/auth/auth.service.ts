import { Injectable } from '@angular/core';
import { LoginResponse } from '../models/login.interface';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser: LoginResponse | null = null;

  constructor(private http: HttpClient, private router: Router) {

    this.loadUserInfo();
  }
  private loadUserInfo(): void {
    const userInfo = sessionStorage.getItem('currentUserInfo');
    if (userInfo) {
      this.currentUser = JSON.parse(userInfo);
      // this._isAuthenticated.next(true);
      console.log("User info loaded:", this.currentUser);
    } else {
      this.currentUser = null;
      // this._isAuthenticated.next(false);
    }
  }

  // Lưu thông tin user nhận được từ response đăng nhập
  private saveUserInfo(userInfo: any): void {
    this.currentUser = userInfo;
    // Lưu tạm thông tin user (không phải token) vào sessionStorage nếu cần duy trì qua refresh
    // Lưu ý: sessionStorage vẫn có rủi ro XSS, chỉ lưu thông tin không quá nhạy cảm
    sessionStorage.setItem('currentUserInfo', JSON.stringify(userInfo));
    // this._isAuthenticated.next(true);
    console.log("User info saved:", this.currentUser);
  }

  // Xóa thông tin user khi logout
  private removeUserInfo(): void {
    this.currentUser = null;
    sessionStorage.removeItem('currentUserInfo'); // Xóa thông tin tạm
    // this._isAuthenticated.next(false);
    console.log("User info removed.");
  }
  // Response nhận được là LoginResponse chứa Userid, Username, Role
  handleLoginSuccess(response: LoginResponse): void {
    // Kiểm tra xem response có chứa các thuộc tính cần thiết không
    if (response?.userid && response?.username && response?.role) {
      console.log("User info nhận được từ server:", response);
      this.saveUserInfo(response);
      // Token được Backend set vào Cookie HttpOnly, không cần lưu ở đây
      // console.log("Token (không hiển thị vì HttpOnly):...", "N/A"); // Không thể truy cập token
    } else {
      console.error('Phản hồi đăng nhập không có đủ thông tin user (Userid, Username, Role)');
      // Xử lý lỗi hoặc thông báo cho người dùng
      // Nếu backend chỉ trả về cookie, bạn có thể cần gọi 1 API profile sau đó
    }
  }

  // Lấy thông tin user
  getUser(): any | null {
    return this.currentUser;
  }
  getCustomerId(): number | undefined {
    return this.currentUser?.customerid;
  }
  getAddressId():number | undefined {
    return this.currentUser?.addressId;
  }

  // Lấy Role từ thông tin user đã lưu
  getRole(): string | null {
    return this.currentUser?.role || null; // Giả định user info có thuộc tính 'role'
  }

  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }

  isUser(): boolean {
    return this.getRole() === 'Customer';
  }

  // Kiểm tra trạng thái đăng nhập dựa trên việc có thông tin user hay không
  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  // *** Cập nhật phương thức logout để gọi API backend ***
  logout(): void {
    // Xóa thông tin user client-side ngay lập tức để giao diện phản hồi nhanh
    this.removeUserInfo();
    this.http.post('https://localhost:7064/api/auth/logout', {}, {
      withCredentials: true,
      // *** Thêm tùy chọn responseType: 'text' ***
      responseType: 'text' // <--- Thêm dòng này
    }).pipe(
      tap((response) => {
        console.log("Backend logout API call successful:", response);
        // Chuyển hướng người dùng sau khi API gọi xong (thành công)
        this.redirectToLogin();
      }),
      catchError(error => {
        console.error("Error calling backend logout API:", error);
        this.redirectToLogin();
        return throwError(() => error); // Ném lại lỗi sau khi xử lý
      })
    ).subscribe(); // Quan trọng: Cần subscribe để Observable thực thi
  }

  private redirectToLogin(): void {
    console.log("Redirecting to login page...");
    // Sử dụng Angular Router để chuyển hướng
    this.router.navigate(['/login']);
    // Hoặc dùng window.location.href = '/login'; nếu bạn không muốn dùng Router
    // window.location.href = '/login';
  }
}