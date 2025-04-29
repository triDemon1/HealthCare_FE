// src/app/register/register.service.ts
// Service xử lý việc gọi API đăng ký
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterData } from '../models/register.interface'; // Import interface
import { RegisterErrorResponse } from '../models/register.interface';

@Injectable({
  providedIn: 'root' // Đăng ký service ở root
})
export class RegisterService {

  // Thay thế bằng URL base của API backend của bạn
  private apiUrl = 'https://localhost:7064/api/auth'; // Ví dụ: https://localhost:7000/api/auth

  constructor(private http: HttpClient) { }

  /**
   * Gửi dữ liệu đăng ký đến API backend.
   * @param registerData Dữ liệu đăng ký từ form.
   * @returns Observable<any> Kết quả từ API.
   */
  register(registerData: RegisterData,): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // Gửi yêu cầu POST đến endpoint /register
    // HttpClient sẽ tự động serialize registerData thành JSON
    return this.http.post(`${this.apiUrl}/register`, registerData, {headers});
  }

  // Các phương thức khác liên quan đến đăng ký nếu cần
}
