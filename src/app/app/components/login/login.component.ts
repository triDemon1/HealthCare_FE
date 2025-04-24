import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  constructor(private http: HttpClient, private router: Router, public authService: AuthService) { }
  login() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const loginData = {
      Email: this.email, // Đảm bảo đúng tên trường (phân biệt hoa thường)
      Password: this.password
    };
    console.log('Data gửi đi:', JSON.stringify(loginData));

    this.http.post<any>('https://localhost:7064/api/auth/login', loginData, { headers }).subscribe({
      next: (response) => {
        if (response?.token) {
          console.log("Token trong response:", response.token); // Kiểm tra token
          localStorage.setItem('token', response.token);

          // Kiểm tra token sau khi lưu
          console.log("Token từ localStorage:", localStorage.getItem('token'));
          
          console.log("User Role After Login:", this.authService.getRole());
          this.router.navigate(['/']);
        } else {
          console.error('Phản hồi không hợp lệ từ server');
          alert('Đăng nhập thất bại: Phản hồi không hợp lệ');
        }
      },
      error: (err) => {
        console.error('Lỗi đăng nhập:', err);
        if (err.status === 0) {
          alert('Không thể kết nối đến server. Kiểm tra kết nối mạng và đảm bảo backend đang chạy.');
        } else {
          alert('Sai tài khoản hoặc mật khẩu!');
        }
      }
    });
  }

}
