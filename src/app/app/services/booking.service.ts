import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BookingPayload } from '../models/bookingPayload.interface';
import { SubjectType } from '../models/subjecttypes.interface';
import { Service } from '../models/services.interface';
import { ExistingSubject } from '../models/existingSubject.interface';
import { CustomerAddress } from '../models/customerAddress.interface';
import { BookingDto } from '../models/BookingDto.interface';
import { PaymentInitiateResponse } from '../models/PaymentInitiateResponse .Interface';
import { PaymentStatus } from '../models/paymentStatus.interface';
import { Pagination } from '../models/pagination.interface';
@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'https://localhost:7064/api/Booking'; // URL gốc của API backend
  private apiUrlPayment = 'https://localhost:7064/api';

  constructor(private http: HttpClient) { }

  getSubjectTypes(): Observable<SubjectType[]> {
    return this.http.get<SubjectType[]>(`${this.apiUrl}/subjecttypes`)
      .pipe(catchError(this.handleError));
  }

  // Lấy TẤT CẢ services, việc lọc sẽ thực hiện ở frontend
  getAllServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services`)
      .pipe(catchError(this.handleError));
  }
  getAllPaymentStatus(): Observable<PaymentStatus[]> {
    return this.http.get<PaymentStatus[]>(`${this.apiUrl}/paymentStatus`)
      .pipe(catchError(this.handleError));
  }

  // Hoặc: Lấy services đã được lọc bởi backend
  getServicesBySubjectType(subjectTypeId: number): Observable<Service[]> {
    const params = new HttpParams().set('subjecttypeid', subjectTypeId.toString());
    return this.http.get<Service[]>(`${this.apiUrl}/services`, { params })
      .pipe(catchError(this.handleError));
  }

  getCustomerAddresses(customerId: number): Observable<CustomerAddress[]> {
    return this.http.get<CustomerAddress[]>(`${this.apiUrl}/customers/${customerId}/addresses`)
      .pipe(catchError(this.handleError));
  }

  getExistingSubjects(customerId: number, typeId: number): Observable<ExistingSubject[]> {
    const params = new HttpParams().set('typeId', typeId.toString());
    return this.http.get<ExistingSubject[]>(`${this.apiUrl}/customers/${customerId}/subjects`, { params })
      .pipe(catchError(this.handleError));
  }


  createBooking(payload: BookingPayload): Observable<any> {
    // Backend sẽ dựa vào subjectId hoặc newSubjectData để xử lý
    console.log('BookingPayload gửi đi từ Service:', JSON.stringify(payload)); // Log để kiểm tra
    return this.http.post<any>(`${this.apiUrl}/bookings`, payload)
      .pipe(catchError(this.handleError));
  }
  createPaymentForBooking(bookingId: number): Observable<PaymentInitiateResponse> {
    
    const paymentUrl = `${this.apiUrlPayment}/Payments/create-for-booking`;
    // Bạn có thể cần gửi ReturnUrl và CancelUrl từ frontend nếu backend không cấu hình sẵn
    // Hoặc backend sẽ tự thêm các URL này từ cấu hình
    const body = {
      bookingId: bookingId,
      paymentMethodId: 1, // Hoặc ID phương thức thanh toán được chọn
      ReturnUrl: '',
      CancelUrl: '' ,
    };
    console.log('Calling API to create payment:', paymentUrl, 'with body:', body);
    return this.http.post<PaymentInitiateResponse>(paymentUrl, body)
      .pipe(catchError(this.handleError));
  }
  // --- UPDATED: Hàm để gọi API lấy danh sách booking của khách hàng với phân trang ---
  getCustomerBookings(customerId: number, pageIndex: number, pageSize: number): Observable<Pagination<BookingDto>> {
    let params = new HttpParams();
    params = params.append('pageIndex', pageIndex.toString());
    params = params.append('pageSize', pageSize.toString());

    const url = `${this.apiUrl}/customers/${customerId}/bookings`;
    console.log('Calling API:', url, 'with params:', params.toString()); // Log để debug URL và params
    return this.http.get<Pagination<BookingDto>>(url, { params })
      .pipe(catchError(this.handleError)); // Sử dụng lại hàm xử lý lỗi đã có
  }
  getBookingById(bookingId: number): Observable<BookingDto> {
    const url = `${this.apiUrl}/bookings/${bookingId}`; // Giả định API endpoint là /api/Booking/bookings/{bookingId}
    console.log('Calling API to get booking by ID:', url);
    return this.http.get<BookingDto>(url)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    // Trả về một thông báo lỗi thân thiện với người dùng hoặc throwError
    return throwError(() => new Error('Đã xảy ra lỗi khi gọi API. Vui lòng thử lại.'));
  }
}