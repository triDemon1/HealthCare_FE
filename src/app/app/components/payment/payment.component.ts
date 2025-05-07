import { Component } from '@angular/core';
import { BookingDto } from '../../models/BookingDto.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { PaymentInitiateResponse } from '../../models/PaymentInitiateResponse .Interface';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
@Component({
  selector: 'app-payment',
  imports: [CommonModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent {
  bookingId: number | null = null;
  booking: BookingDto | null = null;
  isLoadingBooking = true;
  processingPayment = false;
  errorMessage: string | null = null;
  // --- NEW: Biến trạng thái thanh toán để dễ kiểm soát hiển thị ---
  isPaymentCompleted: boolean = false;
  isPaymentFailed: boolean = false;
  isPaymentCancelledByUser: boolean = false; // Nếu bạn muốn phân biệt lỗi và hủy
  isBookingCancelled: boolean = false; // Trạng thái Booking bị hủy

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private router: Router,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('bookingId');
      if (id) {
        this.bookingId = +id;
        this.loadBookingDetails(this.bookingId);
      } else {
        this.errorMessage = "Không tìm thấy mã Booking.";
        this.isLoadingBooking = false;
        this.bookingId = null;
         this.updateStatusFlags(null); // Cập nhật cờ khi có lỗi
      }
    });
  }

  loadBookingDetails(bookingId: number): void {
    this.isLoadingBooking = true;
    this.errorMessage = null;
    this.bookingService.getBookingById(bookingId).subscribe({
      next: (data: BookingDto) => {
        this.booking = data;
        this.isLoadingBooking = false;
        this.updateStatusFlags(data); // <-- Gọi hàm cập nhật cờ

        // Thông báo lỗi chung nếu Booking bị hủy (trước khi kiểm tra trạng thái thanh toán)
         if (this.isBookingCancelled) {
              this.errorMessage = 'Booking này đã bị hủy.';
         }
      },
      error: (err) => {
        this.errorMessage = err.message || "Không thể tải thông tin Booking.";
        this.isLoadingBooking = false;
        this.updateStatusFlags(null); // Cập nhật cờ khi có lỗi tải booking
        console.error('Error loading booking details:', err);
      }
    });
  }

  // --- NEW: Hàm cập nhật các cờ trạng thái ---
  updateStatusFlags(booking: BookingDto | null): void {
    this.isPaymentCompleted = false;
    this.isPaymentFailed = false;
    this.isPaymentCancelledByUser = false;
    this.isBookingCancelled = false;

    if (booking) {
      if (booking.paymentStatusName === 'Completed') {
        this.isPaymentCompleted = true;
      } else if (booking.paymentStatusName === 'Failed') {
        this.isPaymentFailed = true;
      } else if (booking.paymentStatusName === 'Cancelled') { // Giả định bạn có PaymentStatus 'Cancelled'
         this.isPaymentCancelledByUser = true;
      }

       if (booking.statusName === 'Cancelled') { // Kiểm tra trạng thái Booking
           this.isBookingCancelled = true;
       }

       // Nếu Booking bị hủy, coi như thanh toán cũng không còn hiệu lực
       if (this.isBookingCancelled) {
           this.isPaymentCompleted = false;
           this.isPaymentFailed = false;
           this.isPaymentCancelledByUser = false;
       }
    }
  }

  proceedToPayment(): void {
    if (!this.bookingId || !this.booking || this.isPaymentCompleted || this.isBookingCancelled) {
       // Không cho phép thanh toán nếu không có ID, không có booking, đã hoàn thành, hoặc booking bị hủy
        this.errorMessage = this.isPaymentCompleted ? 'Booking này đã được thanh toán.' :
                             this.isBookingCancelled ? 'Booking này đã bị hủy.' :
                             'Không thể tiến hành thanh toán.';
      return;
    }


    this.processingPayment = true;
    this.errorMessage = null;

    this.bookingService.createPaymentForBooking(this.bookingId).subscribe({
      next: (response: PaymentInitiateResponse) => {
        if (response.success && response.paymentUrl) {
          console.log("Redirecting to payment URL:", response.paymentUrl);
          window.location.href = response.paymentUrl;
          this.processingPayment = false;
        } else {
          this.errorMessage = response.message || "Không thể khởi tạo thanh toán.";
          this.processingPayment = false;
        }
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.processingPayment = false;
      }
    });
  }

  goBack(): void {
       // Thay '/my-bookings' bằng route xem lịch sử đặt lịch của khách hàng
      this.router.navigate(['/appointments']);
  }
}
