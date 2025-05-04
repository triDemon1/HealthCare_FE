import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams  } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BookingPayload } from '../models/bookingPayload.interface';
import { SubjectType } from '../models/subjecttypes.interface';
import { Service } from '../models/services.interface';
import { ExistingSubject } from '../models/existingSubject.interface';
import { CustomerAddress } from '../models/customerAddress.interface';
import { BookingDto } from '../models/BookingDto.interface';
@Injectable({
    providedIn: 'root'
  })
  export class BookingService {
    private apiUrl = 'https://localhost:7064/api/Booking'; // URL gốc của API backend
  
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
    // --- NEW: Hàm để gọi API lấy danh sách booking của khách hàng ---
    getCustomerBookings(customerId: number): Observable<BookingDto[]> {
      const url = `${this.apiUrl}/customers/${customerId}/bookings`;
      console.log('Calling API:', url); // Log để debug URL
      return this.http.get<BookingDto[]>(url)
        .pipe(catchError(this.handleError)); // Sử dụng lại hàm xử lý lỗi đã có
   }
  
    private handleError(error: any) {
      console.error('API Error:', error);
      // Trả về một thông báo lỗi thân thiện với người dùng hoặc throwError
      return throwError(() => new Error('Đã xảy ra lỗi khi gọi API. Vui lòng thử lại.'));
    }
}