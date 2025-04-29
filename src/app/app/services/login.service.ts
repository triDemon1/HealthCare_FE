// src/app/auth/login.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/login.interface'; // Import interfaces

@Injectable({
  providedIn: 'root' // Đảm bảo service là singleton và có sẵn trong root injector
})
export class LoginService {

  private apiUrl = 'https://localhost:7064/api/auth/login'; // Lưu URL API

  constructor(private http: HttpClient) { }

  // Phương thức xử lý logic gọi API đăng nhập
  login(loginData: LoginRequest): Observable<LoginResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    console.log('Data gửi đi từ Service:', JSON.stringify(loginData)); // Log để kiểm tra

    // Thực hiện gọi API POST
    // Trả về Observable để component có thể subscribe và xử lý kết quả/lỗi
    return this.http.post<LoginResponse>(this.apiUrl, loginData, { headers });
  }

  // Có thể thêm các phương thức khác liên quan đến login/auth nếu cần
  // Ví dụ: logout(), register(), forgotPassword(), ...
  
}