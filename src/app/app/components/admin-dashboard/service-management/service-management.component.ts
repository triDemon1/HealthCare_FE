import { Component } from '@angular/core';
import { Service } from '../../../models/services.interface';
import { BookingService } from '../../../services/booking.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-service-management',
  imports: [CommonModule],
  templateUrl: './service-management.component.html',
  styleUrl: './service-management.component.css'
})
export class ServiceManagementComponent {
  services: Service[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private bookingService: BookingService, public router: Router) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.bookingService.getAllServices().subscribe({
      next: (data) => {
        this.services = data;
        this.isLoading = false;
        console.log("Phản hồi data: ", data);
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.errorMessage = 'Không thể tải danh sách người dùng. Vui lòng thử lại.';
        this.isLoading = false;
      }
    });
  }
  // Hàm xác nhận xóa người dùng
  // confirmDeleteUser(userId: number): void {
  //   if (confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) { // Hiển thị hộp thoại xác nhận
  //     this.deleteUser(userId); // Nếu xác nhận, gọi hàm xóa
  //   }
  // }

  // Hàm gọi service để xóa người dùng
  // deleteUser(userId: number): void {
  //   this.bookingService.de(userId).subscribe( // Gọi hàm deleteUser từ AdminService
  //     () => {
  //       console.log('User deleted successfully');
  //       this.loadUsers(); // Cập nhật lại danh sách người dùng sau khi xóa
  //       // Hiển thị thông báo xóa thành công cho người dùng (tùy chọn)
  //       alert('Xóa người dùng thành công');
  //     },
  //     (error) => {
  //       console.error('Error deleting user:', error); //
  //       // Xử lý lỗi khi xóa người dùng, hiển thị thông báo lỗi cho người dùng
  //       alert(`Lỗi khi xóa người dùng: ${error.message || error}`); // Hiển thị thông báo lỗi
  //     }
  //   );
  // }
}
