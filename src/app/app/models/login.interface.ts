// src/app/auth/login.interface.ts

// Định nghĩa cấu trúc dữ liệu gửi đi khi đăng nhập
export interface LoginRequest {
  Username: string;
  Password: string;
}

// Định nghĩa cấu trúc dữ liệu nhận về khi đăng nhập thành công
// Dựa trên response hiện tại chỉ có 'token'
export interface LoginResponse {
  userid: number;
  username: string;
  role: string; // Đây là role mà AuthService sẽ sử dụng
  customerid: number | undefined;
  addressId:number | undefined;
}