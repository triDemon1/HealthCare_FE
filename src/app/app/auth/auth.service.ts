import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  getToken(): string | null {
    return localStorage.getItem('token'); // Lấy token từ localStorage
  }

  getRole(): string | null {
    const token = this.getToken();
    console.log("Token lấy từ localStorage:", token); // Debug

    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      console.log("Decoded Token:", decodedToken); // Debug token sau khi decode
      return decodedToken?.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
    } catch (error) {
      console.error("Lỗi decode token:", error);
      return null;
    }
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  isUser(): boolean {
    return this.getRole() === 'user';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token'); // Xóa token khi logout
    window.location.href = '/login'; // Chuyển hướng về trang đăng nhập
  }
  // getUserAvatar(): string {
  //   const user = this.getRole();
  //   return user && user.avatar ? user.avatar : 'assets/default-avatar.png';
  // }
}
