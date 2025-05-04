import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import DatePipe
import { AdminService } from '../../../services/admin.service';
import { BookingAdminDto } from '../../../models/BookingAdminDto.interface';
import { RouterModule } from '@angular/router'; // Import RouterModule for routerLink
@Component({
  selector: 'app-booking-management',
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './booking-management.component.html',
  styleUrl: './booking-management.component.css'
})
export class BookingManagementComponent {
  bookings: BookingAdminDto[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.adminService.getAllBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        this.errorMessage = 'Không thể tải danh sách lịch đặt. Vui lòng thử lại.';
        this.isLoading = false;
      }
    });
  }
}
