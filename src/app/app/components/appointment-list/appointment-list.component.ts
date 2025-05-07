// appointment-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingDto } from '../../models/BookingDto.interface';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { Pagination } from '../../models/pagination.interface';
// Import các thành phần từ RxJS
import { Observable, BehaviorSubject, Subscription, catchError, of, switchMap, tap, startWith } from 'rxjs';


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

  // Trạng thái phân trang (sẽ được quản lý bởi BehaviorSubject)
  // Sử dụng biến nội bộ để lưu trữ state hiện tại
  private _pageIndex: number = 0; // Index trang hiện tại (bắt đầu từ 0)
  private _pageSize: number = 10; // Số mục mỗi trang (có thể thay đổi)

  // BehaviorSubject để chủ động kích hoạt việc tải lại dữ liệu
  // Khi pageIndex hoặc pageSize thay đổi, chúng ta sẽ next() giá trị mới vào Subject này
  private paginationParamsSubject = new BehaviorSubject<{ pageIndex: number, pageSize: number, customerId: number | undefined }>({
    pageIndex: this._pageIndex,
    pageSize: this._pageSize,
    customerId: undefined // customerId sẽ được cập nhật sau trong ngOnInit
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
       customerId: this.customerId // Sử dụng customerId đã lấy
     });


    // Thiết lập pipeline reactive để tải dữ liệu
    this.pagedBookings$ = this.paginationParamsSubject.asObservable().pipe(
       // startWith({ pageIndex: this._pageIndex, pageSize: this._pageSize, customerId: this.customerId }), // Có thể dùng startWith thay cho next() ban đầu
       tap(() => {
         this.isLoading = true; // Bật loading trước khi gọi API
         this.errorMessage = null; // Xóa lỗi cũ
         console.log('Fetching bookings for customer:', this.customerId, 'Page:', this._pageIndex, 'Size:', this._pageSize);
       }),
      switchMap(params => {
        // Gọi service để lấy dữ liệu phân trang
        // Đảm bảo params.customerId không undefined ở đây (đã kiểm tra trong ngOnInit)
        // Service getCustomerBookings đã được cập nhật để nhận pageIndex và pageSize
        return this.bookingService.getCustomerBookings(params.customerId!, params.pageIndex, params.pageSize).pipe(
          tap(result => {
            console.log("Phản hồi dữ liệu phân trang:", result);
            this.isLoading = false; // Tắt loading khi có dữ liệu
          }),
          catchError(err => {
            console.error('Error fetching paged bookings:', err);
            this.errorMessage = 'Không thể tải danh sách lịch đặt. Vui lòng thử lại.';
            this.isLoading = false; // Tắt loading khi có lỗi
            // Trả về một Observable rỗng với cấu trúc Pagination để template không bị lỗi async pipe
            return of({ items: [], totalCount: 0, pageIndex: params.pageIndex, pageSize: params.pageSize, totalPages: 0, hasPreviousPage: false, hasNextPage: false });
          })
        );
      })
      // Nếu cần xử lý kết quả sau switchMap, thêm các toán tử khác ở đây
      // tap(pagedResult => { ... })
    );

    // Optional: Subscribe nếu bạn cần thực hiện side-effects khi dữ liệu thay đổi
    // Ví dụ: lưu tổng số trang vào một biến riêng nếu cần logic phức tạp ngoài template
    // this.pagedBookingsSubscription = this.pagedBookings$.subscribe(pagedResult => {
    //    // this.totalPages = pagedResult.totalPages; // Ví dụ
    // });
  }

  ngOnDestroy(): void {
    // Đảm bảo BehaviorSubject được complete khi component bị hủy
    this.paginationParamsSubject.complete();
    // Optional: Hủy subscribe nếu bạn đã subscribe tường minh ở trên
    // if (this.pagedBookingsSubscription) {
    //   this.pagedBookingsSubscription.unsubscribe();
    // }
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
         customerId: currentCustomerId // Truyền customerId cố định
       });
    }
  }

   // Getter đơn giản để lấy pageIndex hiện tại cho template (không cần theo dõi reactive)
   // Template có thể dùng (pagedBookings$ | async)?.pageIndex thay thế
   get pageIndex(): number {
      return this._pageIndex;
   }

   // Getter đơn giản để lấy pageSize hiện tại cho template (không cần theo dõi reactive)
   // Template có thể dùng (pagedBookings$ | async)?.pageSize thay thế
    get pageSize(): number {
        return this._pageSize;
    }


  // Các hàm trợ giúp kiểm tra trạng thái trang và lấy số trang hiển thị
  // Các hàm này sẽ nhận pagedResult từ template thông qua async pipe
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

  // Getter để truy cập an toàn mảng items cho template
  // Template sẽ dùng (pagedBookings$ | async)?.items
  // Getter này có thể không cần thiết nếu template dùng async pipe đúng cách
  // get bookingItems(): BookingDto[] {
  //     return this.pagedBookings$ ? (this.pagedBookings$ | async)?.items || [] : [];
  // }


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