// src/app/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Import interfaces for DTOs
import { UserCreateUpdateDto } from '../models/UserCreateUpdateDto.interface';
import { UserAdminDto } from '../models/userAdminDto';
import { BookingAdminDto } from '../models/BookingAdminDto.interface';
import { OrderAdminDto } from '../models/OrderAdminDto.interface';
import { RoleDto } from '../models/RoleDto.interface';
import { BookingStatusDto } from '../models/BookingStatus.interface';
import { OrderStatusDto } from '../models/OrderStatus.interface';
import { StatusUpdateDto } from '../models/StatusUpdate.interface';
import { StaffAdminDetailDto } from '../models/userAdminDto';
import { BookingUpdateDto } from '../models/BookingUpdateDto.interface';
import { Pagination } from '../models/pagination.interface';


@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrlUser = 'https://localhost:7064/api/UserManagement'; // Adjust based on your backend Route
  private apiUrlRole = 'https://localhost:7064/api/LookUpData';
  private apiUrlBooking = 'https://localhost:7064/api/BookingManagement';
  private apiUrlOrder = 'https://localhost:7064/api/OrderManagement';
  constructor(private http: HttpClient) { }

  // Gọi đến endpoint backend mới/đã sửa để hỗ trợ phân trang
  getPagedUsers(pageIndex: number, pageSize: number, currentRoleId: number | null = null): Observable<Pagination<UserAdminDto>> {
    // Tạo HttpParams để thêm pageIndex và pageSize vào query string
    let params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());
      if (currentRoleId !== null) {
        params = params.set('roleId', currentRoleId.toString()); // Chuyển đổi số sang chuỗi cho query param
      }
    // Gọi API backend. Backend endpoint được giả định là giống getAllUsers cũ
    // nhưng giờ hỗ trợ query params phân trang.
    return this.http.get<Pagination<UserAdminDto>>(`${this.apiUrlUser}/admin/users`, { params: params })
      .pipe(catchError(this.handleError));
  }

  getUserById(userId: number): Observable<UserAdminDto> {
    return this.http.get<UserAdminDto>(`${this.apiUrlUser}/admin/users/${userId}`)
      .pipe(catchError(this.handleError));
  }

  createUser(userDto: UserCreateUpdateDto): Observable<UserAdminDto> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<UserAdminDto>(`${this.apiUrlUser}/admin/users`, userDto, { headers })
      .pipe(catchError(this.handleError));
  }

  updateUser(userId: number, userDto: UserCreateUpdateDto): Observable<UserAdminDto> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<UserAdminDto>(`${this.apiUrlUser}/admin/users/${userId}`, userDto, { headers })
      .pipe(catchError(this.handleError));
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlUser}/admin/users/${userId}`)
      .pipe(catchError(this.handleError));
  }
  getAllStaff(): Observable<StaffAdminDetailDto[]> {
    return this.http.get<StaffAdminDetailDto[]>(`${this.apiUrlUser}/admin/staff`) // Assuming /api/admin/staff endpoint
       .pipe(catchError(this.handleError));
 }

  // --- Booking Management API Calls ---
  getAllBookings(): Observable<BookingAdminDto[]> {
    return this.http.get<BookingAdminDto[]>(`${this.apiUrlBooking}/admin/bookings`)
      .pipe(catchError(this.handleError));
  }

  getBookingById(bookingId: number): Observable<BookingAdminDto> {
    return this.http.get<BookingAdminDto>(`${this.apiUrlBooking}/admin/bookings/${bookingId}`)
      .pipe(catchError(this.handleError));
  }
  updateBookingStatus(bookingId: number, statusDto: StatusUpdateDto): Observable<BookingAdminDto> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<BookingAdminDto>(`${this.apiUrlBooking}/admin/bookings/${bookingId}/status`, statusDto, { headers })
      .pipe(catchError(this.handleError));
  }
  updateBooking(bookingId: number, payload: BookingUpdateDto): Observable<BookingAdminDto> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // PUT endpoint is now /api/admin/bookings/{bookingId}
    return this.http.put<BookingAdminDto>(`${this.apiUrlBooking}/admin/bookings/${bookingId}`, payload, { headers })
      .pipe(catchError(this.handleError));
  }
  deleteBooking(bookingId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlBooking}/admin/bookings/${bookingId}`) // Assuming DELETE /api/admin/bookings/{bookingId}
      .pipe(catchError(this.handleError));
  }

  // --- Order Management API Calls ---
  getAllOrders(): Observable<OrderAdminDto[]> {
    return this.http.get<OrderAdminDto[]>(`${this.apiUrlOrder}/admin/orders`)
      .pipe(catchError(this.handleError));
  }

  updateOrderStatus(orderId: number, statusDto: StatusUpdateDto): Observable<OrderAdminDto> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<OrderAdminDto>(`${this.apiUrlOrder}/admin/orders/${orderId}/status`, statusDto, { headers })
      .pipe(catchError(this.handleError));
  }

   getOrderById(orderId: number): Observable<OrderAdminDto> {
    return this.http.get<OrderAdminDto>(`${this.apiUrlOrder}/admin/orders/${orderId}`)
      .pipe(catchError(this.handleError));
  }


  // --- Lookup Data API Calls ---
  getAllRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(`${this.apiUrlRole}/admin/roles`)
      .pipe(catchError(this.handleError));
  }

   getAllBookingStatuses(): Observable<BookingStatusDto[]> {
    return this.http.get<BookingStatusDto[]>(`${this.apiUrlRole}/admin/bookingstatuses`)
      .pipe(catchError(this.handleError));
  }

   getAllOrderStatus(): Observable<OrderStatusDto[]> {
    return this.http.get<OrderStatusDto[]>(`${this.apiUrlRole}/admin/orderstatuses`)
      .pipe(catchError(this.handleError));
  }


  private handleError(error: any) {
    console.error('Admin API Error:', error);
    let userMessage = 'Đã xảy ra lỗi khi gọi API Admin. Vui lòng thử lại.';

    if (error.status === 401 || error.status === 403) {
        userMessage = 'Bạn không có quyền truy cập chức năng này.';
        // Có thể thêm logic chuyển hướng về trang đăng nhập hoặc trang báo lỗi
    } else if (error.error && error.error.message) {
        userMessage = error.error.message; // Sử dụng thông báo lỗi từ backend
    } else if (error.message) {
        userMessage = error.message; // Sử dụng thông báo lỗi mặc định
    }

    return throwError(() => new Error(userMessage));
  }
}
