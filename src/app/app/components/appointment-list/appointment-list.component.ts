import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingDto } from '../../models/BookingDto.interface';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../auth/auth.service';
@Component({
  selector: 'app-appointment-list',
  imports: [CommonModule],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.css'
})
export class AppointmentListComponent {
  bookings: BookingDto[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  customerId: number | undefined;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService // Inject your AuthService
  ) {
     // Get customerId from AuthService in the constructor
     this.customerId = this.authService.getCustomerId();
  }

  ngOnInit(): void {
    // Only load bookings if customerId is available and valid
    if (this.customerId !== undefined && this.customerId > 0) {
      this.loadCustomerBookings(this.customerId);
    } else {
      this.isLoading = false;
      this.errorMessage = "Thông tin khách hàng không khả dụng. Vui lòng đăng nhập lại.";
      console.error("CustomerId is not set or invalid.");
    }
  }

  loadCustomerBookings(customerId: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.bookingService.getCustomerBookings(customerId).subscribe({
      next: (data) => {
        this.bookings = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching booking history:', err);
        this.errorMessage = 'Không thể tải lịch sử đặt lịch. Vui lòng thử lại.';
        this.isLoading = false;
      }
    });
  }
}
