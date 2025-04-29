import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Vẫn cần HttpClient nếu LoginService dùng nó
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { LoginRequest, LoginResponse } from '../../models/login.interface'; // Import interface
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-login',
  standalone: true, // Thêm standalone: true nếu dùng standalone components
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(
    private loginService: LoginService,
    private router: Router,
    public authService: AuthService // Giữ lại AuthService nếu cần kiểm tra trạng thái trong template
  ) { }

  login() {
    const loginData: LoginRequest = {
      Username: this.username,
      Password: this.password
    };

    // Gọi phương thức login từ LoginService và subscribe
    // Giả định LoginService gọi API đăng nhập và Backend sẽ set Cookie HttpOnly
    this.loginService.login(loginData).subscribe({
      next: (response: LoginResponse) => { // Đảm bảo kiểu dữ liệu phù hợp với response từ backend
        console.log("Phản hồi đăng nhập thành công:", response);

        // Xử lý phản hồi thành công trong AuthService
        // AuthService sẽ lưu thông tin user từ response payload và cập nhật trạng thái
        this.authService.handleLoginSuccess(response);
        console.log("Đăng nhập thành công, điều hướng...");
        this.router.navigate(['/']);

      },
      error: (err) => {
        console.error('Lỗi đăng nhập:', err);
        // Xử lý lỗi và hiển thị thông báo cho người dùng
        if (err.status === 0) {
          alert('Không thể kết nối đến server. Kiểm tra kết nối mạng và đảm bảo backend đang chạy.');
        } else if (err.status === 401 || err.status === 400) {
             alert('Sai tài khoản hoặc mật khẩu!');
        }
          else {
          alert(`Đăng nhập thất bại: ${err.message || 'Đã xảy ra lỗi.'}`);
        }
      }
    });
  }
}