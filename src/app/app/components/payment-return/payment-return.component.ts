import { Component } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-payment-return',
  imports: [CommonModule],
  templateUrl: './payment-return.component.html',
  styleUrl: './payment-return.component.css'
})
export class PaymentReturnComponent {
  paymentStatus: string = 'Đang kiểm tra kết quả...';
  transactionId: number | null = null;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute, // Để đọc query params
    public router: Router,
    private bookingService: BookingService // Tùy chọn: nếu muốn lấy thêm chi tiết booking
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const transactionIdParam = params['transactionId'];
      const momoResultCode = params['momoResultCode'];
      const backendMessage = params['message']; // <-- Đọc tham số 'message'
      const statusFromQuery = params['status']; // <-- Có thể đọc thêm status để xử lý logic
  
      if (transactionIdParam) {
        this.transactionId = +transactionIdParam;
  
        // Nếu có message từ backend (bao gồm cả trường hợp pending từ lỗi khởi tạo)
        if (backendMessage) {
          this.errorMessage = backendMessage; // <-- Gán thông báo vào errorMessage
          // Bạn có thể dùng statusFromQuery để phân biệt các trường hợp (pending_creation, already_paid, vv)
          if (statusFromQuery === 'pending_creation') {
               this.paymentStatus = 'Khởi tạo thanh toán lỗi: Đã có giao dịch chờ xử lý.';
               // Có thể thêm logic hiển thị nút hoặc thông tin khác cho trường hợp pending
          } else if (statusFromQuery === 'already_paid') {
               this.paymentStatus = 'Booking này đã được thanh toán.';
          }
          // ... xử lý các status khác nếu cần
        } else {
          // Logic hiện tại dựa vào URL và momoResultCode nếu không có message từ backend
          // Điều này vẫn cần cho trường hợp redirect từ MoMo thành công/thất bại/hủy sau khi đã đi qua MoMo
          if (this.router.url.includes('/payment/success') || (statusFromQuery === 'pending_ipn')) { // Xử lý cả status pending_ipn
            this.paymentStatus = 'Thanh toán thành công (hoặc đang chờ cập nhật trạng thái cuối cùng)!';
            this.errorMessage = null; // Xóa lỗi nếu chuyển sang trạng thái thành công
          } else if (this.router.url.includes('/payment/failed')) {
            this.paymentStatus = `Thanh toán thất bại. Mã lỗi: ${momoResultCode || 'N/A'}`;
            this.errorMessage = this.errorMessage || 'Vui lòng thử lại hoặc liên hệ hỗ trợ.'; // Giữ lại message từ backend nếu có
          }
          else if (this.router.url.includes('/payment/cancelled')) {
            this.paymentStatus = 'Thanh toán đã bị hủy.';
            this.errorMessage = this.errorMessage || 'Bạn có thể thử thanh toán lại nếu cần.'; // Giữ lại message từ backend nếu có
          }
          else if (statusFromQuery === 'api_error' || statusFromQuery === 'creation_failed' || statusFromQuery === 'transaction_not_found' || statusFromQuery === 'unexpected_status') {
              this.paymentStatus = 'Có lỗi xảy ra trong quá trình thanh toán.';
              this.errorMessage = this.errorMessage || 'Vui lòng kiểm tra lại hoặc liên hệ hỗ trợ.';
          }
          else {
            this.paymentStatus = 'Không xác định được kết quả thanh toán.';
            this.errorMessage = this.errorMessage || 'Vui lòng kiểm tra lại trạng thái giao dịch sau.';
          }
        }
  
        console.log("Payment Status:", this.paymentStatus);
        if (this.errorMessage) {
           console.log("Error Message:", this.errorMessage);
        }
  
      } else {
        // Trường hợp không có transactionId trên query string
        this.paymentStatus = 'Không tìm thấy thông tin giao dịch.';
        // Nếu có message nhưng không có transactionId (ví dụ lỗi cấu hình nghiêm trọng)
        this.errorMessage = backendMessage || 'Vui lòng kiểm tra lại các giao dịch gần đây.';
      }
    });
  }
}
