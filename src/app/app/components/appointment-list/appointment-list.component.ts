// appointment-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingDto } from '../../models/BookingDto.interface';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { Pagination } from '../../models/pagination.interface';
import { debounceTime } from 'rxjs';
// Import các thành phần từ RxJS
import { Observable, BehaviorSubject, Subscription, catchError, of, switchMap, tap, startWith } from 'rxjs';
import { distinctUntilChanged } from 'rxjs';


@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.css'
})
export class AppointmentListComponent implements OnInit, OnDestroy {
  // Observable chứa kết quả phân trang
  // Template sẽ subscribe tới Observable này bằng async pipe
  pagedBookings$!: Observable<Pagination<BookingDto>>;

  isLoading = true; // Trạng thái loading ban đầu
  errorMessage: string | null = null;
  customerId: number | undefined; // Lưu customerId đã lấy từ AuthService
  // Biến cho tìm kiếm
  searchTerm: string = ''; // Biến lưu giá trị thanh tìm kiếm
  private searchTerms = new BehaviorSubject<string>('');

  // Trạng thái phân trang (sẽ được quản lý bởi BehaviorSubject)
  // Sử dụng biến nội bộ để lưu trữ state hiện tại
  private _pageIndex: number = 0; // Index trang hiện tại (bắt đầu từ 0)
  private _pageSize: number = 10; // Số mục mỗi trang (có thể thay đổi)

  // BehaviorSubject để chủ động kích hoạt việc tải lại dữ liệu
  // Khi pageIndex hoặc pageSize thay đổi, chúng ta sẽ next() giá trị mới vào Subject này
  private paginationParamsSubject = new BehaviorSubject<{ pageIndex: number, pageSize: number, customerId: number | undefined, searchTerm: string }>({
    pageIndex: this._pageIndex,
    pageSize: this._pageSize,
    customerId: undefined, // customerId sẽ được cập nhật sau trong ngOnInit
    searchTerm: ''
  });

