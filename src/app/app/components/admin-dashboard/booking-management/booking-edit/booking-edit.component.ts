// src/app/admin/booking-update/booking-update.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../../services/admin.service';
// Import các interfaces cần thiết
import { BookingAdminDto } from '../../../../models/BookingAdminDto.interface';
import { BookingStatusDto } from '../../../../models/BookingStatus.interface';
import { BookingUpdateDto } from '../../../../models/BookingUpdateDto.interface';
import { Service } from '../../../../models/services.interface';
import { StaffAdminDetailDto } from '../../../../models/userAdminDto';
import { CustomerAddress } from '../../../../models/customerAddress.interface';
import { BookingService } from '../../../../services/booking.service';

@Component({
  standalone: true,
  selector: 'app-booking-edit',
  templateUrl: './booking-edit.component.html',
  styleUrls: ['./booking-edit.component.css'],
  imports: [CommonModule, FormsModule, DatePipe] // Add FormsModule and DatePipe
})
export class BookingEditComponent implements OnInit {
  bookingId: number | null = null;
  booking: BookingAdminDto | null = null; // Store original booking data

  // Properties for form binding (use a separate object or bind directly to a payload object)
  // Using a payload object makes it easier to prepare for submission
  bookingUpdatePayload: BookingUpdateDto = {
    serviceId: 0,
    staffId: null,
    scheduledStartTime: '',
    scheduledEndTime: '',
    priceAtBooking: 0,
    addressId: 0,
    statusId: 0,
    notes: null
  };


  bookingStatuses: BookingStatusDto[] = []; // For status dropdown
  availableServices: Service[] = []; // For service dropdown
  availableStaff: StaffAdminDetailDto[] = []; // For staff dropdown
  customerAddresses: CustomerAddress[] = []; // For address dropdown

  isLoading = true;
  isSaving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    public router: Router,
    private bookingService: BookingService
  ) { }

  ngOnInit(): void {
    // Get booking ID from route parameters
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.bookingId = +id; // Convert string ID to number
        this.loadBookingData(this.bookingId); // Load all necessary data
      } else {
        this.errorMessage = "Không tìm thấy ID lịch đặt.";
        this.isLoading = false;
      }
    });
  }

  loadBookingData(bookingId: number): void {
      this.isLoading = true;
      this.errorMessage = null;

      // Load booking details
      this.adminService.getBookingById(bookingId).subscribe({
          next: (bookingData) => {
              this.booking = bookingData;
              // Populate the update payload object with current booking data
              this.bookingUpdatePayload = {
                  serviceId: this.booking.serviceId,
                  staffId: this.booking.staffId,
                  // Format dates for input type="datetime-local"
                  scheduledStartTime: this.formatDateForInput(this.booking.scheduledStartTime),
                  scheduledEndTime: this.formatDateForInput(this.booking.scheduledEndTime),
                  priceAtBooking: this.booking.priceAtBooking,
                  addressId: this.booking.addressId,
                  statusId: this.booking.statusId,
                  notes: this.booking.notes
              };

              // Now load dropdown data based on the booking's customerId
              if (this.booking.customerId > 0) {
                   this.loadDropdownData(this.booking.customerId);
              } else {
                   console.error("CustomerId not found for booking.");
                   this.errorMessage = "Thông tin khách hàng của lịch đặt không khả dụng.";
                   this.isLoading = false;
              }
              console.log(this.booking);
          },
          error: (err) => {
              console.error('Error fetching booking:', err);
              this.errorMessage = 'Không thể tải thông tin lịch đặt.';
              this.isLoading = false;
          }
      });
  }

  loadDropdownData(customerId: number): void {
       // Load Booking Statuses
      this.adminService.getAllBookingStatuses().subscribe({
          next: (data) => this.bookingStatuses = data,
          error: (err) => console.error('Error fetching booking statuses:', err)
      });

      // Load all Services
      this.bookingService.getAllServices().subscribe({
          next: (data) => this.availableServices = data,
          error: (err) => console.error('Error fetching services:', err)
      });

      // Load all Staff
      this.adminService.getAllStaff().subscribe({
          next: (data) => this.availableStaff = data,
          error: (err) => console.error('Error fetching staff:', err)
      });

      // Load Customer Addresses for the booking's customer
      this.bookingService.getCustomerAddresses(customerId).subscribe({
          next: (data) => {
              this.customerAddresses = data;
              this.isLoading = false; // Set isLoading to false after all data is loaded
          },
          error: (err) => {
              console.error('Error fetching customer addresses:', err);
              this.errorMessage = 'Không thể tải địa chỉ của khách hàng.';
              this.isLoading = false;
          }
      });
  }


  onSubmitBookingUpdate(): void {
    if (this.bookingId === null) {
        this.errorMessage = "ID lịch đặt không hợp lệ.";
        return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    // Basic validation before sending payload
    if (!this.bookingUpdatePayload.serviceId || !this.bookingUpdatePayload.addressId || !this.bookingUpdatePayload.statusId || !this.bookingUpdatePayload.scheduledStartTime || !this.bookingUpdatePayload.scheduledEndTime || this.bookingUpdatePayload.priceAtBooking < 0) {
         this.errorMessage = "Vui lòng điền đầy đủ các trường bắt buộc.";
         this.isSaving = false;
         return;
    }

    // Ensure StaffId is null if "Chưa phân công" is selected (assuming value 0 or null)
    // If your "Chưa phân công" option has value "0" or "", you need to handle it.
    // Let's assume value is 0 for "Chưa phân công" option in HTML
    if (this.bookingUpdatePayload.staffId === 0) {
        this.bookingUpdatePayload.staffId = null;
    }


    this.adminService.updateBooking(this.bookingId, this.bookingUpdatePayload).subscribe({
      next: (updatedBooking) => {
        this.successMessage = 'Cập nhật lịch đặt thành công!';
        this.booking = updatedBooking; // Update displayed booking data
        // Update the payload object as well in case user wants to save again
        this.bookingUpdatePayload = {
             serviceId: updatedBooking.serviceId,
             staffId: updatedBooking.staffId,
             scheduledStartTime: this.formatDateForInput(updatedBooking.scheduledStartTime),
             scheduledEndTime: this.formatDateForInput(updatedBooking.scheduledEndTime),
             priceAtBooking: updatedBooking.priceAtBooking,
             addressId: updatedBooking.addressId,
             statusId: updatedBooking.statusId,
             notes: updatedBooking.notes
        };
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error updating booking:', err);
        this.errorMessage = err.message || 'Không thể cập nhật lịch đặt.';
        this.isSaving = false;
      }
    });
  }

  // Helper function to format DateTime strings for input type="datetime-local"
  // API returns ISO string, input[type="datetime-local"] expects "YYYY-MM-DDTHH:mm"
  formatDateForInput(dateString: string | Date): string {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      const hours = ('0' + date.getHours()).slice(-2);
      const minutes = ('0' + date.getMinutes()).slice(-2);
      return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