  // Subscription để theo dõi kết quả từ pagedBookings$ nếu cần (optional)
  // private pagedBookingsSubscription!: Subscription;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    public router: Router
  ) {
    // Lấy customerId từ AuthService ngay trong constructor hoặc ngOnInit
    // Lấy ở đây đảm bảo có giá trị sớm nhất có thể
    this.customerId = this.authService.getCustomerId();
  }

  ngOnInit(): void {
    // Kiểm tra customerId trước khi thiết lập pipeline
    if (this.customerId === undefined || this.customerId <= 0) {
      this.isLoading = false; // Tắt loading nếu không có customerId hợp lệ
      this.errorMessage = "Thông tin khách hàng không khả dụng. Vui lòng đăng nhập lại.";
      console.error("CustomerId is not set or invalid.");
      this.pagedBookings$ = of({ items: [], totalCount: 0, pageIndex: 0, pageSize: this._pageSize, totalPages: 0, hasPreviousPage: false, hasNextPage: false });
      return; // Dừng nếu không có customerId hợp lệ
    }

    // Cập nhật customerId trong Subject lần đầu tiên
    // Điều này sẽ kích hoạt pipeline lần đầu tiên
    this.paginationParamsSubject.next({
      pageIndex: this._pageIndex,
      pageSize: this._pageSize,
      customerId: this.customerId, // Sử dụng customerId đã lấy
      searchTerm: this.searchTerm
    });


    // Thiết lập pipeline reactive để tải dữ liệu
    this.pagedBookings$ = this.paginationParamsSubject.asObservable().pipe(
      tap(params => {
        this.isLoading = true;
        this.errorMessage = null;
        console.log('Fetching bookings for customer:', params.customerId, 'Page:', params.pageIndex, 'Size:', params.pageSize, 'Search:', params.searchTerm);
      }),
      switchMap(params => {
        return this.bookingService.getCustomerBookings(params.customerId!, params.pageIndex, params.pageSize, params.searchTerm).pipe(
          tap(result => {
            console.log("Phản hồi dữ liệu phân trang:", result);
            this.isLoading = false;
          }),
          catchError(err => {
            console.error('Error fetching paged bookings:', err);
            this.errorMessage = 'Không thể tải danh sách lịch đặt. Vui lòng thử lại.';
            this.isLoading = false;
            return of({ items: [], totalCount: 0, pageIndex: params.pageIndex, pageSize: params.pageSize, totalPages: 0, hasPreviousPage: false, hasNextPage: false });
          })
        );
      })
    );

    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(term => console.log('Search term changed:', term))
    ).subscribe(term => {
      this._pageIndex = 0;
      this.paginationParamsSubject.next({
        pageIndex: this._pageIndex,
        pageSize: this._pageSize,
        customerId: this.customerId,
        searchTerm: term
      });
    });
  }

  ngOnDestroy(): void {
    // Đảm bảo BehaviorSubject được complete khi component bị hủy
    this.paginationParamsSubject.complete();
  }

  // Cập nhật hàm goToPage để thay đổi Subject thay vì gọi service trực tiếp
  goToPage(pageIndex: number): void {
    // Lấy customerId hiện tại (đã lấy trong constructor/ngOnInit)
    const currentCustomerId = this.customerId;

    // Kiểm tra pageIndex hợp lệ và customerId tồn tại
    // Kiểm tra totalPages sẽ được làm trong template bằng async pipe hoặc trong getter
    if (pageIndex >= 0 && currentCustomerId !== undefined && currentCustomerId > 0) {
      this._pageIndex = pageIndex; // Cập nhật biến nội bộ

      // Kích hoạt lại pipeline bằng cách gửi giá trị mới vào Subject
      this.paginationParamsSubject.next({
        pageIndex: this._pageIndex,
        pageSize: this._pageSize,
        customerId: currentCustomerId, // Truyền customerId cố định
        searchTerm: this.searchTerm
      });
    }
  }

  get pageIndex(): number {
    return this._pageIndex;
  }
  get pageSize(): number {
    return this._pageSize;
  }

  isFirstPage(pagedResult: Pagination<BookingDto> | null): boolean {
    // Kiểm tra pagedResult có tồn tại và pageIndex
    return pagedResult ? pagedResult.pageIndex === 0 : true;
  }

  isLastPage(pagedResult: Pagination<BookingDto> | null): boolean {
    // Kiểm tra pagedResult có tồn tại và pageIndex, totalPages
    return pagedResult ? pagedResult.pageIndex === pagedResult.totalPages - 1 : true;
  }

  // Hàm getPageNumbers vẫn giữ nguyên logic đơn giản trả về mảng số trang (0-based index)
  getPageNumbers(pagedResult: Pagination<BookingDto> | null): number[] {
    if (!pagedResult || pagedResult.totalPages <= 0) {
      return [];
    }
    return Array.from({ length: pagedResult.totalPages }, (_, i) => i);
  }

  cancelBooking(bookingId: number): void {
    if (confirm('Bạn có chắc chắn muốn hủy lịch đặt này không?')) {
      this.isLoading = true;
      this.errorMessage = null;

      this.bookingService.cancelBooking(bookingId).subscribe({
        next: (response) => {
          console.log('Booking cancelled successfully:', response);
          this.paginationParamsSubject.next({
            pageIndex: this._pageIndex,
            pageSize: this._pageSize,
            customerId: this.customerId,
            searchTerm: this.searchTerm
          });
          alert('Lịch đặt đã được hủy thành công.');
        },
        error: (error) => {
          console.error('Error cancelling booking:', error);
          this.errorMessage = error.message || 'Không thể hủy lịch đặt. Vui lòng thử lại.';
          this.isLoading = false;
        }
      });
    }
  }

  // Hàm kiểm tra điều kiện hiển thị nút Hủy (Đã cập nhật kiểm tra trạng thái thanh toán)
  shouldShowCancelButton(booking: BookingDto): boolean {
    // Nút Hủy hiển thị khi trạng thái booking KHÔNG phải là 'Completed' và 'Cancelled'
    // VÀ trạng thái thanh toán KHÔNG phải là 'Completed'
    const bookingStatusAllowCancel = booking.statusName !== 'Completed' && booking.statusName !== 'Cancelled';
    const paymentStatusAllowCancel = booking.paymentStatusName !== 'Completed';

    return bookingStatusAllowCancel && paymentStatusAllowCancel;
  }


  // Các hàm khác giữ nguyên
  proceedToPayment(bookingId: number): void {
    console.log('Proceeding to payment for booking:', bookingId);
    this.router.navigate(['/payment', bookingId]);
  }

  shouldShowPayButton(booking: BookingDto): boolean {
    const unpaidStatuses = ['Pending', 'Failed', 'Chưa thanh toán', 'Cancelled'];
    const nonCancellableBookingStatuses = ['Completed'];
    return booking.paymentStatusName !== undefined && booking.paymentStatusName !== null && unpaidStatuses.includes(booking.paymentStatusName)
      && !nonCancellableBookingStatuses.includes(booking.paymentStatusName);
  }

  getPaymentButtonText(paymentStatus: string | undefined): string {
    if (paymentStatus === 'Failed' || paymentStatus === 'Cancelled') {
      return 'Thanh toán lại';
    } else {
      return 'Thanh toán';
    }
  }
}